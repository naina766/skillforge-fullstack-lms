import axiosClient from './axiosClient';
import { ApiResponse } from '../types';

export interface CloudinarySignatureResponse {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
}

export interface YouTubeValidationResponse {
  valid: boolean;
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
}

export const videoApi = {
  getUploadSignature: async (folder?: string) => {
    const response = await axiosClient.post<ApiResponse<CloudinarySignatureResponse>>('/videos/sign-upload', {
      folder,
    });
    return response.data;
  },

  validateYouTube: async (url: string) => {
    const response = await axiosClient.post<ApiResponse<YouTubeValidationResponse>>('/videos/validate-youtube', {
      url,
    });
    return response.data;
  },
};
