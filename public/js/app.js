/* WorkLog — single-page frontend (no build step) */
'use strict';

(() => {
  /* ======================================================================
     Utilities
     ====================================================================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const ICONS = {
    grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
    'check-circle': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 10"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    tag: '<svg viewBox="0 0 24 24"><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path d="M4 22V4M4 4h13l-2 4 2 4H4"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    'arrow-down': '<svg viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    'chev-left': '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
    'chev-right': '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
    printer: '<svg viewBox="0 0 24 24"><path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="7"/></svg>',
    alert: '<svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>',
    loader: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-6.2-8.6"/></svg>',
    repeat: '<svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>',
    target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    inbox: '<svg viewBox="0 0 24 24"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.5-6.9A2 2 0 0016.7 4H7.3a2 2 0 00-1.8 1.1z"/></svg>',
  };
  const icon = (name) => `<span class="ico">${ICONS[name] || ''}</span>`;
  const hydrateIcons = (root = document) => $$('[data-icon]', root).forEach((el) => {
    el.innerHTML = ICONS[el.dataset.icon] || '';
    el.removeAttribute('data-icon');
  });

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
  const safeColor = (c) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#94a3b8');

  const STATUS_LABEL = { todo: 'To do', in_progress: 'In progress', done: 'Done' };
  const PRIORITY_LABEL = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' };

  // Dates — handled as local 'YYYY-MM-DD' strings
  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayStr = () => toISO(new Date());
  const parseD = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return toISO(d); };
  const addMonths = (s, n) => {
    const d = parseD(s);
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return toISO(d);
  };
  const fmtDate = (s, opts) => parseD(s).toLocaleDateString('en-GB', opts);
  function relDay(s) {
    const t = todayStr();
    if (s === t) return 'Today';
    if (s === addDays(t, 1)) return 'Tomorrow';
    if (s === addDays(t, -1)) return 'Yesterday';
    const sameYear = s.slice(0, 4) === t.slice(0, 4);
    return fmtDate(s, { weekday: 'short', day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) });
  }
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const fmtH = (h) => `${Math.round((Number(h) || 0) * 100) / 100}h`;

  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ======================================================================
     API
     ====================================================================== */
  async function api(path, { method = 'GET', body } = {}) {
    const res = await fetch(`/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      let msg = `Request failed (${res.status})`;
      try { msg = (await res.json()).error || msg; } catch { /* non-JSON */ }
      throw new Error(msg);
    }
    return res.status === 204 ? null : res.json();
  }

  /* ======================================================================
     Toasts & confirm
     ====================================================================== */
  function toast(message, type = 'success', action) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `${icon(type === 'error' ? 'alert' : 'check-circle')}<span class="msg">${esc(message)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ''}`;
    if (action) {
      $('button', el).addEventListener('click', () => { el.remove(); action.fn(); });
    }
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), action ? 6000 : 3500);
  }
  const fail = (err) => toast(err.message || 'Something went wrong', 'error');

  function confirmDialog({ title, message, ok = 'Delete' }) {
    const dlg = $('#confirm-dialog');
    $('#confirm-title').textContent = title;
    $('#confirm-message').textContent = message;
    $('#confirm-ok').textContent = ok;
    dlg.showModal();
    return new Promise((resolve) => {
      const done = (v) => {
        $('#confirm-ok').onclick = null;
        $('#confirm-cancel').onclick = null;
        dlg.onclose = null;
        if (dlg.open) dlg.close();
        resolve(v);
      };
      $('#confirm-ok').onclick = () => done(true);
      $('#confirm-cancel').onclick = () => done(false);
      dlg.onclose = () => done(false);
    });
  }

  /* ======================================================================
     State
     ====================================================================== */
  const state = {
    route: 'dashboard',
    categories: [],
    tasks: new Map(),
    search: '',
    filters: { status: '', priority: '', category: '' },
    report: { type: 'weekly', date: todayStr() },
    charts: [],
    refresh: () => {},
  };

  const remember = (tasks) => tasks.forEach((t) => state.tasks.set(t.id, t));

  async function loadCategories() {
    state.categories = await api('/categories');
  }

  async function updateTodayCount() {
    try {
      const tasks = await api(`/tasks?view=today&today=${todayStr()}`);
      const open = tasks.filter((t) => t.status !== 'done').length;
      $('#count-today').textContent = open || '';
    } catch { /* non-critical */ }
  }

  /* ======================================================================
     Charts
     ====================================================================== */
  function themeColors() {
    const cs = getComputedStyle(document.documentElement);
    const g = (n) => cs.getPropertyValue(n).trim();
    return {
      text: g('--text-2'), text3: g('--text-3'), grid: g('--border'), surface: g('--surface'),
      accent: g('--accent'), success: g('--success'), info: g('--info'), warning: g('--warning'),
      danger: g('--danger'), muted: g('--border-strong'),
    };
  }
  const alpha = (hex, a) => (/^#[0-9a-f]{6}$/i.test(hex) ? hex + Math.round(a * 255).toString(16).padStart(2, '0') : hex);

  function makeChart(canvas, config) {
    if (!window.Chart || !canvas) return null;
    const c = themeColors();
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.color = c.text;
    Chart.defaults.borderColor = c.grid;
    const chart = new Chart(canvas, config);
    state.charts.push(chart);
    return chart;
  }
  function destroyCharts() {
    state.charts.forEach((c) => c.destroy());
    state.charts = [];
  }

  function barChart(canvas, labels, series) {
    const c = themeColors();
    return makeChart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Planned', data: series.map((d) => d.planned), backgroundColor: alpha(c.accent, 0.25), hoverBackgroundColor: alpha(c.accent, 0.4), borderRadius: 5, maxBarThickness: 28,
          },
          {
            label: 'Completed', data: series.map((d) => d.done), backgroundColor: c.success, borderRadius: 5, maxBarThickness: 28,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', align: 'end', labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: 'rectRounded' } },
          tooltip: {
            callbacks: {
              afterBody: (items) => {
                const d = series[items[0].dataIndex];
                return d.hours ? `Hours spent: ${fmtH(d.hours)}` : '';
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0 }, border: { display: false } },
        },
      },
    });
  }

  function doughnut(canvas, labels, data, colors) {
    const c = themeColors();
    return makeChart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: c.surface, borderWidth: 3, hoverOffset: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } },
    });
  }

  /* ======================================================================
     Shared rendering pieces
     ====================================================================== */
  const skeleton = (n = 4) => Array.from({ length: n }, () => '<div class="skeleton"></div>').join('');

  function emptyState(title, text, ico = 'inbox', sm = false) {
    return `<div class="empty ${sm ? 'sm' : ''}"><div class="art">${icon(ico)}</div><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
  }

  function statusSelect(t) {
    return `<select class="status-select s-${t.status}" data-action="status" aria-label="Status">
      ${Object.entries(STATUS_LABEL).map(([v, l]) => `<option value="${v}" ${t.status === v ? 'selected' : ''}>${l}</option>`).join('')}
    </select>`;
  }

  function categoryBadge(t) {
    if (!t.category_name) return '';
    return `<span class="badge"><span class="swatch" style="background:${safeColor(t.category_color)}"></span>${esc(t.category_name)}</span>`;
  }

  function taskHtml(t, { showDate = false, showCompleted = false } = {}) {
    const today = todayStr();
    const done = t.status === 'done';
    const carried = !done && t.task_date < today;
    const overdue = !done && t.due_date && t.due_date < today;
    const meta = [
      categoryBadge(t),
      `<span class="badge p-${t.priority}">${PRIORITY_LABEL[t.priority]}</span>`,
      statusSelect(t),
    ];
    if (carried) meta.push(`<span class="badge warn">${icon('repeat')}Carried over from ${esc(relDay(t.task_date))}</span>`);
    else if (showDate) meta.push(`<span class="badge">${icon('calendar')}${esc(relDay(t.task_date))}</span>`);
    if (t.due_date && !done) meta.push(`<span class="badge ${overdue ? 'danger' : ''}">${icon('flag')}${overdue ? 'Overdue · was due ' : 'Due '}${esc(relDay(t.due_date))}</span>`);
    if (t.estimated_hours || t.spent_hours) {
      meta.push(`<span class="badge" title="Spent / estimated">${icon('clock')}${fmtH(t.spent_hours)}${t.estimated_hours != null ? ` / ${fmtH(t.estimated_hours)}` : ''}</span>`);
    }
    if (showCompleted && t.completed_at) meta.push(`<span class="badge s-done">${icon('check')}Completed ${fmtTime(t.completed_at)}</span>`);

    return `<div class="task pri-${t.priority} ${done ? 'is-done' : ''} ${t.status === 'in_progress' ? 'is-progress' : ''}" data-id="${t.id}">
      <button class="check" type="button" data-action="toggle" aria-label="${done ? 'Mark as not done' : 'Mark as done'}" title="${done ? 'Mark as not done' : 'Mark as done'}">${ICONS.check}</button>
      <div class="task-body">
        <div class="task-title" data-action="edit" role="button" tabindex="0">${esc(t.title)}</div>
        ${t.description ? `<div class="task-desc">${esc(t.description)}</div>` : ''}
        <div class="task-meta">${meta.join('')}</div>
      </div>
      <div class="task-actions">
        ${carried ? `<button class="icon-btn" type="button" data-action="move-today" title="Move to today" aria-label="Move to today">${icon('arrow-down')}</button>` : ''}
        <button class="icon-btn" type="button" data-action="edit" title="Edit" aria-label="Edit">${icon('edit')}</button>
        <button class="icon-btn danger" type="button" data-action="delete" title="Delete" aria-label="Delete">${icon('trash')}</button>
      </div>
    </div>`;
  }

  function groupHtml(title, tasks, opts = {}, warn = false) {
    if (!tasks.length) return '';
    return `<section class="group">
      <div class="group-head ${warn ? 'warn' : ''}">${esc(title)} <span class="count">${tasks.length}</span></div>
      <div class="task-list">${tasks.map((t) => taskHtml(t, opts)).join('')}</div>
    </section>`;
  }

  function groupBy(tasks, keyFn) {
    const m = new Map();
    tasks.forEach((t) => {
      const k = keyFn(t);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(t);
    });
    return m;
  }

  /* ---------- Quick add with inline syntax:  !high  #Category ---------- */
  function parseQuickAdd(text) {
    let title = text;
    const out = {};
    title = title.replace(/(^|\s)!(urgent|high|medium|low)\b/i, (_, s, p) => { out.priority = p.toLowerCase(); return s; });
    title = title.replace(/(^|\s)#([\w-]+)/, (m, s, name) => {
      const cat = state.categories.find((c) => c.name.replace(/\s+/g, '').toLowerCase() === name.toLowerCase());
      if (!cat) return m;
      out.category_id = cat.id;
      return s;
    });
    out.title = title.replace(/\s+/g, ' ').trim();
    return out;
  }

  function quickAddHtml(placeholder) {
    return `<form class="quick-add no-print" id="quick-add" autocomplete="off">
      ${icon('plus')}
      <input name="q" maxlength="220" placeholder="${esc(placeholder)}" aria-label="Quick add task">
      <span class="hint">Enter ↵ · <b>!high</b> · <b>#Category</b></span>
    </form>`;
  }

  function bindQuickAdd(dateFn) {
    const form = $('#quick-add');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.elements.q;
      const parsed = parseQuickAdd(input.value);
      if (!parsed.title) return;
      input.disabled = true;
      try {
        await api('/tasks', { method: 'POST', body: { ...parsed, task_date: dateFn() } });
        input.value = '';
        toast('Task added');
        await afterChange();
      } catch (err) { fail(err); } finally {
        input.disabled = false;
        input.focus();
      }
    });
  }

  async function afterChange() {
    await Promise.all([state.refresh(), updateTodayCount()]);
  }

  /* ======================================================================
     Task actions (delegated)
     ====================================================================== */
  async function setStatus(id, status, { undo = true } = {}) {
    const prev = state.tasks.get(id);
    try {
      await api(`/tasks/${id}`, { method: 'PATCH', body: { status } });
      await afterChange();
      if (undo && prev && status === 'done') {
        toast('Task completed', 'success', { label: 'Undo', fn: () => setStatus(id, prev.status, { undo: false }) });
      }
    } catch (err) { fail(err); }
  }

  async function deleteTask(id) {
    const t = state.tasks.get(id);
    const ok = await confirmDialog({ title: 'Delete task?', message: `"${t ? t.title : 'This task'}" will be permanently deleted.` });
    if (!ok) return false;
    try {
      await api(`/tasks/${id}`, { method: 'DELETE' });
      toast('Task deleted');
      await afterChange();
      return true;
    } catch (err) { fail(err); return false; }
  }

  function handleTaskAction(el) {
    const row = el.closest('[data-id]');
    if (!row) return;
    const id = Number(row.dataset.id);
    const t = state.tasks.get(id);
    switch (el.dataset.action) {
      case 'toggle': setStatus(id, t && t.status === 'done' ? 'todo' : 'done'); break;
      case 'edit': openTaskDialog(t); break;
      case 'delete': deleteTask(id); break;
      case 'move-today':
        api(`/tasks/${id}`, { method: 'PATCH', body: { task_date: todayStr() } })
          .then(() => { toast('Moved to today'); return afterChange(); })
          .catch(fail);
        break;
      default:
    }
  }

  const view = $('#view');
  view.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el && el.dataset.action !== 'status') handleTaskAction(el);
  });
  view.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('[data-action][role="button"], li[data-id]')) {
      e.preventDefault();
      e.target.click();
    }
  });
  view.addEventListener('change', (e) => {
    if (e.target.matches('.status-select')) {
      const id = Number(e.target.closest('[data-id]').dataset.id);
      setStatus(id, e.target.value);
    }
  });

  /* ======================================================================
     Task dialog
     ====================================================================== */
  const dlg = $('#task-dialog');
  const form = $('#task-form');
  let editingId = null;

  function fillCategorySelect(selected) {
    $('#f-category').innerHTML = `<option value="">No category</option>${
      state.categories.map((c) => `<option value="${c.id}" ${String(selected) === String(c.id) ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}`;
  }

  function openTaskDialog(task = null, defaults = {}) {
    editingId = task ? task.id : null;
    const t = task || {
      title: '', description: '', priority: 'medium', status: 'todo', category_id: '', task_date: todayStr(), due_date: '', estimated_hours: '', spent_hours: '', ...defaults,
    };
    $('#task-dialog-title').textContent = task ? 'Edit task' : 'New task';
    $('#task-save-btn').textContent = task ? 'Save changes' : 'Create task';
    $('#task-delete-btn').hidden = !task;
    $('#task-form-error').textContent = '';
    fillCategorySelect(t.category_id ?? '');
    form.elements.title.value = t.title || '';
    form.elements.description.value = t.description || '';
    form.elements.priority.value = t.priority;
    form.elements.status.value = t.status;
    form.elements.task_date.value = t.task_date || todayStr();
    form.elements.due_date.value = t.due_date || '';
    form.elements.estimated_hours.value = t.estimated_hours ?? '';
    form.elements.spent_hours.value = t.spent_hours ? t.spent_hours : '';
    $$('.invalid', form).forEach((el) => el.classList.remove('invalid'));
    dlg.showModal();
    setTimeout(() => form.elements.title.focus(), 30);
  }

  $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // backdrop click

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form.elements;
    const errEl = $('#task-form-error');
    $$('.invalid', form).forEach((el) => el.classList.remove('invalid'));
    errEl.textContent = '';

    const title = f.title.value.trim();
    if (!title) { f.title.classList.add('invalid'); errEl.textContent = 'Please enter a title.'; f.title.focus(); return; }
    if (!f.task_date.value) { f.task_date.classList.add('invalid'); errEl.textContent = 'Please choose the planned date.'; return; }
    for (const name of ['estimated_hours', 'spent_hours']) {
      const v = f[name].value;
      if (v !== '' && (Number.isNaN(Number(v)) || Number(v) < 0 || Number(v) > 999)) {
        f[name].classList.add('invalid'); errEl.textContent = 'Hours must be between 0 and 999.'; return;
      }
    }

    const body = {
      title,
      description: f.description.value,
      category_id: f.category_id.value || null,
      priority: f.priority.value,
      status: f.status.value,
      task_date: f.task_date.value,
      due_date: f.due_date.value || null,
      estimated_hours: f.estimated_hours.value === '' ? null : Number(f.estimated_hours.value),
      spent_hours: f.spent_hours.value === '' ? 0 : Number(f.spent_hours.value),
    };
    const btn = $('#task-save-btn');
    btn.disabled = true;
    try {
      if (editingId) await api(`/tasks/${editingId}`, { method: 'PATCH', body });
      else await api('/tasks', { method: 'POST', body });
      dlg.close();
      toast(editingId ? 'Task updated' : 'Task created');
      await afterChange();
    } catch (err) {
      errEl.textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });

  $('#task-delete-btn').addEventListener('click', async () => {
    if (!editingId) return;
    dlg.close();
    const deleted = await deleteTask(editingId);
    if (!deleted) openTaskDialog(state.tasks.get(editingId));
  });

  /* ======================================================================
     Views: task lists
     ====================================================================== */
  const TASK_VIEWS = {
    today: {
      title: 'Today',
      subtitle: () => fmtDate(todayStr(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      quickAdd: 'Add a task for today…',
      newDate: () => todayStr(),
    },
    upcoming: {
      title: 'Upcoming', subtitle: () => 'Work planned for the coming days', quickAdd: 'Add a task for tomorrow…', newDate: () => addDays(todayStr(), 1),
    },
    all: {
      title: 'All tasks', subtitle: () => 'Every task, newest planned date first', quickAdd: 'Add a task for today…', newDate: () => todayStr(),
    },
    completed: {
      title: 'Completed', subtitle: () => 'Your finished work', newDate: () => todayStr(),
    },
  };

  function filtersHtml() {
    const f = state.filters;
    const opt = (v, l, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(l)}</option>`;
    const active = f.status || f.priority || f.category || state.search;
    return `<div class="toolbar no-print">
      ${state.route !== 'completed' ? `<select class="select" data-filter="status" aria-label="Filter by status">
        ${opt('', 'All statuses', f.status)}${Object.entries(STATUS_LABEL).map(([v, l]) => opt(v, l, f.status)).join('')}
      </select>` : ''}
      <select class="select" data-filter="priority" aria-label="Filter by priority">
        ${opt('', 'All priorities', f.priority)}${Object.entries(PRIORITY_LABEL).map(([v, l]) => opt(v, l, f.priority)).join('')}
      </select>
      <select class="select" data-filter="category" aria-label="Filter by category">
        ${opt('', 'All categories', f.category)}${opt('none', 'Uncategorized', f.category)}
        ${state.categories.map((c) => opt(c.id, c.name, f.category)).join('')}
      </select>
      ${active ? `<button class="btn btn-ghost btn-sm" type="button" id="clear-filters">${icon('x')}Clear filters</button>` : ''}
      <span class="spacer"></span>
      <span class="subtle" id="result-count"></span>
    </div>`;
  }

  async function renderTaskView(name) {
    const cfg = TASK_VIEWS[name];
    view.innerHTML = `${cfg.quickAdd ? quickAddHtml(cfg.quickAdd) : ''}<div id="filters">${filtersHtml()}</div><div id="task-area">${skeleton()}</div>`;
    bindQuickAdd(cfg.newDate);
    bindFilters(name);
    state.refresh = () => loadTaskArea(name);
    await loadTaskArea(name);
  }

  function bindFilters(name) {
    const wrap = $('#filters');
    wrap.addEventListener('change', (e) => {
      const key = e.target.dataset.filter;
      if (!key) return;
      state.filters[key] = e.target.value;
      wrap.innerHTML = filtersHtml();
      loadTaskArea(name);
    });
    wrap.addEventListener('click', (e) => {
      if (!e.target.closest('#clear-filters')) return;
      state.filters = { status: '', priority: '', category: '' };
      state.search = '';
      $('#search').value = '';
      wrap.innerHTML = filtersHtml();
      loadTaskArea(name);
    });
  }

  async function loadTaskArea(name) {
    const area = $('#task-area');
    if (!area) return;
    const params = new URLSearchParams({ view: name, today: todayStr() });
    if (state.search) params.set('search', state.search);
    Object.entries(state.filters).forEach(([k, v]) => { if (v && !(name === 'completed' && k === 'status')) params.set(k, v); });

    let tasks;
    try {
      tasks = await api(`/tasks?${params}`);
    } catch (err) {
      area.innerHTML = emptyState('Could not load tasks', err.message, 'alert');
      return;
    }
    if (state.route !== name) return; // user navigated away meanwhile
    remember(tasks);
    const countEl = $('#result-count');
    if (countEl) countEl.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'}`;

    if (!tasks.length) {
      const filtered = state.search || Object.values(state.filters).some(Boolean);
      const msgs = {
        today: ['Nothing planned for today', 'Use the box above or press N to add your first task.'],
        upcoming: ['No upcoming work', 'Plan ahead by adding tasks for future dates.'],
        all: ['No tasks yet', 'Add a task to get started.'],
        completed: ['No completed tasks yet', 'Finished tasks will show up here.'],
      };
      const [title, text] = filtered ? ['No matching tasks', 'Try a different search or clear the filters.'] : msgs[name];
      area.innerHTML = `<div class="card">${emptyState(title, text, filtered ? 'search' : 'inbox')}</div>`;
      return;
    }

    const today = todayStr();
    let html = '';
    if (name === 'today') {
      const carried = tasks.filter((t) => t.status !== 'done' && t.task_date < today);
      const todays = tasks.filter((t) => t.task_date === today);
      html += groupHtml('Carried over', carried, {}, true);
      html += groupHtml('In progress', todays.filter((t) => t.status === 'in_progress'));
      html += groupHtml('To do', todays.filter((t) => t.status === 'todo'));
      html += groupHtml('Done', todays.filter((t) => t.status === 'done'), { showCompleted: true });
    } else if (name === 'completed') {
      groupBy(tasks, (t) => (t.completed_at ? toISO(new Date(t.completed_at)) : t.task_date)).forEach((list, day) => {
        html += groupHtml(`Completed ${relDay(day)}`, list, { showCompleted: true });
      });
    } else {
      groupBy(tasks, (t) => t.task_date).forEach((list, day) => {
        html += groupHtml(relDay(day), list, { showDate: false });
      });
    }
    area.innerHTML = html;
  }

  /* ======================================================================
     View: dashboard
     ====================================================================== */
  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function kpi(label, value, sub, ico, tone, extra = '') {
    return `<div class="card kpi">
      <div class="kpi-label"><span class="dot tone-${tone}">${icon(ico)}</span>${esc(label)}</div>
      <div class="kpi-value">${value}</div>
      ${sub ? `<div class="kpi-sub">${sub}</div>` : ''}
      ${extra}
    </div>`;
  }

  function miniList(tasks, emptyText, kind) {
    if (!tasks.length) return emptyState('All clear', emptyText, 'check-circle', true);
    const today = todayStr();
    const pc = { urgent: 'var(--danger)', high: 'var(--warning)', medium: 'var(--info)', low: 'var(--border-strong)' };
    return `<ul class="mini-list">${tasks.map((t) => {
      let right = '';
      if (kind === 'deadline') {
        const od = t.due_date < today;
        right = `<span class="badge ${od ? 'danger' : t.due_date === today ? 'warn' : ''}">${od ? 'Overdue · ' : ''}${esc(relDay(t.due_date))}</span>`;
      } else if (kind === 'recent') {
        right = `<span class="subtle">${t.completed_at ? esc(relDay(toISO(new Date(t.completed_at)))) : ''}</span>`;
      } else {
        right = `<span class="badge p-${t.priority}">${PRIORITY_LABEL[t.priority]}</span>`;
      }
      return `<li data-id="${t.id}" data-action="edit" tabindex="0">
        <span class="dotp" style="background:${pc[t.priority]}"></span>
        <span class="t">${esc(t.title)}</span>${right}
      </li>`;
    }).join('')}</ul>`;
  }

  async function renderDashboard() {
    $('#page-subtitle').textContent = `${greeting()} — here's your work at a glance`;
    view.innerHTML = `${quickAddHtml('Add a task for today…')}<div class="kpis">${skeleton(5)}</div>`;
    bindQuickAdd(() => todayStr());
    state.refresh = () => loadDashboard();
    await loadDashboard();
  }

  async function loadDashboard() {
    let d;
    try {
      d = await api(`/dashboard?today=${todayStr()}`);
    } catch (err) {
      view.innerHTML = `<div class="card">${emptyState('Could not load dashboard', err.message, 'alert')}</div>`;
      return;
    }
    if (state.route !== 'dashboard') return;
    [...d.focus, ...d.deadlines, ...d.recent].forEach((t) => state.tasks.set(t.id, t));
    const s = d.stats;
    const pct = s.planned_today ? Math.round((s.done_today / s.planned_today) * 100) : 0;
    const weekDone = d.week.series.reduce((a, x) => a + x.done, 0);
    const weekPlanned = d.week.series.reduce((a, x) => a + x.planned, 0);
    const weekHours = d.week.series.reduce((a, x) => a + x.hours, 0);

    destroyCharts();
    const qa = $('#quick-add');
    const qaVal = qa ? qa.elements.q.value : '';
    view.innerHTML = `${quickAddHtml('Add a task for today…')}
      <div class="kpis">
        ${kpi("Today's progress", `${s.done_today}<span class="subtle" style="font-size:18px"> / ${s.planned_today}</span>`, `${pct}% complete`, 'target', 'accent',
    `<div class="progress success"><span style="width:${pct}%"></span></div>`)}
        ${kpi('In progress', s.in_progress, 'Being worked on now', 'loader', 'info')}
        ${kpi('Carried over', s.carried_over, 'Unfinished from earlier days', 'repeat', 'warning')}
        ${kpi('Overdue', s.overdue, 'Past their deadline', 'alert', 'danger')}
        ${kpi('Hours today', fmtH(s.hours_today), `${fmtH(weekHours)} this week`, 'clock', 'success')}
      </div>
      <div class="grid grid-main">
        <div class="stack">
          <div class="card">
            <div class="card-head"><h3>This week</h3><span class="hint">${esc(d.week.label)}</span><span class="spacer"></span>
              <span class="badge s-done">${weekDone} of ${weekPlanned} done</span></div>
            <div class="card-body"><div class="chart-box"><canvas id="week-chart" aria-label="Tasks planned and completed this week"></canvas></div></div>
          </div>
          <div class="card">
            <div class="card-head"><h3>Recently completed</h3><span class="spacer"></span><a href="#/completed" class="btn btn-ghost btn-sm">View all</a></div>
            <div class="card-body flush">${miniList(d.recent, 'Completed tasks will appear here.', 'recent')}</div>
          </div>
        </div>
        <div class="stack">
          <div class="card">
            <div class="card-head"><h3>Focus now</h3><span class="hint">Top open tasks by priority</span><span class="spacer"></span><a href="#/today" class="btn btn-ghost btn-sm">Open today</a></div>
            <div class="card-body flush">${miniList(d.focus, 'No open tasks for today. Nice work!', 'focus')}</div>
          </div>
          <div class="card">
            <div class="card-head"><h3>Deadlines</h3><span class="hint">Overdue & next 7 days</span></div>
            <div class="card-body flush">${miniList(d.deadlines, 'No deadlines coming up.', 'deadline')}</div>
          </div>
        </div>
      </div>`;
    bindQuickAdd(() => todayStr());
    if (qaVal) $('#quick-add').elements.q.value = qaVal;
    barChart($('#week-chart'), d.week.series.map((x) => fmtDate(x.date, { weekday: 'short', day: 'numeric' })), d.week.series);
  }

  /* ======================================================================
     View: reports
     ====================================================================== */
  const REPORT_TYPES = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

  function shiftReport(dir) {
    const r = state.report;
    if (r.type === 'daily') r.date = addDays(r.date, dir);
    else if (r.type === 'weekly') r.date = addDays(r.date, 7 * dir);
    else r.date = addMonths(r.date, dir);
    loadReport();
  }

  async function renderReports() {
    view.innerHTML = `
      <div class="report-controls no-print">
        <div class="seg" role="tablist" aria-label="Report period">
          ${Object.entries(REPORT_TYPES).map(([k, l]) => `<button type="button" role="tab" data-type="${k}" class="${state.report.type === k ? 'active' : ''}" aria-selected="${state.report.type === k}">${l}</button>`).join('')}
        </div>
        <div class="period-nav">
          <button class="icon-btn" type="button" id="rep-prev" aria-label="Previous period">${icon('chev-left')}</button>
          <span class="period-label" id="period-label">…</span>
          <button class="icon-btn" type="button" id="rep-next" aria-label="Next period">${icon('chev-right')}</button>
        </div>
        <input class="input" type="date" id="rep-date" value="${state.report.date}" aria-label="Report date">
        <button class="btn btn-ghost btn-sm" type="button" id="rep-now"></button>
        <span class="spacer"></span>
        <button class="btn btn-secondary" type="button" id="rep-csv">${icon('download')}Export CSV</button>
        <button class="btn btn-primary" type="button" id="rep-print">${icon('printer')}Print / PDF</button>
      </div>
      <div id="report-area">${skeleton(3)}</div>`;

    $('.seg').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-type]');
      if (!b) return;
      state.report.type = b.dataset.type;
      $$('.seg button').forEach((x) => { x.classList.toggle('active', x === b); x.setAttribute('aria-selected', x === b); });
      loadReport();
    });
    $('#rep-prev').addEventListener('click', () => shiftReport(-1));
    $('#rep-next').addEventListener('click', () => shiftReport(1));
    $('#rep-date').addEventListener('change', (e) => { if (e.target.value) { state.report.date = e.target.value; loadReport(); } });
    $('#rep-now').addEventListener('click', () => { state.report.date = todayStr(); loadReport(); });
    $('#rep-csv').addEventListener('click', () => {
      const p = new URLSearchParams({ type: state.report.type, date: state.report.date, today: todayStr() });
      const a = document.createElement('a');
      a.href = `/api/reports/export?${p}`;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
    $('#rep-print').addEventListener('click', () => window.print());
    state.refresh = () => loadReport();
    await loadReport();
  }

  async function loadReport() {
    const { type, date } = state.report;
    $('#rep-date').value = date;
    $('#rep-now').textContent = { daily: 'Today', weekly: 'This week', monthly: 'This month' }[type];
    const area = $('#report-area');
    let r;
    try {
      r = await api(`/reports?${new URLSearchParams({ type, date, today: todayStr() })}`);
    } catch (err) {
      area.innerHTML = `<div class="card">${emptyState('Could not load report', err.message, 'alert')}</div>`;
      return;
    }
    if (state.route !== 'reports' || state.report.type !== type || state.report.date !== date) return;
    remember(r.tasks);
    $('#period-label').textContent = r.period.label;
    $('#page-subtitle').textContent = `${REPORT_TYPES[type]} report · ${r.period.label}`;
    destroyCharts();

    const s = r.summary;
    const avg = s.done ? Math.round((s.spent_hours / s.done) * 10) / 10 : 0;
    const busiest = r.by_day.reduce((a, d) => (d.done > (a ? a.done : 0) ? d : a), null);
    // Estimate accuracy: only completed tasks that had an estimate
    const estDone = r.tasks.filter((t) => t.status === 'done' && t.estimated_hours > 0);
    const estSum = estDone.reduce((a, t) => a + t.estimated_hours, 0);
    const spentSum = estDone.reduce((a, t) => a + (t.spent_hours || 0), 0);
    const variance = estSum ? Math.round(((spentSum - estSum) / estSum) * 100) : null;

    const catRows = r.by_category.length ? r.by_category.map((c) => {
      const p = c.total ? Math.round((c.done / c.total) * 100) : 0;
      return `<div class="breakdown-row">
        <span class="name"><span class="cat-swatch" style="background:${safeColor(c.color)}"></span>${esc(c.name)}</span>
        <div class="progress"><span style="width:${p}%;background:${safeColor(c.color)}"></span></div>
        <span class="val">${c.done}/${c.total} · ${fmtH(c.hours)}</span>
      </div>`;
    }).join('') : '<p class="subtle">No data</p>';

    const priRows = r.by_priority.map((p) => {
      const pc = p.total ? Math.round((p.done / p.total) * 100) : 0;
      return `<div class="breakdown-row">
        <span class="name"><span class="badge p-${p.priority}">${PRIORITY_LABEL[p.priority]}</span></span>
        <div class="progress success"><span style="width:${pc}%"></span></div>
        <span class="val">${p.done}/${p.total}</span>
      </div>`;
    }).join('');

    const showDayCol = type !== 'daily';
    const rows = r.tasks.map((t) => `<tr data-id="${t.id}">
      ${showDayCol ? `<td class="num" style="white-space:nowrap">${esc(fmtDate(t.task_date, { day: '2-digit', month: 'short' }))}</td>` : ''}
      <td><div class="tt">${esc(t.title)}</div>${t.description ? `<div class="td-desc">${esc(t.description.length > 140 ? `${t.description.slice(0, 140)}…` : t.description)}</div>` : ''}</td>
      <td>${t.category_name ? categoryBadge(t) : '<span class="subtle">—</span>'}</td>
      <td><span class="badge p-${t.priority}">${PRIORITY_LABEL[t.priority]}</span></td>
      <td><span class="badge s-${t.status}">${STATUS_LABEL[t.status]}</span>${t.overdue ? ' <span class="badge danger">Overdue</span>' : ''}</td>
      <td class="num" style="white-space:nowrap">${t.due_date ? esc(fmtDate(t.due_date, { day: '2-digit', month: 'short' })) : '<span class="subtle">—</span>'}</td>
      <td class="r num">${t.estimated_hours != null ? fmtH(t.estimated_hours) : '—'}</td>
      <td class="r num">${fmtH(t.spent_hours)}</td>
    </tr>`).join('');

    area.innerHTML = `
      <div class="report-head">
        <h1>${REPORT_TYPES[type]} Work Report</h1>
        <p>${esc(r.period.label)} · Generated ${esc(new Date(r.generated_at).toLocaleString('en-GB'))}</p>
      </div>
      <div class="kpis">
        ${kpi('Planned tasks', s.total, `${s.todo} to do · ${s.in_progress} in progress`, 'list', 'accent')}
        ${kpi('Completed', s.done, `${s.completion_rate}% completion rate`, 'check-circle', 'success', `<div class="progress success"><span style="width:${s.completion_rate}%"></span></div>`)}
        ${kpi('Overdue', s.overdue, 'Open past deadline', 'alert', 'danger')}
        ${kpi('Hours spent', fmtH(s.spent_hours), `Estimated ${fmtH(s.estimated_hours)}`, 'clock', 'info')}
      </div>
      <div class="grid grid-halves" style="margin-bottom:20px">
        <div class="card">
          <div class="card-head"><h3>${type === 'daily' ? 'Status breakdown' : 'Daily activity'}</h3><span class="hint">${type === 'daily' ? 'Tasks planned for the day' : 'Planned vs completed per day'}</span></div>
          <div class="card-body"><div class="chart-box"><canvas id="rep-chart-1"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card-head"><h3>By category</h3><span class="hint">Completed / total · hours</span></div>
          <div class="card-body">
            <div class="grid" style="grid-template-columns:150px 1fr;align-items:center">
              <div class="chart-box sm" style="height:150px"><canvas id="rep-chart-2"></canvas></div>
              <div class="breakdown">${catRows}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-halves" style="margin-bottom:20px">
        <div class="card">
          <div class="card-head"><h3>By priority</h3><span class="hint">Completed / total</span></div>
          <div class="card-body"><div class="breakdown">${priRows}</div></div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Highlights</h3></div>
          <div class="card-body">
            <div class="breakdown">
              <div class="breakdown-row"><span class="name">Completion</span><div class="progress success"><span style="width:${s.completion_rate}%"></span></div><span class="val">${s.completion_rate}%</span></div>
              <div class="breakdown-row"><span class="name">Finished in period</span><span class="muted">Includes work planned earlier</span><span class="val">${s.completed_in_period}</span></div>
              <div class="breakdown-row"><span class="name">Avg hours / task</span><span class="muted">Spent hours ÷ completed tasks</span><span class="val">${fmtH(avg)}</span></div>
              <div class="breakdown-row"><span class="name">Estimate accuracy</span><span class="muted">${variance === null ? 'No completed tasks with estimates' : variance > 0 ? 'Completed work took longer than estimated' : 'Completed work within estimate'}</span><span class="val">${variance === null ? '—' : `${variance > 0 ? '+' : ''}${variance}%`}</span></div>
              ${type !== 'daily' ? `<div class="breakdown-row"><span class="name">Most productive</span><span class="muted">Day with most completions</span><span class="val">${busiest ? esc(fmtDate(busiest.date, { weekday: 'short', day: 'numeric' })) : '—'}</span></div>` : ''}
            </div>
          </div>
        </div>
      </div>
      <div class="card table-card">
        <div class="card-head"><h3>Tasks</h3><span class="hint">${r.tasks.length} planned in this period</span></div>
        <div class="card-body flush">
          ${r.tasks.length ? `<div class="table-wrap"><table class="table">
            <thead><tr>${showDayCol ? '<th>Date</th>' : ''}<th>Task</th><th>Category</th><th>Priority</th><th>Status</th><th>Due</th><th class="r">Est.</th><th class="r">Spent</th></tr></thead>
            <tbody>${rows}</tbody>
          </table></div>` : emptyState('No tasks in this period', 'Pick a different date or period above.', 'chart', true)}
        </div>
      </div>`;

    const c = themeColors();
    if (type === 'daily') {
      doughnut($('#rep-chart-1'), ['Done', 'In progress', 'To do'], [s.done, s.in_progress, s.todo], [c.success, c.info, c.muted]);
      const chart = state.charts[state.charts.length - 1];
      if (chart) {
        chart.options.plugins.legend = { display: true, position: 'right', labels: { usePointStyle: true, boxWidth: 8 } };
        chart.update();
      }
    } else {
      const labels = r.by_day.map((d) => (type === 'weekly'
        ? fmtDate(d.date, { weekday: 'short', day: 'numeric' })
        : String(parseD(d.date).getDate())));
      barChart($('#rep-chart-1'), labels, r.by_day);
    }
    if (r.by_category.length) {
      doughnut($('#rep-chart-2'), r.by_category.map((x) => x.name), r.by_category.map((x) => x.total), r.by_category.map((x) => safeColor(x.color)));
    }
    $$('tbody tr[data-id]', area).forEach((tr) => {
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => openTaskDialog(state.tasks.get(Number(tr.dataset.id))));
    });
  }

  /* ======================================================================
     View: categories
     ====================================================================== */
  const PALETTE = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#64748b'];

  async function renderCategories() {
    state.refresh = () => renderCategories();
    try { await loadCategories(); } catch (err) { fail(err); }
    if (state.route !== 'categories') return;
    const nextColor = PALETTE[state.categories.length % PALETTE.length];
    view.innerHTML = `
      <div class="grid grid-main">
        <div class="card">
          <div class="card-head"><h3>Categories</h3><span class="hint">${state.categories.length} total</span></div>
          <div class="card-body flush" id="cat-list">
            ${state.categories.length ? state.categories.map((c) => `
              <div class="cat-row" data-cat="${c.id}">
                <span class="cat-swatch" style="background:${safeColor(c.color)}"></span>
                <span class="name">${esc(c.name)}</span>
                <span class="subtle">${c.open_count} open · ${c.task_count} total</span>
                <button class="icon-btn" type="button" data-cat-action="edit" aria-label="Edit ${esc(c.name)}">${icon('edit')}</button>
                <button class="icon-btn danger" type="button" data-cat-action="delete" aria-label="Delete ${esc(c.name)}">${icon('trash')}</button>
              </div>`).join('') : emptyState('No categories', 'Create categories to organise your work.', 'tag', true)}
          </div>
        </div>
        <div class="card" style="align-self:start">
          <div class="card-head"><h3 id="cat-form-title">New category</h3></div>
          <div class="card-body">
            <form class="cat-form" id="cat-form" autocomplete="off">
              <input type="color" name="color" value="${nextColor}" aria-label="Colour">
              <input class="input" name="name" maxlength="60" placeholder="e.g. Client work" required aria-label="Category name">
              <button class="btn btn-primary" type="submit" id="cat-submit">Add</button>
              <button class="btn btn-ghost" type="button" id="cat-cancel" hidden>Cancel</button>
            </form>
            <p class="subtle" style="margin-top:12px;font-size:13px">Tip: in quick add, type <b>#${esc((state.categories[0]?.name || 'Development').replace(/\s+/g, ''))}</b> to assign a category.</p>
          </div>
        </div>
      </div>`;

    const cform = $('#cat-form');
    let editing = null;
    const resetForm = () => {
      editing = null;
      cform.reset();
      cform.elements.color.value = nextColor;
      $('#cat-form-title').textContent = 'New category';
      $('#cat-submit').textContent = 'Add';
      $('#cat-cancel').hidden = true;
    };
    $('#cat-cancel').addEventListener('click', resetForm);
    cform.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = { name: cform.elements.name.value.trim(), color: cform.elements.color.value };
      if (!body.name) return;
      try {
        if (editing) await api(`/categories/${editing}`, { method: 'PUT', body });
        else await api('/categories', { method: 'POST', body });
        toast(editing ? 'Category updated' : 'Category added');
        renderCategories();
      } catch (err) { fail(err); }
    });
    $('#cat-list').addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-cat-action]');
      if (!btn) return;
      const id = Number(btn.closest('[data-cat]').dataset.cat);
      const cat = state.categories.find((c) => c.id === id);
      if (btn.dataset.catAction === 'edit') {
        editing = id;
        cform.elements.name.value = cat.name;
        cform.elements.color.value = safeColor(cat.color);
        $('#cat-form-title').textContent = 'Edit category';
        $('#cat-submit').textContent = 'Save';
        $('#cat-cancel').hidden = false;
        cform.elements.name.focus();
      } else {
        const ok = await confirmDialog({
          title: 'Delete category?',
          message: `"${cat.name}" will be removed. Its ${cat.task_count} task(s) will be kept as Uncategorized.`,
        });
        if (!ok) return;
        try {
          await api(`/categories/${id}`, { method: 'DELETE' });
          toast('Category deleted');
          renderCategories();
        } catch (err) { fail(err); }
      }
    });
  }

  /* ======================================================================
     Router
     ====================================================================== */
  const ROUTES = {
    dashboard: { title: 'Dashboard', render: renderDashboard },
    today: { title: 'Today', render: () => renderTaskView('today') },
    upcoming: { title: 'Upcoming', render: () => renderTaskView('upcoming') },
    all: { title: 'All tasks', render: () => renderTaskView('all') },
    completed: { title: 'Completed', render: () => renderTaskView('completed') },
    reports: { title: 'Reports', render: renderReports },
    categories: { title: 'Categories', render: renderCategories },
  };

  function navigate() {
    const name = location.hash.replace(/^#\/?/, '') || 'dashboard';
    state.route = ROUTES[name] ? name : 'dashboard';
    destroyCharts();
    $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === state.route));
    $('#page-title').textContent = ROUTES[state.route].title;
    const tv = TASK_VIEWS[state.route];
    $('#page-subtitle').textContent = tv ? tv.subtitle() : (state.route === 'categories' ? 'Organise your work into areas' : '');
    document.title = `${ROUTES[state.route].title} · WorkLog`;
    document.body.classList.remove('nav-open');
    window.scrollTo(0, 0);
    ROUTES[state.route].render();
  }
  window.addEventListener('hashchange', navigate);

  /* ======================================================================
     Global UI: search, theme, shortcuts, mobile nav
     ====================================================================== */
  $('#search').addEventListener('input', debounce((e) => {
    state.search = e.target.value.trim();
    if (TASK_VIEWS[state.route]) {
      $('#filters').innerHTML = filtersHtml();
      loadTaskArea(state.route);
    } else if (state.search) {
      location.hash = '#/all';
    }
  }, 250));

  function syncThemeButton() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const b = $('#theme-toggle');
    b.innerHTML = `${icon(dark ? 'sun' : 'moon')}<span>${dark ? 'Light mode' : 'Dark mode'}</span>`;
  }
  $('#theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('worklog-theme', next); } catch { /* ignore */ }
    syncThemeButton();
    if (state.charts.length) state.refresh(); // redraw charts with new palette
  });

  $('#new-task-btn').addEventListener('click', () => {
    const tv = TASK_VIEWS[state.route];
    openTaskDialog(null, { task_date: tv ? tv.newDate() : todayStr() });
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable]') || $('dialog[open]')) return;
    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      $('#new-task-btn').click();
    } else if (e.key === '/') {
      e.preventDefault();
      $('#search').focus();
    }
  });

  $('#menu-btn').addEventListener('click', () => document.body.classList.add('nav-open'));
  $('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));

  /* ======================================================================
     Boot
     ====================================================================== */
  hydrateIcons();
  syncThemeButton();
  loadCategories().catch(fail).finally(() => {
    navigate();
    updateTodayCount();
  });
})();
