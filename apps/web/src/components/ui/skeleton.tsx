import React from 'react';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-2xl bg-slate-200/80 ${className || 'h-6 w-full'}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}
