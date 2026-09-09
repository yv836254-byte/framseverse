import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize, Minimize, AlertCircle, RotateCcw } from 'lucide-react';
import VideoWatermark from './VideoWatermark';
import { getYouTubeEmbedUrl } from '../../lib/utils';
import { resolvePlaybackUrl } from '../../lib/videoStorage';

/**
 * VideoPlayer
 *
 * Professional cinema video player supporting both uploaded HTML5 videos and YouTube embeds.
 * Ensures the "FrameVerse" watermark overlay remains persistently visible and strictly
 * hugs the bottom-right corner of the ACTUAL VISIBLE VIDEO frame (never floating in black bars),
 * both in standard and fullscreen views.
 * Fullscreen is triggered directly on the parent wrapper container that holds both the video
 * and the watermark overlay.
 */
export default function VideoPlayer({
  videoType = 'youtube', // 'upload' | 'youtube'
  src = '',
  poster = '',
  title = 'FrameVerse Video Player',
  autoPlay = false,
  className = '',
  aspectRatio = 'aspect-video',
  onPlaying,
  onCanPlay,
}) {
  const wrapperRef = useRef(null);
  const contentBoxRef = useRef(null);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const hideControlsTimerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [intrinsicAspect, setIntrinsicAspect] = useState(null);
  const [contentBox, setContentBox] = useState(null);
  const [playableSrc, setPlayableSrc] = useState(src);

  const isUploadedVideo = videoType === 'upload';
  const embedUrl = !isUploadedVideo && src ? getYouTubeEmbedUrl(src, { autoplay: autoPlay, fs: false }) : '';

  // Asynchronously resolve playback URL (e.g. indexeddb:// or blob:)
  useEffect(() => {
    let isCancelled = false;
    if (isUploadedVideo && src && (src.startsWith('indexeddb://') || src.startsWith('blob:'))) {
      resolvePlaybackUrl(src)
        .then((url) => {
          if (!isCancelled && url) setPlayableSrc(url);
        })
        .catch(() => {
          if (!isCancelled) setPlayableSrc(src);
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [src, isUploadedVideo]);

  // Determine target aspect ratio for this video
  const getTargetAspect = useCallback(() => {
    if (isUploadedVideo && intrinsicAspect) {
      return intrinsicAspect;
    }
    if (!isUploadedVideo && src) {
      if (src.includes('/shorts/')) return 9 / 16;
    }
    if (aspectRatio) {
      if (aspectRatio.includes('9/16') || aspectRatio.includes('vertical')) return 9 / 16;
      if (aspectRatio.includes('4/3')) return 4 / 3;
      if (aspectRatio.includes('21/9')) return 21 / 9;
      if (aspectRatio.includes('1/1') || aspectRatio.includes('square')) return 1 / 1;
    }
    return 16 / 9;
  }, [isUploadedVideo, intrinsicAspect, src, aspectRatio]);

  // Recalculate rendered video content dimensions to perfectly fit within container without black bars inside contentBox
  const updateContentBox = useCallback(() => {
    const container = wrapperRef.current;
    if (!container) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    if (!containerW || !containerH) return;

    const targetAspect = getTargetAspect();
    const containerAspect = containerW / containerH;

    let width, height;
    if (containerAspect > targetAspect) {
      // Container is wider than video (pillarbox on sides)
      height = containerH;
      width = Math.round(containerH * targetAspect);
    } else {
      // Container is taller than video (letterbox on top/bottom)
      width = containerW;
      height = Math.round(containerW / targetAspect);
    }

    setContentBox({ width, height });
  }, [getTargetAspect]);

  // Observe container resize & fullscreen changes to recalculate content box immediately
  useEffect(() => {
    updateContentBox();

    const container = wrapperRef.current;
    let observer;
    if (typeof ResizeObserver !== 'undefined' && container) {
      observer = new ResizeObserver(() => {
        updateContentBox();
      });
      observer.observe(container);
    }

    window.addEventListener('resize', updateContentBox);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateContentBox);
    };
  }, [updateContentBox]);

  // Synchronize fullscreen state across standard and vendor-prefixed Fullscreen API
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      const isCurrentWrapperFullscreen =
        !!fsElement &&
        (fsElement === wrapperRef.current || wrapperRef.current?.contains(fsElement));

      setIsFullscreen(isCurrentWrapperFullscreen);

      // Re-measure content box after fullscreen layout completes
      setTimeout(updateContentBox, 50);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [updateContentBox]);

  // Direct, reliable, synchronous toggle for Fullscreen API called directly within user gesture
  const handleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        const promise = el.requestFullscreen();
        if (promise && typeof promise.catch === 'function') {
          promise.catch((err) => {
            console.warn('[VideoPlayer] requestFullscreen rejected:', err);
          });
        }
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        const promise = document.exitFullscreen();
        if (promise && typeof promise.catch === 'function') {
          promise.catch((err) => {
            console.warn('[VideoPlayer] exitFullscreen rejected:', err);
          });
        }
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  // Lock body scroll when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isFullscreen]);

  // Keyboard shortcut: Press 'F' to toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if ((e.key === 'f' || e.key === 'F') && (isHovered || isFullscreen)) {
        e.preventDefault();
        handleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, isFullscreen]);

  // Handle user activity to show/hide custom controls & button
  const triggerActivity = () => {
    setControlsVisible(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3500);
    }
  };

  const handleLoadedMetadata = (e) => {
    const { videoWidth, videoHeight } = e.currentTarget;
    if (videoWidth && videoHeight) {
      const aspect = videoWidth / videoHeight;
      console.log(`[VideoPlayer] HTML5 video metadata loaded: ${videoWidth}x${videoHeight} (aspect: ${aspect.toFixed(4)})`);
      setIntrinsicAspect(aspect);
    }
  };

  return (
    <div
      ref={wrapperRef}
      data-video-player="true"
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen max-w-none rounded-none border-none shadow-none m-0 p-0'
          : `relative w-full max-w-full ${aspectRatio} rounded-2xl sm:rounded-3xl`
      } flex items-center justify-center bg-[#000000] overflow-hidden select-none group transition-all duration-300 ${className}`}
      onMouseMove={triggerActivity}
      onTouchStart={triggerActivity}
      onClick={triggerActivity}
      onMouseEnter={() => {
        setIsHovered(true);
        triggerActivity();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (isPlaying) setControlsVisible(false);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 1. INNER VIDEO CONTENT BOX - Sized strictly to the actual visible video content */}
      <div
        ref={contentBoxRef}
        data-video-content-box="true"
        className="relative flex items-center justify-center overflow-hidden transition-all duration-150"
        style={
          contentBox
            ? {
                width: `${contentBox.width}px`,
                height: `${contentBox.height}px`,
                maxWidth: '100%',
                maxHeight: '100%',
              }
            : { width: '100%', height: '100%' }
        }
      >
        {isUploadedVideo ? (
          <div
            className="relative w-full h-full flex items-center justify-center bg-[#000000]"
            onDoubleClick={handleFullscreen}
          >
            <video
              ref={videoRef}
              src={playableSrc}
              controls
              controlsList="nofullscreen nodownload"
              disablePictureInPicture
              playsInline
              webkit-playsinline="true"
              preload="metadata"
              poster={poster}
              onContextMenu={(e) => e.preventDefault()}
              onLoadedMetadata={handleLoadedMetadata}
              onLoadedData={() => setIsBuffering(false)}
              onWaiting={() => setIsBuffering(true)}
              onSeeking={() => setIsBuffering(true)}
              onSeeked={() => setIsBuffering(false)}
              onCanPlayThrough={() => setIsBuffering(false)}
              onCanPlay={() => {
                setIsBuffering(false);
                setVideoError(null);
                if (videoRef.current?.videoWidth && videoRef.current?.videoHeight) {
                  setIntrinsicAspect(videoRef.current.videoWidth / videoRef.current.videoHeight);
                }
                onCanPlay?.();
              }}
              onPlaying={() => {
                setIsBuffering(false);
                setIsPlaying(true);
                setVideoError(null);
                onPlaying?.();
              }}
              onPause={() => {
                setIsBuffering(false);
                setIsPlaying(false);
                setControlsVisible(true);
              }}
              onError={(e) => {
                setIsBuffering(false);
                setIsPlaying(false);
                console.error('[VideoPlayer] Video stream error:', e);
                setVideoError('Video file could not be played. Please verify format (MP4/WebM) or check connection.');
              }}
              className="w-full h-full object-contain bg-[#000000]"
            >
              Your browser does not support the HTML5 video tag.
            </video>

            {/* Buffering Spinner */}
            {isBuffering && !videoError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#FF6B4A]/20 border-t-[#FF6B4A] animate-spin" />
                  <div className="absolute w-8 h-8 rounded-full bg-[#FF6B4A]/20 blur-sm" />
                </div>
                <span className="mt-3 text-xs tracking-widest uppercase font-mono text-[#FF6B4A] animate-pulse font-bold">
                  Buffering Stream...
                </span>
              </div>
            )}

            {/* Error & Retry Dialog */}
            {videoError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
                <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                <p className="text-sm font-semibold text-white">Playback Error</p>
                <p className="text-xs text-neutral-400 mt-1 max-w-md">{videoError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setVideoError(null);
                    setIsBuffering(true);
                    if (videoRef.current) {
                      videoRef.current.load();
                      videoRef.current.play().catch(() => setIsBuffering(false));
                    }
                  }}
                  className="btn-primary mt-4 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Playback</span>
                </button>
              </div>
            )}
          </div>
        ) : embedUrl ? (
          <div className="relative w-full h-full bg-[#000000]">
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 p-8 text-center font-mono text-xs bg-[#000000]">
            <p>No valid video source or embed URL provided.</p>
          </div>
        )}

        {/* 2. PERSISTENT "FrameVerse" WATERMARK */}
        {/* Strictly positioned at bottom-right corner of the ACTUAL VISIBLE VIDEO FRAME */}
        <VideoWatermark isFullscreen={isFullscreen} />
      </div>

      {/* 3. CUSTOM FULLSCREEN BUTTON (Requests fullscreen on wrapper container containing the watermark) */}
      <button
        id="video-fullscreen-btn"
        data-fullscreen-button="true"
        type="button"
        onClick={handleFullscreen}
        onMouseEnter={triggerActivity}
        onFocus={triggerActivity}
        className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-50 p-2 sm:p-2.5 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white hover:text-[#FF6B4A] transition-all duration-300 shadow-xl flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] cursor-pointer ${
          controlsVisible || !isPlaying || !isUploadedVideo
            ? 'opacity-90 hover:opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Enter Fullscreen (F)'}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? (
          <>
            <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B4A]" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider hidden sm:inline font-bold">
              Exit Fullscreen
            </span>
          </>
        ) : (
          <>
            <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider hidden sm:inline font-semibold">
              Fullscreen
            </span>
          </>
        )}
      </button>
    </div>
  );
}
