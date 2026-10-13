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

// Morning Routine & School Step Stickers
export const AlarmClockSticker = renderStickerPng('/assets/stickers/alarm_clock.png', 'Wake Up Alarm Clock');
export const ToiletSticker = renderStickerPng('/assets/stickers/toilet_restroom.png', 'Toilet Restroom');
export const PancakesSticker = renderStickerPng('/assets/stickers/pancakes_breakfast.png', 'Breakfast Pancakes');
export const BackpackSticker = renderStickerPng('/assets/stickers/backpack_school.png', 'School Backpack');
export const SneakersSticker = renderStickerPng('/assets/stickers/sneaker_shoes.png', 'Shoes Sneakers');
export const AppleSticker = renderStickerPng('/assets/stickers/apple_snack.png', 'Healthy Apple Snack');
export const FolderSticker = renderStickerPng('/assets/stickers/folder_schoolwork.png', 'School Binder Folder');
export const PencilSticker = renderStickerPng('/assets/stickers/pencil_write.png', 'Pencil Writing');
export const TeddyBearSticker = renderStickerPng('/assets/stickers/teddy_bear.png', 'Teddy Bear Play');
export const ShowerSticker = renderStickerPng('/assets/stickers/shower_wash.png', 'Shower Wash');
export const SchoolBusSticker = renderStickerPng('/assets/stickers/school_bus.png', 'School Bus');
export const ScienceFlaskSticker = renderStickerPng('/assets/stickers/science_flask.png', 'Science Flask');

/**
 * Universal component that replaces raw emojis in routines with cute hand-drawn journal stickers.
 * Optically weighted to maintain harmonious sizing across all steps.
 * Gracefully falls back to original emoji if no sticker exists for that specific action.
 */
export const RoutineStickerIcon: React.FC<{
  emoji?: string;
  title?: string;
  className?: string;
  size?: number;
}> = ({ emoji, title, className = 'w-8 h-8', size }) => {
  const normEmoji = (emoji || '').trim();
  const normTitle = (title || '').toLowerCase();

  // ⏰ Wake up
  if (normEmoji === '⏰' || normTitle.includes('wake')) return <AlarmClockSticker className={className} size={size} />;
  // 🚽 Toilet / restroom
  if (normEmoji === '🚽' || normTitle.includes('toilet') || normTitle.includes('bathroom') || normTitle.includes('restroom')) return <ToiletSticker className={className} size={size} />;
  // 🚿 Shower / wash face
  if (normEmoji === '🚿' || normTitle.includes('shower') || normTitle.includes('wash face') || normTitle.includes('bath')) return <ShowerSticker className={className} size={size} />;
  // 👕 Get dressed
  if (normEmoji === '👕' || normTitle.includes('dress') || normTitle.includes('clothes') || normTitle.includes('shirt')) return <GetDressedSticker className={className} size={size} />;
  // 🪥 Toothbrush
  if (normEmoji === '🪥' || normTitle.includes('teeth') || normTitle.includes('brush')) return <ToothbrushSticker className={className} size={size} />;
  // 🥞 Breakfast
  if (normEmoji === '🥞' || normTitle.includes('pancake') || normTitle.includes('breakfast')) return <PancakesSticker className={className} size={size} />;
  // 🎒 Backpack
  if (normEmoji === '🎒' || normTitle.includes('backpack') || normTitle.includes('pack')) return <BackpackSticker className={className} size={size} />;
  // 🚌 School bus / ride to school / dismissal
  if (normEmoji === '🚌' || normTitle.includes('bus') || normTitle.includes('go to school') || normTitle.includes('dismissal') || normTitle.includes('head to school') || normTitle.includes('head home')) return <SchoolBusSticker className={className} size={size} />;
  // 👟 Shoes
  if (normEmoji === '👟' || normTitle.includes('shoe') || normTitle.includes('sneaker')) return <SneakersSticker className={className} size={size} />;
  // 🧼 Wash hands / soap
  if (normEmoji === '🧼' || normTitle.includes('wash hand') || normTitle.includes('soap')) return <WashHandsSticker className={className} size={size} />;
  // 🍎 Snack / apple
  if (normEmoji === '🍎' || normTitle.includes('snack') || normTitle.includes('apple') || normTitle.includes('fruit')) return <AppleSticker className={className} size={size} />;
  // 📁 Folder / cubby / binder
  if (normEmoji === '📁' || normEmoji === '📂' || normTitle.includes('folder') || normTitle.includes('cubby') || normTitle.includes('binder')) return <FolderSticker className={className} size={size} />;
  // ✏️ Pencil / writing / classwork
  if (normEmoji === '✏️' || normEmoji === '📝' || normTitle.includes('pencil') || normTitle.includes('write') || normTitle.includes('draw') || normTitle.includes('homework')) return <PencilSticker className={className} size={size} />;
  // 🔬 Science
  if (normEmoji === '🔬' || normTitle.includes('science')) return <ScienceFlaskSticker className={className} size={size} />;
  // 🧸 Teddy bear / toys
  if (normEmoji === '🧸' || normTitle.includes('toy') || normTitle.includes('teddy') || normTitle.includes('play')) return <TeddyBearSticker className={className} size={size} />;
  // 📖 / 📚 Books / reading
  if (normEmoji === '📖' || normEmoji === '📚' || normTitle.includes('read') || normTitle.includes('book') || normTitle.includes('story')) return <ReadingBookSticker className={className} size={size} />;
  // 🌙 Evening / bedtime / moon
  if (normEmoji === '🌙' || normTitle.includes('bedtime') || normTitle.includes('sleep') || normTitle.includes('lights out')) return <EveningMoonSticker className={className} size={size} />;
  // 📱 Tablet / ipad
  if (normEmoji === '📱' || normTitle.includes('tablet') || normTitle.includes('ipad')) return <TabletIpadSticker className={className} size={size} />;
  // ⏱️ Timer
  if (normEmoji === '⏱️' || normEmoji === '⏳') return <CountdownTimerSticker className={className} size={size} />;
  // 🛋️ Quiet / break
  if (normEmoji === '🛋️' || normTitle.includes('break') || normTitle.includes('decompress') || normTitle.includes('quiet')) return <BreathingCloudSticker className={className} size={size} />;

  // Fallback to raw emoji if none match
  return <span className={className} style={size ? { fontSize: size * 0.75 } : undefined}>{emoji || '⭐'}</span>;
};



