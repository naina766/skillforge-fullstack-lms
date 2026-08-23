import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  const statusCode = dbStatus === 'connected' ? 200 : 503;
  return ApiResponse.success(res, healthData, statusCode);
});

export default router;
