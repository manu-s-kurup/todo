# WorkLog — Daily Work Todo & Reports

A small task manager for daily work, with **daily, weekly and monthly reports**. Built with Node.js, Express and PostgreSQL. The frontend needs no build step.

## Features

- **Dashboard**: today's progress, in-progress, carried-over and overdue counts, hours logged, a chart of this week, focus list, deadlines and recently completed tasks.
- **Today**: today's tasks plus unfinished work **carried over** from earlier days, grouped by status. Move a carried-over task to today with one click.
- **Upcoming / All tasks / Completed**: views grouped by date, with filters for status, priority and category, and full-text search.
- **Tasks** have a title, notes, category, priority (Low to Urgent), status (To do, In progress, Done), planned date, deadline, estimated hours and hours spent.
- **Quick add**: type a title and press Enter. Inline tags are supported: `!high` and `#Meetings`.
- **Reports** (daily, weekly Mon–Sun, monthly): KPIs, a planned-vs-completed chart, category and priority breakdowns, highlights (completion rate, avg hours per task, estimate accuracy, most productive day) and a full task table.
  - **Export CSV** opens in Excel with UTF-8 handled correctly.
  - **Print / PDF** uses a print-optimised layout. Use your browser's "Save as PDF".
- **Categories**: create, rename, recolour or delete. Tasks in a deleted category are kept as Uncategorized.
- Light and dark theme, responsive on mobile, keyboard shortcuts: `N` for a new task, `/` for search.

## Requirements

- Node.js 18+
- PostgreSQL 12+

## Setup

```bash
npm install
cp .env.example .env        # then edit DATABASE_URL
npm start                   # http://127.0.0.1:3000
```

On first start, the app **creates the database** if it is missing (this needs the CREATEDB privilege). It also creates the tables and seeds a few default categories. The schema is in [server/schema.sql](server/schema.sql).

Use `npm run dev` to auto-restart the server when files change.

### Configuration (`.env`)

| Variable       | Default     | Description                                       |
|----------------|-------------|---------------------------------------------------|
| `DATABASE_URL` | —           | `postgres://user:pass@host:5432/daily_todo`       |
| `PORT`         | `3000`      | HTTP port                                         |
| `HOST`         | `127.0.0.1` | Bind address. Use `0.0.0.0` to expose on the LAN. |

## Project structure

```
server/
  index.js            Express app, security headers, error handling
  db.js               pg pool, auto-create DB, run schema
  schema.sql          tables + indexes + default categories
  utils.js            validation, date/period helpers
  queries.js          shared SQL fragments
  routes/
    tasks.js          CRUD + list views/filters
    categories.js     CRUD
    dashboard.js      dashboard aggregates
    reports.js        daily/weekly/monthly report + CSV export
public/
  index.html, css/styles.css, js/app.js, js/theme.js
```

## REST API

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/tasks?view=today\|upcoming\|all\|completed&today=YYYY-MM-DD&search=&status=&priority=&category=` | List tasks |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task (`title` is required) |
| PATCH | `/api/tasks/:id` | Partial update. Setting `status` to `done` stamps `completed_at`. |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET/POST | `/api/categories` | List (with task counts) or create a category |
| PUT/DELETE | `/api/categories/:id` | Update or delete a category |
| GET | `/api/dashboard?today=YYYY-MM-DD` | Dashboard data |
| GET | `/api/reports?type=daily\|weekly\|monthly&date=YYYY-MM-DD` | Report JSON |
| GET | `/api/reports/export?type=…&date=…` | Report as a CSV download |

## How reports count tasks

- A task belongs to the period of its **planned date** (`task_date`).
- **Completed in period** also counts tasks finished during the period that were planned earlier.
- **Overdue** means a task that is not done and whose deadline has passed.
- **Estimate accuracy** compares hours spent with hours estimated, using only completed tasks that have an estimate.

## Notes

- This is a single-user app with no login. Keep it bound to `127.0.0.1`, or put it behind authentication or a reverse proxy before exposing it on a network.
- Every SQL query is parameterised, inputs are validated on the server, output is HTML-escaped and a strict Content-Security-Policy is applied.
