import { describe, it, expect } from 'vitest';
import { VideoService } from '../src/services/video.service';
import { AppError } from '../src/utils/appError';

describe('Video Learning Engine - Unit & Integration Tests', () => {
  describe('YouTube Extraction & Validation', () => {
    it('should extract video ID from standard watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=Oe421EPjeBE';
      const id = VideoService.extractYouTubeVideoId(url);
      expect(id).toBe('Oe421EPjeBE');
    });

    it('should extract video ID from short youtu.be URL', () => {
      const url = 'https://youtu.be/bMknfKXIFA8';
      const id = VideoService.extractYouTubeVideoId(url);
      expect(id).toBe('bMknfKXIFA8');
    });

    it('should extract video ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/30LWjhZ8750';
      const id = VideoService.extractYouTubeVideoId(url);
      expect(id).toBe('30LWjhZ8750');
    });

    it('should accept direct 11-character video ID', () => {
      const directId = '3c-iBn73dDE';
      const id = VideoService.extractYouTubeVideoId(directId);
      expect(id).toBe('3c-iBn73dDE');
    });

    it('should throw AppError for invalid or malformed YouTube URLs', () => {
      expect(() => VideoService.extractYouTubeVideoId('https://notyoutube.com/video/123')).toThrow(AppError);
      expect(() => VideoService.extractYouTubeVideoId('')).toThrow(AppError);
    });

    it('should return valid normalized embed payload', () => {
      const res = VideoService.validateYouTubeUrl('https://youtu.be/Oe421EPjeBE');
      expect(res.valid).toBe(true);
      expect(res.videoId).toBe('Oe421EPjeBE');
      expect(res.embedUrl).toContain('https://www.youtube-nocookie.com/embed/Oe421EPjeBE');
      expect(res.thumbnailUrl).toContain('hqdefault.jpg');
    });
  });

  describe('Short Video Duration & Size Policy (15 min / 500MB)', () => {
    it('should accept valid short lesson video under 15 minutes (900s)', () => {
      expect(() => VideoService.validateVideoUploadMetadata(300, 50 * 1024 * 1024)).not.toThrow();
      expect(() => VideoService.validateVideoUploadMetadata(899, 499 * 1024 * 1024)).not.toThrow();
      expect(() => VideoService.validateVideoUploadMetadata(900, 500 * 1024 * 1024)).not.toThrow();
    });

    it('should reject long videos exceeding 15 minutes (e.g., 1-hour / 3600s video)', () => {
      expect(() => VideoService.validateVideoUploadMetadata(3600)).toThrow(AppError);
      expect(() => VideoService.validateVideoUploadMetadata(901)).toThrow(AppError);
    });

    it('should reject oversized video files exceeding 500MB', () => {
      const over500MB = 501 * 1024 * 1024;
      expect(() => VideoService.validateVideoUploadMetadata(300, over500MB)).toThrow(AppError);
    });
  });
});
