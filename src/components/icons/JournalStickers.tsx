import React, { useState, useEffect } from 'react';
import { preloadTurtleThemeStickers, preloadAllStickersOnIdle } from '../../utils/stickerPreloader';

// Immediately initiate background pre-caching of all sticker images
if (typeof window !== 'undefined') {
  preloadAllStickersOnIdle();
}

interface StickerProps {
  className?: string;
  size?: number;
  loading?: 'lazy' | 'eager';
}

function checkActiveThemeCategory(): string {
  try {
    if (typeof document !== 'undefined') {
      const cat = document.documentElement.dataset.themeCategory;
      const id = document.documentElement.dataset.themeId;
      if (cat === 'turtle' || id === 'theme-turtle') return 'turtle';
      if (cat === 'dinosaur' || id === 'theme-dino') return 'dinosaur';
      if (cat === 'frog' || id === 'theme-frog') return 'frog';
      if (cat === 'train' || id === 'theme-trains') return 'train';
      if (cat === 'space' || id === 'theme-space') return 'space';
    }
    if (typeof localStorage !== 'undefined') {
      const savedId = localStorage.getItem('beeyou_active_theme_id');
      if (savedId === 'theme-turtle') return 'turtle';
      if (savedId === 'theme-dino') return 'dinosaur';
      if (savedId === 'theme-frog') return 'frog';
      if (savedId === 'theme-trains') return 'train';
      if (savedId === 'theme-space') return 'space';
    }
  } catch (e) {}
  return 'default';
}

function useActiveThemeCategory(): string {
  const [theme, setTheme] = useState<string>(() => checkActiveThemeCategory());

  useEffect(() => {
    const sync = () => {
      const active = checkActiveThemeCategory();
      setTheme(active);
      if (active === 'turtle') {
        preloadTurtleThemeStickers();
      }
    };
    sync();
    window.addEventListener('beeyou-theme-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('beeyou-theme-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return theme;
}

function useIsTurtleTheme(): boolean {
  return useActiveThemeCategory() === 'turtle';
}

function useIsDinoTheme(): boolean {
  return useActiveThemeCategory() === 'dinosaur';
}

export function useIsFrogTheme(): boolean {
  return useActiveThemeCategory() === 'frog';
}

export function useIsTrainTheme(): boolean {
  return useActiveThemeCategory() === 'train';
}

const renderStickerPng = (src: string, alt: string) => {
  const Component: React.FC<StickerProps> = ({ className = 'w-9 h-9', size, loading = 'lazy' }) => {
    const theme = useActiveThemeCategory();
    let currentSrc = src;
    if (theme === 'turtle' && TURTLE_STICKER_SWAPS[src]) {
      currentSrc = TURTLE_STICKER_SWAPS[src];
    } else if (theme === 'dinosaur' && DINO_STICKER_SWAPS[src]) {
      currentSrc = DINO_STICKER_SWAPS[src];
    } else if (theme === 'frog' && FROG_STICKER_SWAPS[src]) {
      currentSrc = FROG_STICKER_SWAPS[src];
    } else if (theme === 'train' && TRAIN_STICKER_SWAPS[src]) {
      currentSrc = TRAIN_STICKER_SWAPS[src];
    } else if (theme === 'space' && SPACE_STICKER_SWAPS[src]) {
      currentSrc = SPACE_STICKER_SWAPS[src];
    }
    return (
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} object-contain select-none pointer-events-none drop-shadow-2xs`}
        style={size ? { width: size, height: size } : undefined}
        loading={loading}
        decoding="async"
      />
    );
  };
  return Component;
};

const renderThemedStickerPng = (defaultSrc: string, turtleSrc: string, alt: string, dinoSrc?: string, frogSrc?: string, trainSrc?: string, spaceSrc?: string) => {
  const Component: React.FC<StickerProps> = ({ className = 'w-9 h-9', size, loading = 'lazy' }) => {
    const theme = useActiveThemeCategory();
    let currentSrc = defaultSrc;
    if (theme === 'turtle') {
      currentSrc = turtleSrc || TURTLE_STICKER_SWAPS[defaultSrc] || defaultSrc;
    } else if (theme === 'dinosaur') {
      currentSrc = dinoSrc || DINO_STICKER_SWAPS[defaultSrc] || defaultSrc;
    } else if (theme === 'frog') {
      currentSrc = frogSrc || FROG_STICKER_SWAPS[defaultSrc] || defaultSrc;
    } else if (theme === 'train') {
      currentSrc = trainSrc || TRAIN_STICKER_SWAPS[defaultSrc] || defaultSrc;
    } else if (theme === 'space') {
      currentSrc = spaceSrc || SPACE_STICKER_SWAPS[defaultSrc] || defaultSrc;
    }
    return (
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} object-contain select-none pointer-events-none drop-shadow-2xs`}
        style={size ? { width: size, height: size } : undefined}
        loading={loading}
        decoding="async"
      />
    );
  };
  return Component;
};

// 🫧 Digital Fidgets (Swaps to Pond Dewdrop Bubbles in Turtle Sanctuary theme)
export const FidgetBubblesSticker = renderThemedStickerPng(
  '/assets/stickers/fidget_bubbles.png',
  '/assets/stickers/turtle_pond_fidget_bubbles.png',
  'Fidget Bubbles'
);

// 🌬️ Calm Breathing (Watercolor breathing cloud with soft swirl / Lagoon breeze in Turtle theme)
export const BreathingCloudSticker = renderThemedStickerPng(
  '/assets/stickers/breathing_cloud.png',
  '/assets/stickers/turtle_lagoon_breeze_breath.png',
  'Calm Breathing Cloud'
);

// 🎡 Decision Wheel (Swaps to Wooden Lotus Spinner Wheel in Turtle Sanctuary theme)
export const DecisionWheelSticker = renderThemedStickerPng(
  '/assets/stickers/decision_wheel.png',
  '/assets/stickers/turtle_wooden_wheel.png',
  'Decision Wheel'
);

// ⏱️ Countdown Timer / Pie Clock (Swaps across all themes)
export const CountdownTimerSticker = renderThemedStickerPng(
  '/assets/stickers/timer_clock.png',
  '/assets/stickers/turtle_sand_timer.png',
  'Countdown Timer Clock',
  '/assets/stickers/dino_stone_stopwatch.png',
  '/assets/stickers/frog_lily_stopwatch.png',
  '/assets/stickers/train_pressure_stopwatch.png',
  '/assets/stickers/space_clock_time.png'
);

// 🚨 Ask for Help (SOS) (Swaps to Guardian Turtle Shell Shield in Turtle Sanctuary theme)
export const ShieldSosSticker = renderThemedStickerPng(
  '/assets/stickers/help_sos.png',
  '/assets/stickers/turtle_guardian_shield_sos.png',
  'Help SOS Shield'
);

// 🔗 Connect Caregiver (Warm pink watercolor heart with bandaid from reference)
export const ConnectHeartSticker = renderStickerPng('/assets/stickers/caregiver_heart.png', 'Caregiver Heart');

// 🪪 About Me ID Card (Swaps to Wooden Explorer ID Badge in Turtle Sanctuary theme)
export const IdCardSticker = renderThemedStickerPng(
  '/assets/stickers/about_id.png',
  '/assets/stickers/turtle_wooden_id_badge.png',
  'About Me ID'
);

// 📖 Passport / Reading Book (Swaps to Firefly Lantern & Scroll in Turtle Sanctuary theme)
export const ReadingBookSticker = renderThemedStickerPng(
  '/assets/stickers/passport_book.png',
  '/assets/stickers/turtle_firefly_lantern_book.png',
  'Reading Book'
);

// 💬 Quick Phrases (Swaps to Leafy Speech Bubbles in Turtle Sanctuary theme)
export const QuickPhrasesSticker = renderThemedStickerPng(
  '/assets/stickers/quick_phrases.png',
  '/assets/stickers/turtle_leaf_speech_bubbles.png',
  'Quick Phrases'
);

// ⌨️ Type to Speak Keyboard (Swaps to Bamboo & Sage Keyboard in Turtle Sanctuary theme)
export const KeyboardSticker = renderThemedStickerPng(
  '/assets/stickers/keyboard.png',
  '/assets/stickers/turtle_bamboo_keyboard.png',
  'Keyboard'
);

// 🌡️ Feelings & Thermometer (Swaps to Bamboo Gauge & Heart in Turtle Sanctuary theme)
export const ThermometerSticker = renderThemedStickerPng(
  '/assets/stickers/feelings_thermometer.png',
  '/assets/stickers/turtle_bamboo_thermometer.png',
  'Feelings Thermometer'
);

// 💊 Medications & Health (Swaps to Leaf Dish & Vitamins in Turtle Sanctuary theme)
export const MedicationSticker = renderThemedStickerPng(
  '/assets/stickers/medications_health.png',
  '/assets/stickers/turtle_leaf_vitamins.png',
  'Medications Health'
);

// 🌙 Evening Reflection (Swaps to Crescent Moon Over Lagoon in Turtle Sanctuary theme)
export const EveningMoonSticker = renderThemedStickerPng(
  '/assets/stickers/evening_moon.png',
  '/assets/stickers/turtle_lagoon_moon.png',
  'Evening Moon'
);

// Routine, Wellness & Activity stickers
export const ToothbrushSticker = renderThemedStickerPng(
  '/assets/stickers/toothbrush.png',
  '/assets/stickers/turtle_bamboo_toothbrush.png',
  'Toothbrush'
);
export const ToyBoxSticker = renderThemedStickerPng(
  '/assets/stickers/toy_box.png',
  '/assets/stickers/turtle_seagrass_toy_box.png',
  'Clean Up Toys'
);
export const GetDressedSticker = renderThemedStickerPng(
  '/assets/stickers/clothes_dressed.png',
  '/assets/stickers/turtle_cozy_hoodie.png',
  'Get Dressed'
);
export const WashHandsSticker = renderThemedStickerPng(
  '/assets/stickers/soap_wash_hands.png',
  '/assets/stickers/turtle_leaf_soap_wash.png',
  'Wash Hands'
);
export const QuietTimeSticker = renderThemedStickerPng(
  '/assets/stickers/breathing_cloud.png',
  '/assets/stickers/turtle_cozy_shell_retreat.png',
  'Quiet Time'
);
export const SpoonSticker = renderThemedStickerPng(
  '/assets/stickers/spoons_energy.png',
  '/assets/stickers/turtle_bamboo_spoons.png',
  'Spoon Energy'
);
export const MoodJournalSticker = renderThemedStickerPng(
  '/assets/stickers/passport_book.png',
  '/assets/stickers/turtle_firefly_lantern_book.png',
  'Mood Journal'
);
export const TabletIpadSticker = renderThemedStickerPng(
  '/assets/stickers/tablet_ipad.png',
  '/assets/stickers/turtle_bamboo_tablet.png',
  'Tablet iPad'
);

// Morning Routine & School Step Stickers
export const AlarmClockSticker = renderThemedStickerPng(
  '/assets/stickers/alarm_clock.png',
  '/assets/stickers/turtle_dawn_bell_clock.png',
  'Wake Up Alarm Clock'
);
export const ToiletSticker = renderThemedStickerPng(
  '/assets/stickers/routine_toilet_restroom.png',
  '/assets/stickers/turtle_bamboo_restroom.png',
  'Toilet Restroom'
);
export const PancakesSticker = renderThemedStickerPng(
  '/assets/stickers/pancakes_breakfast.png',
  '/assets/stickers/turtle_clover_berry_feast.png',
  'Breakfast Pancakes'
);
export const BackpackSticker = renderThemedStickerPng(
  '/assets/stickers/backpack_school.png',
  '/assets/stickers/turtle_shell_backpack.png',
  'School Backpack'
);
export const SneakersSticker = renderThemedStickerPng(
  '/assets/stickers/sneaker_shoes.png',
  '/assets/stickers/turtle_reed_explorer_shoes.png',
  'Shoes Sneakers'
);
export const AppleSticker = renderThemedStickerPng(
  '/assets/stickers/apple_snack.png',
  '/assets/stickers/turtle_garden_fruit_snack.png',
  'Healthy Apple Snack'
);
export const FolderSticker = renderThemedStickerPng(
  '/assets/stickers/folder_schoolwork.png',
  '/assets/stickers/turtle_botanical_folder.png',
  'School Binder Folder'
);
export const PencilSticker = renderThemedStickerPng(
  '/assets/stickers/pencil_write.png',
  '/assets/stickers/turtle_bamboo_pencil.png',
  'Pencil Writing'
);
export const TeddyBearSticker = renderThemedStickerPng(
  '/assets/stickers/teddy_bear.png',
  '/assets/stickers/turtle_seagrass_toy_box.png',
  'Teddy Bear Play'
);
export const ShowerSticker = renderThemedStickerPng(
  '/assets/stickers/shower_wash.png',
  '/assets/stickers/turtle_warm_spring_bath.png',
  'Shower Wash'
);
export const SchoolBusSticker = renderThemedStickerPng(
  '/assets/stickers/school_bus.png',
  '/assets/stickers/turtle_bamboo_ferry.png',
  'School Bus'
);
export const ScienceFlaskSticker = renderThemedStickerPng(
  '/assets/stickers/science_flask.png',
  '/assets/stickers/turtle_terrarium_science.png',
  'Science Flask'
);

// Onboarding, Personas & Feature Stickers
export const LanguageGlobeSticker = renderThemedStickerPng(
  '/assets/stickers/language_globe.png',
  '/assets/stickers/turtle_lagoon_globe.png',
  'Language Globe'
);
export const ChildPersonaSticker = renderThemedStickerPng(
  '/assets/stickers/child_persona.png',
  '/assets/stickers/turtle_child_persona_hatchling.png',
  'Child Persona (Teddy Bear)'
);
export const TeenHeadphonesSticker = renderThemedStickerPng(
  '/assets/stickers/teen_headphones.png',
  '/assets/stickers/turtle_shell_headphones.png',
  'Teen Headphones'
);
export const AdultBriefcaseSticker = renderThemedStickerPng(
  '/assets/stickers/adult_briefcase.png',
  '/assets/stickers/turtle_bamboo_satchel_briefcase.png',
  'Adult Briefcase'
);
export const CaregiverPhoneSticker = renderThemedStickerPng(
  '/assets/stickers/caregiver_phone.png',
  '/assets/stickers/turtle_wood_phone_caregiver.png',
  'Caregiver Phone'
);
export const ScheduleCalendarSticker = renderThemedStickerPng(
  '/assets/stickers/schedule_calendar.png',
  '/assets/stickers/turtle_bamboo_calendar.png',
  'Schedule Calendar'
);
export const TrialCrownSticker = renderThemedStickerPng(
  '/assets/stickers/trial_crown.png',
  '/assets/stickers/turtle_golden_shell_crown.png',
  '15-Day Free Trial Crown'
);

// Future Expansion Routine & Activity Stickers
export const BedtimeSleepSticker = renderThemedStickerPng(
  '/assets/stickers/bedtime_sleep.png',
  '/assets/stickers/turtle_moss_bed_sleep.png',
  'Bedtime Sleep'
);
export const DrinkWaterSticker = renderThemedStickerPng(
  '/assets/stickers/routine_water_drink.png',
  '/assets/stickers/turtle_bamboo_drink_cup.png',
  'Drink Water'
);
export const PetCareSticker = renderThemedStickerPng(
  '/assets/stickers/pet_care.png',
  '/assets/stickers/turtle_hatchling_pet_care.png',
  'Pet Care'
);
export const MusicSensorySticker = renderThemedStickerPng(
  '/assets/stickers/music_sensory.png',
  '/assets/stickers/turtle_bamboo_wind_chimes.png',
  'Music Sensory'
);
export const OutdoorSunSticker = renderThemedStickerPng(
  '/assets/stickers/outdoor_sun.png',
  '/assets/stickers/turtle_meadow_sunshine.png',
  'Outdoor Sunshine'
);
export const HomeworkStudySticker = renderThemedStickerPng(
  '/assets/stickers/homework_study.png',
  '/assets/stickers/turtle_bamboo_pencil.png',
  'Homework Study'
);
export const ArtCraftsSticker = renderThemedStickerPng(
  '/assets/stickers/art_crafts.png',
  '/assets/stickers/turtle_pebble_paint_palette.png',
  'Art Crafts'
);
export const CalmSparklesSticker = renderStickerPng('/assets/stickers/calm_sparkles.png', 'Calm Star');
export const RewardTrophySticker = renderThemedStickerPng(
  '/assets/stickers/reward_trophy.png',
  '/assets/stickers/turtle_lotus_trophy.png',
  'Reward Trophy'
);
export const BathTimeSticker = renderThemedStickerPng(
  '/assets/stickers/bath_time.png',
  '/assets/stickers/turtle_warm_spring_bath.png',
  'Bath Time'
);
export const DinnerBowlSticker = renderThemedStickerPng(
  '/assets/stickers/dinner_bowl.png',
  '/assets/stickers/turtle_clover_berry_feast.png',
  'Dinner Plate'
);
export const DrinkCupSticker = renderThemedStickerPng(
  '/assets/stickers/drink_cup.png',
  '/assets/stickers/turtle_bamboo_drink_cup.png',
  'Drink Cup'
);
export const CandyTreatSticker = renderThemedStickerPng(
  '/assets/stickers/candy_treat.png',
  '/assets/stickers/turtle_berry_honey_treat.png',
  'Candy Treat'
);
export const WallClockSticker = renderThemedStickerPng(
  '/assets/stickers/clock_time.png',
  '/assets/stickers/turtle_shell_wall_clock.png',
  'Wall Clock'
);
export const CutlerySticker = renderThemedStickerPng(
  '/assets/stickers/fork_knife.png',
  '/assets/stickers/turtle_bamboo_cutlery.png',
  'Fork & Knife'
);
export const CarRideSticker = renderThemedStickerPng(
  '/assets/stickers/car_ride.png',
  '/assets/stickers/turtle_wooden_leaf_cart.png',
  'Car Ride'
);
export const WindBreezeSticker = renderThemedStickerPng(
  '/assets/stickers/wind_breeze.png',
  '/assets/stickers/turtle_lagoon_breeze_breath.png',
  'Wind Breeze'
);
export const LungsInhalerSticker = renderStickerPng('/assets/stickers/lungs_inhaler.png', 'Lungs Inhaler');
export const RepeatLoopSticker = renderThemedStickerPng(
  '/assets/stickers/refresh_repeat.png',
  '/assets/stickers/turtle_swimming_loop.png',
  'Repeat Loop'
);
export const AccessibilityHubSticker = renderStickerPng('/assets/stickers/accessibility_hub.png', 'Accessibility & Sensory Hub');

// User Provided Routine Replacements
export const LaptopExecutionSticker = renderStickerPng('/assets/stickers/laptop_execution.png', 'Laptop Execution Sprint');
export const ClipboardShutdownSticker = renderStickerPng('/assets/stickers/clipboard_shutdown.png', 'Daily Shutdown Prep');
export const GoldStarSticker = renderStickerPng('/assets/stickers/star_gold.png', 'Gold Star');
export const LockerScheduleSticker = renderThemedStickerPng(
  '/assets/stickers/locker_schedule.png',
  '/assets/stickers/turtle_bamboo_calendar.png',
  'Locker & Daily Schedule'
);
export const PajamasShortsSticker = renderThemedStickerPng(
  '/assets/stickers/pajamas_shorts.png',
  '/assets/stickers/turtle_starry_pajamas.png',
  'Put on Pajamas'
);
export const BeeMascotSticker = renderStickerPng('/assets/stickers/bee_mascot.png', 'Bee Mascot Companion');
export const TurtleMascotSticker = renderStickerPng('/assets/stickers/turtle_mascot.png', 'Shelly the Wise Turtle');
export const FrogMascotSticker = renderStickerPng('/assets/stickers/frog_mascot.png', 'Hoppy the Tree Frog');
export const TrainMascotSticker = renderStickerPng('/assets/stickers/train_mascot.png', 'Conductor Leo Mascot');
export const SpaceMascotSticker = renderStickerPng('/assets/stickers/space_child_persona.png', 'Orion the Astro-Pup Mascot');
export const TurtleLilyPadsSticker = renderStickerPng('/assets/stickers/turtle_lily_pads.png', 'Quiet Break Lily Pads');
export const TurtlePondReedsSticker = renderStickerPng('/assets/stickers/turtle_pond_reeds.png', 'Serene Lagoon & Reeds');
export const TurtleRiverStoneSticker = renderStickerPng('/assets/stickers/turtle_river_stone.png', 'Smooth River Worry Stone');
export const TurtleWaterDropSticker = renderStickerPng('/assets/stickers/turtle_leaf_water_drop.png', 'Leaf with Water Dewdrop');
export const TurtleWelcomeSignSticker = renderStickerPng('/assets/stickers/turtle_welcome_sign.png', 'Welcome Sign with Vines');
export const TurtlePottedFernSticker = renderStickerPng('/assets/stickers/turtle_potted_fern.png', 'Potted Fern Fronds');
export const TurtleArchedBridgeSticker = renderStickerPng('/assets/stickers/turtle_arched_bridge.png', 'Arched Garden Bridge');
export const TurtleTracksSticker = renderStickerPng('/assets/stickers/turtle_tracks.png', 'Webbed Turtle Footprints');
export const TurtleSeedlingSticker = renderStickerPng('/assets/stickers/turtle_sprouting_seedling.png', 'Sprouting Seedling in Soil');
export const TurtleEggNestSticker = renderStickerPng('/assets/stickers/turtle_egg_nest.png', 'Speckled Egg in Sand Nest');
export const TurtleSwimmingSticker = renderStickerPng('/assets/stickers/turtle_swimming.png', 'Swimming Turtle (Pacing)');
export const TurtleShellBackpackSticker = renderStickerPng('/assets/stickers/turtle_shell_backpack.png', 'Turtle Shell Backpack');
export const TurtleBambooToothbrushSticker = renderStickerPng('/assets/stickers/turtle_bamboo_toothbrush.png', 'Bamboo Brush & Sea Sponge');
export const TurtleCloverBerryFeastSticker = renderStickerPng('/assets/stickers/turtle_clover_berry_feast.png', 'Clover & Berry Feast');
export const TurtleCozyHoodieSticker = renderStickerPng('/assets/stickers/turtle_cozy_hoodie.png', 'Cozy Turtle Hoodie');
export const TurtleWarmSpringBathSticker = renderStickerPng('/assets/stickers/turtle_warm_spring_bath.png', 'Warm Spring Waterfall');
export const TurtleTreehouseGazeboSticker = renderStickerPng('/assets/stickers/turtle_treehouse_gazebo.png', 'Canopy Treehouse Gazebo');
export const TurtleBambooFerrySticker = renderStickerPng('/assets/stickers/turtle_bamboo_ferry.png', 'Tortoise Bamboo Ferry');
export const TurtleFireflyLanternBookSticker = renderStickerPng('/assets/stickers/turtle_firefly_lantern_book.png', 'Firefly Lantern & Scroll');
export const TurtlePebblePaintPaletteSticker = renderStickerPng('/assets/stickers/turtle_pebble_paint_palette.png', 'River Pebble Paint Palette');
export const TurtleHollowLogSlideSticker = renderStickerPng('/assets/stickers/turtle_hollow_log_slide.png', 'Hollow Log Slide');
export const TurtleDawnBellClockSticker = renderStickerPng('/assets/stickers/turtle_dawn_bell_clock.png', 'Bamboo Dawn Bell');
export const TurtleLeafSoapWashSticker = renderStickerPng('/assets/stickers/turtle_leaf_soap_wash.png', 'Herbal Leaf Soap & Basin');
export const TurtleLotusDinnerBowlSticker = renderStickerPng('/assets/stickers/turtle_lotus_dinner_bowl.png', 'Lotus Leaf Soup Bowl');
export const TurtleGardenFruitSnackSticker = renderStickerPng('/assets/stickers/turtle_garden_fruit_snack.png', 'Sanctuary Fruit Basket');
export const TurtleSeagrassToyBoxSticker = renderStickerPng('/assets/stickers/turtle_seagrass_toy_box.png', 'Seagrass Basket & Plush Turtle');
export const TurtleBambooPencilSticker = renderStickerPng('/assets/stickers/turtle_bamboo_pencil.png', 'Bamboo Pencil & Leaf Pad');
export const TurtleShellHeadphonesSticker = renderStickerPng('/assets/stickers/turtle_shell_headphones.png', 'Turtle Shell Ear Defenders');
export const TurtleSandTimerSticker = renderStickerPng('/assets/stickers/turtle_sand_timer.png', 'Sanctuary Sand Timer');
export const TurtleBambooSpoonsSticker = renderStickerPng('/assets/stickers/turtle_bamboo_spoons.png', 'Three Bamboo Spoons');
export const TurtleLotusTrophySticker = renderStickerPng('/assets/stickers/turtle_lotus_trophy.png', 'Golden Lotus & Shell Trophy');
export const TurtleBambooRestroomSticker = renderStickerPng('/assets/stickers/turtle_bamboo_restroom.png', 'Bamboo Washroom & Stones');
export const TurtleStarryPajamasSticker = renderStickerPng('/assets/stickers/turtle_starry_pajamas.png', 'Cozy Starry Turtle Pajamas');
export const TurtleLagoonMoonSticker = renderStickerPng('/assets/stickers/turtle_lagoon_moon.png', 'Crescent Moon Over Lagoon');
export const TurtleWoodenWheelSticker = renderStickerPng('/assets/stickers/turtle_wooden_wheel.png', 'Wooden Lotus Spinner Wheel');
export const TurtleBambooThermometerSticker = renderStickerPng('/assets/stickers/turtle_bamboo_thermometer.png', 'Bamboo Gauge & Heart');
export const TurtleLeafVitaminsSticker = renderStickerPng('/assets/stickers/turtle_leaf_vitamins.png', 'Leaf Dish & Vitamins');
export const TurtleGuardianShieldSosSticker = renderStickerPng('/assets/stickers/turtle_guardian_shield_sos.png', 'Guardian Turtle Shell Shield');
export const TurtleWoodenIdBadgeSticker = renderStickerPng('/assets/stickers/turtle_wooden_id_badge.png', 'Wooden Explorer ID Badge');
export const TurtleBambooTabletSticker = renderStickerPng('/assets/stickers/turtle_bamboo_tablet.png', 'Bamboo-Framed Tablet');
export const TurtleLeafSpeechBubblesSticker = renderStickerPng('/assets/stickers/turtle_leaf_speech_bubbles.png', 'Leafy Speech Bubbles');
export const TurtleBambooKeyboardSticker = renderStickerPng('/assets/stickers/turtle_bamboo_keyboard.png', 'Bamboo & Sage Keyboard');
export const TurtlePondFidgetBubblesSticker = renderStickerPng('/assets/stickers/turtle_pond_fidget_bubbles.png', 'Pond Dewdrop Bubbles');
export const TurtleBotanicalFolderSticker = renderStickerPng('/assets/stickers/turtle_botanical_folder.png', 'Botanical Field Folder');
export const TurtleTerrariumScienceSticker = renderStickerPng('/assets/stickers/turtle_terrarium_science.png', 'Moss Terrarium & Magnifier');
export const TurtleBambooWindChimesSticker = renderStickerPng('/assets/stickers/turtle_bamboo_wind_chimes.png', 'Bamboo Wind Chimes');
export const TurtleWoodenPuzzleSticker = renderStickerPng('/assets/stickers/turtle_wooden_puzzle.png', 'Wooden Shell Puzzle Piece');
export const TurtleLeafCheckmarkSticker = renderStickerPng('/assets/stickers/turtle_leaf_checkmark.png', 'Sanctuary Leaf Checkmark');
export const TurtleMossCottageHomeSticker = renderStickerPng('/assets/stickers/turtle_moss_cottage_home.png', 'Moss-Roof Sanctuary Cottage');
export const TurtleWoodenLeafCartSticker = renderStickerPng('/assets/stickers/turtle_wooden_leaf_cart.png', 'Leaf-Canopy Wooden Cart');
export const TurtleMeadowSunshineSticker = renderStickerPng('/assets/stickers/turtle_meadow_sunshine.png', 'Warm Sun Over Lily-Pad Pond');
export const TurtleHatchlingPetCareSticker = renderStickerPng('/assets/stickers/turtle_hatchling_pet_care.png', 'Baby Hatchling & Snail Friend');
export const TurtleGardenSandwichSticker = renderStickerPng('/assets/stickers/turtle_garden_sandwich.png', 'Garden Herb Sandwich on Board');
export const TurtleBambooDrinkCupSticker = renderStickerPng('/assets/stickers/turtle_bamboo_drink_cup.png', 'Bamboo Tumbler with Leaf Straw');
export const TurtleHerbalTeaMugSticker = renderStickerPng('/assets/stickers/turtle_herbal_tea_mug.png', 'Carved Wooden Herbal Tea Mug');
export const TurtleReedLaundryBasketSticker = renderStickerPng('/assets/stickers/turtle_reed_laundry_basket.png', 'Woven Reed Laundry Basket');
export const TurtleBambooCalendarSticker = renderStickerPng('/assets/stickers/turtle_bamboo_calendar.png', 'Hanging Bamboo Checklist Board');
export const TurtleLagoonBreezeBreathSticker = renderStickerPng('/assets/stickers/turtle_lagoon_breeze_breath.png', 'Lagoon Mist & Lotus Breeze');
export const TurtleMossBedSleepSticker = renderStickerPng('/assets/stickers/turtle_moss_bed_sleep.png', 'Cozy Wooden Leaf-Blanket Bed');
export const TurtleReedExplorerShoesSticker = renderStickerPng('/assets/stickers/turtle_reed_explorer_shoes.png', 'Woven Reed Explorer Slip-On Shoes');
export const TurtleBambooCutlerySticker = renderStickerPng('/assets/stickers/turtle_bamboo_cutlery.png', 'Carved Bamboo Fork & Spoon Set');
export const TurtleBerryHoneyTreatSticker = renderStickerPng('/assets/stickers/turtle_berry_honey_treat.png', 'Wrapped Leaf-Berry Sweet Snack');
export const TurtleShellWallClockSticker = renderStickerPng('/assets/stickers/turtle_shell_wall_clock.png', 'Turtle-Shell Wall Clock with Leaf Hands');
export const TurtlePondRippleWaveSticker = renderStickerPng('/assets/stickers/turtle_pond_ripple_wave.png', 'Gentle Pond Ripple & Lily Pad');
export const TurtleBambooEnergyMeterSticker = renderStickerPng('/assets/stickers/turtle_bamboo_energy_meter.png', 'Bamboo Energy Tube Gauge');
export const TurtleWhisperingReedQuietSticker = renderStickerPng('/assets/stickers/turtle_whispering_reed_quiet.png', 'Peaceful Whispering Reeds & Ripples');
export const TurtleHoneySeedBarSticker = renderStickerPng('/assets/stickers/turtle_honey_seed_bar.png', 'Honey & Seed Snack Bar');
export const TurtleLotusFloatingLanternSticker = renderStickerPng('/assets/stickers/turtle_lotus_floating_lantern.png', 'Hanging Lotus Blossom Lantern');
export const TurtleWovenGatheringCartSticker = renderStickerPng('/assets/stickers/turtle_woven_gathering_cart.png', 'Woven Gathering Cart on Wheels');
export const TurtleDragonflyGlideSticker = renderStickerPng('/assets/stickers/turtle_dragonfly_glide.png', 'Soaring Dragonfly over Reeds');
export const TurtleTimberExplorerTrunkSticker = renderStickerPng('/assets/stickers/turtle_timber_explorer_trunk.png', 'Explorer Timber Travel Trunk');
export const TurtleWoodenTokenPassSticker = renderStickerPng('/assets/stickers/turtle_wooden_token_pass.png', 'Carved Wooden Token Pass');
export const TurtleShadedCanopyLampSticker = renderStickerPng('/assets/stickers/turtle_shaded_canopy_lamp.png', 'Shaded Firefly Canopy Lamp');
export const TurtleSoundSofteningShellSticker = renderStickerPng('/assets/stickers/turtle_sound_softening_shell.png', 'Sound-Softening Spiral Shell');
export const TurtleCozyShellRetreatSticker = renderStickerPng('/assets/stickers/turtle_cozy_shell_retreat.png', 'Cozy Shell Retreat');
export const TurtleMossPlayBallSticker = renderStickerPng('/assets/stickers/turtle_moss_play_ball.png', 'Woven Moss Play Ball');
export const TurtleWaterChestnutTreatSticker = renderStickerPng('/assets/stickers/turtle_water_chestnut_treat.png', 'Water Chestnut Treat');
export const TurtleWebbedPawStampSticker = renderStickerPng('/assets/stickers/turtle_webbed_paw_stamp.png', 'Webbed Turtle Paw Stamp');
export const TurtleLogBonsaiPlanterSticker = renderStickerPng('/assets/stickers/turtle_log_bonsai_planter.png', 'Log Bonsai Planter');
export const TurtleGroomingCombMirrorSticker = renderStickerPng('/assets/stickers/turtle_grooming_comb_mirror.png', 'Shell Grooming Comb & Mirror');
export const TurtleElderHealerPouchSticker = renderStickerPng('/assets/stickers/turtle_elder_healer_pouch.png', 'Elder Healer Herb Pouch');
export const TurtleSpringLagoonPoolSticker = renderStickerPng('/assets/stickers/turtle_spring_lagoon_pool.png', 'Spring Water Basin Lagoon');
export const TurtleShadowPuppetTheaterSticker = renderStickerPng('/assets/stickers/turtle_shadow_puppet_theater.png', 'Shadow Silhouette Theater');
export const TurtleRiverPebbleBowlingSticker = renderStickerPng('/assets/stickers/turtle_river_pebble_bowling.png', 'River Pebble Bowling');
export const TurtleCanopyReedTentSticker = renderStickerPng('/assets/stickers/turtle_canopy_reed_tent.png', 'Canopy Reed Tent');
export const TurtleHeritageArchivePavillionSticker = renderStickerPng('/assets/stickers/turtle_heritage_archive_pavillion.png', 'Heritage Archive Pavilion');
export const TurtleMineralPolishingBasinSticker = renderStickerPng('/assets/stickers/turtle_mineral_polishing_basin.png', 'Mineral Polishing Shell Basin');
export const RocketAdventureSticker = renderStickerPng('/assets/stickers/rocket_adventure.png', 'Rocket Adventure Spotlight');

// User Provided Rewards & Milestone Badges
export const GuitarRockerSticker = renderStickerPng('/assets/stickers/guitar_rocker.png', 'Electric Guitar');
export const DinoRexSticker = renderStickerPng('/assets/stickers/dino_rex.png', 'Friendly Dinosaur');
export const AstronautHelmetSticker = renderStickerPng('/assets/stickers/astronaut_helmet.png', 'Cosmic Astronaut Helmet');
export const MagicWandSticker = renderStickerPng('/assets/stickers/magic_wand.png', 'Magic Star Wand');
export const GoldenTrainSticker = renderStickerPng('/assets/stickers/golden_train.png', 'Golden Locomotive Train');
export const RainbowHeartSticker = renderStickerPng('/assets/stickers/rainbow_heart.png', 'Rainbow Heart');
export const MorningSunriseSticker = renderStickerPng('/assets/stickers/morning_sunrise.png', 'Morning Sunrise');

// Caregiver Tour & Section Stickers
export const SatelliteDishSticker = renderStickerPng('/assets/stickers/satellite_dish.png', 'Satellite Dish Live Status');
export const SpokenMegaphoneSticker = renderStickerPng('/assets/stickers/spoken_megaphone.png', 'Spoken Megaphone Nudge');
export const VoiceMicrophoneSticker = renderStickerPng('/assets/stickers/voice_microphone.png', 'Voice Customization Microphone');
export const OfflineStorageSticker = renderStickerPng('/assets/stickers/offline_storage.png', 'Offline Storage Readiness');
export const SecurityLockSticker = renderStickerPng('/assets/stickers/security_lock.png', 'PIN Security Lock');

// Table A Confirmed Existing Illustrated Stickers
export const BookStorySticker = renderThemedStickerPng(
  '/assets/stickers/passport_book.png',
  '/assets/stickers/turtle_firefly_lantern_book.png',
  'Storybooks Reading'
);
export const CozyArmchairSticker = renderStickerPng('/assets/stickers/fav_quiet_break.png', 'Cozy Armchair Break');
export const CozyBedSticker = renderThemedStickerPng(
  '/assets/stickers/bedtime_sleep.png',
  '/assets/stickers/turtle_moss_bed_sleep.png',
  'Cozy Bedroom Bed'
);
export const GreenTreeSticker = renderStickerPng('/assets/stickers/fav_outside.png', 'Sunny Yard Green Tree');
export const GameControllerSticker = renderStickerPng('/assets/stickers/toy_box.png', 'Video Game Controller');
export const LungsBreathingSticker = renderStickerPng('/assets/stickers/coping_lungs_breathing.png', 'Deep Breathing Lungs');
export const RestNapSticker = renderStickerPng('/assets/stickers/fav_rest_tired.png', 'Cozy Rest Nap');
export const SickFeverSticker = renderStickerPng('/assets/stickers/feelings_thermometer.png', 'Feeling Unwell Fever');

// Table B User-Provided Outings, Coping, Pets & Wellness Stickers
export const PlanetSaturnSticker = renderStickerPng('/assets/stickers/planet_saturn.png', 'Planet Saturn');
export const AutumnLeafSticker = renderStickerPng('/assets/stickers/autumn_leaf.png', 'Autumn Leaf');
export const OceanWaveSticker = renderThemedStickerPng(
  '/assets/stickers/ocean_wave.png',
  '/assets/stickers/turtle_pond_ripple_wave.png',
  'Ocean Wave Overwhelmed'
);
export const BatteryMeterSticker = renderThemedStickerPng(
  '/assets/stickers/battery_meter.png',
  '/assets/stickers/turtle_bamboo_energy_meter.png',
  'Battery Meter'
);
export const PawPrintSticker = renderThemedStickerPng(
  '/assets/stickers/paw_print.png',
  '/assets/stickers/turtle_webbed_paw_stamp.png',
  'Pet Paw Print'
);
export const BoneTreatSticker = renderThemedStickerPng(
  '/assets/stickers/bone_treat.png',
  '/assets/stickers/turtle_water_chestnut_treat.png',
  'Dog Bone Treat'
);
export const TennisBallSticker = renderThemedStickerPng(
  '/assets/stickers/tennis_ball.png',
  '/assets/stickers/turtle_moss_play_ball.png',
  'Tennis Ball'
);
export const PottedPlantSticker = renderThemedStickerPng(
  '/assets/stickers/potted_plant.png',
  '/assets/stickers/turtle_log_bonsai_planter.png',
  'Potted Plant Care'
);
export const LaundryHamperSticker = renderThemedStickerPng(
  '/assets/stickers/laundry_hamper.png',
  '/assets/stickers/turtle_reed_laundry_basket.png',
  'Laundry Hamper'
);
export const ChocolateBarSticker = renderThemedStickerPng(
  '/assets/stickers/chocolate_bar.png',
  '/assets/stickers/turtle_honey_seed_bar.png',
  'Comfort Chocolate Bar'
);
export const RedBalloonSticker = renderThemedStickerPng(
  '/assets/stickers/red_balloon.png',
  '/assets/stickers/turtle_lotus_floating_lantern.png',
  'Red Balloon'
);
export const ShoppingCartSticker = renderThemedStickerPng(
  '/assets/stickers/shopping_cart.png',
  '/assets/stickers/turtle_woven_gathering_cart.png',
  'Supermarket Shopping Cart'
);
export const AirplaneFlightSticker = renderThemedStickerPng(
  '/assets/stickers/airplane_flight.png',
  '/assets/stickers/turtle_dragonfly_glide.png',
  'Passenger Airplane Flight'
);
export const TravelLuggageSticker = renderThemedStickerPng(
  '/assets/stickers/travel_luggage.png',
  '/assets/stickers/turtle_timber_explorer_trunk.png',
  'Travel Rolling Luggage'
);
export const BoardingTicketSticker = renderThemedStickerPng(
  '/assets/stickers/boarding_ticket.png',
  '/assets/stickers/turtle_wooden_token_pass.png',
  'Boarding Pass Ticket'
);
export const QuietVoiceSticker = renderThemedStickerPng(
  '/assets/stickers/quiet_voice.png',
  '/assets/stickers/turtle_whispering_reed_quiet.png',
  'Quiet Inside Voice'
);
export const HotCocoaSticker = renderThemedStickerPng(
  '/assets/stickers/hot_cocoa.png',
  '/assets/stickers/turtle_herbal_tea_mug.png',
  'Warm Hot Cocoa Mug'
);
export const JigsawPuzzleSticker = renderThemedStickerPng(
  '/assets/stickers/jigsaw_puzzle.png',
  '/assets/stickers/turtle_wooden_puzzle.png',
  'Jigsaw Puzzle Piece'
);

// Table C Sensory Triggers, Daily Care & Community Adventures (User Provided Sheets)
export const BrightLightsSticker = renderThemedStickerPng(
  '/assets/stickers/sensory_bright_lights.png',
  '/assets/stickers/turtle_shaded_canopy_lamp.png',
  'Bright Lights Sensory Trigger'
);
export const LoudNoiseSticker = renderThemedStickerPng(
  '/assets/stickers/sensory_loud_noise.png',
  '/assets/stickers/turtle_sound_softening_shell.png',
  'Loud Noise Sensitivity Trigger'
);
export const SocialMaskingSticker = renderThemedStickerPng(
  '/assets/stickers/sensory_social_masking.png',
  '/assets/stickers/turtle_cozy_shell_retreat.png',
  'Social Masking Fatigue'
);
export const LungsBreathingStickerNew = renderStickerPng('/assets/stickers/coping_lungs_breathing.png', 'Deep Breathing Lungs Pacer');
export const WritingJournalSticker = renderStickerPng('/assets/stickers/routine_writing_journal.png', 'Writing & Journaling');
export const MedicinePillSticker = renderThemedStickerPng(
  '/assets/stickers/routine_medicine_pill.png',
  '/assets/stickers/turtle_leaf_vitamins.png',
  'Daily Medication Pill'
);
export const ToiletRestroomSticker = renderThemedStickerPng(
  '/assets/stickers/routine_toilet_restroom.png',
  '/assets/stickers/turtle_bamboo_restroom.png',
  'Toilet Restroom'
);
export const WaterDropSticker = renderStickerPng('/assets/stickers/routine_water_drink.png', 'Water Hydration Tracker');
export const HaircutSalonSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_haircut_salon.png',
  '/assets/stickers/turtle_grooming_comb_mirror.png',
  'Hair Salon Haircut'
);
export const DoctorCheckupSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_doctor_checkup.png',
  '/assets/stickers/turtle_elder_healer_pouch.png',
  'Doctor Check-Up'
);
export const SwimmingPoolSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_swimming_pool.png',
  '/assets/stickers/turtle_spring_lagoon_pool.png',
  'Swimming Pool Outing'
);
export const MovieCinemaSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_movie_cinema.png',
  '/assets/stickers/turtle_shadow_puppet_theater.png',
  'Movie Cinema Theater'
);
export const BowlingAlleySticker = renderThemedStickerPng(
  '/assets/stickers/adventure_bowling_alley.png',
  '/assets/stickers/turtle_river_pebble_bowling.png',
  'Bowling Alley Outing'
);
export const CampingTentSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_camping_tent.png',
  '/assets/stickers/turtle_canopy_reed_tent.png',
  'Camping Adventure Tent'
);
export const MuseumVisitSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_museum_visit.png',
  '/assets/stickers/turtle_heritage_archive_pavillion.png',
  'Museum Visit Columns'
);

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
export const DentistAdventureSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_dentist.png',
  '/assets/stickers/turtle_mineral_polishing_basin.png',
  'Visiting the Dentist',
  '/assets/stickers/dino_trex_tooth_care.png',
  '/assets/stickers/frog_lotus_dental_station.png'
);
export const RestaurantAdventureSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_restaurant.png',
  '/assets/stickers/turtle_clover_berry_feast.png',
  'Eating at a Restaurant',
  '/assets/stickers/dino_feast_table_pavilion.png',
  '/assets/stickers/frog_feast_table_pavilion.png'
);
export const HaircutAdventureSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_haircut_salon.png',
  '/assets/stickers/turtle_grooming_comb_mirror.png',
  'Getting a Haircut',
  '/assets/stickers/dino_bone_comb_mirror.png',
  '/assets/stickers/frog_grooming_comb_mirror.png',
  '/assets/stickers/train_adventure_haircut.png',
  '/assets/stickers/space_adventure_haircut.png'
);
export const DoctorAdventureSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_doctor_checkup.png',
  '/assets/stickers/turtle_elder_healer_pouch.png',
  'Doctor Check-Up',
  '/assets/stickers/dino_healer_stethoscope_bag.png',
  '/assets/stickers/frog_healer_stethoscope_kit.png',
  '/assets/stickers/train_stethoscope.png',
  '/assets/stickers/space_stethoscope.png'
);
export const PlansChangeStorySticker = renderThemedStickerPng(
  '/assets/stickers/story_plans_change.png',
  '/assets/stickers/turtle_arched_bridge.png',
  'When Plans Change',
  '/assets/stickers/dino_footprint_loop.png',
  '/assets/stickers/frog_arched_willow_bridge.png',
  '/assets/stickers/train_circle_carpet.png',
  '/assets/stickers/space_circle_carpet.png'
);
export const BirthdayStorySticker = renderThemedStickerPng(
  '/assets/stickers/story_birthday.png',
  '/assets/stickers/turtle_clover_berry_feast.png',
  'Going to a Birthday Party',
  '/assets/stickers/dino_forager_feast_bowl.png',
  '/assets/stickers/frog_pond_birthday_feast.png',
  '/assets/stickers/train_story_birthday.png',
  '/assets/stickers/space_story_birthday.png'
);
export const TakingTurnsStorySticker = renderThemedStickerPng(
  '/assets/stickers/story_sharing.png',
  '/assets/stickers/turtle_zen_balancing_stones.png',
  'Taking Turns with Toys',
  '/assets/stickers/dino_wooden_stacking_blocks.png',
  '/assets/stickers/frog_zen_balancing_stones.png',
  '/assets/stickers/train_story_atlas.png',
  '/assets/stickers/space_bone_treat.png'
);
export const StethoscopeSticker = renderStickerPng('/assets/stickers/stethoscope.png', 'Stethoscope / Doctor');
export const RainCloudSticker = renderStickerPng('/assets/stickers/rain_cloud.png', 'Rainy Day');
export const PartlyCloudySticker = renderStickerPng('/assets/stickers/partly_cloudy.png', 'Partly Cloudy');
export const CloudyWeatherSticker = renderStickerPng('/assets/stickers/cloudy_weather.png', 'Overcast Cloudy Weather');
export const SnowWeatherSticker = renderStickerPng('/assets/stickers/snow_weather.png', 'Snow & Flurries');
export const ThunderstormWeatherSticker = renderStickerPng('/assets/stickers/thunderstorm_weather.png', 'Thunderstorm');
export const WindyWeatherSticker = renderStickerPng('/assets/stickers/windy_weather.png', 'Windy Breeze');
export const FogMistWeatherSticker = renderStickerPng('/assets/stickers/fog_mist_weather.png', 'Fog & Mist Weather');
export const RainbowWeatherSticker = renderStickerPng('/assets/stickers/rainbow_weather.png', 'Rainbow Weather');
export const HomeHouseSticker = renderThemedStickerPng(
  '/assets/stickers/home_house.png',
  '/assets/stickers/turtle_moss_cottage_home.png',
  'Home House'
);
export const TaskDoneSticker = renderThemedStickerPng(
  '/assets/stickers/task_done.png',
  '/assets/stickers/turtle_leaf_checkmark.png',
  'Task Done Checkmark'
);
export const TherapyBrainSticker = renderStickerPng('/assets/stickers/therapy_brain.png', 'Therapy & Sensory Brain');
export const SchoolBuildingSticker = renderThemedStickerPng(
  '/assets/stickers/school_building.png',
  '/assets/stickers/turtle_treehouse_gazebo.png',
  'School Building'
);
export const PizzaSliceSticker = renderStickerPng('/assets/stickers/pizza_slice.png', 'Pizza Slice');
export const PlaygroundSwingsSticker = renderThemedStickerPng(
  '/assets/stickers/playground_swings.png',
  '/assets/stickers/turtle_hollow_log_slide.png',
  'Playground Swings'
);

// Morning Mood & Emotion Yellow Stickers
export const MoodHappySticker = renderThemedStickerPng(
  '/assets/stickers/mood_happy.png',
  '/assets/stickers/turtle_mood_happy.png',
  'Happy Mood'
);
export const MoodCalmSticker = renderThemedStickerPng(
  '/assets/stickers/mood_calm.png',
  '/assets/stickers/turtle_mood_calm.png',
  'Calm Mood'
);
export const MoodExcitedSticker = renderThemedStickerPng(
  '/assets/stickers/mood_excited.png',
  '/assets/stickers/turtle_mood_excited.png',
  'Excited Mood'
);
export const MoodSleepySticker = renderThemedStickerPng(
  '/assets/stickers/mood_sleepy.png',
  '/assets/stickers/turtle_mood_sleepy.png',
  'Sleepy Mood'
);
export const MoodUnsureSticker = renderThemedStickerPng(
  '/assets/stickers/mood_unsure.png',
  '/assets/stickers/turtle_mood_unsure.png',
  'Unsure Mood'
);

// Favorite Sentences Yellow Stickers
export const FavLegoSticker = renderThemedStickerPng(
  '/assets/stickers/fav_lego.png',
  '/assets/stickers/turtle_zen_balancing_stones.png',
  'Lego Blocks'
);
export const FavBathSticker = renderThemedStickerPng(
  '/assets/stickers/fav_bath.png',
  '/assets/stickers/turtle_warm_spring_bath.png',
  'Take a Bath'
);
export const FavSandwichSticker = renderThemedStickerPng(
  '/assets/stickers/fav_sandwich.png',
  '/assets/stickers/turtle_garden_sandwich.png',
  'Sandwich Snack'
);
export const FavWaterSticker = renderThemedStickerPng(
  '/assets/stickers/fav_water.png',
  '/assets/stickers/turtle_bamboo_drink_cup.png',
  'Drink Water'
);
export const FavQuietBreakSticker = renderThemedStickerPng(
  '/assets/stickers/fav_quiet_break.png',
  '/assets/stickers/turtle_cozy_shell_retreat.png',
  'Quiet Break'
);
export const FavHelpSosSticker = renderThemedStickerPng(
  '/assets/stickers/fav_help_sos.png',
  '/assets/stickers/turtle_guardian_shield_sos.png',
  'Help Please'
);
export const FavOutsideSticker = renderThemedStickerPng(
  '/assets/stickers/fav_outside.png',
  '/assets/stickers/turtle_treehouse_gazebo.png',
  'Go Outside'
);
export const FavLoveHeartSticker = renderThemedStickerPng(
  '/assets/stickers/fav_love_heart.png',
  '/assets/stickers/turtle_shell_heart.png',
  'I Love You'
);
export const FavRestTiredSticker = renderThemedStickerPng(
  '/assets/stickers/fav_rest_tired.png',
  '/assets/stickers/turtle_moss_bed_sleep.png',
  'Rest and Sleep'
);
export const FavMusicSticker = renderThemedStickerPng(
  '/assets/stickers/fav_music.png',
  '/assets/stickers/turtle_bamboo_wind_chimes.png',
  'Listen to Music'
);
export const FavStopSticker = renderThemedStickerPng(
  '/assets/stickers/fav_stop.png',
  '/assets/stickers/turtle_stop_flipper.png',
  'Stop Please'
);
export const FavHappySticker = renderStickerPng('/assets/stickers/fav_happy.png', 'I Am Happy');

// User Provided Grounding, Cooking & Caregiver Response Stickers
export const EyeSeeSticker = renderStickerPng('/assets/stickers/eye_see.png', 'Look Around Eye');
export const GroundingTouchHandSticker = renderStickerPng('/assets/stickers/grounding_touch_hand.png', 'Touch Hand');
export const GroundingHearEarSticker = renderStickerPng('/assets/stickers/grounding_hear_ear.png', 'Hear Ear');
export const GroundingSmellNoseSticker = renderStickerPng('/assets/stickers/grounding_smell_nose.png', 'Smell Nose');
export const CookingPotSticker = renderStickerPng('/assets/stickers/cooking_pot.png', 'Cooking Pan');
export const CaregiverResponseOkaySticker = renderStickerPng('/assets/stickers/caregiver_response_okay.png', 'Caregiver Okay Thumbs Up');

export const TURTLE_STICKER_SWAPS: Record<string, string> = {
  // Adventure Step Mappings
  '/assets/stickers/home_house.png': '/assets/stickers/turtle_moss_cottage_home.png',
  '/assets/stickers/car_ride.png': '/assets/stickers/turtle_bamboo_ferry.png',
  '/assets/stickers/clipboard_shutdown.png': '/assets/stickers/turtle_bamboo_tablet.png',
  '/assets/stickers/cutlery_meal.png': '/assets/stickers/turtle_bamboo_cutlery.png',
  '/assets/stickers/hiking_trail_boots.png': '/assets/stickers/turtle_reed_explorer_shoes.png',
  '/assets/stickers/ocean_wave.png': '/assets/stickers/turtle_pond_ripple_wave.png',
  '/assets/stickers/speech_bubble.png': '/assets/stickers/turtle_leaf_speech_bubbles.png',
  '/assets/stickers/reward_trophy.png': '/assets/stickers/turtle_lotus_trophy.png',
  '/assets/stickers/star_gold.png': '/assets/stickers/turtle_webbed_paw_stamp.png',
  '/assets/stickers/pizza_slice.png': '/assets/stickers/turtle_clover_berry_feast.png',
  '/assets/stickers/stethoscope.png': '/assets/stickers/turtle_elder_healer_pouch.png',
  '/assets/stickers/waiting_room_couch.png': '/assets/stickers/turtle_waiting_room_couch.png',
  '/assets/stickers/waving_hand_hello.png': '/assets/stickers/turtle_waving_hand_hello.png',
  '/assets/stickers/padded_recliner_chair.png': '/assets/stickers/turtle_padded_recliner_chair.png',
  '/assets/stickers/open_mouth_wide.png': '/assets/stickers/turtle_open_mouth_wide.png',
  '/assets/stickers/open_mouth_lion.png': '/assets/stickers/turtle_open_mouth_wide.png',
  '/assets/stickers/open_welcome_door.png': '/assets/stickers/turtle_open_welcome_door.png',
  '/assets/stickers/dining_table_booth.png': '/assets/stickers/turtle_dining_table_booth.png',
  '/assets/stickers/restaurant_menu_book.png': '/assets/stickers/turtle_restaurant_menu_book.png',
  '/assets/stickers/barbershop_pole.png': '/assets/stickers/turtle_barbershop_pole.png',
  '/assets/stickers/haircut_cape.png': '/assets/stickers/turtle_haircut_cape.png',
  '/assets/stickers/water_spray_bottle.png': '/assets/stickers/turtle_water_spray_bottle.png',
  '/assets/stickers/barber_neck_brush.png': '/assets/stickers/turtle_barber_neck_brush.png',
  '/assets/stickers/salon_hand_mirror.png': '/assets/stickers/turtle_salon_hand_mirror.png',
  '/assets/stickers/medical_clinic_building.png': '/assets/stickers/turtle_medical_clinic_building.png',
  '/assets/stickers/clinic_height_scale.png': '/assets/stickers/turtle_clinic_height_scale.png',
  '/assets/stickers/doctor_exam_bed.png': '/assets/stickers/turtle_doctor_exam_bed.png',
  '/assets/stickers/doctor_ear_light.png': '/assets/stickers/turtle_doctor_ear_light.png',
  '/assets/stickers/walking_pool_feet.png': '/assets/stickers/turtle_walking_pool_feet.png',
  '/assets/stickers/swim_goggles_floaties.png': '/assets/stickers/turtle_swim_goggles_floaties.png',
  '/assets/stickers/fluffy_beach_towel.png': '/assets/stickers/turtle_fluffy_beach_towel.png',
  '/assets/stickers/movie_projector_screen.png': '/assets/stickers/turtle_movie_projector_screen.png',
  '/assets/stickers/bowling_ball_holes.png': '/assets/stickers/turtle_bowling_ball_holes.png',
  '/assets/stickers/bowling_lane_bumpers.png': '/assets/stickers/turtle_bowling_lane_bumpers.png',
  '/assets/stickers/bowling_pins_strike.png': '/assets/stickers/turtle_bowling_pins_strike.png',
  '/assets/stickers/high_five_hands.png': '/assets/stickers/turtle_high_five_hands.png',
  '/assets/stickers/pine_trees_forest.png': '/assets/stickers/turtle_pine_trees_forest.png',
  '/assets/stickers/camping_sleeping_bag.png': '/assets/stickers/turtle_camping_sleeping_bag.png',
  '/assets/stickers/campfire_marshmallows.png': '/assets/stickers/turtle_campfire_marshmallows.png',
  '/assets/stickers/museum_paper_map.png': '/assets/stickers/turtle_museum_paper_map.png',
  '/assets/stickers/museum_dinosaur_fossil.png': '/assets/stickers/turtle_museum_dinosaur_fossil.png',
  '/assets/stickers/observing_magnifying_glass.png': '/assets/stickers/turtle_observing_magnifying_glass.png',
  // Batch 8 Swaps
  '/assets/stickers/tennis_ball.png': '/assets/stickers/turtle_moss_play_ball.png',
  '/assets/stickers/bone_treat.png': '/assets/stickers/turtle_water_chestnut_treat.png',
  '/assets/stickers/paw_print.png': '/assets/stickers/turtle_webbed_paw_stamp.png',
  '/assets/stickers/potted_plant.png': '/assets/stickers/turtle_log_bonsai_planter.png',
  '/assets/stickers/adventure_haircut_salon.png': '/assets/stickers/turtle_grooming_comb_mirror.png',
  '/assets/stickers/adventure_doctor_checkup.png': '/assets/stickers/turtle_elder_healer_pouch.png',
  '/assets/stickers/adventure_swimming_pool.png': '/assets/stickers/turtle_spring_lagoon_pool.png',
  '/assets/stickers/adventure_movie_cinema.png': '/assets/stickers/turtle_shadow_puppet_theater.png',
  '/assets/stickers/adventure_bowling_alley.png': '/assets/stickers/turtle_river_pebble_bowling.png',
  '/assets/stickers/adventure_camping_tent.png': '/assets/stickers/turtle_canopy_reed_tent.png',
  '/assets/stickers/adventure_museum_visit.png': '/assets/stickers/turtle_heritage_archive_pavillion.png',
  '/assets/stickers/adventure_dentist.png': '/assets/stickers/turtle_mineral_polishing_basin.png',
  // Previous Batches Swaps
  '/assets/stickers/alarm_clock.png': '/assets/stickers/turtle_dawn_bell_clock.png',
  '/assets/stickers/routine_toilet_restroom.png': '/assets/stickers/turtle_bamboo_restroom.png',
  '/assets/stickers/pancakes_breakfast.png': '/assets/stickers/turtle_clover_berry_feast.png',
  '/assets/stickers/backpack_school.png': '/assets/stickers/turtle_shell_backpack.png',
  '/assets/stickers/sneaker_shoes.png': '/assets/stickers/turtle_reed_explorer_shoes.png',
  '/assets/stickers/apple_snack.png': '/assets/stickers/turtle_garden_fruit_snack.png',
  '/assets/stickers/folder_schoolwork.png': '/assets/stickers/turtle_botanical_folder.png',
  '/assets/stickers/pencil_write.png': '/assets/stickers/turtle_bamboo_pencil.png',
  '/assets/stickers/teddy_bear.png': '/assets/stickers/turtle_seagrass_toy_box.png',
  '/assets/stickers/shower_wash.png': '/assets/stickers/turtle_warm_spring_bath.png',
  '/assets/stickers/school_bus.png': '/assets/stickers/turtle_bamboo_ferry.png',
  '/assets/stickers/science_flask.png': '/assets/stickers/turtle_terrarium_science.png',
  '/assets/stickers/art_palette.png': '/assets/stickers/turtle_pebble_paint_palette.png',
  '/assets/stickers/dinner_bowl.png': '/assets/stickers/turtle_clover_berry_feast.png',
  '/assets/stickers/bathtub_wash.png': '/assets/stickers/turtle_warm_spring_bath.png',
  '/assets/stickers/pajamas_sleep.png': '/assets/stickers/turtle_starry_pajamas.png',
  '/assets/stickers/circle_carpet.png': '/assets/stickers/turtle_cozy_shell_retreat.png',
  '/assets/stickers/teen_headphones.png': '/assets/stickers/turtle_shell_headphones.png',
  '/assets/stickers/schedule_calendar.png': '/assets/stickers/turtle_bamboo_calendar.png',
  '/assets/stickers/bedtime_sleep.png': '/assets/stickers/turtle_moss_bed_sleep.png',
  // New Handcrafted & Themed Turtle Replacements
  '/assets/stickers/language_globe.png': '/assets/stickers/turtle_lagoon_globe.png',
  '/assets/stickers/child_persona.png': '/assets/stickers/turtle_child_persona_hatchling.png',
  '/assets/stickers/adult_briefcase.png': '/assets/stickers/turtle_bamboo_satchel_briefcase.png',
  '/assets/stickers/caregiver_phone.png': '/assets/stickers/turtle_wood_phone_caregiver.png',
  '/assets/stickers/trial_crown.png': '/assets/stickers/turtle_golden_shell_crown.png',
  '/assets/stickers/refresh_repeat.png': '/assets/stickers/turtle_swimming_loop.png',
  '/assets/stickers/fav_love_heart.png': '/assets/stickers/turtle_shell_heart.png',
  '/assets/stickers/fav_outside.png': '/assets/stickers/turtle_treehouse_gazebo.png',
  '/assets/stickers/fav_lego.png': '/assets/stickers/turtle_zen_balancing_stones.png',
  '/assets/stickers/fav_stop.png': '/assets/stickers/turtle_stop_flipper.png',
  '/assets/stickers/mood_happy.png': '/assets/stickers/turtle_mood_happy.png',
  '/assets/stickers/mood_calm.png': '/assets/stickers/turtle_mood_calm.png',
  '/assets/stickers/mood_excited.png': '/assets/stickers/turtle_mood_excited.png',
  '/assets/stickers/mood_sleepy.png': '/assets/stickers/turtle_mood_sleepy.png',
  '/assets/stickers/mood_unsure.png': '/assets/stickers/turtle_mood_unsure.png',
  '/assets/stickers/routine_water_drink.png': '/assets/stickers/turtle_bamboo_drink_cup.png',
  '/assets/stickers/fav_water.png': '/assets/stickers/turtle_bamboo_drink_cup.png',
  '/assets/stickers/fav_quiet_break.png': '/assets/stickers/turtle_cozy_shell_retreat.png',
  '/assets/stickers/fav_rest_tired.png': '/assets/stickers/turtle_moss_bed_sleep.png',
  '/assets/stickers/locker_schedule.png': '/assets/stickers/turtle_bamboo_calendar.png',
  '/assets/stickers/hot_cocoa.png': '/assets/stickers/turtle_herbal_tea_mug.png',
  '/assets/stickers/laundry_hamper.png': '/assets/stickers/turtle_reed_laundry_basket.png',
  '/assets/stickers/chocolate_bar.png': '/assets/stickers/turtle_honey_seed_bar.png',
  '/assets/stickers/red_balloon.png': '/assets/stickers/turtle_lotus_floating_lantern.png',
  '/assets/stickers/shopping_cart.png': '/assets/stickers/turtle_woven_gathering_cart.png',
  '/assets/stickers/airplane_flight.png': '/assets/stickers/turtle_dragonfly_glide.png',
  '/assets/stickers/travel_luggage.png': '/assets/stickers/turtle_timber_explorer_trunk.png',
  '/assets/stickers/boarding_ticket.png': '/assets/stickers/turtle_wooden_token_pass.png',
  '/assets/stickers/quiet_voice.png': '/assets/stickers/turtle_whispering_reed_quiet.png',
  '/assets/stickers/jigsaw_puzzle.png': '/assets/stickers/turtle_wooden_puzzle.png',
  '/assets/stickers/sensory_bright_lights.png': '/assets/stickers/turtle_shaded_canopy_lamp.png',
  '/assets/stickers/sensory_loud_noise.png': '/assets/stickers/turtle_sound_softening_shell.png',
  '/assets/stickers/sensory_social_masking.png': '/assets/stickers/turtle_cozy_shell_retreat.png',
  '/assets/stickers/fidget_bubbles.png': '/assets/stickers/turtle_pond_fidget_bubbles.png',
  '/assets/stickers/breathing_cloud.png': '/assets/stickers/turtle_lagoon_breeze_breath.png',
  '/assets/stickers/decision_wheel.png': '/assets/stickers/turtle_wooden_wheel.png',
  '/assets/stickers/timer_clock.png': '/assets/stickers/turtle_sand_timer.png',
  '/assets/stickers/help_sos.png': '/assets/stickers/turtle_guardian_shield_sos.png',
  '/assets/stickers/about_id.png': '/assets/stickers/turtle_wooden_id_badge.png',
  '/assets/stickers/passport_book.png': '/assets/stickers/turtle_firefly_lantern_book.png',
  '/assets/stickers/quick_phrases.png': '/assets/stickers/turtle_leaf_speech_bubbles.png',
  '/assets/stickers/keyboard.png': '/assets/stickers/turtle_bamboo_keyboard.png',
  '/assets/stickers/feelings_thermometer.png': '/assets/stickers/turtle_bamboo_thermometer.png',
  '/assets/stickers/medications_health.png': '/assets/stickers/turtle_leaf_vitamins.png',
  '/assets/stickers/evening_moon.png': '/assets/stickers/turtle_lagoon_moon.png',
  '/assets/stickers/toothbrush.png': '/assets/stickers/turtle_bamboo_toothbrush.png',
  '/assets/stickers/toy_box.png': '/assets/stickers/turtle_seagrass_toy_box.png',
  '/assets/stickers/clothes_dressed.png': '/assets/stickers/turtle_cozy_hoodie.png',
  '/assets/stickers/soap_wash_hands.png': '/assets/stickers/turtle_leaf_soap_wash.png',
  '/assets/stickers/spoons_energy.png': '/assets/stickers/turtle_bamboo_spoons.png',
  '/assets/stickers/tablet_ipad.png': '/assets/stickers/turtle_bamboo_tablet.png',
  '/assets/stickers/caregiver_heart.png': '/assets/stickers/turtle_shell_heart.png',
  '/assets/stickers/eye_see.png': '/assets/stickers/turtle_river_stone.png',
  '/assets/stickers/drink_water.png': '/assets/stickers/turtle_bamboo_drink_cup.png',
  '/assets/stickers/adventure_restaurant.png': '/assets/stickers/turtle_clover_berry_feast.png',
  '/assets/stickers/story_plans_change.png': '/assets/stickers/turtle_arched_bridge.png',
  '/assets/stickers/story_birthday.png': '/assets/stickers/turtle_clover_berry_feast.png',
  '/assets/stickers/story_sharing.png': '/assets/stickers/turtle_zen_balancing_stones.png',
};

export const DINO_STICKER_SWAPS: Record<string, string> = {
  // Adventure Step Mappings
  '/assets/stickers/home_house.png': '/assets/stickers/dino_cavern_retreat.png',
  '/assets/stickers/clipboard_shutdown.png': '/assets/stickers/dino_slate_tablet_ipad.png',
  '/assets/stickers/cutlery_meal.png': '/assets/stickers/dino_bone_cutlery_fork_spoon.png',
  '/assets/stickers/hiking_trail_boots.png': '/assets/stickers/dino_trail_explorer_boots.png',
  '/assets/stickers/speech_bubble.png': '/assets/stickers/dino_jungle_speech_bubbles.png',
  '/assets/stickers/stethoscope.png': '/assets/stickers/dino_healer_stethoscope_bag.png',
  '/assets/stickers/pizza_slice.png': '/assets/stickers/dino_forager_feast_bowl.png',
  '/assets/stickers/boarding_ticket.png': '/assets/stickers/dino_expedition_log_book.png',
  '/assets/stickers/waiting_room_couch.png': '/assets/stickers/dino_waiting_room_couch.png',
  '/assets/stickers/waving_hand_hello.png': '/assets/stickers/dino_waving_hand_hello.png',
  '/assets/stickers/padded_recliner_chair.png': '/assets/stickers/dino_padded_recliner_chair.png',
  '/assets/stickers/open_mouth_wide.png': '/assets/stickers/dino_open_mouth_wide.png',
  '/assets/stickers/open_mouth_lion.png': '/assets/stickers/dino_open_mouth_wide.png',
  '/assets/stickers/open_welcome_door.png': '/assets/stickers/dino_open_welcome_door.png',
  '/assets/stickers/dining_table_booth.png': '/assets/stickers/dino_dining_table_booth.png',
  '/assets/stickers/restaurant_menu_book.png': '/assets/stickers/dino_restaurant_menu_book.png',
  '/assets/stickers/barbershop_pole.png': '/assets/stickers/dino_barbershop_pole.png',
  '/assets/stickers/haircut_cape.png': '/assets/stickers/dino_haircut_cape.png',
  '/assets/stickers/water_spray_bottle.png': '/assets/stickers/dino_water_spray_bottle.png',
  '/assets/stickers/barber_neck_brush.png': '/assets/stickers/dino_barber_neck_brush.png',
  '/assets/stickers/salon_hand_mirror.png': '/assets/stickers/dino_salon_hand_mirror.png',
  '/assets/stickers/medical_clinic_building.png': '/assets/stickers/dino_medical_clinic_building.png',
  '/assets/stickers/clinic_height_scale.png': '/assets/stickers/dino_clinic_height_scale.png',
  '/assets/stickers/doctor_exam_bed.png': '/assets/stickers/dino_doctor_exam_bed.png',
  '/assets/stickers/doctor_ear_light.png': '/assets/stickers/dino_doctor_ear_light.png',
  '/assets/stickers/walking_pool_feet.png': '/assets/stickers/dino_walking_pool_feet.png',
  '/assets/stickers/swim_goggles_floaties.png': '/assets/stickers/dino_swim_goggles_floaties.png',
  '/assets/stickers/fluffy_beach_towel.png': '/assets/stickers/dino_fluffy_beach_towel.png',
  '/assets/stickers/movie_projector_screen.png': '/assets/stickers/dino_movie_projector_screen.png',
  '/assets/stickers/bowling_ball_holes.png': '/assets/stickers/dino_bowling_ball_holes.png',
  '/assets/stickers/bowling_lane_bumpers.png': '/assets/stickers/dino_bowling_lane_bumpers.png',
  '/assets/stickers/bowling_pins_strike.png': '/assets/stickers/dino_bowling_pins_strike.png',
  '/assets/stickers/high_five_hands.png': '/assets/stickers/dino_high_five_hands.png',
  '/assets/stickers/pine_trees_forest.png': '/assets/stickers/dino_pine_trees_forest.png',
  '/assets/stickers/camping_sleeping_bag.png': '/assets/stickers/dino_camping_sleeping_bag.png',
  '/assets/stickers/campfire_marshmallows.png': '/assets/stickers/dino_campfire_marshmallows.png',
  '/assets/stickers/museum_paper_map.png': '/assets/stickers/dino_museum_paper_map.png',
  '/assets/stickers/museum_dinosaur_fossil.png': '/assets/stickers/dino_museum_dinosaur_fossil.png',
  '/assets/stickers/observing_magnifying_glass.png': '/assets/stickers/dino_observing_magnifying_glass.png',
  // Batch 1: Core Routines & Favorites
  '/assets/stickers/routine_water_drink.png': '/assets/stickers/dino_stone_tumbler_water.png',
  '/assets/stickers/drink_water.png': '/assets/stickers/dino_stone_tumbler_water.png',
  '/assets/stickers/fav_water.png': '/assets/stickers/dino_stone_tumbler_water.png',
  '/assets/stickers/drink_cup.png': '/assets/stickers/dino_stone_tumbler_water.png',
  '/assets/stickers/bedtime_sleep.png': '/assets/stickers/dino_fern_nest_sleep.png',
  '/assets/stickers/fav_rest_tired.png': '/assets/stickers/dino_fern_nest_sleep.png',
  '/assets/stickers/fav_quiet_break.png': '/assets/stickers/dino_cavern_retreat.png',
  '/assets/stickers/breathing_cloud.png': '/assets/stickers/dino_cavern_retreat.png',
  '/assets/stickers/alarm_clock.png': '/assets/stickers/dino_sundial_clock.png',
  '/assets/stickers/clothes_dressed.png': '/assets/stickers/dino_spike_hoodie.png',
  '/assets/stickers/soap_wash_hands.png': '/assets/stickers/dino_amber_soap.png',
  '/assets/stickers/toothbrush.png': '/assets/stickers/dino_bone_toothbrush.png',
  '/assets/stickers/dinner_bowl.png': '/assets/stickers/dino_forager_feast_bowl.png',
  '/assets/stickers/pancakes_breakfast.png': '/assets/stickers/dino_forager_feast_bowl.png',
  '/assets/stickers/backpack_school.png': '/assets/stickers/dino_expedition_backpack.png',
  '/assets/stickers/fav_lego.png': '/assets/stickers/dino_wooden_stacking_blocks.png',
  '/assets/stickers/fav_outside.png': '/assets/stickers/dino_cycad_palm_tree.png',
  '/assets/stickers/fav_love_heart.png': '/assets/stickers/dino_triceratops_frill_heart.png',
  '/assets/stickers/fav_bath.png': '/assets/stickers/dino_warm_spring_bath.png',
  '/assets/stickers/bath_time.png': '/assets/stickers/dino_warm_spring_bath.png',
  '/assets/stickers/fav_help_sos.png': '/assets/stickers/dino_ankylosaurus_shield_sos.png',
  '/assets/stickers/help_sos.png': '/assets/stickers/dino_ankylosaurus_shield_sos.png',
  '/assets/stickers/schedule_calendar.png': '/assets/stickers/dino_slate_checklist_tablet.png',
  '/assets/stickers/locker_schedule.png': '/assets/stickers/dino_slate_checklist_tablet.png',
  // Batch 2: Moods, Personas, School & Hubs
  '/assets/stickers/mood_happy.png': '/assets/stickers/dino_mood_happy.png',
  '/assets/stickers/fav_happy.png': '/assets/stickers/dino_mood_happy.png',
  '/assets/stickers/mood_calm.png': '/assets/stickers/dino_mood_calm.png',
  '/assets/stickers/mood_excited.png': '/assets/stickers/dino_mood_excited.png',
  '/assets/stickers/mood_sleepy.png': '/assets/stickers/dino_mood_sleepy.png',
  '/assets/stickers/mood_unsure.png': '/assets/stickers/dino_mood_unsure.png',
  '/assets/stickers/fav_stop.png': '/assets/stickers/dino_stop_stamp.png',
  '/assets/stickers/fav_music.png': '/assets/stickers/dino_bamboo_flute_music.png',
  '/assets/stickers/music_sensory.png': '/assets/stickers/dino_bamboo_flute_music.png',
  '/assets/stickers/fav_sandwich.png': '/assets/stickers/dino_flatbread_sandwich.png',
  '/assets/stickers/child_persona.png': '/assets/stickers/dino_child_persona_rex.png',
  '/assets/stickers/teen_headphones.png': '/assets/stickers/dino_ammonite_headphones.png',
  '/assets/stickers/adult_briefcase.png': '/assets/stickers/dino_expedition_satchel_briefcase.png',
  '/assets/stickers/caregiver_phone.png': '/assets/stickers/dino_slate_phone_caregiver.png',
  '/assets/stickers/language_globe.png': '/assets/stickers/dino_pangea_globe.png',
  '/assets/stickers/trial_crown.png': '/assets/stickers/dino_golden_amber_crown.png',
  '/assets/stickers/refresh_repeat.png': '/assets/stickers/dino_footprint_loop.png',
  // Batch 3: School, Coping Tools & Activities
  '/assets/stickers/school_bus.png': '/assets/stickers/dino_safari_wagon_bus.png',
  '/assets/stickers/science_flask.png': '/assets/stickers/dino_volcano_flask_science.png',
  '/assets/stickers/art_palette.png': '/assets/stickers/dino_slate_art_palette.png',
  '/assets/stickers/art_crafts.png': '/assets/stickers/dino_slate_art_palette.png',
  '/assets/stickers/pencil_write.png': '/assets/stickers/dino_bone_stylus_pencil.png',
  '/assets/stickers/homework_study.png': '/assets/stickers/dino_bone_stylus_pencil.png',
  '/assets/stickers/folder_schoolwork.png': '/assets/stickers/dino_palm_leaf_folio.png',
  '/assets/stickers/playground_swings.png': '/assets/stickers/dino_brachiosaurus_slide_swings.png',
  '/assets/stickers/playground_recess.png': '/assets/stickers/dino_brachiosaurus_slide_swings.png',
  '/assets/stickers/apple_snack.png': '/assets/stickers/dino_starfruit_apple_snack.png',
  '/assets/stickers/pajamas_sleep.png': '/assets/stickers/dino_starry_pajamas_sleep.png',
  '/assets/stickers/pajamas_shorts.png': '/assets/stickers/dino_starry_pajamas_sleep.png',
  '/assets/stickers/car_ride.png': '/assets/stickers/dino_wooden_cart_ride.png',
  '/assets/stickers/tablet_ipad.png': '/assets/stickers/dino_slate_tablet_ipad.png',
  '/assets/stickers/toy_box.png': '/assets/stickers/dino_vine_toy_box.png',
  '/assets/stickers/spoons_energy.png': '/assets/stickers/dino_bone_stamina_spoons.png',
  '/assets/stickers/fidget_bubbles.png': '/assets/stickers/dino_spring_sensory_bubbles.png',
  '/assets/stickers/decision_wheel.png': '/assets/stickers/dino_stone_decision_wheel.png',
  '/assets/stickers/clock_time.png': '/assets/stickers/dino_ammonite_spiral_clock.png',
  // Batch 4: Communication Hubs, Outings & Daily Activities
  '/assets/stickers/about_id.png': '/assets/stickers/dino_explorer_id_badge.png',
  '/assets/stickers/adventure_dentist.png': '/assets/stickers/dino_trex_tooth_care.png',
  '/assets/stickers/feelings_thermometer.png': '/assets/stickers/dino_volcano_thermometer.png',
  '/assets/stickers/timer_clock.png': '/assets/stickers/dino_stone_stopwatch.png',
  '/assets/stickers/aac_core.png': '/assets/stickers/dino_amber_star_core.png',
  '/assets/stickers/star_gold.png': '/assets/stickers/dino_amber_star_core.png',
  '/assets/stickers/passport_book.png': '/assets/stickers/dino_expedition_log_book.png',
  '/assets/stickers/quick_phrases.png': '/assets/stickers/dino_jungle_speech_bubbles.png',
  '/assets/stickers/keyboard.png': '/assets/stickers/dino_carved_slate_keyboard.png',
  '/assets/stickers/caregiver_heart.png': '/assets/stickers/dino_caregiver_heart.png',
  '/assets/stickers/eye_see.png': '/assets/stickers/dino_sensory_eye_stone.png',
  '/assets/stickers/hot_cocoa.png': '/assets/stickers/dino_herbal_tea_mug.png',
  '/assets/stickers/laundry_hamper.png': '/assets/stickers/dino_reed_laundry_basket.png',
  '/assets/stickers/chocolate_bar.png': '/assets/stickers/dino_seed_honey_bar.png',
  '/assets/stickers/travel_luggage.png': '/assets/stickers/dino_expedition_timber_trunk.png',
  '/assets/stickers/quiet_voice.png': '/assets/stickers/dino_whispering_baby_shh.png',
  // Batch 5: Outings, Routines, Health & Sensory Triggers
  '/assets/stickers/routine_toilet_restroom.png': '/assets/stickers/dino_stone_washroom_basin.png',
  '/assets/stickers/sneaker_shoes.png': '/assets/stickers/dino_trail_explorer_boots.png',
  '/assets/stickers/evening_moon.png': '/assets/stickers/dino_prehistoric_moon.png',
  '/assets/stickers/medications_health.png': '/assets/stickers/dino_herbal_wellness_vial.png',
  '/assets/stickers/adventure_doctor_checkup.png': '/assets/stickers/dino_healer_stethoscope_bag.png',
  '/assets/stickers/adventure_haircut_salon.png': '/assets/stickers/dino_bone_comb_mirror.png',
  '/assets/stickers/adventure_camping_tent.png': '/assets/stickers/dino_expedition_camp_tent.png',
  '/assets/stickers/adventure_swimming_pool.png': '/assets/stickers/dino_geothermal_spring_pool.png',
  '/assets/stickers/adventure_movie_cinema.png': '/assets/stickers/dino_shadow_puppet_lantern.png',
  '/assets/stickers/sensory_loud_noise.png': '/assets/stickers/dino_ammonite_ear_defenders.png',
  '/assets/stickers/sensory_bright_lights.png': '/assets/stickers/dino_sun_hat_shades.png',
  '/assets/stickers/sensory_social_masking.png': '/assets/stickers/dino_secret_cavern_den.png',
  '/assets/stickers/bone_treat.png': '/assets/stickers/dino_fossil_bone_treat.png',
  '/assets/stickers/shopping_cart.png': '/assets/stickers/dino_wooden_gathering_wagon.png',
  '/assets/stickers/airplane_flight.png': '/assets/stickers/dino_pterodactyl_flight.png',
  '/assets/stickers/shower_wash.png': '/assets/stickers/dino_warm_spring_bath.png',
  '/assets/stickers/bathtub_wash.png': '/assets/stickers/dino_warm_spring_bath.png',
  // Batch 6: Activities, Rewards, Pets & Outings
  '/assets/stickers/teddy_bear.png': '/assets/stickers/dino_plush_stego_toy.png',
  '/assets/stickers/pet_care.png': '/assets/stickers/dino_hatchling_pet_bowl.png',
  '/assets/stickers/outdoor_sun.png': '/assets/stickers/dino_primeval_sun_canopy.png',
  '/assets/stickers/reward_trophy.png': '/assets/stickers/dino_amber_fossil_trophy.png',
  '/assets/stickers/candy_treat.png': '/assets/stickers/dino_leaf_berry_treat.png',
  '/assets/stickers/fork_knife.png': '/assets/stickers/dino_bone_cutlery_fork_spoon.png',
  '/assets/stickers/ocean_wave.png': '/assets/stickers/dino_tidal_ripple_wave.png',
  '/assets/stickers/battery_meter.png': '/assets/stickers/dino_amber_energy_gauge.png',
  '/assets/stickers/paw_print.png': '/assets/stickers/dino_track_paw_print.png',
  '/assets/stickers/tennis_ball.png': '/assets/stickers/dino_woven_moss_play_ball.png',
  '/assets/stickers/potted_plant.png': '/assets/stickers/dino_fern_log_planter.png',
  '/assets/stickers/adventure_bowling_alley.png': '/assets/stickers/dino_stone_pebble_bowling.png',
  '/assets/stickers/adventure_museum_visit.png': '/assets/stickers/dino_amber_museum_archive.png',
  '/assets/stickers/adventure_restaurant.png': '/assets/stickers/dino_feast_table_pavilion.png',
  '/assets/stickers/jigsaw_puzzle.png': '/assets/stickers/dino_fossil_puzzle_piece.png',
  '/assets/stickers/story_plans_change.png': '/assets/stickers/dino_footprint_loop.png',
  '/assets/stickers/story_birthday.png': '/assets/stickers/dino_forager_feast_bowl.png',
  '/assets/stickers/story_sharing.png': '/assets/stickers/dino_wooden_stacking_blocks.png',
};

export const FROG_STICKER_SWAPS: Record<string, string> = {
  // Adventure Step Mappings
  '/assets/stickers/home_house.png': '/assets/stickers/frog_willow_hollow_retreat.png',
  '/assets/stickers/clipboard_shutdown.png': '/assets/stickers/frog_bamboo_tablet_ipad.png',
  '/assets/stickers/cutlery_meal.png': '/assets/stickers/frog_bamboo_cutlery.png',
  '/assets/stickers/hiking_trail_boots.png': '/assets/stickers/frog_reed_explorer_shoes.png',
  '/assets/stickers/speech_bubble.png': '/assets/stickers/frog_lily_speech_bubbles.png',
  '/assets/stickers/stethoscope.png': '/assets/stickers/frog_healer_stethoscope_kit.png',
  '/assets/stickers/pizza_slice.png': '/assets/stickers/frog_pond_harvest_bowl.png',
  '/assets/stickers/boarding_ticket.png': '/assets/stickers/frog_reed_checklist_board.png',
  '/assets/stickers/waiting_room_couch.png': '/assets/stickers/frog_waiting_room_couch.png',
  '/assets/stickers/waving_hand_hello.png': '/assets/stickers/frog_waving_hand_hello.png',
  '/assets/stickers/padded_recliner_chair.png': '/assets/stickers/frog_padded_recliner_chair.png',
  '/assets/stickers/open_mouth_wide.png': '/assets/stickers/frog_open_mouth_wide.png',
  '/assets/stickers/open_mouth_lion.png': '/assets/stickers/frog_open_mouth_wide.png',
  '/assets/stickers/open_welcome_door.png': '/assets/stickers/frog_open_welcome_door.png',
  '/assets/stickers/dining_table_booth.png': '/assets/stickers/frog_dining_table_booth.png',
  '/assets/stickers/restaurant_menu_book.png': '/assets/stickers/frog_restaurant_menu_book.png',
  '/assets/stickers/barbershop_pole.png': '/assets/stickers/frog_barbershop_pole.png',
  '/assets/stickers/haircut_cape.png': '/assets/stickers/frog_haircut_cape.png',
  '/assets/stickers/water_spray_bottle.png': '/assets/stickers/frog_water_spray_bottle.png',
  '/assets/stickers/barber_neck_brush.png': '/assets/stickers/frog_barber_neck_brush.png',
  '/assets/stickers/salon_hand_mirror.png': '/assets/stickers/frog_salon_hand_mirror.png',
  '/assets/stickers/medical_clinic_building.png': '/assets/stickers/frog_medical_clinic_building.png',
  '/assets/stickers/clinic_height_scale.png': '/assets/stickers/frog_clinic_height_scale.png',
  '/assets/stickers/doctor_exam_bed.png': '/assets/stickers/frog_doctor_exam_bed.png',
  '/assets/stickers/doctor_ear_light.png': '/assets/stickers/frog_doctor_ear_light.png',
  '/assets/stickers/walking_pool_feet.png': '/assets/stickers/frog_walking_pool_feet.png',
  '/assets/stickers/swim_goggles_floaties.png': '/assets/stickers/frog_swim_goggles_floaties.png',
  '/assets/stickers/fluffy_beach_towel.png': '/assets/stickers/frog_fluffy_beach_towel.png',
  '/assets/stickers/movie_projector_screen.png': '/assets/stickers/frog_movie_projector_screen.png',
  '/assets/stickers/bowling_ball_holes.png': '/assets/stickers/frog_bowling_ball_holes.png',
  '/assets/stickers/bowling_lane_bumpers.png': '/assets/stickers/frog_bowling_lane_bumpers.png',
  '/assets/stickers/bowling_pins_strike.png': '/assets/stickers/frog_bowling_pins_strike.png',
  '/assets/stickers/high_five_hands.png': '/assets/stickers/frog_high_five_hands.png',
  '/assets/stickers/pine_trees_forest.png': '/assets/stickers/frog_pine_trees_forest.png',
  '/assets/stickers/camping_sleeping_bag.png': '/assets/stickers/frog_camping_sleeping_bag.png',
  '/assets/stickers/campfire_marshmallows.png': '/assets/stickers/frog_campfire_marshmallows.png',
  '/assets/stickers/museum_paper_map.png': '/assets/stickers/frog_museum_paper_map.png',
  '/assets/stickers/museum_dinosaur_fossil.png': '/assets/stickers/frog_museum_dinosaur_fossil.png',
  '/assets/stickers/observing_magnifying_glass.png': '/assets/stickers/frog_observing_magnifying_glass.png',
  // Batch 1: Core Daily Routines, Hubs & Wellness
  '/assets/stickers/routine_water_drink.png': '/assets/stickers/frog_dewdrop_bamboo_cup.png',
  '/assets/stickers/drink_water.png': '/assets/stickers/frog_dewdrop_bamboo_cup.png',
  '/assets/stickers/fav_water.png': '/assets/stickers/frog_dewdrop_bamboo_cup.png',
  '/assets/stickers/drink_cup.png': '/assets/stickers/frog_dewdrop_bamboo_cup.png',
  '/assets/stickers/bedtime_sleep.png': '/assets/stickers/frog_lily_bed_sleep.png',
  '/assets/stickers/fav_rest_tired.png': '/assets/stickers/frog_lily_bed_sleep.png',
  '/assets/stickers/fav_quiet_break.png': '/assets/stickers/frog_willow_retreat_calm.png',
  '/assets/stickers/breathing_cloud.png': '/assets/stickers/frog_willow_retreat_calm.png',
  '/assets/stickers/alarm_clock.png': '/assets/stickers/frog_lotus_bell_clock.png',
  '/assets/stickers/clothes_dressed.png': '/assets/stickers/frog_raincoat_hoodie.png',
  '/assets/stickers/soap_wash_hands.png': '/assets/stickers/frog_lily_pad_soap.png',
  '/assets/stickers/toothbrush.png': '/assets/stickers/frog_bamboo_toothbrush.png',
  '/assets/stickers/dinner_bowl.png': '/assets/stickers/frog_pond_harvest_bowl.png',
  '/assets/stickers/pancakes_breakfast.png': '/assets/stickers/frog_pond_harvest_bowl.png',
  '/assets/stickers/backpack_school.png': '/assets/stickers/frog_explorer_backpack.png',
  '/assets/stickers/help_sos.png': '/assets/stickers/frog_leaf_shield_sos.png',
  '/assets/stickers/fav_help_sos.png': '/assets/stickers/frog_leaf_shield_sos.png',
  '/assets/stickers/schedule_calendar.png': '/assets/stickers/frog_reed_checklist_board.png',
  '/assets/stickers/locker_schedule.png': '/assets/stickers/frog_reed_checklist_board.png',
  '/assets/stickers/quick_phrases.png': '/assets/stickers/frog_lily_speech_bubbles.png',
  '/assets/stickers/feelings_thermometer.png': '/assets/stickers/frog_cattail_thermometer.png',
  '/assets/stickers/timer_clock.png': '/assets/stickers/frog_lily_stopwatch.png',
  '/assets/stickers/aac_core.png': '/assets/stickers/frog_lotus_star_core.png',
  '/assets/stickers/star_gold.png': '/assets/stickers/frog_lotus_star_core.png',
  // Batch 2: Moods, Personas, School & Hubs
  '/assets/stickers/mood_happy.png': '/assets/stickers/frog_mood_happy.png',
  '/assets/stickers/fav_happy.png': '/assets/stickers/frog_mood_happy.png',
  '/assets/stickers/mood_calm.png': '/assets/stickers/frog_mood_calm.png',
  '/assets/stickers/mood_excited.png': '/assets/stickers/frog_mood_excited.png',
  '/assets/stickers/mood_sleepy.png': '/assets/stickers/frog_mood_sleepy.png',
  '/assets/stickers/mood_unsure.png': '/assets/stickers/frog_mood_unsure.png',
  '/assets/stickers/fav_stop.png': '/assets/stickers/frog_stop_flipper.png',
  '/assets/stickers/fav_music.png': '/assets/stickers/frog_bamboo_wind_chimes.png',
  '/assets/stickers/music_sensory.png': '/assets/stickers/frog_bamboo_wind_chimes.png',
  '/assets/stickers/fav_sandwich.png': '/assets/stickers/frog_garden_sandwich.png',
  '/assets/stickers/sandwich_lunch.png': '/assets/stickers/frog_garden_sandwich.png',
  '/assets/stickers/child_persona.png': '/assets/stickers/frog_child_persona.png',
  '/assets/stickers/teen_headphones.png': '/assets/stickers/frog_pebble_headphones.png',
  '/assets/stickers/adult_briefcase.png': '/assets/stickers/frog_bamboo_satchel.png',
  '/assets/stickers/caregiver_phone.png': '/assets/stickers/frog_wood_phone_caregiver.png',
  '/assets/stickers/language_globe.png': '/assets/stickers/frog_pond_biome_globe.png',
  '/assets/stickers/trial_crown.png': '/assets/stickers/frog_golden_lotus_crown.png',
  '/assets/stickers/refresh_repeat.png': '/assets/stickers/frog_tadpole_swim_loop.png',
  // Batch 3: School, Play & Daily Tools
  '/assets/stickers/school_bus.png': '/assets/stickers/frog_bamboo_ferry_bus.png',
  '/assets/stickers/science_flask.png': '/assets/stickers/frog_terrarium_science_flask.png',
  '/assets/stickers/art_palette.png': '/assets/stickers/frog_pebble_art_palette.png',
  '/assets/stickers/art_crafts.png': '/assets/stickers/frog_pebble_art_palette.png',
  '/assets/stickers/pencil_write.png': '/assets/stickers/frog_bamboo_pencil.png',
  '/assets/stickers/homework_study.png': '/assets/stickers/frog_bamboo_pencil.png',
  '/assets/stickers/folder_schoolwork.png': '/assets/stickers/frog_reed_school_folder.png',
  '/assets/stickers/playground_swings.png': '/assets/stickers/frog_willow_slide_swings.png',
  '/assets/stickers/playground_recess.png': '/assets/stickers/frog_willow_slide_swings.png',
  '/assets/stickers/apple_snack.png': '/assets/stickers/frog_pond_berry_snack.png',
  '/assets/stickers/pajamas_sleep.png': '/assets/stickers/frog_lily_pajamas_sleep.png',
  '/assets/stickers/pajamas_shorts.png': '/assets/stickers/frog_lily_pajamas_sleep.png',
  '/assets/stickers/car_ride.png': '/assets/stickers/frog_reed_cart_ride.png',
  '/assets/stickers/tablet_ipad.png': '/assets/stickers/frog_bamboo_tablet_ipad.png',
  '/assets/stickers/toy_box.png': '/assets/stickers/frog_seagrass_toy_box.png',
  '/assets/stickers/spoons_energy.png': '/assets/stickers/frog_bamboo_energy_spoons.png',
  '/assets/stickers/fidget_bubbles.png': '/assets/stickers/frog_pond_dewdrop_bubbles.png',
  '/assets/stickers/decision_wheel.png': '/assets/stickers/frog_lotus_decision_wheel.png',
  '/assets/stickers/clock_time.png': '/assets/stickers/frog_lily_pad_wall_clock.png',
  // Batch 4: Identity, Daily Care & Health
  '/assets/stickers/about_id.png': '/assets/stickers/frog_explorer_id_badge.png',
  '/assets/stickers/adventure_dentist.png': '/assets/stickers/frog_lotus_dental_station.png',
  '/assets/stickers/keyboard.png': '/assets/stickers/frog_bamboo_keyboard.png',
  '/assets/stickers/caregiver_heart.png': '/assets/stickers/frog_caregiver_heart.png',
  '/assets/stickers/eye_see.png': '/assets/stickers/frog_sensory_eye_stone.png',
  '/assets/stickers/hot_cocoa.png': '/assets/stickers/frog_herbal_tea_mug.png',
  '/assets/stickers/laundry_hamper.png': '/assets/stickers/frog_reed_laundry_basket.png',
  '/assets/stickers/chocolate_bar.png': '/assets/stickers/frog_honey_seed_snack_bar.png',
  '/assets/stickers/travel_luggage.png': '/assets/stickers/frog_timber_explorer_trunk.png',
  '/assets/stickers/quiet_voice.png': '/assets/stickers/frog_whispering_shh.png',
  '/assets/stickers/routine_toilet_restroom.png': '/assets/stickers/frog_bamboo_washroom_basin.png',
  '/assets/stickers/sneaker_shoes.png': '/assets/stickers/frog_reed_explorer_shoes.png',
  '/assets/stickers/evening_moon.png': '/assets/stickers/frog_pond_crescent_moon.png',
  '/assets/stickers/medications_health.png': '/assets/stickers/frog_herbal_wellness_vial.png',
  '/assets/stickers/routine_medicine_pill.png': '/assets/stickers/frog_herbal_wellness_vial.png',
  '/assets/stickers/adventure_doctor_checkup.png': '/assets/stickers/frog_healer_stethoscope_kit.png',
  // Batch 5: Adventures, Sensory & Wellness
  '/assets/stickers/adventure_haircut_salon.png': '/assets/stickers/frog_grooming_comb_mirror.png',
  '/assets/stickers/adventure_camping_tent.png': '/assets/stickers/frog_canopy_reed_tent.png',
  '/assets/stickers/adventure_swimming_pool.png': '/assets/stickers/frog_spring_lagoon_pool.png',
  '/assets/stickers/adventure_movie_cinema.png': '/assets/stickers/frog_shadow_puppet_theater.png',
  '/assets/stickers/sensory_loud_noise.png': '/assets/stickers/frog_sound_softening_shell.png',
  '/assets/stickers/sensory_bright_lights.png': '/assets/stickers/frog_shaded_leaf_sun_hat.png',
  '/assets/stickers/sensory_social_masking.png': '/assets/stickers/frog_willow_hollow_retreat.png',
  '/assets/stickers/bone_treat.png': '/assets/stickers/frog_water_chestnut_treat.png',
  '/assets/stickers/shopping_cart.png': '/assets/stickers/frog_woven_gathering_cart.png',
  '/assets/stickers/airplane_flight.png': '/assets/stickers/frog_dragonfly_glider.png',
  '/assets/stickers/shower_wash.png': '/assets/stickers/frog_warm_spring_bath.png',
  '/assets/stickers/bathtub_wash.png': '/assets/stickers/frog_warm_spring_bath.png',
  '/assets/stickers/bath_time.png': '/assets/stickers/frog_warm_spring_bath.png',
  '/assets/stickers/fav_bath.png': '/assets/stickers/frog_warm_spring_bath.png',
  '/assets/stickers/teddy_bear.png': '/assets/stickers/frog_plush_toy_doll.png',
  '/assets/stickers/pet_care.png': '/assets/stickers/frog_tadpole_pet_feed_bowl.png',
  '/assets/stickers/outdoor_sun.png': '/assets/stickers/frog_meadow_sunshine.png',
  '/assets/stickers/fav_outside.png': '/assets/stickers/frog_meadow_sunshine.png',
  '/assets/stickers/reward_trophy.png': '/assets/stickers/frog_lotus_reward_trophy.png',
  // Batch 6: Outings, Social Stories, Dining & Toys
  '/assets/stickers/adventure_restaurant.png': '/assets/stickers/frog_feast_table_pavilion.png',
  '/assets/stickers/adventure_bowling_alley.png': '/assets/stickers/frog_pebble_bowling_alley.png',
  '/assets/stickers/adventure_museum_visit.png': '/assets/stickers/frog_heritage_archive_pavilion.png',
  '/assets/stickers/fork_knife.png': '/assets/stickers/frog_bamboo_cutlery.png',
  '/assets/stickers/cutlery.png': '/assets/stickers/frog_bamboo_cutlery.png',
  '/assets/stickers/ocean_wave.png': '/assets/stickers/frog_pond_ripple_wave.png',
  '/assets/stickers/battery_meter.png': '/assets/stickers/frog_bamboo_energy_gauge.png',
  '/assets/stickers/paw_print.png': '/assets/stickers/frog_webbed_footprint_stamp.png',
  '/assets/stickers/tennis_ball.png': '/assets/stickers/frog_woven_moss_play_ball.png',
  '/assets/stickers/potted_plant.png': '/assets/stickers/frog_driftwood_lotus_planter.png',
  '/assets/stickers/jigsaw_puzzle.png': '/assets/stickers/frog_lotus_puzzle_piece.png',
  '/assets/stickers/story_plans_change.png': '/assets/stickers/frog_arched_willow_bridge.png',
  '/assets/stickers/story_birthday.png': '/assets/stickers/frog_pond_birthday_feast.png',
  '/assets/stickers/story_sharing.png': '/assets/stickers/frog_zen_balancing_stones.png',
  '/assets/stickers/fav_lego.png': '/assets/stickers/frog_zen_balancing_stones.png',
  '/assets/stickers/fav_love_heart.png': '/assets/stickers/frog_lily_pad_heart.png',
  '/assets/stickers/bee_mascot.png': '/assets/stickers/frog_mascot.png',
};

export const SPACE_STICKER_SWAPS: Record<string, string> = {
  // Adventure Step Mappings
  '/assets/stickers/toy_box.png': '/assets/stickers/space_travel_luggage.png',
  '/assets/stickers/clipboard_shutdown.png': '/assets/stickers/space_tablet_ipad.png',
  '/assets/stickers/hiking_trail_boots.png': '/assets/stickers/space_sneaker_shoes.png',
  '/assets/stickers/waiting_room_couch.png': '/assets/stickers/space_waiting_room_couch.png',
  '/assets/stickers/waving_hand_hello.png': '/assets/stickers/space_waving_hand_hello.png',
  '/assets/stickers/padded_recliner_chair.png': '/assets/stickers/space_padded_recliner_chair.png',
  '/assets/stickers/open_mouth_wide.png': '/assets/stickers/space_open_mouth_wide.png',
  '/assets/stickers/open_mouth_lion.png': '/assets/stickers/space_open_mouth_wide.png',
  '/assets/stickers/open_welcome_door.png': '/assets/stickers/space_open_welcome_door.png',
  '/assets/stickers/dining_table_booth.png': '/assets/stickers/space_dining_table_booth.png',
  '/assets/stickers/restaurant_menu_book.png': '/assets/stickers/space_restaurant_menu_book.png',
  '/assets/stickers/barbershop_pole.png': '/assets/stickers/space_barbershop_pole.png',
  '/assets/stickers/haircut_cape.png': '/assets/stickers/space_haircut_cape.png',
  '/assets/stickers/water_spray_bottle.png': '/assets/stickers/space_water_spray_bottle.png',
  '/assets/stickers/barber_neck_brush.png': '/assets/stickers/space_barber_neck_brush.png',
  '/assets/stickers/salon_hand_mirror.png': '/assets/stickers/space_salon_hand_mirror.png',
  '/assets/stickers/medical_clinic_building.png': '/assets/stickers/space_medical_clinic_building.png',
  '/assets/stickers/clinic_height_scale.png': '/assets/stickers/space_clinic_height_scale.png',
  '/assets/stickers/doctor_exam_bed.png': '/assets/stickers/space_doctor_exam_bed.png',
  '/assets/stickers/doctor_ear_light.png': '/assets/stickers/space_doctor_ear_light.png',
  '/assets/stickers/walking_pool_feet.png': '/assets/stickers/space_walking_pool_feet.png',
  '/assets/stickers/swim_goggles_floaties.png': '/assets/stickers/space_swim_goggles_floaties.png',
  '/assets/stickers/fluffy_beach_towel.png': '/assets/stickers/space_fluffy_beach_towel.png',
  '/assets/stickers/movie_projector_screen.png': '/assets/stickers/space_movie_projector_screen.png',
  '/assets/stickers/bowling_ball_holes.png': '/assets/stickers/space_bowling_ball_holes.png',
  '/assets/stickers/bowling_lane_bumpers.png': '/assets/stickers/space_bowling_lane_bumpers.png',
  '/assets/stickers/bowling_pins_strike.png': '/assets/stickers/space_bowling_pins_strike.png',
  '/assets/stickers/high_five_hands.png': '/assets/stickers/space_high_five_hands.png',
  '/assets/stickers/pine_trees_forest.png': '/assets/stickers/space_pine_trees_forest.png',
  '/assets/stickers/camping_sleeping_bag.png': '/assets/stickers/space_camping_sleeping_bag.png',
  '/assets/stickers/campfire_marshmallows.png': '/assets/stickers/space_campfire_marshmallows.png',
  '/assets/stickers/museum_paper_map.png': '/assets/stickers/space_museum_paper_map.png',
  '/assets/stickers/museum_dinosaur_fossil.png': '/assets/stickers/space_museum_dinosaur_fossil.png',
  '/assets/stickers/observing_magnifying_glass.png': '/assets/stickers/space_observing_magnifying_glass.png',
  // Batch 1 Core Routine Swaps
  '/assets/stickers/alarm_clock.png': '/assets/stickers/space_alarm_clock.png',
  '/assets/stickers/toothbrush.png': '/assets/stickers/space_toothbrush.png',
  '/assets/stickers/clothes_dressed.png': '/assets/stickers/space_clothes_dressed.png',
  '/assets/stickers/pancakes_breakfast.png': '/assets/stickers/space_pancakes_breakfast.png',
  '/assets/stickers/school_bus.png': '/assets/stickers/space_school_bus.png',
  '/assets/stickers/backpack_school.png': '/assets/stickers/space_backpack_school.png',
  '/assets/stickers/homework_study.png': '/assets/stickers/space_homework_study.png',
  '/assets/stickers/folder_schoolwork.png': '/assets/stickers/space_homework_study.png',
  '/assets/stickers/sandwich_lunch.png': '/assets/stickers/space_sandwich_lunch.png',
  '/assets/stickers/routine_water_drink.png': '/assets/stickers/space_routine_water_drink.png',
  '/assets/stickers/drink_water.png': '/assets/stickers/space_routine_water_drink.png',
  '/assets/stickers/fav_water.png': '/assets/stickers/space_routine_water_drink.png',
  '/assets/stickers/sneaker_shoes.png': '/assets/stickers/space_sneaker_shoes.png',
  '/assets/stickers/routine_toilet_restroom.png': '/assets/stickers/space_toilet_restroom.png',
  '/assets/stickers/toilet_restroom.png': '/assets/stickers/space_toilet_restroom.png',
  '/assets/stickers/routine_medicine_pill.png': '/assets/stickers/space_routine_medicine_pill.png',
  '/assets/stickers/medications_health.png': '/assets/stickers/space_routine_medicine_pill.png',
  '/assets/stickers/pill_capsule.png': '/assets/stickers/space_routine_medicine_pill.png',
  '/assets/stickers/school_building.png': '/assets/stickers/space_school_building.png',
  '/assets/stickers/shower_wash.png': '/assets/stickers/space_shower_wash.png',
  '/assets/stickers/bathtub_wash.png': '/assets/stickers/space_shower_wash.png',
  '/assets/stickers/bath_time.png': '/assets/stickers/space_shower_wash.png',
  '/assets/stickers/fav_bath.png': '/assets/stickers/space_shower_wash.png',
  '/assets/stickers/bedtime_sleep.png': '/assets/stickers/space_bedtime_sleep.png',
  '/assets/stickers/pajamas_sleep.png': '/assets/stickers/space_bedtime_sleep.png',
  '/assets/stickers/pajamas_shorts.png': '/assets/stickers/space_bedtime_sleep.png',
  // Batch 2 Swaps
  '/assets/stickers/hot_cocoa.png': '/assets/stickers/space_hot_cocoa.png',
  '/assets/stickers/dinner_bowl.png': '/assets/stickers/space_dinner_bowl.png',
  '/assets/stickers/cooking_pot.png': '/assets/stickers/space_dinner_bowl.png',
  '/assets/stickers/apple_snack.png': '/assets/stickers/space_apple_snack.png',
  '/assets/stickers/chocolate_bar.png': '/assets/stickers/space_chocolate_bar.png',
  '/assets/stickers/jigsaw_puzzle.png': '/assets/stickers/space_jigsaw_puzzle.png',
  '/assets/stickers/fav_music.png': '/assets/stickers/space_fav_music.png',
  '/assets/stickers/music_note.png': '/assets/stickers/space_fav_music.png',
  '/assets/stickers/music_sensory.png': '/assets/stickers/space_fav_music.png',
  '/assets/stickers/fav_love_heart.png': '/assets/stickers/space_fav_love_heart.png',
  '/assets/stickers/heart_here_for_you.png': '/assets/stickers/space_fav_love_heart.png',
  '/assets/stickers/fav_outside.png': '/assets/stickers/space_fav_outside.png',
  '/assets/stickers/outdoor_sun.png': '/assets/stickers/space_fav_outside.png',
  '/assets/stickers/fav_stop.png': '/assets/stickers/space_fav_stop.png',
  '/assets/stickers/help_sos.png': '/assets/stickers/space_help_sos.png',
  '/assets/stickers/alert_sos_shield.png': '/assets/stickers/space_help_sos.png',
  '/assets/stickers/fav_help_sos.png': '/assets/stickers/space_help_sos.png',
  '/assets/stickers/decision_wheel.png': '/assets/stickers/space_decision_wheel.png',
  '/assets/stickers/spoons_energy.png': '/assets/stickers/space_spoons_energy.png',
  '/assets/stickers/routine_writing_journal.png': '/assets/stickers/space_routine_writing_journal.png',
  '/assets/stickers/laundry_hamper.png': '/assets/stickers/space_laundry_hamper.png',
  '/assets/stickers/refresh_repeat.png': '/assets/stickers/space_refresh_repeat.png',
  '/assets/stickers/circular_arrow.png': '/assets/stickers/space_refresh_repeat.png',
  // Batch 3 Moods, Personas, Habitats & Hubs
  '/assets/stickers/mood_happy.png': '/assets/stickers/space_mood_happy.png',
  '/assets/stickers/mood_calm.png': '/assets/stickers/space_mood_calm.png',
  '/assets/stickers/mood_excited.png': '/assets/stickers/space_mood_excited.png',
  '/assets/stickers/mood_sleepy.png': '/assets/stickers/space_mood_sleepy.png',
  '/assets/stickers/mood_unsure.png': '/assets/stickers/space_mood_unsure.png',
  '/assets/stickers/child_persona.png': '/assets/stickers/space_child_persona.png',
  '/assets/stickers/adult_briefcase.png': '/assets/stickers/space_adult_briefcase.png',
  '/assets/stickers/caregiver_phone.png': '/assets/stickers/space_caregiver_phone.png',
  '/assets/stickers/language_globe.png': '/assets/stickers/space_language_globe.png',
  '/assets/stickers/trial_crown.png': '/assets/stickers/space_trial_crown.png',
  '/assets/stickers/home_house.png': '/assets/stickers/space_home_house.png',
  '/assets/stickers/car_ride.png': '/assets/stickers/space_car_ride.png',
  '/assets/stickers/car_travel.png': '/assets/stickers/space_car_ride.png',
  '/assets/stickers/car_on_my_way.png': '/assets/stickers/space_car_ride.png',
  '/assets/stickers/pet_care.png': '/assets/stickers/space_pet_care.png',
  '/assets/stickers/bee_mascot.png': '/assets/stickers/space_pet_care.png',
  '/assets/stickers/pizza_slice.png': '/assets/stickers/space_pizza_slice.png',
  '/assets/stickers/about_id.png': '/assets/stickers/space_about_id.png',
  // Batch 4 Weather, Rewards, Tools & Exploration
  '/assets/stickers/morning_sunrise.png': '/assets/stickers/space_morning_sunrise.png',
  '/assets/stickers/evening_moon.png': '/assets/stickers/space_evening_moon.png',
  '/assets/stickers/reward_trophy.png': '/assets/stickers/space_reward_trophy.png',
  '/assets/stickers/star_gold.png': '/assets/stickers/space_star_gold.png',
  '/assets/stickers/feelings_thermometer.png': '/assets/stickers/space_feelings_thermometer.png',
  '/assets/stickers/battery_meter.png': '/assets/stickers/space_battery_meter.png',
  '/assets/stickers/calm_sparkles.png': '/assets/stickers/space_calm_sparkles.png',
  '/assets/stickers/quiet_voice.png': '/assets/stickers/space_quiet_voice.png',
  '/assets/stickers/speech_bubble.png': '/assets/stickers/space_speech_bubble.png',
  '/assets/stickers/science_flask.png': '/assets/stickers/space_science_flask.png',
  '/assets/stickers/sunny_clear.png': '/assets/stickers/space_sunny_clear.png',
  '/assets/stickers/rain_cloud.png': '/assets/stickers/space_rain_cloud.png',
  '/assets/stickers/snow_weather.png': '/assets/stickers/space_snow_weather.png',
  '/assets/stickers/travel_luggage.png': '/assets/stickers/space_travel_luggage.png',
  '/assets/stickers/stethoscope.png': '/assets/stickers/space_stethoscope.png',
  // Batch 5 Adventures & Sensory Regulation
  '/assets/stickers/adventure_dentist.png': '/assets/stickers/space_adventure_dentist.png',
  '/assets/stickers/dentist_adventure.png': '/assets/stickers/space_adventure_dentist.png',
  '/assets/stickers/adventure_haircut.png': '/assets/stickers/space_adventure_haircut.png',
  '/assets/stickers/haircut_adventure.png': '/assets/stickers/space_adventure_haircut.png',
  '/assets/stickers/adventure_movie_cinema.png': '/assets/stickers/space_adventure_movie_cinema.png',
  '/assets/stickers/movie_cinema.png': '/assets/stickers/space_adventure_movie_cinema.png',
  '/assets/stickers/adventure_swimming_pool.png': '/assets/stickers/space_adventure_swimming_pool.png',
  '/assets/stickers/swimming_pool.png': '/assets/stickers/space_adventure_swimming_pool.png',
  '/assets/stickers/adventure_camping_tent.png': '/assets/stickers/space_adventure_camping_tent.png',
  '/assets/stickers/camping_tent.png': '/assets/stickers/space_adventure_camping_tent.png',
  '/assets/stickers/shopping_cart.png': '/assets/stickers/space_shopping_cart.png',
  '/assets/stickers/therapy_brain.png': '/assets/stickers/space_therapy_brain.png',
  '/assets/stickers/sensory_loud_noise.png': '/assets/stickers/space_sensory_loud_noise.png',
  '/assets/stickers/sensory_bright_lights.png': '/assets/stickers/space_sensory_bright_lights.png',
  '/assets/stickers/tennis_ball.png': '/assets/stickers/space_tennis_ball.png',
  '/assets/stickers/red_balloon.png': '/assets/stickers/space_red_balloon.png',
  '/assets/stickers/candy_treat.png': '/assets/stickers/space_candy_treat.png',
  '/assets/stickers/cutlery_meal.png': '/assets/stickers/space_cutlery_meal.png',
  '/assets/stickers/grounding_touch_hand.png': '/assets/stickers/space_grounding_touch_hand.png',
  '/assets/stickers/cloudy_weather.png': '/assets/stickers/space_cloudy_weather.png',
  // Batch 6 Destinations, Travel & Station Living
  '/assets/stickers/adventure_restaurant.png': '/assets/stickers/space_adventure_restaurant.png',
  '/assets/stickers/restaurant_adventure.png': '/assets/stickers/space_adventure_restaurant.png',
  '/assets/stickers/adventure_museum_visit.png': '/assets/stickers/space_adventure_museum_visit.png',
  '/assets/stickers/museum_visit.png': '/assets/stickers/space_adventure_museum_visit.png',
  '/assets/stickers/adventure_bowling_alley.png': '/assets/stickers/space_adventure_bowling_alley.png',
  '/assets/stickers/bowling_alley.png': '/assets/stickers/space_adventure_bowling_alley.png',
  '/assets/stickers/adventure_haircut_salon.png': '/assets/stickers/space_adventure_haircut.png',
  '/assets/stickers/adventure_doctor.png': '/assets/stickers/space_stethoscope.png',
  '/assets/stickers/adventure_doctor_checkup.png': '/assets/stickers/space_stethoscope.png',
  '/assets/stickers/doctor_checkup.png': '/assets/stickers/space_stethoscope.png',
  '/assets/stickers/airplane_flight.png': '/assets/stickers/space_airplane_flight.png',
  '/assets/stickers/boarding_ticket.png': '/assets/stickers/space_boarding_ticket.png',
  '/assets/stickers/passport_book.png': '/assets/stickers/space_passport_book.png',
  '/assets/stickers/tablet_ipad.png': '/assets/stickers/space_tablet_ipad.png',
  '/assets/stickers/potted_plant.png': '/assets/stickers/space_potted_plant.png',
  '/assets/stickers/clock_time.png': '/assets/stickers/space_clock_time.png',
  '/assets/stickers/timer_clock.png': '/assets/stickers/space_clock_time.png',
  '/assets/stickers/wall_clock.png': '/assets/stickers/space_clock_time.png',
  '/assets/stickers/circle_carpet.png': '/assets/stickers/space_circle_carpet.png',
  '/assets/stickers/sensory_social_masking.png': '/assets/stickers/space_circle_carpet.png',
  '/assets/stickers/locker_schedule.png': '/assets/stickers/space_locker_schedule.png',
  '/assets/stickers/bone_treat.png': '/assets/stickers/space_bone_treat.png',
  '/assets/stickers/paw_print.png': '/assets/stickers/space_paw_print.png',
  '/assets/stickers/ocean_wave.png': '/assets/stickers/space_ocean_wave.png',
  '/assets/stickers/story_birthday.png': '/assets/stickers/space_story_birthday.png',
  '/assets/stickers/story_plans_change.png': '/assets/stickers/space_circle_carpet.png',
  '/assets/stickers/plans_changed.png': '/assets/stickers/space_circle_carpet.png',
  '/assets/stickers/story_sharing.png': '/assets/stickers/space_bone_treat.png',
  '/assets/stickers/sharing_toys.png': '/assets/stickers/space_bone_treat.png',
};

export const TRAIN_STICKER_SWAPS: Record<string, string> = {
  // Train Adventure Batch 1 Swaps
  '/assets/stickers/waiting_room_couch.png': '/assets/stickers/train_waiting_room_bench.png',
  '/assets/stickers/waving_hand_hello.png': '/assets/stickers/train_waving_hand_hello.png',
  '/assets/stickers/padded_recliner_chair.png': '/assets/stickers/train_padded_recliner_chair.png',
  '/assets/stickers/open_mouth_wide.png': '/assets/stickers/train_open_mouth_wide.png',
  '/assets/stickers/open_mouth_lion.png': '/assets/stickers/train_open_mouth_wide.png',
  '/assets/stickers/open_welcome_door.png': '/assets/stickers/train_open_welcome_door.png',
  '/assets/stickers/dining_table_booth.png': '/assets/stickers/train_dining_table_booth.png',
  '/assets/stickers/restaurant_menu_book.png': '/assets/stickers/train_restaurant_menu_book.png',
  '/assets/stickers/barbershop_pole.png': '/assets/stickers/train_barbershop_pole.png',
  '/assets/stickers/haircut_cape.png': '/assets/stickers/train_haircut_cape.png',
  '/assets/stickers/water_spray_bottle.png': '/assets/stickers/train_water_spray_bottle.png',
  '/assets/stickers/barber_neck_brush.png': '/assets/stickers/train_barber_neck_brush.png',
  '/assets/stickers/salon_hand_mirror.png': '/assets/stickers/train_salon_hand_mirror.png',
  '/assets/stickers/medical_clinic_building.png': '/assets/stickers/train_medical_clinic_building.png',
  '/assets/stickers/clinic_height_scale.png': '/assets/stickers/train_clinic_height_scale.png',
  '/assets/stickers/doctor_exam_bed.png': '/assets/stickers/train_doctor_exam_bed.png',
  // Train Adventure Batch 2 Swaps
  '/assets/stickers/doctor_ear_light.png': '/assets/stickers/train_doctor_ear_light.png',
  '/assets/stickers/walking_pool_feet.png': '/assets/stickers/train_walking_pool_feet.png',
  '/assets/stickers/swim_goggles_floaties.png': '/assets/stickers/train_swim_goggles_floaties.png',
  '/assets/stickers/fluffy_beach_towel.png': '/assets/stickers/train_fluffy_beach_towel.png',
  '/assets/stickers/movie_projector_screen.png': '/assets/stickers/train_movie_projector_screen.png',
  '/assets/stickers/bowling_ball_holes.png': '/assets/stickers/train_bowling_ball_holes.png',
  '/assets/stickers/bowling_lane_bumpers.png': '/assets/stickers/train_bowling_lane_bumpers.png',
  '/assets/stickers/bowling_pins_strike.png': '/assets/stickers/train_bowling_pins_strike.png',
  '/assets/stickers/high_five_hands.png': '/assets/stickers/train_high_five_hands.png',
  '/assets/stickers/pine_trees_forest.png': '/assets/stickers/train_pine_trees_forest.png',
  '/assets/stickers/camping_sleeping_bag.png': '/assets/stickers/train_camping_sleeping_bag.png',
  '/assets/stickers/campfire_marshmallows.png': '/assets/stickers/train_campfire_marshmallows.png',
  '/assets/stickers/museum_paper_map.png': '/assets/stickers/train_museum_paper_map.png',
  '/assets/stickers/museum_dinosaur_fossil.png': '/assets/stickers/train_museum_dinosaur_fossil.png',
  '/assets/stickers/observing_magnifying_glass.png': '/assets/stickers/train_observing_magnifying_glass.png',
  // Adventure Step Mappings
  '/assets/stickers/clipboard_shutdown.png': '/assets/stickers/train_timetable_board.png',
  '/assets/stickers/hiking_trail_boots.png': '/assets/stickers/train_boots.png',
  // Batch 6 New Train Swaps
  '/assets/stickers/adventure_restaurant.png': '/assets/stickers/train_adventure_restaurant.png',
  '/assets/stickers/adventure_museum_visit.png': '/assets/stickers/train_adventure_museum_visit.png',
  '/assets/stickers/adventure_bowling_alley.png': '/assets/stickers/train_adventure_bowling_alley.png',
  '/assets/stickers/airplane_flight.png': '/assets/stickers/train_airplane_flight.png',
  '/assets/stickers/boarding_ticket.png': '/assets/stickers/train_boarding_ticket.png',
  '/assets/stickers/passport_book.png': '/assets/stickers/train_passport_book.png',
  '/assets/stickers/tablet_ipad.png': '/assets/stickers/train_tablet_ipad.png',
  '/assets/stickers/potted_plant.png': '/assets/stickers/train_potted_plant.png',
  '/assets/stickers/clock_time.png': '/assets/stickers/train_clock_time.png',
  '/assets/stickers/circle_carpet.png': '/assets/stickers/train_circle_carpet.png',
  '/assets/stickers/sensory_social_masking.png': '/assets/stickers/train_circle_carpet.png',
  '/assets/stickers/locker_schedule.png': '/assets/stickers/train_locker_schedule.png',
  '/assets/stickers/bone_treat.png': '/assets/stickers/train_bone_treat.png',
  '/assets/stickers/paw_print.png': '/assets/stickers/train_paw_print.png',
  '/assets/stickers/ocean_wave.png': '/assets/stickers/train_ocean_wave.png',
  '/assets/stickers/story_birthday.png': '/assets/stickers/train_story_birthday.png',
  '/assets/stickers/story_plans_change.png': '/assets/stickers/train_circle_carpet.png',
  '/assets/stickers/plans_changed.png': '/assets/stickers/train_circle_carpet.png',
  '/assets/stickers/story_sharing.png': '/assets/stickers/train_story_atlas.png',
  '/assets/stickers/sharing_toys.png': '/assets/stickers/train_story_atlas.png',
  // Batch 5 New Train Swaps
  '/assets/stickers/adventure_dentist.png': '/assets/stickers/train_adventure_dentist.png',
  '/assets/stickers/adventure_haircut.png': '/assets/stickers/train_adventure_haircut.png',
  '/assets/stickers/adventure_haircut_salon.png': '/assets/stickers/train_adventure_haircut.png',
  '/assets/stickers/adventure_movie_cinema.png': '/assets/stickers/train_adventure_movie_cinema.png',
  '/assets/stickers/adventure_swimming_pool.png': '/assets/stickers/train_adventure_swimming_pool.png',
  '/assets/stickers/adventure_camping_tent.png': '/assets/stickers/train_adventure_camping_tent.png',
  '/assets/stickers/shopping_cart.png': '/assets/stickers/train_shopping_cart.png',
  '/assets/stickers/therapy_brain.png': '/assets/stickers/train_therapy_brain.png',
  '/assets/stickers/sensory_loud_noise.png': '/assets/stickers/train_sensory_loud_noise.png',
  '/assets/stickers/sensory_bright_lights.png': '/assets/stickers/train_sensory_bright_lights.png',
  '/assets/stickers/tennis_ball.png': '/assets/stickers/train_tennis_ball.png',
  '/assets/stickers/red_balloon.png': '/assets/stickers/train_red_balloon.png',
  '/assets/stickers/candy_treat.png': '/assets/stickers/train_candy_treat.png',
  '/assets/stickers/cutlery_meal.png': '/assets/stickers/train_cutlery_meal.png',
  '/assets/stickers/fork_knife.png': '/assets/stickers/train_cutlery_meal.png',
  '/assets/stickers/grounding_touch_hand.png': '/assets/stickers/train_grounding_touch_hand.png',
  '/assets/stickers/cloudy_weather.png': '/assets/stickers/train_cloudy_weather.png',
  // Batch 4 New Train Swaps
  '/assets/stickers/morning_sunrise.png': '/assets/stickers/train_morning_sunrise.png',
  '/assets/stickers/evening_moon.png': '/assets/stickers/train_evening_moon.png',
  '/assets/stickers/reward_trophy.png': '/assets/stickers/train_reward_trophy.png',
  '/assets/stickers/star_gold.png': '/assets/stickers/train_star_gold.png',
  '/assets/stickers/feelings_thermometer.png': '/assets/stickers/train_feelings_thermometer.png',
  '/assets/stickers/battery_meter.png': '/assets/stickers/train_battery_meter.png',
  '/assets/stickers/calm_sparkles.png': '/assets/stickers/train_calm_sparkles.png',
  '/assets/stickers/quiet_voice.png': '/assets/stickers/train_quiet_voice.png',
  '/assets/stickers/speech_bubble.png': '/assets/stickers/train_speech_bubble.png',
  '/assets/stickers/science_flask.png': '/assets/stickers/train_science_flask.png',
  '/assets/stickers/sunny_clear.png': '/assets/stickers/train_sunny_clear.png',
  '/assets/stickers/rain_cloud.png': '/assets/stickers/train_rain_cloud.png',
  '/assets/stickers/snow_weather.png': '/assets/stickers/train_snow_weather.png',
  '/assets/stickers/travel_luggage.png': '/assets/stickers/train_travel_luggage.png',
  '/assets/stickers/stethoscope.png': '/assets/stickers/train_stethoscope.png',
  '/assets/stickers/adventure_doctor.png': '/assets/stickers/train_stethoscope.png',
  '/assets/stickers/adventure_doctor_checkup.png': '/assets/stickers/train_stethoscope.png',
  // Batch 3 New Train Swaps
  '/assets/stickers/mood_happy.png': '/assets/stickers/train_mood_happy.png',
  '/assets/stickers/fav_happy.png': '/assets/stickers/train_mood_happy.png',
  '/assets/stickers/mood_calm.png': '/assets/stickers/train_mood_calm.png',
  '/assets/stickers/mood_excited.png': '/assets/stickers/train_mood_excited.png',
  '/assets/stickers/mood_sleepy.png': '/assets/stickers/train_mood_sleepy.png',
  '/assets/stickers/fav_rest_tired.png': '/assets/stickers/train_mood_sleepy.png',
  '/assets/stickers/mood_unsure.png': '/assets/stickers/train_mood_unsure.png',
  '/assets/stickers/child_persona.png': '/assets/stickers/train_child_persona.png',
  '/assets/stickers/adult_briefcase.png': '/assets/stickers/train_adult_briefcase.png',
  '/assets/stickers/caregiver_phone.png': '/assets/stickers/train_caregiver_phone.png',
  '/assets/stickers/language_globe.png': '/assets/stickers/train_language_globe.png',
  '/assets/stickers/trial_crown.png': '/assets/stickers/train_trial_crown.png',
  '/assets/stickers/about_id.png': '/assets/stickers/train_about_id.png',
  '/assets/stickers/home_house.png': '/assets/stickers/train_home_station.png',
  '/assets/stickers/car_ride.png': '/assets/stickers/train_handcar_ride.png',
  '/assets/stickers/car_travel.png': '/assets/stickers/train_handcar_ride.png',
  '/assets/stickers/car_on_my_way.png': '/assets/stickers/train_handcar_ride.png',
  '/assets/stickers/pet_care.png': '/assets/stickers/train_station_dog.png',
  '/assets/stickers/pizza_slice.png': '/assets/stickers/train_pizza_slice.png',
  // Batch 2 New Train Swaps
  '/assets/stickers/hot_cocoa.png': '/assets/stickers/train_hot_cocoa.png',
  '/assets/stickers/dinner_bowl.png': '/assets/stickers/train_stew_pot.png',
  '/assets/stickers/cooking_pot.png': '/assets/stickers/train_stew_pot.png',
  '/assets/stickers/apple_snack.png': '/assets/stickers/train_fruit_crate.png',
  '/assets/stickers/chocolate_bar.png': '/assets/stickers/train_chocolate.png',
  '/assets/stickers/jigsaw_puzzle.png': '/assets/stickers/train_track_puzzle.png',
  '/assets/stickers/fav_music.png': '/assets/stickers/train_steam_whistle.png',
  '/assets/stickers/music_note.png': '/assets/stickers/train_steam_whistle.png',
  '/assets/stickers/music_sensory.png': '/assets/stickers/train_steam_whistle.png',
  '/assets/stickers/fav_love_heart.png': '/assets/stickers/train_lantern_heart.png',
  '/assets/stickers/heart_here_for_you.png': '/assets/stickers/train_lantern_heart.png',
  '/assets/stickers/fav_outside.png': '/assets/stickers/train_scenic_lookout.png',
  '/assets/stickers/outdoor_sun.png': '/assets/stickers/train_scenic_lookout.png',
  '/assets/stickers/fav_stop.png': '/assets/stickers/train_crossing_signal.png',
  '/assets/stickers/help_sos.png': '/assets/stickers/train_switch_lever.png',
  '/assets/stickers/alert_sos_shield.png': '/assets/stickers/train_switch_lever.png',
  '/assets/stickers/fav_help_sos.png': '/assets/stickers/train_switch_lever.png',
  '/assets/stickers/decision_wheel.png': '/assets/stickers/train_speedometer_gauge.png',
  '/assets/stickers/spoons_energy.png': '/assets/stickers/train_dining_spoons.png',
  '/assets/stickers/routine_writing_journal.png': '/assets/stickers/train_conductor_logbook.png',
  '/assets/stickers/homework_study.png': '/assets/stickers/train_conductor_logbook.png',
  '/assets/stickers/laundry_hamper.png': '/assets/stickers/train_linen_hamper.png',
  '/assets/stickers/refresh_repeat.png': '/assets/stickers/train_circular_track.png',
  '/assets/stickers/circular_arrow.png': '/assets/stickers/train_circular_track.png',
  // Batch 1 New Train Swaps
  '/assets/stickers/sneaker_shoes.png': '/assets/stickers/train_boots.png',
  '/assets/stickers/routine_toilet_restroom.png': '/assets/stickers/train_restroom.png',
  '/assets/stickers/toilet_restroom.png': '/assets/stickers/train_restroom.png',
  '/assets/stickers/routine_medicine_pill.png': '/assets/stickers/train_medicine_dropper.png',
  '/assets/stickers/medications_health.png': '/assets/stickers/train_medicine_dropper.png',
  '/assets/stickers/pill_capsule.png': '/assets/stickers/train_medicine_dropper.png',
  '/assets/stickers/school_building.png': '/assets/stickers/train_school_station.png',
  '/assets/stickers/reading_books.png': '/assets/stickers/train_story_atlas.png',
  '/assets/stickers/story_sharing.png': '/assets/stickers/train_story_atlas.png',
  '/assets/stickers/playground_swings.png': '/assets/stickers/train_playground_depot.png',
  '/assets/stickers/art_crafts.png': '/assets/stickers/train_paint_palette.png',
  '/assets/stickers/art_palette.png': '/assets/stickers/train_paint_palette.png',
  '/assets/stickers/teen_headphones.png': '/assets/stickers/train_ear_defenders.png',
  '/assets/stickers/fidget_bubbles.png': '/assets/stickers/train_valve_spinner.png',
  '/assets/stickers/breathing_cloud.png': '/assets/stickers/train_steam_breathing.png',
  '/assets/stickers/coping_lungs_breathing.png': '/assets/stickers/train_steam_breathing.png',
  '/assets/stickers/toy_box.png': '/assets/stickers/train_toy_chest.png',
  '/assets/stickers/teddy_bear.png': '/assets/stickers/train_toy_chest.png',
  '/assets/stickers/fav_lego.png': '/assets/stickers/train_toy_chest.png',
  '/assets/stickers/shower_wash.png': '/assets/stickers/train_depot_shower.png',
  '/assets/stickers/bath_time.png': '/assets/stickers/train_depot_shower.png',
  '/assets/stickers/fav_bath.png': '/assets/stickers/train_depot_shower.png',
  '/assets/stickers/bathtub_wash.png': '/assets/stickers/train_depot_shower.png',
  '/assets/stickers/pajamas_shorts.png': '/assets/stickers/train_stripe_pajamas.png',
  '/assets/stickers/pajamas_sleep.png': '/assets/stickers/train_stripe_pajamas.png',
  '/assets/stickers/task_done.png': '/assets/stickers/train_signal_lantern.png',
  // Previous Core Swaps
  '/assets/stickers/alarm_clock.png': '/assets/stickers/train_pocket_watch.png',
  '/assets/stickers/toothbrush.png': '/assets/stickers/train_boiler_toothbrush.png',
  '/assets/stickers/clothes_dressed.png': '/assets/stickers/train_conductor_uniform.png',
  '/assets/stickers/pancakes_breakfast.png': '/assets/stickers/train_dining_pancakes.png',
  '/assets/stickers/school_bus.png': '/assets/stickers/train_passenger_car.png',
  '/assets/stickers/backpack_school.png': '/assets/stickers/train_conductor_satchel.png',
  '/assets/stickers/homework_study.png': '/assets/stickers/train_ticket_punch.png',
  '/assets/stickers/folder_schoolwork.png': '/assets/stickers/train_ticket_punch.png',
  '/assets/stickers/pencil_write.png': '/assets/stickers/train_pencil.png',
  '/assets/stickers/sandwich_lunch.png': '/assets/stickers/train_tin_lunchbox.png',
  '/assets/stickers/routine_water_drink.png': '/assets/stickers/train_canteen_flask.png',
  '/assets/stickers/fav_water.png': '/assets/stickers/train_canteen_flask.png',
  '/assets/stickers/drink_water.png': '/assets/stickers/train_canteen_flask.png',
  '/assets/stickers/fav_quiet_break.png': '/assets/stickers/train_observation_seat.png',
  '/assets/stickers/schedule_calendar.png': '/assets/stickers/train_timetable_board.png',
  '/assets/stickers/timer_clock.png': '/assets/stickers/train_pressure_stopwatch.png',
  '/assets/stickers/soap_wash_hands.png': '/assets/stickers/train_station_soap.png',
  '/assets/stickers/bedtime_sleep.png': '/assets/stickers/train_sleeper_bunk.png',
  '/assets/stickers/golden_train.png': '/assets/stickers/train_mascot.png',
  '/assets/stickers/bee_mascot.png': '/assets/stickers/train_mascot.png',
};

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
  loading?: 'lazy' | 'eager';
}> = ({ emoji, title, className = 'w-8 h-8', size, loading = 'lazy' }) => {
  const normEmoji = (emoji || '').trim();
  const normTitle = (title || '').toLowerCase();
  const activeTheme = useActiveThemeCategory();
  const isTurtle = activeTheme === 'turtle';
  const isDino = activeTheme === 'dinosaur';
  const isFrog = activeTheme === 'frog';
  const isTrain = activeTheme === 'train';
  const isSpace = activeTheme === 'space';

  // If already an image path or sticker asset
  if (normEmoji.startsWith('/') || normEmoji.includes('.png')) {
    let finalSrc = normEmoji;
    if (isTurtle && TURTLE_STICKER_SWAPS[normEmoji]) {
      finalSrc = TURTLE_STICKER_SWAPS[normEmoji];
    } else if (isDino && DINO_STICKER_SWAPS[normEmoji]) {
      finalSrc = DINO_STICKER_SWAPS[normEmoji];
    } else if (isFrog && FROG_STICKER_SWAPS[normEmoji]) {
      finalSrc = FROG_STICKER_SWAPS[normEmoji];
    } else if (isTrain && TRAIN_STICKER_SWAPS[normEmoji]) {
      finalSrc = TRAIN_STICKER_SWAPS[normEmoji];
    } else if (isSpace && SPACE_STICKER_SWAPS[normEmoji]) {
      finalSrc = SPACE_STICKER_SWAPS[normEmoji];
    }
    return (
      <img
        src={finalSrc}
        alt={title || ''}
        className={`${className} object-contain select-none pointer-events-none drop-shadow-2xs`}
        style={size ? { width: size, height: size } : undefined}
        loading={loading}
        decoding="async"
      />
    );
  }

  // 📅 Visual Schedule & Routine / Calendar
  if (normEmoji === '📅' || normTitle.includes('visual schedule') || normTitle.includes('schedule & routine') || normTitle.includes('calendar')) return <ScheduleCalendarSticker className={className} size={size} />;
  // 🚀 Cosmic Explorer / Orion the Astro-Pup Themed Mascot & Stickers
  if (
    normEmoji === '🚀' ||
    normEmoji.includes('space') ||
    normTitle.includes('space') ||
    normTitle.includes('orion') ||
    normTitle.includes('astro') ||
    (isSpace && (normEmoji === '🐝' || normTitle.includes('mascot') || normTitle.includes('companion')))
  ) {
    return <SpaceMascotSticker className={className} size={size} />;
  }
  // 🚂 Steam Express / Conductor Leo Themed Mascot & Stickers
  if (
    normEmoji === '🚂' ||
    normEmoji.includes('train') ||
    normTitle.includes('train') ||
    normTitle.includes('conductor') ||
    normTitle.includes('leo') ||
    (isTrain && (normEmoji === '🐝' || normTitle.includes('mascot') || normTitle.includes('companion')))
  ) {
    return <TrainMascotSticker className={className} size={size} />;
  }
  // 🐸 Frog / Ribbit Pond Themed Mascot & Stickers
  if (
    normEmoji === '🐸' ||
    normEmoji.includes('frog') ||
    normTitle.includes('frog') ||
    normTitle.includes('hoppy') ||
    (isFrog && (normEmoji === '🐝' || normTitle.includes('mascot') || normTitle.includes('companion')))
  ) {
    return <FrogMascotSticker className={className} size={size} />;
  }
  // 🐝 Themed Companion & Motivation / Bee Mascot
  if (normEmoji === '🐝' || normTitle.includes('mascot') || normTitle.includes('companion') || normTitle.includes('bee')) return <BeeMascotSticker className={className} size={size} />;
  // 🐢 Turtle Sanctuary Themed Stickers
  if (normEmoji === '🐢' || normEmoji.includes('turtle') || normTitle.includes('turtle') || normTitle.includes('shelly')) {
    if (normEmoji.includes('backpack') || normTitle.includes('backpack')) return <TurtleShellBackpackSticker className={className} size={size} />;
    if (normEmoji.includes('toothbrush') || normTitle.includes('toothbrush') || normTitle.includes('bamboo brush')) return <TurtleBambooToothbrushSticker className={className} size={size} />;
    if (normEmoji.includes('feast') || normEmoji.includes('clover') || normTitle.includes('feast') || normTitle.includes('clover')) return <TurtleCloverBerryFeastSticker className={className} size={size} />;
    if (normEmoji.includes('hoodie') || normTitle.includes('hoodie')) return <TurtleCozyHoodieSticker className={className} size={size} />;
    if (normEmoji.includes('spring') || normTitle.includes('waterfall') || normTitle.includes('warm spring')) return <TurtleWarmSpringBathSticker className={className} size={size} />;
    if (normEmoji.includes('gazebo') || normEmoji.includes('treehouse') || normTitle.includes('gazebo') || normTitle.includes('treehouse')) return <TurtleTreehouseGazeboSticker className={className} size={size} />;
    if (normEmoji.includes('ferry') || normTitle.includes('ferry') || normTitle.includes('raft')) return <TurtleBambooFerrySticker className={className} size={size} />;
    if (normEmoji.includes('lantern') || normTitle.includes('firefly') || normTitle.includes('lantern')) return <TurtleFireflyLanternBookSticker className={className} size={size} />;
    if (normEmoji.includes('palette') || normEmoji.includes('pebble') || normTitle.includes('palette') || normTitle.includes('pebble')) return <TurtlePebblePaintPaletteSticker className={className} size={size} />;
    if (normEmoji.includes('slide') || normEmoji.includes('hollow') || normTitle.includes('hollow log') || normTitle.includes('log slide')) return <TurtleHollowLogSlideSticker className={className} size={size} />;
    if (normEmoji.includes('swim') || normTitle.includes('swim') || normTitle.includes('pacing') || normTitle.includes('slow down')) return <TurtleSwimmingSticker className={className} size={size} />;
    if (normEmoji.includes('fern') || normTitle.includes('fern') || normTitle.includes('plant')) return <TurtlePottedFernSticker className={className} size={size} />;
    if (normEmoji.includes('bridge') || normTitle.includes('bridge') || normTitle.includes('transition')) return <TurtleArchedBridgeSticker className={className} size={size} />;
    if (normEmoji.includes('track') || normTitle.includes('track') || normTitle.includes('step') || normTitle.includes('footprint')) return <TurtleTracksSticker className={className} size={size} />;
    if (normEmoji.includes('seedling') || normEmoji.includes('sprout') || normTitle.includes('seedling') || normTitle.includes('sprout') || normTitle.includes('grow')) return <TurtleSeedlingSticker className={className} size={size} />;
    if (normEmoji.includes('egg') || normEmoji.includes('nest') || normTitle.includes('egg') || normTitle.includes('nest')) return <TurtleEggNestSticker className={className} size={size} />;
    if (normEmoji.includes('lily') || normEmoji.includes('pad') || normTitle.includes('lily') || normTitle.includes('pad')) return <TurtleCozyShellRetreatSticker className={className} size={size} />;
    if (normEmoji.includes('pond') || normEmoji.includes('reed') || normTitle.includes('pond') || normTitle.includes('reed') || normTitle.includes('lagoon')) return <TurtlePondReedsSticker className={className} size={size} />;
    if (normEmoji.includes('stone') || normEmoji.includes('rock') || normTitle.includes('stone') || normTitle.includes('rock') || normTitle.includes('worry')) return <TurtleRiverStoneSticker className={className} size={size} />;
    if (normEmoji.includes('water') || normEmoji.includes('leaf') || normTitle.includes('water') || normTitle.includes('drop')) return <TurtleWaterDropSticker className={className} size={size} />;
    if (normEmoji.includes('welcome') || normTitle.includes('welcome')) return <TurtleWelcomeSignSticker className={className} size={size} />;
    return <TurtleMascotSticker className={className} size={size} />;
  }
  // 🚀 Today's Adventure Spotlight / Rocket
  if (normEmoji === '🚀' || normTitle.includes('adventure spotlight') || normTitle.includes('rocket')) return <RocketAdventureSticker className={className} size={size} />;
  // 🌡️ Incredible 5-Point Scale / Thermometer
  if (normEmoji === '🌡️' || normTitle.includes('5-point') || normTitle.includes('scale') || normTitle.includes('thermometer')) return <ThermometerSticker className={className} size={size} />;
  // 🥄 Spoon Theory Energy Budget
  if (normEmoji === '🥄' || normTitle.includes('spoon') || normTitle.includes('energy budget')) return <SpoonSticker className={className} size={size} />;
  // 🎡 Decision Wheel Spinner
  if (normEmoji === '🎡' || normTitle.includes('decision wheel') || normTitle.includes('wheel') || normTitle.includes('spinner')) return <DecisionWheelSticker className={className} size={size} />;
  // 🪪 About Me ID / Support
  if (normEmoji === '🪪' || normTitle.includes('about me') || normTitle.includes('id card')) return <IdCardSticker className={className} size={size} />;
  // 🌸 Cycle & Sensory Rhythm
  if (normEmoji === '🌸' || normTitle.includes('cycle') || normTitle.includes('rhythm')) return <ConnectHeartSticker className={className} size={size} />;
  // 📡 Satellite Dish / Live Status
  if (normEmoji === '📡' || normTitle.includes('satellite') || normTitle.includes('live status')) return <SatelliteDishSticker className={className} size={size} />;
  // 📣 Spoken Nudges / Megaphone
  if (normEmoji === '📣' || normTitle.includes('megaphone') || normTitle.includes('audio nudge') || normTitle.includes('spoken nudge')) return <SpokenMegaphoneSticker className={className} size={size} />;
  // 🎙️ Voice Testing / Microphone
  if (normEmoji === '🎙️' || normTitle.includes('microphone') || normTitle.includes('voice testing') || normTitle.includes('voice custom')) return <VoiceMicrophoneSticker className={className} size={size} />;
  // 💾 Offline Readiness / Floppy Disk
  if (normEmoji === '💾' || normTitle.includes('floppy') || normTitle.includes('offline storage') || normTitle.includes('offline readiness')) return <OfflineStorageSticker className={className} size={size} />;
  // 🔒 PIN Security / Safety Lock
  if (normEmoji === '🔒' || normTitle.includes('padlock') || normTitle.includes('pin security') || normTitle.includes('safety setting')) return <SecurityLockSticker className={className} size={size} />;

  // 🎸 Electric Guitar / Routine Rocker
  if (normEmoji === '🎸' || normTitle.includes('guitar') || normTitle.includes('rocker')) return <GuitarRockerSticker className={className} size={size} />;
  // 🦕 / 🦖 Dinosaur / Dino Discovery / Friendly Rex
  if (normEmoji === '🦕' || normEmoji === '🦖' || normTitle.includes('dino') || normTitle.includes('rex')) return <DinoRexSticker className={className} size={size} />;
  // 🧑‍🚀 Astronaut / Cosmic Helmet / Space Explorer
  if (normEmoji === '🧑‍🚀' || normTitle.includes('astronaut') || normTitle.includes('cosmic') || normTitle.includes('helmet')) return <AstronautHelmetSticker className={className} size={size} />;
  // 🪄 Magic Star Wand / Wonder
  if (normEmoji === '🪄' || normTitle.includes('wand') || normTitle.includes('magic')) return <MagicWandSticker className={className} size={size} />;
  // 🚂 Golden Locomotive / Steam Train
  if (normEmoji === '🚂' || normTitle.includes('train') || normTitle.includes('locomotive')) return <GoldenTrainSticker className={className} size={size} />;
  // 🌈 Rainbow Heart / Feelings Explorer vs Weather Rainbow
  if (normTitle.includes('rainbow heart') || (normTitle.includes('rainbow') && normTitle.includes('heart')) || normTitle.includes('feelings explorer')) return <RainbowHeartSticker className={className} size={size} />;
  if (normEmoji === '🌈' || normTitle.includes('rainbow')) return <RainbowWeatherSticker className={className} size={size} />;
  // 🌅 Morning Sun / Sunrise / Morning Superstar
  if (normEmoji === '🌅' || normTitle.includes('morning sun') || normTitle.includes('sunrise') || normTitle.includes('morning superstar')) return <MorningSunriseSticker className={className} size={size} />;

  // 📚 / 📖 Books / Storybooks / Library
  if (normEmoji === '📚' || normEmoji === '📖' || normTitle.includes('book') || normTitle.includes('library') || normTitle.includes('story')) return <BookStorySticker className={className} size={size} />;
  // 🛋️ Cozy Armchair / Blanket Fort / Quiet Break / Couch
  if (normEmoji === '🛋️' || normTitle.includes('armchair') || normTitle.includes('blanket fort') || normTitle.includes('fort') || normTitle.includes('couch')) return <CozyArmchairSticker className={className} size={size} />;
  // 🛏️ Bed / Bedroom / Sleep Sanctuary
  if (normEmoji === '🛏️' || normTitle.includes('bed') || normTitle.includes('bedroom')) return <CozyBedSticker className={className} size={size} />;
  // 🌳 / 🌲 Green Tree / Sunny Yard / Nature Walk
  if (normEmoji === '🌳' || normEmoji === '🌲' || normTitle.includes('yard') || normTitle.includes('nature') || normTitle.includes('tree')) return <GreenTreeSticker className={className} size={size} />;
  // 🎮 Video Game / Special Interest
  if (normEmoji === '🎮' || normTitle.includes('game') || normTitle.includes('gaming') || normTitle.includes('console')) return <GameControllerSticker className={className} size={size} />;
  // 🫁 Deep Breathing / Lungs Pacer
  if (normEmoji === '🫁' || normTitle.includes('lung') || normTitle.includes('breathing pacer')) return <LungsBreathingSticker className={className} size={size} />;
  // 💤 Rest / Power Nap / Zzz
  if (normEmoji === '💤' || normTitle.includes('nap') || (normTitle.includes('rest') && normTitle.includes('power'))) return <RestNapSticker className={className} size={size} />;
  // 🤒 Feeling Unwell / Fever / Sick
  if (normEmoji === '🤒' || normTitle.includes('unwell') || normTitle.includes('sick') || normTitle.includes('fever')) return <SickFeverSticker className={className} size={size} />;
  // 🏥 Clinic / Hospital / Doctor Office
  if (normEmoji === '🏥' || normTitle.includes('clinic') || normTitle.includes('hospital')) return <DoctorAdventureSticker className={className} size={size} />;

  // 🪐 Planet Saturn / Spacey / Daydream
  if (normEmoji === '🪐' || normTitle.includes('saturn') || normTitle.includes('spacey') || normTitle.includes('planet')) return <PlanetSaturnSticker className={className} size={size} />;
  // 🍂 Autumn Leaf / Melancholy
  if (normEmoji === '🍂' || normTitle.includes('leaf') || normTitle.includes('autumn') || normTitle.includes('melanchol')) return <AutumnLeafSticker className={className} size={size} />;
  // 🌊 Ocean Wave / Overwhelmed Surge
  if (normEmoji === '🌊' || normTitle.includes('wave') || normTitle.includes('ocean') || normTitle.includes('overwhelm')) return <OceanWaveSticker className={className} size={size} />;
  // 🔋 / 🪫 Battery Meter
  if (normEmoji === '🔋' || normEmoji === '🪫' || normTitle.includes('battery')) return <BatteryMeterSticker className={className} size={size} />;
  // 🐾 Paw Print / Pet
  if (normEmoji === '🐾' || normTitle.includes('paw')) return <PawPrintSticker className={className} size={size} />;
  // 🦴 Bone Treat / Feed
  if (normEmoji === '🦴' || normTitle.includes('bone')) return <BoneTreatSticker className={className} size={size} />;
  // 🎾 Tennis Ball / Play Fetch
  if (normEmoji === '🎾' || normTitle.includes('tennis')) return <TennisBallSticker className={className} size={size} />;
  // 🪴 Potted Plant / Plant Care
  if (normEmoji === '🪴' || normTitle.includes('plant') || normTitle.includes('sprout')) return <PottedPlantSticker className={className} size={size} />;
  // 🧺 Laundry Hamper / Tidy Clothes
  if (normEmoji === '🧺' || normTitle.includes('hamper') || normTitle.includes('laundry')) return <LaundryHamperSticker className={className} size={size} />;
  // 🍫 Chocolate Bar / Comfort Craving
  if (normEmoji === '🍫' || normTitle.includes('chocolate')) return <ChocolateBarSticker className={className} size={size} />;
  // 🎈 Red Balloon / Bloating
  if (normEmoji === '🎈' || normTitle.includes('balloon') || normTitle.includes('bloat')) return <RedBalloonSticker className={className} size={size} />;
  // 🛒 Shopping Cart / Supermarket
  if (normEmoji === '🛒' || normTitle.includes('cart') || normTitle.includes('supermarket') || normTitle.includes('grocery')) return <ShoppingCartSticker className={className} size={size} />;
  // ✈️ Airplane Flight / Airport
  if (normEmoji === '✈️' || normEmoji === '✈' || normTitle.includes('airplane') || normTitle.includes('flight') || normTitle.includes('plane') || normTitle.includes('airport')) return <AirplaneFlightSticker className={className} size={size} />;
  // 🧳 Travel Luggage / Suitcase
  if (normEmoji === '🧳' || normTitle.includes('luggage') || normTitle.includes('suitcase') || normTitle.includes('bag')) return <TravelLuggageSticker className={className} size={size} />;
  // 🎫 Boarding Ticket / Pass
  if (normEmoji === '🎫' || normTitle.includes('ticket') || normTitle.includes('boarding pass')) return <BoardingTicketSticker className={className} size={size} />;
  // 🤫 Quiet Voice / Inside Voice / Shh
  if (normEmoji === '🤫' || normTitle.includes('quiet voice') || normTitle.includes('inside voice') || normTitle.includes('shh')) return <QuietVoiceSticker className={className} size={size} />;
  // ☕ Hot Cocoa / Warm Mug
  if (normEmoji === '☕' || normTitle.includes('cocoa') || normTitle.includes('chocolate') || normTitle.includes('mug') || normTitle.includes('warm drink') || normTitle.includes('tea')) return <HotCocoaSticker className={className} size={size} />;
  // 🧩 Jigsaw Puzzle
  if (normEmoji === '🧩' || normTitle.includes('puzzle') || normTitle.includes('jigsaw')) return <JigsawPuzzleSticker className={className} size={size} />;

  // 💡 Bright Lights Sensory Trigger
  if (normEmoji === '💡' || normTitle.includes('bright light') || normTitle.includes('light sensitivity') || normTitle.includes('glare') || normTitle.includes('overhead light')) return <BrightLightsSticker className={className} size={size} />;
  // 🔊 Loud Noise Sensitivity Trigger
  if (normEmoji === '🔊' || normEmoji === '📢' || normTitle.includes('loud noise') || normTitle.includes('loud sound') || normTitle.includes('noise sensitivity') || normTitle.includes('loud chatter')) return <LoudNoiseSticker className={className} size={size} />;
  // 🎭 Social Masking Fatigue
  if (normEmoji === '🎭' || normTitle.includes('social masking') || normTitle.includes('masking') || normTitle.includes('pretending') || normTitle.includes('social fatigue') || normTitle.includes('burnout')) return <SocialMaskingSticker className={className} size={size} />;
  // ✍️ / 📝 Writing & Reflection / Journaling
  if (normEmoji === '✍️' || normEmoji === '✍' || (normEmoji === '📝' && (normTitle.includes('journal') || normTitle.includes('reflect') || normTitle.includes('write'))) || normTitle.includes('journal') || normTitle.includes('reflection') || normTitle.includes('diary')) return <WritingJournalSticker className={className} size={size} />;
  // 🏊 Swimming Pool Outing
  if (normEmoji === '🏊' || normEmoji === '🏊‍♂️' || normEmoji === '🏊‍♀️' || normTitle.includes('swim') || normTitle.includes('pool') || normTitle.includes('swimming')) return <SwimmingPoolSticker className={className} size={size} />;
  // 🍿 Movie Cinema Theater
  if (normEmoji === '🍿' || normEmoji === '🎬' || normTitle.includes('movie') || normTitle.includes('cinema') || normTitle.includes('theater') || normTitle.includes('popcorn') || normTitle.includes('film')) return <MovieCinemaSticker className={className} size={size} />;
  // 🎳 Bowling Alley Outing
  if (normEmoji === '🎳' || normTitle.includes('bowling') || normTitle.includes('pins') || normTitle.includes('strike')) return <BowlingAlleySticker className={className} size={size} />;
  // ⛺ Camping Adventure Tent
  if (normEmoji === '⛺' || normTitle.includes('camp') || normTitle.includes('camping') || normTitle.includes('tent') || normTitle.includes('campfire')) return <CampingTentSticker className={className} size={size} />;
  // 🏛️ Museum Visit
  if (normEmoji === '🏛️' || normEmoji === '🏛' || normTitle.includes('museum') || normTitle.includes('exhibit') || normTitle.includes('gallery')) return <MuseumVisitSticker className={className} size={size} />;

  // ⏰ Wake up / Morning / Routine
  if (normEmoji === '⏰' || normEmoji === '🔆' || normEmoji === '☀️' || normTitle.includes('wake') || normTitle.includes('morning') || normTitle.includes('routine')) return <AlarmClockSticker className={className} size={size} />;
  // 💻 Laptop / Execution Sprint
  if (normEmoji === '💻' || normTitle.includes('execution sprint') || normTitle.includes('laptop')) return <LaptopExecutionSticker className={className} size={size} />;
  // 📋 Clipboard / Daily Shutdown / Tomorrow Prep / Passport
  if (normEmoji === '📋' || normTitle.includes('shutdown') || normTitle.includes('tomorrow prep') || normTitle.includes('clipboard') || normTitle.includes('passport')) return <ClipboardShutdownSticker className={className} size={size} />;
  // 🎯 Target / Bullseye / Focus Sprint / Deep Work
  if (normEmoji === '🎯' || normTitle.includes('deep work') || normTitle.includes('focus sprint') || normTitle.includes('bullseye') || normTitle.includes('target')) return <DecisionWheelSticker className={className} size={size} />;
  // 💼 Workday / Briefcase
  if (normEmoji === '💼' || normTitle.includes('workday') || normTitle.includes('briefcase')) return <AdultBriefcaseSticker className={className} size={size} />;
  // 🗄️ Locker / Filing Cabinet
  if (normEmoji === '🗄️' || normTitle.includes('locker') || normTitle.includes('filing cabinet')) return <LockerScheduleSticker className={className} size={size} />;
  // 🩳 Pajamas / Sleep Shorts
  if (normEmoji === '🩳' || normTitle.includes('pajama')) return <PajamasShortsSticker className={className} size={size} />;
  // ⭐ Gold Star
  if (normEmoji === '⭐' || normEmoji === '🌟') return <GoldStarSticker className={className} size={size} />;
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
  // ⛅ Partly Cloudy
  if (normEmoji === '⛅' || normEmoji === '🌤️' || normEmoji === '🌤' || normTitle.includes('partly cloudy')) return <PartlyCloudySticker className={className} size={size} />;
  // 🌫️ Fog & Mist
  if (normEmoji === '🌫️' || normEmoji === '🌫' || normTitle.includes('fog') || normTitle.includes('mist')) return <FogMistWeatherSticker className={className} size={size} />;
  // ☁️ Cloudy / Overcast
  if (normEmoji === '☁️' || normEmoji === '☁' || normTitle.includes('cloudy') || normTitle.includes('overcast')) return <CloudyWeatherSticker className={className} size={size} />;
  // ❄️ Snow / Flurries
  if (normEmoji === '❄️' || normEmoji === '❄' || normEmoji === '🌨️' || normEmoji === '🌨' || normTitle.includes('snow') || normTitle.includes('flurr')) return <SnowWeatherSticker className={className} size={size} />;
  // 🌩️ Thunderstorm / Lightning
  if (normEmoji === '🌩️' || normEmoji === '🌩' || normEmoji === '⚡' || normTitle.includes('thunder') || normTitle.includes('lightning') || normTitle.includes('storm')) return <ThunderstormWeatherSticker className={className} size={size} />;
  // 💨 / 🌬️ Windy / Breeze
  if (normEmoji === '💨' || normEmoji === '🌬️' || normEmoji === '🌬' || normTitle.includes('windy') || normTitle.includes('breeze')) return <WindyWeatherSticker className={className} size={size} />;
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
  // 🤝 Taking Turns / Sharing / Friends / Social
  if (normEmoji === '🤝' || normEmoji === '👥' || normTitle.includes('turn') || normTitle.includes('sharing') || normTitle.includes('social') || normTitle.includes('friction')) return <TakingTurnsStorySticker className={className} size={size} />;
  // 🍎 Healthy Snack / Apple / Fruit
  if (normEmoji === '🍎' || normTitle.includes('snack') || normTitle.includes('apple') || normTitle.includes('fruit')) return <AppleSticker className={className} size={size} />;
  // 🍬 Candy / Treat / Reward Snack
  if (normEmoji === '🍬' || normEmoji === '🍭' || normTitle.includes('candy') || normTitle.includes('treat')) return <CandyTreatSticker className={className} size={size} />;
  // 🥤 Drink / Juice / Soda
  if (normEmoji === '🥤' || normTitle.includes('juice') || normTitle.includes('soda') || normTitle.includes('smoothie')) return <DrinkCupSticker className={className} size={size} />;
  // 💬 Speech Bubble / Quick Phrases / Talk / Communication
  if (normEmoji === '💬' || normEmoji === '🗨️' || normEmoji === '🗣️' || normTitle.includes('phrase') || normTitle.includes('speak') || normTitle.includes('talk') || normTitle.includes('chat') || normTitle.includes('say') || normTitle.includes('communication') || normTitle.includes('expressing')) return <QuickPhrasesSticker className={className} size={size} />;
  // 🫁 Inhaler / Lungs / Breathing / Asthma / Puff
  if (normEmoji === '🫁' || normEmoji === 'wind' || normTitle.includes('inhaler') || normTitle.includes('albuterol') || normTitle.includes('asthma') || normTitle.includes('puff') || normTitle.includes('lung')) return <LungsInhalerSticker className={className} size={size} />;
  // 🍬 Candy / Treat / Gummy / Multivitamin
  if (normEmoji === '🍬' || normEmoji === '🍭' || normEmoji === 'sparkles' || normEmoji === 'gummy' || normTitle.includes('candy') || normTitle.includes('treat') || normTitle.includes('gummy') || normTitle.includes('multivitamin')) return <CandyTreatSticker className={className} size={size} />;
  // 💧 Water / Drops / Melatonin / Liquid
  if (normEmoji === '💧' || normEmoji === 'droplets' || normEmoji === 'drops' || normTitle.includes('drop') || normTitle.includes('melatonin') || normTitle.includes('liquid')) return <DrinkWaterSticker className={className} size={size} />;
  // 💊 Pill / Medication / Capsule / Tablet
  if (normEmoji === '💊' || normEmoji === 'pill' || normTitle.includes('med') || normTitle.includes('pill') || normTitle.includes('capsule') || normTitle.includes('tablet')) return <MedicationSticker className={className} size={size} />;
  // ❤️ Health / Caregiver Heart
  if (normEmoji === '❤️' || normEmoji === 'heart' || normEmoji === '🩹' || normEmoji === 'shield' || normTitle.includes('health')) return <ConnectHeartSticker className={className} size={size} />;
  // 🔄 Repeat / Loop / Cycle / Again / Refresh / Plans Change / Routine Change
  if (normTitle.includes('plans change') || normTitle.includes('routine change') || (normTitle.includes('plan') && normTitle.includes('change'))) return <PlansChangeStorySticker className={className} size={size} />;
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
  // 🏠 / 🏡 Home / House
  if (normEmoji === '🏠' || normEmoji === '🏡' || normTitle.includes('home') || normTitle.includes('house')) return <HomeHouseSticker className={className} size={size} />;
  // ✅ / ✔️ Task Done / Finished / Checkmark
  if (normEmoji === '✅' || normEmoji === '✔️' || normEmoji === '✔' || normTitle.includes('task done') || normTitle.includes('all done') || normTitle.includes('finished')) return <TaskDoneSticker className={className} size={size} />;
  // 🧠 Therapy / Sensory Brain / OT
  if (normEmoji === '🧠' || normTitle.includes('therapy') || normTitle.includes('brain')) return <TherapyBrainSticker className={className} size={size} />;
  // 🛋️ Quiet / break / Afternoon
  if (normEmoji === '🛋️' || normEmoji === '🌬️' || normTitle.includes('break') || normTitle.includes('decompress') || normTitle.includes('quiet')) return <BreathingCloudSticker className={className} size={size} />;
  // 🛏️ Bed / Sleep
  if (normEmoji === '🛏️' || normTitle.includes('bed') || normTitle.includes('wind down') || normTitle.includes('sleep')) return <BedtimeSleepSticker className={className} size={size} />;
  // 💧 Drink water / Hydration
  if (normEmoji === '💧' || normEmoji === '🥤' || normEmoji === '🥛' || normTitle.includes('water') || normTitle.includes('drink') || normTitle.includes('hydrate')) return <DrinkWaterSticker className={className} size={size} />;
  // 🐕 Pet care / dog / cat
  if (normEmoji === '🐕' || normEmoji === '🐾' || normEmoji === '🐶' || normEmoji === '🐱' || normTitle.includes('pet') || normTitle.includes('dog') || normTitle.includes('cat')) return <PetCareSticker className={className} size={size} />;
  // 🎵 Music / audio calm / sensory sound
  if (normEmoji === '🎵' || normEmoji === '🎶' || normEmoji === '🔊' || normTitle.includes('music') || normTitle.includes('song') || normTitle.includes('listen') || normTitle.includes('sensory') || normTitle.includes('overload')) return <MusicSensorySticker className={className} size={size} />;
  // ☀️ Outdoor / sunshine / park
  if (normEmoji === '☀️' || normEmoji === '🌳' || normTitle.includes('outdoor') || normTitle.includes('outside') || normTitle.includes('park') || normTitle.includes('sunshine')) return <OutdoorSunSticker className={className} size={size} />;
  // 📓 Homework / study
  if (normEmoji === '📓' || normTitle.includes('homework') || normTitle.includes('study')) return <HomeworkStudySticker className={className} size={size} />;
  // 🎨 Art / crafts / drawing
  if (normEmoji === '🎨' || normEmoji === '🖍️' || normTitle.includes('art') || normTitle.includes('paint') || normTitle.includes('craft')) return <ArtCraftsSticker className={className} size={size} />;
  // ⭐ Star / calm mindfulness
  if (normEmoji === '⭐' || normEmoji === '✨' || normTitle.includes('mindful') || normTitle.includes('reset')) return <CalmSparklesSticker className={className} size={size} />;
  // 🏆 Trophy / reward / milestone
  if (normEmoji === '🏆' || normEmoji === '🥇' || normTitle.includes('trophy') || normTitle.includes('reward') || normTitle.includes('win') || normTitle.includes('streak')) return <RewardTrophySticker className={className} size={size} />;
  // 🛁 Bath time / tub
  if (normEmoji === '🛁' || normTitle.includes('bath') || normTitle.includes('tub')) return <BathTimeSticker className={className} size={size} />;
  // 😊 Happy
  if (normEmoji === '😊' || normEmoji === '😄' || normEmoji === '🙂' || normTitle.includes('happy')) return <MoodHappySticker className={className} size={size} />;
  // 😌 Calm
  if (normEmoji === '😌' || normTitle.includes('calm') || normTitle.includes('peaceful')) return <MoodCalmSticker className={className} size={size} />;
  // 🤩 Excited
  if (normEmoji === '🤩' || normTitle.includes('excited')) return <MoodExcitedSticker className={className} size={size} />;
  // 🥱 Sleepy / tired
  if (normEmoji === '🥱' || normEmoji === '😴' || normTitle.includes('sleepy') || normTitle.includes('tired')) return <MoodSleepySticker className={className} size={size} />;
  // 😟 Unsure / worried
  if (normEmoji === '😟' || normEmoji === '😕' || normTitle.includes('unsure') || normTitle.includes('worried')) return <MoodUnsureSticker className={className} size={size} />;

  // 🧱 Lego / Building Blocks
  if (normEmoji === '🧱' || normTitle.includes('lego') || normTitle.includes('block')) return <FavLegoSticker className={className} size={size} />;
  // 🛁 Take a Bath
  if (normTitle.includes('take a bath')) return <FavBathSticker className={className} size={size} />;
  // 🥪 Sandwich / Hungry snack
  if (normTitle.includes('hungry') || (normTitle.includes('snack') && !normTitle.includes('apple'))) return <FavSandwichSticker className={className} size={size} />;
  // 💧 Thirsty / Water
  if (normTitle.includes('thirsty') || (normTitle.includes('water') && normTitle.includes('want'))) return <FavWaterSticker className={className} size={size} />;
  // 🛋️ Quiet Break / Quiet time
  if (normEmoji === '🤫' || normTitle.includes('quiet break') || normTitle.includes('quiet time') || normTitle.includes('sensory quiet')) return <FavQuietBreakSticker className={className} size={size} />;
  // 🆘 Help Please / SOS
  if (normEmoji === '🆘' || normTitle.includes('help me') || normTitle.includes('can you help') || normTitle.includes('help from a grown-up')) return <FavHelpSosSticker className={className} size={size} />;
  // 🌳 Go Outside / Tree
  if (normTitle.includes('go outside') || normTitle.includes('want to go outside')) return <FavOutsideSticker className={className} size={size} />;
  // 💖 I Love You / Heart / Hug
  if (normEmoji === '💖' || normEmoji === '🤗' || normTitle.includes('love you') || normTitle.includes('i love') || normTitle.includes('hug')) return <FavLoveHeartSticker className={className} size={size} />;
  // 🦕 Comfort Toy / Item
  if (normEmoji === '🦕' || normTitle.includes('comfort item') || normTitle.includes('comfort toy')) return <TeddyBearSticker className={className} size={size} />;
  // 😴 Tired / Rest
  if ((normTitle.includes('tired') && normTitle.includes('rest')) || normTitle.includes('want to rest')) return <FavRestTiredSticker className={className} size={size} />;
  // 🎧 Listen to Music / Noise-Cancelling Headphones
  if (normTitle.includes('listen to music') || (normEmoji === '🎧' && normTitle.includes('music'))) return <FavMusicSticker className={className} size={size} />;
  if (normEmoji === '🎧' || normTitle.includes('headphone')) return <TeenHeadphonesSticker className={className} size={size} />;
  // 🍳 Cooking / Cook / Pot
  if (normEmoji === '🍳' || normEmoji === '🍲' || normTitle.includes('cooking') || normTitle.includes('cook')) return <CookingPotSticker className={className} size={size} />;
  // 🖐️ Touch Gently / Feel
  if (normEmoji === '🖐️' || normEmoji === '✋' || normEmoji === '🤚' || normTitle.includes('touch') || (normTitle.includes('feel') && !normTitle.includes('feeling'))) return <GroundingTouchHandSticker className={className} size={size} />;
  // 👂 Listen Closely / Hear / Ear
  if (normEmoji === '👂' || (normTitle.includes('listen') && !normTitle.includes('music')) || normTitle.includes('hear')) return <GroundingHearEarSticker className={className} size={size} />;
  // 👃 Smell / Scent / Nose
  if (normEmoji === '👃' || normTitle.includes('smell') || normTitle.includes('scent') || normTitle.includes('nose')) return <GroundingSmellNoseSticker className={className} size={size} />;
  // 👍 Caregiver Okay / Thumbs Up
  if (normEmoji === '👍' || normTitle.includes('thumbs up') || normTitle.includes('okay') || normTitle.includes("i'm okay") || normTitle.includes('feeling okay')) return <CaregiverResponseOkaySticker className={className} size={size} />;
  // 👀 / 👁️ 5-4-3-2-1 Grounding / Look Around
  if (normEmoji === '👀' || normEmoji === '👁️' || normTitle.includes('grounding') || normTitle.includes('5-4-3-2-1') || normTitle.includes('look around') || normTitle.includes('see')) {
    return <EyeSeeSticker className={className} size={size} />;
  }
  // 🛑 Stop Please / Do not want
  if (normEmoji === '🛑' || normTitle.includes('stop please') || normTitle.includes('do not want this') || normTitle.includes('please stop')) return <FavStopSticker className={className} size={size} />;
  // 😊 Happy
  if (normTitle.includes('i am happy') || normTitle.includes('am happy')) return <FavHappySticker className={className} size={size} />;

  // Fallback to raw emoji if none match
  return <span className={className} style={size ? { fontSize: size * 0.75 } : undefined}>{emoji || '⭐'}</span>;
};



