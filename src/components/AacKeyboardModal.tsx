import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Volume2, Trash2, Delete, BookmarkPlus, Lightbulb } from 'lucide-react';
import { playChime } from '../utils/audio';
import { getVoicePersonaById } from '../data/voicePersonasData';

// High frequency AAC core vocabulary for predictive word completion
const CORE_AAC_WORDS = [
  // Core actions / verbs
  'want', 'need', 'like', 'feel', 'go', 'see', 'look', 'eat', 'drink',
  'play', 'help', 'stop', 'wait', 'read', 'write', 'sleep', 'listen',
  'touch', 'open', 'close', 'give', 'take', 'make', 'talk', 'come',
  'wash', 'clean', 'brush', 'put', 'get', 'sit', 'stand', 'love',
  'know', 'think', 'tell', 'hear', 'find', 'run', 'walk', 'jump',
  'call', 'hug', 'share', 'choose', 'watch', 'wear', 'turn',
  // Pronouns
  'I', 'you', 'he', 'she', 'we', 'they', 'it', 'me', 'my', 'your',
  // Feelings & states
  'happy', 'sad', 'tired', 'hungry', 'thirsty', 'angry', 'scared',
  'calm', 'sick', 'hurt', 'cold', 'hot', 'warm', 'good', 'bad', 'great',
  'fine', 'okay', 'ready', 'done', 'bored', 'excited', 'overwhelmed',
  // Objects & places
  'water', 'food', 'snack', 'home', 'school', 'break', 'bathroom',
  'toilet', 'mom', 'dad', 'family', 'friend', 'teacher', 'toy',
  'game', 'book', 'music', 'bed', 'shoes', 'blanket', 'medicine',
  'tablet', 'phone', 'outside', 'park', 'car', 'bus', 'room',
  // Prepositions & connectors
  'please', 'thank you', 'yes', 'no', 'more', 'all done', 'now',
  'later', 'again', 'what', 'where', 'when', 'why', 'how', 'who',
  'with', 'to', 'for', 'in', 'on', 'at', 'and', 'not'
];

// Contextual next-word predictions
const CONTEXT_PREDICTIONS: Record<string, string[]> = {
  'i': ['want', 'need', 'feel', 'like', 'am', 'can', 'go', 'see', 'love'],
  'i want': ['water', 'food', 'a snack', 'to play', 'to go', 'help', 'more', 'to sleep'],
  'i need': ['help', 'a break', 'water', 'medicine', 'the bathroom', 'quiet', 'space'],
  'i feel': ['tired', 'happy', 'sad', 'overwhelmed', 'sick', 'hurt', 'calm', 'angry'],
  'i am': ['tired', 'hungry', 'thirsty', 'okay', 'ready', 'done', 'fine', 'scared'],
  'can i': ['have', 'go', 'play', 'get', 'see', 'have water', 'take a break'],
  'can you': ['help me', 'wait', 'repeat that', 'open this', 'give me', 'come here'],
  'please': ['help', 'stop', 'wait', 'more', 'give me', 'listen'],
  'thank': ['you'],
  'go': ['home', 'to school', 'outside', 'to the bathroom', 'to bed'],
  'more': ['water', 'food', 'time', 'please', 'play'],
  'it is': ['too loud', 'too bright', 'good', 'bad', 'hot', 'cold', 'okay'],
  'help': ['me', 'please'],
};

// Initial starter prompts when text is empty
const STARTER_PROMPTS = [
  'I want', 'I need', 'I feel', 'Can I', 'Please', 'Thank you', 'I am', 'Help me'
];

// OpenDyslexic-inspired high-contrast keyboard layouts
const KEYBOARD_ROW_1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const KEYBOARD_ROW_2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const KEYBOARD_ROW_3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
const NUMBERS_ROW_1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const NUMBERS_ROW_2 = ['!', '@', '#', '$', '%', '&', '*', '(', ')', '-'];

export const AacKeyboardModal: React.FC = () => {
  const {
    showAacKeyboardModal,
    setShowAacKeyboardModal,
    speak,
    addQuickPhrase,
    settings,
    isPremium,
  } = useApp();

  const [text, setText] = useState('');
  const [isCaps, setIsCaps] = useState(false);
  const [isNumMode, setIsNumMode] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  if (!showAacKeyboardModal) return null;

  const activePersonaId = settings?.voicePersona || 'amy';
  const activePersona = getVoicePersonaById(activePersonaId);
  const activeVoiceName = activePersonaId === 'system' ? 'System Voice' : activePersona.name;

  const handleKey = (char: string) => {
    playChime('tap');
    setText((prev) => prev + (isCaps ? char.toUpperCase() : char.toLowerCase()));
  };

  const handleSpace = () => {
    playChime('tap');
    setText((prev) => prev + ' ');
  };

  const handleBackspace = () => {
    playChime('tap');
    setText((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setText('');
    playChime('clear');
  };

  const handleSpeak = () => {
    if (!text.trim()) return;
    const personaToUse = settings?.voicePersona || 'amy';
    speak(text.trim(), {
      voicePersona: personaToUse,
      voiceURI: personaToUse === 'system' ? settings?.selectedVoiceURI : undefined,
      force: true,
    });
    setHistory((prev) => [text.trim(), ...prev.slice(0, 4)]);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    playChime('tap');
    const isEndingWithSpace = text.endsWith(' ');

    if (!text.trim()) {
      setText(suggestion + ' ');
      return;
    }

    if (isEndingWithSpace) {
      setText((prev) => `${prev.trimEnd()} ${suggestion} `);
    } else {
      const lastSpaceIdx = text.lastIndexOf(' ');
      if (lastSpaceIdx === -1) {
        setText(suggestion + ' ');
      } else {
        const prefix = text.substring(0, lastSpaceIdx + 1);
        setText(`${prefix}${suggestion} `);
      }
    }
  };

  const handleSave = () => {
    if (!text.trim()) return;
    addQuickPhrase({ text: text.trim(), emoji: '', category: 'keyboard' });
    playChime('complete');
    setText('');
  };

  // Compute dynamic suggestions / predictive text
  const getSuggestions = (): string[] => {
    const trimmed = text.trim();
    if (!trimmed) {
      return STARTER_PROMPTS;
    }

    const isEndingWithSpace = text.endsWith(' ');

    if (!isEndingWithSpace) {
      const tokens = trimmed.split(/\s+/);
      const currPrefix = tokens[tokens.length - 1].toLowerCase();

      const wordMatches = CORE_AAC_WORDS.filter((w) =>
        w.toLowerCase().startsWith(currPrefix) && w.toLowerCase() !== currPrefix
      );

      const phraseMatches = tokens.length === 1
        ? STARTER_PROMPTS.filter((p) => p.toLowerCase().startsWith(currPrefix))
        : [];

      const combined = [...new Set([...wordMatches, ...phraseMatches])];
      if (combined.length > 0) {
        return combined.slice(0, 8);
      }
    }

    const words = trimmed.toLowerCase().split(/\s+/);
    const lastOne = words[words.length - 1];
    const lastTwo = words.length >= 2 ? `${words[words.length - 2]} ${words[words.length - 1]}` : '';

    if (lastTwo && CONTEXT_PREDICTIONS[lastTwo]) {
      return CONTEXT_PREDICTIONS[lastTwo].slice(0, 8);
    }

    if (lastOne && CONTEXT_PREDICTIONS[lastOne]) {
      return CONTEXT_PREDICTIONS[lastOne].slice(0, 8);
    }

    return ['want', 'need', 'like', 'more', 'please', 'stop', 'help'];
  };

  const suggestions = getSuggestions();

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dyslexia-Friendly</p>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Volume2 className="w-3 h-3 text-amber-400" />
              <span>Voice: {activeVoiceName}</span>
            </span>
          </div>
          <h2 className="text-lg font-black text-white">AAC Keyboard</h2>
        </div>
        <button
          onClick={() => setShowAacKeyboardModal(false)}
          className="w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-pointer transition active:scale-95"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Text display */}
      <div className="mx-4 mb-2 bg-white rounded-2xl px-4 py-3 min-h-[68px] sm:min-h-[76px] flex items-center gap-2 shadow-inner shrink-0">
        <p className="flex-1 text-slate-800 text-lg sm:text-xl font-bold leading-snug break-words">
          {text || <span className="text-slate-400 font-medium text-base">Start typing...</span>}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          {text && (
            <button
              type="button"
              aria-label="Backspace"
              onClick={handleBackspace}
              className="p-2 sm:px-3 sm:py-2 flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer font-bold text-xs transition active:scale-95"
            >
              <Delete className="w-4 h-4 text-slate-600" />
            </button>
          )}
          {text && (
            <button
              type="button"
              aria-label="Clear all typed text"
              onClick={handleClear}
              className="p-2 sm:px-3 sm:py-2 flex items-center gap-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer font-bold text-xs transition active:scale-95"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
            </button>
          )}
        </div>
      </div>

      {/* Predictive / Suggestion Text Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 scrollbar-thin bg-slate-800/80 border-y border-slate-700/80 shrink-0">
        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-400 shrink-0 pr-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Predict:</span>
        </div>
        {suggestions.map((word, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelectSuggestion(word)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-amber-400 hover:text-amber-950 active:bg-amber-500 text-white font-black text-xs sm:text-sm shrink-0 cursor-pointer transition-all active:scale-95 shadow-xs border border-slate-600 hover:border-amber-400"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Keyboard Grid */}
      <div className="flex-1 flex flex-col justify-center px-2 py-2 gap-1.5">
        {/* Row 1 */}
        <div className="flex justify-center gap-1">
          {(isNumMode ? NUMBERS_ROW_1 : KEYBOARD_ROW_1).map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className="w-8 sm:w-11 h-11 sm:h-12 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-black text-sm sm:text-base shadow-md cursor-pointer transition-all active:scale-90 border border-slate-600"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {isCaps ? key.toUpperCase() : key.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex justify-center gap-1">
          {(isNumMode ? NUMBERS_ROW_2 : KEYBOARD_ROW_2).map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className="w-8 sm:w-11 h-11 sm:h-12 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-black text-sm sm:text-base shadow-md cursor-pointer transition-all active:scale-90 border border-slate-600"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {isCaps ? key.toUpperCase() : key.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Row 3 with dedicated Backspace Key */}
        <div className="flex justify-center gap-1">
          {/* Shift / Caps button */}
          <button
            onClick={() => setIsCaps((v) => !v)}
            className={`px-2.5 sm:px-3 h-11 sm:h-12 rounded-xl font-black text-xs cursor-pointer transition-all border shrink-0 ${
              isCaps ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
            }`}
            aria-label="Shift / Caps Lock"
          >
            ⇧
          </button>

          {KEYBOARD_ROW_3.map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className="w-8 sm:w-11 h-11 sm:h-12 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-black text-sm sm:text-base shadow-md cursor-pointer transition-all active:scale-90 border border-slate-600"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {isCaps ? key.toUpperCase() : key.toLowerCase()}
            </button>
          ))}

          {/* Primary Backspace Key on Keyboard */}
          <button
            onClick={handleBackspace}
            className="px-3 sm:px-4 h-11 sm:h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-rose-300 font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-90 border border-slate-700 flex items-center justify-center shrink-0"
            aria-label="Backspace"
            title="Backspace"
          >
            <Delete className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />
          </button>
        </div>

        {/* Bottom row */}
        <div className="flex justify-center gap-1.5 mt-0.5">
          <button
            onClick={() => setIsNumMode((v) => !v)}
            className={`px-3 sm:px-4 h-11 rounded-xl font-black text-xs cursor-pointer transition-all border shrink-0 ${
              isNumMode ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-slate-800 text-white hover:bg-slate-700 border-slate-700'
            }`}
          >
            {isNumMode ? 'ABC' : '123'}
          </button>

          <button
            onClick={handleSpace}
            className="flex-1 max-w-sm h-11 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-bold text-sm cursor-pointer transition-all border border-slate-500 active:scale-95 shadow-xs"
          >
            SPACE
          </button>

          <button
            onClick={() => handleKey(',')}
            className="w-9 sm:w-11 h-11 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg cursor-pointer border border-slate-600 shrink-0"
          >
            ,
          </button>

          <button
            onClick={() => handleKey('.')}
            className="w-9 sm:w-11 h-11 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg cursor-pointer border border-slate-600 shrink-0"
          >
            .
          </button>

          <button
            onClick={handleBackspace}
            className="w-9 sm:w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-rose-300 font-bold text-base cursor-pointer border border-slate-700 flex items-center justify-center shrink-0 sm:hidden"
            aria-label="Backspace"
          >
            <Delete className="w-4 h-4 text-rose-300" />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-4 pb-4 pt-1 shrink-0">
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="flex items-center gap-1.5 px-3 py-3 rounded-2xl bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-600 transition-all shrink-0"
        >
          <BookmarkPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>
        <button
          onClick={handleSpeak}
          disabled={!text.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
        >
          <Volume2 className="w-5 h-5" />
          <span>SPEAK</span>
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-thin shrink-0">
          <span className="text-[10px] font-black uppercase text-slate-500 shrink-0 self-center">Recent:</span>
          {history.map((item, i) => (
            <button
              key={i}
              onClick={() => { setText(item); }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs shrink-0 cursor-pointer hover:bg-slate-700 border border-slate-700 truncate max-w-[160px]"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
