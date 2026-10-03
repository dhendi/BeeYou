/**
 * American Sign Language (ASL) data for Lumina.
 *
 * MEDIA & LICENSING (important):
 *  - Fingerspelling A-Z images: Wikimedia Commons "Sign language A..Z.svg" (public domain, wpclipart.com).
 *  - Short sign videos (HELLO, BOOK, ABOUT) and the I-LOVE-YOU photo are openly licensed
 *    (CC BY / CC BY-SA) on Wikimedia Commons. Attribution is shown in the app next to each item.
 *  - Sign descriptions ("how to sign") are original text written for Lumina.
 *  - Signs without a bundled video link out to external dictionaries instead of copying their media.
 *
 * Note: ASL varies by region and signer. Descriptions show the most widely used form.
 */

export type ASLCategoryId =
  | 'greetings'
  | 'needs'
  | 'feelings'
  | 'food'
  | 'people'
  | 'actions'
  | 'things'
  | 'questions';

export interface ASLCategory {
  id: ASLCategoryId;
  label: string;
  emoji: string;
  color: string; // tailwind classes for chip/tile accent
}

export const ASL_CATEGORIES: ASLCategory[] = [
  { id: 'greetings', label: 'Greetings & Manners', emoji: '👋', color: 'bg-purple-50 border-purple-300 text-purple-950' },
  { id: 'needs', label: 'Needs', emoji: '🆘', color: 'bg-rose-50 border-rose-300 text-rose-950' },
  { id: 'feelings', label: 'Feelings', emoji: '💛', color: 'bg-amber-50 border-amber-300 text-amber-950' },
  { id: 'food', label: 'Food & Drink', emoji: '🍎', color: 'bg-orange-50 border-orange-300 text-orange-950' },
  { id: 'people', label: 'People & Family', emoji: '👨‍👩‍👧', color: 'bg-sky-50 border-sky-300 text-sky-950' },
  { id: 'actions', label: 'Actions', emoji: '🏃', color: 'bg-emerald-50 border-emerald-300 text-emerald-950' },
  { id: 'things', label: 'Places & Things', emoji: '🏠', color: 'bg-teal-50 border-teal-300 text-teal-950' },
  { id: 'questions', label: 'Questions', emoji: '❓', color: 'bg-indigo-50 border-indigo-300 text-indigo-950' },
];

export interface ASLSign {
  id: string;
  word: string;
  category: ASLCategoryId;
  emoji: string;
  /** Verified ARASAAC pictogram id (only set where the id is known to match the word) */
  arasaacId?: number;
  /** How the AAC voice should say it when tapped */
  speech?: string;
  /** Full sentence for the Needs & Feelings screen ("I need help.") */
  phrase?: string;
  /** Plain-language description of how to make the sign */
  howTo: string;
  /** Short handshape label */
  handshape: string;
  /** Helpful tip for learners */
  tip?: string;
  /** Extra search words */
  aliases?: string[];
  /** Openly licensed video available for this sign */
  videoIds?: string[];
  /** Openly licensed image available for this sign */
  imageId?: string;
}

export const ASL_SIGNS: ASLSign[] = [
  // ---------------- Greetings & Manners ----------------
  {
    id: 'hello', word: 'Hello', category: 'greetings', emoji: '👋',
    howTo: 'Hold a flat hand near your forehead or temple, like a relaxed salute, then move it outward and away from your head with a friendly smile.',
    handshape: 'Flat B hand',
    tip: 'Friendly eyes and a smile are part of the greeting.',
    aliases: ['hi', 'hey'],
    videoIds: ['hello1', 'hello2'],
  },
  {
    id: 'goodbye', word: 'Goodbye', category: 'greetings', emoji: '🙋',
    howTo: 'Hold your open hand up with the palm facing out, then wave by folding your fingers down and up a few times.',
    handshape: 'Open 5 hand',
    aliases: ['bye', 'see you'],
  },
  {
    id: 'please', word: 'Please', category: 'greetings', emoji: '🙏', arasaacId: 8195,
    howTo: 'Place your flat hand on your chest and rub it in a slow circle.',
    handshape: 'Flat B hand',
    tip: 'The same movement is used in SORRY, but with a fist.',
  },
  {
    id: 'thank-you', word: 'Thank you', category: 'greetings', emoji: '🤗',
    howTo: 'Touch your fingertips of a flat hand to your chin, then move the hand forward and down toward the person, like blowing a kiss of thanks.',
    handshape: 'Flat B hand',
    aliases: ['thanks'],
  },
  {
    id: 'sorry', word: 'Sorry', category: 'greetings', emoji: '😔',
    howTo: 'Make a fist and rub it in a circle on your chest.',
    handshape: 'A hand (fist)',
    tip: 'Fist = SORRY, flat hand = PLEASE.',
  },
  {
    id: 'excuse-me', word: 'Excuse me', category: 'greetings', emoji: '🙇',
    howTo: 'Brush the fingertips of one hand across the palm of your other hand a couple of times.',
    handshape: 'Flat hands',
  },
  {
    id: 'yes', word: 'Yes', category: 'greetings', emoji: '✅', arasaacId: 5584,
    phrase: 'Yes.',
    howTo: 'Make a fist and nod it up and down, like your hand is a head nodding yes.',
    handshape: 'S hand (fist)',
  },
  {
    id: 'no', word: 'No', category: 'greetings', emoji: '⛔', arasaacId: 5526,
    phrase: 'No.',
    howTo: 'Snap your index and middle fingers down onto your thumb, like a beak closing.',
    handshape: 'Index + middle finger to thumb',
  },

  // ---------------- Needs ----------------
  {
    id: 'help', word: 'Help', category: 'needs', emoji: '🆘', arasaacId: 32648,
    phrase: 'I need help.',
    howTo: 'Make a fist with your thumb up and rest it on your other flat palm. Lift both hands up together.',
    handshape: 'A hand on flat B palm',
    tip: 'Lifting up shows you are asking someone to lift you up and help.',
  },
  {
    id: 'more', word: 'More', category: 'needs', emoji: '➕', arasaacId: 5508,
    phrase: 'I want more, please.',
    howTo: 'Bring the fingertips of both hands together (like flat-O shapes) and tap them together twice.',
    handshape: 'Flat O hands',
  },
  {
    id: 'all-done', word: 'All done', category: 'needs', emoji: '🏁', arasaacId: 32814,
    phrase: 'I am all done.',
    howTo: 'Hold both open hands up with palms facing you, then twist them outward so the palms face down or away.',
    handshape: 'Open 5 hands',
    aliases: ['finished', 'finish'],
  },
  {
    id: 'stop', word: 'Stop', category: 'needs', emoji: '🛑', arasaacId: 7196,
    phrase: 'Stop, please.',
    howTo: 'Chop the edge of one flat hand down onto the palm of your other flat hand.',
    handshape: 'Flat B hands',
  },
  {
    id: 'want', word: 'Want', category: 'needs', emoji: '🤲', arasaacId: 5441,
    phrase: 'I want that.',
    howTo: 'Hold both hands out with palms up and fingers curled like claws, then pull them toward your body.',
    handshape: 'Claw hands',
  },
  {
    id: 'need', word: 'Need', category: 'needs', emoji: '❗', arasaacId: 37160,
    phrase: 'I need that.',
    howTo: 'Hold your hand with the index finger bent like a hook and bend it downward twice, like a firm nod.',
    handshape: 'X hand (bent index)',
  },
  {
    id: 'wait', word: 'Wait', category: 'needs', emoji: '⏳', arasaacId: 36914,
    phrase: 'Please wait.',
    howTo: 'Hold both open hands out with palms up and wiggle your fingers.',
    handshape: 'Open 5 hands, palms up',
  },
  {
    id: 'break', word: 'Break', category: 'needs', emoji: '🛋️', arasaacId: 6604,
    phrase: 'I need a break.',
    howTo: 'Hold two fists together, thumbs touching, as if holding a stick, then snap them apart.',
    handshape: 'S hands (fists)',
    tip: 'Great for sensory breaks. You can also say REST by crossing your arms flat on your chest.',
    aliases: ['rest'],
  },
  {
    id: 'hungry', word: 'Hungry', category: 'needs', emoji: '🍽️',
    phrase: 'I am hungry.',
    howTo: 'Make a C shape with your hand and slide it down the center of your chest from your throat to your stomach.',
    handshape: 'C hand',
  },
  {
    id: 'thirsty', word: 'Thirsty', category: 'needs', emoji: '🥤',
    phrase: 'I am thirsty.',
    howTo: 'Point your index finger at your throat and trace it down your neck.',
    handshape: 'Index finger',
  },
  {
    id: 'toilet', word: 'Toilet', category: 'needs', emoji: '🚽', arasaacId: 5921,
    phrase: 'I need the bathroom.',
    howTo: 'Make a T shape (fist with the thumb tucked between your first two fingers) and shake it side to side.',
    handshape: 'T hand',
    aliases: ['bathroom', 'potty', 'restroom'],
  },
  {
    id: 'sleep', word: 'Sleep', category: 'needs', emoji: '😴', arasaacId: 2314,
    phrase: 'I am sleepy.',
    howTo: 'Hold an open hand in front of your face and pull it down while your fingers close together, with your eyes closing.',
    handshape: 'Open 5 closing to flat-O',
    aliases: ['sleepy', 'nap'],
  },
  {
    id: 'hurt', word: 'Hurt', category: 'needs', emoji: '🤕', arasaacId: 2367,
    phrase: 'Something hurts.',
    howTo: 'Point both index fingers toward each other and jab or twist them near the place that hurts.',
    handshape: 'Index fingers',
    tip: 'Move the sign to the part of the body that hurts so a helper knows where.',
    aliases: ['pain', 'ouch'],
  },
  {
    id: 'sick', word: 'Sick', category: 'needs', emoji: '🤒',
    phrase: 'I feel sick.',
    howTo: 'Touch the bent middle finger of one hand to your forehead and the bent middle finger of the other hand to your stomach.',
    handshape: 'Bent middle fingers',
  },
  {
    id: 'hot', word: 'Hot', category: 'needs', emoji: '🥵',
    phrase: 'I am too hot.',
    howTo: 'Hold a C hand at your mouth, then twist it outward and down like taking something hot out of your mouth.',
    handshape: 'C hand',
  },
  {
    id: 'cold', word: 'Cold', category: 'needs', emoji: '🥶',
    phrase: 'I am cold.',
    howTo: 'Make two fists, hold them near your chest, and shiver them with your shoulders hunched.',
    handshape: 'S hands (fists)',
  },
  {
    id: 'quiet', word: 'Quiet', category: 'needs', emoji: '🤫',
    phrase: 'I need it quiet, please.',
    howTo: 'Touch a finger to your lips, then lower both flat hands, palms down, in front of you.',
    handshape: 'Index finger, then flat hands',
    tip: 'Helpful for noisy places and sensory overload.',
  },

  // ---------------- Feelings ----------------
  {
    id: 'happy', word: 'Happy', category: 'feelings', emoji: '😊', arasaacId: 35533,
    phrase: 'I feel happy.',
    howTo: 'Brush your flat hands upward against your chest several times, with a smile.',
    handshape: 'Flat B hands',
  },
  {
    id: 'sad', word: 'Sad', category: 'feelings', emoji: '😢', arasaacId: 35545,
    phrase: 'I feel sad.',
    howTo: 'Hold your open hands in front of your face and let them drop down slowly, with a sad face.',
    handshape: 'Open 5 hands',
  },
  {
    id: 'angry', word: 'Angry', category: 'feelings', emoji: '😠', arasaacId: 35539,
    phrase: 'I feel angry.',
    howTo: 'Curl your fingers like claws in front of your face and pull your hand away while you show an angry face.',
    handshape: 'Claw hand',
    aliases: ['mad'],
  },
  {
    id: 'scared', word: 'Scared', category: 'feelings', emoji: '😨', arasaacId: 35535,
    phrase: 'I feel scared.',
    howTo: 'Hold both fists in front of your chest, then open them quickly to spread fingers while you lean back.',
    handshape: 'S hands opening to 5 hands',
    aliases: ['afraid', 'frightened'],
  },
  {
    id: 'tired', word: 'Tired', category: 'feelings', emoji: '🥱', arasaacId: 2314,
    phrase: 'I feel tired.',
    howTo: 'Rest the fingertips of both bent hands on your chest near your shoulders, then let them droop down.',
    handshape: 'Bent B hands',
  },
  {
    id: 'calm', word: 'Calm', category: 'feelings', emoji: '😌', arasaacId: 31310,
    phrase: 'I feel calm.',
    howTo: 'Hold both open hands in front of your chest, palms down, and lower them slowly while you take a deep breath.',
    handshape: 'Open 5 hands, palms down',
    tip: 'Try this sign along with slow belly breathing.',
  },
  {
    id: 'worried', word: 'Worried', category: 'feelings', emoji: '😟',
    phrase: 'I feel worried.',
    howTo: 'Hold flat hands in front of your face and circle them alternately, with a worried expression.',
    handshape: 'Flat B hands',
  },
  {
    id: 'excited', word: 'Excited', category: 'feelings', emoji: '🤩',
    phrase: 'I feel excited.',
    howTo: 'Use the middle fingers of both hands to brush upward on your chest, one after the other, with a big smile.',
    handshape: 'Middle fingers',
  },
  {
    id: 'love', word: 'Love', category: 'feelings', emoji: '❤️',
    phrase: 'I love you.',
    howTo: 'Cross both fists over your chest as if hugging yourself.',
    handshape: 'S hands (fists), crossed',
    tip: 'The same sign is used for HUG.',
    aliases: ['hug'],
  },
  {
    id: 'i-love-you', word: 'I love you', category: 'feelings', emoji: '🤟',
    phrase: 'I love you.',
    howTo: 'Hold up your thumb, index finger and pinky finger at the same time, with the palm facing forward.',
    handshape: 'ILY hand',
    tip: 'This one handshape combines the letters I, L and Y.',
    imageId: 'ily',
    aliases: ['ily'],
  },
  {
    id: 'like', word: 'Like', category: 'feelings', emoji: '👍', arasaacId: 37826,
    phrase: 'I like it.',
    howTo: 'Touch your thumb and middle finger to your chest, then pull them away from your body while they close together.',
    handshape: '8 hand',
  },

  // ---------------- Food & Drink ----------------
  {
    id: 'eat', word: 'Eat', category: 'food', emoji: '🍽️', arasaacId: 6456,
    phrase: 'I want to eat.',
    howTo: 'Bring your fingertips together into a flat-O shape and tap them to your mouth.',
    handshape: 'Flat O hand',
    aliases: ['food'],
  },
  {
    id: 'drink', word: 'Drink', category: 'food', emoji: '🥤', arasaacId: 6061,
    phrase: 'I want a drink.',
    howTo: 'Make a C shape as if holding a cup and tilt it toward your mouth.',
    handshape: 'C hand',
  },
  {
    id: 'water', word: 'Water', category: 'food', emoji: '💧', arasaacId: 32464,
    phrase: 'Water, please.',
    howTo: 'Make a W with three fingers and tap the side of your index finger on your chin twice.',
    handshape: 'W hand',
  },
  {
    id: 'milk', word: 'Milk', category: 'food', emoji: '🥛', arasaacId: 2445,
    phrase: 'Milk, please.',
    howTo: 'Squeeze your fist open and closed, like milking a cow.',
    handshape: 'S hand squeezing',
  },
  {
    id: 'apple', word: 'Apple', category: 'food', emoji: '🍎', arasaacId: 2462,
    howTo: 'Make an X hand (bent index finger) and twist the knuckle against your cheek.',
    handshape: 'X hand',
  },
  {
    id: 'banana', word: 'Banana', category: 'food', emoji: '🍌', arasaacId: 2530,
    howTo: 'Hold one index finger up like a banana and use your other hand to "peel" it downward.',
    handshape: 'Index finger + peeling hand',
  },
  {
    id: 'pizza', word: 'Pizza', category: 'food', emoji: '🍕', arasaacId: 2527,
    howTo: 'Make a P handshape and draw a Z in the air.',
    handshape: 'P hand',
  },
  {
    id: 'cookie', word: 'Cookie', category: 'food', emoji: '🍪', arasaacId: 8312,
    howTo: 'Twist a C hand on the palm of your other hand, like using a cookie cutter.',
    handshape: 'C hand on flat palm',
  },

  // ---------------- People & Family ----------------
  {
    id: 'me', word: 'Me / I', category: 'people', emoji: '🙋', arasaacId: 6632,
    speech: 'I',
    howTo: 'Point your index finger at your own chest.',
    handshape: 'Index finger point',
    aliases: ['i', 'me', 'my'],
  },
  {
    id: 'you', word: 'You', category: 'people', emoji: '👉', arasaacId: 6625,
    howTo: 'Point your index finger at the person you are talking to.',
    handshape: 'Index finger point',
  },
  {
    id: 'we', word: 'We', category: 'people', emoji: '👥', arasaacId: 7185,
    howTo: 'Touch your index finger to one shoulder and arc it across to your other shoulder.',
    handshape: 'Index finger',
    aliases: ['us'],
  },
  {
    id: 'mom', word: 'Mom', category: 'people', emoji: '👩', arasaacId: 2458,
    howTo: 'Tap the thumb of an open 5 hand against your chin.',
    handshape: 'Open 5 hand',
    tip: 'Mom is at the chin, Dad is at the forehead.',
    aliases: ['mother', 'mommy'],
  },
  {
    id: 'dad', word: 'Dad', category: 'people', emoji: '👨', arasaacId: 2497,
    howTo: 'Tap the thumb of an open 5 hand against your forehead.',
    handshape: 'Open 5 hand',
    aliases: ['father', 'daddy'],
  },
  {
    id: 'family', word: 'Family', category: 'people', emoji: '👨‍👩‍👧', 
    howTo: 'Make F hands touching in front of you, then circle them outward until the pinky sides meet.',
    handshape: 'F hands',
  },
  {
    id: 'friend', word: 'Friend', category: 'people', emoji: '🤝', arasaacId: 25790,
    howTo: 'Hook your index fingers together, then switch which finger is on top.',
    handshape: 'Hooked index fingers',
  },
  {
    id: 'baby', word: 'Baby', category: 'people', emoji: '👶',
    howTo: 'Cradle your arms as if holding a baby and rock them side to side.',
    handshape: 'Cradled arms',
  },
  {
    id: 'teacher', word: 'Teacher', category: 'people', emoji: '🧑‍🏫', arasaacId: 6556,
    howTo: 'Hold flat-O hands near your temples and move them forward (TEACH), then slide both flat hands down your sides (the "person" ending).',
    handshape: 'Flat O hands, then flat hands',
  },
  {
    id: 'doctor', word: 'Doctor', category: 'people', emoji: '👩‍⚕️', arasaacId: 6561,
    howTo: 'Tap a D hand (or M hand) on your wrist, like taking a pulse.',
    handshape: 'D hand',
  },

  // ---------------- Actions ----------------
  {
    id: 'go', word: 'Go', category: 'actions', emoji: '🚶', arasaacId: 8142,
    phrase: 'I want to go.',
    howTo: 'Point both index fingers toward each other, then flip them forward and move them out in front of you.',
    handshape: 'Index fingers',
  },
  {
    id: 'come', word: 'Come', category: 'actions', emoji: '🫴',
    howTo: 'Point your index fingers out with palms up and curl them toward your body, like beckoning.',
    handshape: 'Index fingers beckoning',
  },
  {
    id: 'play', word: 'Play', category: 'actions', emoji: '🎲', arasaacId: 23392,
    phrase: 'I want to play.',
    howTo: 'Hold up Y hands (thumb and pinky out) and shake them gently back and forth.',
    handshape: 'Y hands',
  },
  {
    id: 'look', word: 'Look', category: 'actions', emoji: '👀', arasaacId: 6564,
    howTo: 'Point a V hand from your eyes outward in the direction you want to look.',
    handshape: 'V hand',
    aliases: ['see'],
  },
  {
    id: 'read', word: 'Read', category: 'actions', emoji: '📖', arasaacId: 25191,
    howTo: 'Hold one flat palm like a page, and move a V hand (your "eyes") down it as if reading.',
    handshape: 'V hand over flat palm',
  },
  {
    id: 'sit', word: 'Sit', category: 'actions', emoji: '🪑',
    howTo: 'Hook two fingers (H hand) over two fingers of your other hand, like legs sitting on a chair.',
    handshape: 'H hands',
  },

  // ---------------- Places & Things ----------------
  {
    id: 'home', word: 'Home', category: 'things', emoji: '🏠', arasaacId: 2317,
    phrase: 'I want to go home.',
    howTo: 'Touch your fingertips (flat-O) near your mouth, then move them up near your cheek.',
    handshape: 'Flat O hand',
  },
  {
    id: 'school', word: 'School', category: 'things', emoji: '🏫', arasaacId: 3082,
    howTo: 'Clap one flat hand down on the palm of your other hand twice.',
    handshape: 'Flat B hands',
  },
  {
    id: 'car', word: 'Car', category: 'things', emoji: '🚗', arasaacId: 2339,
    howTo: 'Hold two fists as if gripping a steering wheel and turn them back and forth.',
    handshape: 'S hands (fists)',
    aliases: ['drive'],
  },
  {
    id: 'bed', word: 'Bed', category: 'things', emoji: '🛏️',
    howTo: 'Rest your cheek on both flat palms held together, like a pillow.',
    handshape: 'Flat B hands',
  },
  {
    id: 'book', word: 'Book', category: 'things', emoji: '📖', arasaacId: 25191,
    howTo: 'Hold your palms together, then open them like the cover of a book.',
    handshape: 'Flat B hands',
    videoIds: ['book'],
    aliases: ['books'],
  },
  {
    id: 'music', word: 'Music', category: 'things', emoji: '🎵', arasaacId: 24791,
    howTo: 'Swing your flat hand back and forth along your other forearm, like a conductor.',
    handshape: 'Flat B hand',
  },
  {
    id: 'about', word: 'About', category: 'things', emoji: '💬',
    howTo: 'Make a small circle in the air with your index finger around your other flat hand. See the video for the general form of the sign.',
    handshape: 'Index finger circling',
    videoIds: ['about'],
  },

  // ---------------- Questions ----------------
  {
    id: 'what', word: 'What', category: 'questions', emoji: '❓',
    howTo: 'Hold both open hands out with palms up and shake them slightly side to side with a questioning face.',
    handshape: 'Open 5 hands, palms up',
  },
  {
    id: 'where', word: 'Where', category: 'questions', emoji: '📍',
    howTo: 'Hold up your index finger and wag it side to side with a questioning face.',
    handshape: 'Index finger',
  },
  {
    id: 'who', word: 'Who', category: 'questions', emoji: '🧑',
    howTo: 'Circle your index finger around your lips, with eyebrows down.',
    handshape: 'Index finger',
  },
  {
    id: 'why', word: 'Why', category: 'questions', emoji: '🤔',
    howTo: 'Touch your fingertips to your forehead, then pull your hand away into a Y handshape.',
    handshape: 'Open hand to Y hand',
  },
  {
    id: 'how', word: 'How', category: 'questions', emoji: '🧐',
    howTo: 'Put your fists together back to back, then roll them forward until the palms face up.',
    handshape: 'S hands rolling to 5 hands',
  },
  {
    id: 'name', word: 'Name', category: 'questions', emoji: '🏷️',
    howTo: 'Cross two H hands (index and middle fingers together) and tap them together twice.',
    handshape: 'H hands',
  },
];

export const ASL_SIGN_MAP: Record<string, ASLSign> = Object.fromEntries(
  ASL_SIGNS.map((s) => [s.id, s])
);

// ---------------------------------------------------------------------------
// Openly licensed media (Wikimedia Commons). URLs were verified via the Commons API.
// ---------------------------------------------------------------------------
export interface ASLVideo {
  id: string;
  title: string;
  signWord: string;
  description: string;
  /** Preferred web-playable source (VP9 WebM, 240p) */
  webm: string;
  /** Original file as fallback for browsers that support Ogg */
  ogv: string;
  durationSec: number;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}

export const ASL_VIDEOS: ASLVideo[] = [
  {
    id: 'hello1',
    title: 'HELLO',
    signWord: 'Hello',
    description: 'A short clip showing the sign for HELLO.',
    webm: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d3/Hello1.ogv/Hello1.ogv.240p.vp9.webm',
    ogv: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Hello1.ogv',
    durationSec: 2.4,
    author: 'E5SUON',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hello1.ogv',
  },
  {
    id: 'hello2',
    title: 'HELLO (another way)',
    signWord: 'Hello',
    description: 'A second, slightly different way to sign HELLO.',
    webm: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/81/Hello2.ogv/Hello2.ogv.240p.vp9.webm',
    ogv: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Hello2.ogv',
    durationSec: 2.9,
    author: 'E5SUON',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hello2.ogv',
  },
  {
    id: 'book',
    title: 'BOOK',
    signWord: 'Book',
    description: 'Just the sign for BOOK, trimmed from a longer video.',
    webm: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/21/ASL_BOOK_justsign.ogv/ASL_BOOK_justsign.ogv.240p.vp9.webm',
    ogv: 'https://upload.wikimedia.org/wikipedia/commons/2/21/ASL_BOOK_justsign.ogv',
    durationSec: 0.7,
    author: 'Richard Goodrow',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:ASL_BOOK_justsign.ogv',
  },
  {
    id: 'about',
    title: 'ABOUT',
    signWord: 'About',
    description: 'The general way to sign the word ABOUT.',
    webm: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/5/55/About-_General_sign.ogv/About-_General_sign.ogv.240p.vp9.webm',
    ogv: 'https://upload.wikimedia.org/wikipedia/commons/5/55/About-_General_sign.ogv',
    durationSec: 2.5,
    author: 'Underresearched',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:About-_General_sign.ogv',
  },
];

export const ASL_VIDEO_MAP: Record<string, ASLVideo> = Object.fromEntries(
  ASL_VIDEOS.map((v) => [v.id, v])
);

export interface ASLImage {
  id: string;
  url: string;
  caption: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}

export const ASL_IMAGES: Record<string, ASLImage> = {
  ily: {
    id: 'ily',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/ASL_ILY%40Side-PalmForward_%28Cut_out%29.jpg',
    caption: 'The I-LOVE-YOU handshape',
    author: 'Rodasmith (derivative work by MagentaGreen)',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:ASL_ILY@Side-PalmForward_(Cut_out).jpg',
  },
};

// ---------------------------------------------------------------------------
// Fingerspelling (ASL manual alphabet) - public domain images from Wikimedia Commons
// ---------------------------------------------------------------------------
export const ASL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function getFingerspellingUrl(letter: string, width = 240): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/Sign_language_${letter.toUpperCase()}.svg?width=${width}`;
}

export const ASL_ALPHABET_NOTES: Record<string, string> = {
  J: 'J is drawn in the air: make an I hand and trace a J shape.',
  Z: 'Z is drawn in the air: point your index finger and trace a Z.',
};

// ---------------------------------------------------------------------------
// Learning content
// ---------------------------------------------------------------------------
export interface ASLBasicsCard {
  id: string;
  emoji: string;
  title: string;
  body: string;
}

export const ASL_BASICS: ASLBasicsCard[] = [
  {
    id: 'what-is-asl', emoji: '🤟', title: 'ASL is a real language',
    body: 'American Sign Language has its own grammar and vocabulary. It is used by many Deaf and hard-of-hearing people in the United States and parts of Canada. It is not just English on the hands.',
  },
  {
    id: 'five-parts', emoji: '✋', title: 'Five parts of every sign',
    body: '1) Handshape: how your fingers are shaped. 2) Location: where the sign is made. 3) Movement: how your hands move. 4) Palm orientation: which way your palms face. 5) Facial expression: your face adds meaning, like a question or a feeling.',
  },
  {
    id: 'face', emoji: '😊', title: 'Your face matters',
    body: 'Eyebrows up usually means a yes/no question. Eyebrows down usually means a "what, where, who, why" question. A smile or a sad face changes how a sign feels.',
  },
  {
    id: 'attention', emoji: '👀', title: 'Get attention kindly',
    body: 'Wave in view, tap a shoulder gently, or flick the lights. Look at the person while they sign. Eye contact is a way of listening.',
  },
  {
    id: 'practice', emoji: '🔁', title: 'Practice little and often',
    body: 'Five minutes a day works well. Use signs together with spoken words and your AAC board so each one gets stronger.',
  },
  {
    id: 'variation', emoji: '🗺️', title: 'Signs can vary',
    body: 'Like accents, signs can change a little between regions and families. If a Deaf friend or teacher signs it differently, follow them.',
  },
];

export const ASL_NUMBER_NOTES: { n: string; how: string }[] = [
  { n: '1', how: 'Index finger up.' },
  { n: '2', how: 'Index and middle fingers up.' },
  { n: '3', how: 'Thumb, index and middle fingers out.' },
  { n: '4', how: 'Four fingers up, thumb tucked in.' },
  { n: '5', how: 'Open hand, all five fingers spread.' },
  { n: '6', how: 'Thumb touches pinky; other three fingers up.' },
  { n: '7', how: 'Thumb touches ring finger; others up.' },
  { n: '8', how: 'Thumb touches middle finger; others up.' },
  { n: '9', how: 'Thumb touches index finger; others up.' },
  { n: '10', how: 'Thumbs-up fist, shake it a little.' },
];

/** The first set of signs that give the biggest everyday communication boost */
export const ASL_STARTER_IDS: string[] = [
  'hello', 'please', 'thank-you', 'more', 'all-done', 'help', 'stop', 'yes', 'no', 'eat', 'drink', 'water',
];

// ---------------------------------------------------------------------------
// ASL + AAC phrase builder
// ---------------------------------------------------------------------------
export interface ASLPhrase {
  id: string;
  text: string;
  emoji: string;
  signs: string[]; // ids from ASL_SIGNS in signing order
}

export const ASL_PHRASES: ASLPhrase[] = [
  { id: 'ph-help', text: 'I need help.', emoji: '🆘', signs: ['me', 'need', 'help'] },
  { id: 'ph-water', text: 'I want water, please.', emoji: '💧', signs: ['me', 'want', 'water', 'please'] },
  { id: 'ph-more', text: 'More, please.', emoji: '➕', signs: ['more', 'please'] },
  { id: 'ph-done', text: 'I am all done.', emoji: '🏁', signs: ['me', 'all-done'] },
  { id: 'ph-break', text: 'I need a break.', emoji: '🛋️', signs: ['me', 'need', 'break'] },
  { id: 'ph-hungry', text: 'I am hungry.', emoji: '🍽️', signs: ['me', 'hungry'] },
  { id: 'ph-toilet', text: 'I need the bathroom.', emoji: '🚽', signs: ['me', 'need', 'toilet'] },
  { id: 'ph-hurt', text: 'Something hurts.', emoji: '🤕', signs: ['hurt'] },
  { id: 'ph-love', text: 'I love you.', emoji: '🤟', signs: ['i-love-you'] },
  { id: 'ph-thanks', text: 'Thank you.', emoji: '🙏', signs: ['thank-you'] },
  { id: 'ph-home', text: 'I want to go home.', emoji: '🏠', signs: ['me', 'want', 'go', 'home'] },
  { id: 'ph-play', text: 'Let us play.', emoji: '🎲', signs: ['we', 'play'] },
];

/** Quick-tap palette for the sentence builder (ids from ASL_SIGNS) */
export const ASL_BUILDER_PALETTE: string[] = [
  'me', 'you', 'we', 'want', 'need', 'help', 'more', 'all-done', 'stop', 'wait', 'break',
  'eat', 'drink', 'water', 'milk', 'go', 'come', 'play', 'look', 'read',
  'yes', 'no', 'please', 'thank-you', 'sorry',
  'happy', 'sad', 'angry', 'scared', 'tired', 'hurt', 'hungry', 'thirsty', 'toilet',
  'mom', 'dad', 'friend', 'teacher', 'home', 'school', 'book', 'music',
];

export function getExternalSignLinks(word: string): { label: string; url: string }[] {
  const q = encodeURIComponent(word.toLowerCase());
  return [
    { label: 'Signing Savvy', url: `https://www.signingsavvy.com/search/${q}` },
    { label: 'YouTube', url: `https://www.youtube.com/results?search_query=ASL+sign+for+${q}` },
  ];
}
