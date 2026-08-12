"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainTaskAISchema = exports.confirmTaskAISchema = exports.generateTaskAISchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Comment content cannot be empty'),
    }),
});
exports.generateTaskAISchema = zod_1.z.object({
    body: zod_1.z.object({
        prompt: zod_1.z.string().min(5, 'Prompt must be at least 5 characters long'),
        projectId: zod_1.z.string().min(1, 'Project ID is required'),
    }),
});
exports.confirmTaskAISchema = zod_1.z.object({
    body: zod_1.z.object({
        projectId: zod_1.z.string().min(1),
        title: zod_1.z.string().min(2),
        description: zod_1.z.string().optional(),
        priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
        suggestedLabels: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.explainTaskAISchema = zod_1.z.object({
    body: zod_1.z.object({
        taskId: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
    }),
});
