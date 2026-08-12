import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment content cannot be empty'),
  }),
});

export const generateTaskAISchema = z.object({
  body: z.object({
    prompt: z.string().min(5, 'Prompt must be at least 5 characters long'),
    projectId: z.string().min(1, 'Project ID is required'),
  }),
});

export const confirmTaskAISchema = z.object({
  body: z.object({
    projectId: z.string().min(1),
    title: z.string().min(2),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    suggestedLabels: z.array(z.string()).optional(),
  }),
});

export const explainTaskAISchema = z.object({
  body: z.object({
    taskId: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});
