import React from 'react';
import { Heart, Volume2, X, Send, Sparkles, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { sendCaregiverMessage, getPairingCode } from '../services/caregiverSync';

export const CaregiverMessageToast: React.FC = () => {
  const { 
    incomingCaregiverMessage, 
    dismissIncomingCaregiverMessage, 
    childProfile,
    speak 
  } = useApp();

  if (!incomingCaregiverMessage) return null;

  // Defensive auto-healing: if text is "Caregiver" and senderName is not "Caregiver", auto-correct them
  const rawSender = incomingCaregiverMessage.senderName || 'Caregiver';
  const rawText = incomingCaregiverMessage.text || '';
  const isInverted =
    (rawText.trim().toLowerCase() === 'caregiver' || rawText.trim().toLowerCase() === 'child') &&
    rawSender.trim().toLowerCase() !== rawText.trim().toLowerCase();
  const senderName = isInverted ? rawText : rawSender;
  const messageText = isInverted ? rawSender : rawText;

  const handleListen = () => {
    playChime('tap');
    speak(`${senderName} says: ${messageText}`, { force: true });
  };

  const handleQuickReply = async (replyText: string, emoji: string) => {
    playChime('complete');
    const code = getPairingCode();
    await sendCaregiverMessage(code, replyText, childProfile.name || 'Child', emoji);
    speak(`Sent reply: ${replyText}`, { force: true });
    dismissIncomingCaregiverMessage();
  };

  return (
    <aside
      aria-label="Caregiver Message Notification"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg animate-in slide-in-from-top-4 duration-300 pointer-events-auto shadow-2xl"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-2 border-rose-300 ring-4 ring-rose-400/20 text-slate-800 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 text-rose-600 flex items-center justify-center text-3xl shrink-0 shadow-sm border border-rose-200 animate-bounce">
            {incomingCaregiverMessage.emoji || '❤️'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Message from {senderName || 'Caregiver'}</span>
              </span>
              <button
                onClick={dismissIncomingCaregiverMessage}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
              "{messageText}"
            </p>

            {/* Quick Actions & 1-Tap Fast Replies */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tap 1-Tap Reply:
                </span>
                <button
                  onClick={handleListen}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Read Aloud</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { text: 'Got it! 👍', emoji: '👍', bg: 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100' },
                  { text: 'Love you! ❤️', emoji: '❤️', bg: 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100' },
                  { text: 'Waiting! 🚗', emoji: '🚗', bg: 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100' },
                  { text: '2 mins! ⏳', emoji: '⏳', bg: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' },
                ].map((r, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickReply(r.text, r.emoji)}
                    className={`px-2.5 py-2 rounded-xl border font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs ${r.bg}`}
                  >
                    <span>{r.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
