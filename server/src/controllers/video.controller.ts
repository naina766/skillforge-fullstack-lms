import { Request, Response, NextFunction } from 'express';
import { VideoService } from '../services/video.service';
import { ApiResponse } from '../utils/apiResponse';

export class VideoController {
  static async signUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const folder = req.body?.folder || 'skillforge/courses';
      const signatureData = VideoService.generateCloudinarySignature(folder);
      return ApiResponse.success(res, signatureData, 200, 'Upload signature generated successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async validateYouTube(req: Request, res: Response, next: NextFunction) {
    try {
      const { url } = req.body;
      const data = VideoService.validateYouTubeUrl(url);
      return ApiResponse.success(res, data, 200, 'YouTube video URL validated successfully.');
    } catch (error) {
      return next(error);
    }
  }
}
