import axiosClient from './axiosClient';
import { User, ApiResponse } from '../types';

export const authApi = {
  register: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<User>>('/auth/register', payload);
    return res.data;
  },

  login: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/login', payload);
    return res.data;
  },

  logout: async () => {
    const res = await axiosClient.post<ApiResponse<any>>('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await axiosClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};
