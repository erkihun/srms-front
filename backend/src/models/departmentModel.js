import { query } from './db.js';

export async function listDepartments() {
  const res = await query(
    'SELECT id, name, description FROM departments ORDER BY name',
    []
  );
  return res.rows;
}

export async function createDepartment(data) {
  const res = await query(
    `INSERT INTO departments (name, description)
     VALUES ($1,$2)
     RETURNING id, name, description`,
    [data.name, data.description]
  );
  return res.rows[0];
}

export async function updateDepartment(id, data) {
  const res = await query(
    `UPDATE departments
     SET name = $1,
         description = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING id, name, description`,
    [data.name, data.description, id]
  );
  return res.rows[0];
}

export async function deleteDepartment(id) {
  await query('DELETE FROM departments WHERE id = $1', [id]);
}
