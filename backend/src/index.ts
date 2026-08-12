import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import prisma from './prisma/client.js';

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/api/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'healthy';
  } catch (err) {
    dbStatus = 'unhealthy';
  }

  res.status(200).json({
    status: 'ok',
    service: 'DevFlow Backend',
    environment: config.nodeEnv,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', routes);

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
app.use(errorHandler);

const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`🚀 DevFlow Backend Server running on port ${PORT} [${config.nodeEnv}]`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server and Database connection closed.');
    process.exit(0);
  });
});

export default app;
