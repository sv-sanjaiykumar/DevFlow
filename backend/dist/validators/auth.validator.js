"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
        fullName: zod_1.z.string().min(2, 'Full name is required'),
        avatarUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        usernameOrEmail: zod_1.z.string().min(1, 'Username or email is required'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
    }),
});
