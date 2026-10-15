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

// Onboarding, Personas & Feature Stickers
export const LanguageGlobeSticker = renderStickerPng('/assets/stickers/language_globe.png', 'Language Globe');
export const ChildPersonaSticker = renderStickerPng('/assets/stickers/child_persona.png', 'Child Persona');
export const TeenHeadphonesSticker = renderStickerPng('/assets/stickers/teen_headphones.png', 'Teen Headphones');
export const AdultBriefcaseSticker = renderStickerPng('/assets/stickers/adult_briefcase.png', 'Adult Briefcase');
export const CaregiverPhoneSticker = renderStickerPng('/assets/stickers/caregiver_phone.png', 'Caregiver Phone');
export const ScheduleCalendarSticker = renderStickerPng('/assets/stickers/schedule_calendar.png', 'Schedule Calendar');
export const TrialCrownSticker = renderStickerPng('/assets/stickers/trial_crown.png', '15-Day Free Trial Crown');

// Future Expansion Routine & Activity Stickers
export const BedtimeSleepSticker = renderStickerPng('/assets/stickers/bedtime_sleep.png', 'Bedtime Sleep');
export const DrinkWaterSticker = renderStickerPng('/assets/stickers/drink_water.png', 'Drink Water');
export const PetCareSticker = renderStickerPng('/assets/stickers/pet_care.png', 'Pet Care');
export const MusicSensorySticker = renderStickerPng('/assets/stickers/music_sensory.png', 'Music Sensory');
export const OutdoorSunSticker = renderStickerPng('/assets/stickers/outdoor_sun.png', 'Outdoor Sunshine');
export const HomeworkStudySticker = renderStickerPng('/assets/stickers/homework_study.png', 'Homework Study');
export const ArtCraftsSticker = renderStickerPng('/assets/stickers/art_crafts.png', 'Art Crafts');
export const CalmSparklesSticker = renderStickerPng('/assets/stickers/calm_sparkles.png', 'Calm Sparkles');
export const RewardTrophySticker = renderStickerPng('/assets/stickers/reward_trophy.png', 'Reward Trophy');
export const BathTimeSticker = renderStickerPng('/assets/stickers/bath_time.png', 'Bath Time');
export const DinnerBowlSticker = renderStickerPng('/assets/stickers/dinner_bowl.png', 'Dinner Plate');
export const DrinkCupSticker = renderStickerPng('/assets/stickers/drink_cup.png', 'Drink Cup');
export const CandyTreatSticker = renderStickerPng('/assets/stickers/candy_treat.png', 'Candy Treat');
export const WallClockSticker = renderStickerPng('/assets/stickers/clock_time.png', 'Wall Clock');
export const CutlerySticker = renderStickerPng('/assets/stickers/fork_knife.png', 'Fork & Knife');
export const CarRideSticker = renderStickerPng('/assets/stickers/car_ride.png', 'Car Ride');
export const WindBreezeSticker = renderStickerPng('/assets/stickers/wind_breeze.png', 'Wind Breeze');
export const RepeatLoopSticker = renderStickerPng('/assets/stickers/refresh_repeat.png', 'Repeat Loop');

// AAC Dedicated Category Badge Stickers
export const AacCoreSticker = renderStickerPng('/assets/stickers/aac_core.png', 'Core Board');
export const AacSentencesSticker = renderStickerPng('/assets/stickers/aac_sentences.png', 'Favorite Sentences');
export const AacFavoritesSticker = renderStickerPng('/assets/stickers/aac_favorites.png', 'Favorites');
export const AacFoodSticker = renderStickerPng('/assets/stickers/aac_food.png', 'Food');
export const AacDrinksSticker = renderStickerPng('/assets/stickers/aac_drinks.png', 'Drinks');
export const AacActivitiesSticker = renderStickerPng('/assets/stickers/aac_activities.png', 'Play & Fun');
export const AacPlacesSticker = renderStickerPng('/assets/stickers/aac_places.png', 'Places');
export const AacPeopleSticker = renderStickerPng('/assets/stickers/aac_people.png', 'People');
export const AacFeelingsSticker = renderStickerPng('/assets/stickers/aac_feelings.png', 'Feelings');
export const AacSensorySticker = renderStickerPng('/assets/stickers/aac_sensory.png', 'Sensory');
export const AacAllWordsSticker = renderStickerPng('/assets/stickers/aac_all_words.png', 'All Words');

export const AacCategoryIcon: React.FC<{
  categoryId: string;
  className?: string;
  size?: number;
}> = ({ categoryId, className = 'w-5 h-5 sm:w-6 sm:h-6', size }) => {
  switch (categoryId) {
    case 'core': return <AacCoreSticker className={className} size={size} />;
    case 'favorite_sentences': return <AacSentencesSticker className={className} size={size} />;
    case 'favorites': return <AacFavoritesSticker className={className} size={size} />;
    case 'food': return <AacFoodSticker className={className} size={size} />;
    case 'drinks': return <AacDrinksSticker className={className} size={size} />;
    case 'activities': return <AacActivitiesSticker className={className} size={size} />;
    case 'places': return <AacPlacesSticker className={className} size={size} />;
    case 'people': return <AacPeopleSticker className={className} size={size} />;
    case 'feelings': return <AacFeelingsSticker className={className} size={size} />;
    case 'sensory': return <AacSensorySticker className={className} size={size} />;
    case 'all': return <AacAllWordsSticker className={className} size={size} />;
    default: return <AacCoreSticker className={className} size={size} />;
  }
};

// Life Adventures & Social Stories Badge Stickers
export const DentistAdventureSticker = renderStickerPng('/assets/stickers/adventure_dentist.png', 'Visiting the Dentist');
export const RestaurantAdventureSticker = renderStickerPng('/assets/stickers/adventure_restaurant.png', 'Eating at a Restaurant');
export const HaircutAdventureSticker = renderStickerPng('/assets/stickers/adventure_haircut.png', 'Getting a Haircut');
export const DoctorAdventureSticker = renderStickerPng('/assets/stickers/adventure_doctor.png', 'Doctor Check-Up');
export const PlansChangeStorySticker = renderStickerPng('/assets/stickers/story_plans_change.png', 'When Plans Change');
export const BirthdayStorySticker = renderStickerPng('/assets/stickers/story_birthday.png', 'Going to a Birthday Party');
export const TakingTurnsStorySticker = renderStickerPng('/assets/stickers/story_sharing.png', 'Taking Turns with Toys');
export const StethoscopeSticker = renderStickerPng('/assets/stickers/stethoscope.png', 'Stethoscope / Doctor');
export const RainCloudSticker = renderStickerPng('/assets/stickers/rain_cloud.png', 'Rainy Day');
export const SchoolBuildingSticker = renderStickerPng('/assets/stickers/school_building.png', 'School Building');
export const PizzaSliceSticker = renderStickerPng('/assets/stickers/pizza_slice.png', 'Pizza Slice');
export const PlaygroundSwingsSticker = renderStickerPng('/assets/stickers/playground_swings.png', 'Playground Swings');

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

  // If already an image path or sticker asset
  if (normEmoji.startsWith('/') || normEmoji.includes('.png')) {
    return <img src={normEmoji} alt={title || ''} className={className} />;
  }

  // ⏰ Wake up / Morning
  if (normEmoji === '⏰' || normEmoji === '🌅' || normEmoji === '🔆' || normEmoji === '☀️' || normTitle.includes('wake') || normTitle.includes('morning')) return <AlarmClockSticker className={className} size={size} />;
  // 🕰️ Wall Clock / Time / Hour
  if (normEmoji === '🕰️' || normEmoji === '🕐' || normEmoji === '🕒' || normTitle.includes('clock') || normTitle.includes('time check') || normTitle.includes('hour')) return <WallClockSticker className={className} size={size} />;
  // 🚗 Car / Ride / Drive / Commute
  if (normEmoji === '🚗' || normEmoji === '🚙' || normEmoji === '🚘' || normTitle.includes('car') || normTitle.includes('ride') || normTitle.includes('drive') || normTitle.includes('commute')) return <CarRideSticker className={className} size={size} />;
  // 🚽 Toilet / restroom
  if (normEmoji === '🚽' || normTitle.includes('toilet') || normTitle.includes('bathroom') || normTitle.includes('restroom')) return <ToiletSticker className={className} size={size} />;
  // 🚿 Shower / wash face
  if (normEmoji === '🚿' || normTitle.includes('shower') || normTitle.includes('wash face') || normTitle.includes('bath')) return <ShowerSticker className={className} size={size} />;
  // 👕 Get dressed
  if (normEmoji === '👕' || normTitle.includes('dress') || normTitle.includes('clothes') || normTitle.includes('shirt')) return <GetDressedSticker className={className} size={size} />;
  // 🦷 Dentist / Dental / Tooth
  if (normEmoji === '🦷' || normTitle.includes('dentist')) return <DentistAdventureSticker className={className} size={size} />;
  // 🪥 Toothbrush / teeth
  if (normEmoji === '🪥' || normTitle.includes('teeth') || normTitle.includes('brush')) return <ToothbrushSticker className={className} size={size} />;
  // ✂️ Haircut / Scissors
  if (normEmoji === '✂️' || normTitle.includes('haircut') || normTitle.includes('scissors')) return <HaircutAdventureSticker className={className} size={size} />;
  // 🩺 Doctor / Stethoscope / Check-up
  if (normEmoji === '🩺' || normTitle.includes('doctor') || normTitle.includes('stethoscope') || normTitle.includes('check-up')) return <StethoscopeSticker className={className} size={size} />;
  // 🌧️ Rain / Weather / Rainy day
  if (normEmoji === '🌧️' || normEmoji === '🌧' || normEmoji === '☔' || normEmoji === '⛈️' || normTitle.includes('rain')) return <RainCloudSticker className={className} size={size} />;
  // 🥞 Breakfast / Food / Pancakes
  if (normEmoji === '🥞' || normTitle.includes('pancake') || normTitle.includes('breakfast')) return <PancakesSticker className={className} size={size} />;
  // 🍕 Pizza / Lunch / Slice
  if (normEmoji === '🍕' || normTitle.includes('pizza')) return <PizzaSliceSticker className={className} size={size} />;
  // 🍴 Cutlery / Fork & Knife
  if (normEmoji === '🍴' || normTitle.includes('cutlery') || normTitle.includes('fork') || normTitle.includes('knife')) return <CutlerySticker className={className} size={size} />;
  // 🍽️ Restaurant / Dining Out
  if (normTitle.includes('restaurant')) return <RestaurantAdventureSticker className={className} size={size} />;
  // 🍽️ Dinner / Lunch / Meal / Plate
  if (normEmoji === '🍽️' || normEmoji === '🥪' || normTitle.includes('dinner') || normTitle.includes('lunch') || normTitle.includes('meal') || normTitle.includes('sandwich')) return <DinnerBowlSticker className={className} size={size} />;
  // 🎂 Birthday Party / Cake
  if (normEmoji === '🎂' || normTitle.includes('birthday') || normTitle.includes('party')) return <BirthdayStorySticker className={className} size={size} />;
  // 🤝 Taking Turns / Sharing / Friends
  if (normEmoji === '🤝' || normTitle.includes('turn') || normTitle.includes('sharing')) return <TakingTurnsStorySticker className={className} size={size} />;
  // 🍎 Healthy Snack / Apple / Fruit
  if (normEmoji === '🍎' || normTitle.includes('snack') || normTitle.includes('apple') || normTitle.includes('fruit')) return <AppleSticker className={className} size={size} />;
  // 🍬 Candy / Treat / Reward Snack
  if (normEmoji === '🍬' || normEmoji === '🍭' || normTitle.includes('candy') || normTitle.includes('treat')) return <CandyTreatSticker className={className} size={size} />;
  // 🥤 Drink / Juice / Soda
  if (normEmoji === '🥤' || normTitle.includes('juice') || normTitle.includes('soda') || normTitle.includes('smoothie')) return <DrinkCupSticker className={className} size={size} />;
  // 💬 Speech Bubble / Quick Phrases / Talk
  if (normEmoji === '💬' || normEmoji === '🗨️' || normTitle.includes('phrase') || normTitle.includes('speak') || normTitle.includes('talk') || normTitle.includes('chat') || normTitle.includes('say')) return <QuickPhrasesSticker className={className} size={size} />;
  // 💊 Pill / Medication / Vitamin
  if (normEmoji === '💊' || normTitle.includes('med') || normTitle.includes('pill') || normTitle.includes('vitamin')) return <MedicationSticker className={className} size={size} />;
  // 🔄 Repeat / Loop / Cycle / Again / Refresh / Plans Change
  if (normTitle.includes('plans change')) return <PlansChangeStorySticker className={className} size={size} />;
  if (normEmoji === '🔄' || normEmoji === '🔁' || normTitle.includes('repeat') || normTitle.includes('loop') || normTitle.includes('cycle') || normTitle.includes('again') || normTitle.includes('refresh')) return <RepeatLoopSticker className={className} size={size} />;
  // 🌬️ Wind / Breeze / Fresh Air
  if (normEmoji === '🌬️' || normEmoji === '💨' || normTitle.includes('wind') || normTitle.includes('breeze') || normTitle.includes('fresh air')) return <WindBreezeSticker className={className} size={size} />;
  // 🎒 Backpack
  if (normEmoji === '🎒' || normTitle.includes('backpack') || normTitle.includes('pack')) return <BackpackSticker className={className} size={size} />;
  // 🏫 School building / School day
  if (normEmoji === '🏫' || (normTitle.includes('school') && !normTitle.includes('bus'))) return <SchoolBuildingSticker className={className} size={size} />;
  // 🚌 School bus / ride to school / dismissal
  if (normEmoji === '🚌' || normTitle.includes('bus') || normTitle.includes('go to school') || normTitle.includes('dismissal') || normTitle.includes('head to school') || normTitle.includes('head home')) return <SchoolBusSticker className={className} size={size} />;
  // 👟 Shoes
  if (normEmoji === '👟' || normTitle.includes('shoe') || normTitle.includes('sneaker')) return <SneakersSticker className={className} size={size} />;
  // 🧼 Wash hands / soap
  if (normEmoji === '🧼' || normTitle.includes('wash hand') || normTitle.includes('soap')) return <WashHandsSticker className={className} size={size} />;
  // 📁 Folder / cubby / binder
  if (normEmoji === '📁' || normEmoji === '📂' || normTitle.includes('folder') || normTitle.includes('cubby') || normTitle.includes('binder')) return <FolderSticker className={className} size={size} />;
  // ✏️ Pencil / writing / classwork / Math
  if (normEmoji === '✏️' || normEmoji === '📝' || normEmoji === '🔢' || normTitle.includes('pencil') || normTitle.includes('write') || normTitle.includes('draw') || normTitle.includes('homework') || normTitle.includes('math')) return <PencilSticker className={className} size={size} />;
  // 🔬 Science
  if (normEmoji === '🔬' || normTitle.includes('science')) return <ScienceFlaskSticker className={className} size={size} />;
  // 🛝 Playground swings / slide / park
  if (normEmoji === '🛝' || normTitle.includes('swing') || normTitle.includes('playground')) return <PlaygroundSwingsSticker className={className} size={size} />;
  // 🧸 Teddy bear / toys / play / recess / cart
  if (normEmoji === '🧸' || normEmoji === '🛒' || normTitle.includes('toy') || normTitle.includes('teddy') || normTitle.includes('play') || normTitle.includes('recess')) return <TeddyBearSticker className={className} size={size} />;
  // 📖 / 📚 Books / reading
  if (normEmoji === '📖' || normEmoji === '📚' || normTitle.includes('read') || normTitle.includes('book') || normTitle.includes('story')) return <ReadingBookSticker className={className} size={size} />;
  // 🌙 Evening / bedtime / moon
  if (normEmoji === '🌙' || normTitle.includes('bedtime') || normTitle.includes('sleep') || normTitle.includes('lights out')) return <EveningMoonSticker className={className} size={size} />;
  // 📱 Tablet / ipad
  if (normEmoji === '📱' || normTitle.includes('tablet') || normTitle.includes('ipad')) return <TabletIpadSticker className={className} size={size} />;
  // ⏱️ Timer
  if (normEmoji === '⏱️' || normEmoji === '⏳') return <CountdownTimerSticker className={className} size={size} />;
  // 🫧 Fidget bubbles / puzzle / circle / stars
  if (normEmoji === '🫧' || normEmoji === '🧩' || normEmoji === '⭕' || normTitle.includes('fidget') || normTitle.includes('puzzle')) return <FidgetBubblesSticker className={className} size={size} />;
  // 🛋️ Quiet / break / Home / Afternoon
  if (normEmoji === '🛋️' || normEmoji === '🌬️' || normEmoji === '🏡' || normTitle.includes('break') || normTitle.includes('decompress') || normTitle.includes('quiet') || normTitle.includes('home')) return <BreathingCloudSticker className={className} size={size} />;
  // 🛏️ Bed / Sleep
  if (normEmoji === '🛏️' || normTitle.includes('bed') || normTitle.includes('wind down') || normTitle.includes('sleep')) return <BedtimeSleepSticker className={className} size={size} />;
  // 💧 Drink water / Hydration
  if (normEmoji === '💧' || normEmoji === '🥤' || normEmoji === '🥛' || normTitle.includes('water') || normTitle.includes('drink') || normTitle.includes('hydrate')) return <DrinkWaterSticker className={className} size={size} />;
  // 🐕 Pet care / dog / cat
  if (normEmoji === '🐕' || normEmoji === '🐾' || normEmoji === '🐶' || normEmoji === '🐱' || normTitle.includes('pet') || normTitle.includes('dog') || normTitle.includes('cat')) return <PetCareSticker className={className} size={size} />;
  // 🎵 Music / audio calm
  if (normEmoji === '🎵' || normEmoji === '🎶' || normEmoji === '🎸' || normTitle.includes('music') || normTitle.includes('song') || normTitle.includes('listen')) return <MusicSensorySticker className={className} size={size} />;
  // ☀️ Outdoor / sunshine / park
  if (normEmoji === '☀️' || normEmoji === '🌳' || normTitle.includes('outdoor') || normTitle.includes('outside') || normTitle.includes('park') || normTitle.includes('sunshine')) return <OutdoorSunSticker className={className} size={size} />;
  // 📓 Homework / study
  if (normEmoji === '📓' || normTitle.includes('homework') || normTitle.includes('study')) return <HomeworkStudySticker className={className} size={size} />;
  // 🎨 Art / crafts / drawing
  if (normEmoji === '🎨' || normEmoji === '🖍️' || normTitle.includes('art') || normTitle.includes('paint') || normTitle.includes('craft')) return <ArtCraftsSticker className={className} size={size} />;
  // ✨ Sparkles / calm mindfulness
  if (normEmoji === '✨' || normEmoji === '⭐' || normTitle.includes('sparkle') || normTitle.includes('mindful') || normTitle.includes('reset')) return <CalmSparklesSticker className={className} size={size} />;
  // 🏆 Trophy / reward / milestone
  if (normEmoji === '🏆' || normEmoji === '🥇' || normTitle.includes('trophy') || normTitle.includes('reward') || normTitle.includes('win') || normTitle.includes('streak')) return <RewardTrophySticker className={className} size={size} />;
  // 🛁 Bath time / tub
  if (normEmoji === '🛁' || normTitle.includes('bath') || normTitle.includes('tub')) return <BathTimeSticker className={className} size={size} />;

  // Fallback to raw emoji if none match
  return <span className={className} style={size ? { fontSize: size * 0.75 } : undefined}>{emoji || '⭐'}</span>;
};



