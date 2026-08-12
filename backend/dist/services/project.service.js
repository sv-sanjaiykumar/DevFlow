"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const client_js_1 = __importDefault(require("../prisma/client.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const client_1 = require("@prisma/client");
class ProjectService {
    static async getUserProjects(userId) {
        const memberships = await client_js_1.default.projectMember.findMany({
            where: { userId },
            include: {
                project: {
                    include: {
                        owner: {
                            select: { id: true, username: true, fullName: true, avatarUrl: true },
                        },
                        members: {
                            include: {
                                user: {
                                    select: { id: true, username: true, fullName: true, avatarUrl: true },
                                },
                            },
                        },
                        _count: {
                            select: { tasks: true, members: true },
                        },
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        });
        return memberships.map((m) => ({
            ...m.project,
            currentUserRole: m.role,
        }));
    }
    static async getProjectById(projectId, userId) {
        const project = await client_js_1.default.project.findUnique({
            where: { id: projectId },
            include: {
                owner: {
                    select: { id: true, username: true, fullName: true, avatarUrl: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, username: true, email: true, fullName: true, avatarUrl: true },
                        },
                    },
                },
                labels: true,
                _count: {
                    select: { tasks: true },
                },
            },
        });
        if (!project) {
            throw new errorHandler_js_1.AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }
        const currentMember = project.members.find((m) => m.userId === userId);
        if (!currentMember) {
            throw new errorHandler_js_1.AppError('Access denied: You are not a member of this project', 403, 'FORBIDDEN');
        }
        return {
            ...project,
            currentUserRole: currentMember.role,
        };
    }
    static async createProject(userId, data) {
        const project = await client_js_1.default.project.create({
            data: {
                name: data.name,
                description: data.description,
                status: data.status || 'ACTIVE',
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: client_1.ProjectRole.OWNER,
                    },
                },
                labels: {
                    createMany: {
                        data: [
                            { name: 'bug', color: '#ef4444' },
                            { name: 'feature', color: '#3b82f6' },
                            { name: 'enhancement', color: '#10b981' },
                            { name: 'documentation', color: '#8b5cf6' },
                        ],
                    },
                },
            },
            include: {
                owner: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                members: {
                    include: { user: { select: { id: true, username: true, fullName: true, avatarUrl: true } } },
                },
                labels: true,
            },
        });
        return project;
    }
    static async updateProject(projectId, userId, data) {
        await this.getProjectById(projectId, userId); // verify access
        const updated = await client_js_1.default.project.update({
            where: { id: projectId },
            data,
            include: {
                owner: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
                members: {
                    include: { user: { select: { id: true, username: true, fullName: true, avatarUrl: true } } },
                },
            },
        });
        return updated;
    }
    static async deleteProject(projectId, userId) {
        const project = await client_js_1.default.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new errorHandler_js_1.AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
        }
        if (project.ownerId !== userId) {
            throw new errorHandler_js_1.AppError('Only the project owner can delete the project', 403, 'FORBIDDEN');
        }
        await client_js_1.default.project.delete({ where: { id: projectId } });
        return { message: 'Project deleted successfully' };
    }
    static async addMember(projectId, usernameOrEmail, role = client_1.ProjectRole.MEMBER) {
        const user = await client_js_1.default.user.findFirst({
            where: {
                OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            },
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('User not found with provided username or email', 404, 'USER_NOT_FOUND');
        }
        const existing = await client_js_1.default.projectMember.findUnique({
            where: {
                projectId_userId: { projectId, userId: user.id },
            },
        });
        if (existing) {
            throw new errorHandler_js_1.AppError('User is already a member of this project', 400, 'ALREADY_MEMBER');
        }
        const member = await client_js_1.default.projectMember.create({
            data: {
                projectId,
                userId: user.id,
                role,
            },
            include: {
                user: { select: { id: true, username: true, email: true, fullName: true, avatarUrl: true } },
            },
        });
        return member;
    }
    static async updateMemberRole(projectId, memberId, role) {
        const member = await client_js_1.default.projectMember.update({
            where: { id: memberId },
            data: { role },
            include: {
                user: { select: { id: true, username: true, email: true, fullName: true, avatarUrl: true } },
            },
        });
        return member;
    }
    static async removeMember(projectId, memberId) {
        const member = await client_js_1.default.projectMember.findUnique({ where: { id: memberId } });
        if (!member || member.projectId !== projectId) {
            throw new errorHandler_js_1.AppError('Member not found in this project', 404, 'MEMBER_NOT_FOUND');
        }
        if (member.role === client_1.ProjectRole.OWNER) {
            throw new errorHandler_js_1.AppError('Cannot remove project owner', 400, 'CANNOT_REMOVE_OWNER');
        }
        await client_js_1.default.projectMember.delete({ where: { id: memberId } });
        return { message: 'Member removed successfully' };
    }
    static async getLabels(projectId) {
        return client_js_1.default.label.findMany({
            where: { projectId },
            orderBy: { name: 'asc' },
        });
    }
    static async createLabel(projectId, name, color) {
        const existing = await client_js_1.default.label.findUnique({
            where: {
                projectId_name: { projectId, name },
            },
        });
        if (existing) {
            throw new errorHandler_js_1.AppError('Label with this name already exists in project', 400, 'LABEL_EXISTS');
        }
        return client_js_1.default.label.create({
            data: { projectId, name, color },
        });
    }
}
exports.ProjectService = ProjectService;
