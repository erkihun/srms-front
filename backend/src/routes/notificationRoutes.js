import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { query } from '../models/db.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { unread } = req.query;

    const whereClauses = ['user_id = $1'];
    const params = [userId];

    if (unread === 'true') {
      whereClauses.push('is_read = FALSE');
    }

    const result = await query(
      `
      SELECT
        id,
        title,
        message,
        is_read,
        link_url,
        created_at
      FROM notifications
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY created_at DESC
      `,
      params
    );

    res.json(result.rows || []);
  } catch (err) {
    console.error('Failed to load notifications', err);
    res.json([]);
  }
});

router.post('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await query(
      'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    try {
      await query(
        'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = $1',
        [id]
      );
    } catch (err) {
      await query(
        'UPDATE notifications SET is_read = TRUE WHERE id = $1',
        [id]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    try {
      await query(
        `
        UPDATE notifications
        SET is_read = TRUE, read_at = NOW()
        WHERE user_id = $1 AND is_read = FALSE
        `,
        [userId]
      );
    } catch (err) {
      await query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1 AND is_read = FALSE
        `,
        [userId]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
