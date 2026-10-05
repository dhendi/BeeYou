import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  MessageSquare, 
  Volume2, 
  Heart, 
  Keyboard, 
  Camera, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  RotateCcw,
  ArrowRight,
  BookOpen,
  Info
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { BeeMascot } from './BeeYouLogo';
import { useApp } from '../context/AppContext';

export interface AACGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AACGuideModal: React.FC<AACGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { speak } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'sentence_bar' | 'custom_photos' | 'interactive_demo'>('overview');

  // Interactive Demo Sandbox State
  const [demoSentence, setDemoSentence] = useState<Array<{ label: string; emoji: string }>>([
    { label: 'I want', emoji: '🙋' },
    { label: 'Play lego', emoji: '🧱' },
  ]);

  if (!isOpen) return null;

  const demoTiles = [
    { label: 'I want', emoji: '🙋' },
    { label: 'Play lego', emoji: '🧱' },
    { label: 'Take a bath', emoji: '🛁' },
    { label: 'Snack', emoji: '🥪' },
    { label: 'Water', emoji: '💧' },
    { label: 'Help please', emoji: '🆘' },
  ];

  const handleAddDemoTile = (tile: { label: string; emoji: string }) => {
    playChime('tap');
    setDemoSentence((prev) => [...prev, tile]);
  };

  const handleClearDemo = () => {
    playChime('clear');
    setDemoSentence([]);
  };

  const handleSpeakDemo = () => {
    if (demoSentence.length === 0) return;
    const text = demoSentence.map((t) => t.label).join(' ');
    speak(text);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aac-guide-title"
      className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 md:p-6 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 text-slate-800 dark:text-slate-100"
    >
      <div className="bg-[#FAF8F5] dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] h-full sm:h-auto flex flex-col shadow-2xl border-2 border-amber-200/90 dark:border-slate-800 overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <BeeMascot size="sm" pose="talking" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  AAC Talker Guide
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Speech & Communication
                </span>
              </div>
              <h2 id="aac-guide-title" className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                How to Use the AAC Speech Board
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'overview', label: '⭐ AAC Basics', emoji: '🗣️' },
            { id: 'favorites', label: '💬 Favorite Sentences', emoji: '❤️' },
            { id: 'sentence_bar', label: '📝 Sentence Strip', emoji: '🔊' },
            { id: 'custom_photos', label: '📷 Custom Words & Photos', emoji: '✨' },
            { id: 'interactive_demo', label: '🎮 Try Live Demo', emoji: '▶️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                playChime('tap');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-white dark:bg-slate-850">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                <span className="text-3xl shrink-0">🗣️</span>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-amber-950 dark:text-amber-200">
                    What is BeeYou AAC?
                  </h3>
                  <p className="text-xs text-amber-900/90 dark:text-amber-300/90 font-medium mt-0.5 leading-relaxed">
                    BeeYou AAC is an Augmentative & Alternative Communication talker. It lets users tap picture tiles to speak instantly with natural on-device audio that works 100% offline.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎯</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Motor-Stable Grid</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Tiles stay in consistent positions so communicators build reliable physical muscle memory.
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📴</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">100% Offline & Private</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Speech runs directly on your device. Works on airplanes, car rides, or with zero Wi-Fi.
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎨</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Fitzgerald Color Coding</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Yellow (Pronouns), Green (Verbs), Orange (Nouns), Blue (Adjectives), Purple (Social), Red (Emergency).
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">⌨️</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Keyboard & Quick Phrases</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Switch between symbol grids, instant emergency phrases, and a large-button typing keyboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FAVORITE SENTENCES */}
          {activeTab === 'favorites' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>💬 Favorite Sentences & Frequent Phrases</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                    New
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save favorite sentences or let BeeYou automatically surface the child's most frequently spoken requests.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <span className="text-2xl shrink-0">⭐</span>
                  <div>
                    <h4 className="font-bold text-xs text-amber-950 dark:text-amber-200">1. Parent-Pinned Favorites</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Caregivers can add pre-set sentences like <em>"I want to play lego" 🧱</em> or <em>"I want to take a bath" 🛁</em> with custom emojis and natural speech text.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-start gap-3">
                  <span className="text-2xl shrink-0">🔥</span>
                  <div>
                    <h4 className="font-bold text-xs text-sky-950 dark:text-sky-200">2. Automatic Frequency Tracking</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Whenever the user speaks a sentence, BeeYou automatically updates the usage count. Frequently used sentences rise to the top for quick 1-tap access!
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                  <span className="text-2xl shrink-0">💾</span>
                  <div>
                    <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-200">3. 1-Click Save from Sentence Strip</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      After building a sentence on the AAC screen, tap <strong>"+ Save to Favorites"</strong> below the strip to remember it forever.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SENTENCE STRIP */}
          {activeTab === 'sentence_bar' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Using the Sentence Strip
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Combine multiple words and speak full sentences.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Tap Tiles to Queue Words</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Tap tiles in sequence (e.g. <em>I want 🙋</em> $\rightarrow$ <em>Apple 🍎</em>). They will appear in the top sentence strip.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Tap "Speak 🔊" to Read Aloud</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Tap the green Speak button or the sentence bar to play the full sentence in clear speech.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Clear & Backspace</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Use the <strong>⌫ Backspace</strong> button to remove the last word or <strong>🗑️ Clear</strong> to reset the bar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM WORDS & PHOTOS */}
          {activeTab === 'custom_photos' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Adding Custom Words & Personal Photos
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Personalize the vocabulary with familiar faces, favorite snacks, and school items.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
                  <Camera className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-indigo-950 dark:text-indigo-200">Upload Real Photos</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      In Caregiver Hub $\rightarrow$ <strong>AAC & Vocabulary</strong>, upload photos of family members, pets, comfort toys, and specific classroom locations.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <Volume2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-amber-950 dark:text-amber-200">Custom Speech Pronunciation</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Customize how names or special words are pronounced by typing phonetic speech text in the word editor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INTERACTIVE DEMO */}
          {activeTab === 'interactive_demo' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Try the Interactive Demo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tap tiles below to build a sentence and test speech!
                  </p>
                </div>
                <button
                  onClick={handleClearDemo}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Demo Sentence Bar */}
              <div className="p-3 rounded-2xl bg-slate-900 border-2 border-amber-400 text-white flex items-center justify-between gap-2 min-h-[56px]">
                <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
                  {demoSentence.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">Tap symbol tiles below to add words...</span>
                  ) : (
                    demoSentence.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-white text-slate-900 font-black text-xs flex items-center gap-1 shadow-xs">
                        <span>{t.emoji}</span>
                        <span>{t.label}</span>
                      </span>
                    ))
                  )}
                </div>

                <button
                  onClick={handleSpeakDemo}
                  disabled={demoSentence.length === 0}
                  className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all shrink-0 ${
                    demoSentence.length > 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 opacity-50'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Speak 🔊</span>
                </button>
              </div>

              {/* Demo Tiles Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sample Symbol Tiles (Tap to Add):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {demoTiles.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddDemoTile(t)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 hover:border-amber-300 border-2 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-all shadow-2xs"
                    >
                      <span className="text-2xl mb-1">{t.emoji}</span>
                      <span className="font-bold text-[11px] text-slate-900 dark:text-white leading-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            BeeYou AAC • Clear offline speech communication
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-xs cursor-pointer active:scale-95 ml-auto"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
