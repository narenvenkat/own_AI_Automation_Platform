import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, notificationController.listNotifications);
router.put('/mark-all-read', protect, notificationController.markAllRead);
router.put('/:id/read', protect, notificationController.markRead);

export default router;
