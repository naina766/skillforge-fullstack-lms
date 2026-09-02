import axiosClient from './axiosClient';
import { ApiResponse } from '../types';

export interface InstructorAnalyticsData {
  metrics: {
    totalCourses: number;
    totalStudents: number;
    completionRate: number;
    averageRating: number;
    totalReviews: number;
    totalRevenue: number;
  };
  charts?: {
    monthlyGrowth: Array<{ month: string; students: number; revenue: number }>;
    courseRevenue: Array<{ title: string; revenue: number; students: number }>;
  };
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    type: string;
    status: string;
    price: number;
    students: number;
    rating: number;
    reviewCount: number;
    publishedAt?: string;
  }>;
}

export const instructorApi = {
  getAnalytics: async () => {
    const res = await axiosClient.get<ApiResponse<InstructorAnalyticsData>>('/instructor/analytics');
    return res.data;
  },
};
