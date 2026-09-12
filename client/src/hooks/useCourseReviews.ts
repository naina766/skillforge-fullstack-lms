import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../api/reviewApi';
import { useUIStore } from '../store/useUIStore';

export const useCourseReviews = (courseId?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['course-reviews', courseId, page, limit],
    queryFn: () => reviewApi.getCourseReviews(courseId!, page, limit),
    enabled: !!courseId,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useMyCourseReview = (courseId?: string, isEnrolled = false) => {
  return useQuery({
    queryKey: ['my-course-review', courseId],
    queryFn: () => reviewApi.getMyCourseReview(courseId!),
    enabled: !!courseId && isEnrolled,
    staleTime: 1000 * 60,
  });
};

export const useCreateReview = (courseId: string) => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      reviewApi.addReview(courseId, payload),
    onSuccess: () => {
      addToast('success', 'Thank you! Your review has been submitted.');
      queryClient.invalidateQueries({ queryKey: ['course-reviews', courseId] });
      queryClient.invalidateQueries({ queryKey: ['my-course-review', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to submit review.');
    },
  });
};

export const useUpdateReview = (courseId: string) => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: { rating?: number; comment?: string } }) =>
      reviewApi.updateReview(reviewId, payload),
    onSuccess: () => {
      addToast('success', 'Your review has been updated.');
      queryClient.invalidateQueries({ queryKey: ['course-reviews', courseId] });
      queryClient.invalidateQueries({ queryKey: ['my-course-review', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to update review.');
    },
  });
};

export const useDeleteReview = (courseId: string) => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (reviewId: string) => reviewApi.deleteReview(reviewId),
    onSuccess: () => {
      addToast('info', 'Your review has been removed.');
      queryClient.invalidateQueries({ queryKey: ['course-reviews', courseId] });
      queryClient.invalidateQueries({ queryKey: ['my-course-review', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to delete review.');
    },
  });
};
