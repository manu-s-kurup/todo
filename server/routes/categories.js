const express = require('express');
const { pool } = require('../db');
const { ah, HttpError } = require('../utils');

const router = express.Router();
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function validate(body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name) throw new HttpError(400, 'Category name is required');
  if (name.length > 60) throw new HttpError(400, 'Category name must be 60 characters or fewer');
  const color = typeof body.color === 'string' && COLOR_RE.test(body.color) ? body.color.toLowerCase() : '#6366f1';
  return { name, color };
}

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid category id');
  return id;
}

const duplicate = (err) => {
  if (err.code === '23505') throw new HttpError(409, 'A category with that name already exists');
  throw err;
};

router.get('/', ah(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT c.id, c.name, c.color,
           COUNT(t.id)::int AS task_count,
           COUNT(t.id) FILTER (WHERE t.status <> 'done')::int AS open_count
    FROM categories c
    LEFT JOIN tasks t ON t.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name`);
  res.json(rows);
}));

router.post('/', ah(async (req, res) => {
  const { name, color } = validate(req.body);
  const { rows } = await pool
    .query('INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING id, name, color', [name, color])
    .catch(duplicate);
  res.status(201).json(rows[0]);
}));

router.put('/:id', ah(async (req, res) => {
  const { name, color } = validate(req.body);
  const { rows } = await pool
    .query('UPDATE categories SET name = $1, color = $2 WHERE id = $3 RETURNING id, name, color', [name, color, parseId(req.params.id)])
    .catch(duplicate);
  if (!rows.length) throw new HttpError(404, 'Category not found');
  res.json(rows[0]);
}));

router.delete('/:id', ah(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [parseId(req.params.id)]);
  if (!rowCount) throw new HttpError(404, 'Category not found');
  res.status(204).end();
}));

module.exports = router;
