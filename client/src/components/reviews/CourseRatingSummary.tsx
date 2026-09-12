import React from 'react';
import { StarRating } from './StarRating';
import { RatingSummary } from '../../types';
import { Star, MessageSquare } from 'lucide-react';

interface CourseRatingSummaryProps {
  summary: RatingSummary;
  className?: string;
}

export const CourseRatingSummary: React.FC<CourseRatingSummaryProps> = ({ summary, className = '' }) => {
  const { ratingAverage = 0, ratingCount = 0, ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } = summary;

  const totalReviews = ratingCount || 0;

  const stars = [5, 4, 3, 2, 1];

  return (
    <div className={`glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 bg-slate-950/60 shadow-xl ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
        {/* Left Column: Big Average Score */}
        <div className="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start justify-center border-b md:border-b-0 md:border-r border-slate-800/80 pb-6 md:pb-0 md:pr-8">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
              {ratingAverage > 0 ? ratingAverage.toFixed(1) : '0.0'}
            </span>
            <span className="text-lg font-bold text-slate-500">/ 5</span>
          </div>

          <div className="mt-2.5">
            <StarRating rating={ratingAverage} size="lg" />
          </div>

          <p className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
            <span>
              {totalReviews === 0
                ? 'No ratings yet'
                : `${totalReviews} verified ${totalReviews === 1 ? 'review' : 'reviews'}`}
            </span>
          </p>
        </div>

        {/* Right Column: Rating Distribution Bars */}
        <div className="md:col-span-8 space-y-2.5">
          {stars.map((star) => {
            const count = (ratingDistribution as any)[star.toString()] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                {/* Star Label */}
                <div className="flex items-center gap-1 w-12 shrink-0 font-bold text-slate-300">
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>

                {/* Progress Bar Container */}
                <div className="flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 relative">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Percentage & Count Badge */}
                <div className="w-16 shrink-0 text-right flex items-center justify-end gap-1 font-mono text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">{percentage}%</span>
                  <span className="text-slate-600">({count})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
