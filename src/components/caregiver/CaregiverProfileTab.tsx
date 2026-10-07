import React from 'react';
import { t } from '../../services/translator';
import { useApp } from '../../context/AppContext';
import { playChime } from '../../utils/audio';

interface CaregiverProfileTabProps {
  onShowNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverProfileTab: React.FC<CaregiverProfileTabProps> = ({ 
  onShowNotification,
  onStartTour,
}) => {
  const {
    childProfile,
    updateChildProfile,
    setShowAboutMeModal,
  } = useApp();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">{t("Profile & Emergency Identification")}</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t("Personalize the experience, sensory preferences, and emergency contacts.")}
          </p>
        </div>
        {onStartTour && (
          <button
            type="button"
            onClick={onStartTour}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <span>{t("💡 How This Works")}</span>
          </button>
        )}
      </div>

      {/* ABOUT ME & EMERGENCY ID BADGE CARD */}
      <div data-tour="profile-digital-id-card" className="bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-600 rounded-3xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner border border-white/30">
            🪪
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/30 text-white inline-block mb-1">
              {t("Digital ID & Advocacy Badge")}
            </span>
            <h3 className="text-lg font-black leading-tight">
              {t("About Me & Emergency ID Card")}
            </h3>
            <p className="text-xs text-white/90 font-medium">
              {t("Conditions, sensory sensitivities, communication tips, and emergency contacts.")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAboutMeModal(true);
            playChime('tap');
          }}
          className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-black text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-95 shrink-0 flex items-center gap-2"
        >
          <span>{t("🪪 Open Digital ID Card")}</span>
        </button>
      </div>

      <div data-tour="profile-fields-card" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-black text-slate-700 block mb-1">{t("Child's Name:")}</label>
          <input
            type="text"
            value={childProfile.name}
            onChange={(e) => updateChildProfile({ name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-black text-slate-700 block mb-1">{t("Pronouns:")}</label>
          <input
            type="text"
            value={childProfile.pronouns || ''}
            onChange={(e) => updateChildProfile({ pronouns: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-black text-slate-700 block mb-1">{t("Favorite Interests (comma separated):")}</label>
        <input
          type="text"
          value={childProfile.interests.join(', ')}
          onChange={(e) =>
            updateChildProfile({
              interests: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-black text-slate-700 block mb-1">{t("Comfort Items:")}</label>
        <input
          type="text"
          value={childProfile.comfortItems.join(', ')}
          onChange={(e) =>
            updateChildProfile({
              comfortItems: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-black text-slate-700 block mb-1">{t("Sensory Notes (Sound & Noise):")}</label>
        <input
          type="text"
          value={childProfile.sensoryNotes.sound}
          onChange={(e) =>
            updateChildProfile({
              sensoryNotes: { ...childProfile.sensoryNotes, sound: e.target.value },
            })
          }
          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm"
        />
      </div>

      <button
        onClick={() => onShowNotification('Child profile updated!')}
        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs cursor-pointer shadow-xs"
      >
        {t("Save Profile")}
      </button>
    </div>
  );
};
