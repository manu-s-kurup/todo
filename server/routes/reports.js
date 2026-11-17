const express = require('express');
const { pool } = require('../db');
const { TASK_SELECT, PRIORITY_RANK } = require('../queries');
const {
  ah, parseISODate, serverToday, periodRange, addDays, fmtDate, PRIORITIES,
} = require('../utils');

const router = express.Router();
const TYPES = ['daily', 'weekly', 'monthly'];
const round2 = (n) => Math.round(n * 100) / 100;

async function buildReport(query) {
  const type = TYPES.includes(query.type) ? query.type : 'daily';
  const today = parseISODate(query.today) ? query.today : serverToday();
  const date = parseISODate(query.date) ? query.date : today;
  const range = periodRange(type, date);

  const [taskRes, completedRes] = await Promise.all([
    pool.query(
      `${TASK_SELECT} WHERE t.task_date BETWEEN $1 AND $2
       ORDER BY t.task_date, (t.status = 'done'), ${PRIORITY_RANK}, t.id`,
      [range.start, range.end],
    ),
    // Everything finished during the period, regardless of when it was planned
    pool.query(
      `SELECT COUNT(*)::int AS count FROM tasks
       WHERE status = 'done' AND completed_at::date BETWEEN $1::date AND $2::date`,
      [range.start, range.end],
    ),
  ]);
  const tasks = taskRes.rows;

  const isOverdue = (t) => t.status !== 'done' && t.due_date && t.due_date < today && t.due_date <= range.end;

  const summary = {
    total: tasks.length,
    done: 0,
    in_progress: 0,
    todo: 0,
    overdue: 0,
    estimated_hours: 0,
    spent_hours: 0,
    completed_in_period: completedRes.rows[0].count,
  };

  const byCategory = new Map();
  const byPriority = Object.fromEntries(PRIORITIES.map((p) => [p, { priority: p, total: 0, done: 0 }]));
  const byDay = new Map();
  for (let d = parseISODate(range.start); fmtDate(d) <= range.end; d = addDays(d, 1)) {
    byDay.set(fmtDate(d), { date: fmtDate(d), planned: 0, done: 0, hours: 0 });
  }

  for (const t of tasks) {
    summary[t.status] += 1;
    if (isOverdue(t)) summary.overdue += 1;
    summary.estimated_hours += t.estimated_hours || 0;
    summary.spent_hours += t.spent_hours || 0;

    const key = t.category_id ?? 0;
    if (!byCategory.has(key)) {
      byCategory.set(key, {
        name: t.category_name || 'Uncategorized', color: t.category_color || '#94a3b8', total: 0, done: 0, hours: 0,
      });
    }
    const c = byCategory.get(key);
    c.total += 1;
    c.hours += t.spent_hours || 0;
    if (t.status === 'done') c.done += 1;

    byPriority[t.priority].total += 1;
    if (t.status === 'done') byPriority[t.priority].done += 1;

    const day = byDay.get(t.task_date);
    if (day) {
      day.planned += 1;
      day.hours += t.spent_hours || 0;
      if (t.status === 'done') day.done += 1;
    }
  }

  summary.estimated_hours = round2(summary.estimated_hours);
  summary.spent_hours = round2(summary.spent_hours);
  summary.completion_rate = summary.total ? Math.round((summary.done / summary.total) * 100) : 0;

  return {
    type,
    date,
    today,
    period: range,
    generated_at: new Date().toISOString(),
    summary,
    by_category: [...byCategory.values()]
      .map((c) => ({ ...c, hours: round2(c.hours) }))
      .sort((a, b) => b.total - a.total),
    by_priority: Object.values(byPriority).reverse(), // urgent first
    by_day: [...byDay.values()].map((d) => ({ ...d, hours: round2(d.hours) })),
    tasks: tasks.map((t) => ({ ...t, overdue: Boolean(isOverdue(t)) })),
  };
}

/* ---------- CSV ---------- */

function csvCell(value) {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const csvRow = (cells) => cells.map(csvCell).join(',');
const STATUS_LABEL = { todo: 'To do', in_progress: 'In progress', done: 'Done' };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

router.get('/', ah(async (req, res) => {
  res.json(await buildReport(req.query));
}));

router.get('/export', ah(async (req, res) => {
  const r = await buildReport(req.query);
  const s = r.summary;
  const lines = [
    csvRow([`${cap(r.type)} Work Report`, r.period.label]),
    csvRow(['Period', `${r.period.start} to ${r.period.end}`]),
    csvRow(['Generated', new Date(r.generated_at).toLocaleString('en-GB')]),
    '',
    csvRow(['Planned tasks', s.total]),
    csvRow(['Completed', s.done]),
    csvRow(['In progress', s.in_progress]),
    csvRow(['To do', s.todo]),
    csvRow(['Overdue', s.overdue]),
    csvRow(['Completion rate', `${s.completion_rate}%`]),
    csvRow(['Estimated hours', s.estimated_hours]),
    csvRow(['Hours spent', s.spent_hours]),
    csvRow(['Completed in period (any planned date)', s.completed_in_period]),
    '',
    csvRow(['Category', 'Tasks', 'Completed', 'Hours spent']),
    ...r.by_category.map((c) => csvRow([c.name, c.total, c.done, c.hours])),
    '',
    csvRow(['Planned date', 'Task', 'Category', 'Priority', 'Status', 'Due date', 'Overdue',
      'Estimated hours', 'Hours spent', 'Completed at', 'Description']),
    ...r.tasks.map((t) => csvRow([
      t.task_date, t.title, t.category_name || 'Uncategorized', cap(t.priority), STATUS_LABEL[t.status],
      t.due_date || '', t.overdue ? 'Yes' : '', t.estimated_hours ?? '', t.spent_hours,
      t.completed_at ? new Date(t.completed_at).toLocaleString('en-GB') : '', t.description || '',
    ])),
  ];
  const filename = `${r.type}-report-${r.period.start}${r.type === 'daily' ? '' : `_to_${r.period.end}`}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(`﻿${lines.join('\r\n')}`); // BOM so Excel detects UTF-8
}));

module.exports = router;
