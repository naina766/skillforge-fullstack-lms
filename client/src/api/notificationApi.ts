import axiosClient from './axiosClient';
import { NotificationItem, ApiResponse } from '../types';

export const notificationApi = {
  getNotifications: async () => {
    const res = await axiosClient.get<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>>('/notifications');
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await axiosClient.patch<ApiResponse<NotificationItem>>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await axiosClient.patch<ApiResponse<any>>('/notifications/read-all');
    return res.data;
  },
};
