import axiosClient from './axiosClient';
import { Course, Category, ApiResponse, PaginatedResponse } from '../types';

export interface CourseQueryParamFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export const courseApi = {
  getCourses: async (params?: CourseQueryParamFilters) => {
    const res = await axiosClient.get<PaginatedResponse<Course>>('/courses', { params });
    return res.data;
  },

  getCourseBySlug: async (slug: string) => {
    const res = await axiosClient.get<ApiResponse<Course>>(`/courses/slug/${slug}`);
    return res.data;
  },

  getCategories: async () => {
    const res = await axiosClient.get<ApiResponse<Category[]>>('/categories');
    return res.data;
  },

  createCourse: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<Course>>('/courses', payload);
    return res.data;
  },

  updateCourse: async (id: string, payload: any) => {
    const res = await axiosClient.patch<ApiResponse<Course>>(`/courses/${id}`, payload);
    return res.data;
  },

  deleteCourse: async (id: string) => {
    const res = await axiosClient.delete<ApiResponse<any>>(`/courses/${id}`);
    return res.data;
  },

  updateCourseStatus: async (id: string, status: string) => {
    const res = await axiosClient.patch<ApiResponse<Course>>(`/courses/${id}/status`, { status });
    return res.data;
  },
};
