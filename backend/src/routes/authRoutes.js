import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshTokens,
  getMe,
  updateMe,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { registerValidator, loginValidator, changePasswordValidator } from '../validators/authValidator.js';

const router = Router();

// Public
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/refresh', refreshTokens);

// Explicit preflight handlers for public endpoints
router.options('/login', (req, res) => res.status(204).end());
router.options('/register', (req, res) => res.status(204).end());
router.options('/refresh', (req, res) => res.status(204).end());

// Protected
router.use(authenticate);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/change-password', changePasswordValidator, changePassword);

export default router;
