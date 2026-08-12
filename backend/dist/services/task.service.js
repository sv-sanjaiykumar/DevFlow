"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const client_js_1 = __importDefault(require("../prisma/client.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const client_1 = require("@prisma/client");
class TaskService {
    static async getTasks(filters) {
        const where = {};
        if (filters.projectId) {
            where.projectId = filters.projectId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.priority) {
            where.priority = filters.priority;
        }
        if (filters.assigneeId) {
            where.assigneeId = filters.assigneeId;
        }
        if (filters.labelId) {
            where.taskLabels = {
                some: { labelId: filters.labelId },
            };
        }
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        // If no specific project ID, limit to projects user is member of
        if (!filters.projectId && filters.userId) {
            where.project = {
                members: {
                    some: { userId: filters.userId },
                },
            };
        }
        const tasks = await client_js_1.default.task.findMany({
            where,
            include: {
                assignee: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                creator: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                taskLabels: {
                    include: {
                        label: true,
                    },
                },
                _count: {
                    select: { comments: true },
                },
            },
            orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        });
        return tasks.map((task) => ({
            ...task,
            labels: task.taskLabels.map((tl) => tl.label),
        }));
    }
    static async getTaskById(taskId, userId) {
        const task = await client_js_1.default.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    include: {
                        members: true,
                    },
                },
                assignee: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                creator: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                taskLabels: {
                    include: {
                        label: true,
                    },
                },
                comments: {
                    include: {
                        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!task) {
            throw new errorHandler_js_1.AppError('Task not found', 404, 'TASK_NOT_FOUND');
        }
        const isMember = task.project.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new errorHandler_js_1.AppError('Access denied: You are not a member of this project', 403, 'FORBIDDEN');
        }
        const { taskLabels, project, ...rest } = task;
        return {
            ...rest,
            projectId: project.id,
            projectName: project.name,
            labels: taskLabels.map((tl) => tl.label),
        };
    }
    static async createTask(userId, data) {
        // Check project membership
        const member = await client_js_1.default.projectMember.findUnique({
            where: {
                projectId_userId: { projectId: data.projectId, userId },
            },
        });
        if (!member) {
            throw new errorHandler_js_1.AppError('Access denied to this project', 403, 'FORBIDDEN');
        }
        // Get highest position in status column
        const status = data.status || client_1.TaskStatus.BACKLOG;
        const maxPosTask = await client_js_1.default.task.findFirst({
            where: { projectId: data.projectId, status },
            orderBy: { position: 'desc' },
        });
        const position = maxPosTask ? maxPosTask.position + 1 : 0;
        const task = await client_js_1.default.task.create({
            data: {
                projectId: data.projectId,
                title: data.title,
                description: data.description,
                status,
                priority: data.priority || client_1.TaskPriority.MEDIUM,
                assigneeId: data.assigneeId || null,
                creatorId: userId,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                position,
            },
        });
        if (data.labelIds && data.labelIds.length > 0) {
            await client_js_1.default.taskLabel.createMany({
                data: data.labelIds.map((labelId) => ({
                    taskId: task.id,
                    labelId,
                })),
            });
        }
        return this.getTaskById(task.id, userId);
    }
    static async updateTask(taskId, userId, data) {
        const existingTask = await client_js_1.default.task.findUnique({
            where: { id: taskId },
            include: { project: { include: { members: true } } },
        });
        if (!existingTask) {
            throw new errorHandler_js_1.AppError('Task not found', 404, 'TASK_NOT_FOUND');
        }
        const isMember = existingTask.project.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new errorHandler_js_1.AppError('Access denied to this project', 403, 'FORBIDDEN');
        }
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.priority !== undefined)
            updateData.priority = data.priority;
        if (data.assigneeId !== undefined)
            updateData.assigneeId = data.assigneeId;
        if (data.dueDate !== undefined)
            updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        if (data.position !== undefined)
            updateData.position = data.position;
        await client_js_1.default.task.update({
            where: { id: taskId },
            data: updateData,
        });
        if (data.labelIds !== undefined) {
            await client_js_1.default.taskLabel.deleteMany({ where: { taskId } });
            if (data.labelIds.length > 0) {
                await client_js_1.default.taskLabel.createMany({
                    data: data.labelIds.map((labelId) => ({ taskId, labelId })),
                });
            }
        }
        return this.getTaskById(taskId, userId);
    }
    static async updateTaskStatusAndPosition(taskId, userId, status, position) {
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
        // Execute atomic status & position update in Prisma transaction
        const updated = await client_js_1.default.$transaction(async (tx) => {
            return tx.task.update({
                where: { id: taskId },
                data: {
                    status,
                    position,
                },
            });
        });
        return this.getTaskById(updated.id, userId);
    }
    static async deleteTask(taskId, userId) {
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
        await client_js_1.default.task.delete({ where: { id: taskId } });
        return { message: 'Task deleted successfully' };
    }
}
exports.TaskService = TaskService;
