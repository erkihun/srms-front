import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import { query } from '../models/db.js';

const router = express.Router();

async function safeQuery(sql, params = []) {
  try {
    const res = await query(sql, params);
    return res.rows || [];
  } catch (err) {
    console.error('Dashboard query failed:', err.message);
    return [];
  }
}

router.get(
  '/technician-performance',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res, next) => {
    try {
      const ticketSummaryRows = await safeQuery(
        `
        SELECT
          u.id AS technician_id,
          u.full_name,
          COUNT(t.*) AS tickets_total,
          COUNT(t.*) FILTER (WHERE t.status IN ('RESOLVED','CLOSED')) AS tickets_closed,
          AVG(t.feedback_rating) AS avg_ticket_rating,
          AVG(
            EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600
          ) FILTER (WHERE t.status IN ('RESOLVED','CLOSED') AND t.updated_at IS NOT NULL) AS avg_resolution_hours
        FROM users u
        LEFT JOIN tickets t ON t.assigned_to_id = u.id
        WHERE u.role = 'TECHNICIAN'
        GROUP BY u.id, u.full_name
        ORDER BY u.full_name
        `
      );

      const taskRatingsRows = await safeQuery(
        `
        SELECT
          assigned_to AS technician_id,
          COUNT(*) AS tasks_total,
          COUNT(*) FILTER (WHERE technician_rating IS NOT NULL) AS tasks_rated_count,
          AVG(technician_rating) AS avg_task_rating
        FROM tasks
        WHERE assigned_to IS NOT NULL
        GROUP BY assigned_to
        `
      );

      const categoryCountsRows = await safeQuery(
        `
        SELECT
          t.assigned_to_id AS technician_id,
          c.id             AS category_id,
          c.name           AS category_name,
          COUNT(*)         AS tickets
        FROM tickets t
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.assigned_to_id IS NOT NULL
        GROUP BY t.assigned_to_id, c.id, c.name
        `
      );

      const ratingTrendRows = await safeQuery(
        `
        SELECT
          t.assigned_to_id AS technician_id,
          date_trunc('month', t.created_at) AS month,
          AVG(t.feedback_rating)            AS avg_rating,
          COUNT(t.feedback_rating)          AS ratings_count
        FROM tickets t
        WHERE t.assigned_to_id IS NOT NULL
          AND t.feedback_rating IS NOT NULL
        GROUP BY t.assigned_to_id, date_trunc('month', t.created_at)
        ORDER BY t.assigned_to_id, date_trunc('month', t.created_at)
        `
      );

      const taskMap = new Map();
      taskRatingsRows.forEach((row) => {
        taskMap.set(row.technician_id, row);
      });

      const categoryMap = new Map();
      categoryCountsRows.forEach((row) => {
        const list = categoryMap.get(row.technician_id) || [];
        list.push({
          category_id: row.category_id,
          category_name: row.category_name,
          tickets: Number(row.tickets),
        });
        categoryMap.set(row.technician_id, list);
      });

      const trendMap = new Map();
      ratingTrendRows.forEach((row) => {
        const list = trendMap.get(row.technician_id) || [];
        list.push({
          month: row.month ? new Date(row.month).toISOString() : null,
          avg_rating: row.avg_rating !== null ? Number(row.avg_rating) : null,
          ratings_count: Number(row.ratings_count || 0),
        });
        trendMap.set(row.technician_id, list);
      });

      const technicians = (ticketSummaryRows || []).map((row) => {
        const taskStats = taskMap.get(row.technician_id) || {};
        return {
          technician_id: row.technician_id,
          full_name: row.full_name,
          tickets_total: Number(row.tickets_total || 0),
          tickets_closed: Number(row.tickets_closed || 0),
          avg_ticket_rating:
            row.avg_ticket_rating !== null ? Number(row.avg_ticket_rating) : null,
          avg_resolution_hours:
            row.avg_resolution_hours !== null
              ? Number(row.avg_resolution_hours)
              : null,
          tasks_total: Number(taskStats.tasks_total || 0),
          tasks_rated_count: Number(taskStats.tasks_rated_count || 0),
          avg_task_rating:
            taskStats.avg_task_rating !== null && taskStats.avg_task_rating !== undefined
              ? Number(taskStats.avg_task_rating)
              : null,
          category_breakdown: categoryMap.get(row.technician_id) || [],
          rating_trend_monthly: trendMap.get(row.technician_id) || [],
        };
      });

      res.json({ technicians });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/summary',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res, next) => {
    try {
      const total = await query('SELECT COUNT(*) FROM tickets');
      const open = await query(
        "SELECT COUNT(*) FROM tickets WHERE status NOT IN ('RESOLVED','CLOSED')"
      );
      const resolved = await query(
        "SELECT COUNT(*) FROM tickets WHERE status IN ('RESOLVED','CLOSED')"
      );

      res.json({
        total: Number(total.rows[0].count),
        open: Number(open.rows[0].count),
        resolved: Number(resolved.rows[0].count),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/technician-summary',
  requireAuth,
  requireRole('TECHNICIAN'),
  async (req, res, next) => {
    try {
      const techId = req.user.id;

      const assigned = await query(
        'SELECT COUNT(*) FROM tickets WHERE assigned_to_id = $1',
        [techId]
      );
      const inProgress = await query(
        "SELECT COUNT(*) FROM tickets WHERE assigned_to_id = $1 AND status = 'IN_PROGRESS'",
        [techId]
      );
      const resolved = await query(
        "SELECT COUNT(*) FROM tickets WHERE assigned_to_id = $1 AND status IN ('RESOLVED','CLOSED')",
        [techId]
      );

      res.json({
        assigned: Number(assigned.rows[0].count),
        inProgress: Number(inProgress.rows[0].count),
        resolved: Number(resolved.rows[0].count),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/technician-rating',
  requireAuth,
  requireRole('TECHNICIAN'),
  async (req, res, next) => {
    try {
      const techId = req.user.id;

      const result = await query(
        `
        SELECT
          AVG(feedback_rating)::numeric(10,2) AS score,
          COUNT(feedback_rating)              AS count
        FROM tickets
        WHERE assigned_to_id = $1
          AND feedback_rating IS NOT NULL
          AND status IN ('RESOLVED', 'CLOSED')
        `,
        [techId]
      );

      const row = result.rows[0] || {};

      res.json({
        score:
          row.score !== null && row.score !== undefined
            ? Number(row.score)
            : null,
        count: row.count ? Number(row.count) : 0,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/technician-task-rating',
  requireAuth,
  requireRole('TECHNICIAN'),
  async (req, res, next) => {
    try {
      const techId = req.user.id;

      const result = await query(
        `
        SELECT
          AVG(technician_rating)::numeric(10,2) AS score,
          COUNT(technician_rating)              AS count
        FROM tasks
        WHERE assigned_to = $1
          AND technician_rating IS NOT NULL
        `,
        [techId]
      );

      const row = result.rows[0] || {};

      res.json({
        score:
          row.score !== null && row.score !== undefined
            ? Number(row.score)
            : null,
        count: row.count ? Number(row.count) : 0,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
