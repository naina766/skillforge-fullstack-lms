import axiosClient from './axiosClient';
import { Course, ApiResponse } from '../types';

export const wishlistApi = {
  getWishlist: async () => {
    const res = await axiosClient.get<ApiResponse<Course[]>>('/wishlist');
    return res.data;
  },

  addToWishlist: async (courseId: string) => {
    const res = await axiosClient.post<ApiResponse<any>>(`/wishlist/${courseId}`);
    return res.data;
  },

  removeFromWishlist: async (courseId: string) => {
    const res = await axiosClient.delete<ApiResponse<any>>(`/wishlist/${courseId}`);
    return res.data;
  },
};
