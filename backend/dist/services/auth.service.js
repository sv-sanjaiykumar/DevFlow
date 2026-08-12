"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_js_1 = __importDefault(require("../prisma/client.js"));
const password_js_1 = require("../utils/password.js");
const jwt_js_1 = require("../utils/jwt.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class AuthService {
    static async register(data) {
        const existingUser = await client_js_1.default.user.findFirst({
            where: {
                OR: [{ username: data.username }, { email: data.email }],
            },
        });
        if (existingUser) {
            throw new errorHandler_js_1.AppError('Username or email already in use', 400, 'USER_EXISTS');
        }
        const passwordHash = await (0, password_js_1.hashPassword)(data.password);
        const user = await client_js_1.default.user.create({
            data: {
                username: data.username,
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.username}`,
            },
        });
        const payload = { userId: user.id, email: user.email, username: user.username };
        const accessToken = (0, jwt_js_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_js_1.generateRefreshToken)(payload);
        const tokenHash = (0, jwt_js_1.hashToken)(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await client_js_1.default.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });
        const { passwordHash: _, ...safeUser } = user;
        return { user: safeUser, accessToken, refreshToken };
    }
    static async login(data) {
        const user = await client_js_1.default.user.findFirst({
            where: {
                OR: [{ username: data.usernameOrEmail }, { email: data.usernameOrEmail }],
            },
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        const isValidPassword = await (0, password_js_1.comparePassword)(data.password, user.passwordHash);
        if (!isValidPassword) {
            throw new errorHandler_js_1.AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        const payload = { userId: user.id, email: user.email, username: user.username };
        const accessToken = (0, jwt_js_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_js_1.generateRefreshToken)(payload);
        const tokenHash = (0, jwt_js_1.hashToken)(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await client_js_1.default.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });
        const { passwordHash: _, ...safeUser } = user;
        return { user: safeUser, accessToken, refreshToken };
    }
    static async refresh(refreshToken) {
        try {
            const payload = (0, jwt_js_1.verifyRefreshToken)(refreshToken);
            const tokenHash = (0, jwt_js_1.hashToken)(refreshToken);
            const storedToken = await client_js_1.default.refreshToken.findFirst({
                where: {
                    tokenHash,
                    userId: payload.userId,
                    revokedAt: null,
                    expiresAt: { gt: new Date() },
                },
            });
            if (!storedToken) {
                throw new errorHandler_js_1.AppError('Invalid or revoked refresh token', 401, 'INVALID_REFRESH_TOKEN');
            }
            // Revoke old token (Token rotation)
            await client_js_1.default.refreshToken.update({
                where: { id: storedToken.id },
                data: { revokedAt: new Date() },
            });
            const user = await client_js_1.default.user.findUnique({
                where: { id: payload.userId },
            });
            if (!user) {
                throw new errorHandler_js_1.AppError('User not found', 404, 'USER_NOT_FOUND');
            }
            const newPayload = { userId: user.id, email: user.email, username: user.username };
            const newAccessToken = (0, jwt_js_1.generateAccessToken)(newPayload);
            const newRefreshToken = (0, jwt_js_1.generateRefreshToken)(newPayload);
            const newTokenHash = (0, jwt_js_1.hashToken)(newRefreshToken);
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await client_js_1.default.refreshToken.create({
                data: {
                    userId: user.id,
                    tokenHash: newTokenHash,
                    expiresAt,
                },
            });
            const { passwordHash: _, ...safeUser } = user;
            return { user: safeUser, accessToken: newAccessToken, refreshToken: newRefreshToken };
        }
        catch (err) {
            throw new errorHandler_js_1.AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
        }
    }
    static async logout(refreshToken) {
        if (refreshToken) {
            const tokenHash = (0, jwt_js_1.hashToken)(refreshToken);
            await client_js_1.default.refreshToken.updateMany({
                where: { tokenHash, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
    }
    static async getCurrentUser(userId) {
        const user = await client_js_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    }
}
exports.AuthService = AuthService;
