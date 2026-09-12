import axiosClient from './axiosClient';
import { Review, ApiResponse, PaginatedResponse, RatingSummary } from '../types';

export interface CourseReviewsResponseData {
  items: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: RatingSummary;
}

export const reviewApi = {
  getCourseReviews: async (courseId: string, page = 1, limit = 10) => {
    const res = await axiosClient.get<ApiResponse<CourseReviewsResponseData>>(`/courses/${courseId}/reviews`, {
      params: { page, limit },
    });
    return res.data;
  },

  getMyCourseReview: async (courseId: string) => {
    const res = await axiosClient.get<ApiResponse<Review | null>>(`/courses/${courseId}/my-review`);
    return res.data;
  },

  addReview: async (courseId: string, payload: { rating: number; comment?: string }) => {
    const res = await axiosClient.post<ApiResponse<{ review: Review; courseRating: RatingSummary }>>(
      `/courses/${courseId}/reviews`,
      payload
    );
    return res.data;
  },

  updateReview: async (reviewId: string, payload: { rating?: number; comment?: string }) => {
    const res = await axiosClient.patch<ApiResponse<{ review: Review; courseRating: RatingSummary }>>(
      `/reviews/${reviewId}`,
      payload
    );
    return res.data;
  },

  deleteReview: async (reviewId: string) => {
    const res = await axiosClient.delete<ApiResponse<{ success: boolean; courseRating: RatingSummary }>>(
      `/reviews/${reviewId}`
    );
    return res.data;
  },

  moderateReview: async (reviewId: string, isModerated: boolean) => {
    const res = await axiosClient.patch<ApiResponse<{ review: Review; courseRating: RatingSummary }>>(
      `/reviews/${reviewId}/moderate`,
      { isModerated }
    );
    return res.data;
  },

  getAllReviews: async (params?: { page?: number; limit?: number }) => {
    const res = await axiosClient.get<PaginatedResponse<Review>>('/reviews', { params });
    return res.data;
  },
};
