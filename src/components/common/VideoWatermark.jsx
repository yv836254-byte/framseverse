import React from 'react';

/**
 * VideoWatermark
 *
 * Persistent, semi-transparent "FrameVerse" text watermark for video players.
 * - Subtle (40-50% opacity), non-intrusive
 * - Positioned with small margin in bottom-right corner of the actual visible video content
 * - Uses pointer-events-none so player controls remain fully clickable
 * - Styled with the site's Electric Coral #FF6B4A accent and dark/light adaptive tones
 */
export default function VideoWatermark({ isFullscreen = false, className = '', style = {} }) {
  return (
    <div
      id="video-watermark"
      data-video-watermark="true"
      style={style}
      className={`absolute z-30 pointer-events-none select-none flex items-center gap-1.5 rounded-md sm:rounded-lg bg-black/60 backdrop-blur-md border border-white/20 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] transition-all duration-300 ${
        isFullscreen
          ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 px-3 py-1.5 text-xs sm:text-sm'
          : 'bottom-3 right-3 sm:bottom-4 sm:right-4 px-2.5 py-1 text-[10px] sm:text-xs'
      } font-mono uppercase tracking-widest font-semibold text-white/80 dark:text-white/75 ${className}`}
      aria-hidden="true"
    >
      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FF6B4A] shadow-[0_0_8px_#FF6B4A]" />
      <span className="tracking-widest">
        Frame<span className="text-[#FF6B4A] font-bold">Verse</span>
      </span>
    </div>
  );
}
