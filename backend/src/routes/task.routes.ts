import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../validators/task.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(TaskController.getTasks));
router.post('/', validateRequest(createTaskSchema), asyncHandler(TaskController.createTask));
router.get('/:id', asyncHandler(TaskController.getTask));
router.patch('/:id', validateRequest(updateTaskSchema), asyncHandler(TaskController.updateTask));
router.patch('/:id/status', validateRequest(updateTaskStatusSchema), asyncHandler(TaskController.updateTaskStatus));
router.delete('/:id', asyncHandler(TaskController.deleteTask));

export default router;
