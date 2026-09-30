import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Volume2, Trash2, Delete, BookmarkPlus } from 'lucide-react';
import { playChime } from '../utils/audio';

// Neurodivergent-friendly common phrase predictions
const WORD_PREDICTIONS = [
  'I need', 'I want', 'I feel', 'Can I', 'Please', 'Thank you',
  'I am hungry', 'I am tired', 'I need a break', 'I need help',
  'I feel overwhelmed', 'I am okay', 'I cannot speak right now',
  'Give me space', 'I need quiet', 'My head hurts',
  'I do not understand', 'Can you repeat that?', 'I am done',
  'I want to go home', 'This is too loud', 'I am scared',
];

// OpenDyslexic-inspired high-contrast keyboard layout
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const AacKeyboardModal: React.FC = () => {
  const {
    showAacKeyboardModal,
    setShowAacKeyboardModal,
    speak,
    addQuickPhrase,
    settings,
  } = useApp();

  const [text, setText] = useState('');
  const [isCaps, setIsCaps] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  if (!showAacKeyboardModal) return null;

  const handleKey = (char: string) => {
    playChime('tap');
    setText((prev) => prev + (isCaps ? char.toUpperCase() : char.toLowerCase()));
  };

  const handleSpace = () => {
    playChime('tap');
    setText((prev) => prev + ' ');
  };

  const handleBackspace = () => {
    setText((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setText('');
    playChime('clear');
  };

  const handleSpeak = () => {
    if (!text.trim()) return;
    speak(text.trim());
    setHistory((prev) => [text.trim(), ...prev.slice(0, 4)]);
    playChime('speak');
  };

  const handlePrediction = (phrase: string) => {
    setText(phrase + ' ');
    playChime('tap');
  };

  const handleSave = () => {
    if (!text.trim()) return;
    addQuickPhrase({ text: text.trim(), emoji: '⌨️', category: 'keyboard' });
    playChime('complete');
    setText('');
  };

  const filteredPredictions = text.trim()
    ? WORD_PREDICTIONS.filter((p) => p.toLowerCase().startsWith(text.toLowerCase())).slice(0, 6)
    : WORD_PREDICTIONS.slice(0, 6);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dyslexia-Friendly</p>
          <h2 className="text-lg font-black text-white">AAC Keyboard</h2>
        </div>
        <button
          onClick={() => setShowAacKeyboardModal(false)}
          className="w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Text display */}
      <div className="mx-4 mb-2 bg-white rounded-2xl px-4 py-3 min-h-[72px] flex items-center gap-2">
        <p className="flex-1 text-slate-800 text-lg font-bold leading-snug break-words">
          {text || <span className="text-slate-400 font-medium text-base">Start typing...</span>}
        </p>
        <div className="flex flex-col gap-1 shrink-0">
          {text && (
            <button onClick={handleBackspace} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer">
              <Delete className="w-4 h-4 text-slate-600" />
            </button>
          )}
          {text && (
            <button onClick={handleClear} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 cursor-pointer">
              <Trash2 className="w-4 h-4 text-rose-500" />
            </button>
          )}
        </div>
      </div>

      {/* Word predictions */}
      <div className="flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-thin">
        {filteredPredictions.map((p, i) => (
          <button
            key={i}
            onClick={() => handlePrediction(p)}
            className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs shrink-0 cursor-pointer transition-all active:scale-95"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Keyboard */}
      <div className="flex-1 flex flex-col justify-center px-2 py-2 gap-1.5">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className="w-8 sm:w-10 h-11 sm:h-12 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-black text-sm sm:text-base shadow-md cursor-pointer transition-all active:scale-90 border border-slate-600"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {isCaps ? key.toUpperCase() : key.toLowerCase()}
              </button>
            ))}
          </div>
        ))}

        {/* Bottom row */}
        <div className="flex justify-center gap-1 mt-0.5">
          <button
            onClick={() => setIsCaps((v) => !v)}
            className={`px-3 h-11 rounded-xl font-black text-xs cursor-pointer transition-all border ${
              isCaps ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-slate-700 text-white border-slate-600'
            }`}
          >
            ABC
          </button>
          <button
            onClick={handleSpace}
            className="flex-1 max-w-xs h-11 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-bold text-sm cursor-pointer transition-all border border-slate-500 active:scale-95"
          >
            SPACE
          </button>
          <button
            onClick={() => {
              handleKey(','); 
            }}
            className="w-9 h-11 rounded-xl bg-slate-700 text-white font-bold text-lg cursor-pointer border border-slate-600"
          >
            ,
          </button>
          <button
            onClick={() => handleKey('.')}
            className="w-9 h-11 rounded-xl bg-slate-700 text-white font-bold text-lg cursor-pointer border border-slate-600"
          >
            .
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-4 pb-4 pt-2">
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="flex items-center gap-1.5 px-3 py-3 rounded-2xl bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-600 transition-all"
        >
          <BookmarkPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>
        <button
          onClick={handleSpeak}
          disabled={!text.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
        >
          <Volume2 className="w-5 h-5" />
          <span>SPEAK</span>
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="px-4 pb-4 flex gap-2 overflow-x-auto scrollbar-thin">
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
