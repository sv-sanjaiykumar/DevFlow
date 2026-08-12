"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorizeProject = authorizeProject;
const jwt_js_1 = require("../utils/jwt.js");
const errorHandler_js_1 = require("./errorHandler.js");
const client_js_1 = __importDefault(require("../prisma/client.js"));
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errorHandler_js_1.AppError('Authentication token missing or invalid', 401, 'UNAUTHORIZED'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_js_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (err) {
        return next(new errorHandler_js_1.AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
    }
}
function authorizeProject(roles) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(new errorHandler_js_1.AppError('Authentication required', 401, 'UNAUTHORIZED'));
            }
            const projectId = req.params.projectId || req.params.id || req.body.projectId;
            if (!projectId) {
                return next(new errorHandler_js_1.AppError('Project ID is required', 400, 'BAD_REQUEST'));
            }
            const member = await client_js_1.default.projectMember.findUnique({
                where: {
                    projectId_userId: {
                        projectId,
                        userId: req.user.userId,
                    },
                },
            });
            if (!member) {
                return next(new errorHandler_js_1.AppError('Access denied: You are not a member of this project', 403, 'FORBIDDEN'));
            }
            if (roles && roles.length > 0 && !roles.includes(member.role)) {
                return next(new errorHandler_js_1.AppError('Insufficient project permissions', 403, 'FORBIDDEN'));
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
}
