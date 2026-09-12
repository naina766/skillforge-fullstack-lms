import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { Button } from '../ui/Button';
import { Review } from '../../types';
import { Sparkles, Send, X, AlertCircle } from 'lucide-react';

interface ReviewFormProps {
  courseTitle?: string;
  initialReview?: Review | null;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  courseTitle,
  initialReview,
  onSubmit,
  onCancel,
  isLoading = false,
  className = '',
}) => {
  const [rating, setRating] = useState<number>(initialReview?.rating || 5);
  const [comment, setComment] = useState<string>(initialReview?.comment || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setComment(initialReview.comment || '');
    }
  }, [initialReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    if (comment.length > 1000) {
      setError('Comment cannot exceed 1000 characters.');
      return;
    }

    try {
      await onSubmit({ rating, comment: comment.trim() });
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    }
  };

  const isEditing = !!initialReview;

  return (
    <form
      onSubmit={handleSubmit}
      className={`glass-panel p-6 sm:p-7 rounded-3xl border border-brand-500/30 bg-slate-950/70 shadow-2xl relative overflow-hidden space-y-5 ${className}`}
    >
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {isEditing ? 'Edit Your Course Review' : 'How would you rate this course?'}
            </h3>
            {courseTitle && (
              <p className="text-[11px] text-slate-400 truncate max-w-sm">{courseTitle}</p>
            )}
          </div>
        </div>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Interactive Star Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">
          Your Rating <span className="text-rose-400">*</span>
        </label>
        <div className="flex items-center gap-3">
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onRatingChange={(newRating) => {
              setRating(newRating);
              setError(null);
            }}
          />
          <span className="text-xs font-bold text-amber-400">
            {rating === 5 && 'Outstanding! (5/5)'}
            {rating === 4 && 'Very Good (4/5)'}
            {rating === 3 && 'Average (3/5)'}
            {rating === 2 && 'Needs Improvement (2/5)'}
            {rating === 1 && 'Poor (1/5)'}
          </span>
        </div>
      </div>

      {/* Optional Textarea Review Comment */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300">
            Written Review <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <span className={`text-[11px] font-mono ${comment.length > 900 ? 'text-amber-400' : 'text-slate-500'}`}>
            {comment.length}/1000
          </span>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with other students... What did you learn? How was the curriculum pacing and projects?"
          rows={3}
          maxLength={1000}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-1">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isLoading}
          leftIcon={<Send className="w-3.5 h-3.5" />}
        >
          {isEditing ? 'Update Review' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};
