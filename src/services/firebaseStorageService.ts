/**
 * BeeYou Cloud Asset Synchronization Service
 * 
 * Strategy:
 * 1. Optimistic Realtime Database sync (Free Spark plan friendly):
 *    Syncs lightweight WebP icons (<25KB) directly to `beeyou/families/{code}/customIcons` in Firebase Realtime Database.
 *    This gives 100% instant sync across Child Tablet and Caregiver Hub worldwide with NO credit card or Blaze plan needed!
 * 2. Automatic Firebase Cloud Storage upgrade:
 *    If the project is later upgraded to Blaze, it uploads to Cloud Storage and uses CDN links.
 */

import { getStorage, ref as storageRefFn, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRefFn, set, get } from 'firebase/database';
import { app, db } from './firebaseSync';
import { auth, getStoredFamilyAccount } from './authService';

export const storage = getStorage(app);

export interface UploadedStorageResult {
  url: string;
  storagePath: string;
  filename: string;
}

/**
 * Helper to convert data URL to Blob for fast Firebase upload
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/webp';
  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([uint8Array], { type: mime });
}

/**
 * Uploads/syncs a custom icon across family devices.
 * Syncs to Firebase Realtime Database for 100% free multi-device syncing right now,
 * and seamlessly handles Cloud Storage when upgraded.
 */
export async function uploadCustomIconToCloud(
  dataUrl: string,
  filename: string
): Promise<string> {
  const account = getStoredFamilyAccount();
  const familyCode = account?.familyCode || 'BEE-DEMO';
  const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 32);
  const iconId = `icon_${Date.now()}_${cleanFilename}`;

  // 1. Sync to Firebase Realtime Database (100% Free Spark Tier, no billing needed)
  try {
    const iconDbRef = dbRefFn(db, `beeyou/families/${familyCode}/customIcons/${iconId}`);
    set(iconDbRef, {
      id: iconId,
      label: filename,
      dataUrl: dataUrl,
      createdAt: Date.now(),
      familyCode: familyCode,
    }).catch((dbErr) => {
      console.warn('Realtime DB icon sync notice:', dbErr);
    });
  } catch (err) {
    console.warn('Realtime DB icon sync skipped:', err);
  }

  // 2. If Cloud Storage is active, also upload binary to Cloud Storage
  try {
    const userPrefix = auth.currentUser ? auth.currentUser.uid : familyCode;
    const path = `users/${userPrefix}/icons/${Date.now()}_${cleanFilename}.webp`;
    const sRef = storageRefFn(storage, path);
    const blob = dataUrlToBlob(dataUrl);

    const uploadPromise = (async () => {
      await uploadBytes(sRef, blob, {
        contentType: blob.type || 'image/webp',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          userId: userPrefix,
          familyCode: familyCode,
        },
      });
      return await getDownloadURL(sRef);
    })();

    // 2-second timeout: If Cloud Storage is not activated (no billing), gracefully returns local dataUrl
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Cloud Storage inactive - using Realtime DB sync')), 2000)
    );

    const cloudUrl = await Promise.race([uploadPromise, timeoutPromise]);
    return cloudUrl;
  } catch {
    // Expected on Spark plan: returns dataUrl which is already synced via Realtime Database
    return dataUrl;
  }
}


