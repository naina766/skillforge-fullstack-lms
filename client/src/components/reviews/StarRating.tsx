import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showNumeric?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showNumeric = false,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = interactive && hoverRating !== null ? hoverRating : rating;

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!interactive || !onRatingChange) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRatingChange(index);
    } else if (e.key === 'ArrowRight' && index < maxRating) {
      e.preventDefault();
      onRatingChange(index + 1);
    } else if (e.key === 'ArrowLeft' && index > 1) {
      e.preventDefault();
      onRatingChange(index - 1);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${rating} out of ${maxRating} stars`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= Math.floor(displayRating);
          const isHalf = !isFilled && starIndex <= Math.ceil(displayRating) && displayRating % 1 !== 0;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(starIndex)}
              onMouseEnter={() => interactive && setHoverRating(starIndex)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              onKeyDown={(e) => handleKeyDown(e, starIndex)}
              className={`${
                interactive
                  ? 'cursor-pointer transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-sm'
                  : 'cursor-default'
              } p-0.5`}
              tabIndex={interactive ? 0 : -1}
              aria-checked={interactive ? starIndex === rating : undefined}
              aria-label={`${starIndex} Star${starIndex > 1 ? 's' : ''}`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'fill-slate-800 text-slate-700'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showNumeric && (
        <span className="text-xs font-bold text-slate-200 ml-0.5">
          {rating > 0 ? rating.toFixed(1) : 'New'}
        </span>
      )}
    </div>
  );
};
