import React from 'react';
import { t } from '../../services/translator';
import { useApp } from '../../context/AppContext';
import { Lightbulb, MessageSquare } from 'lucide-react';
import { RoutineStickerIcon } from '../icons/JournalStickers';

const getAdventureSticker = (id: string): string | undefined => {
  if (id === 'adv-dentist') return '/assets/stickers/adventure_dentist.png';
  if (id === 'adv-restaurant') return '/assets/stickers/adventure_restaurant.png';
  if (id === 'adv-haircut') return '/assets/stickers/adventure_haircut.png';
  if (id === 'adv-doctor') return '/assets/stickers/adventure_doctor.png';
  return undefined;
};

interface CaregiverAdventuresTabProps {
  onStartTour?: () => void;
}

export const CaregiverAdventuresTab: React.FC<CaregiverAdventuresTabProps> = ({ onStartTour }) => {
  const { adventures } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">{t("Life Adventures & Contextual AAC")}</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t("Prepare for real-world situations with sensory guides and automatic contextual phrase suggestions.")}
          </p>
        </div>
        {onStartTour && (
          <button
            type="button"
            onClick={onStartTour}
            className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-teal-700" />
            <span>{t("How This Works")}</span>
          </button>
        )}
      </div>

      <div data-tour="adventures-list-card" className="space-y-3">
        {adventures.map((adv, i) => {
          const stickerPath = adv.stickerSrc || getAdventureSticker(adv.id);
          return (
            <div key={adv.id} className="p-4 bg-white border-2 border-slate-200 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50/60 dark:bg-slate-800 border border-teal-100 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    {stickerPath ? (
                      <img
                        src={stickerPath}
                        alt={adv.title}
                        className="w-full h-full object-contain drop-shadow-2xs select-none pointer-events-none"
                      />
                    ) : (
                      <RoutineStickerIcon
                        emoji={adv.emoji}
                        title={adv.title}
                        className="w-10 h-10 object-contain drop-shadow-2xs"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-base">{adv.title}</h4>
                    <span className="text-xs text-emerald-700 font-bold">{adv.category}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">{adv.steps.length} steps</span>
              </div>

            <div data-tour={i === 0 ? "adventures-phrases-card" : undefined} className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                {t("Contextual AAC Phrases surfaced during this adventure:")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {adv.thingsICanSay.map((phrase, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 font-bold text-xs flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-teal-700 shrink-0" />
                    <span>{phrase}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
