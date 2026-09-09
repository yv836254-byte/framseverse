import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden glass-card border border-[#E5E5E5] dark:border-[#262626] animate-shimmer flex flex-col">
      {/* 16:9 Thumbnail skeleton */}
      <div className="aspect-video w-full bg-neutral-200 dark:bg-neutral-800 relative">
        <div className="absolute top-3 left-3 w-20 h-5 rounded-md bg-neutral-300 dark:bg-neutral-700/60" />
        <div className="absolute bottom-3 right-3 w-12 h-4 rounded bg-neutral-300 dark:bg-neutral-700/60" />
      </div>

      {/* Card body skeleton */}
      <div className="p-4 space-y-3 flex-1 bg-[#F5F5F5] dark:bg-[#171717]">
        <div className="w-1/3 h-3 rounded bg-neutral-300 dark:bg-neutral-700/60" />
        <div className="w-4/5 h-5 rounded bg-neutral-300 dark:bg-neutral-700/60" />
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-3 rounded bg-neutral-200 dark:bg-neutral-800/60" />
          <div className="w-2/3 h-3 rounded bg-neutral-200 dark:bg-neutral-800/60" />
        </div>

        {/* Footer skeleton */}
        <div className="pt-3 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-12 h-4 rounded bg-neutral-300 dark:bg-neutral-700/60" />
            <div className="w-12 h-4 rounded bg-neutral-300 dark:bg-neutral-700/60" />
          </div>
          <div className="w-10 h-3 rounded bg-neutral-300 dark:bg-neutral-700/60" />
        </div>
      </div>
    </div>
  );
}
