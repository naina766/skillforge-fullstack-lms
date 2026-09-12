import { Request, Response, NextFunction } from 'express';
import { VideoService } from '../services/video.service';
import { Course } from '../models/Course';
import { ApiResponse } from '../utils/apiResponse';

export class VideoController {
  static async signUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.body || {};
      let folder = `skillforge/courses/general/${req.user!.userId}`;

      if (courseId) {
        const course = await Course.findById(courseId);
        if (!course) {
          return ApiResponse.error(res, 'Course not found.', 404, 'COURSE_NOT_FOUND');
        }

        const isOwner = course.instructor.toString() === req.user!.userId;
        const isAdmin = req.user!.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
          return ApiResponse.error(
            res,
            'You are not authorized to upload video media to this course.',
            403,
            'FORBIDDEN'
          );
        }

        folder = `skillforge/courses/${course._id}`;
      }

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
