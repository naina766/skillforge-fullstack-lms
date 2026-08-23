import axiosClient from './axiosClient';
import { User, ApiResponse, PaginatedResponse } from '../types';

export interface AdminAnalyticsData {
  metrics: {
    totalStudents: number;
    totalInstructors: number;
    totalCourses: number;
    totalEnrollments: number;
    completedEnrollments: number;
    totalRevenue: number;
    reviewsCount: number;
  };
  charts: {
    studentGrowth: Array<{ month: string; count: number }>;
    enrollmentGrowth: Array<{ month: string; count: number }>;
    categoryDistribution: Array<{ name: string; value: number }>;
  };
}

export interface AuditLogItem {
  _id: string;
  user: User;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  createdAt: string;
}

export const adminApi = {
  getAnalytics: async () => {
    const res = await axiosClient.get<ApiResponse<AdminAnalyticsData>>('/admin/analytics');
    return res.data;
  },

  getUsers: async (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
    const res = await axiosClient.get<PaginatedResponse<User>>('/admin/users', { params });
    return res.data;
  },

  updateUserRoleOrStatus: async (id: string, payload: { role?: string; isActive?: boolean }) => {
    const res = await axiosClient.patch<ApiResponse<User>>(`/admin/users/${id}/role`, payload);
    return res.data;
  },

  getAuditLogs: async (params?: { page?: number; limit?: number }) => {
    const res = await axiosClient.get<PaginatedResponse<AuditLogItem>>('/admin/audit-logs', { params });
    return res.data;
  },
};
