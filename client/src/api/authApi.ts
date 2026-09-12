import axios from 'axios';
import axiosClient from './axiosClient';
import { User, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const authApi = {
  register: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<User>>('/auth/register', payload);
    return res.data;
  },

  login: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/login', payload);
    return res.data;
  },

  refresh: async () => {
    const res = await axios.post<ApiResponse<{ accessToken: string }>>(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
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

