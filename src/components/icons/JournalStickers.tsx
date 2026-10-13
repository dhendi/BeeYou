import React from 'react';

interface StickerProps {
  className?: string;
  size?: number;
}

const renderStickerPng = (src: string, alt: string) => {
  const Component: React.FC<StickerProps> = ({ className = 'w-9 h-9', size }) => (
    <img
      src={src}
      alt={alt}
      className={`${className} object-contain select-none pointer-events-none drop-shadow-2xs`}
      style={size ? { width: size, height: size } : undefined}
      loading="eager"
      decoding="async"
    />
  );
  return Component;
};

// 🫧 Digital Fidgets (Watercolor shimmering bubbles)
export const FidgetBubblesSticker = renderStickerPng('/assets/stickers/fidget_bubbles.png', 'Fidget Bubbles');

// 🌬️ Calm Breathing (Watercolor breathing cloud with soft swirl)
export const BreathingCloudSticker = renderStickerPng('/assets/stickers/breathing_cloud.png', 'Calm Breathing Cloud');

// 🎡 Decision Wheel (Vintage carnival ferris wheel with pastel gondolas)
export const DecisionWheelSticker = renderStickerPng('/assets/stickers/decision_wheel.png', 'Decision Wheel');

// ⏱️ Countdown Timer / Pie Clock (Pocket stopwatch with terracotta pie slice)
export const CountdownTimerSticker = renderStickerPng('/assets/stickers/timer_clock.png', 'Countdown Timer Clock');

// 🚨 Ask for Help (SOS) (Watercolor emergency shield badge from reference)
export const ShieldSosSticker = renderStickerPng('/assets/stickers/help_sos.png', 'Help SOS Shield');

// 🔗 Connect Caregiver (Warm pink watercolor heart with bandaid from reference)
export const ConnectHeartSticker = renderStickerPng('/assets/stickers/caregiver_heart.png', 'Caregiver Heart');

// 🪪 About Me ID Card (Hand-drawn lanyard ID badge from reference)
export const IdCardSticker = renderStickerPng('/assets/stickers/about_id.png', 'About Me ID');

// 📖 Passport / Reading Book (Hand-drawn open book with bookmark from reference)
export const ReadingBookSticker = renderStickerPng('/assets/stickers/passport_book.png', 'Reading Book');

// 💬 Quick Phrases (Cute olive and tan speech bubbles from reference)
export const QuickPhrasesSticker = renderStickerPng('/assets/stickers/quick_phrases.png', 'Quick Phrases');

// ⌨️ Type to Speak Keyboard (Retro cream keyboard with L-enter key from reference)
export const KeyboardSticker = renderStickerPng('/assets/stickers/keyboard.png', 'Keyboard');

// 🌡️ Feelings & Thermometer (Golden heart with cute thermometer)
export const ThermometerSticker = renderStickerPng('/assets/stickers/feelings_thermometer.png', 'Feelings Thermometer');

// 💊 Medications & Health (Pastel pink and blue medicine capsules)
export const MedicationSticker = renderStickerPng('/assets/stickers/medications_health.png', 'Medications Health');

// 🌙 Evening Reflection (Smiling lavender crescent moon and night star)
export const EveningMoonSticker = renderStickerPng('/assets/stickers/evening_moon.png', 'Evening Moon');

// Routine, Wellness & Activity stickers
export const ToothbrushSticker = renderStickerPng('/assets/stickers/toothbrush.png', 'Toothbrush');
export const ToyBoxSticker = renderStickerPng('/assets/stickers/toy_box.png', 'Clean Up Toys');
export const GetDressedSticker = renderStickerPng('/assets/stickers/clothes_dressed.png', 'Get Dressed');
export const WashHandsSticker = renderStickerPng('/assets/stickers/soap_wash_hands.png', 'Wash Hands');
export const QuietTimeSticker = renderStickerPng('/assets/stickers/breathing_cloud.png', 'Quiet Time');
export const SpoonSticker = renderStickerPng('/assets/stickers/spoons_energy.png', 'Spoon Energy');
export const MoodJournalSticker = renderStickerPng('/assets/stickers/passport_book.png', 'Mood Journal');
export const TabletIpadSticker = renderStickerPng('/assets/stickers/tablet_ipad.png', 'Tablet iPad');

