import express from 'express';
import { body } from 'express-validator';
import * as integrationController from '../controllers/integrationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/', protect, integrationController.listIntegrations);
router.get('/status', protect, integrationController.getStatus);
router.get('/oauth/:provider/start', protect, integrationController.startOAuth);
router.get('/oauth/:provider/callback', integrationController.handleOAuthCallback);

router.post(
  '/',
  protect,
  [
    body('provider').isIn(['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini']).withMessage('Valid provider required'),
    body('credentials').notEmpty().withMessage('Credentials object required'),
  ],
  validateRequest,
  integrationController.saveManualIntegration
);

router.delete('/:provider', protect, integrationController.disconnect);
router.post('/:provider/test', protect, integrationController.testAction);

export default router;
