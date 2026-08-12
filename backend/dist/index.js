"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const index_js_1 = require("./config/index.js");
const index_js_2 = __importDefault(require("./routes/index.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
const client_js_1 = __importDefault(require("./prisma/client.js"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: index_js_1.config.corsOrigin || '*',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Apply rate limiting to API routes
app.use('/api', rateLimiter_js_1.apiLimiter);
// Health Check Endpoint
app.get('/api/health', async (_req, res) => {
    let dbStatus = 'disconnected';
    try {
        await client_js_1.default.$queryRaw `SELECT 1`;
        dbStatus = 'healthy';
    }
    catch (err) {
        dbStatus = 'unhealthy';
    }
    res.status(200).json({
        status: 'ok',
        service: 'DevFlow Backend',
        environment: index_js_1.config.nodeEnv,
        database: dbStatus,
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api', index_js_2.default);
// 404 Handler
app.use((_req, res) => {
    res.status(404).json({
        error: {
            message: 'Endpoint not found',
            code: 'NOT_FOUND',
        },
    });
});
// Central Error Handler
app.use(errorHandler_js_1.errorHandler);
const PORT = index_js_1.config.port;
const server = app.listen(PORT, () => {
    console.log(`🚀 DevFlow Backend Server running on port ${PORT} [${index_js_1.config.nodeEnv}]`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server...');
    server.close(async () => {
        await client_js_1.default.$disconnect();
        console.log('HTTP server and Database connection closed.');
        process.exit(0);
    });
});
exports.default = app;
