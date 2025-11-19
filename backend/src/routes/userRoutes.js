import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import {
  listUsersController,
  createUserController,
  updateUserController,
  deactivateUserController,
  getUserByIdController,
} from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

const baseUploadDir = path.join(process.cwd(), 'uploads');
const avatarsDir = path.join(baseUploadDir, 'avatars');
fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const base = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, base + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'), false);
    }
    cb(null, true);
  },
});

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: admin only.' });
}

function requireSelfOrAdmin(req, res, next) {
  const targetId = String(req.params.id);
  const userId = String(req.user?.id || '');

  if (req.user?.role === 'ADMIN' || userId === targetId) {
    return next();
  }
  return res
    .status(403)
    .json({ message: 'Forbidden: you can only access your own profile.' });
}

router.use(authenticate);

router.get('/', requireAdmin, listUsersController);
router.post('/', requireAdmin, upload.single('avatar'), createUserController);
router.delete('/:id', requireAdmin, deactivateUserController);

router.get('/:id', requireSelfOrAdmin, getUserByIdController);
router.put('/:id', requireSelfOrAdmin, upload.single('avatar'), updateUserController);

export default router;

