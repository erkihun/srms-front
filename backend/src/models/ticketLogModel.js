import { query } from './db.js';

export async function createTicketLog({
  ticket_id,
  created_by_id,
  action_type,
  old_status = null,
  new_status = null,
  note = null,
}) {
  const res = await query(
    `INSERT INTO ticket_logs (
       ticket_id, created_by_id, action_type, old_status, new_status, note
     )
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [ticket_id, created_by_id, action_type, old_status, new_status, note]
  );
  return res.rows[0];
}

export async function getTicketLogs(ticket_id) {
  const res = await query(
    `SELECT tl.*, u.full_name AS created_by_name
     FROM ticket_logs tl
     JOIN users u ON u.id = tl.created_by_id
     WHERE tl.ticket_id = $1
     ORDER BY tl.created_at ASC`,
    [ticket_id]
  );
  return res.rows;
}
