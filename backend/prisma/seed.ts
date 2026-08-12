import { PrismaClient, ProjectRole, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.taskLabel.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const alex = await prisma.user.create({
    data: {
      username: 'alex_dev',
      email: 'alex@devflow.io',
      passwordHash: hashedPassword,
      fullName: 'Alex Morgan',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      username: 'sarah_lead',
      email: 'sarah@devflow.io',
      passwordHash: hashedPassword,
      fullName: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  const marcus = await prisma.user.create({
    data: {
      username: 'marcus_qa',
      email: 'marcus@devflow.io',
      passwordHash: hashedPassword,
      fullName: 'Marcus Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ Demo users created.');

  // Create Projects
  const projectDevFlow = await prisma.project.create({
    data: {
      name: 'DevFlow Management Platform',
      description: 'Full-stack AI developer project tracking & real-time Kanban management system.',
      ownerId: sarah.id,
      status: 'ACTIVE',
      members: {
        create: [
          { userId: sarah.id, role: ProjectRole.OWNER },
          { userId: alex.id, role: ProjectRole.ADMIN },
          { userId: marcus.id, role: ProjectRole.MEMBER },
        ],
      },
    },
  });

  const projectCloudStorage = await prisma.project.create({
    data: {
      name: 'Cloud Storage Core Engine',
      description: 'Distributed object store with end-to-end encryption & streaming APIs.',
      ownerId: alex.id,
      status: 'ACTIVE',
      members: {
        create: [
          { userId: alex.id, role: ProjectRole.OWNER },
          { userId: sarah.id, role: ProjectRole.ADMIN },
        ],
      },
    },
  });

  console.log('✅ Demo projects created.');

  // Create Labels for DevFlow Project
  const labelBug = await prisma.label.create({
    data: { projectId: projectDevFlow.id, name: 'bug', color: '#ef4444' },
  });
  const labelFeature = await prisma.label.create({
    data: { projectId: projectDevFlow.id, name: 'feature', color: '#3b82f6' },
  });
  const labelSecurity = await prisma.label.create({
    data: { projectId: projectDevFlow.id, name: 'security', color: '#8b5cf6' },
  });
  const labelBackend = await prisma.label.create({
    data: { projectId: projectDevFlow.id, name: 'backend', color: '#10b981' },
  });
  const labelFrontend = await prisma.label.create({
    data: { projectId: projectDevFlow.id, name: 'frontend', color: '#f59e0b' },
  });
  const labelUI = await prisma.label.create({
    data: { projectId: projectDevFlow.id, name: 'ui/ux', color: '#ec4899' },
  });

  // Labels for Cloud Storage Project
  const labelPerf = await prisma.label.create({
    data: { projectId: projectCloudStorage.id, name: 'performance', color: '#f97316' },
  });
  const labelInfra = await prisma.label.create({
    data: { projectId: projectCloudStorage.id, name: 'infra', color: '#06b6d4' },
  });

  console.log('✅ Labels created.');

  // Create Tasks for DevFlow Project
  const now = new Date();
  const pastDate = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days ago (overdue)
  const futureDate1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const tasksData = [
    {
      projectId: projectDevFlow.id,
      title: 'Fix JWT Token Refresh 401 Race Condition',
      description: 'Simultaneous API calls trigger duplicate token refresh requests causing 401 unauthenticated errors. Implement request queuing for token refresh.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      assigneeId: alex.id,
      creatorId: sarah.id,
      dueDate: pastDate, // Overdue!
      position: 0,
      labels: [labelBug.id, labelBackend.id, labelSecurity.id],
    },
    {
      projectId: projectDevFlow.id,
      title: 'Implement Kanban Drag-and-Drop Reordering Persistence',
      description: 'Integrate @dnd-kit on frontend and link to PATCH /api/tasks/:id/status endpoint with optimistic updates.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: alex.id,
      creatorId: sarah.id,
      dueDate: futureDate1,
      position: 1,
      labels: [labelFeature.id, labelFrontend.id],
    },
    {
      projectId: projectDevFlow.id,
      title: 'OpenAI Prompt Parser & Structured Task Schema',
      description: 'Integrate OpenAI Chat Completions endpoint to parse user prompt into strict JSON structured task suggestions.',
      status: TaskStatus.CODE_REVIEW,
      priority: TaskPriority.HIGH,
      assigneeId: sarah.id,
      creatorId: sarah.id,
      dueDate: futureDate1,
      position: 0,
      labels: [labelFeature.id, labelBackend.id],
    },
    {
      projectId: projectDevFlow.id,
      title: 'Dark Developer Theme & Glassmorphism Design Tokens',
      description: 'Apply Linear/Vercel inspired dark palette (#09090b background, zinc cards, vibrant status badges).',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      assigneeId: alex.id,
      creatorId: sarah.id,
      dueDate: pastDate,
      position: 0,
      labels: [labelFrontend.id, labelUI.id],
    },
    {
      projectId: projectDevFlow.id,
      title: 'Database Index Optimization for Task Status Queries',
      description: 'Add composite indexes on (projectId, status) and (assigneeId) to accelerate dashboard aggregations.',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      assigneeId: alex.id,
      creatorId: alex.id,
      dueDate: null,
      position: 1,
      labels: [labelBackend.id],
    },
    {
      projectId: projectDevFlow.id,
      title: 'User Profile & Avatar Customization API',
      description: 'Allow developers to update avatar URLs and full names in user settings.',
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.LOW,
      assigneeId: null,
      creatorId: alex.id,
      dueDate: futureDate2,
      position: 0,
      labels: [labelFeature.id],
    },
    {
      projectId: projectDevFlow.id,
      title: 'Task Comment Notifications & Member Mentions',
      description: 'Parse @mentions in task comments and notify team members.',
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      assigneeId: marcus.id,
      creatorId: sarah.id,
      dueDate: futureDate2,
      position: 1,
      labels: [labelFeature.id],
    },
    {
      projectId: projectDevFlow.id,
      title: 'End-to-End Test Suite for Auth & RBAC Middleware',
      description: 'Write integration test coverage verifying project member access controls.',
      status: TaskStatus.TESTING,
      priority: TaskPriority.HIGH,
      assigneeId: marcus.id,
      creatorId: sarah.id,
      dueDate: pastDate, // Overdue!
      position: 0,
      labels: [labelSecurity.id],
    },
    {
      projectId: projectDevFlow.id,
      title: 'Dashboard Weekly Activity Aggregation Endpoint',
      description: 'Compute daily task creation and completion rates for the past 7 days for Recharts bar graph.',
      status: TaskStatus.CODE_REVIEW,
      priority: TaskPriority.MEDIUM,
      assigneeId: alex.id,
      creatorId: alex.id,
      dueDate: futureDate1,
      position: 1,
      labels: [labelBackend.id, labelFeature.id],
    },
    {
      projectId: projectDevFlow.id,
      title: 'Task Due-Date Warning Badges & Red Overdue Highlighting',
      description: 'Visually highlight tasks whose due date has passed and status is not COMPLETED.',
      status: TaskStatus.TESTING,
      priority: TaskPriority.HIGH,
      assigneeId: marcus.id,
      creatorId: sarah.id,
      dueDate: futureDate1,
      position: 1,
      labels: [labelFrontend.id, labelUI.id],
    },
  ];

  for (const t of tasksData) {
    const { labels, ...taskCore } = t;
    const task = await prisma.task.create({
      data: taskCore,
    });

    if (labels && labels.length > 0) {
      await prisma.taskLabel.createMany({
        data: labels.map((labelId) => ({ taskId: task.id, labelId })),
      });
    }

    // Add sample comments
    if (task.title.includes('JWT')) {
      await prisma.comment.createMany({
        data: [
          {
            taskId: task.id,
            authorId: sarah.id,
            content: 'I observed this failure during load testing when 5 requests fired simultaneously on page reload.',
          },
          {
            taskId: task.id,
            authorId: alex.id,
            content: 'Working on adding a mutex queue in the Axios response interceptor.',
          },
        ],
      });
    } else if (task.title.includes('Kanban')) {
      await prisma.comment.create({
        data: {
          taskId: task.id,
          authorId: marcus.id,
          content: 'The drag animation looks smooth. Make sure drop failures trigger a toast notification and restore card position.',
        },
      });
    }
  }

  // Add tasks for Cloud Storage Project
  await prisma.task.create({
    data: {
      projectId: projectCloudStorage.id,
      title: 'Optimize S3 Multipart Upload Stream Buffer',
      description: 'Reduce heap allocation during 5GB+ file stream uploads.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: alex.id,
      creatorId: alex.id,
      dueDate: futureDate1,
      position: 0,
      taskLabels: {
        create: [{ labelId: labelPerf.id }, { labelId: labelInfra.id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      projectId: projectCloudStorage.id,
      title: 'Implement AES-256 Encryption at Rest',
      description: 'Encrypt incoming binary chunks before storing to disk.',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.URGENT,
      assigneeId: sarah.id,
      creatorId: alex.id,
      dueDate: pastDate,
      position: 0,
    },
  });

  console.log('✅ Tasks & Comments seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
