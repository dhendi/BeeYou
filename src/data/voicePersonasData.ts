export interface VoicePersona {
  id: string;
  name: string;
  label: string;
  language?: string;
  piperVoice?: string;
  geminiVoice?: string;
  style: string;
  category: 'kids' | 'teens' | 'caring_women' | 'pro_women' | 'caring_men' | 'pro_men' | 'multilingual' | 'system';
  categoryLabel: string;
  gender: 'child' | 'female' | 'male' | 'system';
  emoji: string;
  tagline: string;
  description: string;
  previewText: string;
}

/**
 * Explicit TTS Generation Version for Cache Invalidation & Audio Consistency.
 */
export const TTS_GENERATION_VERSION = 'v11';

export const VOICE_PERSONAS: VoicePersona[] = [
  // --- Group 0: Default Free System Voice (On-Device Built-In) ---
  {
    id: 'system',
    name: 'Default Free Voice (System Native)',
    label: 'Default Free Voice (System Native)',
    language: 'all',
    piperVoice: '',
    geminiVoice: '',
    style: 'standard',
    category: 'system',
    categoryLabel: 'Default Free Voice',
    gender: 'system',
    emoji: '',
    tagline: 'Default • On-Device',
    description: 'Uses your phone or computer built-in speech engine. Fast on-device fallback.',
    previewText: 'This is the default free voice built into your device.',
  },

  // --- Group 1: English - Kids & Youth (Warm, Friendly AAC) ---
  {
    id: 'amy',
    name: 'Amy',
    label: 'Amy (Cozy & Warm Child)',
    language: 'en',
    piperVoice: 'en_US-amy-medium',
    geminiVoice: 'Puck',
    style: 'warm friendly conversational female child voice, natural cadence, clear everyday AAC speech',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Recommended • Warm & Fluid',
    description: 'Warm, friendly on-device voice with natural cadence across multi-word sentences.',
    previewText: 'Hello. I am ready to communicate with BeeYou.',
  },
  {
    id: 'danny',
    name: 'Danny',
    label: 'Danny (Playful Youth)',
    language: 'en',
    piperVoice: 'en_US-danny-low',
    geminiVoice: 'Puck',
    style: 'energetic youthful boy tone, articulate, clear everyday speech',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Youthful • Energetic & Crisp',
    description: 'Energetic, youthful boy tone designed for quick, articulate AAC response.',
    previewText: 'Hi. I want to look at our pictures.',
  },
  {
    id: 'bryce',
    name: 'Bryce',
    label: 'Bryce (Gentle Boy)',
    language: 'en',
    piperVoice: 'en_US-bryce-medium',
    geminiVoice: 'Fenrir',
    style: 'gentle young male voice, calm, peaceful, reassuring cadence',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Gentle • Calm & Soothing',
    description: 'Calm, gentle young male tone for peaceful, low-sensory communication.',
    previewText: 'Time for a quiet break and a deep breath.',
  },

  // --- Group 2: English - Teens & Young Adults (Relatable, Natural) ---
  {
    id: 'ryan',
    name: 'Ryan',
    label: 'Ryan (Natural Teen)',
    language: 'en',
    piperVoice: 'en_US-ryan-medium',
    geminiVoice: 'Fenrir',
    style: 'clean modern teen male voice, natural human speech, friendly and direct',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'male',
    emoji: '',
    tagline: 'Natural Teen • Clear & Direct',
    description: 'Everyday modern teen voice with smooth, natural articulation and authentic tone.',
    previewText: 'Ready to check off our schedule for today.',
  },
  {
    id: 'kristin',
    name: 'Kristin',
    label: 'Kristin (Bright Teen)',
    language: 'en',
    piperVoice: 'en_US-kristin-medium',
    geminiVoice: 'Kore',
    style: 'bright youth female voice, encouraging, clear and articulate',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'female',
    emoji: '',
    tagline: 'Youth • Expressive & Clear',
    description: 'Encouraging, bright youth female voice with natural pacing and clarity.',
    previewText: 'Good job. You are doing well.',
  },
  {
    id: 'cori',
    name: 'Cori',
    label: 'Cori (British Youth)',
    language: 'en',
    piperVoice: 'en_GB-cori-medium',
    geminiVoice: 'Kore',
    style: 'expressive British youth female voice, crisp diction and friendly delivery',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'female',
    emoji: '',
    tagline: 'British Accent • Friendly & Crisp',
    description: 'Friendly British youth voice with natural cadence and clear articulation.',
    previewText: 'Hello there. Ready to get started with our visual schedule.',
  },

  // --- Group 3: English - Narrators & Companions ---
  {
    id: 'lessac',
    name: 'Lessac',
    label: 'Lessac (Storybook Narrator)',
    language: 'en',
    piperVoice: 'en_US-lessac-medium',
    geminiVoice: 'Aoede',
    style: 'expressive articulate narrator, crystal-clear pronunciation, rich cadence',
    category: 'pro_women',
    categoryLabel: 'Narrators & Coaches',
    gender: 'female',
    emoji: '',
    tagline: 'Narrator • Articulate & Precise',
    description: 'Expressive picture-book narrator voice with crystal-clear phonetic pronunciation.',
    previewText: 'Water. Please give me a cup of water.',
  },
  {
    id: 'joe',
    name: 'Joe',
    label: 'Joe (Warm Companion)',
    language: 'en',
    piperVoice: 'en_US-joe-medium',
    geminiVoice: 'Charon',
    style: 'warm friendly adult male voice, supportive, brotherly and reassuring',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Supportive • Steady & Reassuring',
    description: 'Supportive, warm male voice with natural, friendly conversational cadence.',
    previewText: 'Let us get our shoes on and head outside.',
  },
  {
    id: 'alan',
    name: 'Alan',
    label: 'Alan (British Articulate)',
    language: 'en',
    piperVoice: 'en_GB-alan-medium',
    geminiVoice: 'Charon',
    style: 'calm articulate British male voice, balanced tone and gentle cadence',
    category: 'pro_men',
    categoryLabel: 'Professionals',
    gender: 'male',
    emoji: '',
    tagline: 'British Accent • Calm & Articulate',
    description: 'Gentle, articulate British male voice designed for clear instructions.',
    previewText: 'Good morning. Let us review our plan for the day.',
  },

  // --- Group 4: Chinese (Mandarin / 中文) ---
  {
    id: 'huayan',
    name: 'Xiaobei / Huayan',
    label: 'Xiaobei / Huayan (Natural Chinese Child)',
    language: 'zh',
    piperVoice: 'zh_CN-huayan-medium',
    geminiVoice: 'Puck',
    style: 'natural Mandarin Chinese youth voice, warm cadence and authentic pronunciation',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Recommended • Natural & Articulate',
    description: 'Warm and natural on-device neural voice for Chinese AAC communication with fluent prosody.',
    previewText: '你好！我准备好和蜜蜂你一起交流了。',
  },
  {
    id: 'huayan_lite',
    name: 'Huayan Compact',
    label: 'Huayan Compact (Fast Chinese)',
    language: 'zh',
    piperVoice: 'zh_CN-huayan-x_low',
    geminiVoice: 'Puck',
    style: 'compact fast Mandarin Chinese voice with instant response',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Compact • Fast Response',
    description: 'Ultra-lightweight on-device Chinese neural voice with fast response.',
    previewText: '你好，今天我们一起来交流吧。',
  },

  // --- Group 5: Spanish (Español) ---
  {
    id: 'claude',
    name: 'Claude',
    label: 'Claude (Español Neutro / México)',
    language: 'es',
    piperVoice: 'es_MX-claude-high',
    geminiVoice: 'Fenrir',
    style: 'native Spanish speech, authentic cadence, Mexican / Latin American Spanish',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Español Neutro • Voz HD',
    description: 'Voz neural nativa en español neutro con dicción clara y cadencia natural.',
    previewText: 'Hola. Estoy listo para comunicarme contigo.',
  },
  {
    id: 'davefx',
    name: 'Dave',
    label: 'Dave (Español España)',
    language: 'es',
    piperVoice: 'es_ES-davefx-medium',
    geminiVoice: 'Fenrir',
    style: 'native European Spanish speech, clear pronunciation',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Castellano • Dicción Clara',
    description: 'Voz nativa de España con pronunciación articulada.',
    previewText: 'Buenos días. Vamos a revisar las tareas de hoy.',
  },
  {
    id: 'ald',
    name: 'Ald',
    label: 'Ald (Español México)',
    language: 'es',
    piperVoice: 'es_MX-ald-medium',
    geminiVoice: 'Fenrir',
    style: 'warm Mexican Spanish male voice, clear and friendly',
    category: 'pro_men',
    categoryLabel: 'Professionals',
    gender: 'male',
    emoji: '',
    tagline: 'México • Cálido y Amable',
    description: 'Voz cálida en español mexicano para comunicación diaria.',
    previewText: 'Hola, qué gusto saludarte hoy.',
  },
  {
    id: 'sharvard',
    name: 'Sharvard',
    label: 'Sharvard (Español Claro)',
    language: 'es',
    piperVoice: 'es_ES-sharvard-medium',
    geminiVoice: 'Kore',
    style: 'clear Spanish female voice, structured and articulate',
    category: 'pro_women',
    categoryLabel: 'Narrators & Coaches',
    gender: 'female',
    emoji: '',
    tagline: 'Español • Clara y Articulada',
    description: 'Voz femenina natural en español para narración y frases AAC.',
    previewText: 'Hola a todos. Hoy es un buen día para aprender.',
  },

  // --- Group 6: French (Français) ---
  {
    id: 'upmc',
    name: 'UPMC',
    label: 'UPMC (Français Naturel)',
    language: 'fr',
    piperVoice: 'fr_FR-upmc-medium',
    geminiVoice: 'Kore',
    style: 'native French speech, natural liaisons and intonation',
    category: 'pro_women',
    categoryLabel: 'Narrators & Coaches',
    gender: 'female',
    emoji: '',
    tagline: 'Français • Voix Naturelle',
    description: 'Voix naturelle en français avec liaisons authentiques.',
    previewText: 'Bonjour. Je suis prêt à communiquer avec BeeYou.',
  },
  {
    id: 'siwis',
    name: 'Siwis',
    label: 'Siwis (Français Doux)',
    language: 'fr',
    piperVoice: 'fr_FR-siwis-medium',
    geminiVoice: 'Kore',
    style: 'gentle pedagogical French female voice, smooth cadence',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Français • Calme et Doux',
    description: 'Voix douce et pédagogique en français pour les consignes et le quotidien.',
    previewText: 'Bonjour à tous. Passons une très belle journée ensemble.',
  },
  {
    id: 'tom',
    name: 'Tom',
    label: 'Tom (Français Jeune)',
    language: 'fr',
    piperVoice: 'fr_FR-tom-medium',
    geminiVoice: 'Fenrir',
    style: 'youthful French male voice, engaging and clear',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'male',
    emoji: '',
    tagline: 'Français • Dynamique et Clair',
    description: 'Voix jeune et dynamique en français pour les jeunes utilisateurs.',
    previewText: 'Salut ! Je suis prêt pour nos activités.',
  },

  // --- Group 7: German (Deutsch) ---
  {
    id: 'thorsten',
    name: 'Thorsten',
    label: 'Thorsten (Deutsch Natürlich)',
    language: 'de',
    piperVoice: 'de_DE-thorsten-medium',
    geminiVoice: 'Charon',
    style: 'natural German male voice, warm tone and authentic cadence',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Deutsch • Natürlich und Ruhig',
    description: 'Warme, natürliche deutsche Stimme mit klarer Aussprache.',
    previewText: 'Hallo. Ich bin bereit für unseren gemeinsamen Tag.',
  },
  {
    id: 'thorsten_high',
    name: 'Thorsten HD',
    label: 'Thorsten HD (Deutsch Studio)',
    language: 'de',
    piperVoice: 'de_DE-thorsten-high',
    geminiVoice: 'Charon',
    style: 'high-definition German male voice, studio clarity',
    category: 'pro_men',
    categoryLabel: 'Professionals',
    gender: 'male',
    emoji: '',
    tagline: 'Deutsch • Studioqualität',
    description: 'Hochauflösende deutsche Stimme für beste Sprachverständlichkeit.',
    previewText: 'Guten Tag. Ich begleite dich heute bei allen Aufgaben.',
  },

  // --- Group 8: Italian (Italiano) ---
  {
    id: 'paola',
    name: 'Paola',
    label: 'Paola (Italiano Naturale)',
    language: 'it',
    piperVoice: 'it_IT-paola-medium',
    geminiVoice: 'Kore',
    style: 'natural expressive Italian female voice',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Italiano • Voce Naturale',
    description: 'Voce italiana naturale, calma ed espressiva.',
    previewText: 'Ciao! Sono pronta a comunicare insieme a te con BeeYou.',
  },

  // --- Group 9: Portuguese (Português) ---
  {
    id: 'faber',
    name: 'Faber',
    label: 'Faber (Português Brasil)',
    language: 'pt',
    piperVoice: 'pt_BR-faber-medium',
    geminiVoice: 'Fenrir',
    style: 'warm Brazilian Portuguese male voice with friendly cadence',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Português • Voz Clara',
    description: 'Voz natural em português com entonação amigável.',
    previewText: 'Olá! Estou pronto para nos comunicarmos com o BeeYou.',
  },

  // --- Group 10: Russian (Русский) ---
  {
    id: 'irina',
    name: 'Irina',
    label: 'Irina (Русский)',
    language: 'ru',
    piperVoice: 'ru_RU-irina-medium',
    geminiVoice: 'Kore',
    style: 'pleasant articulate Russian female voice',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Русский • Естественный Голос',
    description: 'Приятный и четкий женский голос для общения.',
    previewText: 'Привет! Я готова общаться и помогать тебе каждый день.',
  },
  {
    id: 'denis',
    name: 'Denis',
    label: 'Denis (Русский)',
    language: 'ru',
    piperVoice: 'ru_RU-denis-medium',
    geminiVoice: 'Charon',
    style: 'clear expressive Russian male voice',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Русский • Чёткий Голос',
    description: 'Четкий мужской голос с хорошей артикуляцией.',
    previewText: 'Привет. Давай проверим наше расписание на сегодня.',
  },

  // --- Group 11: Vietnamese (Tiếng Việt) ---
  {
    id: 'vais',
    name: 'VAIS',
    label: 'VAIS (Tiếng Việt)',
    language: 'vi',
    piperVoice: 'vi_VN-vais1000-medium',
    geminiVoice: 'Kore',
    style: 'natural Vietnamese female voice with authentic tones',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Tiếng Việt • Tự Nhiên',
    description: 'Giọng nói tiếng Việt tự nhiên và rõ ràng.',
    previewText: 'Xin chào! Mình đã sẵn sàng đồng hành cùng bạn hôm nay.',
  },
];

export const DEFAULT_VOICE_PERSONA_ID = 'amy';

/**
 * Dedicated default voice personas mapped by language code.
 */
export const DEFAULT_LANGUAGE_VOICES: Record<string, string> = {
  en: 'amy',
  zh: 'huayan',
  es: 'claude',
  fr: 'upmc',
  fr_ca: 'upmc',
  de: 'thorsten',
  it: 'paola',
  pt: 'faber',
  ru: 'irina',
  vi: 'vais',
  ja: 'system',
  ko: 'system',
  el: 'system',
};

/**
 * Returns the dedicated default voice persona ID for a given language.
 */
export function getDefaultVoicePersonaForLanguage(lang: string = 'en'): string {
  const norm = (lang || 'en').toLowerCase().split(/[-_]/)[0];
  return DEFAULT_LANGUAGE_VOICES[norm] || 'amy';
}

/**
 * Returns only the voice personas that are dedicated to or compatible with a specific language.
 * Always includes the native free system voice as an accessible zero-storage option.
 */
export function getVoicePersonasForLanguage(lang: string = 'en'): VoicePersona[] {
  const norm = (lang || 'en').toLowerCase().split(/[-_]/)[0];
  return VOICE_PERSONAS.filter((p) => {
    if (p.category === 'system' || p.language === 'all') return true;
    const pLang = (p.language || 'en').toLowerCase().split(/[-_]/)[0];
    return pLang === norm;
  });
}

/**
 * Mapping of legacy Gemini persona IDs and language aliases to modern Piper personas
 * so existing saved settings seamlessly transition without breaking.
 */
const LEGACY_PERSONA_ALIASES: Record<string, string> = {
  puck: 'amy',
  leda: 'amy',
  fenrir: 'ryan',
  aoede: 'amy',
  callirrhoe: 'kristin',
  autonoe: 'amy',
  kore: 'amy',
  zephyr: 'amy',
  sulafat: 'amy',
  vindemiatrix: 'amy',
  erinome: 'lessac',
  despina: 'kristin',
  algieba: 'lessac',
  achird: 'ryan',
  umbriel: 'joe',
  zubenelgenubi: 'ryan',
  iapetus: 'lessac',
  sadaltager: 'lessac',
  sadachbia: 'danny',
  achernar: 'bryce',
  xiaobei: 'huayan',
};

export function getVoicePersonaById(id?: string | null): VoicePersona {
  if (!id) return VOICE_PERSONAS[1]; // Default to Amy
  const clean = id.trim().toLowerCase();
  if (clean === 'default' || clean === 'free' || clean === 'system') {
    return VOICE_PERSONAS[0];
  }

  // Check alias map first
  const mappedId = LEGACY_PERSONA_ALIASES[clean] || clean;

  const found = VOICE_PERSONAS.find(
    (p) =>
      p.id.toLowerCase() === mappedId ||
      p.name.toLowerCase() === mappedId ||
      (p.piperVoice && p.piperVoice.toLowerCase() === mappedId)
  );
  return found || VOICE_PERSONAS[1];
}
