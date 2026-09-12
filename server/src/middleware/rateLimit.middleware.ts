import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/apiResponse';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(res, 'Too many requests from this IP, please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(res, 'Too many authentication attempts, please try again after 15 minutes.', 429, 'AUTH_RATE_LIMIT_EXCEEDED');
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(res, 'AI rate limit exceeded. Please wait a minute before requesting more AI recommendations.', 429, 'AI_RATE_LIMIT_EXCEEDED');
  },
});
