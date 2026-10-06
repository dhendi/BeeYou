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
    description: 'A complete step-by-step walkthrough covering every main tool and feature.',
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
        mascotHint: 'Know what routine step is in progress! 📱',
      },
      {
        targetSelector: '[data-tour="status-habits-pill"]',
        title: 'Daily Habits Completed',
        instruction: 'Tracks how many visual checklist items and positive daily habits your child has completed today.',
        mascotHint: 'Earns stars and stickers as tasks are finished! ⭐',
      },
      {
        targetSelector: '[data-tour="status-pairing-code-pill"]',
        title: '6-Digit Family Sync Code',
        instruction: 'This unique code is used to link child and caregiver devices without passwords or complex setups.',
        mascotHint: 'Type or scan this code on other devices to connect! 🔑',
      },
    ],
  },

  pairing: {
    id: 'pairing',
    title: 'Instant Device Pairing & Link',
    emoji: '📱',
    description: 'Learn how to connect phones, tablets, and caregiver accounts effortlessly.',
    tabId: 'caregiver',
    steps: [
      {
        targetSelector: '[data-tour="pairing-qr-card"]',
        title: 'Device Pairing QR Code',
        instruction: 'Point another camera at this QR code to connect instantly without typing any codes.',
        mascotHint: 'Scan with camera for 1-tap connection! 📷',
      },
      {
        targetSelector: '[data-tour="pairing-code-display"]',
        title: 'Manual 6-Digit Code',
        instruction: 'If you prefer typing, enter this 6-character code on the other device to establish a direct link.',
        mascotHint: 'Simple 6-character link code! 🔤',
      },
      {
        targetSelector: '[data-tour="pairing-permissions-card"]',
        title: 'Caregiver Remote Permissions',
        instruction: 'Control what caregiver devices can do: receive emergency SOS, send spoken audio nudges, or update AAC words.',
        mascotHint: 'Customize permission toggles anytime! ⚙️',
      },
    ],
  },

  alerts: {
    id: 'alerts',
    title: 'Safety & SOS Alert Inbox',
    emoji: '🚨',
    description: 'How real-time emergency help requests and 1-tap replies operate.',
    tabId: 'alerts',
    steps: [
      {
        targetSelector: '[data-tour="alerts-active-card"]',
        title: 'Live Emergency Alerts Banner',
        instruction: 'When your child taps "SOS Help" or "I Need a Break", an urgent vibrating alert sounds and appears here immediately.',
        mascotHint: 'Instant alerts keep your child safe! 🛡️',
      },
      {
        targetSelector: '[data-tour="alerts-quick-reply-buttons"]',
        title: '1-Tap Reassuring Replies',
        instruction: 'Tap "I\'m On My Way 🚗" or "I\'m Here For You ❤️" to send an instant spoken voice message to your child\'s screen.',
        mascotHint: 'Reassures child in seconds without calling! 💬',
      },
      {
        targetSelector: '[data-tour="alerts-test-button"]',
        title: 'Simulate Test Alert',
        instruction: 'Tap this button to trigger a practice alert and verify your notifications, chime sounds, and response flow.',
        mascotHint: 'Practice test alerts anytime! 🔔',
      },
      {
        targetSelector: '[data-tour="alerts-history-list"]',
        title: 'Alert History & Timestamp Log',
        instruction: 'Review past alerts with exact timestamps and response records for peace of mind or therapist review.',
        mascotHint: 'Complete safety audit log! 📋',
      },
    ],
  },

  nudges: {
    id: 'nudges',
    title: 'Spoken Audio Nudges & Reminders',
    emoji: '💬',
    description: 'Send predictable transition warnings and praise directly to child tablet.',
    tabId: 'home',
    steps: [
      {
        targetSelector: '[data-tour="nudges-grid-buttons"]',
        title: '1-Tap Audio Nudges',
        instruction: 'Tap preset buttons like 5-Min Warning ⏳, Meal Time 🥪, Medicine Time 💊, or Proud of You 🌟 to speak on the child\'s screen.',
        mascotHint: 'Clear, predictable audio cues reduce meltdowns! 🔊',
      },
      {
        targetSelector: '[data-tour="nudges-custom-input"]',
        title: 'Custom Spoken Message',
        instruction: 'Type any custom phrase (e.g. "Grandma is coming over in 10 minutes") and tap Send to broadcast it with clear speech synthesis.',
        mascotHint: 'Speaks whatever you type out loud! 🗣️',
      },
    ],
  },

  routines: {
    id: 'routines',
    title: 'Routine Templates & First/Then',
    emoji: '📅',
    description: 'Create predictable visual schedules, countdown timers, and reward stickers.',
    tabId: 'routines',
    steps: [
      {
        targetSelector: '[data-tour="routines-subtabs"]',
        title: 'Routine Categories & Views',
        instruction: 'Switch between the Clinical Template Library, Active Routines, and the Custom Schedule Creator.',
        mascotHint: 'Explore pre-built routines or make your own! 📚',
      },
      {
        targetSelector: '[data-tour="routines-templates-list"]',
        title: 'Clinical Schedule Templates',
        instruction: 'Browse evidence-based schedules for Morning, Bedtime, After School, Hygiene, and Sensory Calm routines.',
        mascotHint: '1-tap to clone and customize any template! 🌟',
      },
      {
        targetSelector: '[data-tour="routines-firstthen-card"]',
        title: 'First / Then Visual Boards',
        instruction: 'Pair a required task ("First: Clean up toys 🧸") with a motivating reward ("Then: 15m iPad 🎮") to build motivation.',
        mascotHint: 'First/Then visual structure builds cooperation! 💡',
      },
    ],
  },

  medications: {
    id: 'medications',
    title: 'Medication & Supply Reminders',
    emoji: '💊',
    description: 'Track daily pill schedules, dosage times, and low supply refill alerts.',
    tabId: 'medications',
    steps: [
      {
        targetSelector: '[data-tour="meds-list-card"]',
        title: 'Daily Medication Schedule',
        instruction: 'View all active medications, dosage amounts, and scheduled reminder times (Morning, Afternoon, Evening, Bedtime).',
        mascotHint: 'Keeps all daily prescriptions organized! 📋',
      },
      {
        targetSelector: '[data-tour="meds-mark-taken-btn"]',
        title: 'Mark Taken & Log Adherence',
        instruction: 'Tap "Mark Taken" when a dose is administered. BeeYou automatically deducts quantity and logs the timestamp.',
        mascotHint: 'Tracks exact administration history! ✓',
      },
      {
        targetSelector: '[data-tour="meds-refill-alert"]',
        title: 'Automatic Low-Stock Refill Alerts',
        instruction: 'When remaining pill stock falls below your threshold (e.g. 5 doses left), automatic refill warnings appear here.',
        mascotHint: 'Never run out of essential medication! ⚠️',
      },
      {
        targetSelector: '[data-tour="meds-add-button"]',
        title: 'Add New Prescription',
        instruction: 'Add new medications with custom dosages, instructions, pill counts, and reminder alarm times.',
        mascotHint: 'Add medications in seconds! ➕',
      },
    ],
  },

  plansChanged: {
    id: 'plansChanged',
    title: 'Plans Changed Alert System',
    emoji: '⚠️',
    description: 'Broadcast gentle transition warnings when daily schedules shift unexpectedly.',
    tabId: 'plans-changed',
    steps: [
      {
        targetSelector: '[data-tour="plans-changed-toggle-card"]',
        title: 'Activate Plans Changed Mode',
        instruction: 'Turn on this toggle when an unexpected disruption occurs (rain canceled park, doctor visit delayed, different school bus).',
        mascotHint: 'Instantly alerts child device calmly! 📢',
      },
      {
        targetSelector: '[data-tour="plans-changed-message-input"]',
        title: 'Change Description & Reassurance',
        instruction: 'Explain what changed in simple words (e.g. "We are going to the library instead of the playground today").',
        mascotHint: 'Clear explanations stop anxiety before it starts! 💬',
      },
      {
        targetSelector: '[data-tour="plans-changed-replacement-picker"]',
        title: 'Calm Replacement Activity',
        instruction: 'Select a comforting alternative task (Reading books, drawing, sensory break) to give child a positive new focus.',
        mascotHint: 'Offers a comforting alternative! 🎨',
      },
    ],
  },

  aac: {
    id: 'aac',
    title: 'AAC Symbol Studio & Custom Speech',
    emoji: '🗣️',
    description: 'Customize 3,400+ clinical Mulberry symbols, family photos, and custom speech.',
    tabId: 'aac',
    steps: [
      {
        targetSelector: '[data-tour="aac-studio-search"]',
        title: '3,400+ Clinical Symbol Search',
        instruction: 'Search the research-backed Mulberry Symbol library for clinical AAC pictograms across thousands of words.',
        mascotHint: 'Search any word to find clinical symbols! 🔍',
      },
      {
        targetSelector: '[data-tour="aac-studio-categories"]',
        title: 'Category Folders',
        instruction: 'Organize communication buttons into intuitive folders: Food 🍕, Drinks 🧃, Play 🎮, Feelings 😊, and Help 🆘.',
        mascotHint: 'Keeps vocabulary structured and easy to navigate! 📁',
      },
      {
        targetSelector: '[data-tour="aac-studio-add-button"]',
        title: 'Add Custom Photos & Words',
        instruction: 'Upload photos of family members, favorite snacks, toys, and pets with custom recorded speech pronunciation.',
        mascotHint: 'Personalize with real family photos! 📸',
      },
    ],
  },

  recollection: {
    id: 'recollection',
    title: 'Mood & Therapist Reports',
    emoji: '📊',
    description: 'Weekly emotional rhythm charts, sensory triggers, and printable doctor reports.',
    tabId: 'recollection',
    steps: [
      {
        targetSelector: '[data-tour="recollection-chart-card"]',
        title: '7-Day Emotional Trend Chart',
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
    title: 'Mood Journal & Self-Reflection',
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
