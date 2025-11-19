import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByEmail, findUserById, createUser } from '../models/userModel.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      is_active: user.is_active
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    res.json({ token, user: payload });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const full = await findUserById(req.user.id);
    res.json(full || req.user);
  } catch (err) {
    next(err);
  }
}

export async function registerEmployee(req, res, next) {
  try {
    const { full_name, email, password } = req.body || {};

    if (!full_name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Full name, email, and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const user = await createUser({
      full_name,
      email,
      password,
      role: 'EMPLOYEE',
      is_active: true
    });

    const payload = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      is_active: user.is_active
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    return res.status(201).json({
      message: 'Employee account created successfully.',
      token,
      user: payload
    });
  } catch (err) {
    console.error('Register employee error:', err);
    next(err);
  }
}
