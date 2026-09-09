/**
 * Utility functions for Aura Cinema Portfolio
 */

/**
 * Extracts a YouTube Video ID from various URL formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - Raw video ID (11 chars)
 */
export function getYouTubeVideoId(url) {
  if (!url) return '';
  const trimmed = url.trim();
  
  // If user provided just the 11 character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  return match && match[2].length === 11 ? match[2] : '';
}

/**
 * Generates an embed-friendly YouTube URL
 */
export function getYouTubeEmbedUrl(url, { autoplay = false, mute = false, loop = false, fs = false } = {}) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return '';

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : '',
  });

  if (autoplay) params.set('autoplay', '1');
  if (mute) params.set('mute', '1');
  if (!fs) params.set('fs', '0'); // Hides YouTube internal fullscreen button to use wrapper container with watermark
  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Get YouTube high quality thumbnail fallback from video ID
 */
export function getYouTubeThumbnail(url) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80';
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Formats numbers into human-readable shorthand (e.g. 1,420 -> 1.4K, 1,200,000 -> 1.2M)
 */
export function formatViews(views) {
  if (views === null || views === undefined) return '0';
  const num = Number(views);
  if (isNaN(num)) return '0';
  
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

/**
 * Formats ISO date string into readable format (e.g., "Oct 2025")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Safely parse tags if passed as array, JSON string, or comma-separated string
 */
export function parseTags(tags) {
  if (Array.isArray(tags)) return tags;
  if (!tags) return [];
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Not JSON, split by comma
    }
    return tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
  }
  return [];
}
