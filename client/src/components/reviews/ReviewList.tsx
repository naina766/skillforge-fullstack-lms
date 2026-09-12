import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCourseReviews, useMyCourseReview, useCreateReview, useUpdateReview, useDeleteReview } from '../../hooks/useCourseReviews';
import { useAuthStore } from '../../store/useAuthStore';
import { CourseRatingSummary } from './CourseRatingSummary';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Review, RatingSummary } from '../../types';
import { MessageSquare, Star, Sparkles, Edit2, LogIn, CheckCircle2 } from 'lucide-react';

interface ReviewListProps {
  courseId: string;
  courseTitle?: string;
  isEnrolled?: boolean;
  onEnrollClick?: () => void;
  className?: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  courseId,
  courseTitle,
  isEnrolled = false,
  onEnrollClick,
  className = '',
}) => {
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Queries
  const { data: reviewsResponse, isLoading } = useCourseReviews(courseId, page, 10);
  const { data: myReviewResponse } = useMyCourseReview(courseId, isAuthenticated && isEnrolled);

  const reviewsData = reviewsResponse?.data;
  const reviews: Review[] = reviewsData?.items || [];
  const pagination = reviewsData?.pagination;
  const summary: RatingSummary = reviewsData?.summary || {
    ratingAverage: 0,
    ratingCount: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const myReview = myReviewResponse?.data || null;

  // Mutations
  const createMutation = useCreateReview(courseId);
  const updateMutation = useUpdateReview(courseId);
  const deleteMutation = useDeleteReview(courseId);

  const handleFormSubmit = async (data: { rating: number; comment: string }) => {
    if (editingReview) {
      await updateMutation.mutateAsync({
        reviewId: editingReview._id,
        payload: data,
      });
      setEditingReview(null);
      setIsFormOpen(false);
    } else {
      await createMutation.mutateAsync(data);
      setIsFormOpen(false);
    }
  };

  const handleEditClick = (rev: Review) => {
    setEditingReview(rev);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (reviewId: string) => {
    deleteMutation.mutate(reviewId);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* 1. Rating Summary Header & Distribution Bars */}
      <CourseRatingSummary summary={summary} />

      {/* 2. Review Action State Area */}
      <div className="space-y-4">
        {/* CASE A: User is not logged in */}
        {!isAuthenticated && (
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Have you taken this course?</h4>
                <p className="text-xs text-slate-400">Log in and enroll to share your verified student rating.</p>
              </div>
            </div>
            <Link to="/login" className="shrink-0">
              <Button variant="secondary" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                Log In to Review
              </Button>
            </Link>
          </div>
        )}

        {/* CASE B: User is logged in but not enrolled */}
        {isAuthenticated && !isEnrolled && (
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Enroll to Leave a Review</h4>
                <p className="text-xs text-slate-400">Only verified enrolled learners can rate and review this course.</p>
              </div>
            </div>
            {onEnrollClick ? (
              <Button variant="primary" size="sm" onClick={onEnrollClick} className="shrink-0">
                Enroll Now
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="shrink-0"
              >
                Enroll to Review
              </Button>
            )}
          </div>
        )}

        {/* CASE C: Enrolled student who has NOT reviewed yet */}
        {isAuthenticated && isEnrolled && !myReview && !isFormOpen && (
          <div className="glass-panel p-5 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-slate-900 to-purple-950/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Enjoying this course?</h4>
                <p className="text-xs text-slate-400">Share your feedback and experience with future learners.</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingReview(null);
                setIsFormOpen(true);
              }}
              leftIcon={<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
              className="shrink-0"
            >
              Write a Review
            </Button>
          </div>
        )}

        {/* CASE D: Enrolled student who ALREADY reviewed */}
        {isAuthenticated && isEnrolled && myReview && !isFormOpen && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Your Verified Review
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditClick(myReview)}
                leftIcon={<Edit2 className="w-3.5 h-3.5 text-brand-400" />}
                className="text-xs text-slate-300 hover:text-white"
              >
                Edit Your Review
              </Button>
            </div>
            <ReviewCard
              review={myReview}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === myReview._id}
            />
          </div>
        )}

        {/* Inline Review Form (Active in Create or Edit mode) */}
        {isFormOpen && (
          <ReviewForm
            courseTitle={courseTitle}
            initialReview={editingReview || myReview}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingReview(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </div>

      {/* 3. All Student Reviews List */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-400" />
            <span>Learner Reviews ({summary.ratingCount || reviews.length})</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="glass-panel p-10 text-center rounded-2xl border border-slate-800 space-y-2">
            <Star className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No reviews yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isEnrolled
                ? 'Be the first student to review this course!'
                : 'Enroll now and be the first to share your learning experience.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {reviews.map((rev) => (
              <ReviewCard
                key={rev._id}
                review={rev}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === rev._id}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-slate-400 px-3 font-mono">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
