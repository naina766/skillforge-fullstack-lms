import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { ApiResponse } from '../utils/apiResponse';

export class AIController {
  static async chatMentor(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return ApiResponse.error(
          res,
          'Prompt is required and must be a non-empty string.',
          400,
          'AI_INVALID_REQUEST'
        );
      }

      if (prompt.length > 1000) {
        return ApiResponse.error(
          res,
          'Prompt exceeds maximum limit of 1,000 characters.',
          400,
          'AI_INVALID_REQUEST'
        );
      }

      const userId = req.user?.userId;
      const result = await AIService.chatMentor(prompt, userId);

      return ApiResponse.success(res, result, 200, 'AI Mentor guidance generated successfully.');
    } catch (error: any) {
      if (error.message?.includes('timeout')) {
        return ApiResponse.error(
          res,
          'AI mentor service timed out. Please try again in a moment.',
          504,
          'AI_PROVIDER_TIMEOUT'
        );
      }
      return next(error);
    }
  }

  static async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const courses = await AIService.getRecommendations(userId);
      return ApiResponse.success(res, courses);
    } catch (error) {
      return next(error);
    }
  }
}
