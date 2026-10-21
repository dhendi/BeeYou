export interface VoicePersona {
  id: string;
  name: string;
  label: string;
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
export const TTS_GENERATION_VERSION = 'v10';

export const VOICE_PERSONAS: VoicePersona[] = [
  // --- Group 0: Default Free System Voice (On-Device Built-In) ---
  {
    id: 'system',
    name: 'Default Free Voice (System Native)',
    label: 'Default Free Voice (System Native)',
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

  // --- Group 1: Kids & Youth (Warm, Friendly AAC) ---
  {
    id: 'amy',
    name: 'Amy',
    label: 'Amy (Cozy & Warm Child)',
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

  // --- Group 2: Teens & Young Adults (Relatable, Natural) ---
  {
    id: 'ryan',
    name: 'Ryan',
    label: 'Ryan (Natural Teen)',
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

  // --- Group 3: Clear Instructors & Narrators ---
  {
    id: 'lessac',
    name: 'Lessac',
    label: 'Lessac (Storybook Narrator)',
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

  // --- Group 4: Multilingual Native Voices ---
  {
    id: 'claude',
    name: 'Claude',
    label: 'Claude (Español Neutro)',
    piperVoice: 'es_MX-claude-high',
    geminiVoice: 'Fenrir',
    style: 'native Spanish speech, authentic cadence, Mexican / Latin American Spanish',
    category: 'multilingual',
    categoryLabel: 'Spanish',
    gender: 'male',
    emoji: '',
    tagline: 'Español • Voz Nativa',
    description: 'Voz neural nativa en español neutro con dicción clara y cadencia natural.',
    previewText: 'Hola. Estoy listo para comunicarme contigo.',
  },
  {
    id: 'davefx',
    name: 'Dave',
    label: 'Dave (Español España)',
    piperVoice: 'es_ES-davefx-medium',
    geminiVoice: 'Fenrir',
    style: 'native European Spanish speech, clear pronunciation',
    category: 'multilingual',
    categoryLabel: 'Spanish',
    gender: 'male',
    emoji: '',
    tagline: 'Castellano • Dicción Clara',
    description: 'Voz nativa de España con pronunciación articulada.',
    previewText: 'Buenos días. Vamos a revisar las tareas de hoy.',
  },
  {
    id: 'upmc',
    name: 'UPMC',
    label: 'UPMC (Français)',
    piperVoice: 'fr_FR-upmc-medium',
    geminiVoice: 'Kore',
    style: 'native French speech, natural liaisons and intonation',
    category: 'multilingual',
    categoryLabel: 'French',
    gender: 'female',
    emoji: '',
    tagline: 'Français • Voix Naturelle',
    description: 'Voix naturelle en français avec liaisons authentiques.',
    previewText: 'Bonjour. Je suis prêt à communiquer avec BeeYou.',
  },
];

export const DEFAULT_VOICE_PERSONA_ID = 'amy';

/**
 * Mapping of legacy Gemini persona IDs to modern Piper personas
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
