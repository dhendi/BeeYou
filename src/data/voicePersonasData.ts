export interface VoicePersona {
  id: string;
  name: string;
  label: string;
  geminiVoice: string;
  style: string;
  category: 'kids' | 'teens' | 'caring_women' | 'pro_women' | 'caring_men' | 'pro_men' | 'system';
  categoryLabel: string;
  gender: 'child' | 'female' | 'male' | 'system';
  emoji: string;
  tagline: string;
  description: string;
  previewText: string;
}

/**
 * Explicit TTS Generation Version for Cache Invalidation & Audio Consistency.
 * Bump this version whenever:
 * 1. Voice persona style prompts or metadata instructions change.
 * 2. Audio-generation model (e.g. Gemini 3.8 Flash-Lite TTS), sample rate, or WAV container formatting changes.
 * 
 * Bumping this automatically invalidates:
 * - Browser CacheStorage (automatically cleans up previous beeyou-tts-v* caches)
 * - Client in-memory audio cache & HTTP stream URLs (&v=...)
 * - Server L1 RAM cache, L3 disk cache (.data/tts_cache), and cloud storage cache
 */
export const TTS_GENERATION_VERSION = 'v9';

export const VOICE_PERSONAS: VoicePersona[] = [
  // --- Group 0: Default Free System Voice (100% Free • On-Device • Zero Credits) ---
  {
    id: 'system',
    name: 'Default Free Voice (System Native)',
    label: 'Default Free Voice (System Native)',
    geminiVoice: '',
    style: 'standard',
    category: 'system',
    categoryLabel: 'Default Free Voice',
    gender: 'system',
    emoji: '',
    tagline: 'Default • 100% Free • On-Device',
    description: 'Uses your phone or computer’s built-in speech engine. Completely free with zero API credits used.',
    previewText: 'This is the default free voice built into your device.',
  },

  // --- Group 1: Kids & Little Ones (Calm, Warm, Youthful AAC) ---
  {
    id: 'puck',
    name: 'Puck',
    label: 'Puck (Soft Child)',
    geminiVoice: 'Puck',
    style: 'natural young child voice, smooth and fluid human speech, warm, friendly and cheerful, natural conversational intonation, clear everyday assistive speech',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Recommended • Fluid & Childlike',
    description: 'Natural child voice with fluid, friendly speech, warm conversational tone, and clear AAC pronunciation.',
    previewText: 'Hello. I am ready to communicate with BeeYou.',
  },
  {
    id: 'leda',
    name: 'Leda',
    label: 'Leda (Cozy Little Kid)',
    geminiVoice: 'Leda',
    style: 'sweet young child voice, smooth and fluid human speech, gentle, warm, cozy, natural melody, clear assistive speech',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Preschooler • Cozy & Steady',
    description: 'Sweet, cozy young child voice with natural cadence and warm, friendly tone.',
    previewText: 'Hi. I want to look at our pictures.',
  },
  {
    id: 'sadachbia',
    name: 'Sadachbia',
    label: 'Sadachbia (Little Explorer)',
    geminiVoice: 'Sadachbia',
    style: 'enthusiastic child voice, natural and fluid human speech, bright, articulate, clear and expressive everyday cadence',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Child • Articulate & Clear',
    description: 'Bright, articulate young voice with natural, engaging human cadence.',
    previewText: 'I finished my morning routine.',
  },
  {
    id: 'achernar',
    name: 'Achernar',
    label: 'Achernar (Gentle Whisper Child)',
    geminiVoice: 'Achernar',
    style: 'soft and gentle child voice, natural human speech, soothing, peaceful, smooth and comforting cadence',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Bedtime • Quiet & Low-Sensory',
    description: 'Ultra-gentle, soothing child tone designed for comforting, low-sensory communication.',
    previewText: 'Time for a quiet break and a deep breath.',
  },

  // --- Group 2: Teens & Youth (Relatable, Casual, Direct AAC) ---
  {
    id: 'fenrir',
    name: 'Fenrir',
    label: 'Fenrir (Teen Boy)',
    geminiVoice: 'Fenrir',
    style: 'natural modern teen male voice, smooth and fluid conversational speech, authentic, relaxed, clear and direct',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'male',
    emoji: '',
    tagline: 'Casual Teen • Natural & Direct',
    description: 'Everyday modern teen voice with smooth, natural articulation and authentic tone.',
    previewText: 'Ready to check off our schedule for today.',
  },
  {
    id: 'aoede',
    name: 'Aoede',
    label: 'Aoede (Teen Girl)',
    geminiVoice: 'Aoede',
    style: 'natural teen female voice, smooth and fluid human speech, warm, expressive, friendly and articulate',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'female',
    emoji: '',
    tagline: 'Teen Girl • Clear & Steady',
    description: 'Authentic teen female voice with smooth, expressive cadence and natural clarity.',
    previewText: 'This visual board makes everything clear.',
  },
  {
    id: 'callirrhoe',
    name: 'Callirrhoe',
    label: 'Callirrhoe (Chill Teen)',
    geminiVoice: 'Callirrhoe',
    style: 'casual teen female voice, natural human speech, mellow, smooth, friendly and relaxed conversational tone',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'female',
    emoji: '',
    tagline: 'Mellow • Relaxed & Even',
    description: 'Relaxed, smooth teenage cadence with a friendly, natural everyday tone.',
    previewText: 'No rush. We can take our time on each step.',
  },
  {
    id: 'autonoe',
    name: 'Autonoe',
    label: 'Autonoe (Upbeat Youth)',
    geminiVoice: 'Autonoe',
    style: 'bright youth female voice, natural and fluid human speech, encouraging, clear and articulate',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'female',
    emoji: '',
    tagline: 'Youth • Crisp & Clear',
    description: 'Encouraging, bright youth voice with fluid pacing and clear articulation.',
    previewText: 'Good job. You are doing well.',
  },

  // --- Group 3: Caring & Nurturing Women (Calm, Gentle, Warm) ---
  {
    id: 'kore',
    name: 'Kore',
    label: 'Kore (Nurturing Caregiver)',
    geminiVoice: 'Kore',
    style: 'warm maternal female voice, natural and fluid human speech, soothing, loving, patient and expressive',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Maternal • Calm & Steady',
    description: 'Soothing caregiver tone with natural, warm maternal warmth and clear expression.',
    previewText: 'You are safe, and we have a good schedule planned.',
  },
  {
    id: 'zephyr',
    name: 'Zephyr',
    label: 'Zephyr (Quiet Sensory Guide)',
    geminiVoice: 'Zephyr',
    style: 'peaceful, gentle female voice, natural human speech, smooth, serene, calming conversational delivery',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Sensory Calm • Soft & Peaceful',
    description: 'Quiet, serene, peaceful voice for calming, sensory-friendly AAC communication.',
    previewText: 'Let us take a quiet pause, breathe, and relax.',
  },
  {
    id: 'sulafat',
    name: 'Sulafat',
    label: 'Sulafat (Warm Compassion)',
    geminiVoice: 'Sulafat',
    style: 'compassionate adult female voice, natural and fluid human speech, supportive, warm, empathetic and reassuring',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Compassionate • Gentle & Direct',
    description: 'Supportive, empathetic female voice with natural, comforting human flow.',
    previewText: 'I am right here whenever you need help.',
  },
  {
    id: 'vindemiatrix',
    name: 'Vindemiatrix',
    label: 'Vindemiatrix (Peaceful Harmony)',
    geminiVoice: 'Vindemiatrix',
    style: 'gentle mindful female voice, natural human speech, smooth, patient, soothing and harmonious',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Mindful • Patient & Balanced',
    description: 'Patient, soothing pacing with smooth, fluid flow for calming routines.',
    previewText: 'Breathe in slowly, breathe out slowly.',
  },

  // --- Group 4: Professional & Clear Women (Teachers, Therapists & Coaches) ---
  {
    id: 'erinome',
    name: 'Erinome',
    label: 'Erinome (Clear Educator)',
    geminiVoice: 'Erinome',
    style: 'warm professional female educator, natural and fluid human speech, articulate, encouraging, clear instructional delivery',
    category: 'pro_women',
    categoryLabel: 'Professional Women',
    gender: 'female',
    emoji: '',
    tagline: 'Instructor • Articulate & Direct',
    description: 'Warm, articulate, encouraging instructional speech for learning and communication.',
    previewText: 'First we finish reading, then it is snack time.',
  },
  {
    id: 'despina',
    name: 'Despina',
    label: 'Despina (Speech Specialist)',
    geminiVoice: 'Despina',
    style: 'skilled female speech therapist, natural and fluid human speech, crystal-clear, articulate, friendly and engaging',
    category: 'pro_women',
    categoryLabel: 'Professional Women',
    gender: 'female',
    emoji: '',
    tagline: 'Therapist • Precise & Clear',
    description: 'Engaging, friendly speech with crystal-clear phonetic pronunciation for AAC.',
    previewText: 'Water. Please give me a cup of water.',
  },
  {
    id: 'algieba',
    name: 'Algieba',
    label: 'Algieba (Mindful Anchor)',
    geminiVoice: 'Algieba',
    style: 'grounded adult female voice, natural and fluid human speech, calm, reassuring, warm and balanced',
    category: 'pro_women',
    categoryLabel: 'Professional Women',
    gender: 'female',
    emoji: '',
    tagline: 'Guide • Grounded & Steady',
    description: 'Balanced, reassuring vocal presence for structured daily communication.',
    previewText: 'Next step: wash hands with warm water and soap.',
  },

  // --- Group 5: Caring & Warm Men (Paternal, Friendly & Reassuring) ---
  {
    id: 'achird',
    name: 'Achird',
    label: 'Achird (Friendly Big Brother / Dad)',
    geminiVoice: 'Achird',
    style: 'warm, friendly adult male voice, natural and fluid human speech, supportive, reassuring, brotherly and engaging',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Supportive • Steady & Direct',
    description: 'Supportive, warm male voice with natural, friendly conversational articulation.',
    previewText: 'Let us get our shoes on and head outside.',
  },
  {
    id: 'umbriel',
    name: 'Umbriel',
    label: 'Umbriel (Gentle Fatherly)',
    geminiVoice: 'Umbriel',
    style: 'warm paternal male voice, natural and fluid human speech, gentle, patient, deep and reassuring',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Fatherly • Reassuring & Patient',
    description: 'Deep, warm, reassuring fatherly tone with gentle, natural pacing.',
    previewText: 'Take your time. I am right here beside you.',
  },
  {
    id: 'zubenelgenubi',
    name: 'Zubenelgenubi',
    label: 'Zubenelgenubi (Relaxed Companion)',
    geminiVoice: 'Zubenelgenubi',
    style: 'casual friendly male voice, natural and fluid human speech, relaxed, upbeat, companionable and direct',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Buddy • Casual & Steady',
    description: 'Casual, relaxed companion voice with smooth, natural cadence.',
    previewText: 'Ready. Let us choose an activity together.',
  },

  // --- Group 6: Professional & Grounded Men (Mentors & Anchors) ---
  {
    id: 'iapetus',
    name: 'Iapetus',
    label: 'Iapetus (Clear Guide)',
    geminiVoice: 'Iapetus',
    style: 'grounded adult male mentor, natural and fluid human speech, articulate, encouraging, confident and clear',
    category: 'pro_men',
    categoryLabel: 'Professional Men',
    gender: 'male',
    emoji: '',
    tagline: 'Speech Coach • Crisp & Grounded',
    description: 'Confident, articulate male voice with smooth, natural clarity and warmth.',
    previewText: 'First complete your checklist, then free play.',
  },
  {
    id: 'sadaltager',
    name: 'Sadaltager',
    label: 'Sadaltager (Wise Mentor)',
    geminiVoice: 'Sadaltager',
    style: 'wise, warm adult male mentor, natural and fluid human speech, deep, dignified, kind and engaging',
    category: 'pro_men',
    categoryLabel: 'Professional Men',
    gender: 'male',
    emoji: '',
    tagline: 'Mentor • Deep & Dignified',
    description: 'Dignified, kind guidance with smooth, natural and engaging delivery.',
    previewText: 'Every small step forward is progress.',
  },
];

export const DEFAULT_VOICE_PERSONA_ID = 'system';

export function getVoicePersonaById(id?: string | null): VoicePersona {
  if (!id) return VOICE_PERSONAS[0];
  const clean = id.trim().toLowerCase();
  if (clean === 'default' || clean === 'free' || clean === 'system') {
    return VOICE_PERSONAS[0];
  }
  const found = VOICE_PERSONAS.find(
    (p) => p.id.toLowerCase() === clean || p.name.toLowerCase() === clean || p.geminiVoice.toLowerCase() === clean
  );
  return found || VOICE_PERSONAS[0];
}
