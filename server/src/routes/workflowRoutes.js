import express from 'express';
import { body } from 'express-validator';
import * as workflowController from '../controllers/workflowController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, workflowController.getDashboardStats);
router.get('/', protect, workflowController.listWorkflows);

router.post(
  '/',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
    body('nodes').optional().isArray(),
    body('edges').optional().isArray(),
  ],
  validateRequest,
  workflowController.createWorkflow
);

router.post(
  '/generate',
  protect,
  [body('prompt').trim().notEmpty().withMessage('Natural language prompt is required')],
  validateRequest,
  workflowController.generateWorkflow
);

router.get('/:id', protect, workflowController.getWorkflowById);
router.put('/:id', protect, workflowController.updateWorkflow);
router.post('/:id/duplicate', protect, workflowController.duplicateWorkflow);
router.post('/:id/execute', protect, workflowController.executeWorkflow);
router.delete('/:id', protect, workflowController.deleteWorkflow);

export default router;
