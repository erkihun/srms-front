import { query } from '../models/db.js';

export async function getDashboardSummary(req, res, next) {
  try {
    const totalResult = await query(
      `SELECT COUNT(*)::int AS total FROM tickets`
    );

    const openResult = await query(
      `SELECT COUNT(*)::int AS open
       FROM tickets
       WHERE status IN ('NEW', 'IN_PROGRESS', 'ON_HOLD')`
    );

    const resolvedResult = await query(
      `SELECT COUNT(*)::int AS resolved
       FROM tickets
       WHERE status IN ('RESOLVED', 'CLOSED')`
    );

    res.json({
      total: totalResult.rows[0]?.total || 0,
      open: openResult.rows[0]?.open || 0,
      resolved: resolvedResult.rows[0]?.resolved || 0,
    });
  } catch (err) {
    next(err);
  }
}
