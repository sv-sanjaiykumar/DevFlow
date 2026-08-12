import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), asyncHandler(AuthController.register));
router.post('/login', authLimiter, validateRequest(loginSchema), asyncHandler(AuthController.login));
router.post('/refresh', validateRequest(refreshTokenSchema), asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));
router.get('/me', authenticate, asyncHandler(AuthController.me));

export default router;
