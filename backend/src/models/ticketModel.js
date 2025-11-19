import { query } from './db.js';

function buildTicketFilterQuery(filters = {}) {
  const where = [];
  const params = [];
  let idx = 1;

  if (filters.status) {
    where.push(`t.status = $${idx++}`);
    params.push(filters.status);
  }
  if (filters.department_id) {
    where.push(`t.department_id = $${idx++}`);
    params.push(filters.department_id);
  }
  if (filters.category_id) {
    where.push(`t.category_id = $${idx++}`);
    params.push(filters.category_id);
  }
  if (filters.requester_id) {
    where.push(`t.requester_id = $${idx++}`);
    params.push(filters.requester_id);
  }
  if (filters.assigned_to_id) {
    where.push(`t.assigned_to_id = $${idx++}`);
    params.push(filters.assigned_to_id);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  return { whereClause, params };
}

export async function getTickets(filters = {}) {
  const { whereClause, params } = buildTicketFilterQuery(filters);

  const sql = `
    SELECT
      t.*,
      r.full_name AS requester_name,
      d.name      AS department_name,
      c.name      AS category_name,
      a.full_name AS assignee_name
    FROM tickets t
    LEFT JOIN users       r ON r.id = t.requester_id
    LEFT JOIN departments d ON d.id = t.department_id
    LEFT JOIN categories  c ON c.id = t.category_id
    LEFT JOIN users       a ON a.id = t.assigned_to_id
    ${whereClause}
    ORDER BY t.created_at DESC
  `;

  const result = await query(sql, params);
  return result.rows;
}

export async function getTicketById(id) {
  const sql = `
    SELECT
      t.*,
      r.full_name AS requester_name,
      d.name      AS department_name,
      c.name      AS category_name,
      a.full_name AS assignee_name
    FROM tickets t
    LEFT JOIN users       r ON r.id = t.requester_id
    LEFT JOIN departments d ON d.id = t.department_id
    LEFT JOIN categories  c ON c.id = t.category_id
    LEFT JOIN users       a ON a.id = t.assigned_to_id
    WHERE t.id = $1
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

export async function createTicket(payload) {
  const {
    ticket_code,
    title,
    description,
    status,
    priority,
    requester_id,
    assigned_to_id,
    department_id,
    category_id,
  } = payload;

  const sql = `
    INSERT INTO tickets (
      ticket_code,
      title,
      description,
      status,
      priority,
      requester_id,
      assigned_to_id,
      department_id,
      category_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `;

  const result = await query(sql, [
    ticket_code,
    title,
    description,
    status,
    priority,
    requester_id,
    assigned_to_id,
    department_id,
    category_id,
  ]);

  return result.rows[0];
}

export async function updateTicketStatus(id, status) {
  const sql = `
    UPDATE tickets
    SET status = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await query(sql, [status, id]);
  return result.rows[0] || null;
}

export async function assignTicketToUser(ticketId, assignedToId) {
  const sql = `
    UPDATE tickets
    SET assigned_to_id = $1,
        updated_at     = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await query(sql, [assignedToId, ticketId]);
  return result.rows[0] || null;
}
export async function updateTicketByEmployee(ticketId, requesterId, data) {
  const {
    title,
    description,
    priority,
    department_id,
    category_id,
  } = data;

  const result = await query(
    `
    UPDATE tickets
    SET
      title         = $1,
      description   = $2,
      priority      = $3,
      department_id = $4,
      category_id   = $5,
      updated_at    = NOW()
    WHERE id = $6
      AND requester_id = $7
      AND status = 'NEW'
    RETURNING *
    `,
    [
      title,
      description,
      priority,
      department_id,
      category_id,
      ticketId,
      requesterId,
    ]
  );

  return result.rows[0] || null;
}

export async function updateTicketFeedback(id, rating, comment) {
  const res = await query(
    `
    UPDATE tickets
    SET feedback_rating   = $1,
        feedback_comment  = $2,
        feedback_given_at = NOW(),
        updated_at        = NOW()
    WHERE id = $3
    RETURNING *
    `,
    [rating, comment, id]
  );
  return res.rows[0] || null;
}

