import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';
import prisma from '../prisma/client.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token missing or invalid', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
}

export function authorizeProject(roles?: ('OWNER' | 'ADMIN' | 'MEMBER')[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
      }

      const projectId = req.params.projectId || req.params.id || req.body.projectId;
      if (!projectId) {
        return next(new AppError('Project ID is required', 400, 'BAD_REQUEST'));
      }

      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: req.user.userId,
          },
        },
      });

      if (!member) {
        return next(new AppError('Access denied: You are not a member of this project', 403, 'FORBIDDEN'));
      }

      if (roles && roles.length > 0 && !roles.includes(member.role as any)) {
        return next(new AppError('Insufficient project permissions', 403, 'FORBIDDEN'));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
