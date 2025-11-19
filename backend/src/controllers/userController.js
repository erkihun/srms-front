import {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
  findUserById,
} from '../models/userModel.js';

export async function listUsersController(req, res, next) {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function createUserController(req, res, next) {
  try {
    const {
      full_name,
      email,
      password,
      role,
      department_id,
      is_active,
      username,
      phone,
    } = req.body;

    if (!full_name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required.' });
    }

    const allowedRoles = ['ADMIN', 'TECHNICIAN', 'EMPLOYEE'];
    const finalRole = allowedRoles.includes(role) ? role : 'EMPLOYEE';

    const avatar_url = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : null;

    const user = await createUser({
      full_name,
      email,
      password,
      role: finalRole,
      department_id: department_id || null,
      is_active: is_active !== undefined ? is_active : true,
      username,
      phone,
      avatar_url,
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUserController(req, res, next) {
  try {
    const id = req.params.id;
    const {
      full_name,
      email,
      role,
      department_id,
      is_active,
      username,
      phone,
      password,
    } = req.body;

    const payload = {
      full_name,
      email,
      role,
      department_id: department_id || null,
      is_active,
      username,
      phone,
    };

    if (req.file) {
      payload.avatar_url = `/uploads/avatars/${req.file.filename}`;
    }

  if (password) {
    payload.password = password;
  }

    const user = await updateUser(id, payload);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deactivateUserController(req, res, next) {
  try {
    const id = req.params.id;
    const user = await deactivateUser(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function getUserByIdController(req, res, next) {
  try {
    const id = req.params.id;
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}
