import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-slate-100 text-slate-800 border-slate-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
};

export function Badge({ variant = 'default', children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 text-xs font-medium border rounded-full',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}