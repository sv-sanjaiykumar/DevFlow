import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CommentService } from '../services/comment.service.js';

export class CommentController {
  static getComments = async (req: AuthenticatedRequest, res: Response) => {
    const taskId = req.params.taskId as string;
    const comments = await CommentService.getTaskComments(taskId, req.user!.userId);
    return res.status(200).json({ comments });
  };

  static addComment = async (req: AuthenticatedRequest, res: Response) => {
    const taskId = req.params.taskId as string;
    const comment = await CommentService.addComment(taskId, req.user!.userId, req.body.content);
    return res.status(201).json({ comment });
  };

  static deleteComment = async (req: AuthenticatedRequest, res: Response) => {
    const commentId = req.params.id as string;
    const result = await CommentService.deleteComment(commentId, req.user!.userId);
    return res.status(200).json(result);
  };
}
