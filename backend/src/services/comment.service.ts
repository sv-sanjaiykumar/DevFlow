import prisma from '../prisma/client.js';
import { AppError } from '../middleware/errorHandler.js';

export class CommentService {
  static async getTaskComments(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    const isMember = task.project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    return prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async addComment(taskId: string, userId: string, content: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    const isMember = task.project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    return prisma.comment.create({
      data: {
        taskId,
        authorId: userId,
        content,
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      },
    });
  }

  static async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }

    if (comment.authorId !== userId) {
      throw new AppError('You can only delete your own comments', 403, 'FORBIDDEN');
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted successfully' };
  }
}
