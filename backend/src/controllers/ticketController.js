
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  assignTicketToUser,
  updateTicketByEmployee,
  updateTicketFeedback,
} from '../models/ticketModel.js';
import { createTicketLog, getTicketLogs } from '../models/ticketLogModel.js';
import {
  createTicketAttachment,
  getTicketAttachments,
} from '../models/ticketAttachmentModel.js';
import { createNotification } from '../services/notificationService.js';
import { query } from '../models/db.js';

const ALLOWED_STATUSES = ['NEW', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'];
const ALLOWED_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const generateTicketCode = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `ICT-${year}-${rand}`;
};

const ticketLink = (ticketId) => `/employee/tickets/${ticketId}`;

async function notifyUserSafe({ userId, title, message, linkUrl }) {
  if (!userId) return;
  try {
    await createNotification({ userId, title, message, linkUrl });
  } catch (err) {
    console.error('Notification error:', err);
  }
}

async function getAdminUserIds() {
  try {
    const res = await query(`SELECT id FROM users WHERE role = 'ADMIN'`);
    return res.rows.map((r) => r.id);
  } catch (err) {
    console.error('Failed to load admin users for notifications', err);
    return [];
  }
}

export async function listTickets(req, res, next) {
  try {
    const { status, department_id, category_id, mine, assigned } = req.query;
    const filters = { status, department_id, category_id };

    if (mine === 'true' && req.user.role === 'EMPLOYEE') {
      filters.requester_id = req.user.id;
    }
    if (assigned === 'true' && req.user.role === 'TECHNICIAN') {
      filters.assigned_to_id = req.user.id;
    }

    const tickets = await getTickets(filters);
    res.json(tickets);
  } catch (err) {
    next(err);
  }
}

export async function getTicket(req, res, next) {
  try {
    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (req.user.role === 'EMPLOYEE' && ticket.requester_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(ticket);
  } catch (err) {
    next(err);
  }
}

export async function createTicketController(req, res, next) {
  try {
    const { title, description, department_id, category_id, priority, requester_id } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const chosenPriority = ALLOWED_PRIORITIES.includes(priority) ? priority : 'MEDIUM';
    const requesterId = req.user.role === 'ADMIN' && requester_id ? requester_id : req.user.id;

    const ticket = await createTicket({
      ticket_code: generateTicketCode(),
      title,
      description,
      status: 'NEW',
      priority: chosenPriority,
      requester_id: requesterId,
      assigned_to_id: null,
      department_id,
      category_id,
    });

    await createTicketLog({
      ticket_id: ticket.id,
      created_by_id: req.user.id,
      action_type: 'CREATED',
      new_status: ticket.status,
      note: 'Ticket created',
    });

    await notifyUserSafe({
      userId: ticket.requester_id,
      title: 'Ticket created',
      message: `Your ticket ${ticket.ticket_code} was created.`,
      linkUrl: ticketLink(ticket.id),
    });

    const adminIds = await getAdminUserIds();
    await Promise.all(
      adminIds.map((adminId) =>
        notifyUserSafe({
          userId: adminId,
          title: 'New ticket created',
          message: `Ticket ${ticket.ticket_code} was created by ${
            req.user.full_name || req.user.email
          }.`,
          linkUrl: `/tickets/${ticket.id}`,
        })
      )
    );

    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
}

export async function changeTicketStatus(req, res, next) {
  try {
    const status = (req.body.status || '').toUpperCase();
    const { id } = req.params;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid ticket status' });
    }

    const existing = await getTicketById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const updated = await updateTicketStatus(id, status);

    await createTicketLog({
      ticket_id: updated.id,
      created_by_id: req.user.id,
      action_type: 'STATUS_CHANGED',
      old_status: existing.status,
      new_status: updated.status,
      note: null,
    });

    const actorName = req.user?.full_name || req.user?.email || 'System';

    await notifyUserSafe({
      userId: updated.requester_id,
      title: 'Ticket status updated',
      message: `Ticket ${updated.ticket_code} is now ${updated.status} (updated by ${actorName}).`,
      linkUrl: ticketLink(updated.id),
    });

    res.json({
      message: 'Ticket status updated successfully',
      ticket: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function assignTicket(req, res, next) {
  try {
    const { assigned_to_id } = req.body;
    const { id } = req.params;

    if (!assigned_to_id) {
      return res.status(400).json({ message: 'assigned_to_id is required' });
    }

    const existing = await getTicketById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const updated = await assignTicketToUser(id, assigned_to_id);

    await createTicketLog({
      ticket_id: updated.id,
      created_by_id: req.user.id,
      action_type: 'ASSIGNED',
      old_status: existing.status,
      new_status: updated.status,
      note: `Assigned to user ID ${assigned_to_id}`,
    });

    await notifyUserSafe({
      userId: updated.requester_id,
      title: 'Ticket assigned',
      message: `Ticket ${updated.ticket_code} was assigned to a technician.`,
      linkUrl: ticketLink(updated.id),
    });
    await notifyUserSafe({
      userId: updated.assigned_to_id,
      title: 'New ticket assigned to you',
      message: `You have been assigned to ticket ${updated.ticket_code}.`,
      linkUrl: `/technician/tickets/${updated.id}`,
    });

    res.json({
      message: 'Ticket assigned successfully',
      ticket: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function getTicketLogsController(req, res, next) {
  try {
    const { id } = req.params;
    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const logs = await getTicketLogs(id);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

export async function uploadTicketAttachmentController(req, res, next) {
  try {
    const { id } = req.params;
    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const attachment = await createTicketAttachment({
      ticket_id: ticket.id,
      uploaded_by_id: req.user.id,
      filename_original: file.originalname,
      filename_stored: file.filename,
      mime_type: file.mimetype,
      size_bytes: file.size,
    });

    await createTicketLog({
      ticket_id: ticket.id,
      created_by_id: req.user.id,
      action_type: 'ATTACHMENT_ADDED',
      note: `Attachment: ${file.originalname}`,
    });

    await notifyUserSafe({
      userId: ticket.requester_id,
      title: 'Attachment added',
      message: `An attachment was added to ticket ${ticket.ticket_code}.`,
      linkUrl: ticketLink(ticket.id),
    });
    if (ticket.assigned_to_id) {
      await notifyUserSafe({
        userId: ticket.assigned_to_id,
        title: 'Attachment added',
        message: `An attachment was added to ticket ${ticket.ticket_code}.`,
        linkUrl: `/technician/tickets/${ticket.id}`,
      });
    }

    res.status(201).json(attachment);
  } catch (err) {
    next(err);
  }
}

export async function listTicketAttachmentsController(req, res, next) {
  try {
    const { id } = req.params;
    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const attachments = await getTicketAttachments(id);
    res.json(attachments);
  } catch (err) {
    next(err);
  }
}

export async function addTicketNoteController(req, res, next) {
  try {
    const { id } = req.params;
    const { note, time_spent_minutes } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ message: 'Note is required.' });
    }

    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const user = req.user;
    if (user.role === 'TECHNICIAN' && ticket.assigned_to_id !== user.id) {
      return res.status(403).json({ message: 'You are not assigned to this ticket.' });
    }

    const log = await createTicketLog({
      ticket_id: ticket.id,
      created_by_id: user.id,
      action_type: 'NOTE_ADDED',
      note: time_spent_minutes
        ? `${note} (Time spent: ${time_spent_minutes} minutes)`
        : note,
    });

    await notifyUserSafe({
      userId: ticket.requester_id,
      title: 'New note on your ticket',
      message: `A technician added a note to ticket ${ticket.ticket_code}.`,
      linkUrl: ticketLink(ticket.id),
    });

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}

export async function updateTicketByEmployeeController(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    if (user.role !== 'EMPLOYEE') {
      return res.status(403).json({ message: 'Only employees can edit tickets here.' });
    }

    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (ticket.requester_id !== user.id) {
      return res.status(403).json({ message: 'You can only edit your own tickets.' });
    }
    if (ticket.status !== 'NEW') {
      return res.status(400).json({ message: 'You can only edit tickets while they are NEW.' });
    }

    const { title, description, priority, department_id, category_id } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const updated = await updateTicketByEmployee(id, user.id, {
      title,
      description,
      priority,
      department_id,
      category_id,
    });

    if (!updated) {
      return res.status(400).json({ message: 'Unable to update ticket.' });
    }

    await createTicketLog({
      ticket_id: updated.id,
      created_by_id: user.id,
      action_type: 'UPDATED_BY_EMPLOYEE',
      note: 'Employee updated ticket details while status was NEW.',
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function addTicketFeedbackController(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role !== 'EMPLOYEE' || ticket.requester_id !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to rate this ticket.' });
    }
    if (ticket.status !== 'RESOLVED') {
      return res
        .status(400)
        .json({ message: 'You can only rate a ticket when it is resolved.' });
    }
    if (ticket.feedback_rating) {
      return res.status(400).json({ message: 'You have already submitted feedback for this ticket.' });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    const updated = await updateTicketFeedback(id, numericRating, comment || null);

    await createTicketLog({
      ticket_id: updated.id,
      created_by_id: req.user.id,
      action_type: 'FEEDBACK_ADDED',
      note: `Employee satisfaction rating: ${numericRating}/5`,
    });

    if (updated.assigned_to_id) {
      await notifyUserSafe({
        userId: updated.assigned_to_id,
        title: 'Ticket feedback received',
        message: `Ticket ${updated.ticket_code} received a ${numericRating}/5 rating.`,
        linkUrl: `/technician/tickets/${updated.id}`,
      });
    }

    res.json({
      message: 'Thank you for your feedback.',
      ticket: updated,
    });
  } catch (err) {
    next(err);
  }
}

