/**
 * BeeYou High-Capacity Storage Engine
 * Local-First IndexedDB Repository with asynchronous transactions and automatic localStorage fallback.
 * Allows storing gigabytes of AAC items, routine histories, medication doses, and mood logs without blocking the UI.
 */

const DB_NAME = 'beeyou_enterprise_v2';
const DB_VERSION = 2;

export interface StorageRecord {
  id: string;
  updatedAt: number;
  [key: string]: any;
}

class BeeYouStorageEngine {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private memoryCache: Map<string, any> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          
          const stores = [
            'aac_items',
            'routines',
            'medications',
            'medication_logs',
            'mood_journals',
            'cycle_logs',
            'alert_history',
            'sync_delta_queue',
            'app_kv'
          ];

          stores.forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        };

        req.onsuccess = (e) => {
          resolve((e.target as IDBOpenDBRequest).result);
        };

        req.onerror = (err) => {
          console.warn('IndexedDB failed to open, falling back to LocalStorage:', err);
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB initialization error:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  /**
   * Put or update a single item in a store
   */
  async setItem<T extends { id: string }>(storeName: string, item: T): Promise<void> {
    const db = await this.initDB();
    const enriched = {
      ...item,
      updatedAt: (item as any).updatedAt || Date.now()
    };

    if (db && db.objectStoreNames.contains(storeName)) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.put(enriched);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve(); // fallback gracefully
        } catch {
          resolve();
        }
      });
    }

    // Fallback: localStorage
    try {
      const key = `beeyou_store_${storeName}_${item.id}`;
      localStorage.setItem(key, JSON.stringify(enriched));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }

  /**
   * Bulk insert / update an array of items with a single transaction
   */
  async bulkSet<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
    if (!items || items.length === 0) return;
    const db = await this.initDB();

    if (db && db.objectStoreNames.contains(storeName)) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          items.forEach((item) => {
            store.put({
              ...item,
              updatedAt: (item as any).updatedAt || Date.now()
            });
          });
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }

    // Fallback: localStorage bulk array
    try {
      const key = `beeyou_store_bulk_${storeName}`;
      localStorage.setItem(key, JSON.stringify(items));
    } catch {}
  }

  /**
   * Retrieve all items in a store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.initDB();

    if (db && db.objectStoreNames.contains(storeName)) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result as T[]);
          req.onerror = () => resolve([]);
        } catch {
          resolve([]);
        }
      });
    }

    // Fallback
    try {
      const bulkKey = `beeyou_store_bulk_${storeName}`;
      const raw = localStorage.getItem(bulkKey);
      if (raw) return JSON.parse(raw) as T[];
    } catch {}
    return [];
  }

  /**
   * Delete an item by ID
   */
  async deleteItem(storeName: string, id: string): Promise<void> {
    const db = await this.initDB();

    if (db && db.objectStoreNames.contains(storeName)) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.delete(id);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }

    try {
      localStorage.removeItem(`beeyou_store_${storeName}_${id}`);
    } catch {}
  }

  /**
   * Generic KV Get/Set for app state
   */
  async setKV<T>(key: string, value: T): Promise<void> {
    await this.setItem('app_kv', { id: key, value, updatedAt: Date.now() });
  }

  async getKV<T>(key: string, defaultValue: T): Promise<T> {
    const db = await this.initDB();
    if (db && db.objectStoreNames.contains('app_kv')) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('app_kv', 'readonly');
          const store = tx.objectStore('app_kv');
          const req = store.get(key);
          req.onsuccess = () => {
            if (req.result && req.result.value !== undefined) {
              resolve(req.result.value as T);
            } else {
              resolve(defaultValue);
            }
          };
          req.onerror = () => resolve(defaultValue);
        } catch {
          resolve(defaultValue);
        }
      });
    }

    try {
      const raw = localStorage.getItem(`beeyou_kv_${key}`);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {}
    return defaultValue;
  }
}

export const storageEngine = new BeeYouStorageEngine();
