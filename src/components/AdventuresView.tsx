import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LifeAdventure, SocialStory } from '../types';
import { 
  Compass, 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  Volume2, 
  Sparkles, 
  Ear, 
  Eye, 
  Users, 
  Hand, 
  Clock, 
  Wind,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { playChime } from '../utils/audio';

export const AdventuresView: React.FC = () => {
  const {
    adventures,
    socialStories,
    activeAdventureId,
    setActiveAdventureId,
    activeStoryId,
    setActiveStoryId,
    speak,
    announce,
    completeAdventure,
    setChildView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'adventures' | 'stories'>('adventures');
  const [adventureSubTab, setAdventureSubTab] = useState<'steps' | 'sensory' | 'say' | 'practice'>('steps');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Social story page state
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Practice mode message
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);

  const selectedAdventure = adventures.find((a) => a.id === activeAdventureId);
  const selectedStory = socialStories.find((s) => s.id === activeStoryId);

  // If a story is open
  if (selectedStory) {
    const page = selectedStory.pages[currentPageIndex] || selectedStory.pages[0];
    const isLastPage = currentPageIndex === selectedStory.pages.length - 1;

    return (
      <div className="flex flex-col flex-1 pb-24 max-w-3xl mx-auto w-full px-3 sm:px-4 py-2">
        <button
          onClick={() => {
            setActiveStoryId(null);
            setCurrentPageIndex(0);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs w-fit mb-3 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stories</span>
        </button>

        <div className="bg-white rounded-3xl border-3 border-indigo-200 shadow-md p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{selectedStory.emoji}</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">{selectedStory.title}</h2>
          </div>

          <div className="text-xs font-bold text-indigo-700 mb-6 bg-indigo-50 px-3 py-1 rounded-full">
            Page {currentPageIndex + 1} of {selectedStory.pages.length}
          </div>

          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-7xl sm:text-8xl mb-6 shadow-inner">
            {page.emoji}
          </div>

          <p className="text-base sm:text-xl font-bold text-slate-800 max-w-lg leading-relaxed mb-6">
            {page.text}
          </p>

          <button
            onClick={() => speak(page.text)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold text-xs sm:text-sm active:scale-95 transition-all mb-8 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Read Page Aloud</span>
          </button>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between w-full max-w-sm gap-4">
            <button
              onClick={() => {
                if (currentPageIndex > 0) {
                  setCurrentPageIndex((p) => p - 1);
                  playChime('tap');
                }
              }}
              disabled={currentPageIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                currentPageIndex === 0
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800 active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => {
                if (!isLastPage) {
                  setCurrentPageIndex((p) => p + 1);
                  playChime('tap');
                } else {
                  playChime('star');
                  announce('Story complete! Great reading!');
                  setActiveStoryId(null);
                  setCurrentPageIndex(0);
                }
              }}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>{isLastPage ? 'All Done! ⭐' : 'Next Page'}</span>
              {!isLastPage && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If an adventure is open
  if (selectedAdventure) {
    const step = selectedAdventure.steps[currentStepIndex] || selectedAdventure.steps[0];
    const isLastStep = currentStepIndex === selectedAdventure.steps.length - 1;

    return (
      <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
        {/* Back Button & Title */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setActiveAdventureId(null);
              setCurrentStepIndex(0);
              setPracticeFeedback(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Adventures</span>
          </button>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            {selectedAdventure.category}
          </span>
        </div>

        {/* Adventure Header Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-5xl shrink-0">
            {selectedAdventure.emoji}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              {selectedAdventure.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-snug">
              {selectedAdventure.summary}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <button
                onClick={() => speak(selectedAdventure.summary)}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Overview</span>
              </button>
              <button
                onClick={() => setChildView('aac')}
                className="px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Context AAC</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navigation: Steps, Sensory Preview, What I Can Say, Practice */}
        <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-xs gap-1 overflow-x-auto">
          <button
            onClick={() => setAdventureSubTab('steps')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              adventureSubTab === 'steps'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🚶 Walkthrough ({selectedAdventure.steps.length})</span>
          </button>
          <button
            onClick={() => setAdventureSubTab('sensory')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              adventureSubTab === 'sensory'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🎧 Sensory Preview</span>
          </button>
          <button
            onClick={() => setAdventureSubTab('say')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              adventureSubTab === 'say'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🗣️ Things I Can Say</span>
          </button>
          <button
            onClick={() => setAdventureSubTab('practice')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              adventureSubTab === 'practice'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>⭐ Practice Mode</span>
          </button>
        </div>

        {/* SUB-TAB 1: INTERACTIVE STEP WALKTHROUGH */}
        {adventureSubTab === 'steps' && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-7 shadow-sm flex flex-col items-center text-center">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full mb-4">
              Step {currentStepIndex + 1} of {selectedAdventure.steps.length}
            </div>

            <div className="w-28 h-28 rounded-3xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-6xl mb-4 shadow-inner">
              {step.emoji}
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-2">
              {step.title}
            </h3>

            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md leading-relaxed mb-4">
              {step.description}
            </p>

            {step.sensoryTip && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold text-amber-900 max-w-sm mb-6 flex items-center gap-2 text-left">
                <Ear className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{step.sensoryTip}</span>
              </div>
            )}

            <button
              onClick={() => speak(`${step.title}. ${step.description}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-95 transition-all mb-6 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Hear Step</span>
            </button>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between w-full max-w-md gap-3">
              <button
                onClick={() => {
                  if (currentStepIndex > 0) {
                    setCurrentStepIndex((p) => p - 1);
                    playChime('tap');
                  }
                }}
                disabled={currentStepIndex === 0}
                className={`flex-1 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  currentStepIndex === 0
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800 active:scale-95'
                }`}
              >
                Previous Step
              </button>

              <button
                onClick={() => {
                  if (!isLastStep) {
                    setCurrentStepIndex((p) => p + 1);
                    playChime('tap');
                  } else {
                    completeAdventure(selectedAdventure.id);
                  }
                }}
                className="flex-1 py-2.5 rounded-2xl font-black text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {isLastStep ? 'Complete Adventure! ⭐' : 'Next Step →'}
              </button>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: INDIVIDUALIZED SENSORY PREVIEW */}
        {adventureSubTab === 'sensory' && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Sensory Guide for {selectedAdventure.title}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Know what sensations to expect so there are no surprises.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedAdventure.sensoryPreview.sound && (
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <Ear className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-sky-950 block">Sound</span>
                    <p className="text-xs text-sky-900 mt-0.5 font-medium leading-relaxed">
                      {selectedAdventure.sensoryPreview.sound}
                    </p>
                  </div>
                </div>
              )}

              {selectedAdventure.sensoryPreview.light && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <Eye className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-amber-950 block">Lighting</span>
                    <p className="text-xs text-amber-900 mt-0.5 font-medium leading-relaxed">
                      {selectedAdventure.sensoryPreview.light}
                    </p>
                  </div>
                </div>
              )}

              {selectedAdventure.sensoryPreview.touch && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <Hand className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-rose-950 block">Touch & Clothing</span>
                    <p className="text-xs text-rose-900 mt-0.5 font-medium leading-relaxed">
                      {selectedAdventure.sensoryPreview.touch}
                    </p>
                  </div>
                </div>
              )}

              {selectedAdventure.sensoryPreview.waiting && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-purple-950 block">Waiting Time</span>
                    <p className="text-xs text-purple-900 mt-0.5 font-medium leading-relaxed">
                      {selectedAdventure.sensoryPreview.waiting}
                    </p>
                  </div>
                </div>
              )}

              {selectedAdventure.sensoryPreview.people && (
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <Users className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-teal-950 block">People & Faces</span>
                    <p className="text-xs text-teal-900 mt-0.5 font-medium leading-relaxed">
                      {selectedAdventure.sensoryPreview.people}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mt-2">
              <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block mb-1">
                What Happens Afterward:
              </span>
              <p className="text-xs sm:text-sm text-emerald-950 font-bold leading-relaxed">
                {selectedAdventure.whatHappensAfter}
              </p>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: THINGS I CAN SAY & ASK FOR */}
        {adventureSubTab === 'say' && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                Things I Can Say (Tap to Speak):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedAdventure.thingsICanSay.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => speak(phrase)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-950 font-black text-xs sm:text-sm transition-all active:scale-95 shadow-xs cursor-pointer text-left"
                  >
                    <span>💬 {phrase}</span>
                    <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                Things I Can Ask For:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedAdventure.thingsICanAskFor.map((ask, idx) => (
                  <button
                    key={idx}
                    onClick={() => speak(ask)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-950 font-black text-xs sm:text-sm transition-all active:scale-95 shadow-xs cursor-pointer text-left"
                  >
                    <span>🙋 {ask}</span>
                    <Volume2 className="w-4 h-4 text-sky-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 4: PRACTICE SIMULATION MODE */}
        {adventureSubTab === 'practice' && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-7 shadow-sm flex flex-col items-center text-center">
            <span className="text-4xl mb-2">🎭</span>
            <h3 className="text-lg font-black text-slate-800">Practice Conversation</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mt-1 mb-6">
              Practice asking for a break or saying stop. See how friendly people respond when you speak your mind!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg mb-6">
              {[
                {
                  text: 'I need a break.',
                  emoji: '🛋️',
                  response: 'Of course! We will stop right now and take a 2-minute pause. You are doing fantastic.',
                },
                {
                  text: 'That hurts.',
                  emoji: '🩹',
                  response: 'Thank you for telling me! I will stop right away and be super gentle.',
                },
                {
                  text: 'Please stop.',
                  emoji: '🛑',
                  response: 'I hear you. Hands off completely. We can wait until you are ready.',
                },
                {
                  text: 'Can I have my sunglasses?',
                  emoji: '🕶️',
                  response: 'Sure thing! Putting sunglasses on right now to protect your eyes from the bright light.',
                },
              ].map((practice, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    speak(practice.text);
                    setPracticeFeedback(practice.response);
                    playChime('tap');
                    setTimeout(() => {
                      speak(practice.response);
                    }, 1200);
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-950 font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer text-left"
                >
                  <span className="text-2xl">{practice.emoji}</span>
                  <span>Say: "{practice.text}"</span>
                </button>
              ))}
            </div>

            {practiceFeedback && (
              <div className="w-full max-w-lg bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 animate-in fade-in zoom-in-95">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block mb-1">
                  How caregiver/doctor responds:
                </span>
                <p className="text-sm font-bold text-emerald-950 leading-relaxed">
                  "{practiceFeedback}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // MAIN ADVENTURES / STORIES LIST
  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
      {/* Tab Switcher: Real-World Adventures vs Social Stories */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-xs gap-1">
        <button
          onClick={() => setActiveTab('adventures')}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'adventures'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Life Adventures ({adventures.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'stories'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Social Stories ({socialStories.length})</span>
        </button>
      </div>

      {activeTab === 'adventures' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {adventures.map((adventure) => (
            <div
              key={adventure.id}
              onClick={() => {
                setActiveAdventureId(adventure.id);
                setAdventureSubTab('steps');
                setCurrentStepIndex(0);
                playChime('tap');
              }}
              className="bg-white hover:bg-emerald-50/40 border-2 border-slate-200 hover:border-emerald-300 rounded-3xl p-4 sm:p-5 shadow-xs transition-all active:scale-98 cursor-pointer flex items-start gap-3.5"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-4xl shrink-0 shadow-xs">
                {adventure.emoji}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {adventure.category}
                </span>
                <h3 className="font-black text-slate-800 text-base sm:text-lg mt-1 leading-snug">
                  {adventure.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">
                  {adventure.summary}
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs font-bold text-slate-400">
                  <span>{adventure.steps.length} steps</span>
                  <span>•</span>
                  <span className="text-emerald-700">Sensory guide</span>
                  {adventure.completedCount ? (
                    <>
                      <span>•</span>
                      <span className="text-amber-600 font-black">
                        ⭐ Done {adventure.completedCount}x
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {socialStories.map((story) => (
            <div
              key={story.id}
              onClick={() => {
                setActiveStoryId(story.id);
                setCurrentPageIndex(0);
                playChime('tap');
              }}
              className="bg-white hover:bg-indigo-50/40 border-2 border-slate-200 hover:border-indigo-300 rounded-3xl p-4 sm:p-5 shadow-xs transition-all active:scale-98 cursor-pointer flex items-start gap-3.5"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-4xl shrink-0 shadow-xs">
                {story.emoji}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Social Story
                </span>
                <h3 className="font-black text-slate-800 text-base sm:text-lg mt-1 leading-snug">
                  {story.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {story.pages.length} illustrated pages • Calm & predictable expectations
                </p>
                <div className="mt-3 text-xs font-bold text-indigo-700 flex items-center gap-1">
                  <span>Read story</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
