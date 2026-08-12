import prisma from '../prisma/client.js';
import { AppError } from '../middleware/errorHandler.js';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class TaskService {
  static async getTasks(filters: {
    projectId?: string;
    userId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    labelId?: string;
    search?: string;
  }) {
    const where: any = {};

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

    const tasks = await prisma.task.findMany({
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

  static async getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
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
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    const isMember = task.project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new AppError('Access denied: You are not a member of this project', 403, 'FORBIDDEN');
    }

    const { taskLabels, project, ...rest } = task;
    return {
      ...rest,
      projectId: project.id,
      projectName: project.name,
      labels: taskLabels.map((tl) => tl.label),
    };
  }

  static async createTask(
    userId: string,
    data: {
      projectId: string;
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string | null;
      dueDate?: string | null;
      labelIds?: string[];
    }
  ) {
    // Check project membership
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: data.projectId, userId },
      },
    });

    if (!member) {
      throw new AppError('Access denied to this project', 403, 'FORBIDDEN');
    }

    // Get highest position in status column
    const status = data.status || TaskStatus.BACKLOG;
    const maxPosTask = await prisma.task.findFirst({
      where: { projectId: data.projectId, status },
      orderBy: { position: 'desc' },
    });

    const position = maxPosTask ? maxPosTask.position + 1 : 0;

    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        status,
        priority: data.priority || TaskPriority.MEDIUM,
        assigneeId: data.assigneeId || null,
        creatorId: userId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        position,
      },
    });

    if (data.labelIds && data.labelIds.length > 0) {
      await prisma.taskLabel.createMany({
        data: data.labelIds.map((labelId) => ({
          taskId: task.id,
          labelId,
        })),
      });
    }

    return this.getTaskById(task.id, userId);
  }

  static async updateTask(
    taskId: string,
    userId: string,
    data: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string | null;
      dueDate?: string | null;
      position?: number;
      labelIds?: string[];
    }
  ) {
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });

    if (!existingTask) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    const isMember = existingTask.project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new AppError('Access denied to this project', 403, 'FORBIDDEN');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.position !== undefined) updateData.position = data.position;

    await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    if (data.labelIds !== undefined) {
      await prisma.taskLabel.deleteMany({ where: { taskId } });
      if (data.labelIds.length > 0) {
        await prisma.taskLabel.createMany({
          data: data.labelIds.map((labelId) => ({ taskId, labelId })),
        });
      }
    }

    return this.getTaskById(taskId, userId);
  }

  static async updateTaskStatusAndPosition(
    taskId: string,
    userId: string,
    status: TaskStatus,
    position: number
  ) {
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

    // Execute atomic status & position update in Prisma transaction
    const updated = await prisma.$transaction(async (tx) => {
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

  static async deleteTask(taskId: string, userId: string) {
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

    await prisma.task.delete({ where: { id: taskId } });
    return { message: 'Task deleted successfully' };
  }
}
