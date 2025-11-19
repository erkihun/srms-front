import { query } from './db.js';

export async function createNotification({ user_id, title, message, link_url = null }) {
  const res = await query(
    `
    INSERT INTO notifications (user_id, title, message, link_url)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, title, message, link_url, is_read, created_at
    `,
    [user_id, title, message, link_url]
  );
  return res.rows[0];
}

export async function listNotificationsForUser(userId) {
  const res = await query(
    `
    SELECT id, user_id, title, message, link_url, is_read, created_at
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );
  return res.rows;
}

export async function countUnreadNotifications(userId) {
  const res = await query(
    `
    SELECT COUNT(*) AS count
    FROM notifications
    WHERE user_id = $1 AND is_read = false
    `,
    [userId]
  );
  return Number(res.rows[0]?.count || 0);
}

export async function markNotificationRead(id, userId) {
  const res = await query(
    `
    UPDATE notifications
    SET is_read = true,
        read_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, title, message, link_url, is_read, created_at
    `,
    [id, userId]
  );
  return res.rows[0] || null;
}

export async function markAllNotificationsRead(userId) {
  await query(
    `
    UPDATE notifications
    SET is_read = true,
        read_at = NOW()
    WHERE user_id = $1
    `,
    [userId]
  );
}
