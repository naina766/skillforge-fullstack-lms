import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../../api/reviewApi';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Rating } from '../../components/ui/Rating';
import { useUIStore } from '../../store/useUIStore';
import { Review } from '../../types';
import {
  Shield,
  CheckCircle2,
  EyeOff,
  Star,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const { data: reviewsResponse, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => reviewApi.getAllReviews({ limit: 50 }),
  });

  const reviews: Review[] = reviewsResponse?.data?.items || [];

  const moderateMutation = useMutation({
    mutationFn: ({ id, isModerated }: { id: string; isModerated: boolean }) =>
      reviewApi.moderateReview(id, isModerated),
    onSuccess: (_, vars) => {
      addToast('success', vars.isModerated ? 'Review approved & made visible.' : 'Review hidden from catalog.');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to moderate review.');
    },
  });

  const handleToggleModeration = (reviewId: string, currentStatus: boolean) => {
    moderateMutation.mutate({ id: reviewId, isModerated: !currentStatus });
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 w-full">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-400" />
            <h1 className="text-2xl font-bold text-white">Review & Feedback Moderation</h1>
          </div>
          <p className="text-xs text-slate-400">Inspect student ratings, moderate spam or offensive reviews, and protect catalog integrity.</p>
        </div>

        {/* Reviews Table */}
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : reviews.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Reviews Found</h3>
            <p className="text-xs text-slate-400">No student reviews have been submitted yet.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Course Target</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Comment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-white">
                      {rev.student?.name || 'Anonymous Learner'}
                    </td>
                    <td className="p-4 text-slate-200 font-medium max-w-xs truncate">
                      {(rev.course as any)?.title || 'Course ID ' + rev.course}
                    </td>
                    <td className="p-4">
                      <Rating value={rev.rating} count={rev.rating} />
                    </td>
                    <td className="p-4 text-slate-300 max-w-md">
                      <p className="line-clamp-2">{rev.comment}</p>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px] font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Badge variant={rev.isModerated ? 'emerald' : 'rose'}>
                        {rev.isModerated ? 'Approved' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant={rev.isModerated ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleModeration(rev._id, rev.isModerated)}
                        isLoading={moderateMutation.isPending && moderateMutation.variables?.id === rev._id}
                        leftIcon={rev.isModerated ? <EyeOff className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        {rev.isModerated ? 'Hide Review' : 'Approve Review'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
