import axiosClient from './axiosClient';
import { Enrollment, Certificate, ApiResponse } from '../types';

export const enrollmentApi = {
  enroll: async (courseId: string) => {
    const res = await axiosClient.post<ApiResponse<Enrollment>>('/enrollments', { courseId });
    return res.data;
  },

  getUserEnrollments: async () => {
    const res = await axiosClient.get<ApiResponse<Enrollment[]>>('/enrollments');
    return res.data;
  },

  getEnrollmentByCourse: async (courseId: string) => {
    const res = await axiosClient.get<ApiResponse<Enrollment | null>>(`/enrollments/course/${courseId}`);
    return res.data;
  },

  updateProgress: async (id: string, lessonId: string, isCompleted = true) => {
    const res = await axiosClient.patch<ApiResponse<{ enrollment: Enrollment; certificate?: Certificate }>>(`/enrollments/${id}/progress`, {
      lessonId,
      isCompleted,
    });
    return res.data;
  },
};
