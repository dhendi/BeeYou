import React from 'react';
import { useApp } from '../../context/AppContext';

interface CaregiverSkillsTabProps {
  onStartTour?: () => void;
}

export const CaregiverSkillsTab: React.FC<CaregiverSkillsTabProps> = ({ onStartTour }) => {
  const { skills } = useApp();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">Independence Missions & Skills</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Break down everyday routines like tooth brushing and dressing into rewarding micro-missions.
          </p>
        </div>
        {onStartTour && (
          <button
            type="button"
            onClick={onStartTour}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <span>💡 How This Works</span>
          </button>
        )}
      </div>

      <div data-tour="skills-missions-card" className="space-y-3">
        {skills.map((sk, i) => (
          <div key={sk.id} className="p-4 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{sk.emoji}</span>
              <div>
                <h4 className="font-black text-slate-800">{sk.title}</h4>
                <span data-tour={i === 0 ? "skills-reward-badge" : undefined} className="text-xs text-purple-700 font-bold">
                  {sk.steps.length} steps • +{sk.starsReward} Stars
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">Completed {sk.completedTimes} times</span>
          </div>
        ))}
      </div>
    </div>
  );
};
