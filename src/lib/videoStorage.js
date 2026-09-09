/**
 * Persistent Video Storage via IndexedDB
 * 
 * Ensures uploaded video files survive browser refreshes even in offline/local modes,
 * converting local blobs into persistent IndexedDB storage and issuing active Object URLs.
 */

const DB_NAME = 'frameverse_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'video_blobs';

// In-memory cache for active Object URLs to prevent redundant recreation
const activeUrlCache = new Map();

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a video file/blob to IndexedDB and return a persistent identifier
 */
export async function saveVideoBlob(file) {
  if (!file) return null;

  try {
    const db = await openDB();
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const record = {
      id: videoId,
      name: file.name || 'uploaded_video.mp4',
      type: file.type || 'video/mp4',
      size: file.size,
      blob: file,
      created_at: new Date().toISOString(),
    };

    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    // Create an immediate Object URL and cache it
    const objectUrl = URL.createObjectURL(file);
    activeUrlCache.set(videoId, objectUrl);

    // Return the persistent ID formatted as a custom URI
    return `indexeddb://${videoId}`;
  } catch (err) {
    console.warn('Failed to save video to IndexedDB, falling back to basic Object URL:', err);
    return URL.createObjectURL(file);
  }
}

/**
 * Retrieve a video blob by its ID
 */
export async function getVideoBlob(videoId) {
  if (!videoId) return null;
  const cleanId = videoId.replace('indexeddb://', '');

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cleanId);

      req.onsuccess = () => {
        resolve(req.result ? req.result.blob : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error reading video from IndexedDB:', err);
    return null;
  }
}

/**
 * Resolves any video URL:
 * - If it's an HTTP/HTTPS URL, returns it as-is
 * - If it's an 'indexeddb://...' URI, retrieves the blob and returns a valid active Object URL
 * - If it's an old revoked 'blob:...' URL, tries to find the most recent local video or returns as-is
 */
export async function resolvePlaybackUrl(videoUrl) {
  if (!videoUrl) return '';

  // Standard public web URLs (Supabase storage, CDNs, YouTube, etc.)
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    return videoUrl;
  }

  // Persistent IndexedDB video references
  if (videoUrl.startsWith('indexeddb://')) {
    const videoId = videoUrl.replace('indexeddb://', '');

    // Return cached URL if still valid
    if (activeUrlCache.has(videoId)) {
      return activeUrlCache.get(videoId);
    }

    // Retrieve blob from IndexedDB and create active Object URL
    const blob = await getVideoBlob(videoId);
    if (blob) {
      const newUrl = URL.createObjectURL(blob);
      activeUrlCache.set(videoId, newUrl);
      return newUrl;
    }
  }

  // If it's an expired blob: URL from a previous page lifecycle:
  if (videoUrl.startsWith('blob:')) {
    try {
      // Check if we have any stored video in IndexedDB to salvage
      const db = await openDB();
      const records = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      if (records.length > 0) {
        // Use the latest saved video
        const latest = records[records.length - 1];
        const newUrl = URL.createObjectURL(latest.blob);
        activeUrlCache.set(latest.id, newUrl);
        return newUrl;
      }
    } catch {
      // Proceed to return original
    }
  }

  return videoUrl;
}
