import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'shimmer';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-950 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.015] active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white shadow-glow-blue focus:ring-brand-500 btn-shimmer',
    shimmer: 'bg-slate-900 border border-brand-500/40 text-slate-100 hover:border-brand-400 hover:text-white shadow-glow-blue btn-shimmer focus:ring-brand-500',
    secondary: 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-500 shadow-sm',
    outline: 'border border-brand-500/40 hover:border-brand-400 text-brand-400 hover:text-brand-200 bg-brand-500/5 hover:bg-brand-500/15 focus:ring-brand-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500 shadow-sm',
    ghost: 'text-slate-400 hover:text-white hover:bg-slate-800/60 focus:ring-slate-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
