"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 400, code = 'BAD_REQUEST', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, _next) {
    console.error('[Error Handler]:', err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: err.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            },
        });
    }
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                message: err.message,
                code: err.code,
                details: err.details,
            },
        });
    }
    return res.status(500).json({
        error: {
            message: err.message || 'Internal server error',
            code: 'INTERNAL_SERVER_ERROR',
        },
    });
}
