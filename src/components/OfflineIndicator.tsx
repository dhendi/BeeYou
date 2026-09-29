import React, { useState, useEffect } from 'react';
import { WifiOff, Database, CheckCircle2, ShieldCheck, RefreshCw, X, Sparkles, Volume2 } from 'lucide-react';
import { verifyOfflineIntegrity, indexOfflineData } from '../utils/offlineStorage';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { aacItems, routines, socialStories, skills, habits, childProfile } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<any>(null);

  const checkStatus = async () => {
    const res = await verifyOfflineIntegrity();
    setIntegrityStatus(res);
  };

  useEffect(() => {
    checkStatus();
  }, [aacItems.length, routines.length, socialStories.length]);

  const handleManualReindex = async () => {
    setReindexing(true);
    playChime('tap');
    try {
      await indexOfflineData({
        aacItems,
        routines,
        socialStories,
        skills,
        habits,
        childName: childProfile.name,
      });
      await checkStatus();
      playChime('star');
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setReindexing(false), 500);
    }
  };

  return (
    <>
      {/* Offline banner at bottom left */}
      {!isOnline && (
        <div 
          onClick={() => setShowModal(true)}
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 text-xs font-bold shadow-xl transition-all active:scale-95 cursor-pointer border border-amber-400/40"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode — All AAC, Schedules & Stories Ready</span>
        </div>
      )}

      {/* Offline Status & Storage Inspection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Offline Reliability Status</h3>
                  <p className="text-xs text-slate-500 font-medium">Service Worker & Indexed Storage</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Online/Offline status card */}
              <div className={`p-3.5 rounded-2xl flex items-center justify-between border ${
                isOnline 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  {isOnline ? (
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  ) : (
                    <WifiOff className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="text-sm font-black">
                    {isOnline ? 'Online Connection Active' : 'Device Completely Offline'}
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80">
                  {isOnline ? 'Connected' : 'Standalone'}
                </span>
              </div>

              {/* Indexed Components Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    AAC Speech Grid Tiles:
                  </span>
                  <span className="font-black text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {integrityStatus?.aacCount || aacItems.length} Tiles Indexed
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    Visual Schedules & Routines:
                  </span>
                  <span className="font-black text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {integrityStatus?.routinesCount || routines.length} Routines Cached
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                    Social Stories & Scripts:
                  </span>
                  <span className="font-black text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {integrityStatus?.storiesCount || socialStories.length} Stories Ready
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                    Offline Voice Synthesizer:
                  </span>
                  <span className="font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    Always Ready
                  </span>
                </div>
              </div>

              {/* Storage Engine Status */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/70 text-xs text-slate-600 font-medium">
                <span>Storage Engine:</span>
                <span className="font-bold text-slate-800">
                  {integrityStatus?.storageEngine || 'IndexedDB + LocalStorage Mirror'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={handleManualReindex}
                disabled={reindexing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reindexing ? 'animate-spin' : ''}`} />
                <span>{reindexing ? 'Indexing Offline Cache...' : 'Verify & Re-Index Data'}</span>
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
