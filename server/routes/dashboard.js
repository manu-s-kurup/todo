const express = require('express');
const { pool } = require('../db');
const { TASK_SELECT, PRIORITY_RANK } = require('../queries');
const {
  ah, parseISODate, serverToday, periodRange, addDays, fmtDate,
} = require('../utils');

const router = express.Router();

router.get('/', ah(async (req, res) => {
  const today = parseISODate(req.query.today) ? req.query.today : serverToday();
  const week = periodRange('weekly', today);

  const [stats, weekRows, focus, deadlines, recent] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE task_date = $1)::int                                   AS planned_today,
        COUNT(*) FILTER (WHERE task_date = $1 AND status = 'done')::int               AS done_today,
        COUNT(*) FILTER (WHERE status = 'in_progress' AND task_date <= $1)::int       AS in_progress,
        COUNT(*) FILTER (WHERE status <> 'done' AND task_date < $1)::int              AS carried_over,
        COUNT(*) FILTER (WHERE status <> 'done' AND due_date < $1)::int               AS overdue,
        COALESCE(SUM(spent_hours) FILTER (WHERE task_date = $1), 0)::float            AS hours_today,
        COUNT(*) FILTER (WHERE status = 'done' AND completed_at::date = $1::date)::int AS completed_today_any
      FROM tasks`, [today]),
    pool.query(`
      SELECT task_date,
             COUNT(*)::int AS planned,
             COUNT(*) FILTER (WHERE status = 'done')::int AS done,
             COALESCE(SUM(spent_hours), 0)::float AS hours
      FROM tasks WHERE task_date BETWEEN $1 AND $2
      GROUP BY task_date`, [week.start, week.end]),
    pool.query(`${TASK_SELECT}
      WHERE t.status <> 'done' AND t.task_date <= $1
      ORDER BY ${PRIORITY_RANK}, t.task_date, t.id LIMIT 6`, [today]),
    pool.query(`${TASK_SELECT}
      WHERE t.status <> 'done' AND t.due_date IS NOT NULL AND t.due_date <= ($1::date + 7)
      ORDER BY t.due_date, ${PRIORITY_RANK} LIMIT 6`, [today]),
    pool.query(`${TASK_SELECT}
      WHERE t.status = 'done' ORDER BY t.completed_at DESC NULLS LAST LIMIT 5`),
  ]);

  const byDate = Object.fromEntries(weekRows.rows.map((r) => [r.task_date, r]));
  const weekSeries = [];
  for (let i = 0; i < 7; i += 1) {
    const d = fmtDate(addDays(parseISODate(week.start), i));
    const r = byDate[d] || { planned: 0, done: 0, hours: 0 };
    weekSeries.push({ date: d, planned: r.planned, done: r.done, hours: r.hours });
  }

  res.json({
    today,
    stats: stats.rows[0],
    week: { ...week, series: weekSeries },
    focus: focus.rows,
    deadlines: deadlines.rows,
    recent: recent.rows,
  });
}));

module.exports = router;
