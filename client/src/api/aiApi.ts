import axiosClient from './axiosClient';
import { Course, ApiResponse, AIMentorStructuredResponse } from '../types';

export const aiApi = {
  chatMentor: async (prompt: string, conversationId?: string) => {
    const res = await axiosClient.post<ApiResponse<AIMentorStructuredResponse>>('/ai/mentor', {
      prompt,
      conversationId,
    });
    return res.data;
  },

  getRecommendations: async () => {
    const res = await axiosClient.get<ApiResponse<Course[]>>('/ai/recommendations');
    return res.data;
  },

  trackRecommendationClick: async (courseId: string) => {
    // Audit analytics tracking when a student clicks on an AI recommended course
    try {
      await axiosClient.post('/audit/events', {
        action: 'AI_RECOMMENDATION_CLICKED',
        resource: 'Course',
        resourceId: courseId,
      });
    } catch {
      // Non-blocking analytics
    }
  },
};
