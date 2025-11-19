import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../models/departmentModel.js';

export async function listDepartmentsController(req, res, next) {
  try {
    const deps = await listDepartments();
    res.json(deps);
  } catch (err) {
    next(err);
  }
}

export async function createDepartmentController(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    const dep = await createDepartment({ name, description });
    res.status(201).json(dep);
  } catch (err) {
    next(err);
  }
}

export async function updateDepartmentController(req, res, next) {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    const dep = await updateDepartment(id, { name, description });
    if (!dep) return res.status(404).json({ message: 'Department not found' });
    res.json(dep);
  } catch (err) {
    next(err);
  }
}

export async function deleteDepartmentController(req, res, next) {
  try {
    const id = req.params.id;
    await deleteDepartment(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
