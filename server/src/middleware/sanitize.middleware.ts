import { Request, Response, NextFunction } from 'express';

/**
 * Clean and sanitize data to prevent NoSQL Injection attacks ($ operators and dot notation).
 */
const cleanData = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanData(item));
  }

  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    // Strip leading dollar signs or dots to block MongoDB injection operators
    const sanitizedKey = key.replace(/^(\$)+/, '').replace(/\./g, '_');
    cleaned[sanitizedKey] = cleanData(obj[key]);
  }

  return cleaned;
};

/**
 * Express middleware for NoSQL injection & query parameter sanitization
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = cleanData(req.body);
  }
  if (req.params) {
    req.params = cleanData(req.params);
  }
  if (req.query) {
    req.query = cleanData(req.query);
  }
  next();
};
