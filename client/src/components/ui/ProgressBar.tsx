import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = true,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
          <span>Progress</span>
          <span className="text-brand-400">{percentage}%</span>
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 via-cyan-400 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
