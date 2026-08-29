import express from 'express';
import * as executionController from '../controllers/executionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, executionController.listExecutions);
router.get('/:id', protect, executionController.getExecutionById);
router.get('/:id/timeline', protect, executionController.getTimeline);
router.post('/:id/pause', protect, executionController.pauseExecution);
router.post('/:id/resume', protect, executionController.resumeExecution);
router.post('/:id/cancel', protect, executionController.cancelExecution);

export default router;
