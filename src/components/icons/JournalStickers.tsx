import React, { useState, useEffect } from 'react';

interface StickerProps {
  className?: string;
  size?: number;
}

function checkIsTurtleThemeActive(): boolean {
  try {
    if (typeof document !== 'undefined') {
      const cat = document.documentElement.dataset.themeCategory;
      const id = document.documentElement.dataset.themeId;
      if (cat === 'turtle' || id === 'theme-turtle') return true;
      if (id && id !== 'theme-turtle' && cat !== 'turtle') return false;
    }
    if (typeof localStorage !== 'undefined') {
      const savedId = localStorage.getItem('beeyou_active_theme_id');
      if (savedId === 'theme-turtle') return true;
    }
  } catch (e) {}
  return false;
}

function useIsTurtleTheme(): boolean {
  const [isTurtle, setIsTurtle] = useState<boolean>(() => checkIsTurtleThemeActive());

  useEffect(() => {
    const sync = () => setIsTurtle(checkIsTurtleThemeActive());
    sync();
    window.addEventListener('beeyou-theme-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('beeyou-theme-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return isTurtle;
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

const renderThemedStickerPng = (defaultSrc: string, turtleSrc: string, alt: string) => {
  const Component: React.FC<StickerProps> = ({ className = 'w-9 h-9', size }) => {
    const isTurtle = useIsTurtleTheme();
    return (
      <img
        src={isTurtle ? turtleSrc : defaultSrc}
        alt={alt}
        className={`${className} object-contain select-none pointer-events-none drop-shadow-2xs`}
        style={size ? { width: size, height: size } : undefined}
        loading="eager"
        decoding="async"
      />
    );
  };
  return Component;
};

// 🫧 Digital Fidgets (Watercolor shimmering bubbles)
export const FidgetBubblesSticker = renderStickerPng('/assets/stickers/fidget_bubbles.png', 'Fidget Bubbles');

// 🌬️ Calm Breathing (Watercolor breathing cloud with soft swirl)
export const BreathingCloudSticker = renderStickerPng('/assets/stickers/breathing_cloud.png', 'Calm Breathing Cloud');

// 🎡 Decision Wheel (Vintage carnival ferris wheel with pastel gondolas)
export const DecisionWheelSticker = renderStickerPng('/assets/stickers/decision_wheel.png', 'Decision Wheel');

// ⏱️ Countdown Timer / Pie Clock (Swaps to Sanctuary Sand Timer in Turtle Sanctuary theme)
export const CountdownTimerSticker = renderThemedStickerPng(
  '/assets/stickers/timer_clock.png',
  '/assets/stickers/turtle_sand_timer.png',
  'Countdown Timer Clock'
);

// 🚨 Ask for Help (SOS) (Watercolor emergency shield badge from reference)
export const ShieldSosSticker = renderStickerPng('/assets/stickers/help_sos.png', 'Help SOS Shield');

// 🔗 Connect Caregiver (Warm pink watercolor heart with bandaid from reference)
export const ConnectHeartSticker = renderStickerPng('/assets/stickers/caregiver_heart.png', 'Caregiver Heart');

// 🪪 About Me ID Card (Hand-drawn lanyard ID badge from reference)
export const IdCardSticker = renderStickerPng('/assets/stickers/about_id.png', 'About Me ID');

// 📖 Passport / Reading Book (Swaps to Firefly Lantern & Scroll in Turtle Sanctuary theme)
export const ReadingBookSticker = renderThemedStickerPng(
  '/assets/stickers/passport_book.png',
  '/assets/stickers/turtle_firefly_lantern_book.png',
  'Reading Book'
);

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
export const QuietTimeSticker = renderStickerPng('/assets/stickers/breathing_cloud.png', 'Quiet Time');
export const SpoonSticker = renderThemedStickerPng(
  '/assets/stickers/spoons_energy.png',
  '/assets/stickers/turtle_bamboo_spoons.png',
  'Spoon Energy'
);
export const MoodJournalSticker = renderStickerPng('/assets/stickers/passport_book.png', 'Mood Journal');
export const TabletIpadSticker = renderStickerPng('/assets/stickers/tablet_ipad.png', 'Tablet iPad');

// Morning Routine & School Step Stickers
export const AlarmClockSticker = renderThemedStickerPng(
  '/assets/stickers/alarm_clock.png',
  '/assets/stickers/turtle_dawn_bell_clock.png',
  'Wake Up Alarm Clock'
);
export const ToiletSticker = renderStickerPng('/assets/stickers/routine_toilet_restroom.png', 'Toilet Restroom');
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
export const SneakersSticker = renderStickerPng('/assets/stickers/sneaker_shoes.png', 'Shoes Sneakers');
export const AppleSticker = renderThemedStickerPng(
  '/assets/stickers/apple_snack.png',
  '/assets/stickers/turtle_garden_fruit_snack.png',
  'Healthy Apple Snack'
);
export const FolderSticker = renderStickerPng('/assets/stickers/folder_schoolwork.png', 'School Binder Folder');
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
export const ScienceFlaskSticker = renderStickerPng('/assets/stickers/science_flask.png', 'Science Flask');

// Onboarding, Personas & Feature Stickers
export const LanguageGlobeSticker = renderStickerPng('/assets/stickers/language_globe.png', 'Language Globe');
export const ChildPersonaSticker = renderStickerPng('/assets/stickers/child_persona.png', 'Child Persona (Teddy Bear)');
export const TeenHeadphonesSticker = renderThemedStickerPng(
  '/assets/stickers/teen_headphones.png',
  '/assets/stickers/turtle_shell_headphones.png',
  'Teen Headphones'
);
export const AdultBriefcaseSticker = renderStickerPng('/assets/stickers/adult_briefcase.png', 'Adult Briefcase');
export const CaregiverPhoneSticker = renderStickerPng('/assets/stickers/caregiver_phone.png', 'Caregiver Phone');
export const ScheduleCalendarSticker = renderStickerPng('/assets/stickers/schedule_calendar.png', 'Schedule Calendar');
export const TrialCrownSticker = renderStickerPng('/assets/stickers/trial_crown.png', '15-Day Free Trial Crown');

// Future Expansion Routine & Activity Stickers
export const BedtimeSleepSticker = renderStickerPng('/assets/stickers/bedtime_sleep.png', 'Bedtime Sleep');
export const DrinkWaterSticker = renderStickerPng('/assets/stickers/routine_water_drink.png', 'Drink Water');
export const PetCareSticker = renderStickerPng('/assets/stickers/pet_care.png', 'Pet Care');
export const MusicSensorySticker = renderStickerPng('/assets/stickers/music_sensory.png', 'Music Sensory');
export const OutdoorSunSticker = renderStickerPng('/assets/stickers/outdoor_sun.png', 'Outdoor Sunshine');
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
export const RewardTrophySticker = renderStickerPng('/assets/stickers/reward_trophy.png', 'Reward Trophy');
export const BathTimeSticker = renderThemedStickerPng(
  '/assets/stickers/bath_time.png',
  '/assets/stickers/turtle_warm_spring_bath.png',
  'Bath Time'
);
export const DinnerBowlSticker = renderThemedStickerPng(
  '/assets/stickers/dinner_bowl.png',
  '/assets/stickers/turtle_lotus_dinner_bowl.png',
  'Dinner Plate'
);
export const DrinkCupSticker = renderStickerPng('/assets/stickers/drink_cup.png', 'Drink Cup');
export const CandyTreatSticker = renderStickerPng('/assets/stickers/candy_treat.png', 'Candy Treat');
export const WallClockSticker = renderStickerPng('/assets/stickers/clock_time.png', 'Wall Clock');
export const CutlerySticker = renderStickerPng('/assets/stickers/fork_knife.png', 'Fork & Knife');
export const CarRideSticker = renderStickerPng('/assets/stickers/car_ride.png', 'Car Ride');
export const WindBreezeSticker = renderStickerPng('/assets/stickers/wind_breeze.png', 'Wind Breeze');
export const LungsInhalerSticker = renderStickerPng('/assets/stickers/lungs_inhaler.png', 'Lungs Inhaler');
export const RepeatLoopSticker = renderStickerPng('/assets/stickers/refresh_repeat.png', 'Repeat Loop');
export const AccessibilityHubSticker = renderStickerPng('/assets/stickers/accessibility_hub.png', 'Accessibility & Sensory Hub');

// User Provided Routine Replacements
export const LaptopExecutionSticker = renderStickerPng('/assets/stickers/laptop_execution.png', 'Laptop Execution Sprint');
export const ClipboardShutdownSticker = renderStickerPng('/assets/stickers/clipboard_shutdown.png', 'Daily Shutdown Prep');
export const GoldStarSticker = renderStickerPng('/assets/stickers/star_gold.png', 'Gold Star');
export const LockerScheduleSticker = renderStickerPng('/assets/stickers/locker_schedule.png', 'Locker & Daily Schedule');
export const PajamasShortsSticker = renderStickerPng('/assets/stickers/pajamas_shorts.png', 'Put on Pajamas');
export const BeeMascotSticker = renderStickerPng('/assets/stickers/bee_mascot.png', 'Bee Mascot Companion');
export const TurtleMascotSticker = renderStickerPng('/assets/stickers/turtle_mascot.png', 'Shelly the Wise Turtle');
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
export const CozyBedSticker = renderStickerPng('/assets/stickers/bedtime_sleep.png', 'Cozy Bedroom Bed');
export const GreenTreeSticker = renderStickerPng('/assets/stickers/fav_outside.png', 'Sunny Yard Green Tree');
export const GameControllerSticker = renderStickerPng('/assets/stickers/toy_box.png', 'Video Game Controller');
export const LungsBreathingSticker = renderStickerPng('/assets/stickers/coping_lungs_breathing.png', 'Deep Breathing Lungs');
export const RestNapSticker = renderStickerPng('/assets/stickers/fav_rest_tired.png', 'Cozy Rest Nap');
export const SickFeverSticker = renderStickerPng('/assets/stickers/feelings_thermometer.png', 'Feeling Unwell Fever');

// Table B User-Provided Outings, Coping, Pets & Wellness Stickers
export const PlanetSaturnSticker = renderStickerPng('/assets/stickers/planet_saturn.png', 'Planet Saturn');
export const AutumnLeafSticker = renderStickerPng('/assets/stickers/autumn_leaf.png', 'Autumn Leaf');
export const OceanWaveSticker = renderStickerPng('/assets/stickers/ocean_wave.png', 'Ocean Wave Overwhelmed');
export const BatteryMeterSticker = renderStickerPng('/assets/stickers/battery_meter.png', 'Battery Meter');
export const PawPrintSticker = renderStickerPng('/assets/stickers/paw_print.png', 'Pet Paw Print');
export const BoneTreatSticker = renderStickerPng('/assets/stickers/bone_treat.png', 'Dog Bone Treat');
export const TennisBallSticker = renderStickerPng('/assets/stickers/tennis_ball.png', 'Tennis Ball');
export const PottedPlantSticker = renderStickerPng('/assets/stickers/potted_plant.png', 'Potted Plant Care');
export const LaundryHamperSticker = renderStickerPng('/assets/stickers/laundry_hamper.png', 'Laundry Hamper');
export const ChocolateBarSticker = renderStickerPng('/assets/stickers/chocolate_bar.png', 'Comfort Chocolate Bar');
export const RedBalloonSticker = renderStickerPng('/assets/stickers/red_balloon.png', 'Red Balloon');
export const ShoppingCartSticker = renderStickerPng('/assets/stickers/shopping_cart.png', 'Supermarket Shopping Cart');
export const AirplaneFlightSticker = renderStickerPng('/assets/stickers/airplane_flight.png', 'Passenger Airplane Flight');
export const TravelLuggageSticker = renderStickerPng('/assets/stickers/travel_luggage.png', 'Travel Rolling Luggage');
export const BoardingTicketSticker = renderStickerPng('/assets/stickers/boarding_ticket.png', 'Boarding Pass Ticket');
export const QuietVoiceSticker = renderStickerPng('/assets/stickers/quiet_voice.png', 'Quiet Inside Voice');
export const HotCocoaSticker = renderStickerPng('/assets/stickers/hot_cocoa.png', 'Warm Hot Cocoa Mug');
export const JigsawPuzzleSticker = renderStickerPng('/assets/stickers/jigsaw_puzzle.png', 'Jigsaw Puzzle Piece');

// Table C Sensory Triggers, Daily Care & Community Adventures (User Provided Sheets)
export const BrightLightsSticker = renderStickerPng('/assets/stickers/sensory_bright_lights.png', 'Bright Lights Sensory Trigger');
export const LoudNoiseSticker = renderStickerPng('/assets/stickers/sensory_loud_noise.png', 'Loud Noise Sensitivity Trigger');
export const SocialMaskingSticker = renderStickerPng('/assets/stickers/sensory_social_masking.png', 'Social Masking Fatigue');
export const LungsBreathingStickerNew = renderStickerPng('/assets/stickers/coping_lungs_breathing.png', 'Deep Breathing Lungs Pacer');
export const WritingJournalSticker = renderStickerPng('/assets/stickers/routine_writing_journal.png', 'Writing & Journaling');
export const MedicinePillSticker = renderStickerPng('/assets/stickers/routine_medicine_pill.png', 'Daily Medication Pill');
export const ToiletRestroomSticker = renderStickerPng('/assets/stickers/routine_toilet_restroom.png', 'Toilet Restroom');
export const WaterDropSticker = renderStickerPng('/assets/stickers/routine_water_drink.png', 'Water Hydration Tracker');
export const HaircutSalonSticker = renderStickerPng('/assets/stickers/adventure_haircut_salon.png', 'Hair Salon Haircut');
export const DoctorCheckupSticker = renderStickerPng('/assets/stickers/adventure_doctor_checkup.png', 'Doctor Check-Up');
export const SwimmingPoolSticker = renderStickerPng('/assets/stickers/adventure_swimming_pool.png', 'Swimming Pool Outing');
export const MovieCinemaSticker = renderStickerPng('/assets/stickers/adventure_movie_cinema.png', 'Movie Cinema Theater');
export const BowlingAlleySticker = renderStickerPng('/assets/stickers/adventure_bowling_alley.png', 'Bowling Alley Outing');
export const CampingTentSticker = renderStickerPng('/assets/stickers/adventure_camping_tent.png', 'Camping Adventure Tent');
export const MuseumVisitSticker = renderStickerPng('/assets/stickers/adventure_museum_visit.png', 'Museum Visit Columns');

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
export const HaircutAdventureSticker = renderStickerPng('/assets/stickers/adventure_haircut_salon.png', 'Getting a Haircut');
export const DoctorAdventureSticker = renderStickerPng('/assets/stickers/adventure_doctor_checkup.png', 'Doctor Check-Up');
export const PlansChangeStorySticker = renderStickerPng('/assets/stickers/story_plans_change.png', 'When Plans Change');
export const BirthdayStorySticker = renderStickerPng('/assets/stickers/story_birthday.png', 'Going to a Birthday Party');
export const TakingTurnsStorySticker = renderStickerPng('/assets/stickers/story_sharing.png', 'Taking Turns with Toys');
export const StethoscopeSticker = renderStickerPng('/assets/stickers/stethoscope.png', 'Stethoscope / Doctor');
export const RainCloudSticker = renderStickerPng('/assets/stickers/rain_cloud.png', 'Rainy Day');
export const PartlyCloudySticker = renderStickerPng('/assets/stickers/partly_cloudy.png', 'Partly Cloudy');
export const CloudyWeatherSticker = renderStickerPng('/assets/stickers/cloudy_weather.png', 'Overcast Cloudy Weather');
export const SnowWeatherSticker = renderStickerPng('/assets/stickers/snow_weather.png', 'Snow & Flurries');
export const ThunderstormWeatherSticker = renderStickerPng('/assets/stickers/thunderstorm_weather.png', 'Thunderstorm');
export const WindyWeatherSticker = renderStickerPng('/assets/stickers/windy_weather.png', 'Windy Breeze');
export const FogMistWeatherSticker = renderStickerPng('/assets/stickers/fog_mist_weather.png', 'Fog & Mist Weather');
export const RainbowWeatherSticker = renderStickerPng('/assets/stickers/rainbow_weather.png', 'Rainbow Weather');
export const HomeHouseSticker = renderStickerPng('/assets/stickers/home_house.png', 'Home House');
export const TaskDoneSticker = renderStickerPng('/assets/stickers/task_done.png', 'Task Done Checkmark');
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
export const MoodHappySticker = renderStickerPng('/assets/stickers/mood_happy.png', 'Happy Mood');
export const MoodCalmSticker = renderStickerPng('/assets/stickers/mood_calm.png', 'Calm Mood');
export const MoodExcitedSticker = renderStickerPng('/assets/stickers/mood_excited.png', 'Excited Mood');
export const MoodSleepySticker = renderStickerPng('/assets/stickers/mood_sleepy.png', 'Sleepy Mood');
export const MoodUnsureSticker = renderStickerPng('/assets/stickers/mood_unsure.png', 'Unsure Mood');

// Favorite Sentences Yellow Stickers
export const FavLegoSticker = renderStickerPng('/assets/stickers/fav_lego.png', 'Lego Blocks');
export const FavBathSticker = renderThemedStickerPng(
  '/assets/stickers/fav_bath.png',
  '/assets/stickers/turtle_warm_spring_bath.png',
  'Take a Bath'
);
export const FavSandwichSticker = renderStickerPng('/assets/stickers/fav_sandwich.png', 'Sandwich Snack');
export const FavWaterSticker = renderStickerPng('/assets/stickers/fav_water.png', 'Drink Water');
export const FavQuietBreakSticker = renderStickerPng('/assets/stickers/fav_quiet_break.png', 'Quiet Break');
export const FavHelpSosSticker = renderStickerPng('/assets/stickers/fav_help_sos.png', 'Help Please');
export const FavOutsideSticker = renderStickerPng('/assets/stickers/fav_outside.png', 'Go Outside');
export const FavLoveHeartSticker = renderStickerPng('/assets/stickers/fav_love_heart.png', 'I Love You');
export const FavRestTiredSticker = renderStickerPng('/assets/stickers/fav_rest_tired.png', 'Rest and Sleep');
export const FavMusicSticker = renderStickerPng('/assets/stickers/fav_music.png', 'Listen to Music');
export const FavStopSticker = renderStickerPng('/assets/stickers/fav_stop.png', 'Stop Please');
export const FavHappySticker = renderStickerPng('/assets/stickers/fav_happy.png', 'I Am Happy');

// User Provided Grounding, Cooking & Caregiver Response Stickers
export const EyeSeeSticker = renderStickerPng('/assets/stickers/eye_see.png', 'Look Around Eye');
export const GroundingTouchHandSticker = renderStickerPng('/assets/stickers/grounding_touch_hand.png', 'Touch Hand');
export const GroundingHearEarSticker = renderStickerPng('/assets/stickers/grounding_hear_ear.png', 'Hear Ear');
export const GroundingSmellNoseSticker = renderStickerPng('/assets/stickers/grounding_smell_nose.png', 'Smell Nose');
export const CookingPotSticker = renderStickerPng('/assets/stickers/cooking_pot.png', 'Cooking Pan');
export const CaregiverResponseOkaySticker = renderStickerPng('/assets/stickers/caregiver_response_okay.png', 'Caregiver Okay Thumbs Up');

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
    return (
      <img
        src={normEmoji}
        alt={title || ''}
        className={`${className} object-contain select-none pointer-events-none drop-shadow-2xs`}
        style={size ? { width: size, height: size } : undefined}
        loading="eager"
        decoding="async"
      />
    );
  }

  // 📅 Visual Schedule & Routine / Calendar
  if (normEmoji === '📅' || normTitle.includes('visual schedule') || normTitle.includes('schedule & routine') || normTitle.includes('calendar')) return <ScheduleCalendarSticker className={className} size={size} />;
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
    if (normEmoji.includes('lily') || normEmoji.includes('pad') || normTitle.includes('lily') || normTitle.includes('pad')) return <TurtleLilyPadsSticker className={className} size={size} />;
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



