"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const client_js_1 = __importDefault(require("../prisma/client.js"));
const client_1 = require("@prisma/client");
class DashboardService {
    static async getDashboardStats(userId) {
        // Projects user belongs to
        const memberships = await client_js_1.default.projectMember.findMany({
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
        const totalTasks = await client_js_1.default.task.count({
            where: { projectId: { in: projectIds } },
        });
        // Completed tasks
        const completedTasks = await client_js_1.default.task.count({
            where: {
                projectId: { in: projectIds },
                status: client_1.TaskStatus.COMPLETED,
            },
        });
        // Overdue tasks (dueDate < now AND status != COMPLETED)
        const overdueTasks = await client_js_1.default.task.count({
            where: {
                projectId: { in: projectIds },
                dueDate: { lt: now },
                status: { not: client_1.TaskStatus.COMPLETED },
            },
        });
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;
        // Per-project progress
        const projects = await client_js_1.default.project.findMany({
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
            const pCompleted = p.tasks.filter((t) => t.status === client_1.TaskStatus.COMPLETED).length;
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
            const createdCount = await client_js_1.default.task.count({
                where: {
                    projectId: { in: projectIds },
                    createdAt: { gte: d, lt: nextD },
                },
            });
            const completedCount = await client_js_1.default.task.count({
                where: {
                    projectId: { in: projectIds },
                    status: client_1.TaskStatus.COMPLETED,
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
        const recentTasks = await client_js_1.default.task.findMany({
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
exports.DashboardService = DashboardService;
