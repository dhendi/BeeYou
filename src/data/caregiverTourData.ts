import { CoachMarkStep } from '../components/CoachMarksOverlay';

export type TourSectionId =
  | 'fullApp'
  | 'liveStatus'
  | 'pairing'
  | 'alerts'
  | 'nudges'
  | 'routines'
  | 'medications'
  | 'plansChanged'
  | 'aac'
  | 'recollection'
  | 'moodJournal'
  | 'cycleTracker'
  | 'subscription'
  | 'voice'
  | 'offline'
  | 'adventures'
  | 'skills'
  | 'profile'
  | 'themes'
  | 'settings';

export interface TourSectionMeta {
  id: TourSectionId;
  title: string;
  emoji: string;
  description: string;
  tabId: string;
  steps: CoachMarkStep[];
}

export const SECTION_TOURS: Record<TourSectionId, TourSectionMeta> = {
  fullApp: {
    id: 'fullApp',
    title: 'Full Caregiver Hub Tour',
    emoji: '🌟',
    description: 'A complete step-by-step walkthrough covering every main tool and feature in the app.',
    tabId: 'home',
    steps: [
      {
        targetSelector: '[data-tour="caregiver-live-card"]',
        title: '1. Live Child Status & Mood',
        instruction: "Shows your child's real-time device connection, current emotion, completed daily habits, and active 6-digit sync code.",
        mascotHint: 'Always see what your child is doing! 📡',
      },
      {
        targetSelector: '[data-tour="caregiver-quick-actions"]',
        title: '2. Instant Pairing & Family Login',
        instruction: "Scan your child's QR code with your camera or log in with your shared family email to link devices instantly.",
        mascotHint: 'Connects devices in seconds! 📱',
      },
      {
        targetSelector: '[data-tour="caregiver-alert-center"]',
        title: '3. Real-Time Safety & SOS Inbox',
        instruction: 'When your child asks for help, requests a break, or triggers an SOS, live emergency cards appear here with 1-tap responses.',
        mascotHint: 'Tap "I\'m On My Way" to reassure your child! 🛡️',
      },
      {
        targetSelector: '[data-tour="caregiver-nudges-grid"]',
        title: '4. Spoken Nudges & Spoken Messages',
        instruction: "Tap any quick button (5-Min Warning, Meal Time, Medicine Time, Proud of You) or type a custom message to speak aloud on your child's tablet.",
        mascotHint: "Sends voice announcements straight to child's tablet! 💬",
      },
      {
        targetSelector: '[data-tour="caregiver-tab-routines"]',
        title: '5. Visual Routine Templates',
        instruction: 'Create morning, bedtime, school, and First/Then schedules with step timers and reward stickers to build daily independence.',
        mascotHint: 'Make daily routines easy and visual! 📅',
      },
      {
        targetSelector: '[data-tour="caregiver-tab-medications"]',
        title: '6. Medication & Refill Reminders',
        instruction: 'Set daily pill dosages and reminder times. Automatic alerts warn you before refills run out.',
        mascotHint: 'Never miss a dose or prescription! 💊',
      },
      {
        targetSelector: '[data-tour="caregiver-tab-plans-changed"]',
        title: '7. Plans Changed Alert System',
        instruction: 'When daily schedules change unexpectedly, broadcast a calm visual announcement to your child to eliminate transition stress.',
        mascotHint: 'Calms sudden unexpected schedule changes! ⚠️',
      },
      {
        targetSelector: '[data-tour="caregiver-tab-aac"]',
        title: '8. AAC Symbol Studio',
        instruction: 'Personalize communication boards using 3,400+ clinical Mulberry symbols, family photos, custom voices, and categories.',
        mascotHint: "Give your child their unique voice! 🗣️",
      },
      {
        targetSelector: '[data-tour="caregiver-tab-recollection"]',
        title: '9. Mood & Therapist Reports',
        instruction: 'Review daily mood trends, sensory patterns, and export easy summary charts for therapists and pediatricians.',
        mascotHint: 'Great for doctor & therapy visits! 📊',
      },
      {
        targetSelector: '[data-tour="caregiver-tab-settings"]',
        title: '10. PIN Security & Preferences',
        instruction: 'Protect caregiver controls with your custom 4-digit PIN lock and configure notification preferences.',
        mascotHint: 'Keeps caregiver settings safe & private! 🔒',
      },
    ],
  },

  liveStatus: {
    id: 'liveStatus',
    title: 'Live Child Status & Mood',
    emoji: '📡',
    description: 'Learn how live connection, real-time emotions, and habit counters work.',
    tabId: 'home',
    steps: [
      {
        targetSelector: '[data-tour="status-connection-badge"]',
        title: 'Connection Status',
        instruction: 'Shows whether you are currently paired live with your child\'s device. Green indicates active real-time synchronization.',
        mascotHint: 'Green = Connected and listening! 🟢',
      },
      {
        targetSelector: '[data-tour="status-mood-pill"]',
        title: 'Real-Time Emotion',
        instruction: 'Displays your child\'s latest emotional check-in (Happy 😊, Calm 😌, Overwhelmed 😫, Sad 😢) so you always know how they feel.',
        mascotHint: 'Updates automatically whenever child taps their mood! ❤️',
      },
      {
        targetSelector: '[data-tour="status-activity-pill"]',
        title: 'Current Child Activity',
        instruction: 'Shows the exact screen or routine step your child is viewing right now on their tablet or phone.',
        mascotHint: 'Live status tells you what screen they are on! 📱',
      },
      {
        targetSelector: '[data-tour="status-habits-pill"]',
        title: 'Daily Habits Tracker',
        instruction: 'Tracks completed daily micro-routines like drinking water, taking deep breaths, and sensory breaks.',
        mascotHint: 'Celebrate every daily win! ⭐',
      },
      {
        targetSelector: '[data-tour="status-pairing-code-pill"]',
        title: '6-Digit Sync Code',
        instruction: 'Your active unique family pairing code. Use this code to connect phones, tablets, or caregiver web portals.',
        mascotHint: 'Share this code to link other caregiver devices! 🔑',
      },
    ],
  },

  nudges: {
    id: 'nudges',
    title: 'Spoken Audio Nudges',
    emoji: '📣',
    description: 'Broadcast spoken voice announcements and countdown alerts directly to your child\'s device.',
    tabId: 'home',
    steps: [
      {
        targetSelector: '[data-tour="nudges-grid-buttons"]',
        title: '1-Tap Quick Spoken Nudges',
        instruction: 'Tap preset buttons like "5-Min Warning ⏳", "Meal Time 🍽️", or "Proud of You 🌟" to speak aloud in your child\'s AAC voice immediately.',
        mascotHint: 'Tap any button to broadcast voice instantly! 🔊',
      },
      {
        targetSelector: '[data-tour="nudges-custom-input"]',
        title: 'Custom Announcement Broadcaster',
        instruction: 'Type any personalized message or reminder (e.g. "Shoes on in 2 minutes, bus is coming!"). Tap Send to speak it aloud.',
        mascotHint: 'Type your message and tap Send! 💬',
      },
    ],
  },

  pairing: {
    id: 'pairing',
    title: 'Instant Device Pairing',
    emoji: '🔗',
    description: 'Connect caregiver phones and child tablets in seconds using QR codes or shared email.',
    tabId: 'caregiver',
    steps: [
      {
        targetSelector: '[data-tour="pairing-qr-card"]',
        title: 'Instant QR Code Pairing',
        instruction: 'Scan this high-contrast QR code with your smartphone camera to launch the companion caregiver portal without entering passwords.',
        mascotHint: 'Point your camera and tap the link! 📷',
      },
      {
        targetSelector: '[data-tour="pairing-code-display"]',
        title: '6-Letter Pairing Code',
        instruction: 'Type this 6-character code into any browser to link devices without scanning.',
        mascotHint: 'Type this code on other family devices! 🔡',
      },
      {
        targetSelector: '[data-tour="pairing-permissions-card"]',
        title: 'Remote Companion Portal',
        instruction: 'Provides full live sync and remote controls from your computer or phone.',
        mascotHint: 'Full remote companion dashboard! 🌐',
      },
    ],
  },

  alerts: {
    id: 'alerts',
    title: 'Safety & SOS Alerts Inbox',
    emoji: '🚨',
    description: 'Receive instant alerts when your child needs help, requests a break, or triggers an SOS.',
    tabId: 'alerts',
    steps: [
      {
        targetSelector: '[data-tour="alerts-active-card"]',
        title: 'Active Emergency Alerts Card',
        instruction: 'When your child asks for help, needs a break, or triggers SOS, live alert banners appear here with audio chimes.',
        mascotHint: 'Emergency cards appear here immediately! ⚠️',
      },
      {
        targetSelector: '[data-tour="alerts-quick-reply-buttons"]',
        title: '1-Tap Instant Reassurances',
        instruction: 'Tap "I\'m On My Way 🏃", "Take Deep Breaths 🫁", or "You Are Safe 🛡️" to send instant spoken responses to your child\'s screen.',
        mascotHint: 'Reassure your child in 1 tap! 💬',
      },
      {
        targetSelector: '[data-tour="alerts-test-button"]',
        title: 'Simulate & Test Alert',
        instruction: 'Test your device chime and notification channels without causing alarm for your child.',
        mascotHint: 'Always test sound & notifications! 🔔',
      },
      {
        targetSelector: '[data-tour="alerts-history-list"]',
        title: 'Alerts Audit History Log',
        instruction: 'Review time-stamped history of previous help requests, break requests, and response times.',
        mascotHint: 'Keeps a secure record of all help calls! 📜',
      },
    ],
  },

  routines: {
    id: 'routines',
    title: 'Visual Routine Templates & First/Then',
    emoji: '📅',
    description: 'Build step-by-step visual schedules, First/Then visual boards, and reward stickers.',
    tabId: 'routines',
    steps: [
      {
        targetSelector: '[data-tour="routines-subtabs"]',
        title: 'Routine Sub-Categories',
        instruction: 'Switch between Routine Templates, First/Then visual boards, and Daily Schedules.',
        mascotHint: 'Organize routines by morning, school, or bedtime! 📑',
      },
      {
        targetSelector: '[data-tour="routines-templates-list"]',
        title: 'Pre-Built Clinical Routines',
        instruction: 'Select from tested morning, bedtime, brushing teeth, and school preparation routines with built-in timers.',
        mascotHint: 'One-click import clinically validated schedules! ⏰',
      },
      {
        targetSelector: '[data-tour="routines-firstthen-card"]',
        title: 'First / Then Visual Board Generator',
        instruction: 'Create visual boards (e.g. "First Homework, Then iPad") to motivate transitions and eliminate power struggles.',
        mascotHint: 'Visual First/Then boards make expectations clear! 🧩',
      },
    ],
  },

  medications: {
    id: 'medications',
    title: 'Medication Reminders & Refill Tracker',
    emoji: '💊',
    description: 'Track daily pill schedules, dosage times, and receive automatic warnings before refills run out.',
    tabId: 'medications',
    steps: [
      {
        targetSelector: '[data-tour="meds-add-button"]',
        title: 'Add Prescription & Dosage',
        instruction: 'Add prescription name, dosage (e.g. 10mg), schedule times (Morning, Lunch, Bedtime), and total pill count.',
        mascotHint: 'Add vitamins, daily meds, or inhalers! ➕',
      },
      {
        targetSelector: '[data-tour="meds-list-card"]',
        title: 'Active Medication Schedule',
        instruction: 'Displays all scheduled medications for today with pill icons and remaining daily quantities.',
        mascotHint: 'Check off doses as they are taken! 📋',
      },
      {
        targetSelector: '[data-tour="meds-refill-alert"]',
        title: 'Low Stock & Refill Warnings',
        instruction: 'Warns you in advance when supply drops below your refill threshold so you never miss a pharmacy renewal.',
        mascotHint: 'Never run out of important prescriptions! ⚠️',
      },
      {
        targetSelector: '[data-tour="meds-mark-taken-btn"]',
        title: 'Mark Taken & Log Timestamp',
        instruction: 'Tap to confirm dose was taken. Automatically decrements inventory and logs the exact timestamp.',
        mascotHint: 'Logs taken time for safety & doctor visits! ✓',
      },
    ],
  },

  plansChanged: {
    id: 'plansChanged',
    title: 'Plans Changed Alert System',
    emoji: '⚠️',
    description: 'Calm sudden schedule changes by broadcasting gentle visual explanations to your child.',
    tabId: 'plans-changed',
    steps: [
      {
        targetSelector: '[data-tour="plans-changed-toggle-card"]',
        title: 'Activate Schedule Change',
        instruction: 'Toggle this on when an unexpected event occurs (Rain cancelled park, Dentist appointment moved, School delay).',
        mascotHint: 'Broadcasting prevents sudden meltdown distress! 📢',
      },
      {
        targetSelector: '[data-tour="plans-changed-replacement-picker"]',
        title: 'Replacement Activity Picker',
        instruction: 'Choose what will happen instead (e.g. "Instead of Soccer -> Board Game at Home") with clear pictograms.',
        mascotHint: 'Giving a replacement restores predictability! 🔄',
      },
      {
        targetSelector: '[data-tour="plans-changed-message-input"]',
        title: 'Reassurance & Calming Note',
        instruction: 'Type a comforting message that will appear on your child\'s screen in large, high-contrast text with speech.',
        mascotHint: 'Helps your child feel calm and supported! ❤️',
      },
    ],
  },

  aac: {
    id: 'aac',
    title: 'AAC Symbol Studio & Custom Vocab',
    emoji: '🗣️',
    description: 'Customize AAC communication boards with 3,400+ Mulberry symbols, family photos, and custom speech.',
    tabId: 'aac',
    steps: [
      {
        targetSelector: '[data-tour="aac-studio-categories"]',
        title: 'Industry Standard Pre-Built Packs',
        instruction: 'One-click import validated TouchChat and LAMP style vocabulary sets for School, Home, Emotions, and Mealtime.',
        mascotHint: 'Import hundreds of speech words in 1 tap! 📚',
      },
      {
        targetSelector: '[data-tour="aac-studio-search"]',
        title: 'Mulberry Clinical Symbol Search',
        instruction: 'Search over 3,400 high-contrast clinical AAC symbols by keyword or speech category.',
        mascotHint: 'Search any word to find its clinical symbol! 🔍',
      },
      {
        targetSelector: '[data-tour="aac-studio-add-button"]',
        title: 'Add Custom Symbol / Upload Photo',
        instruction: 'Upload family photos (e.g. Grandma, Family Dog, Favorite Blanket) and record personalized voice pronunciation.',
        mascotHint: 'Add real photos of loved ones and favorite toys! 📸',
      },
    ],
  },

  recollection: {
    id: 'recollection',
    title: 'Clinical Mood & Therapist Summary',
    emoji: '📊',
    description: 'Track daily regulation trends and export structured summary reports for therapists and IEPs.',
    tabId: 'recollection',
    steps: [
      {
        targetSelector: '[data-tour="recollection-chart-card"]',
        title: 'Day-to-Day Summary Chart',
        instruction: 'Visualizes daily mood fluctuations, identifying patterns in morning calm vs. evening sensory overload.',
        mascotHint: 'Spot emotional trends across the week! 📈',
      },
      {
        targetSelector: '[data-tour="recollection-metrics-grid"]',
        title: 'Sensory & Meltdown Frequency Log',
        instruction: 'Tracks the number of break requests, sensory overload events, and routine completions over time.',
        mascotHint: 'Invaluable data for therapists and pediatricians! 🧠',
      },
      {
        targetSelector: '[data-tour="recollection-export-btn"]',
        title: 'Export / Print Summary Report',
        instruction: 'Generate a clean summary report ready to share with IEP teams, speech therapists, and doctors.',
        mascotHint: 'Print or save PDF report in 1 click! 🖨️',
      },
    ],
  },

  moodJournal: {
    id: 'moodJournal',
    title: 'Mood & Self-Reflection Journal',
    emoji: '📖',
    description: 'Daily emotional reflections, voice notes, and sensory regulation logs.',
    tabId: 'mood-journal',
    steps: [
      {
        targetSelector: '[data-tour="journal-entries-feed"]',
        title: 'Reflection Entries Feed',
        instruction: 'Review daily journal entries, feelings tags, and notes on what helped your child regulate during tough moments.',
        mascotHint: 'A private space for family growth & notes! 📝',
      },
      {
        targetSelector: '[data-tour="journal-add-entry-card"]',
        title: 'Add New Journal Entry',
        instruction: 'Record notes, add audio voice recordings, and log sensory triggers from today.',
        mascotHint: 'Type or record voice reflections! 🎙️',
      },
    ],
  },

  cycleTracker: {
    id: 'cycleTracker',
    title: 'Cycle & Hormonal Rhythm',
    emoji: '🌸',
    description: 'Track hormonal phases and predict sensory sensitivity shifts.',
    tabId: 'cycle-tracker',
    steps: [
      {
        targetSelector: '[data-tour="cycle-phase-card"]',
        title: 'Current Cycle Phase & Day',
        instruction: 'Tracks current phase (Follicular, Ovulatory, Luteal, Menstrual) and predicted emotional energy levels.',
        mascotHint: 'Understand hormonal sensory shifts! 🌙',
      },
      {
        targetSelector: '[data-tour="cycle-symptoms-forecast"]',
        title: 'Sensory Sensitivity Forecast',
        instruction: 'Predicts heightened sensory sensitivity days so you can proactively adjust noise and schedule intensity.',
        mascotHint: 'Helps plan calming days in advance! 🕯️',
      },
    ],
  },

  subscription: {
    id: 'subscription',
    title: 'Membership & 30-Day Free Trial',
    emoji: '👑',
    description: 'Manage subscription plans, 30-day free trial, and billing cycles with $0 upfront.',
    tabId: 'subscription',
    steps: [
      {
        targetSelector: '[data-tour="subscription-tier-card"]',
        title: 'Current Membership Plan',
        instruction: 'Displays your current tier (Basic Free, 30-Day Trial, or Premium) with remaining trial days.',
        mascotHint: 'Shows your active plan & trial status! 👑',
      },
      {
        targetSelector: '[data-tour="subscription-billing-toggle"]',
        title: 'Monthly vs. Yearly Billing',
        instruction: 'Switch between monthly ($12.99/mo) and discounted annual billing ($129.99/yr, 2 months free).',
        mascotHint: 'Annual plans save 17% every year! 💰',
      },
      {
        targetSelector: '[data-tour="subscription-trial-button"]',
        title: 'Start 30-Day Free Trial',
        instruction: 'Unlock all 17 soundscapes, unlimited routines, and therapist clinical summaries with 1 tap.',
        mascotHint: 'Start with $0 today and cancel anytime! ✨',
      },
    ],
  },

  voice: {
    id: 'voice',
    title: 'Voice Customization & Testing',
    emoji: '🎙️',
    description: 'Audition and fine-tune natural speech voices, pacing speed, and natural pitch.',
    tabId: 'voice',
    steps: [
      {
        targetSelector: '[data-tour="voice-active-card"]',
        title: 'Active Voice Vocalizer',
        instruction: 'Shows which text-to-speech voice is currently powering your child\'s AAC speech buttons.',
        mascotHint: 'Listen to the current speaking voice! 🔊',
      },
      {
        targetSelector: '[data-tour="voice-pitch-rate-controls"]',
        title: 'Interactive Testing & Sliders',
        instruction: 'Type custom test phrases and adjust conversational pacing (0.96x) and natural pitch (1.0).',
        mascotHint: 'Adjust speed and pitch until it sounds natural! 🎚️',
      },
      {
        targetSelector: '[data-tour="voice-library-list"]',
        title: 'System Voice Library',
        instruction: 'Compare and audition every available offline and neural voice installed on your device.',
        mascotHint: 'Tap "Test" on any voice to hear how it speaks! 🎧',
      },
    ],
  },

  offline: {
    id: 'offline',
    title: 'Offline Readiness & Storage',
    emoji: '💾',
    description: 'Ensure all AAC pictograms, routines, and sensory tools work 100% without internet.',
    tabId: 'offline',
    steps: [
      {
        targetSelector: '[data-tour="offline-status-banner"]',
        title: 'Offline Readiness Status',
        instruction: 'Monitors service worker caching and local IndexedDB dual-storage health.',
        mascotHint: 'Green badge means 100% offline ready! 🛡️',
      },
      {
        targetSelector: '[data-tour="offline-reindex-btn"]',
        title: 'Verify & Re-Index Storage',
        instruction: 'Forces a fresh local storage sync of all custom words, social stories, and routines.',
        mascotHint: 'Tap to ensure all files are cached locally! ⚡',
      },
      {
        targetSelector: '[data-tour="offline-metrics-grid"]',
        title: 'Indexed Data Counts',
        instruction: 'Breakdown of indexed AAC pictograms, schedules, and offline audio files.',
        mascotHint: 'See how many words are saved on device! 📊',
      },
    ],
  },

  adventures: {
    id: 'adventures',
    title: 'Life Adventures & Contextual AAC',
    emoji: '🧭',
    description: 'Prepare for community outings like dentists, grocery stores, and haircuts with suggested phrases.',
    tabId: 'adventures',
    steps: [
      {
        targetSelector: '[data-tour="adventures-list-card"]',
        title: 'Life Adventure Scenarios',
        instruction: 'Step-by-step preparation guides for doctors, airports, barbers, restaurants, and playgrounds.',
        mascotHint: 'Helps prepare before heading out into the community! 🗺️',
      },
      {
        targetSelector: '[data-tour="adventures-phrases-card"]',
        title: 'Contextual Phrases',
        instruction: 'Surfaces relevant AAC phrases (e.g. "I want to pay", "Too loud here") automatically during this outing.',
        mascotHint: 'Gives the right words for the right location! 💬',
      },
    ],
  },

  skills: {
    id: 'skills',
    title: 'Independence Missions & Skills',
    emoji: '⭐',
    description: 'Break everyday tasks into rewarding micro-missions with star rewards.',
    tabId: 'skills',
    steps: [
      {
        targetSelector: '[data-tour="skills-missions-card"]',
        title: 'Task Analysis Missions',
        instruction: 'Step-by-step visual guides for hand washing, packing backpacks, dressing, and chores.',
        mascotHint: 'Step-by-step visual breakdowns build independence! 🧼',
      },
      {
        targetSelector: '[data-tour="skills-reward-badge"]',
        title: 'Star Coins & Gamification',
        instruction: 'Completing life skill missions awards star coins that unlock new themes, avatars, and stickers.',
        mascotHint: 'Motivates through positive encouragement! 🌟',
      },
    ],
  },

  profile: {
    id: 'profile',
    title: 'Profile & Emergency ID Card',
    emoji: '🪪',
    description: 'Manage child interests, pronouns, sensory sensitivities, and digital advocacy badge.',
    tabId: 'profile',
    steps: [
      {
        targetSelector: '[data-tour="profile-digital-id-card"]',
        title: 'Digital ID & Advocacy Badge',
        instruction: 'Emergency advocacy card with emergency phone numbers, communication tips, and calming strategies for first responders.',
        mascotHint: 'Essential emergency card for school & travel! 🪪',
      },
      {
        targetSelector: '[data-tour="profile-fields-card"]',
        title: 'Personalization & Interests',
        instruction: 'Customize favorite comfort items, special interests (e.g. Dinosaurs, Trains), and preferred pronouns.',
        mascotHint: 'Personalizes themes and avatar greetings! 🦖',
      },
    ],
  },

  themes: {
    id: 'themes',
    title: 'Custom Themes & Sensory Studio',
    emoji: '🎨',
    description: 'Choose ready-made themes or build personalized color palettes, mascots, and AAC emojis.',
    tabId: 'themes',
    steps: [
      {
        targetSelector: '[data-tour="themes-active-card"]',
        title: 'Currently Active Theme',
        instruction: 'Shows the equipped theme, mascot greeting, and customized AAC button color scheme.',
        mascotHint: 'See which mascot is currently active! 🐢',
      },
      {
        targetSelector: '[data-tour="themes-catalog-grid"]',
        title: 'Ready-Made Theme Catalog',
        instruction: 'Choose from 14+ neurodiversity-affirming themes like Jurassic Dino, Lily Frog, and Twilight Dark Mode.',
        mascotHint: 'Pick any theme to transform the entire app! 🌈',
      },
      {
        targetSelector: '[data-tour="themes-custom-studio-tab"]',
        title: 'Custom Theme Studio',
        instruction: 'Create your own custom theme with favorite colors, mascots, and custom AAC emojis.',
        mascotHint: 'Design your dream theme from scratch! ✨',
      },
    ],
  },

  settings: {
    id: 'settings',
    title: 'PIN Security & Safety Settings',
    emoji: '🔒',
    description: 'Set custom 4-digit PIN locks and configure caregiver safety preferences.',
    tabId: 'settings',
    steps: [
      {
        targetSelector: '[data-tour="settings-pin-card"]',
        title: '4-Digit Parent PIN Lock',
        instruction: 'Set or change your private 4-digit PIN. Prevents children from accidentally entering parent dashboard controls.',
        mascotHint: 'Keeps parent settings private & secure! 🔢',
      },
      {
        targetSelector: '[data-tour="settings-notifications-card"]',
        title: 'Alert & Sound Preferences',
        instruction: 'Choose alarm chimes, vibration intensity, and volume levels for emergency SOS notifications.',
        mascotHint: 'Customize notification sounds! 🔔',
      },
    ],
  },
};

export const SECTION_TOUR_LIST: TourSectionMeta[] = Object.values(SECTION_TOURS);
