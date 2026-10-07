import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Heart, 
  User, 
  FileText, 
  MessageSquare, 
  Keyboard, 
  Volume2, 
  Send,
  Sparkles,
  Wifi,
  WifiOff,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { playChime } from '../utils/audio';

export const CommunicateView: React.FC = () => {
  const {
    childProfile,
    isCaregiverConnected,
    connectionStatus,
    setShowCaregiverModal,
    setShowCaregiverAlertModal,
    setShowAboutMeModal,
    setShowPassportModal,
    setShowQuickPhrasesDrawer,
    setShowAacKeyboard,
    speak,
    quickPhrases,
    activeTheme,
  } = useApp();

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
      emoji: '🚨',
      icon: ShieldAlert,
      badge: 'Emergency SOS',
      color: 'border-rose-300 bg-rose-50/70 hover:bg-rose-100/70 text-rose-950',
      iconColor: 'bg-rose-500 text-white',
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
      emoji: '🔗',
      icon: Heart,
      badge: isCaregiverConnected ? 'Connected Live' : 'Link Device',
      color: isCaregiverConnected 
        ? 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950'
        : 'border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 text-amber-950',
      iconColor: isCaregiverConnected ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white',
      action: () => {
        setShowCaregiverModal(true);
        playChime('tap');
      },
    },
    {
      id: 'about-me',
      title: 'About Me ID Card',
      desc: 'Your emergency information, sensory sensitivities, communication tips, and emergency contacts.',
      emoji: '🪪',
      icon: User,
      badge: 'ID Card',
      color: 'border-blue-300 bg-blue-50/70 hover:bg-blue-100/70 text-blue-950',
      iconColor: 'bg-blue-500 text-white',
      action: () => {
        setShowAboutMeModal(true);
        playChime('tap');
      },
    },
    {
      id: 'passport',
      title: 'Communication Passport',
      desc: '1-Page summary for teachers, doctors, and therapists explaining your communication style.',
      emoji: '📋',
      icon: FileText,
      badge: 'Support Passport',
      color: 'border-purple-300 bg-purple-50/70 hover:bg-purple-100/70 text-purple-950',
      iconColor: 'bg-purple-500 text-white',
      action: () => {
        setShowPassportModal(true);
        playChime('tap');
      },
    },
    {
      id: 'quick-phrases',
      title: 'Quick Phrases & Cards',
      desc: 'Instant pre-made phrases for quick responses, asking for breaks, and daily social interactions.',
      emoji: '💬',
      icon: MessageSquare,
      badge: `${quickPhrases.length} Phrases`,
      color: 'border-teal-300 bg-teal-50/70 hover:bg-teal-100/70 text-teal-950',
      iconColor: 'bg-teal-500 text-white',
      action: () => {
        setShowQuickPhrasesDrawer(true);
        playChime('tap');
      },
    },
    {
      id: 'keyboard',
      title: 'Type to Speak Keyboard',
      desc: 'High-contrast on-screen typing keyboard with instant text-to-speech engine.',
      emoji: '⌨️',
      icon: Keyboard,
      badge: 'Spell & Speak',
      color: 'border-stone-300 bg-stone-50/70 hover:bg-stone-100/70 text-stone-900',
      iconColor: 'bg-stone-700 text-white',
      action: () => {
        setShowAacKeyboard(true);
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
            Communicate 💬
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
            Ways to express yourself, connect with caregivers, and share your ID.
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
            placeholder="Type anything to speak out loud..."
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-stone-50 border-2 border-stone-200 focus:border-amber-400 focus:bg-white text-slate-900 font-bold text-xs sm:text-sm outline-none transition-all"
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
          className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>Speak</span>
        </button>
      </form>

      {/* Communication Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {commCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={card.action}
              className={`p-4 rounded-3xl border-2 text-left transition-all active:scale-98 cursor-pointer shadow-xs flex flex-col justify-between ${card.color}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${card.iconColor}`}>
                    <Icon className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black leading-tight">{card.title}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                      {card.badge}
                    </span>
                  </div>
                </div>
                <span className="text-xl" aria-hidden="true">{card.emoji}</span>
              </div>
              <p className="text-xs font-medium leading-relaxed opacity-90">
                {card.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
