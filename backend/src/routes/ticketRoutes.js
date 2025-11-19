import express from 'express';
import {
  listTickets,
  getTicket,
  createTicketController,
  changeTicketStatus,
  assignTicket,
  getTicketLogsController,
  uploadTicketAttachmentController,
  listTicketAttachmentsController,
  addTicketNoteController,
  updateTicketByEmployeeController,
  addTicketFeedbackController,
} from '../controllers/ticketController.js';
import uploadMiddleware from '../middlewares/uploadMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/', requireAuth, listTickets);
router.get('/:id', requireAuth, getTicket);

router.post('/', requireAuth, createTicketController);

router.patch('/:id/status', requireAuth, changeTicketStatus);

router.patch(
  '/:id/assign',
  requireAuth,
  requireRole('ADMIN'),
  assignTicket
);

router.get('/:id/logs', requireAuth, getTicketLogsController);

router.post(
  '/:id/attachments',
  requireAuth,
  uploadMiddleware.single('file'),
  uploadTicketAttachmentController
);
router.get('/:id/attachments', requireAuth, listTicketAttachmentsController);

router.post('/:id/notes', requireAuth, addTicketNoteController);

router.patch(
  '/:id/employee-update',
  requireAuth,
  requireRole('EMPLOYEE'),
  updateTicketByEmployeeController
);

router.post('/:id/feedback', requireAuth, addTicketFeedbackController);


export default router;

