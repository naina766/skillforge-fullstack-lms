import axiosClient from './axiosClient';
import { Review, ApiResponse, PaginatedResponse } from '../types';

export const reviewApi = {
  getCourseReviews: async (courseId: string) => {
    const res = await axiosClient.get<ApiResponse<Review[]>>(`/reviews/course/${courseId}`);
    return res.data;
  },

  getAllReviews: async (params?: { page?: number; limit?: number }) => {
    const res = await axiosClient.get<PaginatedResponse<Review>>('/reviews', { params });
    return res.data;
  },

  addReview: async (courseId: string, payload: { rating: number; comment: string }) => {
    const res = await axiosClient.post<ApiResponse<Review>>(`/reviews/course/${courseId}`, payload);
    return res.data;
  },

  moderateReview: async (reviewId: string, isModerated: boolean) => {
    const res = await axiosClient.patch<ApiResponse<Review>>(`/reviews/${reviewId}/moderate`, { isModerated });
    return res.data;
  },
};
