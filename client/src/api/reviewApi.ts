import axiosClient from './axiosClient';
import { Review, ApiResponse } from '../types';

export const reviewApi = {
  getCourseReviews: async (courseId: string) => {
    const res = await axiosClient.get<ApiResponse<Review[]>>(`/reviews/course/${courseId}`);
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
