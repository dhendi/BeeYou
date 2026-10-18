import { CoachMarkStep } from '../components/CoachMarksOverlay';

export type TourSectionId =
  | 'fullApp'
  | 'liveStatus'
  | 'pairing'
  | 'alerts'
  | 'nudges'
  | 'plansChanged'
  | 'healthSummary'
  | 'daySummary'
  | 'subscription';

export interface TourSectionMeta {
  id: TourSectionId;
  title: string;
  emoji?: string;
  stickerSrc?: string;
  description: string;
  tabId: string;
  steps: CoachMarkStep[];
}

export const SECTION_TOURS: Record<TourSectionId, TourSectionMeta> = {
  fullApp: {
    id: 'fullApp',
    title: 'Full Caregiver Hub Tour',
    stickerSrc: '/assets/stickers/star_gold.webp',
    description: 'A complete step-by-step walkthrough of the Caregiver Information & Alert Hub.',
    tabId: 'home',
    steps: [
      {
        targetSelector: '[data-tour="caregiver-live-card"]',
        title: '1. Live Child Status & Mood',
        instruction: "Shows your child's real-time connection, current activity, daily habits, and active pairing code.",
        mascotHint: 'Always see what your child is doing in real time.',
      },
      {
        targetSelector: '[data-tour="caregiver-quick-actions"]',
        title: '2. Instant Pairing & Device Link',
        instruction: "Scan your child's QR code or use your 6-digit family code to link devices instantly.",
        mascotHint: 'Connects devices in seconds.',
      },
      {
        targetSelector: '[data-tour="caregiver-alert-center"]',
        title: '3. Real-Time Safety & SOS Inbox',
        instruction: 'When your child asks for help or triggers an SOS, live emergency cards appear here with 1-tap reassurances.',
        mascotHint: 'Send instant reassurance messages to your child.',
      },
      {
        targetSelector: '[data-tour="caregiver-nudges-grid"]',
        title: '4. Spoken Announcements & Messages',
        instruction: "Tap any quick reassurance button or type a custom message to announce aloud on your child's tablet.",
        mascotHint: "Broadcasts voice reminders straight to your child's screen.",
      },
      {
        targetSelector: '[data-tour="caregiver-tab-plans-changed"]',
        title: '5. Plans Changed Alert System',
        instruction: 'When daily plans change unexpectedly, broadcast a calm visual explanation to eliminate transition stress.',
        mascotHint: 'Calms sudden unexpected schedule changes.',
      },
      {
        targetSelector: '[data-tour="caregiver-tab-health-summary"]',
        title: '6. Health & Refill Summary',
        instruction: 'Review active prescription schedules, today\'s taken doses, low stock refill alerts, and hormonal cycle rhythms.',
        mascotHint: 'Stay on top of prescriptions and refills.',
      },
      {
        targetSelector: '[data-tour="caregiver-tab-day-summary"]',
        title: '7. Day-to-Day Summary & Therapist Report',
        instruction: 'Review daily routine completion, mood reflections, and copy a formatted clinical report for therapists in 1 tap.',
        mascotHint: 'Copy clinical summaries ready for IEP or therapy meetings.',
      },
    ],
  },

  liveStatus: {
    id: 'liveStatus',
    title: 'Live Child Status & Mood',
    stickerSrc: '/assets/stickers/satellite_dish.webp',
    description: 'Learn how live connection, real-time emotions, and habit counters work.',
    tabId: 'home',
    steps: [
      {
        targetSelector: '[data-tour="status-connection-badge"]',
        title: 'Connection Status',
        instruction: "Shows whether you are currently paired live with your child's device. Green indicates active synchronization.",
        mascotHint: 'Green indicates active live pairing.',
      },
      {
        targetSelector: '[data-tour="status-mood-pill"]',
        title: 'Real-Time Emotion',
        instruction: "Displays your child's latest emotional check-in so you always know how they feel.",
        mascotHint: 'Updates automatically whenever your child checks in.',
      },
      {
        targetSelector: '[data-tour="status-activity-pill"]',
        title: 'Current Child Activity',
        instruction: 'Shows the exact screen or routine step your child is viewing right now.',
        mascotHint: 'Tells you which screen or tool they are using.',
      },
      {
        targetSelector: '[data-tour="status-habits-pill"]',
        title: 'Daily Habits Tracker',
        instruction: 'Tracks completed daily micro-routines like drinking water, taking deep breaths, and sensory breaks.',
        mascotHint: 'Celebrate every daily accomplishment.',
      },
      {
        targetSelector: '[data-tour="status-pairing-code-pill"]',
        title: '6-Digit Sync Code',
        instruction: 'Your active unique family pairing code to connect phones, tablets, or caregiver web portals.',
        mascotHint: 'Use this code to connect companion caregiver devices.',
      },
    ],
  },

  nudges: {
    id: 'nudges',
    title: 'Spoken Audio Nudges',
    stickerSrc: '/assets/stickers/spoken_megaphone.webp',
    description: "Broadcast spoken announcements and countdown reminders directly to your child's device.",
    tabId: 'home',
    steps: [
      {
        targetSelector: '[data-tour="nudges-grid-buttons"]',
        title: '1-Tap Quick Spoken Messages',
        instruction: 'Tap preset buttons like "5-Min Warning", "Meal Time", or "Proud of You" to speak aloud immediately.',
        mascotHint: 'Tap any button to broadcast voice reminders.',
      },
      {
        targetSelector: '[data-tour="nudges-custom-input"]',
        title: 'Custom Announcement Broadcaster',
        instruction: 'Type any personalized message or reminder and tap Send to announce it on your child\'s device.',
        mascotHint: 'Type your message and tap Send.',
      },
    ],
  },

  pairing: {
    id: 'pairing',
    title: 'Instant Device Pairing',
    stickerSrc: '/assets/stickers/pairing_qr_phone.webp',
    description: 'Connect caregiver phones and child tablets in seconds using QR codes or shared family code.',
    tabId: 'caregiver',
    steps: [
      {
        targetSelector: '[data-tour="pairing-qr-card"]',
        title: 'Instant QR Code Pairing',
        instruction: 'Scan this QR code with your smartphone camera to launch the companion caregiver portal without passwords.',
        mascotHint: 'Point your camera and open the link.',
      },
      {
        targetSelector: '[data-tour="pairing-code-display"]',
        title: '6-Letter Pairing Code',
        instruction: 'Type this 6-character code into any browser to link devices without scanning.',
        mascotHint: 'Type this code on companion devices.',
      },
      {
        targetSelector: '[data-tour="pairing-permissions-card"]',
        title: 'Remote Companion Portal',
        instruction: 'Provides full live sync and remote alert monitoring from your computer or phone.',
        mascotHint: 'Live remote companion monitoring.',
      },
    ],
  },

  alerts: {
    id: 'alerts',
    title: 'Safety & SOS Alerts Inbox',
    stickerSrc: '/assets/stickers/alert_sos_shield.webp',
    description: 'Receive instant alerts when your child needs help, requests a break, or triggers an SOS.',
    tabId: 'alerts',
    steps: [
      {
        targetSelector: '[data-tour="alerts-active-card"]',
        title: 'Active Emergency Alerts Card',
        instruction: 'When your child asks for help, needs a break, or triggers SOS, live alert banners appear here with audio chimes.',
        mascotHint: 'Urgent alerts appear here immediately.',
      },
      {
        targetSelector: '[data-tour="alerts-quick-reply-buttons"]',
        title: '1-Tap Instant Reassurances',
        instruction: 'Tap quick response buttons to send instant reassurance messages to your child\'s screen.',
        mascotHint: 'Reassure your child with a single tap.',
      },
      {
        targetSelector: '[data-tour="alerts-test-button"]',
        title: 'Simulate & Test Alert',
        instruction: 'Test your device chime and notification channels without causing alarm for your child.',
        mascotHint: 'Verify sound and notification delivery.',
      },
      {
        targetSelector: '[data-tour="alerts-history-list"]',
        title: 'Alerts Audit History Log',
        instruction: 'Review time-stamped history of previous help requests, break requests, and response times.',
        mascotHint: 'Keeps a secure record of all help calls.',
      },
    ],
  },

  plansChanged: {
    id: 'plansChanged',
    title: 'Plans Changed Alert System',
    stickerSrc: '/assets/stickers/story_plans_change.webp',
    description: 'Calm sudden schedule changes by broadcasting gentle visual explanations to your child.',
    tabId: 'plans-changed',
    steps: [
      {
        targetSelector: '[data-tour="plans-changed-toggle-card"]',
        title: 'Activate Schedule Change',
        instruction: 'Toggle this on when an unexpected event occurs (Rain cancelled park, Dentist moved, School delay).',
        mascotHint: 'Broadcasting prevents sudden transition distress.',
      },
      {
        targetSelector: '[data-tour="plans-changed-replacement-picker"]',
        title: 'Replacement Activity Picker',
        instruction: 'Choose what will happen instead with clear pictograms and reassuring messaging.',
        mascotHint: 'Providing a replacement restores predictability.',
      },
      {
        targetSelector: '[data-tour="plans-changed-message-input"]',
        title: 'Reassurance & Calming Note',
        instruction: "Type a comforting message that will appear on your child's screen in high-contrast text with speech.",
        mascotHint: 'Helps your child feel calm and supported.',
      },
    ],
  },

  healthSummary: {
    id: 'healthSummary',
    title: 'Health & Medication Summary',
    stickerSrc: '/assets/stickers/medications_health.webp',
    description: 'Track daily pill schedules, dosage times, and receive automatic warnings before refills run out.',
    tabId: 'health-summary',
    steps: [
      {
        targetSelector: '[data-tour="caregiver-tab-health-summary"]',
        title: 'Prescription Refill & Adherence',
        instruction: 'Review active prescription schedules, remaining pill counts, and urgent refill alerts.',
        mascotHint: 'Never run out of important prescriptions.',
      },
    ],
  },

  daySummary: {
    id: 'daySummary',
    title: 'Day-to-Day Summary & Therapist Report',
    stickerSrc: '/assets/stickers/routine_writing_journal.webp',
    description: 'Review daily routine adherence, mood check-ins, and 1-tap copy of clinical reports for therapy.',
    tabId: 'day-summary',
    steps: [
      {
        targetSelector: '[data-tour="caregiver-tab-day-summary"]',
        title: 'Clinical Summary & 1-Tap Copy',
        instruction: 'Copy a full clinical summary of routines, mood trends, and sensory triggers ready for IEP or therapy meetings.',
        mascotHint: 'One-click copy for therapists and educators.',
      },
    ],
  },

  subscription: {
    id: 'subscription',
    title: 'Membership & Plan',
    stickerSrc: '/assets/stickers/trial_crown.webp',
    description: 'Manage family subscription plans, 15-day free trial, and billing cycles.',
    tabId: 'subscription',
    steps: [
      {
        targetSelector: '[data-tour="caregiver-tab-subscription"]',
        title: 'Membership Plan',
        instruction: 'Displays your current tier (Basic Free, 15-Day Trial, or Premium) with remaining trial days.',
        mascotHint: 'Manage your family subscription.',
      },
    ],
  },
};
