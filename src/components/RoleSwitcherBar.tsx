import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Crown, 
  ExternalLink, 
  Zap, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Radio, 
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  getPairingCode, 
  setPairingCode, 
  subscribeToCloudChannel, 
  sendHeartbeat,
  sendTestCaregiverAlert, 
  sendCaregiverMessage,
  onConnectionStatusChange,
  ConnectionStatusInfo
} from '../services/caregiverSync';
import { playChime } from '../utils/audio';

export const RoleSwitcherBar: React.FC = () => {
  const { isParentMode, setIsParentMode, childProfile, updateChildProfile } = useApp();
  const [isMinimized, setIsMinimized] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testSentNotice, setTestSentNotice] = useState<string | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionStatusInfo | null>(null);

  const pairingCode = getPairingCode();

  useEffect(() => {
    const unsub = onConnectionStatusChange((status) => {
      setConnectionInfo(status);
    });
    return () => unsub();
  }, []);

  // Determine current active view
  const isCaregiverView = (() => {
    if (typeof window !== 'undefined') {
      if (window.location.port === '3001') return true;
      if (window.location.pathname.startsWith('/caregiver')) return true;
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'caregiver') return true;
      if (params.get('role') === 'child') return false;
      if (window.location.port === '3000') {
        return isParentMode || sessionStorage.getItem('beeyou_active_device_view') === 'caregiver';
      }
    }
    return isParentMode;
  })();

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(pairingCode);
      setCopiedCode(true);
      playChime('tap');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  const handleOpenCompanionWindow = () => {
    playChime('star');
    const code = getPairingCode();
    if (isCaregiverView) {
      // Current tab is Caregiver -> Open Child Tablet
      const targetUrl = window.location.port === '3001'
        ? `http://localhost:3000/?role=child&code=${encodeURIComponent(code)}`
        : `${window.location.origin}/?role=child&code=${encodeURIComponent(code)}`;
      window.open(targetUrl, 'BeeYouChildWindow', 'width=500,height=860,left=60,top=50');
    } else {
      // Current tab is Child -> Open Caregiver Hub
      const targetUrl = window.location.port === '3000'
        ? `http://localhost:3001/?role=caregiver&code=${encodeURIComponent(code)}`
        : `${window.location.origin}/?role=caregiver&code=${encodeURIComponent(code)}`;
      window.open(targetUrl, 'BeeYouCaregiverWindow', 'width=520,height=860,left=580,top=50');
    }
  };

  const handleSwitchRoleInTab = () => {
    playChime('tap');
    const code = getPairingCode();
    if (isCaregiverView) {
      // Switch from Caregiver -> Child
      setActiveDeviceView('child');
      if (window.location.port === '3001') {
        window.location.href = `http://localhost:3000/?role=child&code=${encodeURIComponent(code)}`;
      } else {
        window.history.replaceState(null, '', `/?role=child&code=${encodeURIComponent(code)}`);
        window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'child' } }));
      }
    } else {
      // Switch from Child -> Caregiver
      setActiveDeviceView('caregiver');
      if (window.location.port === '3000') {
        window.location.href = `http://localhost:3001/?role=caregiver&code=${encodeURIComponent(code)}`;
      } else {
        window.history.replaceState(null, '', `/?role=caregiver&code=${encodeURIComponent(code)}`);
        window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'caregiver' } }));
      }
    }
  };

  const handleApplyDemoSetup = () => {
    const demoCode = 'BEE-DEMO';
    setPairingCode(demoCode);
    subscribeToCloudChannel(demoCode);
    updateChildProfile({
      name: 'Leo',
      ageGroup: 'kid',
    });
    sendHeartbeat({
      role: isCaregiverView ? 'caregiver' : 'child_device',
      name: isCaregiverView ? 'Sarah (Mom)' : 'Leo',
      pairingCode: demoCode,
    });
    playChime('complete');
    setTestSentNotice(`Configured demo profile: Leo & Mom (Code: ${demoCode})`);
    setTimeout(() => setTestSentNotice(null), 3000);
  };

  const handleSendTestSignal = async () => {
    playChime('tap');
    const code = getPairingCode();
    if (isCaregiverView) {
      // Send Nudge to Child
      await sendCaregiverMessage(code, "I'm on my way! 🚗 Keep being awesome.", 'Mom', '🚗');
      setTestSentNotice("Sent test nudge to Child Tablet!");
    } else {
      // Send SOS to Caregiver
      await sendTestCaregiverAlert(childProfile.name || 'Leo');
      setTestSentNotice("Sent test SOS alert to Caregiver Hub!");
    }
    setTimeout(() => setTestSentNotice(null), 3000);
  };

  return (
    <aside 
      aria-label="Testing Hub"
      className="fixed bottom-3 left-3 sm:left-4 z-[90] max-w-sm pointer-events-auto font-sans"
    >
      {isMinimized ? (
        /* Minimized Floating Pill */
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            playChime('tap');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-black shadow-lg border-2 transition active:scale-95 cursor-pointer backdrop-blur-md ${
            isCaregiverView 
              ? 'bg-slate-900/90 text-white border-amber-400/80 shadow-slate-900/30' 
              : 'bg-white/95 text-slate-900 border-amber-300 shadow-amber-900/20'
          }`}
          title="Open Role Switcher & Testing Setup Hub"
        >
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              connectionInfo?.isConnected ? 'bg-emerald-400' : 'bg-amber-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              connectionInfo?.isConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></span>
          </span>
          <span className="text-base">{isCaregiverView ? '👑' : '🧒'}</span>
          <span>{isCaregiverView ? 'Caregiver Hub' : 'Child Tablet'}</span>
          <span className="font-mono text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">
            {pairingCode}
          </span>
          <ChevronUp className="w-3.5 h-3.5 opacity-60 ml-0.5" />
        </button>
      ) : (
        /* Expanded Role Switcher & Testing Control Center */
        <div className="bg-slate-950/95 text-white p-4 rounded-3xl border-2 border-amber-400/80 shadow-2xl backdrop-blur-xl w-80 sm:w-96 space-y-3.5 animate-in slide-in-from-bottom-3 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Radio className="w-4 h-4 animate-pulse text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide flex items-center gap-1.5 text-white">
                  <span>Role Switcher &amp; Test Hub</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono">
                    Step 4
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  Zero-friction side-by-side companion testing
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMinimized(true);
                playChime('tap');
              }}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Minimize bar"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Current Role Banner */}
          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{isCaregiverView ? '👑' : '🧒'}</span>
              <div>
                <div className="text-[11px] font-black text-amber-300 flex items-center gap-1">
                  <span>This Tab:</span>
                  <span className="text-white underline decoration-amber-400">
                    {isCaregiverView ? 'Caregiver Controller' : 'Child Tablet'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Pairing: <strong className="text-amber-400">{pairingCode}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer transition active:scale-95"
              title="Copy pairing code"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Notice Feedback Banner if active */}
          {testSentNotice && (
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-[11px] font-bold text-center animate-in fade-in">
              {testSentNotice}
            </div>
          )}

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* 1. Open Companion Side-by-Side in New Window */}
            <button
              type="button"
              onClick={handleOpenCompanionWindow}
              className="col-span-2 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition"
              title="Opens companion role in a side-by-side test window"
            >
              <ExternalLink className="w-4 h-4" />
              <span>
                {isCaregiverView ? '🚀 Open Child Tablet (Port 3000)' : '🚀 Open Caregiver Hub (Port 3001)'}
              </span>
            </button>

            {/* 2. Switch Role In This Tab */}
            <button
              type="button"
              onClick={handleSwitchRoleInTab}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95 border border-slate-700 text-center"
              title="Switch role directly in this browser tab"
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              <span className="text-[11px]">
                {isCaregiverView ? 'Switch to Child' : 'Switch to Caregiver'}
              </span>
            </button>

            {/* 3. Load Demo Setup (Leo & Mom) */}
            <button
              type="button"
              onClick={handleApplyDemoSetup}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95 border border-slate-700 text-center"
              title="Automatically pair to DEMO-BEE-123 with prefilled child Leo"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[11px]">Demo Setup (Leo)</span>
            </button>

            {/* 4. Instant Test Ping Button */}
            <button
              type="button"
              onClick={handleSendTestSignal}
              className="col-span-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isCaregiverView ? 'Ping Child Tablet ("I\'m On My Way")' : 'Ping Caregiver Hub ("Test SOS Alert")'}
              </span>
            </button>
          </div>

          {/* Companion status footer */}
          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${
                connectionInfo?.isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span>{connectionInfo?.statusText || 'Ready to pair'}</span>
            </span>
            <span className="text-slate-500 font-mono">
              Ports: 3000 (Child) | 3001 (Caregiver)
            </span>
          </div>

        </div>
      )}
    </aside>
  );
};
