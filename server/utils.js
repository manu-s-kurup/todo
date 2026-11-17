// Shared helpers: errors, async wrapper, date math, validation

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.expose = true;
  }
}

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ---------- Dates (all handled as UTC-midnight to stay timezone-neutral) ---------- */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseISODate(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return null;
  return d;
}

const fmtDate = (d) => d.toISOString().slice(0, 10);

function addDays(d, n) {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

/** Server-local "today" as YYYY-MM-DD (used only when the client does not send one). */
function serverToday() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function isoWeek(d) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
}

const fmtHuman = (d, opts) => d.toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });

/** Returns { start, end, label } for a daily / weekly (Mon-Sun) / monthly period. */
function periodRange(type, dateStr) {
  const d = parseISODate(dateStr);
  if (!d) throw new HttpError(400, 'Invalid date');
  let start;
  let end;
  let label;
  if (type === 'daily') {
    start = d;
    end = d;
    label = fmtHuman(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } else if (type === 'weekly') {
    const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
    start = addDays(d, -dow);
    end = addDays(start, 6);
    label = `Week ${isoWeek(start)} · ${fmtHuman(start, { day: 'numeric', month: 'short' })} – ${fmtHuman(end, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  } else if (type === 'monthly') {
    start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
    label = fmtHuman(start, { month: 'long', year: 'numeric' });
  } else {
    throw new HttpError(400, 'Invalid report type');
  }
  return { start: fmtDate(start), end: fmtDate(end), label };
}

/* ---------- Validation ---------- */

const STATUSES = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function validateTask(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Invalid request body');
  const out = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);

  if (has('title') || !partial) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) throw new HttpError(400, 'Title is required');
    if (title.length > 200) throw new HttpError(400, 'Title must be 200 characters or fewer');
    out.title = title;
  }
  if (has('description')) {
    if (body.description !== null && typeof body.description !== 'string') throw new HttpError(400, 'Invalid description');
    const desc = (body.description || '').trim();
    if (desc.length > 5000) throw new HttpError(400, 'Description must be 5000 characters or fewer');
    out.description = desc || null;
  }
  if (has('status')) {
    if (!STATUSES.includes(body.status)) throw new HttpError(400, 'Invalid status');
    out.status = body.status;
  }
  if (has('priority')) {
    if (!PRIORITIES.includes(body.priority)) throw new HttpError(400, 'Invalid priority');
    out.priority = body.priority;
  }
  if (has('category_id')) {
    if (body.category_id === null || body.category_id === '') out.category_id = null;
    else {
      const id = Number(body.category_id);
      if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid category');
      out.category_id = id;
    }
  }
  if (has('task_date')) {
    if (!parseISODate(body.task_date)) throw new HttpError(400, 'Invalid planned date');
    out.task_date = body.task_date;
  }
  if (has('due_date')) {
    if (body.due_date === null || body.due_date === '') out.due_date = null;
    else if (!parseISODate(body.due_date)) throw new HttpError(400, 'Invalid due date');
    else out.due_date = body.due_date;
  }
  for (const k of ['estimated_hours', 'spent_hours']) {
    if (!has(k)) continue;
    if (body[k] === null || body[k] === '') {
      out[k] = k === 'spent_hours' ? 0 : null;
      continue;
    }
    const n = Number(body[k]);
    if (!Number.isFinite(n) || n < 0 || n > 999) throw new HttpError(400, `${k.replace('_', ' ')} must be between 0 and 999`);
    out[k] = Math.round(n * 100) / 100;
  }
  return out;
}

module.exports = {
  HttpError, ah, parseISODate, fmtDate, addDays, serverToday, periodRange, validateTask, STATUSES, PRIORITIES,
};
