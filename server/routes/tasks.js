const express = require('express');
const { pool } = require('../db');
const { TASK_SELECT, PRIORITY_RANK } = require('../queries');
const {
  ah, HttpError, validateTask, parseISODate, serverToday, STATUSES, PRIORITIES,
} = require('../utils');

const router = express.Router();

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid task id');
  return id;
}

async function getTask(id) {
  const { rows } = await pool.query(`${TASK_SELECT} WHERE t.id = $1`, [id]);
  if (!rows.length) throw new HttpError(404, 'Task not found');
  return rows[0];
}

async function assertCategory(categoryId) {
  if (categoryId == null) return;
  const { rowCount } = await pool.query('SELECT 1 FROM categories WHERE id = $1', [categoryId]);
  if (!rowCount) throw new HttpError(400, 'Category does not exist');
}

/**
 * GET /api/tasks
 * view: today | upcoming | completed | all
 * today: client's local date (YYYY-MM-DD)
 * search, status, priority, category (id | "none"), from, to
 */
router.get('/', ah(async (req, res) => {
  const {
    view = 'all', search, status, priority, category, from, to,
  } = req.query;
  const today = parseISODate(req.query.today) ? req.query.today : serverToday();

  const where = [];
  const params = [];
  const p = (v) => { params.push(v); return `$${params.length}`; };

  if (view === 'today') {
    const d = p(today);
    // Today's tasks + unfinished tasks carried over from earlier days
    where.push(`(t.task_date = ${d} OR (t.status <> 'done' AND t.task_date < ${d}))`);
  } else if (view === 'upcoming') {
    where.push(`t.task_date > ${p(today)}`);
  } else if (view === 'completed') {
    where.push(`t.status = 'done'`);
  }

  if (typeof search === 'string' && search.trim()) {
    const s = p(`%${search.trim().slice(0, 100)}%`);
    where.push(`(t.title ILIKE ${s} OR t.description ILIKE ${s})`);
  }
  if (STATUSES.includes(status)) where.push(`t.status = ${p(status)}`);
  if (PRIORITIES.includes(priority)) where.push(`t.priority = ${p(priority)}`);
  if (category === 'none') where.push('t.category_id IS NULL');
  else if (category && Number.isInteger(Number(category))) where.push(`t.category_id = ${p(Number(category))}`);
  if (parseISODate(from)) where.push(`t.task_date >= ${p(from)}`);
  if (parseISODate(to)) where.push(`t.task_date <= ${p(to)}`);

  let order;
  if (view === 'completed') order = 't.completed_at DESC NULLS LAST, t.id DESC';
  else if (view === 'all') order = `t.task_date DESC, (t.status = 'done'), ${PRIORITY_RANK}, t.id`;
  else order = `t.task_date ASC, (t.status = 'done'), ${PRIORITY_RANK}, t.id`;

  const sql = `${TASK_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${order} LIMIT 1000`;
  const { rows } = await pool.query(sql, params);
  res.json(rows);
}));

router.get('/:id', ah(async (req, res) => {
  res.json(await getTask(parseId(req.params.id)));
}));

router.post('/', ah(async (req, res) => {
  const data = validateTask(req.body);
  await assertCategory(data.category_id);
  const status = data.status || 'todo';
  const { rows } = await pool.query(
    `INSERT INTO tasks (title, description, status, priority, category_id, task_date, due_date,
                        estimated_hours, spent_hours, completed_at)
     VALUES ($1, $2, $3::varchar, $4, $5, COALESCE($6::date, CURRENT_DATE), $7, $8, $9,
             CASE WHEN $3::varchar = 'done' THEN now() ELSE NULL END)
     RETURNING id`,
    [
      data.title, data.description ?? null, status, data.priority || 'medium', data.category_id ?? null,
      data.task_date ?? null, data.due_date ?? null, data.estimated_hours ?? null, data.spent_hours ?? 0,
    ],
  );
  res.status(201).json(await getTask(rows[0].id));
}));

router.patch('/:id', ah(async (req, res) => {
  const id = parseId(req.params.id);
  const data = validateTask(req.body, { partial: true });
  if (!Object.keys(data).length) throw new HttpError(400, 'Nothing to update');
  if ('category_id' in data) await assertCategory(data.category_id);

  const sets = [];
  const params = [];
  for (const [k, v] of Object.entries(data)) {
    params.push(v);
    sets.push(`${k} = $${params.length}`); // keys come from the validator whitelist
  }
  if ('status' in data) {
    // Keep the original completion time if it was already done; clear it when reopened
    params.push(data.status);
    sets.push(`completed_at = CASE WHEN $${params.length}::varchar = 'done' THEN COALESCE(completed_at, now()) ELSE NULL END`);
  }
  sets.push('updated_at = now()');
  params.push(id);

  const { rowCount } = await pool.query(`UPDATE tasks SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
  if (!rowCount) throw new HttpError(404, 'Task not found');
  res.json(await getTask(id));
}));

router.delete('/:id', ah(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [parseId(req.params.id)]);
  if (!rowCount) throw new HttpError(404, 'Task not found');
  res.status(204).end();
}));

module.exports = router;
