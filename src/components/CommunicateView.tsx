import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2 } from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { getThemeWidgetStyles } from '../utils/themeWidgetHelper';
import {
  ShieldSosSticker,
  ConnectHeartSticker,
  IdCardSticker,
  ReadingBookSticker,
  QuickPhrasesSticker,
  KeyboardSticker,
} from './icons/JournalStickers';

export const CommunicateView: React.FC = () => {
  const {
    settings,
    childProfile: _childProfile,
    isCaregiverConnected,
    connectionStatus,
    setShowCaregiverModal,
    setShowCaregiverAlertModal,
    setShowAboutMeModal,
    setShowPassportModal,
    setShowQuickPhrasesDrawer,
    setShowAacKeyboardModal,
    speak,
    quickPhrases,
    activeTheme,
    isPremium,
    triggerUpgrade,
  } = useApp();

  const themeStyles = getThemeWidgetStyles(activeTheme);
  const isColorCoded = settings?.colorCodedActionCards === true;
  const [customText, setCustomText] = useState('');

  const handleSpeakCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    speak(customText.trim());
    playChime('complete');
  };

  const commCards = [
    {
      id: 'help-alert',
      title: 'Ask for Help (SOS)',
      desc: '1-Tap emergency or need-help alerts sent directly to your caregiver or helper.',
      badge: 'Emergency SOS',
      color: 'border-2 border-rose-300/80 bg-rose-50/40 hover:bg-rose-50/80 text-rose-950',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      Sticker: ShieldSosSticker,
      action: () => {
        setShowCaregiverAlertModal(true);
        playChime('tap');
      },
    },
    {
      id: 'connect-caregiver',
      title: 'Connect Caregiver',
      desc: isCaregiverConnected 
        ? `Connected live with ${connectionStatus.peerName || 'Caregiver'}. Tap to manage link.`
        : 'Link to a parent, teacher, or helper device with a QR scan or 6-digit code.',
      badge: isCaregiverConnected ? 'Connected Live' : !isPremium ? 'Plus' : 'Link Device',
      color: 'border-2 border-pink-300/80 bg-pink-50/40 hover:bg-pink-50/80 text-pink-950',
      badgeClass: 'bg-pink-100 text-pink-800 border-pink-200',
      Sticker: ConnectHeartSticker,
      action: () => {
        if (!isPremium) {
          triggerUpgrade('Caregiver Remote Live Sync & Portal is a BeeYou Plus feature! Start your 15-day free trial.');
          return;
        }
        setShowCaregiverModal(true);
        playChime('tap');
      },
    },
    {
      id: 'about-me',
      title: 'About Me ID Card',
      desc: 'Your emergency information, sensory sensitivities, communication tips, and emergency contacts.',
      badge: 'ID Card',
      color: 'border-2 border-sky-300/80 bg-sky-50/40 hover:bg-sky-50/80 text-sky-950',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
      Sticker: IdCardSticker,
      action: () => {
        setShowAboutMeModal(true);
        playChime('tap');
      },
    },
    {
      id: 'passport',
      title: 'Communication Passport',
      desc: '1-Page summary for teachers, doctors, and therapists explaining your communication style.',
      badge: 'Support Passport',
      color: 'border-2 border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-950',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Sticker: ReadingBookSticker,
      action: () => {
        setShowPassportModal(true);
        playChime('tap');
      },
    },
    {
      id: 'quick-phrases',
      title: 'Quick Phrases & Cards',
      desc: 'Instant pre-made phrases for quick responses, asking for breaks, and daily social interactions.',
      badge: `${quickPhrases.length} Phrases`,
      color: 'border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/80 text-amber-950',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      Sticker: QuickPhrasesSticker,
      action: () => {
        setShowQuickPhrasesDrawer(true);
        playChime('tap');
      },
    },
    {
      id: 'keyboard',
      title: 'Type to Speak Keyboard',
      desc: 'High-contrast on-screen typing keyboard with instant text-to-speech engine.',
      badge: 'Spell & Speak',
      color: 'border-2 border-violet-300/80 bg-violet-50/40 hover:bg-violet-50/80 text-violet-950',
      badgeClass: 'bg-violet-100 text-violet-800 border-violet-200',
      Sticker: KeyboardSticker,
      action: () => {
        setShowAacKeyboardModal(true);
        playChime('tap');
      },
    },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full px-3 sm:px-5 py-3 pb-24 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('Communicate')} 💬
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
            {t('Ways to express yourself, connect with caregivers, and share your ID.')}
          </p>
        </div>
      </header>

      {/* Quick Speak Box */}
      <form onSubmit={handleSpeakCustom} className="p-3 sm:p-4 rounded-3xl bg-white border-2 border-stone-200 shadow-sm flex flex-col sm:flex-row gap-2.5 items-stretch">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={t('Type anything to speak out loud...')}
            className={`w-full pl-4 pr-10 py-2.5 rounded-2xl bg-stone-50 border-2 border-stone-200 focus:bg-white text-slate-900 font-bold text-xs sm:text-sm outline-none transition-all ${activeTheme?.palette?.primaryBorder ? `focus:${activeTheme.palette.primaryBorder}` : 'focus:border-amber-400'}`}
          />
          {customText && (
            <button
              type="button"
              onClick={() => setCustomText('')}
              className="absolute right-3 text-stone-400 hover:text-stone-600 font-bold text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!customText.trim()}
          className={`px-5 py-2.5 rounded-2xl ${activeTheme?.palette?.primaryBg || 'bg-amber-500'} ${activeTheme?.palette?.primaryHover || 'hover:bg-amber-600'} disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{t('Speak')}</span>
        </button>
      </form>

      {/* Communication Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {commCards.map((card) => {
          const Sticker = card.Sticker;
          const cardClass = isColorCoded
            ? card.color
            : `${themeStyles.card} !p-4 sm:!p-5 !rounded-2xl`;
          const badgeClass = isColorCoded
            ? card.badgeClass
            : themeStyles.adventureTag;

          return (
            <button
              key={card.id}
              onClick={card.action}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl active:scale-[0.98] cursor-pointer transition-all flex items-center justify-between gap-4 group ${cardClass}`}
            >
              <div className="min-w-0 flex-1">
                <span className={badgeClass}>
                  {t(card.badge)}
                </span>
                <h3 className={`font-bold text-sm sm:text-base leading-snug truncate ${isColorCoded ? 'text-slate-900' : themeStyles.headerText}`}>
                  {t(card.title)}
                </h3>
                <p className={`text-xs font-medium leading-snug mt-0.5 line-clamp-1 ${isColorCoded ? 'text-slate-600' : themeStyles.headerSubtext}`}>
                  {t(card.desc)}
                </p>
              </div>
              <div className="w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                <Sticker className="w-full h-full object-contain" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
