"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLabelSchema = exports.updateMemberRoleSchema = exports.addMemberSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
    }),
});
exports.updateProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100).optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
    }),
});
exports.addMemberSchema = zod_1.z.object({
    body: zod_1.z.object({
        usernameOrEmail: zod_1.z.string().min(1),
        role: zod_1.z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
    }),
});
exports.updateMemberRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(['OWNER', 'ADMIN', 'MEMBER']),
    }),
});
exports.createLabelSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(30),
        color: zod_1.z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color'),
    }),
});
