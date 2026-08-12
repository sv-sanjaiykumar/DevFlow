export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'CODE_REVIEW' | 'TESTING' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Label {
  id: string;
  projectId: string;
  name: string;
  color: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  ownerId: string;
  owner?: User;
  members?: ProjectMember[];
  labels?: Label[];
  currentUserRole?: ProjectRole;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  assignee?: User | null;
  creatorId: string;
  creator?: User;
  dueDate?: string | null;
  position: number;
  labels: Label[];
  comments?: TaskComment[];
  _count?: {
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  projectProgress: Array<{
    id: string;
    name: string;
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  }>;
  weeklyActivity: Array<{
    date: string;
    dayName: string;
    createdCount: number;
    completedCount: number;
  }>;
  recentTasks: Task[];
}

export interface AIGeneratedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  suggestedLabels: string[];
  possibleCauses: string[];
  nextSteps: string[];
}

export interface AIExplanation {
  summary: string;
  overview: string;
  keyObjectives: string[];
  recommendedApproach: string;
}
