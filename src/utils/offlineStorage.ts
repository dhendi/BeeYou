import { AACItem, Routine, SocialStory, LifeSkill, DailyHabit, OfflineStorageStats } from '../types';

const DB_NAME = 'beeyou_offline_indexed_db';
const DB_VERSION = 1;
const LOCAL_INDEX_KEY = 'beeyou_offline_local_index_v1';

let dbInstance: IDBDatabase | null = null;

/**
 * Initializes IndexedDB storage for critical offline AAC, routines, and social stories.
 */
export async function openOfflineDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('aac_items')) {
          const store = db.createObjectStore('aac_items', { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('motorIndex', 'motorIndex', { unique: false });
        }
        if (!db.objectStoreNames.contains('routines')) {
          const store = db.createObjectStore('routines', { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
        }
        if (!db.objectStoreNames.contains('social_stories')) {
          db.createObjectStore('social_stories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('skills')) {
          db.createObjectStore('skills', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };

      request.onerror = (err) => {
        console.warn('IndexedDB could not be opened, using localStorage fallback index:', err);
        resolve(null);
      };
    } catch (e) {
      console.warn('IndexedDB initialization error:', e);
      resolve(null);
    }
  });
}

export interface OfflineIndexPayload {
  aacItems: AACItem[];
  routines: Routine[];
  socialStories: SocialStory[];
  skills: LifeSkill[];
  habits: DailyHabit[];
  childName?: string;
}

/**
 * Indexes all critical AAC, schedules, and social stories into both IndexedDB and LocalStorage Index
 */
export async function indexOfflineData(payload: OfflineIndexPayload): Promise<OfflineStorageStats> {
  const db = await openOfflineDB();
  const timestamp = new Date().toISOString();

  // 1. Dual-index in localStorage index map for instant synchronous zero-latency lookups
  try {
    const compactIndex = {
      timestamp,
      aacItems: payload.aacItems,
      routines: payload.routines,
      socialStories: payload.socialStories,
      skills: payload.skills,
      habits: payload.habits,
    };
    localStorage.setItem(LOCAL_INDEX_KEY, JSON.stringify(compactIndex));
  } catch (err) {
    console.warn('LocalStorage index write warning:', err);
  }

  // 2. Put into IndexedDB if supported
  let usedEngine: 'indexeddb' | 'localstorage_indexed' = 'localstorage_indexed';

  if (db) {
    try {
      usedEngine = 'indexeddb';
      const tx = db.transaction(
        ['aac_items', 'routines', 'social_stories', 'skills', 'habits', 'metadata'],
        'readwrite'
      );

      // Index AAC Items
      const aacStore = tx.objectStore('aac_items');
      aacStore.clear();
      payload.aacItems.forEach((item) => aacStore.put(item));

      // Index Routines
      const routineStore = tx.objectStore('routines');
      routineStore.clear();
      payload.routines.forEach((routine) => routineStore.put(routine));

      // Index Social Stories
      const storyStore = tx.objectStore('social_stories');
      storyStore.clear();
      payload.socialStories.forEach((story) => storyStore.put(story));

      // Index Life Skills
      const skillStore = tx.objectStore('skills');
      skillStore.clear();
      payload.skills.forEach((skill) => skillStore.put(skill));

      // Index Habits
      const habitStore = tx.objectStore('habits');
      habitStore.clear();
      payload.habits.forEach((habit) => habitStore.put(habit));

      // Index Metadata
      const metaStore = tx.objectStore('metadata');
      metaStore.put({
        key: 'sync_info',
        indexedAt: timestamp,
        childName: payload.childName || 'Child',
        aacCount: payload.aacItems.length,
        routinesCount: payload.routines.length,
        storiesCount: payload.socialStories.length,
        skillsCount: payload.skills.length,
        habitsCount: payload.habits.length,
      });

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB write transaction failed, falling back to local storage index:', e);
      usedEngine = 'localstorage_indexed';
    }
  }

  const voicesCount = typeof window !== 'undefined' && 'speechSynthesis' in window 
    ? window.speechSynthesis.getVoices().length 
    : 0;

  const stats: OfflineStorageStats = {
    indexedAt: timestamp,
    aacCount: payload.aacItems.length,
    routinesCount: payload.routines.length,
    storiesCount: payload.socialStories.length,
    skillsCount: payload.skills.length,
    habitsCount: payload.habits.length,
    storageEngine: usedEngine,
    isFullyCached: true,
    voicesCount,
  };

  return stats;
}

/**
 * Retrieve verified offline AAC items
 */
export async function getOfflineAAC(): Promise<AACItem[]> {
  const db = await openOfflineDB();
  if (db) {
    try {
      const tx = db.transaction('aac_items', 'readonly');
      const store = tx.objectStore('aac_items');
      const req = store.getAll();
      const items = await new Promise<AACItem[]>((resolve) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
      if (items.length > 0) return items;
    } catch (e) {
      // fallback
    }
  }

  // Local storage index fallback
  try {
    const raw = localStorage.getItem(LOCAL_INDEX_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.aacItems)) return parsed.aacItems;
    }
  } catch {}
  return [];
}

/**
 * Retrieve verified offline routines and schedule steps
 */
export async function getOfflineRoutines(): Promise<Routine[]> {
  const db = await openOfflineDB();
  if (db) {
    try {
      const tx = db.transaction('routines', 'readonly');
      const store = tx.objectStore('routines');
      const req = store.getAll();
      const items = await new Promise<Routine[]>((resolve) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
      if (items.length > 0) return items;
    } catch (e) {
      // fallback
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_INDEX_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.routines)) return parsed.routines;
    }
  } catch {}
  return [];
}

/**
 * Retrieve verified offline social stories
 */
export async function getOfflineSocialStories(): Promise<SocialStory[]> {
  const db = await openOfflineDB();
  if (db) {
    try {
      const tx = db.transaction('social_stories', 'readonly');
      const store = tx.objectStore('social_stories');
      const req = store.getAll();
      const items = await new Promise<SocialStory[]>((resolve) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
      if (items.length > 0) return items;
    } catch (e) {
      // fallback
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_INDEX_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.socialStories)) return parsed.socialStories;
    }
  } catch {}
  return [];
}

/**
 * Perform a full diagnostic check on offline readiness
 */
export async function verifyOfflineIntegrity(): Promise<{
  passed: boolean;
  serviceWorkerRegistered: boolean;
  indexedDbHealthy: boolean;
  localStorageHealthy: boolean;
  aacCount: number;
  routinesCount: number;
  storiesCount: number;
  offlineSpeechReady: boolean;
  storageEngine: string;
}> {
  let indexedDbHealthy = false;
  let serviceWorkerRegistered = false;
  let localStorageHealthy = false;
  let aacCount = 0;
  let routinesCount = 0;
  let storiesCount = 0;

  // 1. Service Worker check
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      serviceWorkerRegistered = regs.length > 0;
    } catch {
      serviceWorkerRegistered = false;
    }
  }

  // 2. IndexedDB check
  try {
    const db = await openOfflineDB();
    if (db) {
      indexedDbHealthy = true;
      const aac = await getOfflineAAC();
      const routines = await getOfflineRoutines();
      const stories = await getOfflineSocialStories();
      aacCount = aac.length;
      routinesCount = routines.length;
      storiesCount = stories.length;
    }
  } catch {
    indexedDbHealthy = false;
  }

  // 3. LocalStorage check
  try {
    const raw = localStorage.getItem(LOCAL_INDEX_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      localStorageHealthy = true;
      if (aacCount === 0 && parsed.aacItems) aacCount = parsed.aacItems.length;
      if (routinesCount === 0 && parsed.routines) routinesCount = parsed.routines.length;
      if (storiesCount === 0 && parsed.socialStories) storiesCount = parsed.socialStories.length;
    }
  } catch {
    localStorageHealthy = false;
  }

  const offlineSpeechReady = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const passed = (indexedDbHealthy || localStorageHealthy) && aacCount > 0 && routinesCount > 0;

  return {
    passed,
    serviceWorkerRegistered,
    indexedDbHealthy,
    localStorageHealthy,
    aacCount,
    routinesCount,
    storiesCount,
    offlineSpeechReady,
    storageEngine: indexedDbHealthy ? 'IndexedDB + LocalStorage Mirror' : 'LocalStorage Fast Index',
  };
}
