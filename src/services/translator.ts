/**
 * Lightweight Zero-Bloat On-Demand Translator
 * Uses static public/locales/*.json + localStorage cache
 */

let currentLang = typeof window !== 'undefined' ? localStorage.getItem('beeyou_lang') || 'en' : 'en';
let dictionary: Record<string, string> = {};

// Load cached dictionary from localStorage on start
if (typeof window !== 'undefined' && currentLang !== 'en') {
  try {
    const cached = localStorage.getItem(`beeyou_dict_${currentLang}`);
    if (cached) dictionary = JSON.parse(cached);
  } catch {}
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
  } else {
    try {
      const res = await fetch(`/locales/${lang}.json`);
      if (res.ok) {
        dictionary = await res.json();
        localStorage.setItem(`beeyou_dict_${lang}`, JSON.stringify(dictionary));
      }
    } catch (e) {
      console.warn(`Could not load /locales/${lang}.json:`, e);
    }
  }

  window.dispatchEvent(new CustomEvent('beeyou_lang_changed', { detail: { lang } }));
}

export function t(text: string): string {
  if (!text || currentLang === 'en') return text;
  if (dictionary[text]) return dictionary[text];

  const trimmed = text.trim();
  if (dictionary[trimmed]) return dictionary[trimmed];

  const lower = trimmed.toLowerCase();
  for (const k in dictionary) {
    if (k.toLowerCase() === lower) return dictionary[k];
  }

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
        try {
          localStorage.setItem(`beeyou_dict_${currentLang}`, JSON.stringify(dictionary));
        } catch {}
        return data.translated;
      }
    }
  } catch {}
  return text;
}
