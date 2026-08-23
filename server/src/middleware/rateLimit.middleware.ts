import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/apiResponse';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(res, 'Too many requests from this IP, please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(res, 'Too many authentication attempts, please try again after 15 minutes.', 429, 'AUTH_RATE_LIMIT_EXCEEDED');
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 AI requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(res, 'AI Mentor rate limit exceeded. Please wait a few minutes before asking another prompt.', 429, 'AI_RATE_LIMITED');
  },
});
