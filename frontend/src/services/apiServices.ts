import { api } from './api';
import { User, Project, Task, DashboardStats, AIGeneratedTask, AIExplanation, ProjectRole, TaskStatus, TaskPriority, Label, ProjectMember } from '../types';

export const authApi = {
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  login: async (data: any) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  logout: async (refreshToken: string) => {
    const res = await api.post('/auth/logout', { refreshToken });
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data.user as User;
  },
};

export const projectApi = {
  getProjects: async () => {
    const res = await api.get('/projects');
    return res.data.projects as Project[];
  },
  getProject: async (id: string) => {
    const res = await api.get(`/projects/${id}`);
    return res.data.project as Project;
  },
  createProject: async (data: { name: string; description?: string }) => {
    const res = await api.post('/projects', data);
    return res.data.project as Project;
  },
  updateProject: async (id: string, data: { name?: string; description?: string; status?: string }) => {
    const res = await api.patch(`/projects/${id}`, data);
    return res.data.project as Project;
  },
  deleteProject: async (id: string) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
  addMember: async (projectId: string, usernameOrEmail: string, role: ProjectRole) => {
    const res = await api.post(`/projects/${projectId}/members`, { usernameOrEmail, role });
    return res.data.member as ProjectMember;
  },
  updateMemberRole: async (projectId: string, memberId: string, role: ProjectRole) => {
    const res = await api.patch(`/projects/${projectId}/members/${memberId}`, { role });
    return res.data.member as ProjectMember;
  },
  removeMember: async (projectId: string, memberId: string) => {
    const res = await api.delete(`/projects/${projectId}/members/${memberId}`);
    return res.data;
  },
  createLabel: async (projectId: string, name: string, color: string) => {
    const res = await api.post(`/projects/${projectId}/labels`, { name, color });
    return res.data.label as Label;
  },
};

export const taskApi = {
  getTasks: async (params?: {
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    labelId?: string;
    search?: string;
  }) => {
    const res = await api.get('/tasks', { params });
    return res.data.tasks as Task[];
  },
  getTask: async (id: string) => {
    const res = await api.get(`/tasks/${id}`);
    return res.data.task as Task;
  },
  createTask: async (data: {
    projectId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string | null;
    dueDate?: string | null;
    labelIds?: string[];
  }) => {
    const res = await api.post('/tasks', data);
    return res.data.task as Task;
  },
  updateTask: async (id: string, data: Partial<Task> & { labelIds?: string[] }) => {
    const res = await api.patch(`/tasks/${id}`, data);
    return res.data.task as Task;
  },
  updateTaskStatus: async (id: string, status: TaskStatus, position: number) => {
    const res = await api.patch(`/tasks/${id}/status`, { status, position });
    return res.data.task as Task;
  },
  deleteTask: async (id: string) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
  addComment: async (taskId: string, content: string) => {
    const res = await api.post(`/tasks/${taskId}/comments`, { content });
    return res.data.comment;
  },
  deleteComment: async (commentId: string) => {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  },
};

export const dashboardApi = {
  getStats: async () => {
    const res = await api.get('/dashboard');
    return res.data as DashboardStats;
  },
};

export const aiApi = {
  generateTask: async (prompt: string, projectId: string) => {
    const res = await api.post('/ai/generate-task', { prompt, projectId });
    return res.data.result as AIGeneratedTask;
  },
  confirmTask: async (data: {
    projectId: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    suggestedLabels?: string[];
  }) => {
    const res = await api.post('/ai/tasks/confirm', data);
    return res.data.task as Task;
  },
  explainTask: async (params: { taskId?: string; title?: string; description?: string }) => {
    const res = await api.post('/ai/explain-task', params);
    return res.data.result as AIExplanation;
  },
};
