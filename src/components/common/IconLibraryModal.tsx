import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Palette, Check } from 'lucide-react';
import { RoutineStickerIcon } from '../icons/JournalStickers';
import { playChime } from '../../utils/audio';
import { useApp } from '../../context/AppContext';
import { DINO_KINGDOM_ICONS } from '../../data/themedIconsData';

export interface LibraryIconItem {
  id: string;
  emoji: string;
  label: string;
  category: 'fun' | 'calm' | 'food' | 'daily' | 'turtle' | 'dinosaur';
  keywords: string[];
}

export const ICON_LIBRARY: LibraryIconItem[] = [
  // Fun & Play
  { id: 'art', emoji: '🎨', label: 'Art & Crafts', category: 'fun', keywords: ['art', 'draw', 'paint', 'craft', 'color'] },
  { id: 'toys', emoji: '🧸', label: 'Toys & Teddy', category: 'fun', keywords: ['toy', 'teddy', 'play', 'bear', 'stuffed'] },
  { id: 'puzzle', emoji: '🧩', label: 'Puzzle & Blocks', category: 'fun', keywords: ['puzzle', 'fidget', 'block', 'lego', 'build'] },
  { id: 'playground', emoji: '🛝', label: 'Playground', category: 'fun', keywords: ['playground', 'swing', 'slide', 'park', 'recess'] },
  { id: 'tablet', emoji: '📱', label: 'Tablet & iPad', category: 'fun', keywords: ['tablet', 'ipad', 'screen', 'device', 'game'] },
  { id: 'games', emoji: '🎮', label: 'Video Games', category: 'fun', keywords: ['game', 'controller', 'playstation', 'nintendo', 'gaming'] },
  { id: 'music', emoji: '🎵', label: 'Music & Audio', category: 'fun', keywords: ['music', 'song', 'listen', 'sound', 'melody'] },
  { id: 'reading', emoji: '📖', label: 'Story & Books', category: 'fun', keywords: ['book', 'read', 'story', 'literature'] },
  { id: 'science', emoji: '🔬', label: 'Science Flask', category: 'fun', keywords: ['science', 'flask', 'experiment', 'lab', 'explore'] },
  { id: 'trophy', emoji: '🏆', label: 'Reward Trophy', category: 'fun', keywords: ['trophy', 'reward', 'win', 'prize', 'success'] },
  { id: 'gold_star', emoji: '⭐', label: 'Gold Star Reward', category: 'fun', keywords: ['star', 'gold', 'reward', 'achievement', 'win'] },
  { id: 'target', emoji: '🎯', label: 'Target / Focus Sprint', category: 'fun', keywords: ['target', 'bullseye', 'focus', 'deep work', 'goal', 'sprint'] },
  { id: 'bee_mascot', emoji: '🐝', label: 'Bee Mascot Companion', category: 'fun', keywords: ['bee', 'mascot', 'companion', 'cute'] },
  { id: 'rocket_ship', emoji: '🚀', label: "Today's Rocket Adventure", category: 'fun', keywords: ['rocket', 'adventure', 'space', 'ship'] },
  { id: 'balloons', emoji: '🎈', label: 'Celebration', category: 'fun', keywords: ['party', 'balloon', 'fun', 'celebrate'] },

  // Calm & Sensory
  { id: 'quiet', emoji: '🛋️', label: 'Quiet Break', category: 'calm', keywords: ['break', 'quiet', 'couch', 'relax', 'fort', 'chill', 'sofa'] },
  { id: 'bubbles', emoji: '🫧', label: 'Fidget Bubbles', category: 'calm', keywords: ['fidget', 'bubble', 'sensory', 'squishy', 'pop'] },
  { id: 'headphones', emoji: '🎧', label: 'Headphones', category: 'calm', keywords: ['headphone', 'audio', 'earmuffs', 'calm', 'decompress'] },
  { id: 'star', emoji: '⭐', label: 'Mindful Calm', category: 'calm', keywords: ['star', 'calm', 'mindful', 'reset', 'peaceful'] },
  { id: 'breathe', emoji: '🌬️', label: 'Deep Breathing', category: 'calm', keywords: ['breathe', 'wind', 'air', 'inhale', 'exhale'] },
  { id: 'rest', emoji: '🌙', label: 'Evening Rest', category: 'calm', keywords: ['rest', 'night', 'moon', 'relax', 'bedtime'] },
  { id: 'bed', emoji: '🛏️', label: 'Bed & Nap', category: 'calm', keywords: ['sleep', 'nap', 'bed', 'blanket', 'lie down'] },
  { id: 'bath', emoji: '🛁', label: 'Warm Bath', category: 'calm', keywords: ['bath', 'tub', 'water', 'bubbles', 'relax'] },
  { id: 'pet', emoji: '🐕', label: 'Pet Snuggle', category: 'calm', keywords: ['pet', 'dog', 'puppy', 'cat', 'snuggle', 'animal'] },
  { id: 'heart', emoji: '❤️', label: 'Gentle Comfort', category: 'calm', keywords: ['heart', 'love', 'comfort', 'care', 'safe'] },

  // Food & Drinks
  { id: 'pizza', emoji: '🍕', label: 'Pizza Lunch', category: 'food', keywords: ['pizza', 'lunch', 'slice', 'dinner'] },
  { id: 'pancakes', emoji: '🥞', label: 'Pancakes', category: 'food', keywords: ['pancake', 'breakfast', 'syrup', 'fluffy'] },
  { id: 'sandwich', emoji: '🥪', label: 'Sandwich Meal', category: 'food', keywords: ['sandwich', 'lunch', 'bread', 'meal'] },
  { id: 'apple', emoji: '🍎', label: 'Apple Snack', category: 'food', keywords: ['apple', 'fruit', 'snack', 'healthy'] },
  { id: 'candy', emoji: '🍬', label: 'Treat / Candy', category: 'food', keywords: ['candy', 'sweet', 'treat', 'gummy'] },
  { id: 'meal', emoji: '🍽️', label: 'Dinner Plate', category: 'food', keywords: ['dinner', 'plate', 'meal', 'food', 'fork', 'spoon'] },
  { id: 'drink', emoji: '🥤', label: 'Drink Cup', category: 'food', keywords: ['drink', 'cup', 'juice', 'soda', 'straw'] },
  { id: 'water', emoji: '💧', label: 'Drink Water', category: 'food', keywords: ['water', 'hydrate', 'thirst', 'drop'] },
  { id: 'cocoa', emoji: '☕', label: 'Warm Cocoa', category: 'food', keywords: ['cocoa', 'hot chocolate', 'tea', 'warm drink'] },

  // Daily & Places
  { id: 'wakeup', emoji: '⏰', label: 'Wake Up Clock', category: 'daily', keywords: ['wake', 'alarm', 'clock', 'morning', 'time'] },
  { id: 'teeth', emoji: '🪥', label: 'Brush Teeth', category: 'daily', keywords: ['teeth', 'brush', 'toothbrush', 'paste'] },
  { id: 'clothes', emoji: '👕', label: 'Get Dressed', category: 'daily', keywords: ['clothes', 'dress', 'shirt', 'pants'] },
  { id: 'wash', emoji: '🧼', label: 'Wash Hands', category: 'daily', keywords: ['wash', 'soap', 'clean', 'hands', 'sink'] },
  { id: 'shower', emoji: '🚿', label: 'Shower Wash', category: 'daily', keywords: ['shower', 'clean', 'water', 'wash'] },
  { id: 'shoes', emoji: '👟', label: 'Put on Shoes', category: 'daily', keywords: ['shoe', 'sneaker', 'feet', 'outside'] },
  { id: 'backpack', emoji: '🎒', label: 'Backpack', category: 'daily', keywords: ['backpack', 'bag', 'school', 'pack'] },
  { id: 'school', emoji: '🏫', label: 'School Building', category: 'daily', keywords: ['school', 'class', 'classroom', 'building'] },
  { id: 'home_house', emoji: '🏠', label: 'Home / House', category: 'daily', keywords: ['home', 'house', 'family', 'room', 'safe'] },
  { id: 'therapy_brain', emoji: '🧠', label: 'Therapy / Sensory OT', category: 'daily', keywords: ['therapy', 'brain', 'ot', 'sensory', 'session'] },
  { id: 'task_done', emoji: '✅', label: 'Task Done / All Done', category: 'daily', keywords: ['done', 'finish', 'completed', 'checkmark', 'task'] },
  { id: 'bus', emoji: '🚌', label: 'School Bus', category: 'daily', keywords: ['bus', 'ride', 'travel', 'commute'] },
  { id: 'car', emoji: '🚗', label: 'Car Ride', category: 'daily', keywords: ['car', 'drive', 'trip', 'travel', 'ride'] },
  { id: 'dentist', emoji: '🦷', label: 'Dentist Visit', category: 'daily', keywords: ['dentist', 'dental', 'teeth', 'clinic'] },
  { id: 'doctor', emoji: '🩺', label: 'Doctor Visit', category: 'daily', keywords: ['doctor', 'checkup', 'stethoscope', 'health'] },
  { id: 'haircut', emoji: '✂️', label: 'Haircut', category: 'daily', keywords: ['haircut', 'scissors', 'barber', 'salon'] },
  { id: 'birthday', emoji: '🎂', label: 'Birthday Party', category: 'daily', keywords: ['birthday', 'party', 'cake', 'celebrate'] },
  { id: 'plans_change', emoji: '🔄', label: 'Change of Plans', category: 'daily', keywords: ['change', 'switch', 'routine', 'plans'] },
  { id: 'sunshine', emoji: '☀️', label: 'Outdoor Sun', category: 'daily', keywords: ['sun', 'outside', 'weather', 'walk'] },
  { id: 'partly_cloudy', emoji: '⛅', label: 'Partly Cloudy', category: 'daily', keywords: ['partly', 'cloudy', 'sun', 'weather', 'sky'] },
  { id: 'cloudy', emoji: '☁️', label: 'Cloudy / Overcast', category: 'daily', keywords: ['cloud', 'cloudy', 'overcast', 'gray', 'weather'] },
  { id: 'rain', emoji: '🌧️', label: 'Rainy Weather', category: 'daily', keywords: ['rain', 'weather', 'cloud', 'storm'] },
  { id: 'snow', emoji: '❄️', label: 'Snow & Flurries', category: 'daily', keywords: ['snow', 'flurry', 'winter', 'cold', 'weather'] },
  { id: 'thunderstorm', emoji: '🌩️', label: 'Thunderstorm', category: 'daily', keywords: ['thunder', 'storm', 'lightning', 'rain', 'weather'] },
  { id: 'windy', emoji: '💨', label: 'Windy Weather', category: 'daily', keywords: ['wind', 'windy', 'breeze', 'weather', 'air'] },
  { id: 'fog_mist', emoji: '🌫️', label: 'Fog & Mist', category: 'daily', keywords: ['fog', 'mist', 'haze', 'quiet', 'weather'] },
  { id: 'rainbow_weather', emoji: '🌈', label: 'Rainbow Sky', category: 'daily', keywords: ['rainbow', 'sky', 'calm', 'weather', 'sun'] },
  { id: 'folder', emoji: '📁', label: 'Folder / Binder', category: 'daily', keywords: ['folder', 'binder', 'homework', 'papers'] },
  { id: 'writing', emoji: '✏️', label: 'Writing Class', category: 'daily', keywords: ['pencil', 'write', 'draw', 'homework', 'math'] },
  { id: 'meds', emoji: '💊', label: 'Medication', category: 'daily', keywords: ['medicine', 'medication', 'pill', 'vitamin', 'health'] },
  { id: 'inhaler', emoji: '🫁', label: 'Inhaler / Lungs', category: 'daily', keywords: ['inhaler', 'lungs', 'breathe', 'puff', 'asthma'] },
  { id: 'laptop', emoji: '💻', label: 'Laptop / Computer', category: 'daily', keywords: ['laptop', 'computer', 'screen', 'tech', 'work', 'execution'] },
  { id: 'clipboard', emoji: '📋', label: 'Clipboard / Checklist', category: 'daily', keywords: ['clipboard', 'list', 'check', 'shutdown', 'prep', 'task'] },
  { id: 'locker', emoji: '🗄️', label: 'Locker / Filing Cabinet', category: 'daily', keywords: ['locker', 'cabinet', 'schedule', 'school', 'drawers'] },
  { id: 'pajamas', emoji: '🩳', label: 'Pajamas / Sleepwear', category: 'daily', keywords: ['pajama', 'pajamas', 'shorts', 'sleep', 'bedtime', 'clothes'] },
  { id: 'briefcase', emoji: '💼', label: 'Work Briefcase', category: 'daily', keywords: ['briefcase', 'work', 'job', 'bag', 'office'] },

  // Adventures & Community
  { id: 'cart', emoji: '🛒', label: 'Supermarket / Grocery', category: 'daily', keywords: ['grocery', 'supermarket', 'store', 'shop', 'cart', 'market', 'shopping', 'buy'] },
  { id: 'plane', emoji: '✈️', label: 'Airplane / Airport', category: 'daily', keywords: ['plane', 'airplane', 'airport', 'flight', 'travel', 'trip', 'flying'] },
  { id: 'luggage', emoji: '🧳', label: 'Travel Luggage', category: 'daily', keywords: ['luggage', 'suitcase', 'travel', 'trip', 'pack', 'vacation'] },
  { id: 'ticket', emoji: '🎫', label: 'Boarding Pass / Ticket', category: 'daily', keywords: ['ticket', 'boarding', 'pass', 'movie', 'concert', 'flight', 'admission'] },
  { id: 'train', emoji: '🚆', label: 'Train / Subway', category: 'daily', keywords: ['train', 'subway', 'metro', 'station', 'transit', 'ride'] },
  { id: 'zoo', emoji: '🦁', label: 'Zoo & Animals', category: 'fun', keywords: ['zoo', 'animal', 'lion', 'safari', 'wildlife', 'pets'] },
  { id: 'library', emoji: '📚', label: 'Library & Reading', category: 'daily', keywords: ['library', 'books', 'quiet', 'borrow', 'study', 'read'] },
  { id: 'cinema', emoji: '🍿', label: 'Movie Theater', category: 'fun', keywords: ['movie', 'theater', 'cinema', 'popcorn', 'film', 'show'] },
  { id: 'swim', emoji: '🏊', label: 'Swimming Pool', category: 'fun', keywords: ['swim', 'pool', 'swimming', 'water', 'splash'] },
  { id: 'beach', emoji: '🏖️', label: 'Beach & Ocean', category: 'fun', keywords: ['beach', 'sand', 'ocean', 'sea', 'vacation', 'waves'] },
  { id: 'camp', emoji: '⛺', label: 'Camping & Tent', category: 'fun', keywords: ['camp', 'camping', 'tent', 'outdoors', 'nature', 'fire'] },
  { id: 'bowling', emoji: '🎳', label: 'Bowling Alley', category: 'fun', keywords: ['bowling', 'pins', 'ball', 'strike', 'game'] },
  { id: 'ferris', emoji: '🎡', label: 'Amusement Park', category: 'fun', keywords: ['amusement', 'carnival', 'ferris', 'wheel', 'fair', 'rides', 'park'] },
  { id: 'museum', emoji: '🏛️', label: 'Museum Visit', category: 'fun', keywords: ['museum', 'art', 'history', 'exhibit', 'tour'] },
  { id: 'park', emoji: '🌳', label: 'Park & Nature Walk', category: 'fun', keywords: ['park', 'tree', 'walk', 'nature', 'outside', 'trail'] },
  { id: 'post', emoji: '✉️', label: 'Post Office & Mail', category: 'daily', keywords: ['mail', 'post', 'letter', 'package', 'stamp'] },
  { id: 'hotel', emoji: '🏨', label: 'Hotel & Vacation Stay', category: 'daily', keywords: ['hotel', 'motel', 'vacation', 'stay', 'trip', 'travel'] },

  // New Table B Stickers
  { id: 'saturn', emoji: '🪐', label: 'Planet Saturn', category: 'fun', keywords: ['saturn', 'planet', 'space', 'galaxy', 'astronomy', 'stars'] },
  { id: 'leaf', emoji: '🍂', label: 'Autumn Leaf', category: 'calm', keywords: ['leaf', 'autumn', 'fall', 'nature', 'tree', 'foliage', 'season'] },
  { id: 'wave', emoji: '🌊', label: 'Ocean Waves', category: 'calm', keywords: ['wave', 'ocean', 'water', 'sea', 'surf', 'beach', 'calm'] },
  { id: 'battery', emoji: '🔋', label: 'Battery / Energy', category: 'calm', keywords: ['battery', 'energy', 'charge', 'power', 'stamina', 'level'] },
  { id: 'paw', emoji: '🐾', label: 'Pet Paw Print', category: 'fun', keywords: ['paw', 'print', 'dog', 'cat', 'pet', 'animal', 'footprint'] },
  { id: 'bone', emoji: '🦴', label: 'Dog Bone / Treat', category: 'fun', keywords: ['bone', 'treat', 'dog', 'pet', 'feed', 'snack'] },
  { id: 'tennis', emoji: '🎾', label: 'Tennis Ball / Fetch', category: 'fun', keywords: ['tennis', 'ball', 'fetch', 'play', 'sport', 'game'] },
  { id: 'plant', emoji: '🪴', label: 'Potted Plant', category: 'calm', keywords: ['plant', 'potted', 'houseplant', 'garden', 'nature', 'kindness'] },
  { id: 'hamper', emoji: '🧺', label: 'Laundry Hamper', category: 'daily', keywords: ['laundry', 'hamper', 'basket', 'clothes', 'wash', 'tidy', 'chore'] },
  { id: 'chocolate', emoji: '🍫', label: 'Chocolate Bar', category: 'food', keywords: ['chocolate', 'candy', 'treat', 'snack', 'sweet', 'craving'] },
  { id: 'quiet_voice', emoji: '🤫', label: 'Quiet Voice / Shh', category: 'calm', keywords: ['quiet', 'voice', 'shh', 'whisper', 'soft', 'silence'] },
  { id: 'bright_lights', emoji: '💡', label: 'Bright Lights Trigger', category: 'calm', keywords: ['light', 'bright', 'glare', 'sensory', 'lights', 'sun'] },
  { id: 'loud_noise', emoji: '🔊', label: 'Loud Noise Sensitivity', category: 'calm', keywords: ['noise', 'loud', 'sound', 'auditory', 'ear', 'overload'] },
  { id: 'social_masking', emoji: '🎭', label: 'Social Masking Fatigue', category: 'calm', keywords: ['masking', 'social', 'pretend', 'theater', 'burnout', 'tired'] },
  { id: 'writing_journal', emoji: '✍️', label: 'Writing & Reflection', category: 'daily', keywords: ['writing', 'write', 'journal', 'reflection', 'note', 'diary'] },
  { id: 'toilet_restroom', emoji: '🚽', label: 'Toilet / Restroom', category: 'daily', keywords: ['toilet', 'bathroom', 'restroom', 'potty', 'wash'] },

  // Favorite Phrases & Requests
  { id: 'lego', emoji: '🧱', label: 'Lego / Building Blocks', category: 'fun', keywords: ['lego', 'brick', 'block', 'toy', 'build', 'play'] },
  { id: 'stop', emoji: '🛑', label: 'Stop Sign / Pause', category: 'calm', keywords: ['stop', 'halt', 'pause', 'wait', 'no', 'red'] },
  { id: 'sos_badge', emoji: '🆘', label: 'SOS / Help Please', category: 'calm', keywords: ['help', 'sos', 'assist', 'need', 'emergency'] },
  { id: 'tree_outside', emoji: '🌳', label: 'Go Outside / Tree', category: 'fun', keywords: ['outside', 'tree', 'nature', 'park', 'outdoor'] },
  { id: 'tired_rest', emoji: '😴', label: 'Tired / Rest', category: 'calm', keywords: ['tired', 'rest', 'sleep', 'bed', 'nap', 'sleepy'] },
  { id: 'happy_smile', emoji: '😊', label: 'I Am Happy', category: 'calm', keywords: ['happy', 'smile', 'joy', 'good', 'cheerful'] },

  // 🐢 Wise Turtle Sanctuary Themed Stickers
  { id: 'turtle_mascot', emoji: '/assets/stickers/turtle_mascot.png', label: 'Shelly the Wise Turtle (Mascot)', category: 'turtle', keywords: ['turtle', 'shelly', 'mascot', 'calm', 'guide', 'companion', 'peaceful'] },
  { id: 'turtle_swimming', emoji: '/assets/stickers/turtle_swimming.png', label: 'Swimming Turtle (Pacing & Movement)', category: 'turtle', keywords: ['swim', 'swimming', 'turtle', 'pacing', 'slow', 'steady', 'exercise', 'movement'] },
  { id: 'turtle_lily_pads', emoji: '/assets/stickers/turtle_lily_pads.png', label: 'Quiet Break Lily Pads', category: 'turtle', keywords: ['lily', 'pad', 'break', 'quiet', 'rest', 'pond', 'relax', 'calm'] },
  { id: 'turtle_pond_reeds', emoji: '/assets/stickers/turtle_pond_reeds.png', label: 'Serene Lagoon & Reeds', category: 'turtle', keywords: ['reed', 'reeds', 'pond', 'lagoon', 'nature', 'sound', 'ambient', 'music', 'water'] },
  { id: 'turtle_river_stone', emoji: '/assets/stickers/turtle_river_stone.png', label: 'Smooth River Worry Stone', category: 'turtle', keywords: ['stone', 'river', 'rock', 'worry', 'grounding', 'tactile', 'fidget', 'calm'] },
  { id: 'turtle_leaf_water_drop', emoji: '/assets/stickers/turtle_leaf_water_drop.png', label: 'Leaf with Water Dewdrop', category: 'turtle', keywords: ['leaf', 'water', 'dewdrop', 'drop', 'drink', 'hydrate', 'thirst', 'nature'] },
  { id: 'turtle_welcome_sign', emoji: '/assets/stickers/turtle_welcome_sign.png', label: 'Welcome Sign with Vines', category: 'turtle', keywords: ['welcome', 'sign', 'morning', 'arrival', 'start', 'door', 'greeting', 'vine'] },
  { id: 'turtle_potted_fern', emoji: '/assets/stickers/turtle_potted_fern.png', label: 'Potted Fern Fronds', category: 'turtle', keywords: ['fern', 'potted', 'plant', 'breathe', 'breathing', 'care', 'nature', 'calm'] },
  { id: 'turtle_arched_bridge', emoji: '/assets/stickers/turtle_arched_bridge.png', label: 'Arched Garden Bridge', category: 'turtle', keywords: ['bridge', 'transition', 'garden', 'walk', 'path', 'next', 'step', 'change'] },
  { id: 'turtle_tracks', emoji: '/assets/stickers/turtle_tracks.png', label: 'Webbed Turtle Footprints', category: 'turtle', keywords: ['track', 'tracks', 'footprint', 'footprints', 'step', 'walk', 'path', 'shoes'] },
  { id: 'turtle_sprouting_seedling', emoji: '/assets/stickers/turtle_sprouting_seedling.png', label: 'Sprouting Seedling in Soil', category: 'turtle', keywords: ['seedling', 'sprout', 'grow', 'soil', 'learn', 'study', 'school', 'growth'] },
  { id: 'turtle_egg_nest', emoji: '/assets/stickers/turtle_egg_nest.png', label: 'Speckled Egg in Sand Nest', category: 'turtle', keywords: ['egg', 'nest', 'sand', 'bed', 'cozy', 'sleep', 'home', 'night', 'rest'] },
  { id: 'turtle_shell_backpack', emoji: '/assets/stickers/turtle_shell_backpack.png', label: 'Turtle Shell Backpack', category: 'turtle', keywords: ['backpack', 'bag', 'school', 'pack', 'shell', 'turtle'] },
  { id: 'turtle_bamboo_toothbrush', emoji: '/assets/stickers/turtle_bamboo_toothbrush.png', label: 'Bamboo Brush & Sea Sponge', category: 'turtle', keywords: ['toothbrush', 'teeth', 'brush', 'bamboo', 'sponge', 'morning', 'night'] },
  { id: 'turtle_clover_berry_feast', emoji: '/assets/stickers/turtle_clover_berry_feast.png', label: 'Clover & Berry Feast', category: 'turtle', keywords: ['breakfast', 'food', 'eat', 'meal', 'clover', 'berry', 'feast', 'snack'] },
  { id: 'turtle_cozy_hoodie', emoji: '/assets/stickers/turtle_cozy_hoodie.png', label: 'Cozy Turtle Hoodie', category: 'turtle', keywords: ['clothes', 'dress', 'dressed', 'hoodie', 'shirt', 'sweater', 'wear'] },
  { id: 'turtle_warm_spring_bath', emoji: '/assets/stickers/turtle_warm_spring_bath.png', label: 'Warm Spring Waterfall', category: 'turtle', keywords: ['bath', 'shower', 'wash', 'spring', 'waterfall', 'water', 'clean'] },
  { id: 'turtle_treehouse_gazebo', emoji: '/assets/stickers/turtle_treehouse_gazebo.png', label: 'Canopy Treehouse Gazebo', category: 'turtle', keywords: ['school', 'classroom', 'treehouse', 'gazebo', 'building', 'learn'] },
  { id: 'turtle_bamboo_ferry', emoji: '/assets/stickers/turtle_bamboo_ferry.png', label: 'Tortoise Bamboo Ferry', category: 'turtle', keywords: ['bus', 'ride', 'ferry', 'raft', 'bamboo', 'travel', 'commute', 'school'] },
  { id: 'turtle_firefly_lantern_book', emoji: '/assets/stickers/turtle_firefly_lantern_book.png', label: 'Firefly Lantern & Scroll', category: 'turtle', keywords: ['read', 'reading', 'book', 'story', 'scroll', 'firefly', 'lantern'] },
  { id: 'turtle_pebble_paint_palette', emoji: '/assets/stickers/turtle_pebble_paint_palette.png', label: 'River Pebble Paint Palette', category: 'turtle', keywords: ['art', 'paint', 'craft', 'draw', 'palette', 'pebble', 'color'] },
  { id: 'turtle_hollow_log_slide', emoji: '/assets/stickers/turtle_hollow_log_slide.png', label: 'Hollow Log Slide', category: 'turtle', keywords: ['playground', 'recess', 'slide', 'log', 'play', 'park', 'outside'] },
  { id: 'turtle_dawn_bell_clock', emoji: '/assets/stickers/turtle_dawn_bell_clock.png', label: 'Bamboo Dawn Bell & Sun', category: 'turtle', keywords: ['wake', 'alarm', 'clock', 'bell', 'morning', 'dawn', 'sun', 'time'] },
  { id: 'turtle_leaf_soap_wash', emoji: '/assets/stickers/turtle_leaf_soap_wash.png', label: 'Herbal Leaf Soap & Stone Basin', category: 'turtle', keywords: ['wash', 'hands', 'soap', 'clean', 'leaf', 'bubbles', 'basin'] },
  { id: 'turtle_lotus_dinner_bowl', emoji: '/assets/stickers/turtle_lotus_dinner_bowl.png', label: 'Lotus Leaf Soup Bowl', category: 'turtle', keywords: ['dinner', 'lunch', 'bowl', 'soup', 'meal', 'eat', 'food', 'lotus'] },
  { id: 'turtle_garden_fruit_snack', emoji: '/assets/stickers/turtle_garden_fruit_snack.png', label: 'Sanctuary Fruit Basket', category: 'turtle', keywords: ['apple', 'snack', 'fruit', 'basket', 'berry', 'healthy', 'eat'] },
  { id: 'turtle_seagrass_toy_box', emoji: '/assets/stickers/turtle_seagrass_toy_box.png', label: 'Seagrass Basket & Plush Turtle', category: 'turtle', keywords: ['toy', 'box', 'basket', 'clean up', 'plush', 'play', 'blocks'] },
  { id: 'turtle_bamboo_pencil', emoji: '/assets/stickers/turtle_bamboo_pencil.png', label: 'Bamboo Pencil & Leaf Pad', category: 'turtle', keywords: ['pencil', 'write', 'writing', 'homework', 'note', 'draw', 'pad'] },
  { id: 'turtle_shell_headphones', emoji: '/assets/stickers/turtle_shell_headphones.png', label: 'Turtle Shell Ear Defenders', category: 'turtle', keywords: ['headphones', 'ear', 'quiet', 'sensory', 'sound', 'music', 'calm'] },
  { id: 'turtle_sand_timer', emoji: '/assets/stickers/turtle_sand_timer.png', label: 'Sanctuary Sand Timer', category: 'turtle', keywords: ['timer', 'hourglass', 'sand', 'countdown', 'clock', 'wait', 'time'] },
  { id: 'turtle_bamboo_spoons', emoji: '/assets/stickers/turtle_bamboo_spoons.png', label: 'Three Bamboo Spoons', category: 'turtle', keywords: ['spoon', 'spoons', 'energy', 'budget', 'stamina', 'bamboo'] },
  { id: 'turtle_lotus_trophy', emoji: '/assets/stickers/turtle_lotus_trophy.png', label: 'Golden Lotus & Shell Trophy', category: 'turtle', keywords: ['trophy', 'reward', 'milestone', 'win', 'lotus', 'gold', 'star'] },
  { id: 'turtle_bamboo_restroom', emoji: '/assets/stickers/turtle_bamboo_restroom.png', label: 'Bamboo Washroom & Stones', category: 'turtle', keywords: ['toilet', 'restroom', 'bathroom', 'potty', 'washroom', 'bamboo'] },
  { id: 'turtle_starry_pajamas', emoji: '/assets/stickers/turtle_starry_pajamas.png', label: 'Cozy Starry Turtle Pajamas', category: 'turtle', keywords: ['pajamas', 'pajama', 'sleepwear', 'shorts', 'bedtime', 'night', 'clothes'] },
  { id: 'turtle_lagoon_moon', emoji: '/assets/stickers/turtle_lagoon_moon.png', label: 'Crescent Moon Over Lagoon', category: 'turtle', keywords: ['moon', 'evening', 'night', 'bedtime', 'sleep', 'lagoon', 'stars'] },
  { id: 'turtle_wooden_wheel', emoji: '/assets/stickers/turtle_wooden_wheel.png', label: 'Wooden Lotus Spinner Wheel', category: 'turtle', keywords: ['wheel', 'decision', 'spinner', 'choice', 'wooden', 'lotus'] },
  { id: 'turtle_bamboo_thermometer', emoji: '/assets/stickers/turtle_bamboo_thermometer.png', label: 'Bamboo Feelings Gauge & Heart', category: 'turtle', keywords: ['thermometer', 'scale', 'feelings', '5-point', 'heart', 'gauge', 'bamboo'] },
  { id: 'turtle_leaf_vitamins', emoji: '/assets/stickers/turtle_leaf_vitamins.png', label: 'Leaf Dish & Vitamins', category: 'turtle', keywords: ['medication', 'medicine', 'pill', 'vitamin', 'health', 'leaf'] },
  { id: 'turtle_guardian_shield_sos', emoji: '/assets/stickers/turtle_guardian_shield_sos.png', label: 'Guardian Turtle Shell Shield (SOS)', category: 'turtle', keywords: ['sos', 'help', 'shield', 'alert', 'emergency', 'guardian', 'shell'] },
  { id: 'turtle_wooden_id_badge', emoji: '/assets/stickers/turtle_wooden_id_badge.png', label: 'Wooden Explorer ID Badge', category: 'turtle', keywords: ['id', 'badge', 'about me', 'card', 'passport', 'profile', 'turtle'] },
  { id: 'turtle_bamboo_tablet', emoji: '/assets/stickers/turtle_bamboo_tablet.png', label: 'Bamboo Tablet & Star Screen', category: 'turtle', keywords: ['tablet', 'ipad', 'device', 'screen', 'game', 'aac', 'bamboo'] },
  { id: 'turtle_leaf_speech_bubbles', emoji: '/assets/stickers/turtle_leaf_speech_bubbles.png', label: 'Leaf & Pebble Speech Bubbles', category: 'turtle', keywords: ['speech', 'bubble', 'talk', 'phrase', 'say', 'voice', 'aac', 'leaf'] },
  { id: 'turtle_bamboo_keyboard', emoji: '/assets/stickers/turtle_bamboo_keyboard.png', label: 'Carved Bamboo & Stone Keyboard', category: 'turtle', keywords: ['keyboard', 'type', 'typing', 'keys', 'write', 'bamboo', 'stone'] },
  { id: 'turtle_pond_fidget_bubbles', emoji: '/assets/stickers/turtle_pond_fidget_bubbles.png', label: 'Shimmering Pond Fidget Bubbles', category: 'turtle', keywords: ['fidget', 'bubble', 'bubbles', 'pop', 'sensory', 'pond', 'calm'] },
  { id: 'turtle_botanical_folder', emoji: '/assets/stickers/turtle_botanical_folder.png', label: 'Botanical Field Notebook Folder', category: 'turtle', keywords: ['folder', 'notebook', 'binder', 'schoolwork', 'homework', 'notes', 'botanical'] },
  { id: 'turtle_terrarium_science', emoji: '/assets/stickers/turtle_terrarium_science.png', label: 'Glass Terrarium & Magnifying Glass', category: 'turtle', keywords: ['science', 'terrarium', 'plant', 'nature', 'magnifying', 'discover', 'experiment'] },
  { id: 'turtle_bamboo_wind_chimes', emoji: '/assets/stickers/turtle_bamboo_wind_chimes.png', label: 'Bamboo Wind Chimes & Melody', category: 'turtle', keywords: ['music', 'chimes', 'wind', 'sound', 'melody', 'song', 'sensory', 'bamboo'] },
  { id: 'turtle_wooden_puzzle', emoji: '/assets/stickers/turtle_wooden_puzzle.png', label: 'Carved Wooden Leaf & Shell Puzzle', category: 'turtle', keywords: ['puzzle', 'jigsaw', 'game', 'play', 'wooden', 'leaf', 'shell'] },
  { id: 'turtle_leaf_checkmark', emoji: '/assets/stickers/turtle_leaf_checkmark.png', label: 'Fresh Leaf Stamp Checkmark', category: 'turtle', keywords: ['done', 'check', 'checkmark', 'complete', 'finish', 'task', 'leaf'] },
  { id: 'turtle_moss_cottage_home', emoji: '/assets/stickers/turtle_moss_cottage_home.png', label: 'Cozy Moss-Roof Sanctuary Cottage', category: 'turtle', keywords: ['home', 'house', 'cottage', 'family', 'inside', 'moss'] },
  { id: 'turtle_wooden_leaf_cart', emoji: '/assets/stickers/turtle_wooden_leaf_cart.png', label: 'Leaf-Canopy Wooden Cart', category: 'turtle', keywords: ['car', 'ride', 'cart', 'buggy', 'travel', 'commute', 'drive'] },
  { id: 'turtle_meadow_sunshine', emoji: '/assets/stickers/turtle_meadow_sunshine.png', label: 'Warm Sun Over Lily-Pad Pond', category: 'turtle', keywords: ['sun', 'sunshine', 'outdoor', 'outside', 'park', 'weather', 'warm'] },
  { id: 'turtle_hatchling_pet_care', emoji: '/assets/stickers/turtle_hatchling_pet_care.png', label: 'Baby Hatchling & Snail Friend', category: 'turtle', keywords: ['pet', 'care', 'animal', 'hatchling', 'snail', 'clover', 'friend'] },
  { id: 'turtle_garden_sandwich', emoji: '/assets/stickers/turtle_garden_sandwich.png', label: 'Garden Herb Sandwich on Board', category: 'turtle', keywords: ['sandwich', 'lunch', 'snack', 'food', 'meal', 'eat', 'herb'] },
  { id: 'turtle_bamboo_drink_cup', emoji: '/assets/stickers/turtle_bamboo_drink_cup.png', label: 'Bamboo Tumbler with Leaf Straw', category: 'turtle', keywords: ['drink', 'cup', 'juice', 'smoothie', 'straw', 'bamboo', 'thirsty'] },
  { id: 'turtle_herbal_tea_mug', emoji: '/assets/stickers/turtle_herbal_tea_mug.png', label: 'Carved Wooden Herbal Tea Mug', category: 'turtle', keywords: ['mug', 'tea', 'cocoa', 'warm', 'drink', 'cozy', 'chamomile'] },
  { id: 'turtle_reed_laundry_basket', emoji: '/assets/stickers/turtle_reed_laundry_basket.png', label: 'Woven Reed Laundry Basket', category: 'turtle', keywords: ['laundry', 'hamper', 'basket', 'clothes', 'chores', 'tidy', 'towel'] },
  { id: 'turtle_bamboo_calendar', emoji: '/assets/stickers/turtle_bamboo_calendar.png', label: 'Hanging Bamboo Checklist Board', category: 'turtle', keywords: ['schedule', 'calendar', 'plan', 'routine', 'checklist', 'bamboo'] },
  { id: 'turtle_lagoon_breeze_breath', emoji: '/assets/stickers/turtle_lagoon_breeze_breath.png', label: 'Lagoon Mist & Lotus Breeze', category: 'turtle', keywords: ['breathe', 'breathing', 'wind', 'breeze', 'calm', 'air', 'lagoon'] },
  { id: 'turtle_moss_bed_sleep', emoji: '/assets/stickers/turtle_moss_bed_sleep.png', label: 'Cozy Wooden Leaf-Blanket Bed', category: 'turtle', keywords: ['bed', 'sleep', 'bedtime', 'nap', 'blanket', 'rest', 'night'] },
  { id: 'turtle_reed_explorer_shoes', emoji: '/assets/stickers/turtle_reed_explorer_shoes.png', label: 'Woven Reed Explorer Slip-On Shoes', category: 'turtle', keywords: ['shoes', 'sneakers', 'slip-on', 'footwear', 'feet', 'walk', 'explorer'] },
  { id: 'turtle_bamboo_cutlery', emoji: '/assets/stickers/turtle_bamboo_cutlery.png', label: 'Carved Bamboo Fork & Spoon Set', category: 'turtle', keywords: ['fork', 'knife', 'spoon', 'cutlery', 'utensils', 'eat', 'dinner', 'bamboo'] },
  { id: 'turtle_berry_honey_treat', emoji: '/assets/stickers/turtle_berry_honey_treat.png', label: 'Wrapped Leaf-Berry Sweet Snack', category: 'turtle', keywords: ['candy', 'treat', 'snack', 'sweet', 'leaf', 'dessert', 'reward'] },
  { id: 'turtle_shell_wall_clock', emoji: '/assets/stickers/turtle_shell_wall_clock.png', label: 'Turtle-Shell Wall Clock with Leaf Hands', category: 'turtle', keywords: ['clock', 'time', 'wall clock', 'hour', 'minute', 'schedule', 'turtle'] },
  { id: 'turtle_pond_ripple_wave', emoji: '/assets/stickers/turtle_pond_ripple_wave.png', label: 'Gentle Pond Ripple & Lily Pad', category: 'turtle', keywords: ['wave', 'ocean', 'ripple', 'pond', 'overwhelmed', 'water', 'calm', 'lily pad'] },
  { id: 'turtle_bamboo_energy_meter', emoji: '/assets/stickers/turtle_bamboo_energy_meter.png', label: 'Bamboo Energy Tube Gauge', category: 'turtle', keywords: ['battery', 'meter', 'energy', 'stamina', 'gauge', 'bamboo', 'level'] },
  { id: 'turtle_whispering_reed_quiet', emoji: '/assets/stickers/turtle_whispering_reed_quiet.png', label: 'Peaceful Whispering Reeds & Ripples', category: 'turtle', keywords: ['quiet', 'voice', 'whisper', 'soft', 'silence', 'cattail', 'reed', 'calm'] },
  { id: 'turtle_honey_seed_bar', emoji: '/assets/stickers/turtle_honey_seed_bar.png', label: 'Honey & Seed Snack Bar', category: 'turtle', keywords: ['chocolate', 'bar', 'snack', 'seed', 'honey', 'treat', 'food'] },
  { id: 'turtle_lotus_floating_lantern', emoji: '/assets/stickers/turtle_lotus_floating_lantern.png', label: 'Hanging Lotus Blossom Lantern', category: 'turtle', keywords: ['balloon', 'celebration', 'party', 'lantern', 'lotus', 'float', 'joy'] },
  { id: 'turtle_woven_gathering_cart', emoji: '/assets/stickers/turtle_woven_gathering_cart.png', label: 'Woven Gathering Cart on Wheels', category: 'turtle', keywords: ['cart', 'shopping', 'supermarket', 'grocery', 'basket', 'gathering', 'wheels'] },
  { id: 'turtle_dragonfly_glide', emoji: '/assets/stickers/turtle_dragonfly_glide.png', label: 'Soaring Dragonfly over Reeds', category: 'turtle', keywords: ['airplane', 'flight', 'fly', 'plane', 'travel', 'trip', 'dragonfly'] },
  { id: 'turtle_timber_explorer_trunk', emoji: '/assets/stickers/turtle_timber_explorer_trunk.png', label: 'Explorer Timber Travel Trunk', category: 'turtle', keywords: ['luggage', 'suitcase', 'travel', 'trunk', 'chest', 'pack', 'vacation'] },
  { id: 'turtle_wooden_token_pass', emoji: '/assets/stickers/turtle_wooden_token_pass.png', label: 'Carved Wooden Token Pass', category: 'turtle', keywords: ['ticket', 'boarding', 'pass', 'admission', 'token', 'wooden', 'leaf'] },
  { id: 'turtle_shaded_canopy_lamp', emoji: '/assets/stickers/turtle_shaded_canopy_lamp.png', label: 'Shaded Firefly Canopy Lamp', category: 'turtle', keywords: ['lights', 'bright', 'sensory', 'lamp', 'firefly', 'canopy', 'calm'] },
  { id: 'turtle_sound_softening_shell', emoji: '/assets/stickers/turtle_sound_softening_shell.png', label: 'Sound-Softening Spiral Shell', category: 'turtle', keywords: ['noise', 'loud', 'sensory', 'shell', 'sound', 'conch', 'calm'] },
  { id: 'turtle_cozy_shell_retreat', emoji: '/assets/stickers/turtle_cozy_shell_retreat.png', label: 'Cozy Shell Retreat', category: 'turtle', keywords: ['masking', 'social', 'fatigue', 'retreat', 'shell', 'turtle', 'rest', 'break'] },
  { id: 'turtle_moss_play_ball', emoji: '/assets/stickers/turtle_moss_play_ball.png', label: 'Woven Moss & Twig Play Ball', category: 'turtle', keywords: ['ball', 'tennis', 'play', 'fetch', 'game', 'moss', 'woven', 'toy', 'exercise'] },
  { id: 'turtle_water_chestnut_treat', emoji: '/assets/stickers/turtle_water_chestnut_treat.png', label: 'Water Chestnut & Seed Treat', category: 'turtle', keywords: ['treat', 'snack', 'bone', 'dog', 'chestnut', 'seed', 'leaf', 'reward', 'food'] },
  { id: 'turtle_webbed_paw_stamp', emoji: '/assets/stickers/turtle_webbed_paw_stamp.png', label: 'Webbed Turtle Paw Sand Stamp', category: 'turtle', keywords: ['paw', 'print', 'stamp', 'pet', 'track', 'sand', 'webbed', 'footprint', 'animal'] },
  { id: 'turtle_log_bonsai_planter', emoji: '/assets/stickers/turtle_log_bonsai_planter.png', label: 'Hollow Log Fern & Bonsai Planter', category: 'turtle', keywords: ['plant', 'potted', 'bonsai', 'log', 'fern', 'nature', 'garden', 'greenery', 'care'] },
  { id: 'turtle_grooming_comb_mirror', emoji: '/assets/stickers/turtle_grooming_comb_mirror.png', label: 'Shell Grooming Comb & River Pebble Mirror', category: 'turtle', keywords: ['haircut', 'salon', 'comb', 'mirror', 'grooming', 'hair', 'brush', 'pebble', 'adventure'] },
  { id: 'turtle_elder_healer_pouch', emoji: '/assets/stickers/turtle_elder_healer_pouch.png', label: 'Elder Healer Herbal Medicine Pouch', category: 'turtle', keywords: ['doctor', 'checkup', 'medicine', 'herb', 'healer', 'clinic', 'health', 'pouch', 'adventure'] },
  { id: 'turtle_spring_lagoon_pool', emoji: '/assets/stickers/turtle_spring_lagoon_pool.png', label: 'Tiered Stone Spring Water Basin Lagoon', category: 'turtle', keywords: ['pool', 'swimming', 'water', 'basin', 'spring', 'lagoon', 'fountain', 'stone', 'adventure'] },
  { id: 'turtle_shadow_puppet_theater', emoji: '/assets/stickers/turtle_shadow_puppet_theater.png', label: 'Sanctuary Framed Shadow Silhouette Theater', category: 'turtle', keywords: ['movie', 'cinema', 'theater', 'shadow', 'puppet', 'film', 'frame', 'silhouette', 'story'] },
  { id: 'turtle_river_pebble_bowling', emoji: '/assets/stickers/turtle_river_pebble_bowling.png', label: 'River Pebble Bowling Pins', category: 'turtle', keywords: ['bowling', 'pins', 'pebble', 'game', 'play', 'sport', 'strike', 'adventure'] },
  { id: 'turtle_canopy_reed_tent', emoji: '/assets/stickers/turtle_canopy_reed_tent.png', label: 'Bamboo & Palm Reed Canopy Tent', category: 'turtle', keywords: ['camping', 'tent', 'canopy', 'reed', 'bamboo', 'shelter', 'camp', 'outdoors', 'adventure'] },
  { id: 'turtle_heritage_archive_pavillion', emoji: '/assets/stickers/turtle_heritage_archive_pavillion.png', label: 'Sanctuary Heritage Archive Pagoda Pavilion', category: 'turtle', keywords: ['museum', 'archive', 'pagoda', 'pavilion', 'heritage', 'history', 'culture', 'visit', 'adventure'] },
  { id: 'turtle_mineral_polishing_basin', emoji: '/assets/stickers/turtle_mineral_polishing_basin.png', label: 'Scallop Shell Mineral Polishing Basin', category: 'turtle', keywords: ['dentist', 'tooth', 'teeth', 'polish', 'shell', 'mineral', 'clean', 'hygiene', 'adventure'] },

  // 🦖 Dino Kingdom Themed Stickers
  ...DINO_KINGDOM_ICONS.map((d) => ({
    id: d.id,
    emoji: d.value,
    label: d.label,
    category: 'dinosaur' as const,
    keywords: d.keywords,
  })),
];

export interface IconLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (emoji: string, label: string) => void;
  selectedEmoji?: string;
  title?: string;
  initialTab?: 'all' | 'turtle' | 'dinosaur' | 'fun' | 'calm' | 'food' | 'daily';
}

export const IconLibraryModal: React.FC<IconLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
  selectedEmoji,
  title = 'BeeYou Icon Library',
  initialTab,
}) => {
  const { activeTheme } = useApp();
  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';
  const isDinoTheme = activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino';
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'turtle' | 'dinosaur' | 'fun' | 'calm' | 'food' | 'daily'>('all');
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      } else if (isTurtleTheme) {
        setActiveTab('turtle');
      } else if (isDinoTheme) {
        setActiveTab('dinosaur');
      } else {
        setActiveTab('all');
      }
    }
  }, [isOpen, initialTab, isTurtleTheme, isDinoTheme]);

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ICON_LIBRARY.filter((item) => {
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      if (!matchesTab) return false;
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q)) ||
        item.emoji.includes(q)
      );
    });
  }, [search, activeTab]);

  if (!isOpen) return null;

  const handlePick = (emoji: string, label: string) => {
    playChime('tap');
    onSelectIcon(emoji, label);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      handlePick(customInput.trim(), 'Custom icon');
      setCustomInput('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] animate-in fade-in"
    >
      <div className={`bg-white border-3 ${isTurtleTheme ? 'border-emerald-400' : isDinoTheme ? 'border-emerald-500' : (activeTheme?.palette?.primaryBorder || 'border-amber-300')} w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[calc(100dvh-2rem)]`}>
        {/* Header */}
        <div className={`${isTurtleTheme ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white' : isDinoTheme ? 'bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-600 text-white' : (activeTheme?.palette?.primaryBg ? `${activeTheme.palette.primaryBg} text-white` : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-amber-950')} p-4 sm:p-5 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${isTurtleTheme || isDinoTheme ? 'bg-white/20 text-white' : 'bg-white/80 text-amber-700'} shadow-xs flex items-center justify-center text-xl shrink-0`}>
              {isTurtleTheme ? <span className="text-2xl">🐢</span> : isDinoTheme ? <span className="text-2xl">🦖</span> : <Palette className="w-5 h-5 text-amber-700" />}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black leading-tight">
                {title}
              </h3>
              <p className={`text-xs font-semibold ${isTurtleTheme || isDinoTheme ? 'text-emerald-100' : 'text-amber-900/80'} mt-0.5`}>
                Pick a matching sticker icon for this routine or step
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl ${isTurtleTheme || isDinoTheme ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-white/50 hover:bg-white/80 text-amber-950'} transition-all cursor-pointer`}
            aria-label="Close icon library"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className={`p-3 sm:p-4 border-b border-slate-200 ${isTurtleTheme || isDinoTheme ? 'bg-emerald-50/40' : (activeTheme?.palette?.primaryLight || 'bg-amber-50/40')} space-y-3 shrink-0`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons (e.g. dinosaur, rex, turtle, pizza, art, quiet, stone, water)..."
              className={`w-full pl-9 pr-9 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${isTurtleTheme || isDinoTheme ? 'focus:ring-emerald-400' : (activeTheme?.palette?.primaryBorder || 'focus:ring-amber-400')}`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {[
              { id: 'all', label: 'All Icons' },
              { id: 'turtle', label: '🐢 Turtle Sanctuary' },
              { id: 'dinosaur', label: `🦖 Dino Kingdom (${DINO_KINGDOM_ICONS.length})` },
              { id: 'fun', label: 'Fun & Play' },
              { id: 'calm', label: 'Calm & Rest' },
              { id: 'food', label: 'Food & Drinks' },
              { id: 'daily', label: 'Daily & Places' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    playChime('tap');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? isTurtleTheme || isDinoTheme
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : `${activeTheme?.palette?.primaryBg || 'bg-amber-400'} text-white shadow-xs`
                      : isTurtleTheme || isDinoTheme
                      ? 'bg-white hover:bg-emerald-50 text-slate-600 border border-slate-200'
                      : 'bg-white hover:bg-amber-100/60 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid of Icons */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {filteredIcons.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="font-bold text-sm">No icons found matching "{search}"</p>
              <p className="text-xs mt-1">Try a different keyword or enter a custom emoji below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {filteredIcons.map((item) => {
                const isSelected = selectedEmoji === item.emoji;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePick(item.emoji, item.label)}
                    className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer active:scale-95 group ${
                      isSelected
                        ? isTurtleTheme || isDinoTheme
                          ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-300 text-emerald-950 shadow-xs'
                          : `${activeTheme?.palette?.primaryLight || 'bg-amber-100'} ${activeTheme?.palette?.primaryBorder || 'border-amber-400'} ring-2 ring-amber-300 ${activeTheme?.palette?.textAccent || 'text-amber-950'} shadow-xs`
                        : isTurtleTheme || isDinoTheme
                        ? 'bg-white hover:bg-emerald-50/70 border-slate-200 hover:border-emerald-300 text-slate-700'
                        : 'bg-white hover:bg-amber-50/60 border-slate-200 hover:border-amber-300 text-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <RoutineStickerIcon
                        emoji={item.emoji}
                        title={item.label}
                        className="w-10 h-10 object-contain drop-shadow-2xs"
                      />
                    </div>
                    <span className="font-bold text-[11px] leading-tight line-clamp-2 mt-1">
                      {item.label}
                    </span>
                    {isSelected && (
                      <span className={`mt-1 w-4 h-4 rounded-full ${isTurtleTheme || isDinoTheme ? 'bg-emerald-600' : (activeTheme?.palette?.primaryBg || 'bg-amber-500')} text-white flex items-center justify-center`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Custom Emoji or Text Fallback */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <form onSubmit={handleApplyCustom} className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-xs font-bold text-slate-500 shrink-0">
              Custom icon:
            </span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. ⭐ or 🚀"
              className="w-24 px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white font-bold text-xs cursor-pointer"
            >
              Apply
            </button>
          </form>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer ml-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
