import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().min(1),
    title: z.string().min(2).max(200),
    description: z.string().optional(),
    status: z.enum(['BACKLOG', 'IN_PROGRESS', 'CODE_REVIEW', 'TESTING', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assigneeId: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    labelIds: z.array(z.string()).optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200).optional(),
    description: z.string().nullable().optional(),
    status: z.enum(['BACKLOG', 'IN_PROGRESS', 'CODE_REVIEW', 'TESTING', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assigneeId: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    position: z.number().int().optional(),
    labelIds: z.array(z.string()).optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['BACKLOG', 'IN_PROGRESS', 'CODE_REVIEW', 'TESTING', 'COMPLETED']),
    position: z.number().int().default(0),
  }),
});
