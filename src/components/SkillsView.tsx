import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Timer, 
  Volume2, 
  ArrowLeft, 
  RotateCcw,
  Play,
  Pause,
  Layers,
  Leaf
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { DailyHabitsModule } from './DailyHabitsModule';

export const SkillsView: React.FC = () => {
  const {
    skills,
    activeSkillId,
    setActiveSkillId,
    toggleSkillStep,
    completeSkill,
    resetSkill,
    speak,
    habits,
  } = useApp();

  const [skillsTab, setSkillsTab] = useState<'missions' | 'habits'>('missions');
  const selectedSkill = skills.find((s) => s.id === activeSkillId);

  // Active step countdown timer
  const [activeTimerStepId, setActiveTimerStepId] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playChime('complete');
      if (selectedSkill && activeTimerStepId !== null) {
        toggleSkillStep(selectedSkill.id, activeTimerStepId);
        speak('Timer complete! Good job!');
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft, activeTimerStepId, selectedSkill]);

  const startStepTimer = (stepId: number, durationSec: number) => {
    setActiveTimerStepId(stepId);
    setSecondsLeft(durationSec);
    setIsTimerRunning(true);
    playChime('tap');
  };

  // IF A SKILL IS OPEN
  if (selectedSkill) {
    const completedCount = selectedSkill.steps.filter((s) => s.completed).length;
    const totalCount = selectedSkill.steps.length;
    const isAllDone = totalCount > 0 && completedCount === totalCount;

    return (
      <div className="flex flex-col flex-1 pb-24 max-w-3xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
        {/* Back and Status */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setActiveSkillId(null);
              setIsTimerRunning(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Skills</span>
          </button>

          <button
            onClick={() => resetSkill(selectedSkill.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Over</span>
          </button>
        </div>

        {/* Skill Hero Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-20 h-20 rounded-3xl bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-5xl shrink-0">
            {selectedSkill.emoji}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                Mission
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                +{selectedSkill.starsReward} Stars
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
              {selectedSkill.title}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {completedCount} of {totalCount} steps finished
            </p>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 mt-3">
              <div
                className="bg-purple-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* All Steps Completed Celebration Box */}
        {isAllDone && (
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-3 border-amber-300 rounded-3xl p-5 text-center shadow-md animate-in fade-in zoom-in-95">
            <span className="text-5xl">🏆</span>
            <h3 className="text-xl font-black text-amber-950 mt-2">Mission Accomplished!</h3>
            <p className="text-xs sm:text-sm font-bold text-amber-800 mt-1">
              You completed "{selectedSkill.title}" independently! You earned +{selectedSkill.starsReward} Stars.
            </p>
          </div>
        )}

        {/* Step-by-Step Mission Checklist */}
        <div className="space-y-3">
          {selectedSkill.steps.map((step, idx) => {
            const hasTimer = !!step.durationSec;
            const isStepTimerActive = isTimerRunning && activeTimerStepId === step.id;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-3xl border-2 transition-all shadow-xs ${
                  step.completed
                    ? 'bg-purple-50/70 border-purple-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div
                    onClick={() => toggleSkillStep(selectedSkill.id, step.id)}
                    className="flex items-start sm:items-center gap-3 flex-1 cursor-pointer select-none"
                  >
                    <button className="text-purple-600 transition-transform hover:scale-110 mt-0.5 sm:mt-0">
                      {step.completed ? (
                        <CheckCircle2 className="w-7 h-7 fill-purple-500 text-white" />
                      ) : (
                        <Circle className="w-7 h-7 text-slate-300" />
                      )}
                    </button>

                    <span className="text-3xl shrink-0">{step.emoji}</span>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4
                          className={`font-black text-sm sm:text-base ${
                            step.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                        {step.instruction}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Speak Button */}
                    <button
                      onClick={() => speak(`${step.title}. ${step.instruction}`)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                      title="Hear instruction"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Step Timer Button if available */}
                    {hasTimer && (
                      <button
                        onClick={() => {
                          if (isStepTimerActive) {
                            setIsTimerRunning(false);
                          } else {
                            startStepTimer(step.id, step.durationSec || 20);
                          }
                        }}
                        className={`flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                          isStepTimerActive
                            ? 'bg-amber-400 text-amber-950 animate-pulse'
                            : 'bg-purple-100 hover:bg-purple-200 text-purple-900'
                        }`}
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>
                          {isStepTimerActive
                            ? `${secondsLeft}s`
                            : `${step.durationSec}s`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // MAIN SKILLS LIST
  const habitsDoneCount = habits.filter((h) => h.completedToday).length;

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-5 sm:p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-purple-200">
            Independence & Habits
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">My Daily Skills</h2>
          <p className="text-xs sm:text-sm text-purple-100 font-medium mt-1 max-w-md">
            Master everyday activities step-by-step and practice recurring daily habits at your own pace!
          </p>
        </div>
        <span className="text-5xl hidden sm:inline">⭐</span>
      </div>

      {/* Mode Switcher: Step-by-Step Missions vs Daily Habits */}
      <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border-2 border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => {
            setSkillsTab('missions');
            playChime('tap');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            skillsTab === 'missions'
              ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Step-by-Step Missions ({skills.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSkillsTab('habits');
            playChime('tap');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            skillsTab === 'habits'
              ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>Daily Habits ({habitsDoneCount}/{habits.length})</span>
        </button>
      </div>

      {/* Render Selected Tab */}
      {skillsTab === 'habits' ? (
        <DailyHabitsModule />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {skills.map((skill) => {
            const completedCount = skill.steps.filter((s) => s.completed).length;
            const totalCount = skill.steps.length;
            const isDone = totalCount > 0 && completedCount === totalCount;

            return (
              <div
                key={skill.id}
                onClick={() => {
                  setActiveSkillId(skill.id);
                  playChime('tap');
                }}
                className="bg-white hover:bg-purple-50/40 border-2 border-slate-200 hover:border-purple-300 rounded-3xl p-4 sm:p-5 shadow-xs transition-all active:scale-98 cursor-pointer flex items-start gap-3.5"
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-4xl shrink-0 shadow-xs">
                  {skill.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      {skill.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                      <Sparkles className="w-3 h-3 fill-amber-400 text-amber-500" />
                      +{skill.starsReward} Stars
                    </span>
                  </div>
                  <h3 className="font-black text-slate-800 text-base sm:text-lg mt-1 leading-snug">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {totalCount} steps • ~{skill.estimatedMin} mins
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs font-bold">
                    <span className={isDone ? 'text-emerald-600 font-black' : 'text-slate-400'}>
                      {isDone ? 'Completed! 🏆' : `${completedCount}/${totalCount} steps done`}
                    </span>
                    {skill.completedTimes > 0 && (
                      <span className="text-purple-600">Finished {skill.completedTimes}x</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
