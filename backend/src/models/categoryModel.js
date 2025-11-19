import { query } from './db.js';

export async function listCategories() {
  const res = await query(
    'SELECT id, name, description, is_active FROM categories ORDER BY name',
    []
  );
  return res.rows;
}

export async function createCategory(data) {
  const res = await query(
    `INSERT INTO categories (name, description, is_active)
     VALUES ($1,$2,$3)
     RETURNING id, name, description, is_active`,
    [data.name, data.description, data.is_active ?? true]
  );
  return res.rows[0];
}

export async function updateCategory(id, data) {
  const res = await query(
    `UPDATE categories
     SET name = $1,
         description = $2,
         is_active = $3,
         updated_at = NOW()
     WHERE id = $4
     RETURNING id, name, description, is_active`,
    [data.name, data.description, data.is_active, id]
  );
  return res.rows[0];
}

export async function deleteCategory(id) {
  await query('DELETE FROM categories WHERE id = $1', [id]);
}
