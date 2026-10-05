import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Send, 
  RefreshCw, 
  Sparkles, 
  Smile, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Battery, 
  ShieldCheck, 
  Volume2, 
  Radio, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  ShieldAlert,
  PhoneCall,
  Car,
  Headphones
} from 'lucide-react';
import { 
  fetchCaregiverSession, 
  sendCaregiverMessage, 
  acknowledgeCaregiverAlert,
  onCaregiverAlert,
  getPairingCode,
  setPairingCode 
} from '../services/caregiverSync';
import { CaregiverChildStatus, EmotionType, CaregiverAlert } from '../types';
import { playChime } from '../utils/audio';

interface CaregiverLivePortalProps {
  initialCode?: string;
  onBackToApp?: () => void;
}

const QUICK_REASSURANCES = [
  { text: 'So proud of your great effort today! 🌟', emoji: '🌟', label: 'Proud' },
  { text: 'Sending you a giant, warm hug! 🫂', emoji: '🫂', label: 'Big Hug' },
  { text: 'Take all the time you need. You are safe. 🌸', emoji: '🌸', label: 'Reassurance' },
  { text: 'I will see you very soon! 🚗', emoji: '🚗', label: 'See You Soon' },
  { text: 'Remember to take 3 deep, gentle breaths 🍃', emoji: '🍃', label: 'Calm Breaths' },
  { text: 'I love you to the moon and back! 💖', emoji: '💖', label: 'Love' },
];

export const CaregiverLivePortal: React.FC<CaregiverLivePortalProps> = ({ 
  initialCode, 
  onBackToApp 
}) => {
  const [code, setCode] = useState<string>(() => {
    if (initialCode) return initialCode.trim().toUpperCase();
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramCode = urlParams.get('code');
      if (paramCode) return paramCode.trim().toUpperCase();
    }
    return getPairingCode();
  });

  const [inputCode, setInputCode] = useState(code);
  const [status, setStatus] = useState<CaregiverChildStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [senderName, setSenderName] = useState('Mom');
  const [customMessage, setCustomMessage] = useState('');
  const [messageSentNotice, setMessageSentNotice] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [urgentReplyText, setUrgentReplyText] = useState('');

  const loadStatus = async (targetCode: string) => {
    setLoading(true);
    const data = await fetchCaregiverSession(targetCode);
    if (data) {
      setStatus(data);
      setLastUpdated(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStatus(code);
    // Poll every 4 seconds for live status
    const interval = setInterval(() => {
      loadStatus(code);
    }, 4000);

    // Instant notification on urgent alert broadcast
    const unsubAlert = onCaregiverAlert((alert) => {
      playChime('complete');
      loadStatus(code);
    });

    return () => {
      clearInterval(interval);
      unsubAlert();
    };
  }, [code]);

  const handleAcknowledgeAlert = async (responseMsg: string) => {
    playChime('star');
    await acknowledgeCaregiverAlert(code, senderName, responseMsg);
    setMessageSentNotice(`Sent response to ${status?.childName || 'Child'}: "${responseMsg}"`);
    setUrgentReplyText('');
    loadStatus(code);
    setTimeout(() => setMessageSentNotice(null), 4000);
  };

  const handleConnectCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const clean = inputCode.trim().toUpperCase();
    setCode(clean);
    setPairingCode(clean);
    loadStatus(clean);
  };

  const handleSendQuickReassurance = async (item: typeof QUICK_REASSURANCES[0]) => {
    playChime('star');
    await sendCaregiverMessage(code, item.text, senderName, item.emoji);
    setMessageSentNotice(`Sent "${item.text}" to ${status?.childName || 'Child'}!`);
    setTimeout(() => setMessageSentNotice(null), 3500);
  };

  const handleSendCustomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;
    playChime('star');
    await sendCaregiverMessage(code, customMessage.trim(), senderName, '❤️');
    setMessageSentNotice(`Sent note to ${status?.childName || 'Child'}!`);
    setCustomMessage('');
    setTimeout(() => setMessageSentNotice(null), 3500);
  };

  // Helper for emotion display
  const getEmotionBadge = (mood: EmotionType | null | undefined) => {
    switch (mood) {
      case 'happy': return { label: 'Happy', emoji: '😊', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'calm': return { label: 'Calm & Steady', emoji: '😌', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'excited': return { label: 'Excited', emoji: '🤩', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'tired': return { label: 'Tired / Low Energy', emoji: '🥱', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'worried': return { label: 'A Little Worried', emoji: '😟', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'sad': return { label: 'Sad', emoji: '😢', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'overwhelmed': return { label: 'Overwhelmed / Sensory Load', emoji: '😵‍💫', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'frustrated': return { label: 'Frustrated', emoji: '😤', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      default: return { label: 'Doing Okay', emoji: '🙂', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
  };

  const emotionInfo = getEmotionBadge(status?.currentMood);

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-y-auto overscroll-contain bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="p-2 rounded-2xl hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Return to Main App"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-md shadow-rose-200">
            <Heart className="w-5 h-5 fill-white" />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Caregiver Companion Portal</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Monitoring {status?.childName || 'Child'} in real-time
            </p>
          </div>
        </div>

        {/* Pairing code search & refresh */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleConnectCode} className="hidden sm:flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 pl-2">CODE:</span>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-24 text-xs font-mono font-black uppercase text-indigo-900 bg-white px-2 py-1 rounded-xl border border-slate-200 text-center outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
            >
              Link
            </button>
          </form>

          <button
            onClick={() => loadStatus(code)}
            disabled={loading}
            title="Refresh Live Status"
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Notice Banner */}
        {messageSentNotice && (
          <div className="p-4 rounded-3xl bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-200 flex items-center justify-between animate-in zoom-in-95">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5" />
              <span>{messageSentNotice}</span>
            </div>
            <button 
              onClick={() => setMessageSentNotice(null)}
              className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-emerald-600 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* URGENT EMOTION ALERT BANNER (If child pressed the Easy Alert button) */}
        {status?.activeAlert && status.activeAlert.status === 'active' && (
          <section className="p-5 sm:p-6 rounded-3xl bg-rose-50 border-3 border-rose-500 shadow-xl shadow-rose-100 animate-in zoom-in-95 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-2xl font-black shadow-md animate-bounce shrink-0">
                  {status.activeAlert.emoji || '🚨'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-200 px-2.5 py-0.5 rounded-full animate-pulse">
                      Urgent Emotion Alert
                    </span>
                    <span className="text-xs text-rose-600 font-bold">
                      {new Date(status.activeAlert.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-rose-950 mt-0.5">
                    {status.childName}: "{status.activeAlert.label}"
                  </h3>
                  <p className="text-xs font-bold text-rose-800">
                    Location: <strong className="capitalize">{status.activeAlert.location || 'School/Therapy'}</strong>
                    {status.activeAlert.note && ` • Note: ${status.activeAlert.note}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-rose-200 text-rose-900 text-xs font-black">
                  Requires Acknowledgment
                </span>
              </div>
            </div>

            {/* Quick One-Tap Caregiver Responses */}
            <div>
              <div className="text-xs font-black text-rose-800 uppercase tracking-wider mb-2">
                Quick Reassurance Responses (Sent to {status.childName}'s Screen Immediately):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAcknowledgeAlert("I'm on my way to pick you up right now! 🚗")}
                  className="p-3 rounded-2xl bg-white hover:bg-rose-100 border border-rose-300 text-left transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-2.5"
                >
                  <Car className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-xs font-black text-slate-800">On my way to pick you up! 🚗</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAcknowledgeAlert("Calling your teacher / therapist right now! 📞")}
                  className="p-3 rounded-2xl bg-white hover:bg-rose-100 border border-rose-300 text-left transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-2.5"
                >
                  <PhoneCall className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-xs font-black text-slate-800">Calling your teacher now 📞</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAcknowledgeAlert("You are safe! Put on your headphones and take 3 deep breaths 🎧")}
                  className="p-3 rounded-2xl bg-white hover:bg-rose-100 border border-rose-300 text-left transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-2.5"
                >
                  <Headphones className="w-5 h-5 text-purple-600 shrink-0" />
                  <span className="text-xs font-black text-slate-800">Headphones & deep breaths 🎧</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAcknowledgeAlert("Sending love! Hang in there, I will see you soon ❤️")}
                  className="p-3 rounded-2xl bg-white hover:bg-rose-100 border border-rose-300 text-left transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-2.5"
                >
                  <Heart className="w-5 h-5 text-rose-600 shrink-0 fill-rose-500" />
                  <span className="text-xs font-black text-slate-800">Sending love! See you soon ❤️</span>
                </button>
              </div>
            </div>

            {/* Custom reply input */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={urgentReplyText}
                onChange={(e) => setUrgentReplyText(e.target.value)}
                placeholder="Or type custom reassuring response..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-rose-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (urgentReplyText.trim()) {
                    handleAcknowledgeAlert(urgentReplyText.trim());
                  }
                }}
                disabled={!urgentReplyText.trim()}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs transition cursor-pointer shrink-0"
              >
                Send Custom Response
              </button>
            </div>
          </section>
        )}

        {/* Hero Status Card: What is Child doing & feeling right now? */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-black shadow-xs">
                🧒
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {status?.childName || 'Child'}
                  </h2>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {status?.pairingCode || code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last active: {new Date(status?.lastActiveTime || Date.now()).toLocaleTimeString()}</span>
                  <span>•</span>
                  <span>Auto-syncs every 5s</span>
                </p>
              </div>
            </div>

            {/* Current Mood Display */}
            <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 ${emotionInfo.color}`}>
              <span className="text-2xl">{emotionInfo.emoji}</span>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider opacity-75">
                  Current Feeling
                </div>
                <div className="text-sm font-black">{emotionInfo.label}</div>
              </div>
            </div>
          </div>

          {/* Quick Sensory Needs Alert if Overwhelmed or Worried */}
          {(status?.currentMoodReason || status?.currentMoodNeed || status?.quickAlert) && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-1">
                <span className="font-black">Emotional Check-In Details:</span>
                {status.currentMoodReason && (
                  <p className="font-medium text-amber-800">
                    <strong>Why:</strong> {status.currentMoodReason}
                  </p>
                )}
                {status.currentMoodNeed && (
                  <p className="font-medium text-amber-800">
                    <strong>Support requested:</strong> {status.currentMoodNeed}
                  </p>
                )}
                {status.quickAlert && (
                  <p className="font-black text-amber-950 mt-1">
                    "{status.quickAlert}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Active Activity */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-indigo-500" />
                Current Activity
              </div>
              <div className="text-base font-black text-slate-800 mt-1">
                {status?.currentActivity || 'Active in BeeYou'}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Engaging with interactive tools
              </p>
            </div>

            {/* Last AAC Spoken Phrase */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between">
              <div className="text-xs font-black text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                Last Spoken AAC Words
              </div>
              <div className="text-sm font-black text-blue-950 italic mt-1">
                {status?.lastAacSentence ? `"${status.lastAacSentence}"` : 'No spoken phrase yet today'}
              </div>
              <p className="text-[11px] text-blue-600 mt-2">
                {status?.lastSpokenTime 
                  ? `Spoken at ${new Date(status.lastSpokenTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` 
                  : 'Speech engine ready'}
              </p>
            </div>

            {/* Daily Habits & Progress */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
              <div className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Habits Completed Today
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-950">
                  {status?.habitsCompletedToday || 0}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  of {status?.totalHabits || 4} habits
                </span>
              </div>
              <div className="w-full bg-emerald-200/60 rounded-full h-2 mt-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round(((status?.habitsCompletedToday || 0) / (status?.totalHabits || 4)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Send Love & Reassurance to Child */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Send Love & Reassurance to {status?.childName || 'Child'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Messages pop up gently with voice audio on {status?.childName || 'Child'}'s screen
              </p>
            </div>

            {/* Sender selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">From:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {['Mom', 'Dad', 'Caregiver', 'Teacher'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSenderName(name)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                      senderName === name 
                        ? 'bg-rose-500 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick One-Tap Reassurance Cards */}
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
              One-Tap Reassurances
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {QUICK_REASSURANCES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuickReassurance(item)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-left transition-all active:scale-98 cursor-pointer group flex items-start gap-3"
                >
                  <span className="text-2xl group-hover:scale-110 transition shrink-0">
                    {item.emoji}
                  </span>
                  <div>
                    <div className="text-xs font-black text-slate-900 group-hover:text-rose-900">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                      {item.text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Composer */}
          <form onSubmit={handleSendCustomMessage} className="pt-2">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              Write a Custom Reassurance Note
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={`e.g., I'll pick you up at 3:15, you are doing awesome today! ❤️`}
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-500 outline-none text-sm font-medium transition"
              />
              <button
                type="submit"
                disabled={!customMessage.trim()}
                className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-black text-sm shadow-md shadow-rose-200 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Send to Child's Screen</span>
              </button>
            </div>
          </form>
        </section>

        {/* Security & Offline Information */}
        <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Connection is encrypted and private to pairing code {code}.</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </main>
    </div>
  );
};
