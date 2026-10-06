import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { playChime } from '../utils/audio';
import { SECTION_TOURS, TourSectionId } from '../data/caregiverTourData';

interface CaregiverTourDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTour: (sectionId: TourSectionId) => void;
  activeTab?: string;
}

export const CaregiverTourDirectoryModal: React.FC<CaregiverTourDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectTour,
  activeTab,
}) => {
  if (!isOpen) return null;

  const tourList = Object.values(SECTION_TOURS).filter((t) => t.id !== 'fullApp');

  return (
    <div className="fixed inset-0 z-[9990] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700/80 rounded-3xl w-full max-w-3xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl shadow-xs font-black shrink-0">
              🐝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Interactive Feature Guides
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 uppercase tracking-wide">
                  Spotlight Tours
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                Choose any section below to see an interactive step-by-step guide right on your screen.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playChime('tap');
              onClose();
            }}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-500 transition cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Hero: Full App Tour Trigger */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black text-[10px] uppercase tracking-wider">
                Recommended for First Time Caregivers
              </span>
              <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>🌟 Complete Caregiver Hub Tour</span>
              </h3>
              <p className="text-xs text-amber-100 max-w-xl font-medium">
                Walk through all 10 key features in under 2 minutes to learn how everything connects.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playChime('star');
                onSelectTour('fullApp');
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-slate-900 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
            >
              <span>Start Full Tour</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Section-Specific Tours Grid */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Or pick a specific section guide:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tourList.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => {
                    playChime('tap');
                    onSelectTour(sec.id);
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 bg-white dark:bg-slate-800/60 hover:bg-amber-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-start justify-between gap-3 group shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 flex items-center justify-center text-xl shrink-0">
                      {sec.emoji}
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                        {sec.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {sec.description}
                      </p>
                      <span className="inline-block text-[10px] font-bold text-amber-600 dark:text-amber-400 pt-1">
                        {sec.steps.length} interactive steps 👉
                      </span>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition shrink-0 mt-1">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
