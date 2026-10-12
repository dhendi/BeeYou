import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Volume2, 
  Home, 
  Camera, 
  Sparkles, 
  Layers, 
  Lock, 
  Mic, 
  Folder, 
  Smile, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { GridStage, DwellMode, STORAGE_KEYS } from '../../types/aac';
import { speakText, stopSpeaking, playChime } from '../../utils/audio';
import { autocorrectAacGrammar, adjustSentenceTokensOnTheSpot } from '../../utils/aacGrammar';
import { getMulberrySymbolUrl } from '../../services/symbolService';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStage?: GridStage;
}

// 4-Tile Starter Core Words (Cause & Effect) with Official Mulberry AAC Symbols
const STAGE_1_TILES = [
  { id: 'want', label: 'WANT', speech: 'I want', symbolUrl: getMulberrySymbolUrl('want_,_to'), emoji: '🤲', color: 'verb', row: 0, col: 0 },
  { id: 'more', label: 'MORE', speech: 'More, please', symbolUrl: getMulberrySymbolUrl('more'), emoji: '➕', color: 'descriptor', row: 0, col: 1 },
  { id: 'stop', label: 'STOP', speech: 'Stop, all done', symbolUrl: getMulberrySymbolUrl('backstop'), emoji: '🛑', color: 'alert', row: 1, col: 0 },
  { id: 'help', label: 'HELP', speech: 'I need help', symbolUrl: getMulberrySymbolUrl('help_,_to'), emoji: '🆘', color: 'social', row: 1, col: 1 },
];

// 12-Tile Motor Expansion with Official Mulberry AAC Symbols (First 4 words remain in exact same slots!)
const STAGE_2_TILES = [
  // Row 0
  { id: 'want', label: 'WANT', speech: 'I want', symbolUrl: getMulberrySymbolUrl('want_,_to'), emoji: '🤲', color: 'verb', row: 0, col: 0, isOriginal: true },
  { id: 'more', label: 'MORE', speech: 'More, please', symbolUrl: getMulberrySymbolUrl('more'), emoji: '➕', color: 'descriptor', row: 0, col: 1, isOriginal: true },
  { id: 'go', label: 'GO', speech: 'Go', symbolUrl: getMulberrySymbolUrl('go_,_to'), emoji: '🟢', color: 'verb', row: 0, col: 2, isNew: true },
  { id: 'like', label: 'LIKE', speech: 'I like this', symbolUrl: getMulberrySymbolUrl('good'), emoji: '👍', color: 'verb', row: 0, col: 3, isNew: true },
  
  // Row 1
  { id: 'stop', label: 'STOP', speech: 'Stop, all done', symbolUrl: getMulberrySymbolUrl('backstop'), emoji: '🛑', color: 'alert', row: 1, col: 0, isOriginal: true },
  { id: 'help', label: 'HELP', speech: 'I need help', symbolUrl: getMulberrySymbolUrl('help_,_to'), emoji: '🆘', color: 'social', row: 1, col: 1, isOriginal: true },
  { id: 'yes', label: 'YES', speech: 'Yes', symbolUrl: getMulberrySymbolUrl('good'), emoji: '✅', color: 'social', row: 1, col: 2, isNew: true },
  { id: 'no', label: 'NO', speech: 'No thank you', symbolUrl: getMulberrySymbolUrl('mistake_no_wrong'), emoji: '❌', color: 'social', row: 1, col: 3, isNew: true },
  
  // Row 2
  { id: 'me', label: 'ME', speech: 'Me', symbolUrl: getMulberrySymbolUrl('good_person'), emoji: '👤', color: 'person', row: 2, col: 0, isNew: true },
  { id: 'you', label: 'YOU', speech: 'You', symbolUrl: getMulberrySymbolUrl('good_person'), emoji: '👥', color: 'person', row: 2, col: 1, isNew: true },
  { id: 'eat', label: 'EAT', speech: 'I want to eat', symbolUrl: getMulberrySymbolUrl('eat_,_to'), emoji: '🥪', color: 'action', row: 2, col: 2, isNew: true },
  { id: 'play', label: 'PLAY', speech: 'Let us play', symbolUrl: getMulberrySymbolUrl('play_,_to'), emoji: '⚽', color: 'action', row: 2, col: 3, isNew: true },
];

// Full Matrix Core Preview with Official Mulberry AAC Symbols
const STAGE_3_TILES = [
  { id: 'me', label: 'ME', symbolUrl: getMulberrySymbolUrl('good_person'), emoji: '👤', color: 'person' },
  { id: 'you', label: 'YOU', symbolUrl: getMulberrySymbolUrl('good_person'), emoji: '👥', color: 'person' },
  { id: 'want', label: 'WANT', symbolUrl: getMulberrySymbolUrl('want_,_to'), emoji: '🤲', color: 'verb', isOriginal: true },
  { id: 'like', label: 'LIKE', symbolUrl: getMulberrySymbolUrl('good'), emoji: '❤️', color: 'verb' },
  { id: 'go', label: 'GO', symbolUrl: getMulberrySymbolUrl('go_,_to'), emoji: '🟢', color: 'verb' },
  { id: 'look', label: 'LOOK', symbolUrl: getMulberrySymbolUrl('look_,_to'), emoji: '👀', color: 'verb' },
  { id: 'more', label: 'MORE', symbolUrl: getMulberrySymbolUrl('more'), emoji: '➕', color: 'descriptor', isOriginal: true },
  { id: 'good', label: 'GOOD', symbolUrl: getMulberrySymbolUrl('good'), emoji: '🌟', color: 'descriptor' },
  { id: 'big', label: 'BIG', symbolUrl: getMulberrySymbolUrl('big'), emoji: '🐘', color: 'descriptor' },
  { id: 'stop', label: 'STOP', symbolUrl: getMulberrySymbolUrl('backstop'), emoji: '🛑', color: 'alert', isOriginal: true },
  { id: 'help', label: 'HELP', symbolUrl: getMulberrySymbolUrl('help_,_to'), emoji: '🆘', color: 'social', isOriginal: true },
  { id: 'yes', label: 'YES', symbolUrl: getMulberrySymbolUrl('good'), emoji: '✅', color: 'social' },
  { id: 'no', label: 'NO', symbolUrl: getMulberrySymbolUrl('mistake_no_wrong'), emoji: '❌', color: 'social' },
  { id: 'eat', label: 'EAT', symbolUrl: getMulberrySymbolUrl('eat_,_to'), emoji: '🥪', color: 'action' },
  { id: 'drink', label: 'DRINK', symbolUrl: getMulberrySymbolUrl('drink'), emoji: '🧃', color: 'action' },
  { id: 'play', label: 'PLAY', symbolUrl: getMulberrySymbolUrl('play_,_to'), emoji: '🎮', color: 'action' },
  { id: 'happy', label: 'HAPPY', symbolUrl: getMulberrySymbolUrl('happy_man'), emoji: '😊', color: 'feeling' },
  { id: 'tired', label: 'TIRED', symbolUrl: getMulberrySymbolUrl('sleep_male_,_to'), emoji: '😴', color: 'feeling' },
];

// Fitzgerald Key Theme Helper
const getColorClasses = (type: string) => {
  switch (type) {
    case 'verb':
    case 'action':
      return 'border-[#22C55E] bg-[#F0FDF4] text-[#14532D] shadow-[0_6px_0_0_#16A34A,0_10px_20px_rgba(22,163,74,0.15)] active:shadow-[0_2px_0_0_#16A34A]';
    case 'descriptor':
      return 'border-[#0284C7] bg-[#F0F9FF] text-[#0C4A6E] shadow-[0_6px_0_0_#0284C7,0_10px_20px_rgba(2,132,199,0.15)] active:shadow-[0_2px_0_0_#0284C7]';
    case 'alert':
      return 'border-[#F43F5E] bg-[#FFF1F2] text-[#881337] shadow-[0_6px_0_0_#E11D48,0_10px_20px_rgba(225,29,72,0.15)] active:shadow-[0_2px_0_0_#E11D48]';
    case 'social':
      return 'border-[#EAB308] bg-[#FEFCE8] text-[#713F12] shadow-[0_6px_0_0_#CA8A04,0_10px_20px_rgba(202,138,4,0.15)] active:shadow-[0_2px_0_0_#CA8A04]';
    case 'person':
      return 'border-[#F59E0B] bg-[#FFFBEB] text-[#78350F] shadow-[0_6px_0_0_#D97706,0_10px_20px_rgba(217,119,6,0.15)] active:shadow-[0_2px_0_0_#D97706]';
    case 'noun':
      return 'border-[#F97316] bg-[#FFF7ED] text-[#7C2D12] shadow-[0_6px_0_0_#EA580C,0_10px_20px_rgba(234,88,12,0.15)] active:shadow-[0_2px_0_0_#EA580C]';
    case 'feeling':
      return 'border-[#A855F7] bg-[#FAF5FF] text-[#581C87] shadow-[0_6px_0_0_#9333EA,0_10px_20px_rgba(147,51,234,0.15)] active:shadow-[0_2px_0_0_#9333EA]';
    default:
      return 'border-amber-400 bg-white text-stone-900 shadow-[0_6px_0_0_#D97706,0_10px_20px_rgba(217,119,6,0.12)] active:shadow-[0_2px_0_0_#D97706]';
  }
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  initialStage = 1,
}) => {
  const [step, setStep] = useState<number>(1);
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');
  const [lastTappedId, setLastTappedId] = useState<string | null>(null);

  // Step 3 Sentence Builder Strip State
  const [builtSentence, setBuiltSentence] = useState<string[]>([]);

  // Step 4 Folder State
  const [currentFolder, setCurrentFolder] = useState<'root' | 'snacks'>('root');

  // Step 5 Photo Tile State
  const [photoCutoutActive, setPhotoCutoutActive] = useState<boolean>(true);

  // Step 6 Grammar Conjugation State
  const [grammarTense, setGrammarTense] = useState<'Wait' | 'Waited' | 'Waiting' | 'Waits'>('Wait');
  const [phoneticTestWord, setPhoneticTestWord] = useState<string>('Quinoa');
  const [phoneticSpelling, setPhoneticSpelling] = useState<string>('KEEN-wah');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setBuiltSentence([]);
      setCurrentFolder('root');
      setPhotoCutoutActive(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Speak and trigger tactile feedback
  const handleTileTap = (id: string, speech: string) => {
    setLastTappedId(id);
    setActiveSpeechText(speech);
    playChime('tap');
    stopSpeaking();
    speakText(speech, { force: true });
    setTimeout(() => setLastTappedId(null), 300);
  };

  // Complete and lock stage
  const handleSaveAndLockStage = (stage: GridStage) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      localStorage.setItem(STORAGE_KEYS.GRID_STAGE, stage.toString());
      window.dispatchEvent(new CustomEvent('beeyou_grid_stage_change', { detail: { stage } }));
    } catch {}
    playChime('complete');
    onClose();
  };

  // Escape hatch: Skip & Jump to App
  const handleSkipToApp = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      if (!localStorage.getItem(STORAGE_KEYS.GRID_STAGE)) {
        localStorage.setItem(STORAGE_KEYS.GRID_STAGE, '1');
      }
    } catch {}
    playChime('tap');
    onClose();
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-amber-50/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 select-none text-slate-800"
    >
      <div className="relative w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col bg-[#FAF8F5] border-3 border-amber-300 rounded-3xl shadow-[0_20px_60px_rgba(217,119,6,0.18)] overflow-hidden">
        
        {/* TOP BAR / PERSISTENT ESCAPE HATCH */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-amber-100/90 to-amber-50 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-base shadow-xs">
              🐝
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                BeeYou Interactive Tour • Step {step} of 6
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      playChime('tap');
                      setStep(i);
                    }}
                    aria-label={`Go to step ${i}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      step === i 
                        ? 'w-6 bg-amber-500 shadow-xs' 
                        : i < step 
                        ? 'w-2.5 bg-amber-300' 
                        : 'w-2 bg-stone-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Escape Hatch Button */}
          <button
            type="button"
            onClick={handleSkipToApp}
            className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-300 text-stone-600 hover:text-rose-600 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Skip onboarding and open app"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Skip & Jump to App</span>
            <span className="sm:hidden">Skip</span>
          </button>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">

          {/* STEP 1: 4-TILE STARTER (CAUSE & EFFECT) */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wide border border-emerald-300">
                  Stage 1: Cause & Effect
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Tap any button to hear the voice!
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  Start simple. Giant tactile clay buttons make communication easy with zero clutter.
                </p>
              </div>

              {/* 2x2 Oversized Clay Grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-md mx-auto p-3 bg-amber-100/50 rounded-3xl border-2 border-amber-200/80">
                {STAGE_1_TILES.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => handleTileTap(tile.id, tile.speech)}
                    className={`h-32 sm:h-36 rounded-3xl border-3 flex flex-col items-center justify-center gap-1.5 p-3 transition-all duration-150 cursor-pointer select-none ${getColorClasses(tile.color)} ${
                      lastTappedId === tile.id ? 'translate-y-1 scale-95' : 'hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center pointer-events-none">
                      <img
                        src={tile.symbolUrl}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          target.style.display = 'none';
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = 'block';
                          }
                        }}
                      />
                      <span aria-hidden="true" className="hidden text-4xl sm:text-5xl drop-shadow-xs">
                        {tile.emoji}
                      </span>
                    </div>
                    <span className="text-base sm:text-lg font-black tracking-wider uppercase">
                      {tile.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Spoken Output Banner */}
              <div className="max-w-md mx-auto p-3 rounded-2xl bg-white border-2 border-amber-200 flex items-center justify-center gap-2 text-amber-900 font-extrabold text-xs sm:text-sm shadow-xs">
                <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {activeSpeechText ? `Spoke: "${activeSpeechText}"` : 'Touch any card above to test voice output!'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: 12-TILE EXPANSION (MOTOR PLANNING CONTINUITY) */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-black uppercase tracking-wide border border-sky-300">
                  Stage 2: Motor Continuity
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Growing to 12 Words
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  Notice how the first 4 words didn&apos;t move? That&apos;s muscle memory!
                </p>
              </div>

              {/* 3x4 Grid with original 4 locked in place */}
              <div className="max-w-xl mx-auto p-3 sm:p-4 bg-amber-100/50 rounded-3xl border-2 border-amber-200/80">
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                  {STAGE_2_TILES.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => handleTileTap(tile.id, tile.speech)}
                      className={`relative h-20 sm:h-24 rounded-2xl sm:rounded-3xl border-2 sm:border-3 flex flex-col items-center justify-center gap-1 p-1.5 transition-all duration-150 cursor-pointer select-none ${getColorClasses(tile.color)} ${
                        lastTappedId === tile.id ? 'translate-y-1 scale-95' : 'hover:-translate-y-0.5'
                      }`}
                    >
                      {tile.isOriginal && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 border border-white text-white flex items-center justify-center text-[10px] shadow-xs" title="Position locked for muscle memory">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                      <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center pointer-events-none">
                        <img
                          src={tile.symbolUrl}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'block';
                            }
                          }}
                        />
                        <span aria-hidden="true" className="hidden text-2xl sm:text-3xl">
                          {tile.emoji}
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase leading-none">
                        {tile.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Motor Continuity Explainer Callout */}
              <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-amber-100/70 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950 font-bold">
                <div className="w-6 h-6 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-xs">
                  🔒
                </div>
                <div>
                  <strong>Permanent Spatial Coordinates:</strong> In BeeYou, high-frequency core words never shift positions as vocabulary expands, preventing motor frustration.
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FULL GRID (STAGE 3) */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black uppercase tracking-wide border border-purple-300">
                  Stage 3: Full Vocabulary Matrix
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Full Vocabulary Matrix
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  For communicators ready to build complete multi-word sentences.
                </p>
              </div>

              {/* Live Interactive Sentence Strip Preview */}
              <div className="max-w-2xl mx-auto p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-sm flex items-center justify-between gap-3">
                <div className="flex-1 flex items-center gap-2 overflow-x-auto min-h-[38px] p-1">
                  {builtSentence.length === 0 ? (
                    <span className="text-xs font-bold text-stone-400 italic">
                      Tap tiles below to build a sentence...
                    </span>
                  ) : (
                    <>
                      {builtSentence.map((word, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 font-black text-xs"
                        >
                          {word}
                        </span>
                      ))}
                      {builtSentence.length > 1 && (
                        <span className="ml-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 shrink-0 animate-in fade-in">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>&quot;{autocorrectAacGrammar(builtSentence)}&quot;</span>
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {builtSentence.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        playChime('clear');
                        setBuiltSentence([]);
                      }}
                      className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold cursor-pointer"
                      title="Clear strip"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (builtSentence.length === 0) return;
                      const phrase = autocorrectAacGrammar(builtSentence);
                      handleTileTap('strip', phrase);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs shadow-xs hover:from-emerald-600 hover:to-teal-600 active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>SPEAK</span>
                  </button>
                </div>
              </div>

              {/* Full Matrix Grid Preview */}
              <div className="max-w-2xl mx-auto p-3 bg-amber-100/50 rounded-3xl border-2 border-amber-200/80">
                <div className="grid grid-cols-6 gap-2">
                  {STAGE_3_TILES.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => {
                        handleTileTap(tile.id, tile.label);
                        setBuiltSentence((prev) => adjustSentenceTokensOnTheSpot([...prev, tile.label]));
                      }}
                      className={`h-16 rounded-2xl border-2 flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${getColorClasses(tile.color)} ${
                        lastTappedId === tile.id ? 'translate-y-1 scale-95' : 'hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="w-7 h-7 flex items-center justify-center pointer-events-none">
                        <img
                          src={tile.symbolUrl}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'block';
                            }
                          }}
                        />
                        <span aria-hidden="true" className="hidden text-xl">
                          {tile.emoji}
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tight leading-none mt-0.5">{tile.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: FOLDERS & BREADCRUMB NAVIGATION */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black uppercase tracking-wide border border-amber-300">
                  Step 4: Smart Navigation
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Organized in Folders
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  Group specific snacks, toys, and activities without ever getting lost.
                </p>
              </div>

              {/* Interactive Folder Simulation Card */}
              <div className="max-w-lg mx-auto bg-white border-3 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                
                {/* Persistent Top Home Breadcrumb with Visual Pulse */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playChime('tap');
                        setCurrentFolder('root');
                      }}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        currentFolder !== 'root'
                          ? 'bg-amber-500 text-white ring-4 ring-amber-300 animate-pulse'
                          : 'bg-white text-stone-700 border border-stone-200'
                      }`}
                      title="Snap straight back home"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Home</span>
                    </button>
                    {currentFolder === 'snacks' && (
                      <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                        <span>/</span> <span>Snacks</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-extrabold text-amber-800">
                    {currentFolder === 'snacks' ? '👉 Tap "Home" to return' : '📁 Tap Snacks to open'}
                  </span>
                </div>

                {/* Folder Content Display */}
                {currentFolder === 'root' ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        playChime('tap');
                        setCurrentFolder('snacks');
                      }}
                      className="h-28 rounded-3xl border-3 border-amber-400 bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center gap-1 shadow-[0_6px_0_0_#D97706,0_10px_20px_rgba(217,119,6,0.1)] active:translate-y-1 active:shadow-[0_2px_0_0_#D97706] cursor-pointer"
                    >
                      <div className="w-12 h-12 flex items-center justify-center pointer-events-none">
                        <img
                          src={getMulberrySymbolUrl('apple')}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                          loading="lazy"
                        />
                      </div>
                      <span className="font-black text-sm text-amber-950">Snacks Folder</span>
                      <span className="text-[10px] font-bold text-amber-700">Tap to open ➜</span>
                    </button>

                    <div className="h-28 rounded-3xl border-2 border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-1 opacity-60">
                      <div className="w-12 h-12 flex items-center justify-center pointer-events-none">
                        <img
                          src={getMulberrySymbolUrl('toy')}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                          loading="lazy"
                        />
                      </div>
                      <span className="font-bold text-sm text-stone-600">Toys Folder</span>
                      <span className="text-[10px] text-stone-400">Locked in demo</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in zoom-in-95">
                    {[
                      { label: 'Apple', symbolUrl: getMulberrySymbolUrl('apple'), emoji: '🍏', speech: 'Apple' },
                      { label: 'Cracker', symbolUrl: getMulberrySymbolUrl('cracker'), emoji: '🍪', speech: 'Cracker' },
                      { label: 'Pretzels', symbolUrl: getMulberrySymbolUrl('biscuit_chocolate_chip'), emoji: '🥨', speech: 'Pretzels' },
                      { label: 'Juice', symbolUrl: getMulberrySymbolUrl('apple_juice'), emoji: '🧃', speech: 'Juice' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleTileTap(item.label, item.speech)}
                        className="h-20 rounded-2xl border-2 border-orange-400 bg-orange-50 hover:bg-orange-100 text-orange-950 flex flex-col items-center justify-center p-1.5 shadow-[0_4px_0_0_#EA580C] active:translate-y-0.5 cursor-pointer"
                      >
                        <div className="w-8 h-8 flex items-center justify-center pointer-events-none">
                          <img
                            src={item.symbolUrl}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-xs font-black mt-0.5">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: 20-SECOND PHOTO TILE ("MY STUFF") */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-[11px] font-black uppercase tracking-wide border border-rose-300">
                  Step 5: Personalized Tiles
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Make It Personal
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  Snap real photos of their actual shoes, favorite blanket, or pet. Our AI cuts out the background into a clean clay tile.
                </p>
              </div>

              {/* Photo to Clay Tile Transformation Demo */}
              <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                
                {/* 1. Camera Photo Preview */}
                <div className="p-4 rounded-3xl bg-white border-2 border-stone-200 flex flex-col items-center text-center space-y-2">
                  <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider">
                    1. Real Camera Snapshot
                  </span>
                  <div className="w-28 h-28 rounded-2xl bg-amber-50 border-2 border-stone-200 overflow-hidden flex items-center justify-center relative">
                    <span className="text-5xl">👟</span>
                    <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/60 text-white text-[9px] font-bold">
                      Messy Room BG
                    </div>
                  </div>
                  <span className="text-xs font-bold text-stone-600">Actual Red Shoes</span>
                </div>

                {/* 2. Claymorphic Cutout Output */}
                <div className="p-4 rounded-3xl bg-amber-50 border-3 border-amber-400 flex flex-col items-center text-center space-y-2 shadow-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-700 tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>2. AI Clay Cutout</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTileTap('shoes', 'My red shoes')}
                    className="w-28 h-28 rounded-3xl border-3 border-amber-500 bg-white flex flex-col items-center justify-center shadow-[0_8px_0_0_#D97706,0_12px_24px_rgba(217,119,6,0.15)] active:translate-y-1 active:shadow-[0_2px_0_0_#D97706] cursor-pointer transition-all"
                  >
                    <span className="text-4xl drop-shadow-sm">👟</span>
                    <span className="text-xs font-black text-amber-950 mt-1">My Shoes</span>
                  </button>

                  <span className="text-[11px] font-extrabold text-amber-800">
                    Tap to hear voice output!
                  </span>
                </div>
              </div>

              {/* Instant Cutout Feature Callout */}
              <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between gap-3 text-xs font-bold text-stone-700">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Takes less than 20 seconds to photograph and add to any folder.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: CUSTOM VOICES & HOLD-TO-EXPAND GRAMMAR */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wide border border-emerald-300">
                  Step 6: Voice & Grammar
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Their Voice, Their Way
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  Type phonetic pronunciations, record family voices, or hold any action word to reveal grammar tenses!
                </p>
              </div>

              <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Demo A: Hold-to-Expand Grammar Conjugation */}
                <div className="p-4 rounded-3xl bg-white border-2 border-amber-300 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      🔤 Grammar Tenses
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Hold to expand
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center gap-2">
                    <span className="text-2xl">⏳</span>
                    <span className="font-black text-sm text-amber-950">Selected: {grammarTense}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {(['Wait', 'Waited', 'Waiting', 'Waits'] as const).map((tense) => (
                      <button
                        key={tense}
                        type="button"
                        onClick={() => {
                          setGrammarTense(tense);
                          handleTileTap(tense, tense);
                        }}
                        className={`py-2 px-2.5 rounded-xl font-bold text-xs border cursor-pointer transition-all ${
                          grammarTense === tense
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs scale-102'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {tense}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Demo B: Custom Phonetic TTS */}
                <div className="p-4 rounded-3xl bg-white border-2 border-amber-300 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      🗣️ Phonetic TTS
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Accurate Voice
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-600 block">
                      Name or Word:
                    </label>
                    <input 
                      type="text" 
                      value={phoneticTestWord} 
                      onChange={(e) => setPhoneticTestWord(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-stone-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-600 block">
                      Sounds like (Phonetic):
                    </label>
                    <input 
                      type="text" 
                      value={phoneticSpelling} 
                      onChange={(e) => setPhoneticSpelling(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-stone-50"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTileTap('phonetic-test', phoneticSpelling)}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Pronunciation</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Left Action: Lock Stage / Back Button */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  playChime('tap');
                  setStep((prev) => prev - 1);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {/* Explicit "Keep This Stage" Action on Grid Stages 1, 2, 3 */}
            {step === 1 && (
              <button
                type="button"
                onClick={() => handleSaveAndLockStage(1)}
                className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Perfect for Now! (Start with 4 Tiles)</span>
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                onClick={() => handleSaveAndLockStage(2)}
                className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Lock at 12 Tiles</span>
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={() => handleSaveAndLockStage(3)}
                className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Use Full Board</span>
              </button>
            )}
          </div>

          {/* Right Action: Next / Finish Button */}
          <div className="w-full sm:w-auto flex items-center justify-end gap-2">
            {step < 6 ? (
              <button
                type="button"
                onClick={() => {
                  playChime('tap');
                  setStep((prev) => prev + 1);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_0_0_#B45309] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
              >
                <span>
                  {step === 1 && 'Next: See 12 Tiles'}
                  {step === 2 && 'Next: See Full Board'}
                  {step === 3 && 'Next: How Folders Work'}
                  {step === 4 && 'Next: Adding Photo Tiles'}
                  {step === 5 && 'Next: Custom Voices & Grammar'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSaveAndLockStage(3)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_0_0_#047857] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
              >
                <span>🚀 All Set! Enter BeeYou</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
