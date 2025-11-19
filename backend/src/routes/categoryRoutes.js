import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../models/categoryModel.js';

const router = express.Router();

/**
 * GET /api/categories
 * Any authenticated user can see categories.
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const rows = await listCategories();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * Admin CRUD (optional)
 */
router.post('/', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const cat = await createCategory(req.body);
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const cat = await updateCategory(req.params.id, req.body);
    res.json(cat);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await deleteCategory(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
