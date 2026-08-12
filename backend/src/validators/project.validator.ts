import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    usernameOrEmail: z.string().min(1),
    role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
  }),
});

export const createLabelSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(30),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color'),
  }),
});
