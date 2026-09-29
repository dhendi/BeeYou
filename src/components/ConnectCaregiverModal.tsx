import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Send, 
  Copy, 
  Check, 
  X, 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  Smile, 
  MessageSquare, 
  Clock,
  Radio
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  getPairingCode, 
  syncChildStatusToCaregiver, 
  pollCaregiverMessages, 
  onCaregiverMessage 
} from '../services/caregiverSync';
import { CaregiverMessage } from '../types';
import { playChime } from '../utils/audio';

interface ConnectCaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectCaregiverModal: React.FC<ConnectCaregiverModalProps> = ({ isOpen, onClose }) => {
  const { childProfile, currentMood, sentence, speak } = useApp();
  const [pairingCode, setPairingCode] = useState<string>('LUMI-101');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);
  const [messages, setMessages] = useState<CaregiverMessage[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const code = getPairingCode();
    setPairingCode(code);

    // Initial sync
    syncChildStatusToCaregiver({
      childName: childProfile.name,
      currentMood,
    });

    // Check for messages
    pollCaregiverMessages(code).then((msgs) => {
      if (msgs.length > 0) setMessages(msgs);
    });

    // Subscribe to live broadcast messages
    const unsubscribe = onCaregiverMessage((newMsg) => {
      setMessages((prev) => [newMsg, ...prev]);
      playChime('star');
      speak(`${newMsg.senderName} says: ${newMsg.text}`);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, childProfile.name, currentMood]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(pairingCode);
    setCopied(true);
    playChime('tap');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?caregiver=true&code=${pairingCode}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    playChime('tap');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendHug = async () => {
    playChime('star');
    await syncChildStatusToCaregiver({
      childName: childProfile.name,
      currentMood,
      quickAlert: `Sent a warm hug to you! 🫂❤️`,
    });
    setSentSuccess('Sent a warm hug to your caregiver! 🫂❤️');
    speak(`I sent a hug to my caregiver!`);
    setTimeout(() => setSentSuccess(null), 3000);
  };

  const handleSendFeeling = async () => {
    playChime('star');
    await syncChildStatusToCaregiver({
      childName: childProfile.name,
      currentMood,
      quickAlert: `Shared current feeling: ${currentMood || 'calm'}`,
    });
    setSentSuccess(`Shared your feeling (${currentMood || 'calm'}) with your caregiver! 🌿`);
    speak(`I shared how I am feeling with my caregiver.`);
    setTimeout(() => setSentSuccess(null), 3000);
  };

  const handleSendSentence = async () => {
    if (sentence.length === 0) return;
    const text = sentence.map(s => s.speechText || s.label).join(' ');
    playChime('star');
    await syncChildStatusToCaregiver({
      childName: childProfile.name,
      currentMood,
      lastAacSentence: text,
      quickAlert: `Sent message: "${text}"`,
    });
    setSentSuccess(`Sent "${text}" to your caregiver! 💬`);
    speak(`I sent my message to my caregiver.`);
    setTimeout(() => setSentSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black shadow-xs">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                Connect with Caregiver
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Let your caregiver see what you are doing & feeling anytime
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content body */}
        <div className="mt-5 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Success Banner */}
          {sentSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in zoom-in-95">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sentSuccess}</span>
            </div>
          )}

          {/* Pairing Code Card */}
          <div className="p-4 rounded-3xl bg-linear-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-700 uppercase tracking-wider mb-1">
                <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>Your Caregiver Link Code</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-wider text-indigo-950 font-mono">
                {pairingCode}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Share this code with your mom, dad, or caregiver
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyCode}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Copy Portal Link</span>
              </button>
            </div>
          </div>

          {/* Quick Actions for Child */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Connections for You
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleSendHug}
                className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left transition active:scale-98 cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-200 text-rose-700 flex items-center justify-center text-xl shrink-0">
                  🫂
                </div>
                <div>
                  <div className="text-xs font-black text-rose-900">Send a Warm Hug</div>
                  <div className="text-[11px] text-rose-700">"I'm thinking of you!"</div>
                </div>
              </button>

              <button
                onClick={handleSendFeeling}
                className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition active:scale-98 cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center text-xl shrink-0">
                  <Smile className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-900">Share Current Mood</div>
                  <div className="text-[11px] text-amber-700">I feel: {currentMood || 'calm'}</div>
                </div>
              </button>

              {sentence.length > 0 && (
                <button
                  onClick={handleSendSentence}
                  className="sm:col-span-2 p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition active:scale-98 cursor-pointer flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-200 text-blue-800 flex items-center justify-center text-xl shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-blue-900">Send My Spoken Words</div>
                    <div className="text-[11px] text-blue-700 truncate">
                      "{sentence.map(s => s.label).join(' ')}"
                    </div>
                  </div>
                  <Send className="w-4 h-4 text-blue-600 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* Incoming Caregiver Messages */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Messages from Your Caregiver</span>
              <span className="text-[11px] font-bold text-slate-500">
                {messages.length} notes received
              </span>
            </h3>

            {messages.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <Heart className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-600">No notes yet today</p>
                <p className="text-[11px] text-slate-400">
                  When your caregiver sends love or reassurance, it will appear right here!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl">{msg.emoji || '❤️'}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-rose-900">{msg.senderName}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mt-0.5 leading-snug">
                          {msg.text}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playChime('tap');
                        speak(`${msg.senderName} says: ${msg.text}`);
                      }}
                      title="Read Aloud"
                      className="p-2 rounded-xl bg-white hover:bg-rose-100 text-rose-700 shadow-xs border border-rose-200 transition active:scale-95 cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Private & secure companion connection</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
