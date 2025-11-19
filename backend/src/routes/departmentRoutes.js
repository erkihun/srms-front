import express from 'express';
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../models/departmentModel.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * PUBLIC: list departments
 * Used by: Register page, New Request page, etc.
 */
router.get('/', async (req, res, next) => {
  try {
    const rows = await listDepartments();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: manage departments (optional, but good to have)
 */
router.post('/', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const dep = await createDepartment(req.body);
    res.status(201).json(dep);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const dep = await updateDepartment(req.params.id, req.body);
    res.json(dep);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await deleteDepartment(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
