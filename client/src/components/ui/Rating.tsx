import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  showValue?: boolean;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  showValue = true,
  count,
  size = 'sm',
}) => {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: max }).map((_, idx) => (
          <Star
            key={idx}
            className={`${iconSizes[size]} ${
              idx < Math.floor(value)
                ? 'fill-amber-400 text-amber-400'
                : idx < value
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-slate-700'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-slate-200">
          {value > 0 ? value.toFixed(1) : 'New'}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-slate-400">({count})</span>
      )}
    </div>
  );
};
