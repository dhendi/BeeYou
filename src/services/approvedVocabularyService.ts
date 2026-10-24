/**
 * Approved AAC Vocabulary Service
 *
 * Distinguishes approved static, built-in AAC vocabulary (safe for public edge CDN caching)
 * from arbitrary, custom user-entered phrases (which must be kept private and never stored
 * in shared public HTTP caches).
 */

import fs from 'fs';
import path from 'path';
import { ALL_AAC_VOCABULARY } from '../data/aacVocabularyCatalog';
import { DEFAULT_QUICK_PHRASES } from '../data/defaultData';

export function normalizeVocabularyKey(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text.trim().replace(/[.!?]+$/, '').toLowerCase();
}

// Set of all approved static vocabulary across English and supported translations
const approvedVocabularySet = new Set<string>();

let initialized = false;

export function initializeApprovedVocabulary(): Set<string> {
  if (initialized && approvedVocabularySet.size > 0) {
    return approvedVocabularySet;
  }

  // 1. Add baseline catalog items and quick phrases
  for (const item of ALL_AAC_VOCABULARY) {
    if (item.label) approvedVocabularySet.add(normalizeVocabularyKey(item.label));
    if (item.speechText) approvedVocabularySet.add(normalizeVocabularyKey(item.speechText));
  }

  for (const phrase of DEFAULT_QUICK_PHRASES) {
    if (phrase.text) approvedVocabularySet.add(normalizeVocabularyKey(phrase.text));
  }

  // Common core AAC spoken phrases tested and used in standard boards
  const standardCorePhrases = [
    'i am ready to learn and play',
    'yes',
    'no',
    'want',
    'more',
    'help',
    'stop',
    'go',
    'eat',
    'drink',
    'bathroom',
    'play',
    'sleep',
    'please',
    'thank you',
    'good morning',
    'good night',
    'hello',
    'goodbye',
    'tired',
    'happy',
    'sad',
    'scared',
    'angry',
    'calm',
    'fine',
    'okay',
    'ready',
  ];

  for (const phrase of standardCorePhrases) {
    approvedVocabularySet.add(normalizeVocabularyKey(phrase));
  }

  // 2. Load static locale dictionaries from public/locales
  try {
    const localesDir = path.resolve(process.cwd(), 'public/locales');
    if (fs.existsSync(localesDir)) {
      const files = fs.promises ? fs.readdirSync(localesDir) : [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const raw = fs.readFileSync(path.join(localesDir, file), 'utf-8');
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              for (const [key, value] of Object.entries(parsed)) {
                if (typeof key === 'string' && key.length <= 150) {
                  approvedVocabularySet.add(normalizeVocabularyKey(key));
                }
                if (typeof value === 'string' && value.length <= 150) {
                  approvedVocabularySet.add(normalizeVocabularyKey(value));
                }
              }
            }
          } catch {
            // Ignore individual locale read errors
          }
        }
      }
    }
  } catch {
    // Graceful fallback if locales directory is inaccessible
  }

  initialized = true;
  return approvedVocabularySet;
}

/**
 * Returns true if the given text matches an approved static or built-in AAC vocabulary phrase.
 * If false, the text is an arbitrary custom user-entered phrase that must never be cached
 * in shared public HTTP caches.
 */
export function isApprovedVocabulary(text: unknown): boolean {
  if (!text || typeof text !== 'string') return false;
  if (!initialized) {
    initializeApprovedVocabulary();
  }
  const normalized = normalizeVocabularyKey(text);
  if (!normalized) return false;
  return approvedVocabularySet.has(normalized);
}

/**
 * Determines the appropriate HTTP Cache-Control directive for TTS audio responses.
 * Approved reusable vocabulary receives public edge caching with 1-year immutable lifetime.
 * Arbitrary custom phrases receive strict private no-store headers.
 */
export function getTtsCacheControlDirective(text: unknown): string {
  if (isApprovedVocabulary(text)) {
    return 'public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400';
  }
  return 'private, no-cache, no-store, must-revalidate';
}
