// Shared SQL fragments

const TASK_SELECT = `
  SELECT t.id, t.title, t.description, t.status, t.priority, t.category_id,
         t.task_date, t.due_date, t.estimated_hours, t.spent_hours,
         t.completed_at, t.created_at, t.updated_at,
         c.name AS category_name, c.color AS category_color
  FROM tasks t
  LEFT JOIN categories c ON c.id = t.category_id`;

const PRIORITY_RANK = `CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END`;

module.exports = { TASK_SELECT, PRIORITY_RANK };
