export interface ThemedIconItem {
  id: string;
  value: string;
  label: string;
  shortLabel: string;
  themeCategory: 'turtle' | 'classic' | 'dinosaur' | 'space' | 'magic' | 'train' | 'rocker' | 'all';
  keywords: string[];
}

export const TURTLE_SANCTUARY_ICONS: ThemedIconItem[] = [
  {
    id: 'turtle_mascot',
    value: '/assets/stickers/turtle_mascot.png',
    label: 'Shelly the Wise Turtle (Mascot)',
    shortLabel: 'Shelly Mascot',
    themeCategory: 'turtle',
    keywords: ['turtle', 'shelly', 'mascot', 'calm', 'guide', 'companion', 'peaceful'],
  },
  {
    id: 'turtle_swimming',
    value: '/assets/stickers/turtle_swimming.png',
    label: 'Swimming Turtle (Pacing & Movement)',
    shortLabel: 'Swimming Turtle',
    themeCategory: 'turtle',
    keywords: ['swim', 'swimming', 'turtle', 'pacing', 'slow', 'steady', 'exercise', 'movement'],
  },
  {
    id: 'turtle_lily_pads',
    value: '/assets/stickers/turtle_lily_pads.png',
    label: 'Quiet Break Lily Pads',
    shortLabel: 'Lily Pads',
    themeCategory: 'turtle',
    keywords: ['lily', 'pad', 'break', 'quiet', 'rest', 'pond', 'relax', 'calm'],
  },
  {
    id: 'turtle_pond_reeds',
    value: '/assets/stickers/turtle_pond_reeds.png',
    label: 'Serene Lagoon & Reeds',
    shortLabel: 'Pond Reeds',
    themeCategory: 'turtle',
    keywords: ['reed', 'reeds', 'pond', 'lagoon', 'nature', 'sound', 'ambient', 'music', 'water'],
  },
  {
    id: 'turtle_river_stone',
    value: '/assets/stickers/turtle_river_stone.png',
    label: 'Smooth River Worry Stone',
    shortLabel: 'River Stone',
    themeCategory: 'turtle',
    keywords: ['stone', 'river', 'rock', 'worry', 'grounding', 'tactile', 'fidget', 'calm'],
  },
  {
    id: 'turtle_leaf_water_drop',
    value: '/assets/stickers/turtle_leaf_water_drop.png',
    label: 'Leaf with Water Dewdrop',
    shortLabel: 'Dewdrop Leaf',
    themeCategory: 'turtle',
    keywords: ['leaf', 'water', 'dewdrop', 'drop', 'drink', 'hydrate', 'thirst', 'nature'],
  },
  {
    id: 'turtle_welcome_sign',
    value: '/assets/stickers/turtle_welcome_sign.png',
    label: 'Welcome Sign with Vines',
    shortLabel: 'Welcome Sign',
    themeCategory: 'turtle',
    keywords: ['welcome', 'sign', 'morning', 'arrival', 'start', 'door', 'greeting', 'vine'],
  },
  {
    id: 'turtle_potted_fern',
    value: '/assets/stickers/turtle_potted_fern.png',
    label: 'Potted Fern Fronds',
    shortLabel: 'Potted Fern',
    themeCategory: 'turtle',
    keywords: ['fern', 'potted', 'plant', 'breathe', 'breathing', 'care', 'nature', 'calm'],
  },
  {
    id: 'turtle_arched_bridge',
    value: '/assets/stickers/turtle_arched_bridge.png',
    label: 'Arched Garden Bridge',
    shortLabel: 'Garden Bridge',
    themeCategory: 'turtle',
    keywords: ['bridge', 'transition', 'garden', 'walk', 'path', 'next', 'step', 'change'],
  },
  {
    id: 'turtle_tracks',
    value: '/assets/stickers/turtle_tracks.png',
    label: 'Webbed Turtle Footprints',
    shortLabel: 'Turtle Tracks',
    themeCategory: 'turtle',
    keywords: ['track', 'tracks', 'footprint', 'footprints', 'step', 'walk', 'path', 'shoes'],
  },
  {
    id: 'turtle_sprouting_seedling',
    value: '/assets/stickers/turtle_sprouting_seedling.png',
    label: 'Sprouting Seedling in Soil',
    shortLabel: 'Seedling',
    themeCategory: 'turtle',
    keywords: ['seedling', 'sprout', 'grow', 'soil', 'learn', 'study', 'school', 'growth'],
  },
  {
    id: 'turtle_egg_nest',
    value: '/assets/stickers/turtle_egg_nest.png',
    label: 'Speckled Egg in Sand Nest',
    shortLabel: 'Egg in Nest',
    themeCategory: 'turtle',
    keywords: ['egg', 'nest', 'sand', 'bed', 'cozy', 'sleep', 'home', 'night', 'rest'],
  },
];

export const OTHER_THEMED_ICONS: ThemedIconItem[] = [
  {
    id: 'bee_mascot',
    value: '/assets/stickers/bee_mascot.png',
    label: 'Bee Mascot Companion',
    shortLabel: 'Bee Mascot',
    themeCategory: 'classic',
    keywords: ['bee', 'mascot', 'companion', 'cute'],
  },
  {
    id: 'morning_sunrise',
    value: '/assets/stickers/morning_sunrise.png',
    label: 'Morning Sunrise Superstar',
    shortLabel: 'Morning Sunrise',
    themeCategory: 'classic',
    keywords: ['morning', 'sun', 'sunrise', 'start', 'day'],
  },
  {
    id: 'rainbow_heart',
    value: '/assets/stickers/rainbow_heart.png',
    label: 'Rainbow Heart Explorer',
    shortLabel: 'Rainbow Heart',
    themeCategory: 'classic',
    keywords: ['rainbow', 'heart', 'feelings', 'love', 'kindness'],
  },
  {
    id: 'dino_rex',
    value: '/assets/stickers/dino_rex.png',
    label: 'Friendly Dinosaur Rex',
    shortLabel: 'Dino Rex',
    themeCategory: 'dinosaur',
    keywords: ['dino', 'dinosaur', 'rex', 'jurassic'],
  },
  {
    id: 'astronaut_helmet',
    value: '/assets/stickers/astronaut_helmet.png',
    label: 'Cosmic Astronaut Helmet',
    shortLabel: 'Astronaut',
    themeCategory: 'space',
    keywords: ['astronaut', 'space', 'helmet', 'cosmic'],
  },
  {
    id: 'rocket_adventure',
    value: '/assets/stickers/rocket_adventure.png',
    label: 'Rocket Adventure Spotlight',
    shortLabel: 'Rocket Ship',
    themeCategory: 'space',
    keywords: ['rocket', 'space', 'adventure', 'ship'],
  },
  {
    id: 'magic_wand',
    value: '/assets/stickers/magic_wand.png',
    label: 'Magic Star Wand',
    shortLabel: 'Magic Wand',
    themeCategory: 'magic',
    keywords: ['magic', 'wand', 'star', 'spell'],
  },
  {
    id: 'golden_train',
    value: '/assets/stickers/golden_train.png',
    label: 'Golden Locomotive Train',
    shortLabel: 'Golden Train',
    themeCategory: 'train',
    keywords: ['train', 'locomotive', 'track', 'ride'],
  },
  {
    id: 'guitar_rocker',
    value: '/assets/stickers/guitar_rocker.png',
    label: 'Electric Guitar Rocker',
    shortLabel: 'Guitar',
    themeCategory: 'rocker',
    keywords: ['guitar', 'music', 'rock', 'instrument'],
  },
];

export function getThemedIcons(themeCategoryOrId?: string): ThemedIconItem[] {
  if (!themeCategoryOrId) return TURTLE_SANCTUARY_ICONS;
  const isTurtle = themeCategoryOrId === 'turtle' || themeCategoryOrId === 'theme-turtle';
  if (isTurtle) {
    return TURTLE_SANCTUARY_ICONS;
  }
  return OTHER_THEMED_ICONS.filter(
    (item) => item.themeCategory === themeCategoryOrId || themeCategoryOrId.includes(item.themeCategory)
  );
}
