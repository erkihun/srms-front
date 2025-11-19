import { query } from './db.js';

export const ALLOWED_STATUS = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
export const ALLOWED_PRIORITY = ['LOW', 'MEDIUM', 'HIGH'];

export function normalizeStatus(value) {
  const v = (value || '').toString().toUpperCase();
  return ALLOWED_STATUS.includes(v) ? v : 'OPEN';
}

export function normalizePriority(value) {
  const v = (value || '').toString().toUpperCase();
  return ALLOWED_PRIORITY.includes(v) ? v : 'MEDIUM';
}

/**
 * List tasks with optional filters: { status, assigned_to }
 */
export async function listTasks(filters = {}) {
  const where = [];
  const values = [];
  let i = 1;

  if (filters.status) {
    where.push(`t.status = $${i++}`);
    values.push(filters.status);
  }
  if (filters.assigned_to) {
    where.push(`t.assigned_to = $${i++}`);
    values.push(filters.assigned_to);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const res = await query(
    `SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.assigned_to,
        au.full_name AS assigned_to_name,
        t.created_by,
        cu.full_name AS created_by_name,
        t.due_date,
        t.technician_note,
        t.technician_rating,
        t.created_at,
        t.updated_at
     FROM tasks t
     LEFT JOIN users au ON au.id = t.assigned_to
     LEFT JOIN users cu ON cu.id = t.created_by
     ${whereClause}
     ORDER BY t.created_at DESC`,
    values
  );

  return res.rows;
}

/**
 * Single task by id
 */
export async function findTaskById(id) {
  const res = await query(
    `SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.assigned_to,
        au.full_name AS assigned_to_name,
        t.created_by,
        cu.full_name AS created_by_name,
        t.due_date,
        t.technician_note,
        t.technician_rating,
        t.created_at,
        t.updated_at
     FROM tasks t
     LEFT JOIN users au ON au.id = t.assigned_to
     LEFT JOIN users cu ON cu.id = t.created_by
     WHERE t.id = $1
     LIMIT 1`,
    [id]
  );
  return res.rows[0];
}

/**
 * Create task
 */
export async function createTask(data) {
  const status = normalizeStatus(data.status);
  const priority = normalizePriority(data.priority);

  const res = await query(
    `INSERT INTO tasks
       (title, description, status, priority, assigned_to, created_by, due_date, technician_note, technician_rating)
     VALUES
       ($1,   $2,         $3,     $4,       $5,          $6,         $7,       $8,              $9)
     RETURNING
       id, title, description, status, priority,
       assigned_to, created_by, due_date, technician_note, technician_rating,
       created_at, updated_at`,
    [
      data.title,
      data.description ?? null,
      status,
      priority,
      data.assigned_to || null,
      data.created_by || null,
      data.due_date || null,
      data.technician_note || null,
      data.technician_rating || null,
    ]
  );

  return res.rows[0];
}

/**
 * Update task with dynamic fields
 */
export async function updateTask(id, data) {
  const fields = [];
  const values = [];
  let i = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${i++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${i++}`);
    values.push(data.description);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${i++}`);
    values.push(normalizeStatus(data.status));
  }
  if (data.priority !== undefined) {
    fields.push(`priority = $${i++}`);
    values.push(normalizePriority(data.priority));
  }
  if (data.assigned_to !== undefined) {
    fields.push(`assigned_to = $${i++}`);
    values.push(data.assigned_to || null);
  }
  if (data.due_date !== undefined) {
    fields.push(`due_date = $${i++}`);
    values.push(data.due_date || null);
  }
  if (data.technician_note !== undefined) {
    fields.push(`technician_note = $${i++}`);
    values.push(data.technician_note || null);
  }
  if (data.technician_rating !== undefined) {
    fields.push(`technician_rating = $${i++}`);
    values.push(data.technician_rating || null);
  }

  if (!fields.length) {
    return await findTaskById(id);
  }

  fields.push(`updated_at = NOW()`);

  values.push(id);
  const res = await query(
    `UPDATE tasks
     SET ${fields.join(', ')}
     WHERE id = $${i}
     RETURNING
       id, title, description, status, priority,
       assigned_to, created_by, due_date, technician_note, technician_rating,
       created_at, updated_at`,
    values
  );

  return res.rows[0];
}

/**
 * Delete task
 */
export async function deleteTask(id) {
  const res = await query(
    `DELETE FROM tasks
     WHERE id = $1
     RETURNING id`,
    [id]
  );
  return res.rowCount > 0;
}

/**
 * Progress helpers
 */
export async function addTaskProgress({ task_id, technician_id, status, note }) {
  const res = await query(
    `INSERT INTO task_progress (task_id, technician_id, status, note)
     VALUES ($1, $2, $3, $4)
     RETURNING
       id, task_id, technician_id, status, note, admin_comment, admin_id, created_at`,
    [task_id, technician_id || null, normalizeStatus(status), note || null]
  );
  return res.rows[0];
}

export async function listTaskProgress(taskId) {
  const res = await query(
    `SELECT
        p.id,
        p.status,
        p.note,
        p.created_at,
        p.technician_id,
        u.full_name AS technician_name,
        p.admin_comment,
        p.admin_id,
        au.full_name AS admin_name
     FROM task_progress p
     LEFT JOIN users u ON u.id = p.technician_id
     LEFT JOIN users au ON au.id = p.admin_id
     WHERE p.task_id = $1
     ORDER BY p.created_at ASC`,
    [taskId]
  );
  return res.rows;
}

/**
 * Admin can add/update comment on a specific progress entry
 */
export async function updateTaskProgressAdminComment(progressId, adminId, comment) {
  const res = await query(
    `UPDATE task_progress
     SET admin_comment = $1,
         admin_id      = $2
     WHERE id = $3
     RETURNING
       id, task_id, technician_id, status, note,
       admin_comment, admin_id, created_at`,
    [comment || null, adminId || null, progressId]
  );
  return res.rows[0];
}
