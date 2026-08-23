import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'gray';
  size?: 'sm' | 'md';
  hasDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  hasDot = false,
  className,
}) => {
  const variants = {
    blue: 'bg-brand-500/10 text-brand-400 border-brand-500/25 shadow-[0_0_12px_-3px_rgba(59,130,246,0.3)]',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25 shadow-[0_0_12px_-3px_rgba(6,182,212,0.3)]',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/25 shadow-[0_0_12px_-3px_rgba(139,92,246,0.3)]',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-[0_0_12px_-3px_rgba(245,158,11,0.3)]',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-[0_0_12px_-3px_rgba(244,63,94,0.3)]',
    gray: 'bg-slate-800/90 text-slate-300 border-slate-700/80',
  };

  const dotColors = {
    blue: 'bg-brand-400',
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    gray: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-lg border font-sans backdrop-blur-sm transition-all',
          variants[variant],
          sizes[size],
          className
        )
      )}
    >
      {hasDot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};
