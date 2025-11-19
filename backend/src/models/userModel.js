import { query } from './db.js';
import bcrypt from 'bcryptjs';

export async function findUserByEmail(email) {
  const res = await query(
    'SELECT id, full_name, email, password_hash, role, department_id, is_active FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return res.rows[0];
}

export async function findUserById(id) {
  const res = await query(
    `SELECT u.id,
            u.full_name,
            u.email,
            u.role,
            u.department_id,
            u.is_active,
            u.username,
            u.avatar_url,
            u.phone,
            u.created_at,
            u.updated_at,
            d.name AS department_name
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.id = $1`,
    [id]
  );
  return res.rows[0];
}

export async function listUsers() {
  const res = await query(
    `SELECT u.id,
            u.full_name,
            u.email,
            u.role,
            u.department_id,
            u.is_active,
            u.username,
            u.avatar_url,
            u.phone,
            d.name AS department_name
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     ORDER BY u.full_name`,
    []
  );
  return res.rows;
}

export async function createEmployeeUser({ full_name, email, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('Email already registered.');
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const res = await query(
    `INSERT INTO users (full_name, email, password_hash, role, is_active)
     VALUES ($1,$2,$3,'EMPLOYEE', true)
     RETURNING id, full_name, email, role, is_active`,
    [full_name, email, password_hash]
  );

  return res.rows[0];
}

export async function createUser(data) {
  const hash = await bcrypt.hash(data.password, 10);
  const username = data.username || data.email.split('@')[0];

  const res = await query(
    `INSERT INTO users (
        full_name,
        email,
        password_hash,
        role,
        department_id,
        is_active,
        username,
        avatar_url,
        phone
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id,
               full_name,
               email,
               role,
               department_id,
               is_active,
               username,
               avatar_url,
               phone`,
    [
      data.full_name,
      data.email,
      hash,
      data.role,
      data.department_id,
      data.is_active ?? true,
      username,
      data.avatar_url ?? null,
      data.phone ?? null,
    ]
  );
  return res.rows[0];
}

export async function updateUser(id, data) {
  const fields = [];
  const values = [];
  let i = 1;

  if (data.full_name !== undefined) {
    fields.push(`full_name = $${i++}`);
    values.push(data.full_name);
  }
  if (data.email !== undefined) {
    fields.push(`email = $${i++}`);
    values.push(data.email);
  }
  if (data.role !== undefined) {
    fields.push(`role = $${i++}`);
    values.push(data.role);
  }
  if (data.department_id !== undefined) {
    fields.push(`department_id = $${i++}`);
    values.push(data.department_id);
  }
  if (data.is_active !== undefined) {
    fields.push(`is_active = $${i++}`);
    values.push(data.is_active);
  }
  if (data.username !== undefined) {
    fields.push(`username = $${i++}`);
    values.push(data.username);
  }
  if (data.avatar_url !== undefined) {
    fields.push(`avatar_url = $${i++}`);
    values.push(data.avatar_url);
  }
  if (data.phone !== undefined) {
    fields.push(`phone = $${i++}`);
    values.push(data.phone);
  }
  if (data.password !== undefined) {
    const hash = await bcrypt.hash(data.password, 10);
    fields.push(`password_hash = $${i++}`);
    values.push(hash);
  }

  if (!fields.length) {
    const r = await findUserById(id);
    return r;
  }

  values.push(id);
  const res = await query(
    `UPDATE users
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${i}
     RETURNING id,
               full_name,
               email,
               role,
               department_id,
               is_active,
               username,
               avatar_url,
               phone`,
    values
  );
  return res.rows[0];
}

export async function deactivateUser(id) {
  const res = await query(
    `UPDATE users 
     SET is_active = false, updated_at = NOW()
     WHERE id = $1
     RETURNING id, full_name, email, role, department_id, is_active`,
    [id]
  );
  return res.rows[0];
}
