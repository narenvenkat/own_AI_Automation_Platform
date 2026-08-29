import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email address is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['admin', 'operator']).withMessage('Role must be either admin or operator'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email address is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', authLimiter, registerValidation, validateRequest, authController.register);
router.post('/login', authLimiter, loginValidation, validateRequest, authController.login);
router.get('/me', protect, authController.getMe);

export default router;
