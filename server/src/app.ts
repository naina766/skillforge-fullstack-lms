import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalRateLimiter } from './middleware/rateLimit.middleware';
import { sanitizeInput } from './middleware/sanitize.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { setupSwagger } from './config/swagger';
import healthRouter from './routes/health.routes';
import apiRouter from './routes/index';

const app: Application = express();

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and embedded media
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing, Cookies & Input Sanitization
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(sanitizeInput);

// Rate Limiting
app.use(globalRateLimiter);

// Swagger Documentation
setupSwagger(app);

// Health Check Router
app.use('/api', healthRouter);

// Core API Router
app.use('/api', apiRouter);

// Root Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'SkillForge API',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/api/health',
  });
});

// Centralized Error Middleware (Must be attached last)
app.use(errorMiddleware);

export default app;
