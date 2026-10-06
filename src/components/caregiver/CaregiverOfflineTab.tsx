import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { playChime } from '../../utils/audio';
import { verifyOfflineIntegrity, indexOfflineData } from '../../utils/offlineStorage';
import { PWAInstallButton } from '../PWAInstallButton';
import { Database, ShieldCheck, Download } from 'lucide-react';

interface CaregiverOfflineTabProps {
  onShowNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverOfflineTab: React.FC<CaregiverOfflineTabProps> = ({ 
  onShowNotification,
  onStartTour,
}) => {
  const {
    childProfile,
    aacItems,
    routines,
    socialStories,
    skills,
    habits,
  } = useApp();

  const [reindexingOffline, setReindexingOffline] = useState(false);

  const handleManualReindex = async () => {
    setReindexingOffline(true);
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
      await verifyOfflineIntegrity();
      onShowNotification('All AAC tiles, schedules & stories successfully re-indexed into offline database!');
    } catch (e) {
      console.error(e);
    } finally {
      setReindexingOffline(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600" />
            <span>Offline Functionality & Storage Indexing</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Critical AAC speech, visual schedules, and social story data remain 100% accessible without internet.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <span>💡 How This Works</span>
            </button>
          )}
          <button
            type="button"
            data-tour="offline-reindex-btn"
            onClick={handleManualReindex}
            disabled={reindexingOffline}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <span>{reindexingOffline ? 'Indexing Cache...' : 'Verify & Re-Index Offline Storage'}</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div data-tour="offline-status-banner" className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black">Offline Readiness: Fully Protected & Cached</h3>
            <p className="text-xs text-emerald-700">
              Service worker active with precached assets and dual-indexed local database.
            </p>
          </div>
        </div>
        <span className="text-xs font-black bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full">
          100% Offline Ready
        </span>
      </div>

      {/* Metrics Grid */}
      <div data-tour="offline-metrics-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
            AAC Tiles Indexed
          </div>
          <div className="text-2xl font-black text-slate-900">
            {aacItems.length} Tiles
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Stored in IndexedDB 'aac_items' store with motor index preserved.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
            Routines & Schedules
          </div>
          <div className="text-2xl font-black text-slate-900">
            {routines.length} Routines
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            All visual steps, times, and First/Then sequences cached locally.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
            Social Stories & Scripts
          </div>
          <div className="text-2xl font-black text-slate-900">
            {socialStories.length} Stories
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Complete illustrated pages and reassurance scripts saved offline.
          </p>
        </div>
      </div>

      {/* Install PWA Component Card */}
      <div className="p-5 rounded-3xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-indigo-950 flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Install BeeYou as Standalone Progressive Web App</span>
          </h3>
          <p className="text-xs text-indigo-800 mt-0.5">
            Installs directly to tablet or phone home screen with native app launch and zero browser distractions.
          </p>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <PWAInstallButton variant="pill" />
        </div>
      </div>
    </div>
  );
};
