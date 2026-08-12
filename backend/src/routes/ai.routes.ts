import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { generateTaskAISchema, confirmTaskAISchema, explainTaskAISchema } from '../validators/comment.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.post('/generate-task', validateRequest(generateTaskAISchema), asyncHandler(AIController.generateTask));
router.post('/tasks/confirm', validateRequest(confirmTaskAISchema), asyncHandler(AIController.confirmTask));
router.post('/explain-task', validateRequest(explainTaskAISchema), asyncHandler(AIController.explainTask));

export default router;
