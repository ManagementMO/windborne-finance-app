import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string;
  width?: string;
}

export function Skeleton({ className, height, width, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-slate-200 rounded', className)}
      style={{ height, width }}
      {...props}
    />
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-200">
      <td className="px-6 py-4">
        <div className="space-y-2">
          <Skeleton height="16px" width="120px" />
          <Skeleton height="14px" width="60px" />
        </div>
      </td>
      <td className="px-6 py-4">
        <Skeleton height="16px" width="80px" />
      </td>
      <td className="px-6 py-4">
        <Skeleton height="16px" width="60px" />
      </td>
      <td className="px-6 py-4">
        <Skeleton height="16px" width="80px" />
      </td>
      <td className="px-6 py-4">
        <div className="space-x-1">
          <Skeleton height="20px" width="60px" className="inline-block rounded-full" />
        </div>
      </td>
      <td className="px-6 py-4">
        <Skeleton height="16px" width="16px" />
      </td>
    </tr>
  );
}