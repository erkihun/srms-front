import {
  listTasks,
  findTaskById,
  createTask,
  updateTask,
  deleteTask,
  normalizePriority,
  normalizeStatus,
  addTaskProgress,
  listTaskProgress,
  updateTaskProgressAdminComment,
} from '../models/taskModel.js';
import { createNotification } from '../services/notificationService.js';
import { query } from '../models/db.js';

const ALLOWED_STATUS = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
const ALLOWED_PRIORITY = ['LOW', 'MEDIUM', 'HIGH'];

async function getAdminUserIds() {
  try {
    const res = await query(`SELECT id FROM users WHERE role = 'ADMIN'`);
    return res.rows.map((r) => r.id);
  } catch (err) {
    console.error('Failed to load admins for task notifications:', err);
    return [];
  }
}

async function notifyUserSafe({ userId, title, message, linkUrl }) {
  if (!userId) return;
  try {
    await createNotification({ userId, title, message, linkUrl });
  } catch (err) {
    console.error('Task notification error:', err);
  }
}

export async function listTasksController(req, res, next) {
  try {
    const { status, assigned_to } = req.query;
    const filters = {};

    if (status) {
      const normalized = status.toUpperCase();
      if (ALLOWED_STATUS.includes(normalized)) filters.status = normalized;
    }
    if (assigned_to) filters.assigned_to = Number(assigned_to);

    const tasks = await listTasks(filters);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getTaskByIdController(req, res, next) {
  try {
    const task = await findTaskById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function createTaskController(req, res, next) {
  try {
    const {
      title,
      description,
      status,
      priority,
      assigned_to,
      due_date,
      technician_note,
      technician_rating,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const task = await createTask({
      title: title.trim(),
      description: description ?? null,
      status: status ? status.toUpperCase() : 'OPEN',
      priority: priority ? priority.toUpperCase() : 'MEDIUM',
      assigned_to: assigned_to ? Number(assigned_to) : null,
      created_by: req.user?.id || null,
      due_date: due_date || null,
      technician_note: technician_note || null,
      technician_rating: technician_rating || null,
    });

    if (task.assigned_to) {
      await notifyUserSafe({
        userId: task.assigned_to,
        title: 'New task assigned to you',
        message: `Task "${task.title}" has been assigned to you.`,
        linkUrl: `/technician/tasks/${task.id}`,
      });
    }

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

/**
 * UPDATE TASK
 * - ADMIN: can update everything (title, desc, status, priority, assignee, due_date, technician_note, technician_rating)
 * - TECHNICIAN: can only update status + technician_note on tasks assigned to them
 *   and each change is stored as a progress record
 */
export async function updateTaskController(req, res, next) {
  try {
    const id = req.params.id;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      title,
      description,
      status,
      priority,
      assigned_to,
      due_date,
      technician_note,
      technician_rating,
    } = req.body;

    if (currentUser.role === 'ADMIN') {
      const payload = {
        title,
        description,
        status: status !== undefined ? status.toUpperCase() : undefined,
        priority: priority !== undefined ? priority.toUpperCase() : undefined,
        assigned_to: assigned_to !== undefined ? Number(assigned_to) || null : undefined,
        due_date: due_date !== undefined ? due_date || null : undefined,
        technician_note,
        technician_rating: technician_rating !== undefined ? technician_rating || null : undefined,
      };

      const task = await updateTask(id, payload);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const statusOrNoteChanged = status !== undefined || technician_note !== undefined;
      if (statusOrNoteChanged) {
        await addTaskProgress({
          task_id: Number(id),
          technician_id: null,
          status: payload.status || task.status,
          note: technician_note || null,
        });
      }

      if (assigned_to !== undefined && task.assigned_to) {
        await notifyUserSafe({
          userId: task.assigned_to,
          title: 'Task assigned/updated',
          message: `Task "${task.title}" has been assigned or updated.`,
          linkUrl: `/technician/tasks/${task.id}`,
        });
      }

      if (statusOrNoteChanged) {
        const adminIds = await getAdminUserIds();
        await Promise.all(
          adminIds.map((adminId) =>
            notifyUserSafe({
              userId: adminId,
              title: 'Task updated',
              message: `Task "${task.title}" was updated (status or note).`,
              linkUrl: `/tasks/${task.id}`,
            })
          )
        );
      }

      return res.json(task);
    }

    if (currentUser.role === 'TECHNICIAN') {
      const existing = await findTaskById(id);
      if (!existing) return res.status(404).json({ message: 'Task not found' });
      if (existing.assigned_to !== currentUser.id) {
        return res.status(403).json({ message: 'Not allowed to update this task.' });
      }

      const payload = {};
      let finalStatus = existing.status;

      if (status !== undefined) {
        finalStatus = status.toUpperCase();
        payload.status = finalStatus;
      }
      if (technician_note !== undefined) {
        payload.technician_note = technician_note;
      }

      if (!Object.keys(payload).length) {
        return res.json(existing);
      }

      const task = await updateTask(id, payload);

      await addTaskProgress({
        task_id: Number(id),
        technician_id: currentUser.id,
        status: finalStatus,
        note: technician_note || null,
      });

      const adminIds = await getAdminUserIds();
      await Promise.all(
        adminIds.map((adminId) =>
          notifyUserSafe({
            userId: adminId,
            title: 'Task progress updated',
            message: `Task "${task.title}" was updated by a technician.`,
            linkUrl: `/tasks/${task.id}`,
          })
        )
      );

      return res.json(task);
    }

    return res.status(403).json({ message: 'Not allowed to update this task.' });
  } catch (err) {
    next(err);
  }
}

export async function deleteTaskController(req, res, next) {
  try {
    const deleted = await deleteTask(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function getTaskProgressController(req, res, next) {
  try {
    const id = req.params.id;
    const task = await findTaskById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const history = await listTaskProgress(id);
    res.json(history);
  } catch (err) {
    next(err);
  }
}

/**
 * Admin adds/updates comment on a specific progress entry
 * PUT /tasks/:id/progress/:progressId/admin-comment
 */
export async function updateTaskProgressAdminCommentController(req, res, next) {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ message: 'Only admin can comment on progress.' });
    }

    const { id: taskId, progressId } = req.params;
    const { admin_comment } = req.body;

    const task = await findTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updated = await updateTaskProgressAdminComment(
      progressId,
      currentUser.id,
      admin_comment
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: 'Progress entry not found' });
    }

    if (task.assigned_to) {
      await notifyUserSafe({
        userId: task.assigned_to,
        title: 'Admin commented on task progress',
        message: `A new admin comment was added on task "${task.title}".`,
        linkUrl: `/technician/tasks/${task.id}`,
      });
    }

    return res.json(updated);
  } catch (err) {
    next(err);
  }
}
