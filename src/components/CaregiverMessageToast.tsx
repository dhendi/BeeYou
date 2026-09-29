import React from 'react';
import { Heart, Volume2, X, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';

export const CaregiverMessageToast: React.FC = () => {
  const { 
    incomingCaregiverMessage, 
    dismissIncomingCaregiverMessage, 
    setShowCaregiverModal, 
    speak 
  } = useApp();

  if (!incomingCaregiverMessage) return null;

  const handleListen = () => {
    playChime('tap');
    speak(`${incomingCaregiverMessage.senderName} says: ${incomingCaregiverMessage.text}`);
  };

  const handleReply = () => {
    playChime('tap');
    setShowCaregiverModal(true);
    dismissIncomingCaregiverMessage();
  };

  return (
    <aside
      aria-label="Caregiver Message Notification"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="bg-white rounded-3xl p-4 shadow-2xl border-2 border-rose-300 flex items-start gap-3.5 text-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl shrink-0 shadow-xs">
          {incomingCaregiverMessage.emoji || '❤️'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-600 uppercase tracking-wider flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              Note from {incomingCaregiverMessage.senderName}
            </span>
            <button
              onClick={dismissIncomingCaregiverMessage}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm font-black text-slate-900 mt-1 leading-snug">
            "{incomingCaregiverMessage.text}"
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleListen}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Read Aloud</span>
            </button>

            <button
              onClick={handleReply}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span>Send Hug Back</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
