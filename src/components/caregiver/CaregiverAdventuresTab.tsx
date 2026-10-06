import React from 'react';
import { useApp } from '../../context/AppContext';

export const CaregiverAdventuresTab: React.FC = () => {
  const { adventures } = useApp();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-black text-slate-900">Life Adventures & Contextual AAC</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Prepare for real-world situations with sensory guides and automatic contextual phrase suggestions.
        </p>
      </div>

      <div className="space-y-3">
        {adventures.map((adv) => (
          <div key={adv.id} className="p-4 bg-white border-2 border-slate-200 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{adv.emoji}</span>
                <div>
                  <h4 className="font-black text-slate-800 text-base">{adv.title}</h4>
                  <span className="text-xs text-emerald-700 font-bold">{adv.category}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">{adv.steps.length} steps</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                Contextual AAC Phrases surfaced during this adventure:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {adv.thingsICanSay.map((phrase, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-900 font-bold text-xs">
                    💬 {phrase}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
