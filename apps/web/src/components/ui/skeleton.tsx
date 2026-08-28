import React from 'react';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-2xl bg-slate-200/80 ${className || 'h-6 w-full'}`} />
  );
}

export function CardSkeleton({ count = 1, className }: { count?: number; className?: string }) {
  const cards = Array.from({ length: count });

  if (count === 1) {
    return (
      <div className={`bg-white p-5 rounded-3xl border border-amber-200/80 shadow-sm space-y-3 ${className || ''}`}>
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className || ''}`}>
      {cards.map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-sm space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}
