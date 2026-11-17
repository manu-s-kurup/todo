-- Daily Work Todo - database schema (idempotent; runs on every server start)

CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(60)  NOT NULL UNIQUE,
    color       VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
    id               SERIAL PRIMARY KEY,
    title            VARCHAR(200)  NOT NULL,
    description      TEXT,
    status           VARCHAR(20)   NOT NULL DEFAULT 'todo'
                     CHECK (status IN ('todo', 'in_progress', 'done')),
    priority         VARCHAR(10)   NOT NULL DEFAULT 'medium'
                     CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category_id      INTEGER       REFERENCES categories(id) ON DELETE SET NULL,
    task_date        DATE          NOT NULL DEFAULT CURRENT_DATE,   -- the day the work is planned for
    due_date         DATE,                                          -- optional deadline
    estimated_hours  NUMERIC(5,2)  CHECK (estimated_hours IS NULL OR estimated_hours >= 0),
    spent_hours      NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (spent_hours >= 0),
    completed_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_task_date    ON tasks (task_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status       ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks (completed_at);
CREATE INDEX IF NOT EXISTS idx_tasks_category     ON tasks (category_id);

-- Seed a few default categories on first run only
INSERT INTO categories (name, color)
SELECT v.name, v.color
FROM (VALUES
    ('Development',   '#6366f1'),
    ('Meetings',      '#0ea5e9'),
    ('Support',       '#f59e0b'),
    ('Documentation', '#10b981'),
    ('Review',        '#ec4899')
) AS v(name, color)
WHERE NOT EXISTS (SELECT 1 FROM categories);
