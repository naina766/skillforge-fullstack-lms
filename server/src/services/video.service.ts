import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

export class VideoService {
  /**
   * Generates a signed direct-upload payload for Cloudinary.
   * Fails explicitly if Cloudinary credentials are missing.
   */
  static generateCloudinarySignature(folder = 'skillforge/courses') {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new AppError(
        'Cloudinary service is not configured on the server. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server environment.',
        500,
        'CLOUDINARY_NOT_CONFIGURED'
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;

    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    return {
      timestamp,
      signature,
      apiKey: CLOUDINARY_API_KEY,
      cloudName: CLOUDINARY_CLOUD_NAME,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
    };
  }

  /**
   * Extracts and validates YouTube video ID from standard, short, or embed URLs.
   */
  static extractYouTubeVideoId(url: string): string {
    if (!url || typeof url !== 'string') {
      throw new AppError('YouTube URL is required.', 400, 'INVALID_YOUTUBE_URL');
    }

    const trimmed = url.trim();

    // Match patterns:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    // https://www.youtube.com/live/VIDEO_ID
    // or plain 11-char ID
    const regExp =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = trimmed.match(regExp);

    if (match && match[1]) {
      return match[1];
    }

    // Check if user directly provided valid 11-character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    throw new AppError(
      'Invalid YouTube URL or Video ID. Please provide a valid YouTube link (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ).',
      400,
      'INVALID_YOUTUBE_URL'
    );
  }

  /**
   * Validates YouTube URL and returns normalized embed information.
   */
  static validateYouTubeUrl(url: string) {
    const videoId = this.extractYouTubeVideoId(url);
    return {
      valid: true,
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
}
