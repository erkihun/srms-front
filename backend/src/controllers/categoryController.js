import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../models/categoryModel.js';

export async function listCategoriesController(req, res, next) {
  try {
    const cats = await listCategories();
    res.json(cats);
  } catch (err) {
    next(err);
  }
}

export async function createCategoryController(req, res, next) {
  try {
    const { name, description, is_active } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    const cat = await createCategory({ name, description, is_active });
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
}

export async function updateCategoryController(req, res, next) {
  try {
    const id = req.params.id;
    const { name, description, is_active } = req.body;
    const cat = await updateCategory(id, { name, description, is_active });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategoryController(req, res, next) {
  try {
    const id = req.params.id;
    await deleteCategory(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
