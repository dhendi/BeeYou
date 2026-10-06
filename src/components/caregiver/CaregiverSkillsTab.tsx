import React from 'react';
import { useApp } from '../../context/AppContext';

export const CaregiverSkillsTab: React.FC = () => {
  const { skills } = useApp();

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-black text-slate-900">Independence Missions & Skills</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Break down everyday routines like tooth brushing and dressing into rewarding micro-missions.
        </p>
      </div>

      <div className="space-y-3">
        {skills.map((sk) => (
          <div key={sk.id} className="p-4 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{sk.emoji}</span>
              <div>
                <h4 className="font-black text-slate-800">{sk.title}</h4>
                <span className="text-xs text-purple-700 font-bold">{sk.steps.length} steps • +{sk.starsReward} Stars</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">Completed {sk.completedTimes} times</span>
          </div>
        ))}
      </div>
    </div>
  );
};
