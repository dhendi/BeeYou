import { UserPersona, UserAgeGroup } from '../types';

/**
 * Normalizes any legacy or alternate age group representation ('kid' | 'child') into standard UserPersona.
 */
export function normalizePersona(value?: string | null): UserPersona {
  if (value === 'adult') return 'adult';
  if (value === 'teen') return 'teen';
  return 'child';
}

/**
 * Converts a UserPersona into legacy UserAgeGroup ('kid' | 'teen' | 'adult')
 */
export function personaToAgeGroup(persona: UserPersona): 'kid' | 'teen' | 'adult' {
  if (persona === 'adult') return 'adult';
  if (persona === 'teen') return 'teen';
  return 'kid';
}

/**
 * Dynamic copy helper adapting labels to user persona.
 */
export function getPersonaLabel(
  persona: UserPersona,
  key: 
    | 'nameLabel' 
    | 'namePlaceholder' 
    | 'paywallSubtitle' 
    | 'dashboardGreetingSubtitle' 
    | 'onboardingTitle'
    | 'onboardingSubtitle'
    | 'adminLockTitle'
): string {
  switch (key) {
    case 'nameLabel':
      return persona === 'child' ? "CHILD'S NAME" : 'YOUR NAME';

    case 'namePlaceholder':
      return persona === 'child' ? "Enter child's name (e.g. Leo)" : 'Enter your name (e.g. Alex)';

    case 'paywallSubtitle':
      if (persona === 'adult') {
        return 'Unlock your complete executive independence toolkit with unlimited routines, soundscapes, and customizable themes.';
      }
      if (persona === 'teen') {
        return 'Get your complete low-sensory focus space with custom study beats, private reflections, and quiet tools.';
      }
      return 'Give your loved one or client the complete communication toolkit with unlimited routines, soundscapes, and customizable themes.';

    case 'dashboardGreetingSubtitle':
      if (persona === 'adult') {
        return 'Executive Minimal Dashboard • Energy Budget & Tools';
      }
      if (persona === 'teen') {
        return 'Lo-Fi Focus Space • Quick Sensory Resets';
      }
      return 'You can be yourself here • Today’s Dashboard';

    case 'onboardingTitle':
      if (persona === 'adult') return 'Personalize Your Space';
      if (persona === 'teen') return 'Setup Your Focus Hub';
      return 'Welcome to BeeYou';

    case 'onboardingSubtitle':
      if (persona === 'adult') return 'Tailor high-efficiency executive tools and sensory settings to your routine.';
      if (persona === 'teen') return 'A clean, low-profile toolkit designed for your independence.';
      return 'Let’s set up a warm, safe communication home for your child.';

    case 'adminLockTitle':
      return persona === 'child' ? 'Caregiver Pin Lock' : 'Settings Protection Lock';

    default:
      return '';
  }
}

/**
 * Persona theme tokens & style presets.
 */
export interface PersonaThemeTokens {
  persona: UserPersona;
  colorPalette: {
    bg: string;
    cardBg: string;
    cardBorder: string;
    accent: string;
    textPrimary: string;
    textMuted: string;
    subtleRing: string;
  };
  cardRadius: string;
  hasClaymorphism: boolean;
  hasMascot: boolean;
  suggestedThemeId: string;
}

export function getPersonaTokens(persona: UserPersona): PersonaThemeTokens {
  switch (persona) {
    case 'adult':
      return {
        persona: 'adult',
        colorPalette: {
          bg: 'bg-slate-950 text-slate-100',
          cardBg: 'bg-slate-900',
          cardBorder: 'border-slate-800',
          accent: '#0D9488', // teal-600
          textPrimary: 'text-slate-100',
          textMuted: 'text-slate-400',
          subtleRing: 'ring-slate-700',
        },
        cardRadius: 'rounded-xl',
        hasClaymorphism: false,
        hasMascot: false,
        suggestedThemeId: 'theme-sage',
      };

    case 'teen':
      return {
        persona: 'teen',
        colorPalette: {
          bg: 'bg-slate-900 text-slate-100',
          cardBg: 'bg-slate-800/90',
          cardBorder: 'border-slate-700/80',
          accent: '#8B5CF6', // violet-500
          textPrimary: 'text-slate-100',
          textMuted: 'text-slate-400',
          subtleRing: 'ring-slate-600',
        },
        cardRadius: 'rounded-2xl',
        hasClaymorphism: false,
        hasMascot: false,
        suggestedThemeId: 'theme-lofi',
      };

    case 'child':
    default:
      return {
        persona: 'child',
        colorPalette: {
          bg: 'bg-[#FFFBEB] text-slate-800',
          cardBg: 'bg-[#FCF9F2]',
          cardBorder: 'border-[#FDE68A]',
          accent: '#D97706', // warm honey amber-600
          textPrimary: 'text-slate-900',
          textMuted: 'text-amber-900/70',
          subtleRing: 'ring-amber-300',
        },
        cardRadius: 'rounded-3xl',
        hasClaymorphism: true,
        hasMascot: true,
        suggestedThemeId: 'theme-turtle',
      };
  }
}
