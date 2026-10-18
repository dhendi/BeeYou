import React, { useState, useEffect } from 'react';
import { preloadThemeAssetsImmediate } from '../../utils/appAssetPreloader';

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
      if (cat === 'ocean' || id === 'theme-ocean') return 'ocean';
      if (cat === 'fantasy' || id === 'theme-fantasy' || cat === 'magic') return 'fantasy';
      if (cat === 'racing' || id === 'theme-racing') return 'racing';
    }
    if (typeof localStorage !== 'undefined') {
      const savedId = localStorage.getItem('beeyou_active_theme_id');
      if (savedId === 'theme-turtle') return 'turtle';
      if (savedId === 'theme-dino') return 'dinosaur';
      if (savedId === 'theme-frog') return 'frog';
      if (savedId === 'theme-trains') return 'train';
      if (savedId === 'theme-space') return 'space';
      if (savedId === 'theme-ocean') return 'ocean';
      if (savedId === 'theme-fantasy') return 'fantasy';
      if (savedId === 'theme-racing') return 'racing';
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
      if (active !== 'default') {
        preloadThemeAssetsImmediate(active);
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

export function useIsOceanTheme(): boolean {
  return useActiveThemeCategory() === 'ocean';
}

export function useIsFairytaleTheme(): boolean {
  return useActiveThemeCategory() === 'fantasy';
}

export function useIsRacingTheme(): boolean {
  return useActiveThemeCategory() === 'racing';
}

const renderStickerPng = (src: string, alt: string) => {
  const Component: React.FC<StickerProps> = ({ className = 'w-9 h-9', size, loading = 'eager' }) => {
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
    } else if (theme === 'ocean' && OCEAN_STICKER_SWAPS[src]) {
      currentSrc = OCEAN_STICKER_SWAPS[src];
    } else if (theme === 'fantasy' && FAIRYTALE_STICKER_SWAPS[src]) {
      currentSrc = FAIRYTALE_STICKER_SWAPS[src];
    } else if (theme === 'racing' && RACING_STICKER_SWAPS[src]) {
      currentSrc = RACING_STICKER_SWAPS[src];
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
  const Component: React.FC<StickerProps> = ({ className = 'w-9 h-9', size, loading = 'eager' }) => {
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
    } else if (theme === 'ocean') {
      currentSrc = OCEAN_STICKER_SWAPS[defaultSrc] || defaultSrc;
    } else if (theme === 'fantasy') {
      currentSrc = FAIRYTALE_STICKER_SWAPS[defaultSrc] || defaultSrc;
    } else if (theme === 'racing') {
      currentSrc = RACING_STICKER_SWAPS[defaultSrc] || defaultSrc;
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
  '/assets/stickers/fidget_bubbles.webp',
  '/assets/stickers/turtle_pond_fidget_bubbles.webp',
  'Fidget Bubbles'
);

// 🌬️ Calm Breathing (Watercolor breathing cloud with soft swirl / Lagoon breeze in Turtle theme)
export const BreathingCloudSticker = renderThemedStickerPng(
  '/assets/stickers/breathing_cloud.webp',
  '/assets/stickers/turtle_lagoon_breeze_breath.webp',
  'Calm Breathing Cloud'
);

// 🎡 Decision Wheel (Swaps to Wooden Lotus Spinner Wheel in Turtle Sanctuary theme)
export const DecisionWheelSticker = renderThemedStickerPng(
  '/assets/stickers/decision_wheel.webp',
  '/assets/stickers/turtle_wooden_wheel.webp',
  'Decision Wheel'
);

// ⏱️ Countdown Timer / Pie Clock (Swaps across all themes)
export const CountdownTimerSticker = renderThemedStickerPng(
  '/assets/stickers/timer_clock.webp',
  '/assets/stickers/turtle_sand_timer.webp',
  'Countdown Timer Clock',
  '/assets/stickers/dino_stone_stopwatch.webp',
  '/assets/stickers/frog_lily_stopwatch.webp',
  '/assets/stickers/train_pressure_stopwatch.webp',
  '/assets/stickers/space_clock_time.webp'
);

// 🚨 Ask for Help (SOS) (Swaps to Guardian Turtle Shell Shield in Turtle Sanctuary theme)
export const ShieldSosSticker = renderThemedStickerPng(
  '/assets/stickers/help_sos.webp',
  '/assets/stickers/turtle_guardian_shield_sos.webp',
  'Help SOS Shield'
);

// 🔗 Connect Caregiver (Warm pink watercolor heart with bandaid from reference)
export const ConnectHeartSticker = renderStickerPng('/assets/stickers/caregiver_heart.webp', 'Caregiver Heart');

// 🪪 About Me ID Card (Swaps to Wooden Explorer ID Badge in Turtle Sanctuary theme)
export const IdCardSticker = renderThemedStickerPng(
  '/assets/stickers/about_id.webp',
  '/assets/stickers/turtle_wooden_id_badge.webp',
  'About Me ID'
);

// 📖 Passport / Reading Book (Swaps to Firefly Lantern & Scroll in Turtle Sanctuary theme)
export const ReadingBookSticker = renderThemedStickerPng(
  '/assets/stickers/passport_book.webp',
  '/assets/stickers/turtle_firefly_lantern_book.webp',
  'Reading Book'
);

// 💬 Quick Phrases (Swaps to Leafy Speech Bubbles in Turtle Sanctuary theme)
export const QuickPhrasesSticker = renderThemedStickerPng(
  '/assets/stickers/quick_phrases.webp',
  '/assets/stickers/turtle_leaf_speech_bubbles.webp',
  'Quick Phrases'
);

// ⌨️ Type to Speak Keyboard (Swaps to Bamboo & Sage Keyboard in Turtle Sanctuary theme)
export const KeyboardSticker = renderThemedStickerPng(
  '/assets/stickers/keyboard.webp',
  '/assets/stickers/turtle_bamboo_keyboard.webp',
  'Keyboard'
);

// 🌡️ Feelings & Thermometer (Swaps to Bamboo Gauge & Heart in Turtle Sanctuary theme)
export const ThermometerSticker = renderThemedStickerPng(
  '/assets/stickers/feelings_thermometer.webp',
  '/assets/stickers/turtle_bamboo_thermometer.webp',
  'Feelings Thermometer'
);

// 💊 Medications & Health (Swaps to Leaf Dish & Vitamins in Turtle Sanctuary theme)
export const MedicationSticker = renderThemedStickerPng(
  '/assets/stickers/medications_health.webp',
  '/assets/stickers/turtle_leaf_vitamins.webp',
  'Medications Health'
);

// 🌙 Evening Reflection (Swaps to Crescent Moon Over Lagoon in Turtle Sanctuary theme)
export const EveningMoonSticker = renderThemedStickerPng(
  '/assets/stickers/evening_moon.webp',
  '/assets/stickers/turtle_lagoon_moon.webp',
  'Evening Moon'
);

// Routine, Wellness & Activity stickers
export const ToothbrushSticker = renderThemedStickerPng(
  '/assets/stickers/toothbrush.webp',
  '/assets/stickers/turtle_bamboo_toothbrush.webp',
  'Toothbrush'
);
export const ToyBoxSticker = renderThemedStickerPng(
  '/assets/stickers/toy_box.webp',
  '/assets/stickers/turtle_seagrass_toy_box.webp',
  'Clean Up Toys'
);
export const GetDressedSticker = renderThemedStickerPng(
  '/assets/stickers/clothes_dressed.webp',
  '/assets/stickers/turtle_cozy_hoodie.webp',
  'Get Dressed'
);
export const WashHandsSticker = renderThemedStickerPng(
  '/assets/stickers/soap_wash_hands.webp',
  '/assets/stickers/turtle_leaf_soap_wash.webp',
  'Wash Hands'
);
export const QuietTimeSticker = renderThemedStickerPng(
  '/assets/stickers/breathing_cloud.webp',
  '/assets/stickers/turtle_cozy_shell_retreat.webp',
  'Quiet Time'
);
export const SpoonSticker = renderThemedStickerPng(
  '/assets/stickers/spoons_energy.webp',
  '/assets/stickers/turtle_bamboo_spoons.webp',
  'Spoon Energy'
);
export const MoodJournalSticker = renderThemedStickerPng(
  '/assets/stickers/passport_book.webp',
  '/assets/stickers/turtle_firefly_lantern_book.webp',
  'Mood Journal'
);
export const TabletIpadSticker = renderThemedStickerPng(
  '/assets/stickers/tablet_ipad.webp',
  '/assets/stickers/turtle_bamboo_tablet.webp',
  'Tablet iPad'
);

// Morning Routine & School Step Stickers
export const AlarmClockSticker = renderThemedStickerPng(
  '/assets/stickers/alarm_clock.webp',
  '/assets/stickers/turtle_dawn_bell_clock.webp',
  'Wake Up Alarm Clock'
);
export const ToiletSticker = renderThemedStickerPng(
  '/assets/stickers/routine_toilet_restroom.webp',
  '/assets/stickers/turtle_bamboo_restroom.webp',
  'Toilet Restroom'
);
export const PancakesSticker = renderThemedStickerPng(
  '/assets/stickers/pancakes_breakfast.webp',
  '/assets/stickers/turtle_clover_berry_feast.webp',
  'Breakfast Pancakes'
);
export const BackpackSticker = renderThemedStickerPng(
  '/assets/stickers/backpack_school.webp',
  '/assets/stickers/turtle_shell_backpack.webp',
  'School Backpack'
);
export const SneakersSticker = renderThemedStickerPng(
  '/assets/stickers/sneaker_shoes.webp',
  '/assets/stickers/turtle_reed_explorer_shoes.webp',
  'Shoes Sneakers'
);
export const AppleSticker = renderThemedStickerPng(
  '/assets/stickers/apple_snack.webp',
  '/assets/stickers/turtle_garden_fruit_snack.webp',
  'Healthy Apple Snack'
);
export const FolderSticker = renderThemedStickerPng(
  '/assets/stickers/folder_schoolwork.webp',
  '/assets/stickers/turtle_botanical_folder.webp',
  'School Binder Folder'
);
export const PencilSticker = renderThemedStickerPng(
  '/assets/stickers/pencil_write.webp',
  '/assets/stickers/turtle_bamboo_pencil.webp',
  'Pencil Writing'
);
export const TeddyBearSticker = renderThemedStickerPng(
  '/assets/stickers/teddy_bear.webp',
  '/assets/stickers/turtle_seagrass_toy_box.webp',
  'Teddy Bear Play'
);
export const ShowerSticker = renderThemedStickerPng(
  '/assets/stickers/shower_wash.webp',
  '/assets/stickers/turtle_warm_spring_bath.webp',
  'Shower Wash'
);
export const SchoolBusSticker = renderThemedStickerPng(
  '/assets/stickers/school_bus.webp',
  '/assets/stickers/turtle_bamboo_ferry.webp',
  'School Bus'
);
export const ScienceFlaskSticker = renderThemedStickerPng(
  '/assets/stickers/science_flask.webp',
  '/assets/stickers/turtle_terrarium_science.webp',
  'Science Flask'
);

// Onboarding, Personas & Feature Stickers
export const LanguageGlobeSticker = renderThemedStickerPng(
  '/assets/stickers/language_globe.webp',
  '/assets/stickers/turtle_lagoon_globe.webp',
  'Language Globe'
);
export const ChildPersonaSticker = renderThemedStickerPng(
  '/assets/stickers/child_persona.webp',
  '/assets/stickers/turtle_child_persona_hatchling.webp',
  'Child Persona (Teddy Bear)'
);
export const TeenHeadphonesSticker = renderThemedStickerPng(
  '/assets/stickers/teen_headphones.webp',
  '/assets/stickers/turtle_shell_headphones.webp',
  'Teen Headphones'
);
export const AdultBriefcaseSticker = renderThemedStickerPng(
  '/assets/stickers/adult_briefcase.webp',
  '/assets/stickers/turtle_bamboo_satchel_briefcase.webp',
  'Adult Briefcase'
);
export const CaregiverPhoneSticker = renderThemedStickerPng(
  '/assets/stickers/caregiver_phone.webp',
  '/assets/stickers/turtle_wood_phone_caregiver.webp',
  'Caregiver Phone'
);
export const ScheduleCalendarSticker = renderThemedStickerPng(
  '/assets/stickers/schedule_calendar.webp',
  '/assets/stickers/turtle_bamboo_calendar.webp',
  'Schedule Calendar'
);
export const TrialCrownSticker = renderThemedStickerPng(
  '/assets/stickers/trial_crown.webp',
  '/assets/stickers/turtle_golden_shell_crown.webp',
  '15-Day Free Trial Crown'
);

// Future Expansion Routine & Activity Stickers
export const BedtimeSleepSticker = renderThemedStickerPng(
  '/assets/stickers/bedtime_sleep.webp',
  '/assets/stickers/turtle_moss_bed_sleep.webp',
  'Bedtime Sleep'
);
export const DrinkWaterSticker = renderThemedStickerPng(
  '/assets/stickers/routine_water_drink.webp',
  '/assets/stickers/turtle_bamboo_drink_cup.webp',
  'Drink Water'
);
export const PetCareSticker = renderThemedStickerPng(
  '/assets/stickers/pet_care.webp',
  '/assets/stickers/turtle_hatchling_pet_care.webp',
  'Pet Care'
);
export const MusicSensorySticker = renderThemedStickerPng(
  '/assets/stickers/music_sensory.webp',
  '/assets/stickers/turtle_bamboo_wind_chimes.webp',
  'Music Sensory'
);
export const OutdoorSunSticker = renderThemedStickerPng(
  '/assets/stickers/outdoor_sun.webp',
  '/assets/stickers/turtle_meadow_sunshine.webp',
  'Outdoor Sunshine'
);
export const HomeworkStudySticker = renderThemedStickerPng(
  '/assets/stickers/homework_study.webp',
  '/assets/stickers/turtle_bamboo_pencil.webp',
  'Homework Study'
);
export const ArtCraftsSticker = renderThemedStickerPng(
  '/assets/stickers/art_crafts.webp',
  '/assets/stickers/turtle_pebble_paint_palette.webp',
  'Art Crafts'
);
export const CalmSparklesSticker = renderStickerPng('/assets/stickers/calm_sparkles.webp', 'Calm Star');
export const RewardTrophySticker = renderThemedStickerPng(
  '/assets/stickers/reward_trophy.webp',
  '/assets/stickers/turtle_lotus_trophy.webp',
  'Reward Trophy'
);
export const BathTimeSticker = renderThemedStickerPng(
  '/assets/stickers/bath_time.webp',
  '/assets/stickers/turtle_warm_spring_bath.webp',
  'Bath Time'
);
export const DinnerBowlSticker = renderThemedStickerPng(
  '/assets/stickers/dinner_bowl.webp',
  '/assets/stickers/turtle_clover_berry_feast.webp',
  'Dinner Plate'
);
export const DrinkCupSticker = renderThemedStickerPng(
  '/assets/stickers/drink_cup.webp',
  '/assets/stickers/turtle_bamboo_drink_cup.webp',
  'Drink Cup'
);
export const CandyTreatSticker = renderThemedStickerPng(
  '/assets/stickers/candy_treat.webp',
  '/assets/stickers/turtle_berry_honey_treat.webp',
  'Candy Treat'
);
export const WallClockSticker = renderThemedStickerPng(
  '/assets/stickers/clock_time.webp',
  '/assets/stickers/turtle_shell_wall_clock.webp',
  'Wall Clock'
);
export const CutlerySticker = renderThemedStickerPng(
  '/assets/stickers/fork_knife.webp',
  '/assets/stickers/turtle_bamboo_cutlery.webp',
  'Fork & Knife'
);
export const CarRideSticker = renderThemedStickerPng(
  '/assets/stickers/car_ride.webp',
  '/assets/stickers/turtle_wooden_leaf_cart.webp',
  'Car Ride'
);
export const WindBreezeSticker = renderThemedStickerPng(
  '/assets/stickers/wind_breeze.webp',
  '/assets/stickers/turtle_lagoon_breeze_breath.webp',
  'Wind Breeze'
);
export const LungsInhalerSticker = renderStickerPng('/assets/stickers/lungs_inhaler.webp', 'Lungs Inhaler');
export const RepeatLoopSticker = renderThemedStickerPng(
  '/assets/stickers/refresh_repeat.webp',
  '/assets/stickers/turtle_swimming_loop.webp',
  'Repeat Loop'
);
export const AccessibilityHubSticker = renderStickerPng('/assets/stickers/accessibility_hub.webp', 'Accessibility & Sensory Hub');

// User Provided Routine Replacements
export const LaptopExecutionSticker = renderStickerPng('/assets/stickers/laptop_execution.webp', 'Laptop Execution Sprint');
export const ClipboardShutdownSticker = renderStickerPng('/assets/stickers/clipboard_shutdown.webp', 'Daily Shutdown Prep');
export const GoldStarSticker = renderStickerPng('/assets/stickers/star_gold.webp', 'Gold Star');
export const LockerScheduleSticker = renderThemedStickerPng(
  '/assets/stickers/locker_schedule.webp',
  '/assets/stickers/turtle_bamboo_calendar.webp',
  'Locker & Daily Schedule'
);
export const PajamasShortsSticker = renderThemedStickerPng(
  '/assets/stickers/pajamas_shorts.webp',
  '/assets/stickers/turtle_starry_pajamas.webp',
  'Put on Pajamas'
);
export const BeeMascotSticker = renderStickerPng('/assets/stickers/bee_mascot.webp', 'Bee Mascot Companion');
export const TurtleMascotSticker = renderStickerPng('/assets/stickers/turtle_mascot.webp', 'Shelly the Wise Turtle');
export const FrogMascotSticker = renderStickerPng('/assets/stickers/frog_mascot.webp', 'Hoppy the Tree Frog');
export const TrainMascotSticker = renderStickerPng('/assets/stickers/train_mascot.webp', 'Conductor Leo Mascot');
export const SpaceMascotSticker = renderStickerPng('/assets/stickers/space_mascot.webp', 'Orion the Astro-Pup Mascot');
export const OceanMascotSticker = renderStickerPng('/assets/stickers/ocean_mascot.webp', 'Scuba Diver Mascot');
export const RacingMascotSticker = renderStickerPng('/assets/stickers/racing_mascot.webp', 'Turbo Racer Mascot');
export const FairytaleMascotSticker = renderStickerPng('/assets/stickers/fairytale_mascot.webp', 'Stardust Unicorn Mascot');
export const TurtleLilyPadsSticker = renderStickerPng('/assets/stickers/turtle_lily_pads.webp', 'Quiet Break Lily Pads');
export const TurtlePondReedsSticker = renderStickerPng('/assets/stickers/turtle_pond_reeds.webp', 'Serene Lagoon & Reeds');
export const TurtleRiverStoneSticker = renderStickerPng('/assets/stickers/turtle_river_stone.webp', 'Smooth River Worry Stone');
export const TurtleWaterDropSticker = renderStickerPng('/assets/stickers/turtle_leaf_water_drop.webp', 'Leaf with Water Dewdrop');
export const TurtleWelcomeSignSticker = renderStickerPng('/assets/stickers/turtle_welcome_sign.webp', 'Welcome Sign with Vines');
export const TurtlePottedFernSticker = renderStickerPng('/assets/stickers/turtle_potted_fern.webp', 'Potted Fern Fronds');
export const TurtleArchedBridgeSticker = renderStickerPng('/assets/stickers/turtle_arched_bridge.webp', 'Arched Garden Bridge');
export const TurtleTracksSticker = renderStickerPng('/assets/stickers/turtle_tracks.webp', 'Webbed Turtle Footprints');
export const TurtleSeedlingSticker = renderStickerPng('/assets/stickers/turtle_sprouting_seedling.webp', 'Sprouting Seedling in Soil');
export const TurtleEggNestSticker = renderStickerPng('/assets/stickers/turtle_egg_nest.webp', 'Speckled Egg in Sand Nest');
export const TurtleSwimmingSticker = renderStickerPng('/assets/stickers/turtle_swimming.webp', 'Swimming Turtle (Pacing)');
export const TurtleShellBackpackSticker = renderStickerPng('/assets/stickers/turtle_shell_backpack.webp', 'Turtle Shell Backpack');
export const TurtleBambooToothbrushSticker = renderStickerPng('/assets/stickers/turtle_bamboo_toothbrush.webp', 'Bamboo Brush & Sea Sponge');
export const TurtleCloverBerryFeastSticker = renderStickerPng('/assets/stickers/turtle_clover_berry_feast.webp', 'Clover & Berry Feast');
export const TurtleCozyHoodieSticker = renderStickerPng('/assets/stickers/turtle_cozy_hoodie.webp', 'Cozy Turtle Hoodie');
export const TurtleWarmSpringBathSticker = renderStickerPng('/assets/stickers/turtle_warm_spring_bath.webp', 'Warm Spring Waterfall');
export const TurtleTreehouseGazeboSticker = renderStickerPng('/assets/stickers/turtle_treehouse_gazebo.webp', 'Canopy Treehouse Gazebo');
export const TurtleBambooFerrySticker = renderStickerPng('/assets/stickers/turtle_bamboo_ferry.webp', 'Tortoise Bamboo Ferry');
export const TurtleFireflyLanternBookSticker = renderStickerPng('/assets/stickers/turtle_firefly_lantern_book.webp', 'Firefly Lantern & Scroll');
export const TurtlePebblePaintPaletteSticker = renderStickerPng('/assets/stickers/turtle_pebble_paint_palette.webp', 'River Pebble Paint Palette');
export const TurtleHollowLogSlideSticker = renderStickerPng('/assets/stickers/turtle_hollow_log_slide.webp', 'Hollow Log Slide');
export const TurtleDawnBellClockSticker = renderStickerPng('/assets/stickers/turtle_dawn_bell_clock.webp', 'Bamboo Dawn Bell');
export const TurtleLeafSoapWashSticker = renderStickerPng('/assets/stickers/turtle_leaf_soap_wash.webp', 'Herbal Leaf Soap & Basin');
export const TurtleLotusDinnerBowlSticker = renderStickerPng('/assets/stickers/turtle_lotus_dinner_bowl.webp', 'Lotus Leaf Soup Bowl');
export const TurtleGardenFruitSnackSticker = renderStickerPng('/assets/stickers/turtle_garden_fruit_snack.webp', 'Sanctuary Fruit Basket');
export const TurtleSeagrassToyBoxSticker = renderStickerPng('/assets/stickers/turtle_seagrass_toy_box.webp', 'Seagrass Basket & Plush Turtle');
export const TurtleBambooPencilSticker = renderStickerPng('/assets/stickers/turtle_bamboo_pencil.webp', 'Bamboo Pencil & Leaf Pad');
export const TurtleShellHeadphonesSticker = renderStickerPng('/assets/stickers/turtle_shell_headphones.webp', 'Turtle Shell Ear Defenders');
export const TurtleSandTimerSticker = renderStickerPng('/assets/stickers/turtle_sand_timer.webp', 'Sanctuary Sand Timer');
export const TurtleBambooSpoonsSticker = renderStickerPng('/assets/stickers/turtle_bamboo_spoons.webp', 'Three Bamboo Spoons');
export const TurtleLotusTrophySticker = renderStickerPng('/assets/stickers/turtle_lotus_trophy.webp', 'Golden Lotus & Shell Trophy');
export const TurtleBambooRestroomSticker = renderStickerPng('/assets/stickers/turtle_bamboo_restroom.webp', 'Bamboo Washroom & Stones');
export const TurtleStarryPajamasSticker = renderStickerPng('/assets/stickers/turtle_starry_pajamas.webp', 'Cozy Starry Turtle Pajamas');
export const TurtleLagoonMoonSticker = renderStickerPng('/assets/stickers/turtle_lagoon_moon.webp', 'Crescent Moon Over Lagoon');
export const TurtleWoodenWheelSticker = renderStickerPng('/assets/stickers/turtle_wooden_wheel.webp', 'Wooden Lotus Spinner Wheel');
export const TurtleBambooThermometerSticker = renderStickerPng('/assets/stickers/turtle_bamboo_thermometer.webp', 'Bamboo Gauge & Heart');
export const TurtleLeafVitaminsSticker = renderStickerPng('/assets/stickers/turtle_leaf_vitamins.webp', 'Leaf Dish & Vitamins');
export const TurtleGuardianShieldSosSticker = renderStickerPng('/assets/stickers/turtle_guardian_shield_sos.webp', 'Guardian Turtle Shell Shield');
export const TurtleWoodenIdBadgeSticker = renderStickerPng('/assets/stickers/turtle_wooden_id_badge.webp', 'Wooden Explorer ID Badge');
export const TurtleBambooTabletSticker = renderStickerPng('/assets/stickers/turtle_bamboo_tablet.webp', 'Bamboo-Framed Tablet');
export const TurtleLeafSpeechBubblesSticker = renderStickerPng('/assets/stickers/turtle_leaf_speech_bubbles.webp', 'Leafy Speech Bubbles');
export const TurtleBambooKeyboardSticker = renderStickerPng('/assets/stickers/turtle_bamboo_keyboard.webp', 'Bamboo & Sage Keyboard');
export const TurtlePondFidgetBubblesSticker = renderStickerPng('/assets/stickers/turtle_pond_fidget_bubbles.webp', 'Pond Dewdrop Bubbles');
export const TurtleBotanicalFolderSticker = renderStickerPng('/assets/stickers/turtle_botanical_folder.webp', 'Botanical Field Folder');
export const TurtleTerrariumScienceSticker = renderStickerPng('/assets/stickers/turtle_terrarium_science.webp', 'Moss Terrarium & Magnifier');
export const TurtleBambooWindChimesSticker = renderStickerPng('/assets/stickers/turtle_bamboo_wind_chimes.webp', 'Bamboo Wind Chimes');
export const TurtleWoodenPuzzleSticker = renderStickerPng('/assets/stickers/turtle_wooden_puzzle.webp', 'Wooden Shell Puzzle Piece');
export const TurtleLeafCheckmarkSticker = renderStickerPng('/assets/stickers/turtle_leaf_checkmark.webp', 'Sanctuary Leaf Checkmark');
export const TurtleMossCottageHomeSticker = renderStickerPng('/assets/stickers/turtle_moss_cottage_home.webp', 'Moss-Roof Sanctuary Cottage');
export const TurtleWoodenLeafCartSticker = renderStickerPng('/assets/stickers/turtle_wooden_leaf_cart.webp', 'Leaf-Canopy Wooden Cart');
export const TurtleMeadowSunshineSticker = renderStickerPng('/assets/stickers/turtle_meadow_sunshine.webp', 'Warm Sun Over Lily-Pad Pond');
export const TurtleHatchlingPetCareSticker = renderStickerPng('/assets/stickers/turtle_hatchling_pet_care.webp', 'Baby Hatchling & Snail Friend');
export const TurtleGardenSandwichSticker = renderStickerPng('/assets/stickers/turtle_garden_sandwich.webp', 'Garden Herb Sandwich on Board');
export const TurtleBambooDrinkCupSticker = renderStickerPng('/assets/stickers/turtle_bamboo_drink_cup.webp', 'Bamboo Tumbler with Leaf Straw');
export const TurtleHerbalTeaMugSticker = renderStickerPng('/assets/stickers/turtle_herbal_tea_mug.webp', 'Carved Wooden Herbal Tea Mug');
export const TurtleReedLaundryBasketSticker = renderStickerPng('/assets/stickers/turtle_reed_laundry_basket.webp', 'Woven Reed Laundry Basket');
export const TurtleBambooCalendarSticker = renderStickerPng('/assets/stickers/turtle_bamboo_calendar.webp', 'Hanging Bamboo Checklist Board');
export const TurtleLagoonBreezeBreathSticker = renderStickerPng('/assets/stickers/turtle_lagoon_breeze_breath.webp', 'Lagoon Mist & Lotus Breeze');
export const TurtleMossBedSleepSticker = renderStickerPng('/assets/stickers/turtle_moss_bed_sleep.webp', 'Cozy Wooden Leaf-Blanket Bed');
export const TurtleReedExplorerShoesSticker = renderStickerPng('/assets/stickers/turtle_reed_explorer_shoes.webp', 'Woven Reed Explorer Slip-On Shoes');
export const TurtleBambooCutlerySticker = renderStickerPng('/assets/stickers/turtle_bamboo_cutlery.webp', 'Carved Bamboo Fork & Spoon Set');
export const TurtleBerryHoneyTreatSticker = renderStickerPng('/assets/stickers/turtle_berry_honey_treat.webp', 'Wrapped Leaf-Berry Sweet Snack');
export const TurtleShellWallClockSticker = renderStickerPng('/assets/stickers/turtle_shell_wall_clock.webp', 'Turtle-Shell Wall Clock with Leaf Hands');
export const TurtlePondRippleWaveSticker = renderStickerPng('/assets/stickers/turtle_pond_ripple_wave.webp', 'Gentle Pond Ripple & Lily Pad');
export const TurtleBambooEnergyMeterSticker = renderStickerPng('/assets/stickers/turtle_bamboo_energy_meter.webp', 'Bamboo Energy Tube Gauge');
export const TurtleWhisperingReedQuietSticker = renderStickerPng('/assets/stickers/turtle_whispering_reed_quiet.webp', 'Peaceful Whispering Reeds & Ripples');
export const TurtleHoneySeedBarSticker = renderStickerPng('/assets/stickers/turtle_honey_seed_bar.webp', 'Honey & Seed Snack Bar');
export const TurtleLotusFloatingLanternSticker = renderStickerPng('/assets/stickers/turtle_lotus_floating_lantern.webp', 'Hanging Lotus Blossom Lantern');
export const TurtleWovenGatheringCartSticker = renderStickerPng('/assets/stickers/turtle_woven_gathering_cart.webp', 'Woven Gathering Cart on Wheels');
export const TurtleDragonflyGlideSticker = renderStickerPng('/assets/stickers/turtle_dragonfly_glide.webp', 'Soaring Dragonfly over Reeds');
export const TurtleTimberExplorerTrunkSticker = renderStickerPng('/assets/stickers/turtle_timber_explorer_trunk.webp', 'Explorer Timber Travel Trunk');
export const TurtleWoodenTokenPassSticker = renderStickerPng('/assets/stickers/turtle_wooden_token_pass.webp', 'Carved Wooden Token Pass');
export const TurtleShadedCanopyLampSticker = renderStickerPng('/assets/stickers/turtle_shaded_canopy_lamp.webp', 'Shaded Firefly Canopy Lamp');
export const TurtleSoundSofteningShellSticker = renderStickerPng('/assets/stickers/turtle_sound_softening_shell.webp', 'Sound-Softening Spiral Shell');
export const TurtleCozyShellRetreatSticker = renderStickerPng('/assets/stickers/turtle_cozy_shell_retreat.webp', 'Cozy Shell Retreat');
export const TurtleMossPlayBallSticker = renderStickerPng('/assets/stickers/turtle_moss_play_ball.webp', 'Woven Moss Play Ball');
export const TurtleWaterChestnutTreatSticker = renderStickerPng('/assets/stickers/turtle_water_chestnut_treat.webp', 'Water Chestnut Treat');
export const TurtleWebbedPawStampSticker = renderStickerPng('/assets/stickers/turtle_webbed_paw_stamp.webp', 'Webbed Turtle Paw Stamp');
export const TurtleLogBonsaiPlanterSticker = renderStickerPng('/assets/stickers/turtle_log_bonsai_planter.webp', 'Log Bonsai Planter');
export const TurtleGroomingCombMirrorSticker = renderStickerPng('/assets/stickers/turtle_grooming_comb_mirror.webp', 'Shell Grooming Comb & Mirror');
export const TurtleElderHealerPouchSticker = renderStickerPng('/assets/stickers/turtle_elder_healer_pouch.webp', 'Elder Healer Herb Pouch');
export const TurtleSpringLagoonPoolSticker = renderStickerPng('/assets/stickers/turtle_spring_lagoon_pool.webp', 'Spring Water Basin Lagoon');
export const TurtleShadowPuppetTheaterSticker = renderStickerPng('/assets/stickers/turtle_shadow_puppet_theater.webp', 'Shadow Silhouette Theater');
export const TurtleRiverPebbleBowlingSticker = renderStickerPng('/assets/stickers/turtle_river_pebble_bowling.webp', 'River Pebble Bowling');
export const TurtleCanopyReedTentSticker = renderStickerPng('/assets/stickers/turtle_canopy_reed_tent.webp', 'Canopy Reed Tent');
export const TurtleHeritageArchivePavillionSticker = renderStickerPng('/assets/stickers/turtle_heritage_archive_pavillion.webp', 'Heritage Archive Pavilion');
export const TurtleMineralPolishingBasinSticker = renderStickerPng('/assets/stickers/turtle_mineral_polishing_basin.webp', 'Mineral Polishing Shell Basin');
export const RocketAdventureSticker = renderStickerPng('/assets/stickers/rocket_adventure.webp', 'Rocket Adventure Spotlight');

// User Provided Rewards & Milestone Badges
export const GuitarRockerSticker = renderStickerPng('/assets/stickers/guitar_rocker.webp', 'Electric Guitar');
export const DinoRexSticker = renderStickerPng('/assets/stickers/dino_rex.webp', 'Friendly Dinosaur');
export const AstronautHelmetSticker = renderStickerPng('/assets/stickers/astronaut_helmet.webp', 'Cosmic Astronaut Helmet');
export const MagicWandSticker = renderStickerPng('/assets/stickers/magic_wand.webp', 'Magic Star Wand');
export const GoldenTrainSticker = renderStickerPng('/assets/stickers/golden_train.webp', 'Golden Locomotive Train');
export const RainbowHeartSticker = renderStickerPng('/assets/stickers/rainbow_heart.webp', 'Rainbow Heart');
export const MorningSunriseSticker = renderStickerPng('/assets/stickers/morning_sunrise.webp', 'Morning Sunrise');

// Caregiver Tour & Section Stickers
export const SatelliteDishSticker = renderStickerPng('/assets/stickers/satellite_dish.webp', 'Satellite Dish Live Status');
export const SpokenMegaphoneSticker = renderStickerPng('/assets/stickers/spoken_megaphone.webp', 'Spoken Megaphone Nudge');
export const VoiceMicrophoneSticker = renderStickerPng('/assets/stickers/voice_microphone.webp', 'Voice Customization Microphone');
export const OfflineStorageSticker = renderStickerPng('/assets/stickers/offline_storage.webp', 'Offline Storage Readiness');
export const SecurityLockSticker = renderStickerPng('/assets/stickers/security_lock.webp', 'PIN Security Lock');

// Table A Confirmed Existing Illustrated Stickers
export const BookStorySticker = renderThemedStickerPng(
  '/assets/stickers/passport_book.webp',
  '/assets/stickers/turtle_firefly_lantern_book.webp',
  'Storybooks Reading'
);
export const CozyArmchairSticker = renderStickerPng('/assets/stickers/fav_quiet_break.webp', 'Cozy Armchair Break');
export const CozyBedSticker = renderThemedStickerPng(
  '/assets/stickers/bedtime_sleep.webp',
  '/assets/stickers/turtle_moss_bed_sleep.webp',
  'Cozy Bedroom Bed'
);
export const GreenTreeSticker = renderStickerPng('/assets/stickers/fav_outside.webp', 'Sunny Yard Green Tree');
export const GameControllerSticker = renderThemedStickerPng(
  '/assets/stickers/game_controller.webp',
  '/assets/stickers/turtle_game_controller.webp',
  'Video Game Controller',
  '/assets/stickers/dino_game_controller.webp',
  '/assets/stickers/frog_game_controller.webp',
  '/assets/stickers/train_game_controller.webp',
  '/assets/stickers/space_game_controller.webp'
);
export const BirthdayGiftBoxSticker = renderThemedStickerPng(
  '/assets/stickers/birthday_gift_box.webp',
  '/assets/stickers/turtle_birthday_gift_box.webp',
  'Birthday Gift Box',
  '/assets/stickers/dino_birthday_gift_box.webp',
  '/assets/stickers/frog_birthday_gift_box.webp',
  '/assets/stickers/train_birthday_gift_box.webp',
  '/assets/stickers/space_birthday_gift_box.webp'
);
export const BirthdayCakeSliceSticker = renderThemedStickerPng(
  '/assets/stickers/birthday_cake_slice.webp',
  '/assets/stickers/turtle_birthday_cake_slice.webp',
  'Birthday Cake Slice',
  '/assets/stickers/dino_birthday_cake_slice.webp',
  '/assets/stickers/frog_birthday_cake_slice.webp',
  '/assets/stickers/train_birthday_cake_slice.webp',
  '/assets/stickers/space_birthday_cake_slice.webp'
);
export const WaterBottleSticker = renderThemedStickerPng(
  '/assets/stickers/water_bottle.webp',
  '/assets/stickers/turtle_water_bottle.webp',
  'School Water Bottle',
  '/assets/stickers/dino_water_bottle.webp',
  '/assets/stickers/frog_water_bottle.webp',
  '/assets/stickers/train_water_bottle.webp',
  '/assets/stickers/space_water_bottle.webp'
);
export const PantsFoldedSticker = renderThemedStickerPng(
  '/assets/stickers/pants_folded.webp',
  '/assets/stickers/turtle_pants_folded.webp',
  'Folded Pants',
  '/assets/stickers/dino_pants_folded.webp',
  '/assets/stickers/frog_pants_folded.webp',
  '/assets/stickers/train_pants_folded.webp',
  '/assets/stickers/space_pants_folded.webp'
);
export const BirthdayCardSticker = renderThemedStickerPng(
  '/assets/stickers/birthday_card.webp',
  '/assets/stickers/turtle_birthday_card.webp',
  'Birthday Card',
  '/assets/stickers/dino_birthday_card.webp',
  '/assets/stickers/frog_birthday_card.webp',
  '/assets/stickers/train_birthday_card.webp',
  '/assets/stickers/space_birthday_card.webp'
);
export const LungsBreathingSticker = renderStickerPng('/assets/stickers/coping_lungs_breathing.webp', 'Deep Breathing Lungs');
export const RestNapSticker = renderStickerPng('/assets/stickers/fav_rest_tired.webp', 'Cozy Rest Nap');
export const SickFeverSticker = renderStickerPng('/assets/stickers/feelings_thermometer.webp', 'Feeling Unwell Fever');

// Table B User-Provided Outings, Coping, Pets & Wellness Stickers
export const PlanetSaturnSticker = renderStickerPng('/assets/stickers/planet_saturn.webp', 'Planet Saturn');
export const AutumnLeafSticker = renderStickerPng('/assets/stickers/autumn_leaf.webp', 'Autumn Leaf');
export const OceanWaveSticker = renderThemedStickerPng(
  '/assets/stickers/ocean_wave.webp',
  '/assets/stickers/turtle_pond_ripple_wave.webp',
  'Ocean Wave Overwhelmed'
);
export const BatteryMeterSticker = renderThemedStickerPng(
  '/assets/stickers/battery_meter.webp',
  '/assets/stickers/turtle_bamboo_energy_meter.webp',
  'Battery Meter'
);
export const PawPrintSticker = renderThemedStickerPng(
  '/assets/stickers/paw_print.webp',
  '/assets/stickers/turtle_webbed_paw_stamp.webp',
  'Pet Paw Print'
);
export const BoneTreatSticker = renderThemedStickerPng(
  '/assets/stickers/bone_treat.webp',
  '/assets/stickers/turtle_water_chestnut_treat.webp',
  'Dog Bone Treat'
);
export const TennisBallSticker = renderThemedStickerPng(
  '/assets/stickers/tennis_ball.webp',
  '/assets/stickers/turtle_moss_play_ball.webp',
  'Tennis Ball'
);
export const PottedPlantSticker = renderThemedStickerPng(
  '/assets/stickers/potted_plant.webp',
  '/assets/stickers/turtle_log_bonsai_planter.webp',
  'Potted Plant Care'
);
export const LaundryHamperSticker = renderThemedStickerPng(
  '/assets/stickers/laundry_hamper.webp',
  '/assets/stickers/turtle_reed_laundry_basket.webp',
  'Laundry Hamper'
);
export const ChocolateBarSticker = renderThemedStickerPng(
  '/assets/stickers/chocolate_bar.webp',
  '/assets/stickers/turtle_honey_seed_bar.webp',
  'Comfort Chocolate Bar'
);
export const RedBalloonSticker = renderThemedStickerPng(
  '/assets/stickers/red_balloon.webp',
  '/assets/stickers/turtle_lotus_floating_lantern.webp',
  'Red Balloon'
);
export const ShoppingCartSticker = renderThemedStickerPng(
  '/assets/stickers/shopping_cart.webp',
  '/assets/stickers/turtle_woven_gathering_cart.webp',
  'Supermarket Shopping Cart'
);
export const AirplaneFlightSticker = renderThemedStickerPng(
  '/assets/stickers/airplane_flight.webp',
  '/assets/stickers/turtle_dragonfly_glide.webp',
  'Passenger Airplane Flight'
);
export const TravelLuggageSticker = renderThemedStickerPng(
  '/assets/stickers/travel_luggage.webp',
  '/assets/stickers/turtle_timber_explorer_trunk.webp',
  'Travel Rolling Luggage'
);
export const BoardingTicketSticker = renderThemedStickerPng(
  '/assets/stickers/boarding_ticket.webp',
  '/assets/stickers/turtle_wooden_token_pass.webp',
  'Boarding Pass Ticket'
);
export const QuietVoiceSticker = renderThemedStickerPng(
  '/assets/stickers/quiet_voice.webp',
  '/assets/stickers/turtle_whispering_reed_quiet.webp',
  'Quiet Inside Voice'
);
export const HotCocoaSticker = renderThemedStickerPng(
  '/assets/stickers/hot_cocoa.webp',
  '/assets/stickers/turtle_herbal_tea_mug.webp',
  'Warm Hot Cocoa Mug'
);
export const JigsawPuzzleSticker = renderThemedStickerPng(
  '/assets/stickers/jigsaw_puzzle.webp',
  '/assets/stickers/turtle_wooden_puzzle.webp',
  'Jigsaw Puzzle Piece'
);

// Table C Sensory Triggers, Daily Care & Community Adventures (User Provided Sheets)
export const BrightLightsSticker = renderThemedStickerPng(
  '/assets/stickers/sensory_bright_lights.webp',
  '/assets/stickers/turtle_shaded_canopy_lamp.webp',
  'Bright Lights Sensory Trigger'
);
export const LoudNoiseSticker = renderThemedStickerPng(
  '/assets/stickers/sensory_loud_noise.webp',
  '/assets/stickers/turtle_sound_softening_shell.webp',
  'Loud Noise Sensitivity Trigger'
);
export const SocialMaskingSticker = renderThemedStickerPng(
  '/assets/stickers/sensory_social_masking.webp',
  '/assets/stickers/turtle_cozy_shell_retreat.webp',
  'Social Masking Fatigue'
);
export const LungsBreathingStickerNew = renderStickerPng('/assets/stickers/coping_lungs_breathing.webp', 'Deep Breathing Lungs Pacer');
export const WritingJournalSticker = renderStickerPng('/assets/stickers/routine_writing_journal.webp', 'Writing & Journaling');
export const MedicinePillSticker = renderThemedStickerPng(
  '/assets/stickers/routine_medicine_pill.webp',
  '/assets/stickers/turtle_leaf_vitamins.webp',
  'Daily Medication Pill'
);
export const ToiletRestroomSticker = renderThemedStickerPng(
  '/assets/stickers/routine_toilet_restroom.webp',
  '/assets/stickers/turtle_bamboo_restroom.webp',
  'Toilet Restroom'
);
export const WaterDropSticker = renderStickerPng('/assets/stickers/routine_water_drink.webp', 'Water Hydration Tracker');
export const HaircutSalonSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_haircut_salon.webp',
  '/assets/stickers/turtle_grooming_comb_mirror.webp',
  'Hair Salon Haircut'
);
export const DoctorCheckupSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_doctor_checkup.webp',
  '/assets/stickers/turtle_elder_healer_pouch.webp',
  'Doctor Check-Up'
);
export const SwimmingPoolSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_swimming_pool.webp',
  '/assets/stickers/turtle_spring_lagoon_pool.webp',
  'Swimming Pool Outing'
);
export const MovieCinemaSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_movie_cinema.webp',
  '/assets/stickers/turtle_shadow_puppet_theater.webp',
  'Movie Cinema Theater'
);
export const BowlingAlleySticker = renderThemedStickerPng(
  '/assets/stickers/adventure_bowling_alley.webp',
  '/assets/stickers/turtle_river_pebble_bowling.webp',
  'Bowling Alley Outing'
);
export const CampingTentSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_camping_tent.webp',
  '/assets/stickers/turtle_canopy_reed_tent.webp',
  'Camping Adventure Tent'
);
export const MuseumVisitSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_museum_visit.webp',
  '/assets/stickers/turtle_heritage_archive_pavillion.webp',
  'Museum Visit Columns'
);

// AAC Dedicated Category Badge Stickers
export const AacCoreSticker = renderStickerPng('/assets/stickers/aac_core.webp', 'Core Board');
export const AacSentencesSticker = renderStickerPng('/assets/stickers/aac_sentences.webp', 'Favorite Sentences');
export const AacFavoritesSticker = renderStickerPng('/assets/stickers/aac_favorites.webp', 'Favorites');
export const AacFoodSticker = renderStickerPng('/assets/stickers/aac_food.webp', 'Food');
export const AacDrinksSticker = renderStickerPng('/assets/stickers/aac_drinks.webp', 'Drinks');
export const AacActivitiesSticker = renderStickerPng('/assets/stickers/aac_activities.webp', 'Play & Fun');
export const AacPlacesSticker = renderStickerPng('/assets/stickers/aac_places.webp', 'Places');
export const AacPeopleSticker = renderStickerPng('/assets/stickers/aac_people.webp', 'People');
export const AacFeelingsSticker = renderStickerPng('/assets/stickers/aac_feelings.webp', 'Feelings');
export const AacSensorySticker = renderStickerPng('/assets/stickers/aac_sensory.webp', 'Sensory');
export const AacAllWordsSticker = renderStickerPng('/assets/stickers/aac_all_words.webp', 'All Words');

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
  '/assets/stickers/adventure_dentist.webp',
  '/assets/stickers/turtle_mineral_polishing_basin.webp',
  'Visiting the Dentist',
  '/assets/stickers/dino_trex_tooth_care.webp',
  '/assets/stickers/frog_lotus_dental_station.webp'
);
export const RestaurantAdventureSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_restaurant.webp',
  '/assets/stickers/turtle_clover_berry_feast.webp',
  'Eating at a Restaurant',
  '/assets/stickers/dino_feast_table_pavilion.webp',
  '/assets/stickers/frog_feast_table_pavilion.webp'
);
export const HaircutAdventureSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_haircut_salon.webp',
  '/assets/stickers/turtle_grooming_comb_mirror.webp',
  'Getting a Haircut',
  '/assets/stickers/dino_bone_comb_mirror.webp',
  '/assets/stickers/frog_grooming_comb_mirror.webp',
  '/assets/stickers/train_adventure_haircut.webp',
  '/assets/stickers/space_adventure_haircut.webp'
);
export const DoctorAdventureSticker = renderThemedStickerPng(
  '/assets/stickers/adventure_doctor_checkup.webp',
  '/assets/stickers/turtle_elder_healer_pouch.webp',
  'Doctor Check-Up',
  '/assets/stickers/dino_healer_stethoscope_bag.webp',
  '/assets/stickers/frog_healer_stethoscope_kit.webp',
  '/assets/stickers/train_stethoscope.webp',
  '/assets/stickers/space_stethoscope.webp'
);
export const PlansChangeStorySticker = renderThemedStickerPng(
  '/assets/stickers/story_plans_change.webp',
  '/assets/stickers/turtle_swimming_loop.webp',
  'When Plans Change',
  '/assets/stickers/dino_footprint_loop.webp',
  '/assets/stickers/frog_tadpole_swim_loop.webp',
  '/assets/stickers/train_circular_track.webp',
  '/assets/stickers/space_refresh_repeat.webp'
);
export const BirthdayStorySticker = renderThemedStickerPng(
  '/assets/stickers/story_birthday.webp',
  '/assets/stickers/turtle_clover_berry_feast.webp',
  'Going to a Birthday Party',
  '/assets/stickers/dino_forager_feast_bowl.webp',
  '/assets/stickers/frog_pond_birthday_feast.webp',
  '/assets/stickers/train_story_birthday.webp',
  '/assets/stickers/space_story_birthday.webp'
);
export const TakingTurnsStorySticker = renderThemedStickerPng(
  '/assets/stickers/story_sharing.webp',
  '/assets/stickers/turtle_seagrass_toy_box.webp',
  'Taking Turns with Toys',
  '/assets/stickers/dino_vine_toy_box.webp',
  '/assets/stickers/frog_seagrass_toy_box.webp',
  '/assets/stickers/train_toy_chest.webp',
  '/assets/stickers/space_game_controller.webp'
);
export const StethoscopeSticker = renderStickerPng('/assets/stickers/stethoscope.webp', 'Stethoscope / Doctor');
export const RainCloudSticker = renderStickerPng('/assets/stickers/rain_cloud.webp', 'Rainy Day');
export const PartlyCloudySticker = renderStickerPng('/assets/stickers/partly_cloudy.webp', 'Partly Cloudy');
export const CloudyWeatherSticker = renderStickerPng('/assets/stickers/cloudy_weather.webp', 'Overcast Cloudy Weather');
export const SnowWeatherSticker = renderStickerPng('/assets/stickers/snow_weather.webp', 'Snow & Flurries');
export const ThunderstormWeatherSticker = renderStickerPng('/assets/stickers/thunderstorm_weather.webp', 'Thunderstorm');
export const WindyWeatherSticker = renderStickerPng('/assets/stickers/windy_weather.webp', 'Windy Breeze');
export const FogMistWeatherSticker = renderStickerPng('/assets/stickers/fog_mist_weather.webp', 'Fog & Mist Weather');
export const RainbowWeatherSticker = renderStickerPng('/assets/stickers/rainbow_weather.webp', 'Rainbow Weather');
export const HomeHouseSticker = renderThemedStickerPng(
  '/assets/stickers/home_house.webp',
  '/assets/stickers/turtle_moss_cottage_home.webp',
  'Home House'
);
export const TaskDoneSticker = renderThemedStickerPng(
  '/assets/stickers/task_done.webp',
  '/assets/stickers/turtle_leaf_checkmark.webp',
  'Task Done Checkmark'
);
export const TherapyBrainSticker = renderStickerPng('/assets/stickers/therapy_brain.webp', 'Therapy & Sensory Brain');
export const SchoolBuildingSticker = renderThemedStickerPng(
  '/assets/stickers/school_building.webp',
  '/assets/stickers/turtle_treehouse_gazebo.webp',
  'School Building'
);
export const PizzaSliceSticker = renderStickerPng('/assets/stickers/pizza_slice.webp', 'Pizza Slice');
export const PlaygroundSwingsSticker = renderThemedStickerPng(
  '/assets/stickers/playground_swings.webp',
  '/assets/stickers/turtle_hollow_log_slide.webp',
  'Playground Swings'
);

// Morning Mood & Emotion Yellow Stickers
export const MoodHappySticker = renderThemedStickerPng(
  '/assets/stickers/mood_happy.webp',
  '/assets/stickers/turtle_mood_happy.webp',
  'Happy Mood'
);
export const MoodCalmSticker = renderThemedStickerPng(
  '/assets/stickers/mood_calm.webp',
  '/assets/stickers/turtle_mood_calm.webp',
  'Calm Mood'
);
export const MoodExcitedSticker = renderThemedStickerPng(
  '/assets/stickers/mood_excited.webp',
  '/assets/stickers/turtle_mood_excited.webp',
  'Excited Mood'
);
export const MoodSleepySticker = renderThemedStickerPng(
  '/assets/stickers/mood_sleepy.webp',
  '/assets/stickers/turtle_mood_sleepy.webp',
  'Sleepy Mood'
);
export const MoodUnsureSticker = renderThemedStickerPng(
  '/assets/stickers/mood_unsure.webp',
  '/assets/stickers/turtle_mood_unsure.webp',
  'Unsure Mood'
);

// Favorite Sentences Yellow Stickers
export const FavLegoSticker = renderThemedStickerPng(
  '/assets/stickers/fav_lego.webp',
  '/assets/stickers/turtle_zen_balancing_stones.webp',
  'Lego Blocks'
);
export const FavBathSticker = renderThemedStickerPng(
  '/assets/stickers/fav_bath.webp',
  '/assets/stickers/turtle_warm_spring_bath.webp',
  'Take a Bath'
);
export const FavSandwichSticker = renderThemedStickerPng(
  '/assets/stickers/fav_sandwich.webp',
  '/assets/stickers/turtle_garden_sandwich.webp',
  'Sandwich Snack'
);
export const FavWaterSticker = renderThemedStickerPng(
  '/assets/stickers/fav_water.webp',
  '/assets/stickers/turtle_bamboo_drink_cup.webp',
  'Drink Water'
);
export const FavQuietBreakSticker = renderThemedStickerPng(
  '/assets/stickers/fav_quiet_break.webp',
  '/assets/stickers/turtle_cozy_shell_retreat.webp',
  'Quiet Break'
);
export const FavHelpSosSticker = renderThemedStickerPng(
  '/assets/stickers/fav_help_sos.webp',
  '/assets/stickers/turtle_guardian_shield_sos.webp',
  'Help Please'
);
export const FavOutsideSticker = renderThemedStickerPng(
  '/assets/stickers/fav_outside.webp',
  '/assets/stickers/turtle_treehouse_gazebo.webp',
  'Go Outside'
);
export const FavLoveHeartSticker = renderThemedStickerPng(
  '/assets/stickers/fav_love_heart.webp',
  '/assets/stickers/turtle_shell_heart.webp',
  'I Love You'
);
export const FavRestTiredSticker = renderThemedStickerPng(
  '/assets/stickers/fav_rest_tired.webp',
  '/assets/stickers/turtle_moss_bed_sleep.webp',
  'Rest and Sleep'
);
export const FavMusicSticker = renderThemedStickerPng(
  '/assets/stickers/fav_music.webp',
  '/assets/stickers/turtle_bamboo_wind_chimes.webp',
  'Listen to Music'
);
export const FavStopSticker = renderThemedStickerPng(
  '/assets/stickers/fav_stop.webp',
  '/assets/stickers/turtle_stop_flipper.webp',
  'Stop Please'
);
export const FavHappySticker = renderStickerPng('/assets/stickers/fav_happy.webp', 'I Am Happy');

// User Provided Grounding, Cooking & Caregiver Response Stickers
export const EyeSeeSticker = renderStickerPng('/assets/stickers/eye_see.webp', 'Look Around Eye');
export const GroundingTouchHandSticker = renderStickerPng('/assets/stickers/grounding_touch_hand.webp', 'Touch Hand');
export const GroundingHearEarSticker = renderStickerPng('/assets/stickers/grounding_hear_ear.webp', 'Hear Ear');
export const GroundingSmellNoseSticker = renderStickerPng('/assets/stickers/grounding_smell_nose.webp', 'Smell Nose');
export const CookingPotSticker = renderStickerPng('/assets/stickers/cooking_pot.webp', 'Cooking Pan');
export const CaregiverResponseOkaySticker = renderStickerPng('/assets/stickers/caregiver_response_okay.webp', 'Caregiver Okay Thumbs Up');

export const TURTLE_STICKER_SWAPS: Record<string, string> = {
  '/assets/stickers/birthday_gift_box.webp': '/assets/stickers/turtle_birthday_gift_box.webp',
  '/assets/stickers/birthday_cake_slice.webp': '/assets/stickers/turtle_birthday_cake_slice.webp',
  '/assets/stickers/game_controller.webp': '/assets/stickers/turtle_game_controller.webp',
  '/assets/stickers/water_bottle.webp': '/assets/stickers/turtle_water_bottle.webp',
  '/assets/stickers/pants_folded.webp': '/assets/stickers/turtle_pants_folded.webp',
  '/assets/stickers/birthday_card.webp': '/assets/stickers/turtle_birthday_card.webp',
  // Adventure Step Mappings
  '/assets/stickers/home_house.webp': '/assets/stickers/turtle_moss_cottage_home.webp',
  '/assets/stickers/car_ride.webp': '/assets/stickers/turtle_bamboo_ferry.webp',
  '/assets/stickers/clipboard_shutdown.webp': '/assets/stickers/turtle_bamboo_tablet.webp',
  '/assets/stickers/cutlery_meal.webp': '/assets/stickers/turtle_bamboo_cutlery.webp',
  '/assets/stickers/hiking_trail_boots.webp': '/assets/stickers/turtle_reed_explorer_shoes.webp',
  '/assets/stickers/ocean_wave.webp': '/assets/stickers/turtle_pond_ripple_wave.webp',
  '/assets/stickers/speech_bubble.webp': '/assets/stickers/turtle_leaf_speech_bubbles.webp',
  '/assets/stickers/reward_trophy.webp': '/assets/stickers/turtle_lotus_trophy.webp',
  '/assets/stickers/star_gold.webp': '/assets/stickers/turtle_webbed_paw_stamp.webp',
  '/assets/stickers/aac_core.webp': '/assets/stickers/turtle_lily_pads.webp',
  '/assets/stickers/aac_sentences.webp': '/assets/stickers/turtle_leaf_speech_bubbles.webp',
  '/assets/stickers/aac_favorites.webp': '/assets/stickers/turtle_lotus_trophy.webp',
  '/assets/stickers/aac_food.webp': '/assets/stickers/turtle_garden_sandwich.webp',
  '/assets/stickers/aac_drinks.webp': '/assets/stickers/turtle_bamboo_drink_cup.webp',
  '/assets/stickers/aac_activities.webp': '/assets/stickers/turtle_game_controller.webp',
  '/assets/stickers/aac_places.webp': '/assets/stickers/turtle_moss_cottage_home.webp',
  '/assets/stickers/aac_people.webp': '/assets/stickers/turtle_child_persona_hatchling.webp',
  '/assets/stickers/aac_feelings.webp': '/assets/stickers/turtle_shell_heart.webp',
  '/assets/stickers/aac_sensory.webp': '/assets/stickers/turtle_shell_headphones.webp',
  '/assets/stickers/aac_all_words.webp': '/assets/stickers/turtle_botanical_folder.webp',
  '/assets/stickers/pizza_slice.webp': '/assets/stickers/turtle_clover_berry_feast.webp',
  '/assets/stickers/stethoscope.webp': '/assets/stickers/turtle_elder_healer_pouch.webp',
  '/assets/stickers/waiting_room_couch.webp': '/assets/stickers/turtle_waiting_room_couch.webp',
  '/assets/stickers/waving_hand_hello.webp': '/assets/stickers/turtle_waving_hand_hello.webp',
  '/assets/stickers/padded_recliner_chair.webp': '/assets/stickers/turtle_padded_recliner_chair.webp',
  '/assets/stickers/open_mouth_wide.webp': '/assets/stickers/turtle_open_mouth_wide.webp',
  '/assets/stickers/open_mouth_lion.webp': '/assets/stickers/turtle_open_mouth_wide.webp',
  '/assets/stickers/open_welcome_door.webp': '/assets/stickers/turtle_open_welcome_door.webp',
  '/assets/stickers/dining_table_booth.webp': '/assets/stickers/turtle_dining_table_booth.webp',
  '/assets/stickers/restaurant_menu_book.webp': '/assets/stickers/turtle_restaurant_menu_book.webp',
  '/assets/stickers/barbershop_pole.webp': '/assets/stickers/turtle_barbershop_pole.webp',
  '/assets/stickers/haircut_cape.webp': '/assets/stickers/turtle_haircut_cape.webp',
  '/assets/stickers/water_spray_bottle.webp': '/assets/stickers/turtle_water_spray_bottle.webp',
  '/assets/stickers/barber_neck_brush.webp': '/assets/stickers/turtle_barber_neck_brush.webp',
  '/assets/stickers/salon_hand_mirror.webp': '/assets/stickers/turtle_salon_hand_mirror.webp',
  '/assets/stickers/medical_clinic_building.webp': '/assets/stickers/turtle_medical_clinic_building.webp',
  '/assets/stickers/clinic_height_scale.webp': '/assets/stickers/turtle_clinic_height_scale.webp',
  '/assets/stickers/doctor_exam_bed.webp': '/assets/stickers/turtle_doctor_exam_bed.webp',
  '/assets/stickers/doctor_ear_light.webp': '/assets/stickers/turtle_doctor_ear_light.webp',
  '/assets/stickers/walking_pool_feet.webp': '/assets/stickers/turtle_walking_pool_feet.webp',
  '/assets/stickers/swim_goggles_floaties.webp': '/assets/stickers/turtle_swim_goggles_floaties.webp',
  '/assets/stickers/fluffy_beach_towel.webp': '/assets/stickers/turtle_fluffy_beach_towel.webp',
  '/assets/stickers/movie_projector_screen.webp': '/assets/stickers/turtle_movie_projector_screen.webp',
  '/assets/stickers/bowling_ball_holes.webp': '/assets/stickers/turtle_bowling_ball_holes.webp',
  '/assets/stickers/bowling_lane_bumpers.webp': '/assets/stickers/turtle_bowling_lane_bumpers.webp',
  '/assets/stickers/bowling_pins_strike.webp': '/assets/stickers/turtle_bowling_pins_strike.webp',
  '/assets/stickers/high_five_hands.webp': '/assets/stickers/turtle_high_five_hands.webp',
  '/assets/stickers/pine_trees_forest.webp': '/assets/stickers/turtle_pine_trees_forest.webp',
  '/assets/stickers/camping_sleeping_bag.webp': '/assets/stickers/turtle_camping_sleeping_bag.webp',
  '/assets/stickers/campfire_marshmallows.webp': '/assets/stickers/turtle_campfire_marshmallows.webp',
  '/assets/stickers/museum_paper_map.webp': '/assets/stickers/turtle_museum_paper_map.webp',
  '/assets/stickers/museum_dinosaur_fossil.webp': '/assets/stickers/turtle_museum_dinosaur_fossil.webp',
  '/assets/stickers/observing_magnifying_glass.webp': '/assets/stickers/turtle_observing_magnifying_glass.webp',
  // Batch 8 Swaps
  '/assets/stickers/tennis_ball.webp': '/assets/stickers/turtle_moss_play_ball.webp',
  '/assets/stickers/bone_treat.webp': '/assets/stickers/turtle_water_chestnut_treat.webp',
  '/assets/stickers/paw_print.webp': '/assets/stickers/turtle_webbed_paw_stamp.webp',
  '/assets/stickers/potted_plant.webp': '/assets/stickers/turtle_log_bonsai_planter.webp',
  '/assets/stickers/adventure_haircut_salon.webp': '/assets/stickers/turtle_grooming_comb_mirror.webp',
  '/assets/stickers/adventure_doctor_checkup.webp': '/assets/stickers/turtle_elder_healer_pouch.webp',
  '/assets/stickers/adventure_swimming_pool.webp': '/assets/stickers/turtle_spring_lagoon_pool.webp',
  '/assets/stickers/adventure_movie_cinema.webp': '/assets/stickers/turtle_shadow_puppet_theater.webp',
  '/assets/stickers/adventure_bowling_alley.webp': '/assets/stickers/turtle_river_pebble_bowling.webp',
  '/assets/stickers/adventure_camping_tent.webp': '/assets/stickers/turtle_canopy_reed_tent.webp',
  '/assets/stickers/adventure_museum_visit.webp': '/assets/stickers/turtle_heritage_archive_pavillion.webp',
  '/assets/stickers/adventure_dentist.webp': '/assets/stickers/turtle_mineral_polishing_basin.webp',
  // Previous Batches Swaps
  '/assets/stickers/alarm_clock.webp': '/assets/stickers/turtle_dawn_bell_clock.webp',
  '/assets/stickers/routine_toilet_restroom.webp': '/assets/stickers/turtle_bamboo_restroom.webp',
  '/assets/stickers/pancakes_breakfast.webp': '/assets/stickers/turtle_clover_berry_feast.webp',
  '/assets/stickers/backpack_school.webp': '/assets/stickers/turtle_shell_backpack.webp',
  '/assets/stickers/sneaker_shoes.webp': '/assets/stickers/turtle_reed_explorer_shoes.webp',
  '/assets/stickers/apple_snack.webp': '/assets/stickers/turtle_garden_fruit_snack.webp',
  '/assets/stickers/folder_schoolwork.webp': '/assets/stickers/turtle_botanical_folder.webp',
  '/assets/stickers/pencil_write.webp': '/assets/stickers/turtle_bamboo_pencil.webp',
  '/assets/stickers/teddy_bear.webp': '/assets/stickers/turtle_seagrass_toy_box.webp',
  '/assets/stickers/shower_wash.webp': '/assets/stickers/turtle_warm_spring_bath.webp',
  '/assets/stickers/school_bus.webp': '/assets/stickers/turtle_bamboo_ferry.webp',
  '/assets/stickers/science_flask.webp': '/assets/stickers/turtle_terrarium_science.webp',
  '/assets/stickers/art_palette.webp': '/assets/stickers/turtle_pebble_paint_palette.webp',
  '/assets/stickers/dinner_bowl.webp': '/assets/stickers/turtle_clover_berry_feast.webp',
  '/assets/stickers/bathtub_wash.webp': '/assets/stickers/turtle_warm_spring_bath.webp',
  '/assets/stickers/pajamas_sleep.webp': '/assets/stickers/turtle_starry_pajamas.webp',
  '/assets/stickers/circle_carpet.webp': '/assets/stickers/turtle_cozy_shell_retreat.webp',
  '/assets/stickers/teen_headphones.webp': '/assets/stickers/turtle_shell_headphones.webp',
  '/assets/stickers/schedule_calendar.webp': '/assets/stickers/turtle_bamboo_calendar.webp',
  '/assets/stickers/bedtime_sleep.webp': '/assets/stickers/turtle_moss_bed_sleep.webp',
  // New Handcrafted & Themed Turtle Replacements
  '/assets/stickers/language_globe.webp': '/assets/stickers/turtle_lagoon_globe.webp',
  '/assets/stickers/child_persona.webp': '/assets/stickers/turtle_child_persona_hatchling.webp',
  '/assets/stickers/adult_briefcase.webp': '/assets/stickers/turtle_bamboo_satchel_briefcase.webp',
  '/assets/stickers/caregiver_phone.webp': '/assets/stickers/turtle_wood_phone_caregiver.webp',
  '/assets/stickers/trial_crown.webp': '/assets/stickers/turtle_golden_shell_crown.webp',
  '/assets/stickers/refresh_repeat.webp': '/assets/stickers/turtle_swimming_loop.webp',
  '/assets/stickers/fav_love_heart.webp': '/assets/stickers/turtle_shell_heart.webp',
  '/assets/stickers/fav_outside.webp': '/assets/stickers/turtle_treehouse_gazebo.webp',
  '/assets/stickers/fav_lego.webp': '/assets/stickers/turtle_zen_balancing_stones.webp',
  '/assets/stickers/fav_stop.webp': '/assets/stickers/turtle_stop_flipper.webp',
  '/assets/stickers/mood_happy.webp': '/assets/stickers/turtle_mood_happy.webp',
  '/assets/stickers/mood_calm.webp': '/assets/stickers/turtle_mood_calm.webp',
  '/assets/stickers/mood_excited.webp': '/assets/stickers/turtle_mood_excited.webp',
  '/assets/stickers/mood_sleepy.webp': '/assets/stickers/turtle_mood_sleepy.webp',
  '/assets/stickers/mood_unsure.webp': '/assets/stickers/turtle_mood_unsure.webp',
  '/assets/stickers/routine_water_drink.webp': '/assets/stickers/turtle_bamboo_drink_cup.webp',
  '/assets/stickers/fav_water.webp': '/assets/stickers/turtle_bamboo_drink_cup.webp',
  '/assets/stickers/fav_quiet_break.webp': '/assets/stickers/turtle_cozy_shell_retreat.webp',
  '/assets/stickers/fav_rest_tired.webp': '/assets/stickers/turtle_moss_bed_sleep.webp',
  '/assets/stickers/locker_schedule.webp': '/assets/stickers/turtle_bamboo_calendar.webp',
  '/assets/stickers/hot_cocoa.webp': '/assets/stickers/turtle_herbal_tea_mug.webp',
  '/assets/stickers/laundry_hamper.webp': '/assets/stickers/turtle_reed_laundry_basket.webp',
  '/assets/stickers/chocolate_bar.webp': '/assets/stickers/turtle_honey_seed_bar.webp',
  '/assets/stickers/red_balloon.webp': '/assets/stickers/turtle_lotus_floating_lantern.webp',
  '/assets/stickers/shopping_cart.webp': '/assets/stickers/turtle_woven_gathering_cart.webp',
  '/assets/stickers/airplane_flight.webp': '/assets/stickers/turtle_dragonfly_glide.webp',
  '/assets/stickers/travel_luggage.webp': '/assets/stickers/turtle_timber_explorer_trunk.webp',
  '/assets/stickers/boarding_ticket.webp': '/assets/stickers/turtle_wooden_token_pass.webp',
  '/assets/stickers/quiet_voice.webp': '/assets/stickers/turtle_whispering_reed_quiet.webp',
  '/assets/stickers/jigsaw_puzzle.webp': '/assets/stickers/turtle_wooden_puzzle.webp',
  '/assets/stickers/sensory_bright_lights.webp': '/assets/stickers/turtle_shaded_canopy_lamp.webp',
  '/assets/stickers/sensory_loud_noise.webp': '/assets/stickers/turtle_sound_softening_shell.webp',
  '/assets/stickers/sensory_social_masking.webp': '/assets/stickers/turtle_cozy_shell_retreat.webp',
  '/assets/stickers/fidget_bubbles.webp': '/assets/stickers/turtle_pond_fidget_bubbles.webp',
  '/assets/stickers/breathing_cloud.webp': '/assets/stickers/turtle_lagoon_breeze_breath.webp',
  '/assets/stickers/decision_wheel.webp': '/assets/stickers/turtle_wooden_wheel.webp',
  '/assets/stickers/timer_clock.webp': '/assets/stickers/turtle_sand_timer.webp',
  '/assets/stickers/help_sos.webp': '/assets/stickers/turtle_guardian_shield_sos.webp',
  '/assets/stickers/about_id.webp': '/assets/stickers/turtle_wooden_id_badge.webp',
  '/assets/stickers/passport_book.webp': '/assets/stickers/turtle_firefly_lantern_book.webp',
  '/assets/stickers/quick_phrases.webp': '/assets/stickers/turtle_leaf_speech_bubbles.webp',
  '/assets/stickers/keyboard.webp': '/assets/stickers/turtle_bamboo_keyboard.webp',
  '/assets/stickers/feelings_thermometer.webp': '/assets/stickers/turtle_bamboo_thermometer.webp',
  '/assets/stickers/medications_health.webp': '/assets/stickers/turtle_leaf_vitamins.webp',
  '/assets/stickers/evening_moon.webp': '/assets/stickers/turtle_lagoon_moon.webp',
  '/assets/stickers/toothbrush.webp': '/assets/stickers/turtle_bamboo_toothbrush.webp',
  '/assets/stickers/toy_box.webp': '/assets/stickers/turtle_seagrass_toy_box.webp',
  '/assets/stickers/clothes_dressed.webp': '/assets/stickers/turtle_cozy_hoodie.webp',
  '/assets/stickers/soap_wash_hands.webp': '/assets/stickers/turtle_leaf_soap_wash.webp',
  '/assets/stickers/spoons_energy.webp': '/assets/stickers/turtle_bamboo_spoons.webp',
  '/assets/stickers/tablet_ipad.webp': '/assets/stickers/turtle_bamboo_tablet.webp',
  '/assets/stickers/caregiver_heart.webp': '/assets/stickers/turtle_shell_heart.webp',
  '/assets/stickers/eye_see.webp': '/assets/stickers/turtle_river_stone.webp',
  '/assets/stickers/drink_water.webp': '/assets/stickers/turtle_bamboo_drink_cup.webp',
  '/assets/stickers/adventure_restaurant.webp': '/assets/stickers/turtle_clover_berry_feast.webp',
  '/assets/stickers/story_plans_change.webp': '/assets/stickers/turtle_swimming_loop.webp',
  '/assets/stickers/plans_changed.webp': '/assets/stickers/turtle_swimming_loop.webp',
  '/assets/stickers/story_birthday.webp': '/assets/stickers/turtle_clover_berry_feast.webp',
  '/assets/stickers/story_sharing.webp': '/assets/stickers/turtle_seagrass_toy_box.webp',
  '/assets/stickers/sharing_toys.webp': '/assets/stickers/turtle_seagrass_toy_box.webp',
  '/assets/stickers/adventure_doctor.webp': '/assets/stickers/turtle_elder_healer_pouch.webp',
  '/assets/stickers/doctor_checkup.webp': '/assets/stickers/turtle_elder_healer_pouch.webp',
};

export const DINO_STICKER_SWAPS: Record<string, string> = {
  '/assets/stickers/birthday_gift_box.webp': '/assets/stickers/dino_birthday_gift_box.webp',
  '/assets/stickers/birthday_cake_slice.webp': '/assets/stickers/dino_birthday_cake_slice.webp',
  '/assets/stickers/game_controller.webp': '/assets/stickers/dino_game_controller.webp',
  '/assets/stickers/water_bottle.webp': '/assets/stickers/dino_water_bottle.webp',
  '/assets/stickers/pants_folded.webp': '/assets/stickers/dino_pants_folded.webp',
  '/assets/stickers/birthday_card.webp': '/assets/stickers/dino_birthday_card.webp',
  // Adventure Step Mappings
  '/assets/stickers/home_house.webp': '/assets/stickers/dino_cavern_retreat.webp',
  '/assets/stickers/clipboard_shutdown.webp': '/assets/stickers/dino_slate_tablet_ipad.webp',
  '/assets/stickers/cutlery_meal.webp': '/assets/stickers/dino_bone_cutlery_fork_spoon.webp',
  '/assets/stickers/hiking_trail_boots.webp': '/assets/stickers/dino_trail_explorer_boots.webp',
  '/assets/stickers/speech_bubble.webp': '/assets/stickers/dino_jungle_speech_bubbles.webp',
  '/assets/stickers/stethoscope.webp': '/assets/stickers/dino_healer_stethoscope_bag.webp',
  '/assets/stickers/pizza_slice.webp': '/assets/stickers/dino_forager_feast_bowl.webp',
  '/assets/stickers/boarding_ticket.webp': '/assets/stickers/dino_expedition_log_book.webp',
  '/assets/stickers/waiting_room_couch.webp': '/assets/stickers/dino_waiting_room_couch.webp',
  '/assets/stickers/waving_hand_hello.webp': '/assets/stickers/dino_waving_hand_hello.webp',
  '/assets/stickers/padded_recliner_chair.webp': '/assets/stickers/dino_padded_recliner_chair.webp',
  '/assets/stickers/open_mouth_wide.webp': '/assets/stickers/dino_open_mouth_wide.webp',
  '/assets/stickers/open_mouth_lion.webp': '/assets/stickers/dino_open_mouth_wide.webp',
  '/assets/stickers/open_welcome_door.webp': '/assets/stickers/dino_open_welcome_door.webp',
  '/assets/stickers/dining_table_booth.webp': '/assets/stickers/dino_dining_table_booth.webp',
  '/assets/stickers/restaurant_menu_book.webp': '/assets/stickers/dino_restaurant_menu_book.webp',
  '/assets/stickers/barbershop_pole.webp': '/assets/stickers/dino_barbershop_pole.webp',
  '/assets/stickers/haircut_cape.webp': '/assets/stickers/dino_haircut_cape.webp',
  '/assets/stickers/water_spray_bottle.webp': '/assets/stickers/dino_water_spray_bottle.webp',
  '/assets/stickers/barber_neck_brush.webp': '/assets/stickers/dino_barber_neck_brush.webp',
  '/assets/stickers/salon_hand_mirror.webp': '/assets/stickers/dino_salon_hand_mirror.webp',
  '/assets/stickers/medical_clinic_building.webp': '/assets/stickers/dino_medical_clinic_building.webp',
  '/assets/stickers/clinic_height_scale.webp': '/assets/stickers/dino_clinic_height_scale.webp',
  '/assets/stickers/doctor_exam_bed.webp': '/assets/stickers/dino_doctor_exam_bed.webp',
  '/assets/stickers/doctor_ear_light.webp': '/assets/stickers/dino_doctor_ear_light.webp',
  '/assets/stickers/walking_pool_feet.webp': '/assets/stickers/dino_walking_pool_feet.webp',
  '/assets/stickers/swim_goggles_floaties.webp': '/assets/stickers/dino_swim_goggles_floaties.webp',
  '/assets/stickers/fluffy_beach_towel.webp': '/assets/stickers/dino_fluffy_beach_towel.webp',
  '/assets/stickers/movie_projector_screen.webp': '/assets/stickers/dino_movie_projector_screen.webp',
  '/assets/stickers/bowling_ball_holes.webp': '/assets/stickers/dino_bowling_ball_holes.webp',
  '/assets/stickers/bowling_lane_bumpers.webp': '/assets/stickers/dino_bowling_lane_bumpers.webp',
  '/assets/stickers/bowling_pins_strike.webp': '/assets/stickers/dino_bowling_pins_strike.webp',
  '/assets/stickers/high_five_hands.webp': '/assets/stickers/dino_high_five_hands.webp',
  '/assets/stickers/pine_trees_forest.webp': '/assets/stickers/dino_pine_trees_forest.webp',
  '/assets/stickers/camping_sleeping_bag.webp': '/assets/stickers/dino_camping_sleeping_bag.webp',
  '/assets/stickers/campfire_marshmallows.webp': '/assets/stickers/dino_campfire_marshmallows.webp',
  '/assets/stickers/museum_paper_map.webp': '/assets/stickers/dino_museum_paper_map.webp',
  '/assets/stickers/museum_dinosaur_fossil.webp': '/assets/stickers/dino_museum_dinosaur_fossil.webp',
  '/assets/stickers/observing_magnifying_glass.webp': '/assets/stickers/dino_observing_magnifying_glass.webp',
  // Batch 1: Core Routines & Favorites
  '/assets/stickers/routine_water_drink.webp': '/assets/stickers/dino_stone_tumbler_water.webp',
  '/assets/stickers/drink_water.webp': '/assets/stickers/dino_stone_tumbler_water.webp',
  '/assets/stickers/fav_water.webp': '/assets/stickers/dino_stone_tumbler_water.webp',
  '/assets/stickers/drink_cup.webp': '/assets/stickers/dino_stone_tumbler_water.webp',
  '/assets/stickers/bedtime_sleep.webp': '/assets/stickers/dino_fern_nest_sleep.webp',
  '/assets/stickers/fav_rest_tired.webp': '/assets/stickers/dino_fern_nest_sleep.webp',
  '/assets/stickers/fav_quiet_break.webp': '/assets/stickers/dino_cavern_retreat.webp',
  '/assets/stickers/breathing_cloud.webp': '/assets/stickers/dino_cavern_retreat.webp',
  '/assets/stickers/alarm_clock.webp': '/assets/stickers/dino_sundial_clock.webp',
  '/assets/stickers/clothes_dressed.webp': '/assets/stickers/dino_spike_hoodie.webp',
  '/assets/stickers/soap_wash_hands.webp': '/assets/stickers/dino_amber_soap.webp',
  '/assets/stickers/toothbrush.webp': '/assets/stickers/dino_bone_toothbrush.webp',
  '/assets/stickers/dinner_bowl.webp': '/assets/stickers/dino_forager_feast_bowl.webp',
  '/assets/stickers/pancakes_breakfast.webp': '/assets/stickers/dino_forager_feast_bowl.webp',
  '/assets/stickers/backpack_school.webp': '/assets/stickers/dino_expedition_backpack.webp',
  '/assets/stickers/fav_lego.webp': '/assets/stickers/dino_wooden_stacking_blocks.webp',
  '/assets/stickers/fav_outside.webp': '/assets/stickers/dino_cycad_palm_tree.webp',
  '/assets/stickers/fav_love_heart.webp': '/assets/stickers/dino_triceratops_frill_heart.webp',
  '/assets/stickers/fav_bath.webp': '/assets/stickers/dino_warm_spring_bath.webp',
  '/assets/stickers/bath_time.webp': '/assets/stickers/dino_warm_spring_bath.webp',
  '/assets/stickers/fav_help_sos.webp': '/assets/stickers/dino_ankylosaurus_shield_sos.webp',
  '/assets/stickers/help_sos.webp': '/assets/stickers/dino_ankylosaurus_shield_sos.webp',
  '/assets/stickers/schedule_calendar.webp': '/assets/stickers/dino_slate_checklist_tablet.webp',
  '/assets/stickers/locker_schedule.webp': '/assets/stickers/dino_slate_checklist_tablet.webp',
  // Batch 2: Moods, Personas, School & Hubs
  '/assets/stickers/mood_happy.webp': '/assets/stickers/dino_mood_happy.webp',
  '/assets/stickers/fav_happy.webp': '/assets/stickers/dino_mood_happy.webp',
  '/assets/stickers/mood_calm.webp': '/assets/stickers/dino_mood_calm.webp',
  '/assets/stickers/mood_excited.webp': '/assets/stickers/dino_mood_excited.webp',
  '/assets/stickers/mood_sleepy.webp': '/assets/stickers/dino_mood_sleepy.webp',
  '/assets/stickers/mood_unsure.webp': '/assets/stickers/dino_mood_unsure.webp',
  '/assets/stickers/fav_stop.webp': '/assets/stickers/dino_stop_stamp.webp',
  '/assets/stickers/fav_music.webp': '/assets/stickers/dino_bamboo_flute_music.webp',
  '/assets/stickers/music_sensory.webp': '/assets/stickers/dino_bamboo_flute_music.webp',
  '/assets/stickers/fav_sandwich.webp': '/assets/stickers/dino_flatbread_sandwich.webp',
  '/assets/stickers/child_persona.webp': '/assets/stickers/dino_child_persona_rex.webp',
  '/assets/stickers/teen_headphones.webp': '/assets/stickers/dino_ammonite_headphones.webp',
  '/assets/stickers/adult_briefcase.webp': '/assets/stickers/dino_expedition_satchel_briefcase.webp',
  '/assets/stickers/caregiver_phone.webp': '/assets/stickers/dino_slate_phone_caregiver.webp',
  '/assets/stickers/language_globe.webp': '/assets/stickers/dino_pangea_globe.webp',
  '/assets/stickers/trial_crown.webp': '/assets/stickers/dino_golden_amber_crown.webp',
  '/assets/stickers/refresh_repeat.webp': '/assets/stickers/dino_footprint_loop.webp',
  // Batch 3: School, Coping Tools & Activities
  '/assets/stickers/school_bus.webp': '/assets/stickers/dino_safari_wagon_bus.webp',
  '/assets/stickers/science_flask.webp': '/assets/stickers/dino_volcano_flask_science.webp',
  '/assets/stickers/art_palette.webp': '/assets/stickers/dino_slate_art_palette.webp',
  '/assets/stickers/art_crafts.webp': '/assets/stickers/dino_slate_art_palette.webp',
  '/assets/stickers/pencil_write.webp': '/assets/stickers/dino_bone_stylus_pencil.webp',
  '/assets/stickers/homework_study.webp': '/assets/stickers/dino_bone_stylus_pencil.webp',
  '/assets/stickers/folder_schoolwork.webp': '/assets/stickers/dino_palm_leaf_folio.webp',
  '/assets/stickers/playground_swings.webp': '/assets/stickers/dino_brachiosaurus_slide_swings.webp',
  '/assets/stickers/playground_recess.webp': '/assets/stickers/dino_brachiosaurus_slide_swings.webp',
  '/assets/stickers/apple_snack.webp': '/assets/stickers/dino_starfruit_apple_snack.webp',
  '/assets/stickers/pajamas_sleep.webp': '/assets/stickers/dino_starry_pajamas_sleep.webp',
  '/assets/stickers/pajamas_shorts.webp': '/assets/stickers/dino_starry_pajamas_sleep.webp',
  '/assets/stickers/car_ride.webp': '/assets/stickers/dino_wooden_cart_ride.webp',
  '/assets/stickers/tablet_ipad.webp': '/assets/stickers/dino_slate_tablet_ipad.webp',
  '/assets/stickers/toy_box.webp': '/assets/stickers/dino_vine_toy_box.webp',
  '/assets/stickers/spoons_energy.webp': '/assets/stickers/dino_bone_stamina_spoons.webp',
  '/assets/stickers/fidget_bubbles.webp': '/assets/stickers/dino_spring_sensory_bubbles.webp',
  '/assets/stickers/decision_wheel.webp': '/assets/stickers/dino_stone_decision_wheel.webp',
  '/assets/stickers/clock_time.webp': '/assets/stickers/dino_ammonite_spiral_clock.webp',
  // Batch 4: Communication Hubs, Outings & Daily Activities
  '/assets/stickers/about_id.webp': '/assets/stickers/dino_explorer_id_badge.webp',
  '/assets/stickers/adventure_dentist.webp': '/assets/stickers/dino_trex_tooth_care.webp',
  '/assets/stickers/feelings_thermometer.webp': '/assets/stickers/dino_volcano_thermometer.webp',
  '/assets/stickers/timer_clock.webp': '/assets/stickers/dino_stone_stopwatch.webp',
  '/assets/stickers/aac_core.webp': '/assets/stickers/dino_amber_star_core.webp',
  '/assets/stickers/aac_sentences.webp': '/assets/stickers/dino_jungle_speech_bubbles.webp',
  '/assets/stickers/aac_favorites.webp': '/assets/stickers/dino_amber_fossil_trophy.webp',
  '/assets/stickers/aac_food.webp': '/assets/stickers/dino_flatbread_sandwich.webp',
  '/assets/stickers/aac_drinks.webp': '/assets/stickers/dino_stone_tumbler_water.webp',
  '/assets/stickers/aac_activities.webp': '/assets/stickers/dino_game_controller.webp',
  '/assets/stickers/aac_places.webp': '/assets/stickers/dino_cavern_retreat.webp',
  '/assets/stickers/aac_people.webp': '/assets/stickers/dino_child_persona_rex.webp',
  '/assets/stickers/aac_feelings.webp': '/assets/stickers/dino_triceratops_frill_heart.webp',
  '/assets/stickers/aac_sensory.webp': '/assets/stickers/dino_ammonite_headphones.webp',
  '/assets/stickers/aac_all_words.webp': '/assets/stickers/dino_palm_leaf_folio.webp',
  '/assets/stickers/star_gold.webp': '/assets/stickers/dino_amber_star_core.webp',
  '/assets/stickers/passport_book.webp': '/assets/stickers/dino_expedition_log_book.webp',
  '/assets/stickers/quick_phrases.webp': '/assets/stickers/dino_jungle_speech_bubbles.webp',
  '/assets/stickers/keyboard.webp': '/assets/stickers/dino_carved_slate_keyboard.webp',
  '/assets/stickers/caregiver_heart.webp': '/assets/stickers/dino_caregiver_heart.webp',
  '/assets/stickers/eye_see.webp': '/assets/stickers/dino_sensory_eye_stone.webp',
  '/assets/stickers/hot_cocoa.webp': '/assets/stickers/dino_herbal_tea_mug.webp',
  '/assets/stickers/laundry_hamper.webp': '/assets/stickers/dino_reed_laundry_basket.webp',
  '/assets/stickers/chocolate_bar.webp': '/assets/stickers/dino_seed_honey_bar.webp',
  '/assets/stickers/travel_luggage.webp': '/assets/stickers/dino_expedition_timber_trunk.webp',
  '/assets/stickers/quiet_voice.webp': '/assets/stickers/dino_whispering_baby_shh.webp',
  // Batch 5: Outings, Routines, Health & Sensory Triggers
  '/assets/stickers/routine_toilet_restroom.webp': '/assets/stickers/dino_stone_washroom_basin.webp',
  '/assets/stickers/sneaker_shoes.webp': '/assets/stickers/dino_trail_explorer_boots.webp',
  '/assets/stickers/evening_moon.webp': '/assets/stickers/dino_prehistoric_moon.webp',
  '/assets/stickers/medications_health.webp': '/assets/stickers/dino_herbal_wellness_vial.webp',
  '/assets/stickers/adventure_doctor_checkup.webp': '/assets/stickers/dino_healer_stethoscope_bag.webp',
  '/assets/stickers/adventure_haircut_salon.webp': '/assets/stickers/dino_bone_comb_mirror.webp',
  '/assets/stickers/adventure_camping_tent.webp': '/assets/stickers/dino_expedition_camp_tent.webp',
  '/assets/stickers/adventure_swimming_pool.webp': '/assets/stickers/dino_geothermal_spring_pool.webp',
  '/assets/stickers/adventure_movie_cinema.webp': '/assets/stickers/dino_shadow_puppet_lantern.webp',
  '/assets/stickers/sensory_loud_noise.webp': '/assets/stickers/dino_ammonite_ear_defenders.webp',
  '/assets/stickers/sensory_bright_lights.webp': '/assets/stickers/dino_sun_hat_shades.webp',
  '/assets/stickers/sensory_social_masking.webp': '/assets/stickers/dino_secret_cavern_den.webp',
  '/assets/stickers/bone_treat.webp': '/assets/stickers/dino_fossil_bone_treat.webp',
  '/assets/stickers/shopping_cart.webp': '/assets/stickers/dino_wooden_gathering_wagon.webp',
  '/assets/stickers/airplane_flight.webp': '/assets/stickers/dino_pterodactyl_flight.webp',
  '/assets/stickers/shower_wash.webp': '/assets/stickers/dino_warm_spring_bath.webp',
  '/assets/stickers/bathtub_wash.webp': '/assets/stickers/dino_warm_spring_bath.webp',
  // Batch 6: Activities, Rewards, Pets & Outings
  '/assets/stickers/teddy_bear.webp': '/assets/stickers/dino_plush_stego_toy.webp',
  '/assets/stickers/pet_care.webp': '/assets/stickers/dino_hatchling_pet_bowl.webp',
  '/assets/stickers/outdoor_sun.webp': '/assets/stickers/dino_primeval_sun_canopy.webp',
  '/assets/stickers/reward_trophy.webp': '/assets/stickers/dino_amber_fossil_trophy.webp',
  '/assets/stickers/candy_treat.webp': '/assets/stickers/dino_leaf_berry_treat.webp',
  '/assets/stickers/fork_knife.webp': '/assets/stickers/dino_bone_cutlery_fork_spoon.webp',
  '/assets/stickers/ocean_wave.webp': '/assets/stickers/dino_tidal_ripple_wave.webp',
  '/assets/stickers/battery_meter.webp': '/assets/stickers/dino_amber_energy_gauge.webp',
  '/assets/stickers/paw_print.webp': '/assets/stickers/dino_track_paw_print.webp',
  '/assets/stickers/tennis_ball.webp': '/assets/stickers/dino_woven_moss_play_ball.webp',
  '/assets/stickers/potted_plant.webp': '/assets/stickers/dino_fern_log_planter.webp',
  '/assets/stickers/adventure_bowling_alley.webp': '/assets/stickers/dino_stone_pebble_bowling.webp',
  '/assets/stickers/adventure_museum_visit.webp': '/assets/stickers/dino_amber_museum_archive.webp',
  '/assets/stickers/adventure_restaurant.webp': '/assets/stickers/dino_feast_table_pavilion.webp',
  '/assets/stickers/jigsaw_puzzle.webp': '/assets/stickers/dino_fossil_puzzle_piece.webp',
  '/assets/stickers/story_plans_change.webp': '/assets/stickers/dino_footprint_loop.webp',
  '/assets/stickers/plans_changed.webp': '/assets/stickers/dino_footprint_loop.webp',
  '/assets/stickers/story_birthday.webp': '/assets/stickers/dino_forager_feast_bowl.webp',
  '/assets/stickers/story_sharing.webp': '/assets/stickers/dino_vine_toy_box.webp',
  '/assets/stickers/sharing_toys.webp': '/assets/stickers/dino_vine_toy_box.webp',
  '/assets/stickers/adventure_doctor.webp': '/assets/stickers/dino_healer_stethoscope_bag.webp',
  '/assets/stickers/doctor_checkup.webp': '/assets/stickers/dino_healer_stethoscope_bag.webp',
};

export const FROG_STICKER_SWAPS: Record<string, string> = {
  '/assets/stickers/birthday_gift_box.webp': '/assets/stickers/frog_birthday_gift_box.webp',
  '/assets/stickers/birthday_cake_slice.webp': '/assets/stickers/frog_birthday_cake_slice.webp',
  '/assets/stickers/game_controller.webp': '/assets/stickers/frog_game_controller.webp',
  '/assets/stickers/water_bottle.webp': '/assets/stickers/frog_water_bottle.webp',
  '/assets/stickers/pants_folded.webp': '/assets/stickers/frog_pants_folded.webp',
  '/assets/stickers/birthday_card.webp': '/assets/stickers/frog_birthday_card.webp',
  // Adventure Step Mappings
  '/assets/stickers/home_house.webp': '/assets/stickers/frog_willow_hollow_retreat.webp',
  '/assets/stickers/clipboard_shutdown.webp': '/assets/stickers/frog_bamboo_tablet_ipad.webp',
  '/assets/stickers/cutlery_meal.webp': '/assets/stickers/frog_bamboo_cutlery.webp',
  '/assets/stickers/hiking_trail_boots.webp': '/assets/stickers/frog_reed_explorer_shoes.webp',
  '/assets/stickers/speech_bubble.webp': '/assets/stickers/frog_lily_speech_bubbles.webp',
  '/assets/stickers/stethoscope.webp': '/assets/stickers/frog_healer_stethoscope_kit.webp',
  '/assets/stickers/pizza_slice.webp': '/assets/stickers/frog_pond_harvest_bowl.webp',
  '/assets/stickers/boarding_ticket.webp': '/assets/stickers/frog_reed_checklist_board.webp',
  '/assets/stickers/waiting_room_couch.webp': '/assets/stickers/frog_waiting_room_couch.webp',
  '/assets/stickers/waving_hand_hello.webp': '/assets/stickers/frog_waving_hand_hello.webp',
  '/assets/stickers/padded_recliner_chair.webp': '/assets/stickers/frog_padded_recliner_chair.webp',
  '/assets/stickers/open_mouth_wide.webp': '/assets/stickers/frog_open_mouth_wide.webp',
  '/assets/stickers/open_mouth_lion.webp': '/assets/stickers/frog_open_mouth_wide.webp',
  '/assets/stickers/open_welcome_door.webp': '/assets/stickers/frog_open_welcome_door.webp',
  '/assets/stickers/dining_table_booth.webp': '/assets/stickers/frog_dining_table_booth.webp',
  '/assets/stickers/restaurant_menu_book.webp': '/assets/stickers/frog_restaurant_menu_book.webp',
  '/assets/stickers/barbershop_pole.webp': '/assets/stickers/frog_barbershop_pole.webp',
  '/assets/stickers/haircut_cape.webp': '/assets/stickers/frog_haircut_cape.webp',
  '/assets/stickers/water_spray_bottle.webp': '/assets/stickers/frog_water_spray_bottle.webp',
  '/assets/stickers/barber_neck_brush.webp': '/assets/stickers/frog_barber_neck_brush.webp',
  '/assets/stickers/salon_hand_mirror.webp': '/assets/stickers/frog_salon_hand_mirror.webp',
  '/assets/stickers/medical_clinic_building.webp': '/assets/stickers/frog_medical_clinic_building.webp',
  '/assets/stickers/clinic_height_scale.webp': '/assets/stickers/frog_clinic_height_scale.webp',
  '/assets/stickers/doctor_exam_bed.webp': '/assets/stickers/frog_doctor_exam_bed.webp',
  '/assets/stickers/doctor_ear_light.webp': '/assets/stickers/frog_doctor_ear_light.webp',
  '/assets/stickers/walking_pool_feet.webp': '/assets/stickers/frog_walking_pool_feet.webp',
  '/assets/stickers/swim_goggles_floaties.webp': '/assets/stickers/frog_swim_goggles_floaties.webp',
  '/assets/stickers/fluffy_beach_towel.webp': '/assets/stickers/frog_fluffy_beach_towel.webp',
  '/assets/stickers/movie_projector_screen.webp': '/assets/stickers/frog_movie_projector_screen.webp',
  '/assets/stickers/bowling_ball_holes.webp': '/assets/stickers/frog_bowling_ball_holes.webp',
  '/assets/stickers/bowling_lane_bumpers.webp': '/assets/stickers/frog_bowling_lane_bumpers.webp',
  '/assets/stickers/bowling_pins_strike.webp': '/assets/stickers/frog_bowling_pins_strike.webp',
  '/assets/stickers/high_five_hands.webp': '/assets/stickers/frog_high_five_hands.webp',
  '/assets/stickers/pine_trees_forest.webp': '/assets/stickers/frog_pine_trees_forest.webp',
  '/assets/stickers/camping_sleeping_bag.webp': '/assets/stickers/frog_camping_sleeping_bag.webp',
  '/assets/stickers/campfire_marshmallows.webp': '/assets/stickers/frog_campfire_marshmallows.webp',
  '/assets/stickers/museum_paper_map.webp': '/assets/stickers/frog_museum_paper_map.webp',
  '/assets/stickers/museum_dinosaur_fossil.webp': '/assets/stickers/frog_museum_dinosaur_fossil.webp',
  '/assets/stickers/observing_magnifying_glass.webp': '/assets/stickers/frog_observing_magnifying_glass.webp',
  // Batch 1: Core Daily Routines, Hubs & Wellness
  '/assets/stickers/routine_water_drink.webp': '/assets/stickers/frog_dewdrop_bamboo_cup.webp',
  '/assets/stickers/drink_water.webp': '/assets/stickers/frog_dewdrop_bamboo_cup.webp',
  '/assets/stickers/fav_water.webp': '/assets/stickers/frog_dewdrop_bamboo_cup.webp',
  '/assets/stickers/drink_cup.webp': '/assets/stickers/frog_dewdrop_bamboo_cup.webp',
  '/assets/stickers/bedtime_sleep.webp': '/assets/stickers/frog_lily_bed_sleep.webp',
  '/assets/stickers/fav_rest_tired.webp': '/assets/stickers/frog_lily_bed_sleep.webp',
  '/assets/stickers/fav_quiet_break.webp': '/assets/stickers/frog_willow_retreat_calm.webp',
  '/assets/stickers/breathing_cloud.webp': '/assets/stickers/frog_willow_retreat_calm.webp',
  '/assets/stickers/alarm_clock.webp': '/assets/stickers/frog_lotus_bell_clock.webp',
  '/assets/stickers/clothes_dressed.webp': '/assets/stickers/frog_raincoat_hoodie.webp',
  '/assets/stickers/soap_wash_hands.webp': '/assets/stickers/frog_lily_pad_soap.webp',
  '/assets/stickers/toothbrush.webp': '/assets/stickers/frog_bamboo_toothbrush.webp',
  '/assets/stickers/dinner_bowl.webp': '/assets/stickers/frog_pond_harvest_bowl.webp',
  '/assets/stickers/pancakes_breakfast.webp': '/assets/stickers/frog_pond_harvest_bowl.webp',
  '/assets/stickers/backpack_school.webp': '/assets/stickers/frog_explorer_backpack.webp',
  '/assets/stickers/help_sos.webp': '/assets/stickers/frog_leaf_shield_sos.webp',
  '/assets/stickers/fav_help_sos.webp': '/assets/stickers/frog_leaf_shield_sos.webp',
  '/assets/stickers/schedule_calendar.webp': '/assets/stickers/frog_reed_checklist_board.webp',
  '/assets/stickers/locker_schedule.webp': '/assets/stickers/frog_reed_checklist_board.webp',
  '/assets/stickers/quick_phrases.webp': '/assets/stickers/frog_lily_speech_bubbles.webp',
  '/assets/stickers/feelings_thermometer.webp': '/assets/stickers/frog_cattail_thermometer.webp',
  '/assets/stickers/timer_clock.webp': '/assets/stickers/frog_lily_stopwatch.webp',
  '/assets/stickers/aac_core.webp': '/assets/stickers/frog_lotus_star_core.webp',
  '/assets/stickers/aac_sentences.webp': '/assets/stickers/frog_lily_speech_bubbles.webp',
  '/assets/stickers/aac_favorites.webp': '/assets/stickers/frog_lotus_reward_trophy.webp',
  '/assets/stickers/aac_food.webp': '/assets/stickers/frog_garden_sandwich.webp',
  '/assets/stickers/aac_drinks.webp': '/assets/stickers/frog_dewdrop_bamboo_cup.webp',
  '/assets/stickers/aac_activities.webp': '/assets/stickers/frog_game_controller.webp',
  '/assets/stickers/aac_places.webp': '/assets/stickers/frog_willow_hollow_retreat.webp',
  '/assets/stickers/aac_people.webp': '/assets/stickers/frog_child_persona.webp',
  '/assets/stickers/aac_feelings.webp': '/assets/stickers/frog_lily_pad_heart.webp',
  '/assets/stickers/aac_sensory.webp': '/assets/stickers/frog_pebble_headphones.webp',
  '/assets/stickers/aac_all_words.webp': '/assets/stickers/frog_reed_school_folder.webp',
  '/assets/stickers/star_gold.webp': '/assets/stickers/frog_lotus_star_core.webp',
  // Batch 2: Moods, Personas, School & Hubs
  '/assets/stickers/mood_happy.webp': '/assets/stickers/frog_mood_happy.webp',
  '/assets/stickers/fav_happy.webp': '/assets/stickers/frog_mood_happy.webp',
  '/assets/stickers/mood_calm.webp': '/assets/stickers/frog_mood_calm.webp',
  '/assets/stickers/mood_excited.webp': '/assets/stickers/frog_mood_excited.webp',
  '/assets/stickers/mood_sleepy.webp': '/assets/stickers/frog_mood_sleepy.webp',
  '/assets/stickers/mood_unsure.webp': '/assets/stickers/frog_mood_unsure.webp',
  '/assets/stickers/fav_stop.webp': '/assets/stickers/frog_stop_flipper.webp',
  '/assets/stickers/fav_music.webp': '/assets/stickers/frog_bamboo_wind_chimes.webp',
  '/assets/stickers/music_sensory.webp': '/assets/stickers/frog_bamboo_wind_chimes.webp',
  '/assets/stickers/fav_sandwich.webp': '/assets/stickers/frog_garden_sandwich.webp',
  '/assets/stickers/sandwich_lunch.webp': '/assets/stickers/frog_garden_sandwich.webp',
  '/assets/stickers/child_persona.webp': '/assets/stickers/frog_child_persona.webp',
  '/assets/stickers/teen_headphones.webp': '/assets/stickers/frog_pebble_headphones.webp',
  '/assets/stickers/adult_briefcase.webp': '/assets/stickers/frog_bamboo_satchel.webp',
  '/assets/stickers/caregiver_phone.webp': '/assets/stickers/frog_wood_phone_caregiver.webp',
  '/assets/stickers/language_globe.webp': '/assets/stickers/frog_pond_biome_globe.webp',
  '/assets/stickers/trial_crown.webp': '/assets/stickers/frog_golden_lotus_crown.webp',
  '/assets/stickers/refresh_repeat.webp': '/assets/stickers/frog_tadpole_swim_loop.webp',
  // Batch 3: School, Play & Daily Tools
  '/assets/stickers/school_bus.webp': '/assets/stickers/frog_bamboo_ferry_bus.webp',
  '/assets/stickers/science_flask.webp': '/assets/stickers/frog_terrarium_science_flask.webp',
  '/assets/stickers/art_palette.webp': '/assets/stickers/frog_pebble_art_palette.webp',
  '/assets/stickers/art_crafts.webp': '/assets/stickers/frog_pebble_art_palette.webp',
  '/assets/stickers/pencil_write.webp': '/assets/stickers/frog_bamboo_pencil.webp',
  '/assets/stickers/homework_study.webp': '/assets/stickers/frog_bamboo_pencil.webp',
  '/assets/stickers/folder_schoolwork.webp': '/assets/stickers/frog_reed_school_folder.webp',
  '/assets/stickers/playground_swings.webp': '/assets/stickers/frog_willow_slide_swings.webp',
  '/assets/stickers/playground_recess.webp': '/assets/stickers/frog_willow_slide_swings.webp',
  '/assets/stickers/apple_snack.webp': '/assets/stickers/frog_pond_berry_snack.webp',
  '/assets/stickers/pajamas_sleep.webp': '/assets/stickers/frog_lily_pajamas_sleep.webp',
  '/assets/stickers/pajamas_shorts.webp': '/assets/stickers/frog_lily_pajamas_sleep.webp',
  '/assets/stickers/car_ride.webp': '/assets/stickers/frog_reed_cart_ride.webp',
  '/assets/stickers/tablet_ipad.webp': '/assets/stickers/frog_bamboo_tablet_ipad.webp',
  '/assets/stickers/toy_box.webp': '/assets/stickers/frog_seagrass_toy_box.webp',
  '/assets/stickers/spoons_energy.webp': '/assets/stickers/frog_bamboo_energy_spoons.webp',
  '/assets/stickers/fidget_bubbles.webp': '/assets/stickers/frog_pond_dewdrop_bubbles.webp',
  '/assets/stickers/decision_wheel.webp': '/assets/stickers/frog_lotus_decision_wheel.webp',
  '/assets/stickers/clock_time.webp': '/assets/stickers/frog_lily_pad_wall_clock.webp',
  // Batch 4: Identity, Daily Care & Health
  '/assets/stickers/about_id.webp': '/assets/stickers/frog_explorer_id_badge.webp',
  '/assets/stickers/adventure_dentist.webp': '/assets/stickers/frog_lotus_dental_station.webp',
  '/assets/stickers/keyboard.webp': '/assets/stickers/frog_bamboo_keyboard.webp',
  '/assets/stickers/caregiver_heart.webp': '/assets/stickers/frog_caregiver_heart.webp',
  '/assets/stickers/eye_see.webp': '/assets/stickers/frog_sensory_eye_stone.webp',
  '/assets/stickers/hot_cocoa.webp': '/assets/stickers/frog_herbal_tea_mug.webp',
  '/assets/stickers/laundry_hamper.webp': '/assets/stickers/frog_reed_laundry_basket.webp',
  '/assets/stickers/chocolate_bar.webp': '/assets/stickers/frog_honey_seed_snack_bar.webp',
  '/assets/stickers/travel_luggage.webp': '/assets/stickers/frog_timber_explorer_trunk.webp',
  '/assets/stickers/quiet_voice.webp': '/assets/stickers/frog_whispering_shh.webp',
  '/assets/stickers/routine_toilet_restroom.webp': '/assets/stickers/frog_bamboo_washroom_basin.webp',
  '/assets/stickers/sneaker_shoes.webp': '/assets/stickers/frog_reed_explorer_shoes.webp',
  '/assets/stickers/evening_moon.webp': '/assets/stickers/frog_pond_crescent_moon.webp',
  '/assets/stickers/medications_health.webp': '/assets/stickers/frog_herbal_wellness_vial.webp',
  '/assets/stickers/routine_medicine_pill.webp': '/assets/stickers/frog_herbal_wellness_vial.webp',
  '/assets/stickers/adventure_doctor_checkup.webp': '/assets/stickers/frog_healer_stethoscope_kit.webp',
  // Batch 5: Adventures, Sensory & Wellness
  '/assets/stickers/adventure_haircut_salon.webp': '/assets/stickers/frog_grooming_comb_mirror.webp',
  '/assets/stickers/adventure_camping_tent.webp': '/assets/stickers/frog_canopy_reed_tent.webp',
  '/assets/stickers/adventure_swimming_pool.webp': '/assets/stickers/frog_spring_lagoon_pool.webp',
  '/assets/stickers/adventure_movie_cinema.webp': '/assets/stickers/frog_shadow_puppet_theater.webp',
  '/assets/stickers/sensory_loud_noise.webp': '/assets/stickers/frog_sound_softening_shell.webp',
  '/assets/stickers/sensory_bright_lights.webp': '/assets/stickers/frog_shaded_leaf_sun_hat.webp',
  '/assets/stickers/sensory_social_masking.webp': '/assets/stickers/frog_willow_hollow_retreat.webp',
  '/assets/stickers/bone_treat.webp': '/assets/stickers/frog_water_chestnut_treat.webp',
  '/assets/stickers/shopping_cart.webp': '/assets/stickers/frog_woven_gathering_cart.webp',
  '/assets/stickers/airplane_flight.webp': '/assets/stickers/frog_dragonfly_glider.webp',
  '/assets/stickers/shower_wash.webp': '/assets/stickers/frog_warm_spring_bath.webp',
  '/assets/stickers/bathtub_wash.webp': '/assets/stickers/frog_warm_spring_bath.webp',
  '/assets/stickers/bath_time.webp': '/assets/stickers/frog_warm_spring_bath.webp',
  '/assets/stickers/fav_bath.webp': '/assets/stickers/frog_warm_spring_bath.webp',
  '/assets/stickers/teddy_bear.webp': '/assets/stickers/frog_plush_toy_doll.webp',
  '/assets/stickers/pet_care.webp': '/assets/stickers/frog_tadpole_pet_feed_bowl.webp',
  '/assets/stickers/outdoor_sun.webp': '/assets/stickers/frog_meadow_sunshine.webp',
  '/assets/stickers/fav_outside.webp': '/assets/stickers/frog_meadow_sunshine.webp',
  '/assets/stickers/reward_trophy.webp': '/assets/stickers/frog_lotus_reward_trophy.webp',
  // Batch 6: Outings, Social Stories, Dining & Toys
  '/assets/stickers/adventure_restaurant.webp': '/assets/stickers/frog_feast_table_pavilion.webp',
  '/assets/stickers/adventure_bowling_alley.webp': '/assets/stickers/frog_pebble_bowling_alley.webp',
  '/assets/stickers/adventure_museum_visit.webp': '/assets/stickers/frog_heritage_archive_pavilion.webp',
  '/assets/stickers/fork_knife.webp': '/assets/stickers/frog_bamboo_cutlery.webp',
  '/assets/stickers/cutlery.webp': '/assets/stickers/frog_bamboo_cutlery.webp',
  '/assets/stickers/ocean_wave.webp': '/assets/stickers/frog_pond_ripple_wave.webp',
  '/assets/stickers/battery_meter.webp': '/assets/stickers/frog_bamboo_energy_gauge.webp',
  '/assets/stickers/paw_print.webp': '/assets/stickers/frog_webbed_footprint_stamp.webp',
  '/assets/stickers/tennis_ball.webp': '/assets/stickers/frog_woven_moss_play_ball.webp',
  '/assets/stickers/potted_plant.webp': '/assets/stickers/frog_driftwood_lotus_planter.webp',
  '/assets/stickers/jigsaw_puzzle.webp': '/assets/stickers/frog_lotus_puzzle_piece.webp',
  '/assets/stickers/story_plans_change.webp': '/assets/stickers/frog_tadpole_swim_loop.webp',
  '/assets/stickers/plans_changed.webp': '/assets/stickers/frog_tadpole_swim_loop.webp',
  '/assets/stickers/story_birthday.webp': '/assets/stickers/frog_pond_birthday_feast.webp',
  '/assets/stickers/story_sharing.webp': '/assets/stickers/frog_seagrass_toy_box.webp',
  '/assets/stickers/sharing_toys.webp': '/assets/stickers/frog_seagrass_toy_box.webp',
  '/assets/stickers/adventure_doctor.webp': '/assets/stickers/frog_healer_stethoscope_kit.webp',
  '/assets/stickers/doctor_checkup.webp': '/assets/stickers/frog_healer_stethoscope_kit.webp',
  '/assets/stickers/fav_lego.webp': '/assets/stickers/frog_zen_balancing_stones.webp',
  '/assets/stickers/fav_love_heart.webp': '/assets/stickers/frog_lily_pad_heart.webp',
  '/assets/stickers/bee_mascot.webp': '/assets/stickers/frog_mascot.webp',
};

export const SPACE_STICKER_SWAPS: Record<string, string> = {
  '/assets/stickers/birthday_gift_box.webp': '/assets/stickers/space_birthday_gift_box.webp',
  '/assets/stickers/birthday_cake_slice.webp': '/assets/stickers/space_birthday_cake_slice.webp',
  '/assets/stickers/game_controller.webp': '/assets/stickers/space_game_controller.webp',
  '/assets/stickers/water_bottle.webp': '/assets/stickers/space_water_bottle.webp',
  '/assets/stickers/pants_folded.webp': '/assets/stickers/space_pants_folded.webp',
  '/assets/stickers/birthday_card.webp': '/assets/stickers/space_birthday_card.webp',
  // Adventure Step Mappings
  '/assets/stickers/toy_box.webp': '/assets/stickers/space_travel_luggage.webp',
  '/assets/stickers/clipboard_shutdown.webp': '/assets/stickers/space_tablet_ipad.webp',
  '/assets/stickers/hiking_trail_boots.webp': '/assets/stickers/space_sneaker_shoes.webp',
  '/assets/stickers/waiting_room_couch.webp': '/assets/stickers/space_waiting_room_couch.webp',
  '/assets/stickers/waving_hand_hello.webp': '/assets/stickers/space_waving_hand_hello.webp',
  '/assets/stickers/padded_recliner_chair.webp': '/assets/stickers/space_padded_recliner_chair.webp',
  '/assets/stickers/open_mouth_wide.webp': '/assets/stickers/space_open_mouth_wide.webp',
  '/assets/stickers/open_mouth_lion.webp': '/assets/stickers/space_open_mouth_wide.webp',
  '/assets/stickers/open_welcome_door.webp': '/assets/stickers/space_open_welcome_door.webp',
  '/assets/stickers/dining_table_booth.webp': '/assets/stickers/space_dining_table_booth.webp',
  '/assets/stickers/restaurant_menu_book.webp': '/assets/stickers/space_restaurant_menu_book.webp',
  '/assets/stickers/barbershop_pole.webp': '/assets/stickers/space_barbershop_pole.webp',
  '/assets/stickers/haircut_cape.webp': '/assets/stickers/space_haircut_cape.webp',
  '/assets/stickers/water_spray_bottle.webp': '/assets/stickers/space_water_spray_bottle.webp',
  '/assets/stickers/barber_neck_brush.webp': '/assets/stickers/space_barber_neck_brush.webp',
  '/assets/stickers/salon_hand_mirror.webp': '/assets/stickers/space_salon_hand_mirror.webp',
  '/assets/stickers/medical_clinic_building.webp': '/assets/stickers/space_medical_clinic_building.webp',
  '/assets/stickers/clinic_height_scale.webp': '/assets/stickers/space_clinic_height_scale.webp',
  '/assets/stickers/doctor_exam_bed.webp': '/assets/stickers/space_doctor_exam_bed.webp',
  '/assets/stickers/doctor_ear_light.webp': '/assets/stickers/space_doctor_ear_light.webp',
  '/assets/stickers/walking_pool_feet.webp': '/assets/stickers/space_walking_pool_feet.webp',
  '/assets/stickers/swim_goggles_floaties.webp': '/assets/stickers/space_swim_goggles_floaties.webp',
  '/assets/stickers/fluffy_beach_towel.webp': '/assets/stickers/space_fluffy_beach_towel.webp',
  '/assets/stickers/movie_projector_screen.webp': '/assets/stickers/space_movie_projector_screen.webp',
  '/assets/stickers/bowling_ball_holes.webp': '/assets/stickers/space_bowling_ball_holes.webp',
  '/assets/stickers/bowling_lane_bumpers.webp': '/assets/stickers/space_bowling_lane_bumpers.webp',
  '/assets/stickers/bowling_pins_strike.webp': '/assets/stickers/space_bowling_pins_strike.webp',
  '/assets/stickers/high_five_hands.webp': '/assets/stickers/space_high_five_hands.webp',
  '/assets/stickers/pine_trees_forest.webp': '/assets/stickers/space_pine_trees_forest.webp',
  '/assets/stickers/camping_sleeping_bag.webp': '/assets/stickers/space_camping_sleeping_bag.webp',
  '/assets/stickers/campfire_marshmallows.webp': '/assets/stickers/space_campfire_marshmallows.webp',
  '/assets/stickers/museum_paper_map.webp': '/assets/stickers/space_museum_paper_map.webp',
  '/assets/stickers/museum_dinosaur_fossil.webp': '/assets/stickers/space_museum_dinosaur_fossil.webp',
  '/assets/stickers/observing_magnifying_glass.webp': '/assets/stickers/space_observing_magnifying_glass.webp',
  // Batch 1 Core Routine Swaps
  '/assets/stickers/alarm_clock.webp': '/assets/stickers/space_alarm_clock.webp',
  '/assets/stickers/toothbrush.webp': '/assets/stickers/space_toothbrush.webp',
  '/assets/stickers/clothes_dressed.webp': '/assets/stickers/space_clothes_dressed.webp',
  '/assets/stickers/pancakes_breakfast.webp': '/assets/stickers/space_pancakes_breakfast.webp',
  '/assets/stickers/school_bus.webp': '/assets/stickers/space_school_bus.webp',
  '/assets/stickers/backpack_school.webp': '/assets/stickers/space_backpack_school.webp',
  '/assets/stickers/homework_study.webp': '/assets/stickers/space_homework_study.webp',
  '/assets/stickers/folder_schoolwork.webp': '/assets/stickers/space_homework_study.webp',
  '/assets/stickers/sandwich_lunch.webp': '/assets/stickers/space_sandwich_lunch.webp',
  '/assets/stickers/routine_water_drink.webp': '/assets/stickers/space_routine_water_drink.webp',
  '/assets/stickers/drink_water.webp': '/assets/stickers/space_routine_water_drink.webp',
  '/assets/stickers/fav_water.webp': '/assets/stickers/space_routine_water_drink.webp',
  '/assets/stickers/sneaker_shoes.webp': '/assets/stickers/space_sneaker_shoes.webp',
  '/assets/stickers/routine_toilet_restroom.webp': '/assets/stickers/space_toilet_restroom.webp',
  '/assets/stickers/toilet_restroom.webp': '/assets/stickers/space_toilet_restroom.webp',
  '/assets/stickers/routine_medicine_pill.webp': '/assets/stickers/space_routine_medicine_pill.webp',
  '/assets/stickers/medications_health.webp': '/assets/stickers/space_routine_medicine_pill.webp',
  '/assets/stickers/pill_capsule.webp': '/assets/stickers/space_routine_medicine_pill.webp',
  '/assets/stickers/school_building.webp': '/assets/stickers/space_school_building.webp',
  '/assets/stickers/shower_wash.webp': '/assets/stickers/space_shower_wash.webp',
  '/assets/stickers/bathtub_wash.webp': '/assets/stickers/space_shower_wash.webp',
  '/assets/stickers/bath_time.webp': '/assets/stickers/space_shower_wash.webp',
  '/assets/stickers/fav_bath.webp': '/assets/stickers/space_shower_wash.webp',
  '/assets/stickers/soap_wash_hands.webp': '/assets/stickers/space_soap_wash_hands.webp',
  '/assets/stickers/bedtime_sleep.webp': '/assets/stickers/space_bedtime_sleep.webp',
  '/assets/stickers/pajamas_sleep.webp': '/assets/stickers/space_bedtime_sleep.webp',
  '/assets/stickers/pajamas_shorts.webp': '/assets/stickers/space_bedtime_sleep.webp',
  // Batch 2 Swaps
  '/assets/stickers/hot_cocoa.webp': '/assets/stickers/space_hot_cocoa.webp',
  '/assets/stickers/dinner_bowl.webp': '/assets/stickers/space_dinner_bowl.webp',
  '/assets/stickers/cooking_pot.webp': '/assets/stickers/space_dinner_bowl.webp',
  '/assets/stickers/apple_snack.webp': '/assets/stickers/space_apple_snack.webp',
  '/assets/stickers/chocolate_bar.webp': '/assets/stickers/space_chocolate_bar.webp',
  '/assets/stickers/jigsaw_puzzle.webp': '/assets/stickers/space_jigsaw_puzzle.webp',
  '/assets/stickers/fav_music.webp': '/assets/stickers/space_fav_music.webp',
  '/assets/stickers/music_note.webp': '/assets/stickers/space_fav_music.webp',
  '/assets/stickers/music_sensory.webp': '/assets/stickers/space_fav_music.webp',
  '/assets/stickers/fav_love_heart.webp': '/assets/stickers/space_fav_love_heart.webp',
  '/assets/stickers/heart_here_for_you.webp': '/assets/stickers/space_fav_love_heart.webp',
  '/assets/stickers/fav_outside.webp': '/assets/stickers/space_fav_outside.webp',
  '/assets/stickers/outdoor_sun.webp': '/assets/stickers/space_fav_outside.webp',
  '/assets/stickers/fav_stop.webp': '/assets/stickers/space_fav_stop.webp',
  '/assets/stickers/help_sos.webp': '/assets/stickers/space_help_sos.webp',
  '/assets/stickers/alert_sos_shield.webp': '/assets/stickers/space_help_sos.webp',
  '/assets/stickers/fav_help_sos.webp': '/assets/stickers/space_help_sos.webp',
  '/assets/stickers/decision_wheel.webp': '/assets/stickers/space_decision_wheel.webp',
  '/assets/stickers/spoons_energy.webp': '/assets/stickers/space_spoons_energy.webp',
  '/assets/stickers/routine_writing_journal.webp': '/assets/stickers/space_routine_writing_journal.webp',
  '/assets/stickers/laundry_hamper.webp': '/assets/stickers/space_laundry_hamper.webp',
  '/assets/stickers/refresh_repeat.webp': '/assets/stickers/space_refresh_repeat.webp',
  '/assets/stickers/circular_arrow.webp': '/assets/stickers/space_refresh_repeat.webp',
  // Batch 3 Moods, Personas, Habitats & Hubs
  '/assets/stickers/mood_happy.webp': '/assets/stickers/space_mood_happy.webp',
  '/assets/stickers/mood_calm.webp': '/assets/stickers/space_mood_calm.webp',
  '/assets/stickers/mood_excited.webp': '/assets/stickers/space_mood_excited.webp',
  '/assets/stickers/mood_sleepy.webp': '/assets/stickers/space_mood_sleepy.webp',
  '/assets/stickers/mood_unsure.webp': '/assets/stickers/space_mood_unsure.webp',
  '/assets/stickers/child_persona.webp': '/assets/stickers/space_child_persona.webp',
  '/assets/stickers/adult_briefcase.webp': '/assets/stickers/space_adult_briefcase.webp',
  '/assets/stickers/caregiver_phone.webp': '/assets/stickers/space_caregiver_phone.webp',
  '/assets/stickers/language_globe.webp': '/assets/stickers/space_language_globe.webp',
  '/assets/stickers/trial_crown.webp': '/assets/stickers/space_trial_crown.webp',
  '/assets/stickers/home_house.webp': '/assets/stickers/space_home_house.webp',
  '/assets/stickers/car_ride.webp': '/assets/stickers/space_car_ride.webp',
  '/assets/stickers/car_travel.webp': '/assets/stickers/space_car_ride.webp',
  '/assets/stickers/car_on_my_way.webp': '/assets/stickers/space_car_ride.webp',
  '/assets/stickers/pet_care.webp': '/assets/stickers/space_pet_care.webp',
  '/assets/stickers/bee_mascot.webp': '/assets/stickers/space_pet_care.webp',
  '/assets/stickers/pizza_slice.webp': '/assets/stickers/space_pizza_slice.webp',
  '/assets/stickers/about_id.webp': '/assets/stickers/space_about_id.webp',
  // Batch 4 Weather, Rewards, Tools & Exploration
  '/assets/stickers/morning_sunrise.webp': '/assets/stickers/space_morning_sunrise.webp',
  '/assets/stickers/evening_moon.webp': '/assets/stickers/space_evening_moon.webp',
  '/assets/stickers/reward_trophy.webp': '/assets/stickers/space_reward_trophy.webp',
  '/assets/stickers/star_gold.webp': '/assets/stickers/space_star_gold.webp',
  '/assets/stickers/aac_core.webp': '/assets/stickers/space_star_gold.webp',
  '/assets/stickers/aac_sentences.webp': '/assets/stickers/space_speech_bubble.webp',
  '/assets/stickers/aac_favorites.webp': '/assets/stickers/space_reward_trophy.webp',
  '/assets/stickers/aac_food.webp': '/assets/stickers/space_pizza_slice.webp',
  '/assets/stickers/aac_drinks.webp': '/assets/stickers/space_routine_water_drink.webp',
  '/assets/stickers/aac_activities.webp': '/assets/stickers/space_game_controller.webp',
  '/assets/stickers/aac_places.webp': '/assets/stickers/space_home_house.webp',
  '/assets/stickers/aac_people.webp': '/assets/stickers/space_child_persona.webp',
  '/assets/stickers/aac_feelings.webp': '/assets/stickers/space_fav_love_heart.webp',
  '/assets/stickers/aac_sensory.webp': '/assets/stickers/space_sensory_loud_noise.webp',
  '/assets/stickers/aac_all_words.webp': '/assets/stickers/space_homework_study.webp',
  '/assets/stickers/feelings_thermometer.webp': '/assets/stickers/space_feelings_thermometer.webp',
  '/assets/stickers/battery_meter.webp': '/assets/stickers/space_battery_meter.webp',
  '/assets/stickers/calm_sparkles.webp': '/assets/stickers/space_calm_sparkles.webp',
  '/assets/stickers/quiet_voice.webp': '/assets/stickers/space_quiet_voice.webp',
  '/assets/stickers/speech_bubble.webp': '/assets/stickers/space_speech_bubble.webp',
  '/assets/stickers/science_flask.webp': '/assets/stickers/space_science_flask.webp',
  '/assets/stickers/sunny_clear.webp': '/assets/stickers/space_sunny_clear.webp',
  '/assets/stickers/rain_cloud.webp': '/assets/stickers/space_rain_cloud.webp',
  '/assets/stickers/snow_weather.webp': '/assets/stickers/space_snow_weather.webp',
  '/assets/stickers/travel_luggage.webp': '/assets/stickers/space_travel_luggage.webp',
  '/assets/stickers/stethoscope.webp': '/assets/stickers/space_stethoscope.webp',
  // Batch 5 Adventures & Sensory Regulation
  '/assets/stickers/adventure_dentist.webp': '/assets/stickers/space_adventure_dentist.webp',
  '/assets/stickers/dentist_adventure.webp': '/assets/stickers/space_adventure_dentist.webp',
  '/assets/stickers/adventure_haircut.webp': '/assets/stickers/space_adventure_haircut.webp',
  '/assets/stickers/haircut_adventure.webp': '/assets/stickers/space_adventure_haircut.webp',
  '/assets/stickers/adventure_movie_cinema.webp': '/assets/stickers/space_adventure_movie_cinema.webp',
  '/assets/stickers/movie_cinema.webp': '/assets/stickers/space_adventure_movie_cinema.webp',
  '/assets/stickers/adventure_swimming_pool.webp': '/assets/stickers/space_adventure_swimming_pool.webp',
  '/assets/stickers/swimming_pool.webp': '/assets/stickers/space_adventure_swimming_pool.webp',
  '/assets/stickers/adventure_camping_tent.webp': '/assets/stickers/space_adventure_camping_tent.webp',
  '/assets/stickers/camping_tent.webp': '/assets/stickers/space_adventure_camping_tent.webp',
  '/assets/stickers/shopping_cart.webp': '/assets/stickers/space_shopping_cart.webp',
  '/assets/stickers/therapy_brain.webp': '/assets/stickers/space_therapy_brain.webp',
  '/assets/stickers/sensory_loud_noise.webp': '/assets/stickers/space_sensory_loud_noise.webp',
  '/assets/stickers/sensory_bright_lights.webp': '/assets/stickers/space_sensory_bright_lights.webp',
  '/assets/stickers/tennis_ball.webp': '/assets/stickers/space_tennis_ball.webp',
  '/assets/stickers/red_balloon.webp': '/assets/stickers/space_red_balloon.webp',
  '/assets/stickers/candy_treat.webp': '/assets/stickers/space_candy_treat.webp',
  '/assets/stickers/cutlery_meal.webp': '/assets/stickers/space_cutlery_meal.webp',
  '/assets/stickers/grounding_touch_hand.webp': '/assets/stickers/space_grounding_touch_hand.webp',
  '/assets/stickers/cloudy_weather.webp': '/assets/stickers/space_cloudy_weather.webp',
  // Batch 6 Destinations, Travel & Station Living
  '/assets/stickers/adventure_restaurant.webp': '/assets/stickers/space_adventure_restaurant.webp',
  '/assets/stickers/restaurant_adventure.webp': '/assets/stickers/space_adventure_restaurant.webp',
  '/assets/stickers/adventure_museum_visit.webp': '/assets/stickers/space_adventure_museum_visit.webp',
  '/assets/stickers/museum_visit.webp': '/assets/stickers/space_adventure_museum_visit.webp',
  '/assets/stickers/adventure_bowling_alley.webp': '/assets/stickers/space_adventure_bowling_alley.webp',
  '/assets/stickers/bowling_alley.webp': '/assets/stickers/space_adventure_bowling_alley.webp',
  '/assets/stickers/adventure_haircut_salon.webp': '/assets/stickers/space_adventure_haircut.webp',
  '/assets/stickers/adventure_doctor.webp': '/assets/stickers/space_stethoscope.webp',
  '/assets/stickers/adventure_doctor_checkup.webp': '/assets/stickers/space_stethoscope.webp',
  '/assets/stickers/doctor_checkup.webp': '/assets/stickers/space_stethoscope.webp',
  '/assets/stickers/airplane_flight.webp': '/assets/stickers/space_airplane_flight.webp',
  '/assets/stickers/boarding_ticket.webp': '/assets/stickers/space_boarding_ticket.webp',
  '/assets/stickers/passport_book.webp': '/assets/stickers/space_passport_book.webp',
  '/assets/stickers/tablet_ipad.webp': '/assets/stickers/space_tablet_ipad.webp',
  '/assets/stickers/potted_plant.webp': '/assets/stickers/space_potted_plant.webp',
  '/assets/stickers/clock_time.webp': '/assets/stickers/space_clock_time.webp',
  '/assets/stickers/timer_clock.webp': '/assets/stickers/space_clock_time.webp',
  '/assets/stickers/wall_clock.webp': '/assets/stickers/space_clock_time.webp',
  '/assets/stickers/circle_carpet.webp': '/assets/stickers/space_circle_carpet.webp',
  '/assets/stickers/sensory_social_masking.webp': '/assets/stickers/space_circle_carpet.webp',
  '/assets/stickers/locker_schedule.webp': '/assets/stickers/space_locker_schedule.webp',
  '/assets/stickers/bone_treat.webp': '/assets/stickers/space_bone_treat.webp',
  '/assets/stickers/paw_print.webp': '/assets/stickers/space_paw_print.webp',
  '/assets/stickers/ocean_wave.webp': '/assets/stickers/space_ocean_wave.webp',
  '/assets/stickers/story_birthday.webp': '/assets/stickers/space_story_birthday.webp',
  '/assets/stickers/story_plans_change.webp': '/assets/stickers/space_refresh_repeat.webp',
  '/assets/stickers/plans_changed.webp': '/assets/stickers/space_refresh_repeat.webp',
  '/assets/stickers/story_sharing.webp': '/assets/stickers/space_game_controller.webp',
  '/assets/stickers/sharing_toys.webp': '/assets/stickers/space_game_controller.webp',
};

export const TRAIN_STICKER_SWAPS: Record<string, string> = {
  '/assets/stickers/birthday_gift_box.webp': '/assets/stickers/train_birthday_gift_box.webp',
  '/assets/stickers/birthday_cake_slice.webp': '/assets/stickers/train_birthday_cake_slice.webp',
  '/assets/stickers/game_controller.webp': '/assets/stickers/train_game_controller.webp',
  '/assets/stickers/water_bottle.webp': '/assets/stickers/train_water_bottle.webp',
  '/assets/stickers/pants_folded.webp': '/assets/stickers/train_pants_folded.webp',
  '/assets/stickers/birthday_card.webp': '/assets/stickers/train_birthday_card.webp',
  // Train Adventure Batch 1 Swaps
  '/assets/stickers/waiting_room_couch.webp': '/assets/stickers/train_waiting_room_bench.webp',
  '/assets/stickers/waving_hand_hello.webp': '/assets/stickers/train_waving_hand_hello.webp',
  '/assets/stickers/padded_recliner_chair.webp': '/assets/stickers/train_padded_recliner_chair.webp',
  '/assets/stickers/open_mouth_wide.webp': '/assets/stickers/train_open_mouth_wide.webp',
  '/assets/stickers/open_mouth_lion.webp': '/assets/stickers/train_open_mouth_wide.webp',
  '/assets/stickers/open_welcome_door.webp': '/assets/stickers/train_open_welcome_door.webp',
  '/assets/stickers/dining_table_booth.webp': '/assets/stickers/train_dining_table_booth.webp',
  '/assets/stickers/restaurant_menu_book.webp': '/assets/stickers/train_restaurant_menu_book.webp',
  '/assets/stickers/barbershop_pole.webp': '/assets/stickers/train_barbershop_pole.webp',
  '/assets/stickers/haircut_cape.webp': '/assets/stickers/train_haircut_cape.webp',
  '/assets/stickers/water_spray_bottle.webp': '/assets/stickers/train_water_spray_bottle.webp',
  '/assets/stickers/barber_neck_brush.webp': '/assets/stickers/train_barber_neck_brush.webp',
  '/assets/stickers/salon_hand_mirror.webp': '/assets/stickers/train_salon_hand_mirror.webp',
  '/assets/stickers/medical_clinic_building.webp': '/assets/stickers/train_medical_clinic_building.webp',
  '/assets/stickers/clinic_height_scale.webp': '/assets/stickers/train_clinic_height_scale.webp',
  '/assets/stickers/doctor_exam_bed.webp': '/assets/stickers/train_doctor_exam_bed.webp',
  // Train Adventure Batch 2 Swaps
  '/assets/stickers/doctor_ear_light.webp': '/assets/stickers/train_doctor_ear_light.webp',
  '/assets/stickers/walking_pool_feet.webp': '/assets/stickers/train_walking_pool_feet.webp',
  '/assets/stickers/swim_goggles_floaties.webp': '/assets/stickers/train_swim_goggles_floaties.webp',
  '/assets/stickers/fluffy_beach_towel.webp': '/assets/stickers/train_fluffy_beach_towel.webp',
  '/assets/stickers/movie_projector_screen.webp': '/assets/stickers/train_movie_projector_screen.webp',
  '/assets/stickers/bowling_ball_holes.webp': '/assets/stickers/train_bowling_ball_holes.webp',
  '/assets/stickers/bowling_lane_bumpers.webp': '/assets/stickers/train_bowling_lane_bumpers.webp',
  '/assets/stickers/bowling_pins_strike.webp': '/assets/stickers/train_bowling_pins_strike.webp',
  '/assets/stickers/high_five_hands.webp': '/assets/stickers/train_high_five_hands.webp',
  '/assets/stickers/pine_trees_forest.webp': '/assets/stickers/train_pine_trees_forest.webp',
  '/assets/stickers/camping_sleeping_bag.webp': '/assets/stickers/train_camping_sleeping_bag.webp',
  '/assets/stickers/campfire_marshmallows.webp': '/assets/stickers/train_campfire_marshmallows.webp',
  '/assets/stickers/museum_paper_map.webp': '/assets/stickers/train_museum_paper_map.webp',
  '/assets/stickers/museum_dinosaur_fossil.webp': '/assets/stickers/train_museum_dinosaur_fossil.webp',
  '/assets/stickers/observing_magnifying_glass.webp': '/assets/stickers/train_observing_magnifying_glass.webp',
  // Adventure Step Mappings
  '/assets/stickers/clipboard_shutdown.webp': '/assets/stickers/train_timetable_board.webp',
  '/assets/stickers/hiking_trail_boots.webp': '/assets/stickers/train_boots.webp',
  // Batch 6 New Train Swaps
  '/assets/stickers/adventure_restaurant.webp': '/assets/stickers/train_adventure_restaurant.webp',
  '/assets/stickers/adventure_museum_visit.webp': '/assets/stickers/train_adventure_museum_visit.webp',
  '/assets/stickers/adventure_bowling_alley.webp': '/assets/stickers/train_adventure_bowling_alley.webp',
  '/assets/stickers/airplane_flight.webp': '/assets/stickers/train_airplane_flight.webp',
  '/assets/stickers/boarding_ticket.webp': '/assets/stickers/train_boarding_ticket.webp',
  '/assets/stickers/passport_book.webp': '/assets/stickers/train_passport_book.webp',
  '/assets/stickers/tablet_ipad.webp': '/assets/stickers/train_tablet_ipad.webp',
  '/assets/stickers/potted_plant.webp': '/assets/stickers/train_potted_plant.webp',
  '/assets/stickers/clock_time.webp': '/assets/stickers/train_clock_time.webp',
  '/assets/stickers/circle_carpet.webp': '/assets/stickers/train_circle_carpet.webp',
  '/assets/stickers/sensory_social_masking.webp': '/assets/stickers/train_circle_carpet.webp',
  '/assets/stickers/locker_schedule.webp': '/assets/stickers/train_locker_schedule.webp',
  '/assets/stickers/bone_treat.webp': '/assets/stickers/train_bone_treat.webp',
  '/assets/stickers/paw_print.webp': '/assets/stickers/train_paw_print.webp',
  '/assets/stickers/ocean_wave.webp': '/assets/stickers/train_ocean_wave.webp',
  '/assets/stickers/story_birthday.webp': '/assets/stickers/train_story_birthday.webp',
  '/assets/stickers/story_plans_change.webp': '/assets/stickers/train_circular_track.webp',
  '/assets/stickers/plans_changed.webp': '/assets/stickers/train_circular_track.webp',
  '/assets/stickers/story_sharing.webp': '/assets/stickers/train_toy_chest.webp',
  '/assets/stickers/sharing_toys.webp': '/assets/stickers/train_toy_chest.webp',
  // Batch 5 New Train Swaps
  '/assets/stickers/adventure_dentist.webp': '/assets/stickers/train_adventure_dentist.webp',
  '/assets/stickers/adventure_haircut.webp': '/assets/stickers/train_adventure_haircut.webp',
  '/assets/stickers/adventure_haircut_salon.webp': '/assets/stickers/train_adventure_haircut.webp',
  '/assets/stickers/adventure_movie_cinema.webp': '/assets/stickers/train_adventure_movie_cinema.webp',
  '/assets/stickers/adventure_swimming_pool.webp': '/assets/stickers/train_adventure_swimming_pool.webp',
  '/assets/stickers/adventure_camping_tent.webp': '/assets/stickers/train_adventure_camping_tent.webp',
  '/assets/stickers/shopping_cart.webp': '/assets/stickers/train_shopping_cart.webp',
  '/assets/stickers/therapy_brain.webp': '/assets/stickers/train_therapy_brain.webp',
  '/assets/stickers/sensory_loud_noise.webp': '/assets/stickers/train_sensory_loud_noise.webp',
  '/assets/stickers/sensory_bright_lights.webp': '/assets/stickers/train_sensory_bright_lights.webp',
  '/assets/stickers/tennis_ball.webp': '/assets/stickers/train_tennis_ball.webp',
  '/assets/stickers/red_balloon.webp': '/assets/stickers/train_red_balloon.webp',
  '/assets/stickers/candy_treat.webp': '/assets/stickers/train_candy_treat.webp',
  '/assets/stickers/cutlery_meal.webp': '/assets/stickers/train_cutlery_meal.webp',
  '/assets/stickers/fork_knife.webp': '/assets/stickers/train_cutlery_meal.webp',
  '/assets/stickers/grounding_touch_hand.webp': '/assets/stickers/train_grounding_touch_hand.webp',
  '/assets/stickers/cloudy_weather.webp': '/assets/stickers/train_cloudy_weather.webp',
  // Batch 4 New Train Swaps
  '/assets/stickers/morning_sunrise.webp': '/assets/stickers/train_morning_sunrise.webp',
  '/assets/stickers/evening_moon.webp': '/assets/stickers/train_evening_moon.webp',
  '/assets/stickers/reward_trophy.webp': '/assets/stickers/train_reward_trophy.webp',
  '/assets/stickers/star_gold.webp': '/assets/stickers/train_star_gold.webp',
  '/assets/stickers/aac_core.webp': '/assets/stickers/train_star_gold.webp',
  '/assets/stickers/aac_sentences.webp': '/assets/stickers/train_speech_bubble.webp',
  '/assets/stickers/aac_favorites.webp': '/assets/stickers/train_reward_trophy.webp',
  '/assets/stickers/aac_food.webp': '/assets/stickers/train_pizza_slice.webp',
  '/assets/stickers/aac_drinks.webp': '/assets/stickers/train_canteen_flask.webp',
  '/assets/stickers/aac_activities.webp': '/assets/stickers/train_game_controller.webp',
  '/assets/stickers/aac_places.webp': '/assets/stickers/train_home_station.webp',
  '/assets/stickers/aac_people.webp': '/assets/stickers/train_child_persona.webp',
  '/assets/stickers/aac_feelings.webp': '/assets/stickers/train_lantern_heart.webp',
  '/assets/stickers/aac_sensory.webp': '/assets/stickers/train_ear_defenders.webp',
  '/assets/stickers/aac_all_words.webp': '/assets/stickers/train_conductor_logbook.webp',
  '/assets/stickers/feelings_thermometer.webp': '/assets/stickers/train_feelings_thermometer.webp',
  '/assets/stickers/battery_meter.webp': '/assets/stickers/train_battery_meter.webp',
  '/assets/stickers/calm_sparkles.webp': '/assets/stickers/train_calm_sparkles.webp',
  '/assets/stickers/quiet_voice.webp': '/assets/stickers/train_quiet_voice.webp',
  '/assets/stickers/speech_bubble.webp': '/assets/stickers/train_speech_bubble.webp',
  '/assets/stickers/science_flask.webp': '/assets/stickers/train_science_flask.webp',
  '/assets/stickers/sunny_clear.webp': '/assets/stickers/train_sunny_clear.webp',
  '/assets/stickers/rain_cloud.webp': '/assets/stickers/train_rain_cloud.webp',
  '/assets/stickers/snow_weather.webp': '/assets/stickers/train_snow_weather.webp',
  '/assets/stickers/travel_luggage.webp': '/assets/stickers/train_travel_luggage.webp',
  '/assets/stickers/stethoscope.webp': '/assets/stickers/train_stethoscope.webp',
  '/assets/stickers/adventure_doctor.webp': '/assets/stickers/train_stethoscope.webp',
  '/assets/stickers/adventure_doctor_checkup.webp': '/assets/stickers/train_stethoscope.webp',
  // Batch 3 New Train Swaps
  '/assets/stickers/mood_happy.webp': '/assets/stickers/train_mood_happy.webp',
  '/assets/stickers/fav_happy.webp': '/assets/stickers/train_mood_happy.webp',
  '/assets/stickers/mood_calm.webp': '/assets/stickers/train_mood_calm.webp',
  '/assets/stickers/mood_excited.webp': '/assets/stickers/train_mood_excited.webp',
  '/assets/stickers/mood_sleepy.webp': '/assets/stickers/train_mood_sleepy.webp',
  '/assets/stickers/fav_rest_tired.webp': '/assets/stickers/train_mood_sleepy.webp',
  '/assets/stickers/mood_unsure.webp': '/assets/stickers/train_mood_unsure.webp',
  '/assets/stickers/child_persona.webp': '/assets/stickers/train_child_persona.webp',
  '/assets/stickers/adult_briefcase.webp': '/assets/stickers/train_adult_briefcase.webp',
  '/assets/stickers/caregiver_phone.webp': '/assets/stickers/train_caregiver_phone.webp',
  '/assets/stickers/language_globe.webp': '/assets/stickers/train_language_globe.webp',
  '/assets/stickers/trial_crown.webp': '/assets/stickers/train_trial_crown.webp',
  '/assets/stickers/about_id.webp': '/assets/stickers/train_about_id.webp',
  '/assets/stickers/home_house.webp': '/assets/stickers/train_home_station.webp',
  '/assets/stickers/car_ride.webp': '/assets/stickers/train_handcar_ride.webp',
  '/assets/stickers/car_travel.webp': '/assets/stickers/train_handcar_ride.webp',
  '/assets/stickers/car_on_my_way.webp': '/assets/stickers/train_handcar_ride.webp',
  '/assets/stickers/pet_care.webp': '/assets/stickers/train_station_dog.webp',
  '/assets/stickers/pizza_slice.webp': '/assets/stickers/train_pizza_slice.webp',
  // Batch 2 New Train Swaps
  '/assets/stickers/hot_cocoa.webp': '/assets/stickers/train_hot_cocoa.webp',
  '/assets/stickers/dinner_bowl.webp': '/assets/stickers/train_stew_pot.webp',
  '/assets/stickers/cooking_pot.webp': '/assets/stickers/train_stew_pot.webp',
  '/assets/stickers/apple_snack.webp': '/assets/stickers/train_fruit_crate.webp',
  '/assets/stickers/chocolate_bar.webp': '/assets/stickers/train_chocolate.webp',
  '/assets/stickers/jigsaw_puzzle.webp': '/assets/stickers/train_track_puzzle.webp',
  '/assets/stickers/fav_music.webp': '/assets/stickers/train_steam_whistle.webp',
  '/assets/stickers/music_note.webp': '/assets/stickers/train_steam_whistle.webp',
  '/assets/stickers/music_sensory.webp': '/assets/stickers/train_steam_whistle.webp',
  '/assets/stickers/fav_love_heart.webp': '/assets/stickers/train_lantern_heart.webp',
  '/assets/stickers/heart_here_for_you.webp': '/assets/stickers/train_lantern_heart.webp',
  '/assets/stickers/fav_outside.webp': '/assets/stickers/train_scenic_lookout.webp',
  '/assets/stickers/outdoor_sun.webp': '/assets/stickers/train_scenic_lookout.webp',
  '/assets/stickers/fav_stop.webp': '/assets/stickers/train_crossing_signal.webp',
  '/assets/stickers/help_sos.webp': '/assets/stickers/train_switch_lever.webp',
  '/assets/stickers/alert_sos_shield.webp': '/assets/stickers/train_switch_lever.webp',
  '/assets/stickers/fav_help_sos.webp': '/assets/stickers/train_switch_lever.webp',
  '/assets/stickers/decision_wheel.webp': '/assets/stickers/train_speedometer_gauge.webp',
  '/assets/stickers/spoons_energy.webp': '/assets/stickers/train_dining_spoons.webp',
  '/assets/stickers/routine_writing_journal.webp': '/assets/stickers/train_conductor_logbook.webp',
  '/assets/stickers/homework_study.webp': '/assets/stickers/train_conductor_logbook.webp',
  '/assets/stickers/laundry_hamper.webp': '/assets/stickers/train_linen_hamper.webp',
  '/assets/stickers/refresh_repeat.webp': '/assets/stickers/train_circular_track.webp',
  '/assets/stickers/circular_arrow.webp': '/assets/stickers/train_circular_track.webp',
  // Batch 1 New Train Swaps
  '/assets/stickers/sneaker_shoes.webp': '/assets/stickers/train_boots.webp',
  '/assets/stickers/routine_toilet_restroom.webp': '/assets/stickers/train_restroom.webp',
  '/assets/stickers/toilet_restroom.webp': '/assets/stickers/train_restroom.webp',
  '/assets/stickers/routine_medicine_pill.webp': '/assets/stickers/train_medicine_dropper.webp',
  '/assets/stickers/medications_health.webp': '/assets/stickers/train_medicine_dropper.webp',
  '/assets/stickers/pill_capsule.webp': '/assets/stickers/train_medicine_dropper.webp',
  '/assets/stickers/school_building.webp': '/assets/stickers/train_school_station.webp',
  '/assets/stickers/reading_books.webp': '/assets/stickers/train_story_atlas.webp',
  '/assets/stickers/story_sharing.webp': '/assets/stickers/train_story_atlas.webp',
  '/assets/stickers/playground_swings.webp': '/assets/stickers/train_playground_depot.webp',
  '/assets/stickers/art_crafts.webp': '/assets/stickers/train_paint_palette.webp',
  '/assets/stickers/art_palette.webp': '/assets/stickers/train_paint_palette.webp',
  '/assets/stickers/teen_headphones.webp': '/assets/stickers/train_ear_defenders.webp',
  '/assets/stickers/fidget_bubbles.webp': '/assets/stickers/train_valve_spinner.webp',
  '/assets/stickers/breathing_cloud.webp': '/assets/stickers/train_steam_breathing.webp',
  '/assets/stickers/coping_lungs_breathing.webp': '/assets/stickers/train_steam_breathing.webp',
  '/assets/stickers/toy_box.webp': '/assets/stickers/train_toy_chest.webp',
  '/assets/stickers/teddy_bear.webp': '/assets/stickers/train_toy_chest.webp',
  '/assets/stickers/fav_lego.webp': '/assets/stickers/train_toy_chest.webp',
  '/assets/stickers/shower_wash.webp': '/assets/stickers/train_depot_shower.webp',
  '/assets/stickers/bath_time.webp': '/assets/stickers/train_depot_shower.webp',
  '/assets/stickers/fav_bath.webp': '/assets/stickers/train_depot_shower.webp',
  '/assets/stickers/bathtub_wash.webp': '/assets/stickers/train_depot_shower.webp',
  '/assets/stickers/pajamas_shorts.webp': '/assets/stickers/train_stripe_pajamas.webp',
  '/assets/stickers/pajamas_sleep.webp': '/assets/stickers/train_stripe_pajamas.webp',
  '/assets/stickers/task_done.webp': '/assets/stickers/train_signal_lantern.webp',
  // Previous Core Swaps
  '/assets/stickers/alarm_clock.webp': '/assets/stickers/train_pocket_watch.webp',
  '/assets/stickers/toothbrush.webp': '/assets/stickers/train_boiler_toothbrush.webp',
  '/assets/stickers/clothes_dressed.webp': '/assets/stickers/train_conductor_uniform.webp',
  '/assets/stickers/pancakes_breakfast.webp': '/assets/stickers/train_dining_pancakes.webp',
  '/assets/stickers/school_bus.webp': '/assets/stickers/train_passenger_car.webp',
  '/assets/stickers/backpack_school.webp': '/assets/stickers/train_conductor_satchel.webp',
  '/assets/stickers/homework_study.webp': '/assets/stickers/train_ticket_punch.webp',
  '/assets/stickers/folder_schoolwork.webp': '/assets/stickers/train_ticket_punch.webp',
  '/assets/stickers/pencil_write.webp': '/assets/stickers/train_pencil.webp',
  '/assets/stickers/sandwich_lunch.webp': '/assets/stickers/train_tin_lunchbox.webp',
  '/assets/stickers/routine_water_drink.webp': '/assets/stickers/train_canteen_flask.webp',
  '/assets/stickers/fav_water.webp': '/assets/stickers/train_canteen_flask.webp',
  '/assets/stickers/drink_water.webp': '/assets/stickers/train_canteen_flask.webp',
  '/assets/stickers/fav_quiet_break.webp': '/assets/stickers/train_observation_seat.webp',
  '/assets/stickers/schedule_calendar.webp': '/assets/stickers/train_timetable_board.webp',
  '/assets/stickers/timer_clock.webp': '/assets/stickers/train_pressure_stopwatch.webp',
  '/assets/stickers/soap_wash_hands.webp': '/assets/stickers/train_station_soap.webp',
  '/assets/stickers/bedtime_sleep.webp': '/assets/stickers/train_sleeper_bunk.webp',
  '/assets/stickers/golden_train.webp': '/assets/stickers/train_mascot.webp',
  '/assets/stickers/bee_mascot.webp': '/assets/stickers/train_mascot.webp',
};

export const OCEAN_STICKER_SWAPS: Record<string, string> = {
  // Batch 1 Core Routine Swaps
  '/assets/stickers/alarm_clock.webp': '/assets/stickers/ocean_porthole_alarm.webp',
  '/assets/stickers/clock_time.webp': '/assets/stickers/ocean_porthole_alarm.webp',
  '/assets/stickers/routine_alarm_clock.webp': '/assets/stickers/ocean_porthole_alarm.webp',

  '/assets/stickers/toothbrush.webp': '/assets/stickers/ocean_coral_toothbrush.webp',
  '/assets/stickers/routine_toothbrush.webp': '/assets/stickers/ocean_coral_toothbrush.webp',

  '/assets/stickers/clothes_dressed.webp': '/assets/stickers/ocean_neoprene_wetsuit.webp',
  '/assets/stickers/routine_clothes_dressed.webp': '/assets/stickers/ocean_neoprene_wetsuit.webp',
  '/assets/stickers/pants_folded.webp': '/assets/stickers/ocean_neoprene_wetsuit.webp',

  '/assets/stickers/pancakes_breakfast.webp': '/assets/stickers/ocean_starfish_pancakes.webp',
  '/assets/stickers/breakfast_cereal.webp': '/assets/stickers/ocean_starfish_pancakes.webp',

  '/assets/stickers/school_bus.webp': '/assets/stickers/ocean_yellow_submarine.webp',

  '/assets/stickers/backpack_school.webp': '/assets/stickers/ocean_nautilus_backpack.webp',
  '/assets/stickers/backpack.webp': '/assets/stickers/ocean_nautilus_backpack.webp',

  '/assets/stickers/school_building.webp': '/assets/stickers/ocean_coral_schoolhouse.webp',

  '/assets/stickers/sandwich_lunch.webp': '/assets/stickers/ocean_clamshell_bento.webp',
  '/assets/stickers/lunch_box.webp': '/assets/stickers/ocean_clamshell_bento.webp',

  '/assets/stickers/routine_water_drink.webp': '/assets/stickers/ocean_seaglass_canteen.webp',
  '/assets/stickers/drink_water.webp': '/assets/stickers/ocean_seaglass_canteen.webp',
  '/assets/stickers/fav_water.webp': '/assets/stickers/ocean_seaglass_canteen.webp',
  '/assets/stickers/water_bottle.webp': '/assets/stickers/ocean_seaglass_canteen.webp',

  '/assets/stickers/sneaker_shoes.webp': '/assets/stickers/ocean_aqua_shoes.webp',

  '/assets/stickers/shower_wash.webp': '/assets/stickers/ocean_shell_shower.webp',
  '/assets/stickers/bathtub_wash.webp': '/assets/stickers/ocean_shell_shower.webp',
  '/assets/stickers/bath_time.webp': '/assets/stickers/ocean_shell_shower.webp',
  '/assets/stickers/fav_bath.webp': '/assets/stickers/ocean_shell_shower.webp',
  '/assets/stickers/soap_wash_hands.webp': '/assets/stickers/ocean_soap_wash_hands.webp',

  '/assets/stickers/apple_snack.webp': '/assets/stickers/ocean_watermelon_kelp_snack.webp',

  '/assets/stickers/dinner_bowl.webp': '/assets/stickers/ocean_abalone_stew.webp',
  '/assets/stickers/cooking_pot.webp': '/assets/stickers/ocean_abalone_stew.webp',

  '/assets/stickers/bedtime_sleep.webp': '/assets/stickers/ocean_pearl_oyster_bed.webp',
  '/assets/stickers/pajamas_sleep.webp': '/assets/stickers/ocean_pearl_oyster_bed.webp',
  '/assets/stickers/pajamas_shorts.webp': '/assets/stickers/ocean_pearl_oyster_bed.webp',

  '/assets/stickers/ocean_mascot.webp': '/assets/stickers/ocean_scuba_diver_mascot.webp',
  '/assets/stickers/turtle_mascot.webp': '/assets/stickers/ocean_scuba_diver_mascot.webp',
  '/assets/stickers/bee_mascot.webp': '/assets/stickers/ocean_scuba_diver_mascot.webp',

  // Batch 2 Activities, Snacks, Tools & Regulation Swaps
  '/assets/stickers/hot_cocoa.webp': '/assets/stickers/ocean_seaside_mug_cocoa.webp',
  '/assets/stickers/chocolate_bar.webp': '/assets/stickers/ocean_seasalt_chocolate.webp',
  '/assets/stickers/jigsaw_puzzle.webp': '/assets/stickers/ocean_clownfish_puzzle.webp',
  '/assets/stickers/fav_music.webp': '/assets/stickers/ocean_conch_headphones.webp',
  '/assets/stickers/music_note.webp': '/assets/stickers/ocean_conch_headphones.webp',
  '/assets/stickers/music_sensory.webp': '/assets/stickers/ocean_conch_headphones.webp',
  '/assets/stickers/fav_love_heart.webp': '/assets/stickers/ocean_seaglass_heart.webp',
  '/assets/stickers/heart_here_for_you.webp': '/assets/stickers/ocean_seaglass_heart.webp',
  '/assets/stickers/fav_outside.webp': '/assets/stickers/ocean_sunny_beach_view.webp',
  '/assets/stickers/outdoor_sun.webp': '/assets/stickers/ocean_sunny_beach_view.webp',
  '/assets/stickers/fav_stop.webp': '/assets/stickers/ocean_buoy_stop.webp',
  '/assets/stickers/help_sos.webp': '/assets/stickers/ocean_lifebuoy_sos.webp',
  '/assets/stickers/alert_sos_shield.webp': '/assets/stickers/ocean_lifebuoy_sos.webp',
  '/assets/stickers/fav_help_sos.webp': '/assets/stickers/ocean_lifebuoy_sos.webp',
  '/assets/stickers/decision_wheel.webp': '/assets/stickers/ocean_ships_helm_wheel.webp',
  '/assets/stickers/spoons_energy.webp': '/assets/stickers/ocean_energy_spoons.webp',
  '/assets/stickers/routine_writing_journal.webp': '/assets/stickers/ocean_captains_logbook.webp',
  '/assets/stickers/laundry_hamper.webp': '/assets/stickers/ocean_seaglass_basket.webp',
  '/assets/stickers/refresh_repeat.webp': '/assets/stickers/ocean_wave_loop.webp',
  '/assets/stickers/circular_arrow.webp': '/assets/stickers/ocean_wave_loop.webp',
  '/assets/stickers/toy_box.webp': '/assets/stickers/ocean_treasure_toy_chest.webp',
  '/assets/stickers/teddy_bear.webp': '/assets/stickers/ocean_treasure_toy_chest.webp',
  '/assets/stickers/fav_lego.webp': '/assets/stickers/ocean_treasure_toy_chest.webp',
  '/assets/stickers/homework_study.webp': '/assets/stickers/ocean_nautical_chart_study.webp',
  '/assets/stickers/folder_schoolwork.webp': '/assets/stickers/ocean_nautical_chart_study.webp',

  // Batch 3 Moods, Personas, Hubs & Daily Living
  '/assets/stickers/mood_happy.webp': '/assets/stickers/ocean_happy_baby_shark.webp',
  '/assets/stickers/mood_calm.webp': '/assets/stickers/ocean_calm_floating_shark.webp',
  '/assets/stickers/mood_excited.webp': '/assets/stickers/ocean_excited_leaping_shark.webp',
  '/assets/stickers/mood_sleepy.webp': '/assets/stickers/ocean_sleepy_resting_shark.webp',
  '/assets/stickers/mood_unsure.webp': '/assets/stickers/ocean_unsure_wondering_shark.webp',
  '/assets/stickers/child_persona.webp': '/assets/stickers/ocean_junior_snorkel_diver.webp',
  '/assets/stickers/adult_briefcase.webp': '/assets/stickers/ocean_waterproof_briefcase.webp',
  '/assets/stickers/caregiver_phone.webp': '/assets/stickers/ocean_waterproof_phone.webp',
  '/assets/stickers/language_globe.webp': '/assets/stickers/ocean_navigational_globe.webp',
  '/assets/stickers/trial_crown.webp': '/assets/stickers/ocean_golden_pearl_crown.webp',
  '/assets/stickers/home_house.webp': '/assets/stickers/ocean_beachside_cottage.webp',
  '/assets/stickers/car_ride.webp': '/assets/stickers/ocean_beach_cruiser_car.webp',
  '/assets/stickers/car_travel.webp': '/assets/stickers/ocean_beach_cruiser_car.webp',
  '/assets/stickers/car_on_my_way.webp': '/assets/stickers/ocean_beach_cruiser_car.webp',
  '/assets/stickers/pet_care.webp': '/assets/stickers/ocean_boat_dog_lifevest.webp',
  '/assets/stickers/pizza_slice.webp': '/assets/stickers/ocean_scallop_plate_pizza.webp',
  '/assets/stickers/about_id.webp': '/assets/stickers/ocean_scuba_id_badge.webp',

  // Batch 4 Weather, Rewards, Tools & Exploration
  '/assets/stickers/morning_sunrise.webp': '/assets/stickers/ocean_horizon_sunrise.webp',
  '/assets/stickers/evening_moon.webp': '/assets/stickers/ocean_night_crescent_moon.webp',
  '/assets/stickers/reward_trophy.webp': '/assets/stickers/ocean_golden_seahorse_trophy.webp',
  '/assets/stickers/star_gold.webp': '/assets/stickers/ocean_golden_starfish_badge.webp',
  '/assets/stickers/aac_core.webp': '/assets/stickers/ocean_golden_starfish_badge.webp',
  '/assets/stickers/aac_sentences.webp': '/assets/stickers/ocean_bubble_speech_bubble.webp',
  '/assets/stickers/aac_favorites.webp': '/assets/stickers/ocean_golden_seahorse_trophy.webp',
  '/assets/stickers/aac_food.webp': '/assets/stickers/ocean_pizza_slice.webp',
  '/assets/stickers/aac_drinks.webp': '/assets/stickers/ocean_seaglass_canteen.webp',
  '/assets/stickers/aac_activities.webp': '/assets/stickers/ocean_game_controller.webp',
  '/assets/stickers/aac_places.webp': '/assets/stickers/ocean_home_house.webp',
  '/assets/stickers/aac_people.webp': '/assets/stickers/ocean_child_persona.webp',
  '/assets/stickers/aac_feelings.webp': '/assets/stickers/ocean_seaglass_heart.webp',
  '/assets/stickers/aac_sensory.webp': '/assets/stickers/ocean_conch_headphones.webp',
  '/assets/stickers/aac_all_words.webp': '/assets/stickers/ocean_captains_logbook.webp',
  '/assets/stickers/feelings_thermometer.webp': '/assets/stickers/ocean_submarine_depth_meter.webp',
  '/assets/stickers/battery_meter.webp': '/assets/stickers/ocean_submarine_battery_gauge.webp',
  '/assets/stickers/calm_sparkles.webp': '/assets/stickers/ocean_bioluminescent_sparkles.webp',
  '/assets/stickers/quiet_voice.webp': '/assets/stickers/ocean_zipped_mouth_shark.webp',
  '/assets/stickers/speech_bubble.webp': '/assets/stickers/ocean_bubble_speech_bubble.webp',
  '/assets/stickers/science_flask.webp': '/assets/stickers/ocean_marine_science_flask.webp',
  '/assets/stickers/sunny_clear.webp': '/assets/stickers/ocean_sunny_island_weather.webp',
  '/assets/stickers/rain_cloud.webp': '/assets/stickers/ocean_raincloud_weather.webp',
  '/assets/stickers/snow_weather.webp': '/assets/stickers/ocean_arctic_iceberg_snow.webp',
  '/assets/stickers/travel_luggage.webp': '/assets/stickers/ocean_nautical_travel_trunk.webp',
  '/assets/stickers/stethoscope.webp': '/assets/stickers/ocean_marine_doctor_stethoscope.webp',

  // Batch 5 Adventures, Sensory Regulation & Outings
  '/assets/stickers/adventure_dentist.webp': '/assets/stickers/ocean_shark_tooth_dental.webp',
  '/assets/stickers/dentist_adventure.webp': '/assets/stickers/ocean_shark_tooth_dental.webp',
  '/assets/stickers/adventure_haircut.webp': '/assets/stickers/ocean_seashell_haircut_salon.webp',
  '/assets/stickers/haircut_adventure.webp': '/assets/stickers/ocean_seashell_haircut_salon.webp',
  '/assets/stickers/adventure_haircut_salon.webp': '/assets/stickers/ocean_seashell_haircut_salon.webp',
  '/assets/stickers/adventure_movie_cinema.webp': '/assets/stickers/ocean_seaside_movie_cinema.webp',
  '/assets/stickers/movie_cinema.webp': '/assets/stickers/ocean_seaside_movie_cinema.webp',
  '/assets/stickers/adventure_swimming_pool.webp': '/assets/stickers/ocean_lagoon_swimming_pool.webp',
  '/assets/stickers/swimming_pool.webp': '/assets/stickers/ocean_lagoon_swimming_pool.webp',
  '/assets/stickers/adventure_camping_tent.webp': '/assets/stickers/ocean_beachside_campfire_tent.webp',
  '/assets/stickers/camping_tent.webp': '/assets/stickers/ocean_beachside_campfire_tent.webp',
  '/assets/stickers/shopping_cart.webp': '/assets/stickers/ocean_coastal_market_cart.webp',
  '/assets/stickers/therapy_brain.webp': '/assets/stickers/ocean_scuba_diver_brain.webp',
  '/assets/stickers/sensory_loud_noise.webp': '/assets/stickers/ocean_marine_foghorn_siren.webp',
  '/assets/stickers/sensory_bright_lights.webp': '/assets/stickers/ocean_polarized_sunglasses.webp',
  '/assets/stickers/tennis_ball.webp': '/assets/stickers/ocean_beach_paddle_tennis.webp',
  '/assets/stickers/red_balloon.webp': '/assets/stickers/ocean_beach_ball_balloon.webp',
  '/assets/stickers/candy_treat.webp': '/assets/stickers/ocean_saltwater_taffy_candy.webp',
  '/assets/stickers/cutlery_meal.webp': '/assets/stickers/ocean_nautical_dining_cutlery.webp',
  '/assets/stickers/grounding_touch_hand.webp': '/assets/stickers/ocean_sea_pebble_grounding_hand.webp',
  '/assets/stickers/cloudy_weather.webp': '/assets/stickers/ocean_cloud_over_waves.webp',

  // Batch 6 Travel, Destinations, Living & Tools
  '/assets/stickers/adventure_restaurant.webp': '/assets/stickers/ocean_seaside_diner_booth.webp',
  '/assets/stickers/restaurant_adventure.webp': '/assets/stickers/ocean_seaside_diner_booth.webp',
  '/assets/stickers/dining_table_booth.webp': '/assets/stickers/ocean_seaside_diner_booth.webp',
  '/assets/stickers/adventure_museum_visit.webp': '/assets/stickers/ocean_maritime_aquarium_museum.webp',
  '/assets/stickers/museum_visit.webp': '/assets/stickers/ocean_maritime_aquarium_museum.webp',
  '/assets/stickers/adventure_bowling_alley.webp': '/assets/stickers/ocean_bowling_strike.webp',
  '/assets/stickers/bowling_alley.webp': '/assets/stickers/ocean_bowling_strike.webp',
  '/assets/stickers/bowling_pins_strike.webp': '/assets/stickers/ocean_bowling_strike.webp',
  '/assets/stickers/airplane_flight.webp': '/assets/stickers/ocean_coastal_seaplane_flight.webp',
  '/assets/stickers/boarding_ticket.webp': '/assets/stickers/ocean_ferry_boarding_pass.webp',
  '/assets/stickers/passport_book.webp': '/assets/stickers/ocean_expedition_passport.webp',
  '/assets/stickers/tablet_ipad.webp': '/assets/stickers/ocean_waterproof_tablet.webp',
  '/assets/stickers/clipboard_shutdown.webp': '/assets/stickers/ocean_waterproof_tablet.webp',
  '/assets/stickers/potted_plant.webp': '/assets/stickers/ocean_seashell_succulent_pot.webp',
  '/assets/stickers/clock_time.webp': '/assets/stickers/ocean_ship_bulkhead_clock.webp',
  '/assets/stickers/timer_clock.webp': '/assets/stickers/ocean_ship_bulkhead_clock.webp',
  '/assets/stickers/wall_clock.webp': '/assets/stickers/ocean_ship_bulkhead_clock.webp',
  '/assets/stickers/circle_carpet.webp': '/assets/stickers/ocean_wave_circle_rug.webp',
  '/assets/stickers/sensory_social_masking.webp': '/assets/stickers/ocean_wave_circle_rug.webp',
  '/assets/stickers/story_plans_change.webp': '/assets/stickers/ocean_wave_loop.webp',
  '/assets/stickers/plans_changed.webp': '/assets/stickers/ocean_wave_loop.webp',
  '/assets/stickers/locker_schedule.webp': '/assets/stickers/ocean_beach_bathhouse_locker.webp',
  '/assets/stickers/bone_treat.webp': '/assets/stickers/ocean_fish_stamp_dog_biscuit.webp',
  '/assets/stickers/story_sharing.webp': '/assets/stickers/ocean_treasure_toy_chest.webp',
  '/assets/stickers/sharing_toys.webp': '/assets/stickers/ocean_treasure_toy_chest.webp',
  '/assets/stickers/adventure_doctor_checkup.webp': '/assets/stickers/ocean_marine_doctor_stethoscope.webp',
  '/assets/stickers/adventure_doctor.webp': '/assets/stickers/ocean_marine_doctor_stethoscope.webp',
  '/assets/stickers/doctor_checkup.webp': '/assets/stickers/ocean_marine_doctor_stethoscope.webp',
  '/assets/stickers/paw_print.webp': '/assets/stickers/ocean_beach_sand_paw_print.webp',
  '/assets/stickers/ocean_wave.webp': '/assets/stickers/ocean_turquoise_barrel_wave.webp',
  '/assets/stickers/story_birthday.webp': '/assets/stickers/ocean_seaside_birthday_cake.webp',

  // Batch 7 Social Story Adventure Steps (Dental, Haircut, Doctor & Community)
  '/assets/stickers/waiting_room_couch.webp': '/assets/stickers/ocean_waiting_room_bench.webp',
  '/assets/stickers/waving_hand_hello.webp': '/assets/stickers/ocean_waving_hand_diver.webp',
  '/assets/stickers/padded_recliner_chair.webp': '/assets/stickers/ocean_dental_recliner_chair.webp',
  '/assets/stickers/open_mouth_wide.webp': '/assets/stickers/ocean_scuba_diver_open_mouth.webp',
  '/assets/stickers/open_mouth_lion.webp': '/assets/stickers/ocean_scuba_diver_open_mouth.webp',
  '/assets/stickers/open_welcome_door.webp': '/assets/stickers/ocean_porthole_welcome_door.webp',
  '/assets/stickers/restaurant_menu_book.webp': '/assets/stickers/ocean_seaside_menu_book.webp',
  '/assets/stickers/barbershop_pole.webp': '/assets/stickers/ocean_lighthouse_barber_pole.webp',
  '/assets/stickers/haircut_cape.webp': '/assets/stickers/ocean_haircut_styling_cape.webp',
  '/assets/stickers/water_spray_bottle.webp': '/assets/stickers/ocean_water_spray_mist_bottle.webp',
  '/assets/stickers/barber_neck_brush.webp': '/assets/stickers/ocean_barber_neck_duster_brush.webp',
  '/assets/stickers/salon_hand_mirror.webp': '/assets/stickers/ocean_seashell_hand_mirror.webp',
  '/assets/stickers/medical_clinic_building.webp': '/assets/stickers/ocean_marine_health_clinic.webp',
  '/assets/stickers/clinic_height_scale.webp': '/assets/stickers/ocean_clinic_height_scale.webp',
  '/assets/stickers/doctor_exam_bed.webp': '/assets/stickers/ocean_doctor_exam_table_bed.webp',
  '/assets/stickers/doctor_ear_light.webp': '/assets/stickers/ocean_doctor_ear_light_tool.webp',

  // Batch 8 Pool, Cinema, Bowling, Camping, Museum & Rewards
  '/assets/stickers/walking_pool_feet.webp': '/assets/stickers/ocean_walking_pool_feet.webp',
  '/assets/stickers/swim_goggles_floaties.webp': '/assets/stickers/ocean_swim_goggles_floaties.webp',
  '/assets/stickers/fluffy_beach_towel.webp': '/assets/stickers/ocean_fluffy_beach_towel.webp',
  '/assets/stickers/movie_projector_screen.webp': '/assets/stickers/ocean_movie_projector_screen.webp',
  '/assets/stickers/bowling_ball_holes.webp': '/assets/stickers/ocean_bowling_ball_holes.webp',
  '/assets/stickers/bowling_lane_bumpers.webp': '/assets/stickers/ocean_bowling_lane_bumpers.webp',
  '/assets/stickers/high_five_hands.webp': '/assets/stickers/ocean_high_five_hands.webp',
  '/assets/stickers/pine_trees_forest.webp': '/assets/stickers/ocean_coastal_dunes_pine_trees.webp',
  '/assets/stickers/campfire_marshmallows.webp': '/assets/stickers/ocean_campfire_marshmallows.webp',
  '/assets/stickers/camping_sleeping_bag.webp': '/assets/stickers/ocean_camping_sleeping_bag.webp',
  '/assets/stickers/museum_paper_map.webp': '/assets/stickers/ocean_aquarium_paper_map.webp',
  '/assets/stickers/museum_dinosaur_fossil.webp': '/assets/stickers/ocean_megalodon_fossil_exhibit.webp',
  '/assets/stickers/observing_magnifying_glass.webp': '/assets/stickers/ocean_seashell_magnifying_glass.webp',
  '/assets/stickers/game_controller.webp': '/assets/stickers/ocean_game_controller.webp',
  '/assets/stickers/birthday_gift_box.webp': '/assets/stickers/ocean_birthday_gift_box.webp',
  '/assets/stickers/birthday_cake_slice.webp': '/assets/stickers/ocean_seaside_birthday_cake.webp',
  '/assets/stickers/birthday_card.webp': '/assets/stickers/ocean_birthday_gift_box.webp',
};

export const FAIRYTALE_STICKER_SWAPS: Record<string, string> = {
  // Batch 1 Core Routine Swaps
  '/assets/stickers/alarm_clock.webp': '/assets/stickers/fairytale_tower_alarm_clock.webp',
  '/assets/stickers/clock_time.webp': '/assets/stickers/fairytale_tower_alarm_clock.webp',
  '/assets/stickers/routine_alarm_clock.webp': '/assets/stickers/fairytale_tower_alarm_clock.webp',

  '/assets/stickers/toothbrush.webp': '/assets/stickers/fairytale_magic_toothbrush.webp',
  '/assets/stickers/routine_toothbrush.webp': '/assets/stickers/fairytale_magic_toothbrush.webp',

  '/assets/stickers/clothes_dressed.webp': '/assets/stickers/fairytale_royal_cape.webp',
  '/assets/stickers/routine_clothes_dressed.webp': '/assets/stickers/fairytale_royal_cape.webp',
  '/assets/stickers/pants_folded.webp': '/assets/stickers/fairytale_royal_cape.webp',

  '/assets/stickers/pancakes_breakfast.webp': '/assets/stickers/fairytale_cloudberry_pancakes.webp',
  '/assets/stickers/breakfast_cereal.webp': '/assets/stickers/fairytale_cloudberry_pancakes.webp',

  '/assets/stickers/school_bus.webp': '/assets/stickers/fairytale_pumpkin_carriage.webp',

  '/assets/stickers/backpack_school.webp': '/assets/stickers/fairytale_unicorn_satchel.webp',
  '/assets/stickers/backpack.webp': '/assets/stickers/fairytale_unicorn_satchel.webp',

  '/assets/stickers/school_building.webp': '/assets/stickers/fairytale_castle_academy.webp',

  '/assets/stickers/sandwich_lunch.webp': '/assets/stickers/fairytale_crown_bento.webp',
  '/assets/stickers/lunch_box.webp': '/assets/stickers/fairytale_crown_bento.webp',

  '/assets/stickers/routine_water_drink.webp': '/assets/stickers/fairytale_crystal_potion_flask.webp',
  '/assets/stickers/drink_water.webp': '/assets/stickers/fairytale_crystal_potion_flask.webp',
  '/assets/stickers/fav_water.webp': '/assets/stickers/fairytale_crystal_potion_flask.webp',
  '/assets/stickers/water_bottle.webp': '/assets/stickers/fairytale_crystal_potion_flask.webp',

  '/assets/stickers/sneaker_shoes.webp': '/assets/stickers/fairytale_winged_shoes.webp',

  '/assets/stickers/shower_wash.webp': '/assets/stickers/fairytale_clawfoot_bath.webp',
  '/assets/stickers/bathtub_wash.webp': '/assets/stickers/fairytale_clawfoot_bath.webp',
  '/assets/stickers/bath_time.webp': '/assets/stickers/fairytale_clawfoot_bath.webp',
  '/assets/stickers/fav_bath.webp': '/assets/stickers/fairytale_clawfoot_bath.webp',
  '/assets/stickers/soap_wash_hands.webp': '/assets/stickers/fairytale_soap_wash_hands.webp',

  '/assets/stickers/apple_snack.webp': '/assets/stickers/fairytale_golden_apple.webp',

  '/assets/stickers/dinner_bowl.webp': '/assets/stickers/fairytale_royal_feast_stew.webp',
  '/assets/stickers/cooking_pot.webp': '/assets/stickers/fairytale_royal_feast_stew.webp',

  '/assets/stickers/bedtime_sleep.webp': '/assets/stickers/fairytale_canopy_bed.webp',
  '/assets/stickers/pajamas_sleep.webp': '/assets/stickers/fairytale_canopy_bed.webp',
  '/assets/stickers/pajamas_shorts.webp': '/assets/stickers/fairytale_canopy_bed.webp',

  '/assets/stickers/fairytale_mascot.webp': '/assets/stickers/fairytale_unicorn_fairy_mascot.webp',
  '/assets/stickers/turtle_mascot.webp': '/assets/stickers/fairytale_unicorn_fairy_mascot.webp',
  '/assets/stickers/bee_mascot.webp': '/assets/stickers/fairytale_unicorn_fairy_mascot.webp',

  // Batch 2 Activities, Snacks, Tools & Regulation Swaps
  '/assets/stickers/hot_cocoa.webp': '/assets/stickers/fairytale_castle_hot_cocoa.webp',
  '/assets/stickers/drink_cup.webp': '/assets/stickers/fairytale_castle_hot_cocoa.webp',

  '/assets/stickers/chocolate_bar.webp': '/assets/stickers/fairytale_royal_chocolate_bar.webp',
  '/assets/stickers/candy_treat.webp': '/assets/stickers/fairytale_royal_chocolate_bar.webp',

  '/assets/stickers/jigsaw_puzzle.webp': '/assets/stickers/fairytale_storybook_jigsaw_puzzle.webp',

  '/assets/stickers/fav_music.webp': '/assets/stickers/fairytale_star_melody_headphones.webp',
  '/assets/stickers/music_note.webp': '/assets/stickers/fairytale_star_melody_headphones.webp',
  '/assets/stickers/music_sensory.webp': '/assets/stickers/fairytale_star_melody_headphones.webp',

  '/assets/stickers/fav_love_heart.webp': '/assets/stickers/fairytale_crystal_gem_heart.webp',

  '/assets/stickers/fav_outside.webp': '/assets/stickers/fairytale_blossom_meadow.webp',
  '/assets/stickers/outdoor_sun.webp': '/assets/stickers/fairytale_blossom_meadow.webp',

  '/assets/stickers/fav_stop.webp': '/assets/stickers/fairytale_royal_shield_stop.webp',

  '/assets/stickers/fav_help_sos.webp': '/assets/stickers/fairytale_beacon_help_lantern.webp',

  '/assets/stickers/decision_wheel.webp': '/assets/stickers/fairytale_crystal_decision_wheel.webp',

  '/assets/stickers/spoons_energy.webp': '/assets/stickers/fairytale_stardust_energy_spoons.webp',

  '/assets/stickers/routine_writing_journal.webp': '/assets/stickers/fairytale_spellbook_journal.webp',

  '/assets/stickers/laundry_hamper.webp': '/assets/stickers/fairytale_woven_laundry_basket.webp',

  '/assets/stickers/refresh_repeat.webp': '/assets/stickers/fairytale_sparkle_refresh_loop.webp',

  '/assets/stickers/toy_box.webp': '/assets/stickers/fairytale_royal_toy_chest.webp',

  '/assets/stickers/homework_study.webp': '/assets/stickers/fairytale_study_scroll_inkpot.webp',

  // Batch 3 Moods, Personas, Hubs & Daily Living Swaps
  '/assets/stickers/mood_happy.webp': '/assets/stickers/fairytale_mood_happy.webp',
  '/assets/stickers/mood_calm.webp': '/assets/stickers/fairytale_mood_calm.webp',
  '/assets/stickers/mood_excited.webp': '/assets/stickers/fairytale_mood_excited.webp',
  '/assets/stickers/mood_sleepy.webp': '/assets/stickers/fairytale_mood_sleepy.webp',
  '/assets/stickers/mood_unsure.webp': '/assets/stickers/fairytale_mood_unsure.webp',

  '/assets/stickers/child_persona.webp': '/assets/stickers/fairytale_child_persona.webp',
  '/assets/stickers/adult_briefcase.webp': '/assets/stickers/fairytale_adult_briefcase.webp',
  '/assets/stickers/caregiver_phone.webp': '/assets/stickers/fairytale_caregiver_phone.webp',
  '/assets/stickers/language_globe.webp': '/assets/stickers/fairytale_language_globe.webp',
  '/assets/stickers/trial_crown.webp': '/assets/stickers/fairytale_trial_crown.webp',

  '/assets/stickers/about_id.webp': '/assets/stickers/fairytale_about_id.webp',
  '/assets/stickers/home_house.webp': '/assets/stickers/fairytale_home_house.webp',
  '/assets/stickers/car_ride.webp': '/assets/stickers/fairytale_car_ride.webp',
  '/assets/stickers/pet_care.webp': '/assets/stickers/fairytale_pet_care.webp',
  '/assets/stickers/pizza_slice.webp': '/assets/stickers/fairytale_pizza_slice.webp',

  // Batch 4 Weather, Rewards, Tools & Exploration
  '/assets/stickers/morning_sunrise.webp': '/assets/stickers/fairytale_morning_sunrise.webp',
  '/assets/stickers/sunrise.webp': '/assets/stickers/fairytale_morning_sunrise.webp',
  '/assets/stickers/evening_moon.webp': '/assets/stickers/fairytale_evening_moon.webp',
  '/assets/stickers/reward_trophy.webp': '/assets/stickers/fairytale_reward_trophy.webp',
  '/assets/stickers/star_gold.webp': '/assets/stickers/fairytale_star_gold.webp',
  '/assets/stickers/aac_core.webp': '/assets/stickers/fairytale_star_gold.webp',
  '/assets/stickers/aac_sentences.webp': '/assets/stickers/fairytale_speech_bubble.webp',
  '/assets/stickers/aac_favorites.webp': '/assets/stickers/fairytale_reward_trophy.webp',
  '/assets/stickers/aac_food.webp': '/assets/stickers/fairytale_pizza_slice.webp',
  '/assets/stickers/aac_drinks.webp': '/assets/stickers/fairytale_routine_water_drink.webp',
  '/assets/stickers/aac_activities.webp': '/assets/stickers/fairytale_game_controller.webp',
  '/assets/stickers/aac_places.webp': '/assets/stickers/fairytale_home_house.webp',
  '/assets/stickers/aac_people.webp': '/assets/stickers/fairytale_child_persona.webp',
  '/assets/stickers/aac_feelings.webp': '/assets/stickers/fairytale_fav_love_heart.webp',
  '/assets/stickers/aac_sensory.webp': '/assets/stickers/fairytale_star_melody_headphones.webp',
  '/assets/stickers/aac_all_words.webp': '/assets/stickers/fairytale_spellbook_journal.webp',
  '/assets/stickers/feelings_thermometer.webp': '/assets/stickers/fairytale_feelings_thermometer.webp',
  '/assets/stickers/battery_meter.webp': '/assets/stickers/fairytale_battery_meter.webp',
  '/assets/stickers/calm_sparkles.webp': '/assets/stickers/fairytale_calm_sparkles.webp',
  '/assets/stickers/quiet_voice.webp': '/assets/stickers/fairytale_quiet_voice.webp',
  '/assets/stickers/speech_bubble.webp': '/assets/stickers/fairytale_speech_bubble.webp',
  '/assets/stickers/science_flask.webp': '/assets/stickers/fairytale_science_flask.webp',
  '/assets/stickers/sunny_clear.webp': '/assets/stickers/fairytale_sunny_clear.webp',
  '/assets/stickers/rain_cloud.webp': '/assets/stickers/fairytale_rain_cloud.webp',
  '/assets/stickers/snow_weather.webp': '/assets/stickers/fairytale_snow_weather.webp',
  '/assets/stickers/travel_luggage.webp': '/assets/stickers/fairytale_travel_luggage.webp',
  '/assets/stickers/stethoscope.webp': '/assets/stickers/fairytale_stethoscope.webp',

  // Batch 5 Adventures, Sensory Regulation & Outings
  '/assets/stickers/adventure_dentist.webp': '/assets/stickers/fairytale_adventure_dentist.webp',
  '/assets/stickers/dentist_adventure.webp': '/assets/stickers/fairytale_adventure_dentist.webp',
  '/assets/stickers/adventure_haircut.webp': '/assets/stickers/fairytale_adventure_haircut.webp',
  '/assets/stickers/haircut_adventure.webp': '/assets/stickers/fairytale_adventure_haircut.webp',
  '/assets/stickers/adventure_haircut_salon.webp': '/assets/stickers/fairytale_adventure_haircut.webp',
  '/assets/stickers/adventure_movie_cinema.webp': '/assets/stickers/fairytale_adventure_movie_cinema.webp',
  '/assets/stickers/movie_cinema.webp': '/assets/stickers/fairytale_adventure_movie_cinema.webp',
  '/assets/stickers/adventure_swimming_pool.webp': '/assets/stickers/fairytale_adventure_swimming_pool.webp',
  '/assets/stickers/swimming_pool.webp': '/assets/stickers/fairytale_adventure_swimming_pool.webp',
  '/assets/stickers/adventure_camping_tent.webp': '/assets/stickers/fairytale_adventure_camping_tent.webp',
  '/assets/stickers/camping_tent.webp': '/assets/stickers/fairytale_adventure_camping_tent.webp',
  '/assets/stickers/shopping_cart.webp': '/assets/stickers/fairytale_shopping_cart.webp',
  '/assets/stickers/therapy_brain.webp': '/assets/stickers/fairytale_therapy_brain.webp',
  '/assets/stickers/sensory_loud_noise.webp': '/assets/stickers/fairytale_sensory_loud_noise.webp',
  '/assets/stickers/sensory_bright_lights.webp': '/assets/stickers/fairytale_sensory_bright_lights.webp',
  '/assets/stickers/tennis_ball.webp': '/assets/stickers/fairytale_tennis_ball.webp',
  '/assets/stickers/red_balloon.webp': '/assets/stickers/fairytale_red_balloon.webp',
  '/assets/stickers/candy_treat.webp': '/assets/stickers/fairytale_candy_treat.webp',
  '/assets/stickers/cutlery_meal.webp': '/assets/stickers/fairytale_cutlery_meal.webp',
  '/assets/stickers/grounding_touch_hand.webp': '/assets/stickers/fairytale_grounding_touch_hand.webp',
  '/assets/stickers/cloudy_weather.webp': '/assets/stickers/fairytale_cloudy_weather.webp',

  // Batch 6 Travel, Destinations, Living & Tools
  '/assets/stickers/adventure_restaurant.webp': '/assets/stickers/fairytale_adventure_restaurant.webp',
  '/assets/stickers/restaurant_adventure.webp': '/assets/stickers/fairytale_adventure_restaurant.webp',
  '/assets/stickers/dining_table_booth.webp': '/assets/stickers/fairytale_adventure_restaurant.webp',
  '/assets/stickers/adventure_museum_visit.webp': '/assets/stickers/fairytale_adventure_museum_visit.webp',
  '/assets/stickers/museum_visit.webp': '/assets/stickers/fairytale_adventure_museum_visit.webp',
  '/assets/stickers/adventure_bowling_alley.webp': '/assets/stickers/fairytale_adventure_bowling_alley.webp',
  '/assets/stickers/bowling_alley.webp': '/assets/stickers/fairytale_adventure_bowling_alley.webp',
  '/assets/stickers/bowling_pins_strike.webp': '/assets/stickers/fairytale_adventure_bowling_alley.webp',
  '/assets/stickers/airplane_flight.webp': '/assets/stickers/fairytale_airplane_flight.webp',
  '/assets/stickers/boarding_ticket.webp': '/assets/stickers/fairytale_boarding_ticket.webp',
  '/assets/stickers/passport_book.webp': '/assets/stickers/fairytale_passport_book.webp',
  '/assets/stickers/tablet_ipad.webp': '/assets/stickers/fairytale_tablet_ipad.webp',
  '/assets/stickers/clipboard_shutdown.webp': '/assets/stickers/fairytale_tablet_ipad.webp',
  '/assets/stickers/potted_plant.webp': '/assets/stickers/fairytale_potted_plant.webp',
  '/assets/stickers/clock_time.webp': '/assets/stickers/fairytale_clock_time.webp',
  '/assets/stickers/timer_clock.webp': '/assets/stickers/fairytale_clock_time.webp',
  '/assets/stickers/wall_clock.webp': '/assets/stickers/fairytale_clock_time.webp',
  '/assets/stickers/circle_carpet.webp': '/assets/stickers/fairytale_circle_carpet.webp',
  '/assets/stickers/sensory_social_masking.webp': '/assets/stickers/fairytale_circle_carpet.webp',
  '/assets/stickers/story_plans_change.webp': '/assets/stickers/fairytale_sparkle_refresh_loop.webp',
  '/assets/stickers/plans_changed.webp': '/assets/stickers/fairytale_sparkle_refresh_loop.webp',
  '/assets/stickers/locker_schedule.webp': '/assets/stickers/fairytale_locker_schedule.webp',
  '/assets/stickers/bone_treat.webp': '/assets/stickers/fairytale_bone_treat.webp',
  '/assets/stickers/story_sharing.webp': '/assets/stickers/fairytale_royal_toy_chest.webp',
  '/assets/stickers/sharing_toys.webp': '/assets/stickers/fairytale_royal_toy_chest.webp',
  '/assets/stickers/adventure_doctor_checkup.webp': '/assets/stickers/fairytale_doctor_stethoscope.webp',
  '/assets/stickers/adventure_doctor.webp': '/assets/stickers/fairytale_doctor_stethoscope.webp',
  '/assets/stickers/doctor_checkup.webp': '/assets/stickers/fairytale_doctor_stethoscope.webp',
  '/assets/stickers/paw_print.webp': '/assets/stickers/fairytale_paw_print.webp',
  '/assets/stickers/ocean_wave.webp': '/assets/stickers/fairytale_ocean_wave.webp',
  '/assets/stickers/story_birthday.webp': '/assets/stickers/fairytale_story_birthday.webp',
  '/assets/stickers/birthday_cake_slice.webp': '/assets/stickers/fairytale_story_birthday.webp',

  // Batch 7 Social Story Adventure Steps (Dental, Haircut, Doctor & Community)
  '/assets/stickers/waiting_room_couch.webp': '/assets/stickers/fairytale_waiting_room_couch.webp',
  '/assets/stickers/waving_hand_hello.webp': '/assets/stickers/fairytale_waving_hand_hello.webp',
  '/assets/stickers/padded_recliner_chair.webp': '/assets/stickers/fairytale_padded_recliner_chair.webp',
  '/assets/stickers/open_mouth_wide.webp': '/assets/stickers/fairytale_open_mouth_wide.webp',
  '/assets/stickers/open_mouth_lion.webp': '/assets/stickers/fairytale_open_mouth_wide.webp',
  '/assets/stickers/open_welcome_door.webp': '/assets/stickers/fairytale_open_welcome_door.webp',
  '/assets/stickers/restaurant_menu_book.webp': '/assets/stickers/fairytale_restaurant_menu_book.webp',
  '/assets/stickers/barbershop_pole.webp': '/assets/stickers/fairytale_barbershop_pole.webp',
  '/assets/stickers/haircut_cape.webp': '/assets/stickers/fairytale_haircut_cape.webp',
  '/assets/stickers/water_spray_bottle.webp': '/assets/stickers/fairytale_water_spray_bottle.webp',
  '/assets/stickers/barber_neck_brush.webp': '/assets/stickers/fairytale_barber_neck_brush.webp',
  '/assets/stickers/salon_hand_mirror.webp': '/assets/stickers/fairytale_salon_hand_mirror.webp',
  '/assets/stickers/medical_clinic_building.webp': '/assets/stickers/fairytale_medical_clinic_building.webp',
  '/assets/stickers/clinic_height_scale.webp': '/assets/stickers/fairytale_clinic_height_scale.webp',
  '/assets/stickers/doctor_exam_bed.webp': '/assets/stickers/fairytale_doctor_exam_bed.webp',
  '/assets/stickers/doctor_ear_light.webp': '/assets/stickers/fairytale_doctor_ear_light.webp',

  // Batch 8 Pool, Cinema, Bowling, Camping, Museum & Celebrations
  '/assets/stickers/walking_pool_feet.webp': '/assets/stickers/fairytale_walking_pool_feet.webp',
  '/assets/stickers/swim_goggles_floaties.webp': '/assets/stickers/fairytale_swim_goggles_floaties.webp',
  '/assets/stickers/fluffy_beach_towel.webp': '/assets/stickers/fairytale_fluffy_beach_towel.webp',
  '/assets/stickers/movie_projector_screen.webp': '/assets/stickers/fairytale_movie_projector_screen.webp',
  '/assets/stickers/bowling_ball_holes.webp': '/assets/stickers/fairytale_bowling_ball_holes.webp',
  '/assets/stickers/bowling_lane_bumpers.webp': '/assets/stickers/fairytale_bowling_lane_bumpers.webp',
  '/assets/stickers/high_five_hands.webp': '/assets/stickers/fairytale_high_five_hands.webp',
  '/assets/stickers/pine_trees_forest.webp': '/assets/stickers/fairytale_pine_trees_forest.webp',
  '/assets/stickers/campfire_marshmallows.webp': '/assets/stickers/fairytale_campfire_marshmallows.webp',
  '/assets/stickers/camping_sleeping_bag.webp': '/assets/stickers/fairytale_camping_sleeping_bag.webp',
  '/assets/stickers/museum_paper_map.webp': '/assets/stickers/fairytale_museum_paper_map.webp',
  '/assets/stickers/museum_dinosaur_fossil.webp': '/assets/stickers/fairytale_museum_dinosaur_fossil.webp',
  '/assets/stickers/observing_magnifying_glass.webp': '/assets/stickers/fairytale_observing_magnifying_glass.webp',
  '/assets/stickers/magnifying_glass.webp': '/assets/stickers/fairytale_observing_magnifying_glass.webp',
  '/assets/stickers/game_controller.webp': '/assets/stickers/fairytale_game_controller.webp',
  '/assets/stickers/birthday_gift_box.webp': '/assets/stickers/fairytale_birthday_gift_box.webp',
  '/assets/stickers/birthday_card.webp': '/assets/stickers/fairytale_birthday_gift_box.webp',
};

export const RACING_STICKER_SWAPS: Record<string, string> = {
  // Batch 1 Core Routine Swaps
  '/assets/stickers/alarm_clock.webp': '/assets/stickers/racing_alarm_clock.webp',
  '/assets/stickers/clock_time.webp': '/assets/stickers/racing_alarm_clock.webp',
  '/assets/stickers/routine_alarm_clock.webp': '/assets/stickers/racing_alarm_clock.webp',

  '/assets/stickers/toothbrush.webp': '/assets/stickers/racing_toothbrush.webp',
  '/assets/stickers/routine_toothbrush.webp': '/assets/stickers/racing_toothbrush.webp',

  '/assets/stickers/clothes_dressed.webp': '/assets/stickers/racing_clothes_dressed.webp',
  '/assets/stickers/routine_clothes_dressed.webp': '/assets/stickers/racing_clothes_dressed.webp',
  '/assets/stickers/pants_folded.webp': '/assets/stickers/racing_clothes_dressed.webp',

  '/assets/stickers/pancakes_breakfast.webp': '/assets/stickers/racing_pancakes_breakfast.webp',
  '/assets/stickers/breakfast_cereal.webp': '/assets/stickers/racing_pancakes_breakfast.webp',

  '/assets/stickers/school_bus.webp': '/assets/stickers/racing_school_bus.webp',

  '/assets/stickers/backpack_school.webp': '/assets/stickers/racing_backpack_school.webp',
  '/assets/stickers/backpack.webp': '/assets/stickers/racing_backpack_school.webp',

  '/assets/stickers/homework_study.webp': '/assets/stickers/racing_homework_study.webp',
  '/assets/stickers/folder_schoolwork.webp': '/assets/stickers/racing_homework_study.webp',

  '/assets/stickers/sandwich_lunch.webp': '/assets/stickers/racing_sandwich_lunch.webp',
  '/assets/stickers/lunch_box.webp': '/assets/stickers/racing_sandwich_lunch.webp',

  '/assets/stickers/routine_water_drink.webp': '/assets/stickers/racing_routine_water_drink.webp',
  '/assets/stickers/drink_water.webp': '/assets/stickers/racing_routine_water_drink.webp',
  '/assets/stickers/fav_water.webp': '/assets/stickers/racing_routine_water_drink.webp',
  '/assets/stickers/water_bottle.webp': '/assets/stickers/racing_routine_water_drink.webp',

  '/assets/stickers/sneaker_shoes.webp': '/assets/stickers/racing_sneaker_shoes.webp',

  '/assets/stickers/routine_toilet_restroom.webp': '/assets/stickers/racing_toilet_restroom.webp',
  '/assets/stickers/soap_wash_hands.webp': '/assets/stickers/racing_station_soap.webp',

  '/assets/stickers/routine_medicine_pill.webp': '/assets/stickers/racing_routine_medicine_pill.webp',
  '/assets/stickers/medications_health.webp': '/assets/stickers/racing_routine_medicine_pill.webp',

  '/assets/stickers/school_building.webp': '/assets/stickers/racing_school_building.webp',

  '/assets/stickers/shower_wash.webp': '/assets/stickers/racing_shower_wash.webp',
  '/assets/stickers/bathtub_wash.webp': '/assets/stickers/racing_shower_wash.webp',
  '/assets/stickers/bath_time.webp': '/assets/stickers/racing_shower_wash.webp',
  '/assets/stickers/fav_bath.webp': '/assets/stickers/racing_shower_wash.webp',

  '/assets/stickers/bedtime_sleep.webp': '/assets/stickers/racing_bedtime_sleep.webp',
  '/assets/stickers/pajamas_sleep.webp': '/assets/stickers/racing_bedtime_sleep.webp',
  '/assets/stickers/pajamas_shorts.webp': '/assets/stickers/racing_bedtime_sleep.webp',

  // Batch 2 Meals, Calming Tools, Mascot & Regulation Swaps
  // Apple snack kept as default apple per user preference

  '/assets/stickers/dinner_bowl.webp': '/assets/stickers/racing_dinner_bowl.webp',
  '/assets/stickers/cooking_pot.webp': '/assets/stickers/racing_dinner_bowl.webp',

  '/assets/stickers/racing_mascot.webp': '/assets/stickers/racing_mascot.webp',
  '/assets/stickers/bee_mascot.webp': '/assets/stickers/racing_mascot.webp',
  '/assets/stickers/turtle_mascot.webp': '/assets/stickers/racing_mascot.webp',

  '/assets/stickers/hot_cocoa.webp': '/assets/stickers/racing_hot_cocoa.webp',
  '/assets/stickers/drink_cup.webp': '/assets/stickers/racing_hot_cocoa.webp',

  '/assets/stickers/chocolate_bar.webp': '/assets/stickers/racing_chocolate_bar.webp',
  '/assets/stickers/candy_treat.webp': '/assets/stickers/racing_chocolate_bar.webp',

  '/assets/stickers/jigsaw_puzzle.webp': '/assets/stickers/racing_jigsaw_puzzle.webp',

  '/assets/stickers/fav_music.webp': '/assets/stickers/racing_fav_music.webp',
  '/assets/stickers/music_note.webp': '/assets/stickers/racing_fav_music.webp',
  '/assets/stickers/music_sensory.webp': '/assets/stickers/racing_fav_music.webp',
  '/assets/stickers/teen_headphones.webp': '/assets/stickers/racing_fav_music.webp',

  '/assets/stickers/fav_love_heart.webp': '/assets/stickers/racing_fav_love_heart.webp',

  '/assets/stickers/fav_outside.webp': '/assets/stickers/racing_fav_outside.webp',

  '/assets/stickers/fav_stop.webp': '/assets/stickers/racing_fav_stop.webp',

  '/assets/stickers/help_sos.webp': '/assets/stickers/racing_help_sos.webp',
  '/assets/stickers/fav_help_sos.webp': '/assets/stickers/racing_help_sos.webp',

  '/assets/stickers/decision_wheel.webp': '/assets/stickers/racing_decision_wheel.webp',

  '/assets/stickers/spoons_energy.webp': '/assets/stickers/racing_spoons_energy.webp',

  '/assets/stickers/routine_writing_journal.webp': '/assets/stickers/racing_routine_writing_journal.webp',
  '/assets/stickers/passport_book.webp': '/assets/stickers/racing_routine_writing_journal.webp',

  '/assets/stickers/toy_box.webp': '/assets/stickers/racing_toy_box.webp',

  // Batch 3 Moods, Personas, Onboarding & Places Swaps
  '/assets/stickers/mood_happy.webp': '/assets/stickers/racing_mood_happy.webp',
  '/assets/stickers/happy.webp': '/assets/stickers/racing_mood_happy.webp',

  '/assets/stickers/mood_calm.webp': '/assets/stickers/racing_mood_calm.webp',
  '/assets/stickers/calm.webp': '/assets/stickers/racing_mood_calm.webp',

  '/assets/stickers/mood_excited.webp': '/assets/stickers/racing_mood_excited.webp',
  '/assets/stickers/excited.webp': '/assets/stickers/racing_mood_excited.webp',

  '/assets/stickers/mood_sleepy.webp': '/assets/stickers/racing_mood_sleepy.webp',
  '/assets/stickers/sleepy.webp': '/assets/stickers/racing_mood_sleepy.webp',

  '/assets/stickers/mood_unsure.webp': '/assets/stickers/racing_mood_unsure.webp',
  '/assets/stickers/unsure.webp': '/assets/stickers/racing_mood_unsure.webp',

  '/assets/stickers/child_persona.webp': '/assets/stickers/racing_child_persona.webp',
  '/assets/stickers/persona.webp': '/assets/stickers/racing_child_persona.webp',

  '/assets/stickers/adult_briefcase.webp': '/assets/stickers/racing_adult_briefcase.webp',

  '/assets/stickers/caregiver_phone.webp': '/assets/stickers/racing_caregiver_phone.webp',

  '/assets/stickers/language_globe.webp': '/assets/stickers/racing_language_globe.webp',

  '/assets/stickers/trial_crown.webp': '/assets/stickers/racing_trial_crown.webp',

  '/assets/stickers/about_id.webp': '/assets/stickers/racing_about_id.webp',

  '/assets/stickers/home_house.webp': '/assets/stickers/racing_home_house.webp',
  '/assets/stickers/house.webp': '/assets/stickers/racing_home_house.webp',

  '/assets/stickers/car_ride.webp': '/assets/stickers/racing_car_ride.webp',

  '/assets/stickers/pet_care.webp': '/assets/stickers/racing_pet_care.webp',

  '/assets/stickers/pizza_slice.webp': '/assets/stickers/racing_pizza_slice.webp',

  // Batch 4 Weather, Sensory Regulation, Science & Travel Swaps
  '/assets/stickers/sunny_clear.webp': '/assets/stickers/racing_sunny_clear.webp',
  '/assets/stickers/sunny.webp': '/assets/stickers/racing_sunny_clear.webp',
  '/assets/stickers/sun.webp': '/assets/stickers/racing_sunny_clear.webp',

  '/assets/stickers/morning_sunrise.webp': '/assets/stickers/racing_morning_sunrise.webp',
  '/assets/stickers/sunrise.webp': '/assets/stickers/racing_morning_sunrise.webp',

  '/assets/stickers/evening_moon.webp': '/assets/stickers/racing_evening_moon.webp',
  '/assets/stickers/moon.webp': '/assets/stickers/racing_evening_moon.webp',

  '/assets/stickers/rain_cloud.webp': '/assets/stickers/racing_rain_cloud.webp',
  '/assets/stickers/rain.webp': '/assets/stickers/racing_rain_cloud.webp',

  '/assets/stickers/snow_weather.webp': '/assets/stickers/racing_snow_weather.webp',
  '/assets/stickers/snow.webp': '/assets/stickers/racing_snow_weather.webp',

  '/assets/stickers/science_flask.webp': '/assets/stickers/racing_science_flask.webp',
  '/assets/stickers/flask.webp': '/assets/stickers/racing_science_flask.webp',

  '/assets/stickers/stethoscope.webp': '/assets/stickers/racing_doctor_stethoscope.webp',
  '/assets/stickers/doctor_stethoscope.webp': '/assets/stickers/racing_doctor_stethoscope.webp',

  '/assets/stickers/travel_luggage.webp': '/assets/stickers/racing_travel_luggage.webp',
  '/assets/stickers/luggage.webp': '/assets/stickers/racing_travel_luggage.webp',

  '/assets/stickers/star_gold.webp': '/assets/stickers/racing_star_gold.webp',
  '/assets/stickers/star.webp': '/assets/stickers/racing_star_gold.webp',
  '/assets/stickers/aac_core.webp': '/assets/stickers/racing_star_gold.webp',
  '/assets/stickers/aac_sentences.webp': '/assets/stickers/racing_speech_bubble.webp',
  '/assets/stickers/aac_favorites.webp': '/assets/stickers/racing_reward_trophy.webp',
  '/assets/stickers/aac_food.webp': '/assets/stickers/racing_pizza_slice.webp',
  '/assets/stickers/aac_drinks.webp': '/assets/stickers/racing_water_drink.webp',
  '/assets/stickers/aac_activities.webp': '/assets/stickers/racing_game_controller.webp',
  '/assets/stickers/aac_places.webp': '/assets/stickers/racing_home_house.webp',
  '/assets/stickers/aac_people.webp': '/assets/stickers/racing_persona.webp',
  '/assets/stickers/aac_feelings.webp': '/assets/stickers/racing_heart.webp',
  '/assets/stickers/aac_sensory.webp': '/assets/stickers/racing_teen_headphones.webp',
  '/assets/stickers/aac_all_words.webp': '/assets/stickers/racing_homework_study.webp',

  '/assets/stickers/reward_trophy.webp': '/assets/stickers/racing_reward_trophy.webp',
  '/assets/stickers/trophy.webp': '/assets/stickers/racing_reward_trophy.webp',

  '/assets/stickers/battery_meter.webp': '/assets/stickers/racing_battery_meter.webp',
  '/assets/stickers/battery.webp': '/assets/stickers/racing_battery_meter.webp',

  '/assets/stickers/feelings_thermometer.webp': '/assets/stickers/racing_feelings_thermometer.webp',
  '/assets/stickers/thermometer.webp': '/assets/stickers/racing_feelings_thermometer.webp',

  '/assets/stickers/speech_bubble.webp': '/assets/stickers/racing_speech_bubble.webp',
  '/assets/stickers/speech.webp': '/assets/stickers/racing_speech_bubble.webp',

  '/assets/stickers/quiet_voice.webp': '/assets/stickers/racing_quiet_voice.webp',
  '/assets/stickers/quiet.webp': '/assets/stickers/racing_quiet_voice.webp',

  '/assets/stickers/calm_sparkles.webp': '/assets/stickers/racing_calm_sparkles.webp',
  '/assets/stickers/sparkles.webp': '/assets/stickers/racing_calm_sparkles.webp',

  // Batch 5 Adventures, Sensory Sensitivities, Play & Outings Swaps
  '/assets/stickers/adventure_dentist.webp': '/assets/stickers/racing_adventure_dentist.webp',
  '/assets/stickers/dentist.webp': '/assets/stickers/racing_adventure_dentist.webp',
  '/assets/stickers/dentist_adventure.webp': '/assets/stickers/racing_adventure_dentist.webp',

  '/assets/stickers/adventure_haircut_salon.webp': '/assets/stickers/racing_adventure_haircut.webp',
  '/assets/stickers/adventure_haircut.webp': '/assets/stickers/racing_adventure_haircut.webp',
  '/assets/stickers/haircut.webp': '/assets/stickers/racing_adventure_haircut.webp',
  '/assets/stickers/haircut_adventure.webp': '/assets/stickers/racing_adventure_haircut.webp',

  '/assets/stickers/adventure_swimming_pool.webp': '/assets/stickers/racing_adventure_swimming_pool.webp',
  '/assets/stickers/swimming_pool.webp': '/assets/stickers/racing_adventure_swimming_pool.webp',
  '/assets/stickers/swim.webp': '/assets/stickers/racing_adventure_swimming_pool.webp',

  '/assets/stickers/adventure_movie_cinema.webp': '/assets/stickers/racing_adventure_movie_cinema.webp',
  '/assets/stickers/movie_cinema.webp': '/assets/stickers/racing_adventure_movie_cinema.webp',
  '/assets/stickers/cinema.webp': '/assets/stickers/racing_adventure_movie_cinema.webp',

  '/assets/stickers/adventure_camping_tent.webp': '/assets/stickers/racing_adventure_camping_tent.webp',
  '/assets/stickers/camping_tent.webp': '/assets/stickers/racing_adventure_camping_tent.webp',
  '/assets/stickers/camping.webp': '/assets/stickers/racing_adventure_camping_tent.webp',

  '/assets/stickers/sensory_loud_noise.webp': '/assets/stickers/racing_sensory_loud_noise.webp',
  '/assets/stickers/loud_noise.webp': '/assets/stickers/racing_sensory_loud_noise.webp',

  '/assets/stickers/sensory_bright_lights.webp': '/assets/stickers/racing_sensory_bright_lights.webp',
  '/assets/stickers/bright_lights.webp': '/assets/stickers/racing_sensory_bright_lights.webp',

  '/assets/stickers/grounding_touch_hand.webp': '/assets/stickers/racing_grounding_touch_hand.webp',
  '/assets/stickers/touch_hand.webp': '/assets/stickers/racing_grounding_touch_hand.webp',

  '/assets/stickers/therapy_brain.webp': '/assets/stickers/racing_therapy_brain.webp',
  '/assets/stickers/brain.webp': '/assets/stickers/racing_therapy_brain.webp',

  '/assets/stickers/cloudy_weather.webp': '/assets/stickers/racing_cloudy_weather.webp',
  '/assets/stickers/cloudy.webp': '/assets/stickers/racing_cloudy_weather.webp',

  '/assets/stickers/candy_treat.webp': '/assets/stickers/racing_candy_treat_swirl.webp',
  '/assets/stickers/candy.webp': '/assets/stickers/racing_candy_treat_swirl.webp',

  '/assets/stickers/red_balloon.webp': '/assets/stickers/racing_red_balloon.webp',
  '/assets/stickers/balloon.webp': '/assets/stickers/racing_red_balloon.webp',

  '/assets/stickers/tennis_ball.webp': '/assets/stickers/racing_tennis_ball.webp',
  '/assets/stickers/ball.webp': '/assets/stickers/racing_tennis_ball.webp',

  '/assets/stickers/cutlery_meal.webp': '/assets/stickers/racing_cutlery_meal.webp',
  '/assets/stickers/cutlery.webp': '/assets/stickers/racing_cutlery_meal.webp',

  '/assets/stickers/shopping_cart.webp': '/assets/stickers/racing_shopping_cart.webp',
  '/assets/stickers/cart.webp': '/assets/stickers/racing_shopping_cart.webp',

  // Batch 6 Travel, Destinations, Living & Tools Swaps
  '/assets/stickers/adventure_restaurant.webp': '/assets/stickers/racing_adventure_restaurant.webp',
  '/assets/stickers/restaurant_adventure.webp': '/assets/stickers/racing_adventure_restaurant.webp',
  '/assets/stickers/dining_table_booth.webp': '/assets/stickers/racing_adventure_restaurant.webp',
  '/assets/stickers/adventure_museum_visit.webp': '/assets/stickers/racing_adventure_museum_visit.webp',
  '/assets/stickers/museum_visit.webp': '/assets/stickers/racing_adventure_museum_visit.webp',
  '/assets/stickers/adventure_bowling_alley.webp': '/assets/stickers/racing_adventure_bowling_alley.webp',
  '/assets/stickers/bowling_alley.webp': '/assets/stickers/racing_adventure_bowling_alley.webp',
  '/assets/stickers/bowling_pins_strike.webp': '/assets/stickers/racing_adventure_bowling_alley.webp',
  '/assets/stickers/airplane_flight.webp': '/assets/stickers/racing_airplane_flight.webp',
  '/assets/stickers/flight.webp': '/assets/stickers/racing_airplane_flight.webp',
  '/assets/stickers/boarding_ticket.webp': '/assets/stickers/racing_boarding_ticket.webp',
  '/assets/stickers/passport_book.webp': '/assets/stickers/racing_passport_book.webp',
  '/assets/stickers/tablet_ipad.webp': '/assets/stickers/racing_tablet_ipad.webp',
  '/assets/stickers/clipboard_shutdown.webp': '/assets/stickers/racing_tablet_ipad.webp',
  '/assets/stickers/potted_plant.webp': '/assets/stickers/racing_potted_plant.webp',
  '/assets/stickers/wall_clock.webp': '/assets/stickers/racing_wall_clock.webp',
  '/assets/stickers/timer_clock.webp': '/assets/stickers/racing_wall_clock.webp',
  '/assets/stickers/circle_carpet.webp': '/assets/stickers/racing_circle_carpet.webp',
  '/assets/stickers/sensory_social_masking.webp': '/assets/stickers/racing_circle_carpet.webp',
  '/assets/stickers/story_plans_change.webp': '/assets/stickers/racing_circuit_map.webp',
  '/assets/stickers/plans_changed.webp': '/assets/stickers/racing_circuit_map.webp',
  '/assets/stickers/locker_schedule.webp': '/assets/stickers/racing_locker_schedule.webp',
  '/assets/stickers/bone_treat.webp': '/assets/stickers/racing_bone_treat.webp',
  '/assets/stickers/story_sharing.webp': '/assets/stickers/racing_toy_chest.webp',
  '/assets/stickers/sharing_toys.webp': '/assets/stickers/racing_toy_chest.webp',
  '/assets/stickers/adventure_doctor_checkup.webp': '/assets/stickers/racing_doctor_stethoscope.webp',
  '/assets/stickers/adventure_doctor.webp': '/assets/stickers/racing_doctor_stethoscope.webp',
  '/assets/stickers/doctor_checkup.webp': '/assets/stickers/racing_doctor_stethoscope.webp',
  '/assets/stickers/paw_print.webp': '/assets/stickers/racing_paw_print.webp',
  '/assets/stickers/ocean_wave.webp': '/assets/stickers/racing_ocean_wave.webp',
  '/assets/stickers/story_birthday.webp': '/assets/stickers/racing_birthday_cake.webp',
  '/assets/stickers/birthday_cake_slice.webp': '/assets/stickers/racing_birthday_cake.webp',

  // Batch 7 Social Story Adventure Steps (Dental, Haircut, Doctor & Community) Swaps
  '/assets/stickers/waiting_room_couch.webp': '/assets/stickers/racing_waiting_room_couch.webp',
  '/assets/stickers/waving_hand_hello.webp': '/assets/stickers/racing_waving_hand_hello.webp',
  '/assets/stickers/padded_recliner_chair.webp': '/assets/stickers/racing_padded_recliner_chair.webp',
  '/assets/stickers/open_mouth_wide.webp': '/assets/stickers/racing_open_mouth_wide.webp',
  '/assets/stickers/open_mouth_lion.webp': '/assets/stickers/racing_open_mouth_wide.webp',
  '/assets/stickers/open_welcome_door.webp': '/assets/stickers/racing_open_welcome_door.webp',
  '/assets/stickers/restaurant_menu_book.webp': '/assets/stickers/racing_restaurant_menu_book.webp',
  '/assets/stickers/barbershop_pole.webp': '/assets/stickers/racing_barbershop_pole.webp',
  '/assets/stickers/haircut_cape.webp': '/assets/stickers/racing_haircut_cape.webp',
  '/assets/stickers/water_spray_bottle.webp': '/assets/stickers/racing_water_spray_bottle.webp',
  '/assets/stickers/barber_neck_brush.webp': '/assets/stickers/racing_barber_neck_brush.webp',
  '/assets/stickers/salon_hand_mirror.webp': '/assets/stickers/racing_salon_hand_mirror.webp',
  '/assets/stickers/medical_clinic_building.webp': '/assets/stickers/racing_medical_clinic_building.webp',
  '/assets/stickers/clinic_height_scale.webp': '/assets/stickers/racing_clinic_height_scale.webp',
  '/assets/stickers/doctor_exam_bed.webp': '/assets/stickers/racing_doctor_exam_bed.webp',
  '/assets/stickers/doctor_ear_light.webp': '/assets/stickers/racing_doctor_ear_light.webp',

  // Batch 8 Pool, Cinema, Bowling, Camping, Museum & Celebrations Swaps
  '/assets/stickers/walking_pool_feet.webp': '/assets/stickers/racing_walking_pool_feet.webp',
  '/assets/stickers/swim_goggles_floaties.webp': '/assets/stickers/racing_swim_goggles_floaties.webp',
  '/assets/stickers/fluffy_beach_towel.webp': '/assets/stickers/racing_fluffy_beach_towel.webp',
  '/assets/stickers/movie_projector_screen.webp': '/assets/stickers/racing_movie_projector_screen.webp',
  '/assets/stickers/bowling_ball_holes.webp': '/assets/stickers/racing_bowling_ball_holes.webp',
  '/assets/stickers/bowling_lane_bumpers.webp': '/assets/stickers/racing_bowling_lane_bumpers.webp',
  '/assets/stickers/high_five_hands.webp': '/assets/stickers/racing_high_five_hands.webp',
  '/assets/stickers/pine_trees_forest.webp': '/assets/stickers/racing_pine_trees_forest.webp',
  '/assets/stickers/campfire_marshmallows.webp': '/assets/stickers/racing_campfire_marshmallows.webp',
  '/assets/stickers/camping_sleeping_bag.webp': '/assets/stickers/racing_camping_sleeping_bag.webp',
  '/assets/stickers/museum_paper_map.webp': '/assets/stickers/racing_museum_paper_map.webp',
  '/assets/stickers/museum_dinosaur_fossil.webp': '/assets/stickers/racing_museum_dinosaur_fossil.webp',
  '/assets/stickers/observing_magnifying_glass.webp': '/assets/stickers/racing_observing_magnifying_glass.webp',
  '/assets/stickers/magnifying_glass.webp': '/assets/stickers/racing_observing_magnifying_glass.webp',
  '/assets/stickers/game_controller.webp': '/assets/stickers/racing_game_controller.webp',
  '/assets/stickers/birthday_gift_box.webp': '/assets/stickers/racing_birthday_gift_box.webp',
  '/assets/stickers/birthday_card.webp': '/assets/stickers/racing_birthday_gift_box.webp',
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
}> = ({ emoji, title, className = 'w-8 h-8', size, loading = 'eager' }) => {
  const normEmoji = (emoji || '').trim();
  const normTitle = (title || '').toLowerCase();
  const activeTheme = useActiveThemeCategory();
  const isTurtle = activeTheme === 'turtle';
  const isDino = activeTheme === 'dinosaur';
  const isFrog = activeTheme === 'frog';
  const isTrain = activeTheme === 'train';
  const isSpace = activeTheme === 'space';
  const isOcean = activeTheme === 'ocean';
  const isFairytale = activeTheme === 'fantasy' || activeTheme === 'magic';
  const isRacing = activeTheme === 'racing';

  // If already an uploaded custom image (data URL, blob URL, or external URL)
  if (
    normEmoji.startsWith('data:image/') ||
    normEmoji.startsWith('blob:') ||
    normEmoji.startsWith('http://') ||
    normEmoji.startsWith('https://')
  ) {
    return (
      <img
        src={normEmoji}
        alt={title || 'Custom icon'}
        className={`${className} object-contain select-none pointer-events-none rounded-xl drop-shadow-2xs`}
        style={size ? { width: size, height: size } : undefined}
        loading={loading}
        decoding="async"
      />
    );
  }

  // If already an image path or sticker asset
  if (normEmoji.startsWith('/') || normEmoji.includes('.webp') || normEmoji.includes('.png')) {
    const webpEmoji = normEmoji.startsWith('/assets/stickers/') ? normEmoji.replace(/\.png$/i, '.webp') : normEmoji;
    let finalSrc = webpEmoji;
    if (isTurtle && TURTLE_STICKER_SWAPS[webpEmoji]) {
      finalSrc = TURTLE_STICKER_SWAPS[webpEmoji];
    } else if (isDino && DINO_STICKER_SWAPS[webpEmoji]) {
      finalSrc = DINO_STICKER_SWAPS[webpEmoji];
    } else if (isFrog && FROG_STICKER_SWAPS[webpEmoji]) {
      finalSrc = FROG_STICKER_SWAPS[webpEmoji];
    } else if (isTrain && TRAIN_STICKER_SWAPS[webpEmoji]) {
      finalSrc = TRAIN_STICKER_SWAPS[webpEmoji];
    } else if (isSpace && SPACE_STICKER_SWAPS[webpEmoji]) {
      finalSrc = SPACE_STICKER_SWAPS[webpEmoji];
    } else if (isOcean && OCEAN_STICKER_SWAPS[webpEmoji]) {
      finalSrc = OCEAN_STICKER_SWAPS[webpEmoji];
    } else if (isFairytale && FAIRYTALE_STICKER_SWAPS[webpEmoji]) {
      finalSrc = FAIRYTALE_STICKER_SWAPS[webpEmoji];
    } else if (isRacing && RACING_STICKER_SWAPS[webpEmoji]) {
      finalSrc = RACING_STICKER_SWAPS[webpEmoji];
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
    (isTrain && (
      normEmoji === '🚂' ||
      normEmoji === '🐝' ||
      normEmoji.includes('train') ||
      normTitle.includes('train') ||
      normTitle.includes('conductor') ||
      normTitle.includes('leo') ||
      normTitle.includes('mascot') ||
      normTitle.includes('companion')
    )) ||
    normTitle.includes('conductor leo') ||
    normEmoji.includes('train_mascot')
  ) {
    return <TrainMascotSticker className={className} size={size} />;
  }

  // 🚂 Toys / Toy Trains / Blocks fallback when not on Train theme
  if (normEmoji === '🚂' || normTitle.includes('trains and blocks')) {
    return <ToyBoxSticker className={className} size={size} />;
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
  // 🐬 Ocean Splash / Diver Mascot
  if (
    normEmoji === '🐬' ||
    normTitle.includes('splash the dolphin') ||
    normTitle.includes('scuba diver') ||
    (isOcean && (normEmoji === '🐝' || normTitle.includes('mascot') || normTitle.includes('companion')))
  ) {
    return <OceanMascotSticker className={className} size={size} />;
  }
  // 🏎️ Turbo Speedway / Turbo Racer Mascot
  if (
    normEmoji === '🏎️' ||
    normEmoji === '🏎' ||
    normTitle.includes('turbo racer') ||
    (activeTheme === 'racing' && (normEmoji === '🐝' || normTitle.includes('mascot') || normTitle.includes('companion')))
  ) {
    return <RacingMascotSticker className={className} size={size} />;
  }
  // 🦄 Magic Fairytale / Stardust Unicorn Mascot
  if (
    normEmoji === '🦄' ||
    normTitle.includes('stardust unicorn') ||
    (activeTheme === 'fantasy' && (normEmoji === '🐝' || normTitle.includes('mascot') || normTitle.includes('companion')))
  ) {
    return <FairytaleMascotSticker className={className} size={size} />;
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
  if (normEmoji === '🫁' || normEmoji === '🧘' || normTitle.includes('lung') || normTitle.includes('breathing') || normTitle.includes('deep breath')) return <LungsBreathingSticker className={className} size={size} />;
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
  if (normEmoji === '🎂' || normTitle.includes('birthday party')) return <BirthdayStorySticker className={className} size={size} />;
  // 🍰 Cake Slice / Birthday Treat
  if (normEmoji === '🍰' || normTitle.includes('cake slice') || normTitle.includes('yummy treat')) return <BirthdayCakeSliceSticker className={className} size={size} />;
  // 🎁 Gift Box / Present
  if (normEmoji === '🎁' || normTitle.includes('gift') || normTitle.includes('present')) return <BirthdayGiftBoxSticker className={className} size={size} />;
  // 💌 Greeting Card / Birthday Card
  if (normEmoji === '💌' || normTitle.includes('birthday card') || (normTitle.includes('card') && !normTitle.includes('id') && !normTitle.includes('credit'))) return <BirthdayCardSticker className={className} size={size} />;
  // 👖 Pants / Folded Jeans
  if (normEmoji === '👖' || normTitle.includes('pants') || normTitle.includes('jeans')) return <PantsFoldedSticker className={className} size={size} />;
  // 🍼 Water bottle
  if (normEmoji === '🍼' || normTitle.includes('water bottle')) return <WaterBottleSticker className={className} size={size} />;
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
  if (normEmoji.includes('toy_box') || normTitle.includes('toy box') || normTitle.includes('clean up toys')) return <ToyBoxSticker className={className} size={size} />;
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
  if (normTitle.includes('mindful') || normTitle.includes('reset')) return <CalmSparklesSticker className={className} size={size} />;
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

/**
 * Resolves the themed badge sticker for the "Life Adventures" tab header.
 */
export function getAdventureTabSticker(themeCategory?: string | null): string {
  switch (themeCategory) {
    case 'turtle': return '/assets/stickers/turtle_reed_explorer_shoes.webp';
    case 'dinosaur': return '/assets/stickers/dino_expedition_log_book.webp';
    case 'frog': return '/assets/stickers/frog_explorer_backpack.webp';
    case 'train': return '/assets/stickers/train_passport_book.webp';
    case 'space': return '/assets/stickers/space_passport_book.webp';
    case 'ocean': return '/assets/stickers/ocean_expedition_passport.webp';
    case 'fantasy':
    case 'magic': return '/assets/stickers/fairytale_passport_book.webp';
    case 'racing': return '/assets/stickers/racing_passport_book.webp';
    default: return '/assets/stickers/passport_book.webp';
  }
}

/**
 * Resolves the themed badge sticker for the "Social Stories" tab header.
 */
export function getStoryTabSticker(themeCategory?: string | null): string {
  switch (themeCategory) {
    case 'turtle': return '/assets/stickers/turtle_firefly_lantern_book.webp';
    case 'dinosaur': return '/assets/stickers/dino_palm_leaf_folio.webp';
    case 'frog': return '/assets/stickers/frog_reed_school_folder.webp';
    case 'train': return '/assets/stickers/train_story_atlas.webp';
    case 'space': return '/assets/stickers/space_routine_writing_journal.webp';
    case 'ocean': return '/assets/stickers/ocean_captains_logbook.webp';
    case 'fantasy':
    case 'magic': return '/assets/stickers/fairytale_spellbook_journal.webp';
    case 'racing': return '/assets/stickers/racing_journal.webp';
    default: return '/assets/stickers/routine_writing_journal.webp';
  }
}
