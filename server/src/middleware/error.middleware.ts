import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const errorMiddleware = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred on the server.';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid resource identifier provided.';
  } else if ((err as any).code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_RESOURCE';
    message = 'A record with this unique attribute already exists.';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token provided.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired.';
  }

  if (statusCode >= 500) {
    logger.error(err, `[Unhandled Exception] ${err.message}`);
  } else {
    logger.warn(`[Client Error ${statusCode}] ${errorCode}: ${message}`);
  }

  if (env.NODE_ENV === 'development' && !(err instanceof AppError)) {
    return res.status(statusCode).json({
      success: false,
      message,
      errorCode,
      stack: err.stack,
    });
  }

  return ApiResponse.error(res, message, statusCode, errorCode);
};
