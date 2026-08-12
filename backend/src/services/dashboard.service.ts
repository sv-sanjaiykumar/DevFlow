import prisma from '../prisma/client.js';
import { TaskStatus } from '@prisma/client';

export class DashboardService {
  static async getDashboardStats(userId: string) {
    // Projects user belongs to
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    const projectIds = memberships.map((m) => m.projectId);

    const totalProjects = projectIds.length;

    if (totalProjects === 0) {
      return {
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        completionPercentage: 0,
        projectProgress: [],
        weeklyActivity: [],
        recentTasks: [],
      };
    }

    const now = new Date();

    // Total tasks in user's projects
    const totalTasks = await prisma.task.count({
      where: { projectId: { in: projectIds } },
    });

    // Completed tasks
    const completedTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: TaskStatus.COMPLETED,
      },
    });

    // Overdue tasks (dueDate < now AND status != COMPLETED)
    const overdueTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        dueDate: { lt: now },
        status: { not: TaskStatus.COMPLETED },
      },
    });

    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

    // Per-project progress
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        name: true,
        tasks: {
          select: { status: true },
        },
      },
    });

    const projectProgress = projects.map((p) => {
      const pTotal = p.tasks.length;
      const pCompleted = p.tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
      const pProgress = pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0;
      return {
        id: p.id,
        name: p.name,
        totalTasks: pTotal,
        completedTasks: pCompleted,
        progressPercentage: pProgress,
      };
    });

    // Weekly activity (last 7 days)
    const weeklyActivity = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const createdCount = await prisma.task.count({
        where: {
          projectId: { in: projectIds },
          createdAt: { gte: d, lt: nextD },
        },
      });

      const completedCount = await prisma.task.count({
        where: {
          projectId: { in: projectIds },
          status: TaskStatus.COMPLETED,
          updatedAt: { gte: d, lt: nextD },
        },
      });

      weeklyActivity.push({
        date: d.toISOString().split('T')[0],
        dayName: days[d.getDay()],
        createdCount,
        completedCount,
      });
    }

    // Recent tasks
    const recentTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        taskLabels: { include: { label: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 6,
    });

    const formattedRecentTasks = recentTasks.map((t) => ({
      ...t,
      labels: t.taskLabels.map((tl) => tl.label),
    }));

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      completionPercentage,
      projectProgress,
      weeklyActivity,
      recentTasks: formattedRecentTasks,
    };
  }
}
