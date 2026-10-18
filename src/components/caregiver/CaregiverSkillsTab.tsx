import React from 'react';
import { t } from '../../services/translator';
import { useApp } from '../../context/AppContext';
import { Lightbulb } from 'lucide-react';
import { RoutineStickerIcon } from '../icons/JournalStickers';

interface CaregiverSkillsTabProps {
  onStartTour?: () => void;
}

const getSkillSticker = (id: string, emoji?: string): string | undefined => {
  if (id === 'skill-teeth' || emoji === '🪥') return '/assets/stickers/toothbrush.webp';
  if (id === 'skill-hands' || emoji === '🧼') return '/assets/stickers/soap_wash_hands.webp';
  if (id === 'skill-dressed' || emoji === '👕') return '/assets/stickers/clothes_dressed.webp';
  if (id === 'skill-backpack' || emoji === '🎒') return '/assets/stickers/backpack_school.webp';
  if (id === 'skill-snack' || emoji === '🍏' || emoji === '🍎') return '/assets/stickers/apple_snack.webp';
  return undefined;
};

export const CaregiverSkillsTab: React.FC<CaregiverSkillsTabProps> = ({ onStartTour }) => {
  const { skills } = useApp();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">{t("Independence Missions & Skills")}</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t("Break down everyday routines like tooth brushing and dressing into rewarding micro-missions.")}
          </p>
        </div>
        {onStartTour && (
          <button
            type="button"
            onClick={onStartTour}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
            <span>{t("How This Works")}</span>
          </button>
        )}
      </div>

      <div data-tour="skills-missions-card" className="space-y-3">
        {skills.map((sk, i) => (
          <div key={sk.id} className="p-4 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                <RoutineStickerIcon
                  emoji={sk.stickerSrc || getSkillSticker(sk.id, sk.emoji) || sk.emoji}
                  title={sk.title}
                  className="w-10 h-10 object-contain drop-shadow-2xs"
                />
              </div>
              <div>
                <h4 className="font-black text-slate-800">{sk.title}</h4>
                <span data-tour={i === 0 ? "skills-reward-badge" : undefined} className="text-xs text-purple-700 font-bold">
                  {sk.steps.length} steps
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
