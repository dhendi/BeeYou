/**
 * One-time storage migration for the Lumina -> BeeYou rebrand.
 *
 * All persisted keys were renamed from `lumina_*` to `beeyou_*`. This copies any
 * existing data over so returning users keep their profile, AAC board, routines,
 * settings, etc. It runs before the app renders and never overwrites newer data.
 */
const OLD_PREFIX = 'lumina_';
const NEW_PREFIX = 'beeyou_';
const MIGRATION_FLAG = 'beeyou_migrated_from_lumina';

export function migrateLegacyStorage(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const ls = window.localStorage;
    if (ls.getItem(MIGRATION_FLAG)) return;

    const legacyKeys: string[] = [];
    for (let i = 0; i < ls.length; i++) {
      const key = ls.key(i);
      if (key && key.startsWith(OLD_PREFIX)) legacyKeys.push(key);
    }

    for (const oldKey of legacyKeys) {
      const newKey = NEW_PREFIX + oldKey.slice(OLD_PREFIX.length);
      const value = ls.getItem(oldKey);
      if (value !== null && ls.getItem(newKey) === null) {
        ls.setItem(newKey, value);
      }
    }

    ls.setItem(MIGRATION_FLAG, new Date().toISOString());
  } catch (e) {
    console.warn('BeeYou storage migration skipped:', e);
  }
}

migrateLegacyStorage();
