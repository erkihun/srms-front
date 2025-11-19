import { query } from './db.js';

export async function createTicketAttachment({
  ticket_id,
  uploaded_by_id,
  filename_original,
  filename_stored,
  mime_type,
  size_bytes,
}) {
  const res = await query(
    `INSERT INTO ticket_attachments (
       ticket_id, uploaded_by_id, filename_original,
       filename_stored, mime_type, size_bytes
     )
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      ticket_id,
      uploaded_by_id,
      filename_original,
      filename_stored,
      mime_type,
      size_bytes,
    ]
  );
  return res.rows[0];
}

export async function getTicketAttachments(ticket_id) {
  const res = await query(
    `SELECT ta.*, u.full_name AS uploaded_by_name
     FROM ticket_attachments ta
     JOIN users u ON u.id = ta.uploaded_by_id
     WHERE ta.ticket_id = $1
     ORDER BY ta.created_at ASC`,
    [ticket_id]
  );
  return res.rows;
}
