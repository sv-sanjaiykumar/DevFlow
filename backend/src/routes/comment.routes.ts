import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createCommentSchema } from '../validators/comment.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/tasks/:taskId/comments', asyncHandler(CommentController.getComments));
router.post('/tasks/:taskId/comments', validateRequest(createCommentSchema), asyncHandler(CommentController.addComment));
router.delete('/comments/:id', asyncHandler(CommentController.deleteComment));

export default router;
