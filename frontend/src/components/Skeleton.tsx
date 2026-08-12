import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`animate-pulse rounded-md bg-zinc-800/60 ${className}`} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#121215] p-5 shadow-sm space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
};
