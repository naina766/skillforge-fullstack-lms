import React, { useState } from 'react';
import { Review } from '../../types';
import { StarRating } from './StarRating';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle2, Edit2, Trash2, Clock, User as UserIcon } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  isDeleting?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const { user } = useAuthStore();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const studentObj = typeof review.student === 'object' ? review.student : null;
  const studentName = studentObj?.name || 'Anonymous Student';
  const studentAvatar = studentObj?.avatar;

  const currentUserId = user?._id || user?.id;
  const reviewOwnerId = studentObj?._id || studentObj?.id || (typeof review.student === 'string' ? review.student : null);

  const isOwner = currentUserId && reviewOwnerId && currentUserId === reviewOwnerId;
  const isAdmin = user?.role === 'ADMIN';

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800/80 bg-slate-950/50 hover:border-slate-700/60 transition-all space-y-3.5">
      {/* Header: Student Info + Date + Controls */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {studentAvatar ? (
            <img
              src={studentAvatar}
              alt={studentName}
              className="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
              {studentName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-white text-sm tracking-tight">{studentName}</h4>
              <Badge variant="emerald" size="sm" className="gap-1 py-0.5 px-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified Learner</span>
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{formattedDate}</span>
              {review.updatedAt && review.updatedAt !== review.createdAt && (
                <span className="text-slate-500 italic">(edited)</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls for Owner or Admin */}
        {(isOwner || isAdmin) && (
          <div className="flex items-center gap-1">
            {isOwner && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(review)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                title="Edit review"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            )}

            {onDelete && (
              <>
                {showConfirmDelete ? (
                  <div className="flex items-center gap-1 animate-in fade-in">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(review._id)}
                      isLoading={isDeleting}
                      className="text-[11px] px-2 py-1 h-7"
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmDelete(false)}
                      className="text-[11px] px-2 py-1 h-7"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmDelete(true)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Star Rating Display */}
      <div className="flex items-center gap-2">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Review Comment Text */}
      {review.comment && (
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words font-sans">
          "{review.comment}"
        </p>
      )}
    </div>
  );
};
