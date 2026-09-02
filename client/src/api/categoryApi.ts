import axiosClient from './axiosClient';
import { Category, ApiResponse } from '../types';

export const categoryApi = {
  getCategories: async () => {
    const res = await axiosClient.get<ApiResponse<Category[]>>('/categories');
    return res.data;
  },

  createCategory: async (payload: { name: string; description?: string; icon?: string }) => {
    const res = await axiosClient.post<ApiResponse<Category>>('/categories', payload);
    return res.data;
  },
};
