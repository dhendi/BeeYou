import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, getBytes, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * BeeYou Persistent Cloud Object Storage Service for TTS Audio
 * 
 * Solves Vercel Ephemeral Storage Limitation:
 * On Vercel serverless deployments, local disk (.data/tts_cache or /tmp) is ephemeral and
 * disappears when serverless instances spin down or new deployments occur.
 * 
 * This service provides durable, shared cross-instance cloud object storage using:
 * 1. Firebase Storage / Google Cloud Storage with deterministic object keys
 * 2. Vercel Edge CDN Cache-Control headers (s-maxage=31536000) for global edge acceleration
 * 3. Graceful degradation: If cloud storage is offline or unconfigured, falls back cleanly to local disk & memory
 */

export const STORAGE_BUCKET = 
  process.env.FIREBASE_STORAGE_BUCKET || 
  process.env.GCS_BUCKET ||
  process.env.VITE_FIREBASE_STORAGE_BUCKET || 
  'beeyou-23d7d.firebasestorage.app';

let storageInstance: any = null;

function getStorageClient() {
  if (storageInstance) return storageInstance;
  try {
    const config = {
      apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBQ9VPr9uSiJrOHrybnT4K24INfP9BIYHg',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'beeyou-23d7d.firebaseapp.com',
      projectId: process.env.FIREBASE_PROJECT_ID || 'beeyou-23d7d',
      storageBucket: STORAGE_BUCKET,
    };
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    storageInstance = getStorage(app);
    return storageInstance;
  } catch (err) {
    console.warn('[CloudTTSCache] Storage initialization notice:', err);
    return null;
  }
}

/**
 * Generates a deterministic, version-scoped object key for cloud storage:
 * Example: tts_cache/v4/puck/en/8d4db15d68531ff29aecb923ba505b9e.wav
 */
export function getDeterministicCloudKey(voiceKey: string, lang: string, hashKey: string, version: string = 'v4'): string {
  const cleanVoice = voiceKey.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const cleanLang = lang.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const cleanVersion = version.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return `tts_cache/${cleanVersion}/${cleanVoice}/${cleanLang}/${hashKey}.wav`;
}

/**
 * Fetch generated audio from persistent Cloud Object Storage (Firebase / GCS).
 * Returns Buffer if found, or null on cache miss.
 */
export async function getAudioFromCloudStorage(
  voiceKey: string,
  lang: string,
  hashKey: string,
  version: string = 'v4'
): Promise<Buffer | null> {
  const objectPath = getDeterministicCloudKey(voiceKey, lang, hashKey, version);

  // 1. Check direct HTTPS REST endpoint (Firebase Storage public CDN / GCS)
  try {
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(objectPath)}?alt=media`;
    const res = await fetch(publicUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      if (arrayBuf && arrayBuf.byteLength > 44) {
        console.log(`[TTS Cache HIT Cloud Storage] "${objectPath}" (${(arrayBuf.byteLength / 1024).toFixed(1)} KB) - 0 Gemini API calls ($0.00)`);
        return Buffer.from(arrayBuf);
      }
    }
  } catch {}

  // 2. Firebase Storage SDK fallback
  try {
    const storage = getStorageClient();
    if (storage) {
      const fileRef = ref(storage, objectPath);
      const arrayBuf = await getBytes(fileRef, 5 * 1024 * 1024); // max 5MB audio
      if (arrayBuf && arrayBuf.byteLength > 44) {
        console.log(`[TTS Cache HIT Cloud SDK] "${objectPath}" (${(arrayBuf.byteLength / 1024).toFixed(1)} KB) - 0 Gemini API calls ($0.00)`);
        return Buffer.from(arrayBuf);
      }
    }
  } catch {}

  return null;
}

/**
 * Asynchronously save generated audio to persistent Cloud Object Storage.
 * Fire-and-forget: does not block the client HTTP response.
 */
export async function saveAudioToCloudStorage(
  voiceKey: string,
  lang: string,
  hashKey: string,
  audioBuffer: Buffer,
  contentType = 'audio/wav',
  version: string = 'v4'
): Promise<void> {
  const objectPath = getDeterministicCloudKey(voiceKey, lang, hashKey, version);

  try {
    const storage = getStorageClient();
    if (storage) {
      const fileRef = ref(storage, objectPath);
      await uploadBytes(fileRef, audioBuffer, {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
        customMetadata: {
          voiceKey,
          lang,
          hashKey,
          generatedAt: new Date().toISOString(),
        },
      });
      console.log(`[CloudTTSCache] Uploaded to durable cloud storage: ${objectPath}`);
    }
  } catch (err: any) {
    // Non-fatal notice: cloud sync failure never disrupts client playback
    console.warn(`[CloudTTSCache] Cloud persist notice for ${objectPath}:`, err?.message || err);
  }
}

/**
 * Diagnostic status check for cloud storage integration
 */
export function getCloudStorageStatus(): {
  provider: string;
  bucket: string;
  configured: boolean;
  deterministicKeyPattern: string;
} {
  return {
    provider: 'Firebase Storage / Google Cloud Storage',
    bucket: STORAGE_BUCKET,
    configured: Boolean(STORAGE_BUCKET),
    deterministicKeyPattern: 'tts_cache/{voiceKey}/{normalizedLang}/{hashKey}.wav',
  };
}
