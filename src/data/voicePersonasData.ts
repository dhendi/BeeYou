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
export const TTS_GENERATION_VERSION = 'v8';

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

  // --- Group 1: Kids & Little Ones (Calm, Steady, Youthful AAC) ---
  {
    id: 'puck',
    name: 'Puck',
    label: 'Puck (Soft Child)',
    geminiVoice: 'Puck',
    style: 'natural child voice, calm and unhurried pace, softly monotone with even pitch, clear and articulate everyday assistive speech',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Recommended • Fluid & Childlike',
    description: 'Natural child voice with calm unhurried pacing, even monotone pitch, and clear AAC pronunciation.',
    previewText: 'Hello. I am ready to communicate with BeeYou.',
  },
  {
    id: 'leda',
    name: 'Leda',
    label: 'Leda (Cozy Little Kid)',
    geminiVoice: 'Leda',
    style: 'young child voice, calm, unhurried, softly monotone with even pitch, clear assistive speech',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Preschooler • Cozy & Steady',
    description: 'Quiet, steady little child voice with even, unhurried cadence.',
    previewText: 'Hi. I want to look at our pictures.',
  },
  {
    id: 'sadachbia',
    name: 'Sadachbia',
    label: 'Sadachbia (Little Explorer)',
    geminiVoice: 'Sadachbia',
    style: 'child voice, steady, unhurried, articulate, softly monotone with even pitch',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Child • Articulate & Clear',
    description: 'Clear, direct young voice with steady, structured cadence.',
    previewText: 'I finished my morning routine.',
  },
  {
    id: 'achernar',
    name: 'Achernar',
    label: 'Achernar (Gentle Whisper Child)',
    geminiVoice: 'Achernar',
    style: 'soft, quiet child voice, calm, unhurried, softly monotone with even pitch',
    category: 'kids',
    categoryLabel: 'Kids',
    gender: 'child',
    emoji: '',
    tagline: 'Bedtime • Quiet & Low-Sensory',
    description: 'Ultra-gentle, quiet bedtime tone designed for low sensory stimulation.',
    previewText: 'Time for a quiet break and a deep breath.',
  },

  // --- Group 2: Teens & Youth (Relatable, Casual, Direct AAC) ---
  {
    id: 'fenrir',
    name: 'Fenrir',
    label: 'Fenrir (Teen Boy)',
    geminiVoice: 'Fenrir',
    style: 'teen male voice, calm, relaxed, steady, softly monotone with even pitch, matter-of-fact assistive communication',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'male',
    emoji: '',
    tagline: 'Casual Teen • Natural & Direct',
    description: 'Everyday modern teen voice with direct, steady pronunciation.',
    previewText: 'Ready to check off our schedule for today.',
  },
  {
    id: 'aoede',
    name: 'Aoede',
    label: 'Aoede (Teen Girl)',
    geminiVoice: 'Aoede',
    style: 'teen female voice, calm, steady, softly monotone with even pitch, articulate and direct',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'female',
    emoji: '',
    tagline: 'Teen Girl • Clear & Steady',
    description: 'Authentic teen cadence with calm, clear assistive communication.',
    previewText: 'This visual board makes everything clear.',
  },
  {
    id: 'callirrhoe',
    name: 'Callirrhoe',
    label: 'Callirrhoe (Chill Teen)',
    geminiVoice: 'Callirrhoe',
    style: 'teen female voice, relaxed, steady, softly monotone, even-toned',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'female',
    emoji: '',
    tagline: 'Mellow • Relaxed & Even',
    description: 'Relaxed, unhurried pacing with an even, neutral tone.',
    previewText: 'No rush. We can take our time on each step.',
  },
  {
    id: 'autonoe',
    name: 'Autonoe',
    label: 'Autonoe (Upbeat Youth)',
    geminiVoice: 'Autonoe',
    style: 'young female voice, clear, articulate, steady, softly monotone with even pitch',
    category: 'teens',
    categoryLabel: 'Teens',
    gender: 'female',
    emoji: '',
    tagline: 'Youth • Crisp & Clear',
    description: 'Crisp, articulate speech with even, reliable pacing.',
    previewText: 'Good job. You are doing well.',
  },

  // --- Group 3: Caring & Nurturing Women (Calm, Gentle, Matter-of-Fact) ---
  {
    id: 'kore',
    name: 'Kore',
    label: 'Kore (Nurturing Caregiver)',
    geminiVoice: 'Kore',
    style: 'adult female voice, calm, steady, gentle, softly monotone with even pitch, matter-of-fact',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Maternal • Calm & Steady',
    description: 'Soothing caregiver tone with calm, even-tempered clarity.',
    previewText: 'You are safe, and we have a good schedule planned.',
  },
  {
    id: 'zephyr',
    name: 'Zephyr',
    label: 'Zephyr (Quiet Sensory Guide)',
    geminiVoice: 'Zephyr',
    style: 'low-energy, quiet adult female voice, calm, steady, softly monotone, even-toned',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Sensory Calm • Soft & Peaceful',
    description: 'Low-energy, quiet, gentle voice for sensory-sensitive AAC communication.',
    previewText: 'Let us take a quiet pause, breathe, and relax.',
  },
  {
    id: 'sulafat',
    name: 'Sulafat',
    label: 'Sulafat (Warm Compassion)',
    geminiVoice: 'Sulafat',
    style: 'adult female voice, calm, steady, softly monotone with even pitch, articulate and direct',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Compassionate • Gentle & Direct',
    description: 'Supportive, even cadence with clear assistive speech.',
    previewText: 'I am right here whenever you need help.',
  },
  {
    id: 'vindemiatrix',
    name: 'Vindemiatrix',
    label: 'Vindemiatrix (Peaceful Harmony)',
    geminiVoice: 'Vindemiatrix',
    style: 'adult female voice, calm, patient, steady, softly monotone, even-toned',
    category: 'caring_women',
    categoryLabel: 'Caring Women',
    gender: 'female',
    emoji: '',
    tagline: 'Mindful • Patient & Balanced',
    description: 'Patient, soothing pacing ideal for sensory transitions and AAC routines.',
    previewText: 'Breathe in slowly, breathe out slowly.',
  },

  // --- Group 4: Professional & Clear Women (Teachers, Therapists & Coaches) ---
  {
    id: 'erinome',
    name: 'Erinome',
    label: 'Erinome (Clear Educator)',
    geminiVoice: 'Erinome',
    style: 'adult female voice, articulate, structured, steady, neutral intonation, direct',
    category: 'pro_women',
    categoryLabel: 'Professional Women',
    gender: 'female',
    emoji: '',
    tagline: 'Instructor • Articulate & Direct',
    description: 'Structured, articulate, instructional speech for classroom and learning.',
    previewText: 'First we finish reading, then it is snack time.',
  },
  {
    id: 'despina',
    name: 'Despina',
    label: 'Despina (Speech Specialist)',
    geminiVoice: 'Despina',
    style: 'adult female speech specialist, articulate, clear, steady, neutral intonation, precise',
    category: 'pro_women',
    categoryLabel: 'Professional Women',
    gender: 'female',
    emoji: '',
    tagline: 'Therapist • Precise & Clear',
    description: 'Measured pacing with crystal-clear phonetic pronunciation for AAC.',
    previewText: 'Water. Please give me a cup of water.',
  },
  {
    id: 'algieba',
    name: 'Algieba',
    label: 'Algieba (Mindful Anchor)',
    geminiVoice: 'Algieba',
    style: 'adult female voice, grounded, steady, calm, neutral intonation, matter-of-fact',
    category: 'pro_women',
    categoryLabel: 'Professional Women',
    gender: 'female',
    emoji: '',
    tagline: 'Guide • Grounded & Steady',
    description: 'Steady, balanced vocal presence for structured daily communication.',
    previewText: 'Next step: wash hands with warm water and soap.',
  },

  // --- Group 5: Caring & Warm Men (Paternal, Friendly & Reassuring) ---
  {
    id: 'achird',
    name: 'Achird',
    label: 'Achird (Friendly Big Brother / Dad)',
    geminiVoice: 'Achird',
    style: 'adult male voice, calm, steady, neutral intonation, matter-of-fact assistive communication',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Supportive • Steady & Direct',
    description: 'Supportive male voice with calm, direct, natural articulation.',
    previewText: 'Let us get our shoes on and head outside.',
  },
  {
    id: 'umbriel',
    name: 'Umbriel',
    label: 'Umbriel (Gentle Fatherly)',
    geminiVoice: 'Umbriel',
    style: 'adult male voice, deep, calm, steady, neutral intonation, even-toned and direct',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Fatherly • Reassuring & Patient',
    description: 'Deep, calm, reassuring paternal tone with steady, even projection.',
    previewText: 'Take your time. I am right here beside you.',
  },
  {
    id: 'zubenelgenubi',
    name: 'Zubenelgenubi',
    label: 'Zubenelgenubi (Relaxed Companion)',
    geminiVoice: 'Zubenelgenubi',
    style: 'adult male voice, relaxed, steady, neutral intonation, matter-of-fact',
    category: 'caring_men',
    categoryLabel: 'Caring Men',
    gender: 'male',
    emoji: '',
    tagline: 'Buddy • Casual & Steady',
    description: 'Casual, relaxed companion voice with even, dependable pacing.',
    previewText: 'Ready. Let us choose an activity together.',
  },

  // --- Group 6: Professional & Grounded Men (Mentors & Anchors) ---
  {
    id: 'iapetus',
    name: 'Iapetus',
    label: 'Iapetus (Clear Guide)',
    geminiVoice: 'Iapetus',
    style: 'adult male voice, articulate, crisp, steady, neutral intonation, direct and even-toned',
    category: 'pro_men',
    categoryLabel: 'Professional Men',
    gender: 'male',
    emoji: '',
    tagline: 'Speech Coach • Crisp & Grounded',
    description: 'Crisp, articulate male voice with clear, even-toned speech clarity.',
    previewText: 'First complete your checklist, then free play.',
  },
  {
    id: 'sadaltager',
    name: 'Sadaltager',
    label: 'Sadaltager (Wise Mentor)',
    geminiVoice: 'Sadaltager',
    style: 'adult male voice, deep, articulate, steady, neutral intonation, calm and grounded',
    category: 'pro_men',
    categoryLabel: 'Professional Men',
    gender: 'male',
    emoji: '',
    tagline: 'Mentor • Deep & Dignified',
    description: 'Dignified, articulate guidance with calm, even-tempered delivery.',
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
