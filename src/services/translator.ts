/**
 * Lightweight Zero-Bloat On-Demand Translator
 * Uses static public/locales/*.json + localStorage cache + dynamic background translation
 */

let currentLang = typeof window !== 'undefined' ? localStorage.getItem('beeyou_lang') || 'en' : 'en';
let dictionary: Record<string, string> = {};
let lowerDictionary: Record<string, string> = {};
const pendingDynamicTranslations = new Set<string>();

function rebuildLowerDictionary() {
  lowerDictionary = {};
  for (const k in dictionary) {
    lowerDictionary[k.toLowerCase()] = dictionary[k];
  }
}

// Load cached dictionary from localStorage on start, and revalidate in background
if (typeof window !== 'undefined' && currentLang !== 'en') {
  try {
    const cached = localStorage.getItem(`beeyou_dict_${currentLang}`);
    if (cached) {
      dictionary = JSON.parse(cached);
      rebuildLowerDictionary();
    }
  } catch {}
  fetch(`/locales/${currentLang}.json`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data) {
        dictionary = { ...dictionary, ...data };
        rebuildLowerDictionary();
        try {
          localStorage.setItem(`beeyou_dict_${currentLang}`, JSON.stringify(dictionary));
        } catch {}
        window.dispatchEvent(new CustomEvent('beeyou_lang_changed', { detail: { lang: currentLang } }));
      }
    })
    .catch(() => {});
}

export function getLanguage(): string {
  return currentLang;
}

export async function setLanguage(lang: string): Promise<void> {
  currentLang = lang;
  if (typeof window === 'undefined') return;
  localStorage.setItem('beeyou_lang', lang);

  if (lang === 'en') {
    dictionary = {};
    lowerDictionary = {};
  } else {
    // 1. Instant synchronous load from localStorage cache if available
    try {
      const cached = localStorage.getItem(`beeyou_dict_${lang}`);
      if (cached) {
        dictionary = JSON.parse(cached);
        rebuildLowerDictionary();
      }
    } catch {}

    // 2. Fetch fresh static dictionary from server
    try {
      const res = await fetch(`/locales/${lang}.json`);
      if (res.ok) {
        const freshData = await res.json();
        dictionary = { ...dictionary, ...freshData };
        rebuildLowerDictionary();
        localStorage.setItem(`beeyou_dict_${lang}`, JSON.stringify(dictionary));
      }
    } catch (e) {
      console.warn(`Could not load /locales/${lang}.json:`, e);
    }
  }

  window.dispatchEvent(new CustomEvent('beeyou_lang_changed', { detail: { lang } }));
}

export function subscribeToLanguage(listener: (lang: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: any) => {
    listener(e?.detail?.lang || currentLang);
  };
  window.addEventListener('beeyou_lang_changed', handler);
  return () => {
    window.removeEventListener('beeyou_lang_changed', handler);
  };
}

export function t(text: string): string {
  if (!text || currentLang === 'en') return text;
  if (dictionary[text]) return dictionary[text];

  const trimmed = text.trim();
  if (dictionary[trimmed]) return dictionary[trimmed];

  const lower = trimmed.toLowerCase();
  if (lowerDictionary[lower]) return lowerDictionary[lower];

  // Handle slash compounds like "I / Me", "My/Mine", "Hurt / Pain", "Toilet / Potty"
  // Return only the primary word so it never speaks "slash" or repeats both options
  if (trimmed.includes(' / ')) {
    const parts = trimmed.split(' / ').map(p => t(p.trim()));
    return parts[0] || text;
  }
  if (trimmed.includes('/') && !trimmed.startsWith('http')) {
    const parts = trimmed.split('/').map(p => t(p.trim()));
    return parts[0] || text;
  }

  return text;
}

export function translateItem<T extends { label?: string; speechText?: string }>(item: T): T {
  if (!item || currentLang === 'en') return item;
  return {
    ...item,
    label: item.label ? t(item.label) : item.label,
    speechText: item.speechText ? t(item.speechText) : (item.label ? t(item.label) : item.speechText),
  };
}

export async function translateDynamic(text: string): Promise<string> {
  if (!text || currentLang === 'en') return text;
  if (dictionary[text]) return dictionary[text];
  try {
    const res = await fetch(`/api/translate?text=${encodeURIComponent(text)}&to=${currentLang}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.translated) {
        dictionary[text] = data.translated;
        lowerDictionary[text.toLowerCase()] = data.translated;
        try {
          localStorage.setItem(`beeyou_dict_${currentLang}`, JSON.stringify(dictionary));
        } catch {}
        return data.translated;
      }
    }
  } catch {}
  return text;
}
