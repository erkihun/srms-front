import { Router } from 'express';
import { login, getMe, registerEmployee } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/register-employee', registerEmployee);

export default router;
