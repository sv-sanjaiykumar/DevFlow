import prisma from '../prisma/client.js';
import { AppError } from '../middleware/errorHandler.js';
import { ProjectRole } from '@prisma/client';

export class ProjectService {
  static async getUserProjects(userId: string) {
    const memberships = await prisma.projectMember.findMany({
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

  static async getProjectById(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
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
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    const currentMember = project.members.find((m) => m.userId === userId);
    if (!currentMember) {
      throw new AppError('Access denied: You are not a member of this project', 403, 'FORBIDDEN');
    }

    return {
      ...project,
      currentUserRole: currentMember.role,
    };
  }

  static async createProject(userId: string, data: { name: string; description?: string; status?: string }) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || 'ACTIVE',
        ownerId: userId,
        members: {
          create: {
            userId,
            role: ProjectRole.OWNER,
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

  static async updateProject(projectId: string, userId: string, data: { name?: string; description?: string; status?: string }) {
    await this.getProjectById(projectId, userId); // verify access

    const updated = await prisma.project.update({
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

  static async deleteProject(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    if (project.ownerId !== userId) {
      throw new AppError('Only the project owner can delete the project', 403, 'FORBIDDEN');
    }

    await prisma.project.delete({ where: { id: projectId } });
    return { message: 'Project deleted successfully' };
  }

  static async addMember(projectId: string, usernameOrEmail: string, role: ProjectRole = ProjectRole.MEMBER) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!user) {
      throw new AppError('User not found with provided username or email', 404, 'USER_NOT_FOUND');
    }

    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: user.id },
      },
    });

    if (existing) {
      throw new AppError('User is already a member of this project', 400, 'ALREADY_MEMBER');
    }

    const member = await prisma.projectMember.create({
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

  static async updateMemberRole(projectId: string, memberId: string, role: ProjectRole) {
    const member = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: { select: { id: true, username: true, email: true, fullName: true, avatarUrl: true } },
      },
    });

    return member;
  }

  static async removeMember(projectId: string, memberId: string) {
    const member = await prisma.projectMember.findUnique({ where: { id: memberId } });
    if (!member || member.projectId !== projectId) {
      throw new AppError('Member not found in this project', 404, 'MEMBER_NOT_FOUND');
    }

    if (member.role === ProjectRole.OWNER) {
      throw new AppError('Cannot remove project owner', 400, 'CANNOT_REMOVE_OWNER');
    }

    await prisma.projectMember.delete({ where: { id: memberId } });
    return { message: 'Member removed successfully' };
  }

  static async getLabels(projectId: string) {
    return prisma.label.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });
  }

  static async createLabel(projectId: string, name: string, color: string) {
    const existing = await prisma.label.findUnique({
      where: {
        projectId_name: { projectId, name },
      },
    });

    if (existing) {
      throw new AppError('Label with this name already exists in project', 400, 'LABEL_EXISTS');
    }

    return prisma.label.create({
      data: { projectId, name, color },
    });
  }
}
