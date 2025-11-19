import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';
import {
  listTasksController,
  getTaskByIdController,
  createTaskController,
  updateTaskController,
  deleteTaskController,
  getTaskProgressController,
  updateTaskProgressAdminCommentController,
} from '../controllers/taskController.js';

const router = Router();

router.use(authenticate);

router.get('/', listTasksController);
router.get('/:id', getTaskByIdController);
router.get('/:id/progress', getTaskProgressController);

router.post('/', requireRole('ADMIN'), createTaskController);
router.put('/:id', updateTaskController);
router.delete('/:id', requireRole('ADMIN'), deleteTaskController);

router.put(
  '/:id/progress/:progressId/admin-comment',
  requireRole('ADMIN'),
  updateTaskProgressAdminCommentController
);

export default router;
