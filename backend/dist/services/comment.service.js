"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const client_js_1 = __importDefault(require("../prisma/client.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class CommentService {
    static async getTaskComments(taskId, userId) {
        const task = await client_js_1.default.task.findUnique({
            where: { id: taskId },
            include: { project: { include: { members: true } } },
        });
        if (!task) {
            throw new errorHandler_js_1.AppError('Task not found', 404, 'TASK_NOT_FOUND');
        }
        const isMember = task.project.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new errorHandler_js_1.AppError('Access denied', 403, 'FORBIDDEN');
        }
        return client_js_1.default.comment.findMany({
            where: { taskId },
            include: {
                author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    static async addComment(taskId, userId, content) {
        const task = await client_js_1.default.task.findUnique({
            where: { id: taskId },
            include: { project: { include: { members: true } } },
        });
        if (!task) {
            throw new errorHandler_js_1.AppError('Task not found', 404, 'TASK_NOT_FOUND');
        }
        const isMember = task.project.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new errorHandler_js_1.AppError('Access denied', 403, 'FORBIDDEN');
        }
        return client_js_1.default.comment.create({
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
    static async deleteComment(commentId, userId) {
        const comment = await client_js_1.default.comment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            throw new errorHandler_js_1.AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
        }
        if (comment.authorId !== userId) {
            throw new errorHandler_js_1.AppError('You can only delete your own comments', 403, 'FORBIDDEN');
        }
        await client_js_1.default.comment.delete({ where: { id: commentId } });
        return { message: 'Comment deleted successfully' };
    }
}
exports.CommentService = CommentService;
