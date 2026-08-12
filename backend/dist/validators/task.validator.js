"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatusSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        projectId: zod_1.z.string().min(1),
        title: zod_1.z.string().min(2).max(200),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['BACKLOG', 'IN_PROGRESS', 'CODE_REVIEW', 'TESTING', 'COMPLETED']).optional(),
        priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        assigneeId: zod_1.z.string().nullable().optional(),
        dueDate: zod_1.z.string().nullable().optional(),
        labelIds: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updateTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(2).max(200).optional(),
        description: zod_1.z.string().nullable().optional(),
        status: zod_1.z.enum(['BACKLOG', 'IN_PROGRESS', 'CODE_REVIEW', 'TESTING', 'COMPLETED']).optional(),
        priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        assigneeId: zod_1.z.string().nullable().optional(),
        dueDate: zod_1.z.string().nullable().optional(),
        position: zod_1.z.number().int().optional(),
        labelIds: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updateTaskStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['BACKLOG', 'IN_PROGRESS', 'CODE_REVIEW', 'TESTING', 'COMPLETED']),
        position: zod_1.z.number().int().default(0),
    }),
});
