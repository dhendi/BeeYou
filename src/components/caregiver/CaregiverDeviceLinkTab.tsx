import React, { useState } from 'react';
import { t } from '../../services/translator';
import { useApp } from '../../context/AppContext';
import { playChime } from '../../utils/audio';
import { getPairingCode } from '../../services/caregiverSync';
import { logoutFamilyAccount, wipeDeviceStorage } from '../../services/authService';
import { QRCodeView } from '../QRCodeView';
import { CaregiverLivePortal } from '../CaregiverLivePortal';

interface CaregiverDeviceLinkTabProps {
  onShowNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverDeviceLinkTab: React.FC<CaregiverDeviceLinkTabProps> = ({
  onShowNotification,
  onStartTour,
}) => {
  const {
    childProfile,
    connectionStatus,
  } = useApp();

  const [confirmWipe, setConfirmWipe] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const handleSignOut = async () => {
    try {
      await logoutFamilyAccount();
      playChime('tap');
      onShowNotification(t('Signed out of family account.'));
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 300);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const handleExecuteWipe = async () => {
    try {
      setIsWiping(true);
      await wipeDeviceStorage();
      playChime('clear');
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 300);
    } catch (e) {
      setIsWiping(false);
      console.error('Wipe error:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            <span>{t("Caregiver Live Link & Remote Monitor")}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            See what {childProfile.name} is doing or feeling in real-time, even when you're away at work or in another room.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs flex items-center justify-center shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <span>{t("How This Works")}</span>
            </button>
          )}
          <a
            href={`/?caregiver=true&code=${getPairingCode()}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-sm transition active:scale-95 cursor-pointer"
          >
            <span>{t("Open Remote Portal in New Window")}</span>
          </a>
        </div>
      </div>

      {/* Pairing Code Card with Crisp Live QR Code */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-purple-50 to-indigo-50 border-2 border-rose-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-rose-700 uppercase tracking-wider block">
              {t("Child's Remote Pairing Code")}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1.5 ${
              connectionStatus.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`} />
              {connectionStatus.isConnected ? t('Live Connected') : t('Ready to Pair')}
            </span>
          </div>

          <div data-tour="pairing-code-display" className="text-3xl sm:text-4xl font-black tracking-widest text-slate-900 font-mono select-all">
            {getPairingCode()}
          </div>
          
          <p className="text-xs text-slate-600 font-medium">
            {t("Scan this QR code with your phone camera or enter the 7-character code to link instantly.")}
          </p>

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/?caregiver=true&code=${getPairingCode()}`;
                navigator.clipboard?.writeText(url);
                onShowNotification('Caregiver portal link copied to clipboard!');
              }}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black flex items-center justify-center shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <span>{t("Copy Direct Portal URL")}</span>
            </button>

            <a
              href={`/?caregiver=true&code=${getPairingCode()}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <span>{t("Open Portal In New Tab")}</span>
            </a>
          </div>
        </div>

        {/* Live High-Contrast Scannable QR Code */}
        <div data-tour="pairing-qr-card" className="p-4 bg-white rounded-3xl border-2 border-rose-200 shadow-sm flex flex-col items-center gap-2 shrink-0">
          <QRCodeView 
            value={getPairingCode()} 
            size={180} 
            title={`Pair with ${childProfile.name}`}
            subtitle={t("Scan with phone camera")}
          />
        </div>
      </div>

      {/* Embedded Live Companion Portal View */}
      <div data-tour="pairing-permissions-card" className="rounded-3xl border-2 border-slate-200 overflow-hidden shadow-xs">
        <CaregiverLivePortal initialCode={getPairingCode()} />
      </div>

      {/* Device Security & Clean Handoff */}
      <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900">
            {t("Device Handoff & Memory Sanitization")}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
            {t("Returning a school-loaned tablet or handing this device down to another child? You can safely unpair or wipe this device's memory without affecting your cloud family space.")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleSignOut}
            className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition cursor-pointer"
          >
            <span className="text-xs font-black text-slate-800 block">
              {t("Sign Out Family Account")}
            </span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              {t("Disconnects active account from this device. Preserves local schedules.")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmWipe(true)}
            className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/60 hover:bg-rose-100/60 text-left transition cursor-pointer"
          >
            <span className="text-xs font-black text-rose-800 block">
              {t("Erase & Reset Device")}
            </span>
            <span className="text-[11px] text-rose-600 font-medium block mt-0.5">
              {t("Completely purges private medications, mood logs, and routines.")}
            </span>
          </button>
        </div>

        {confirmWipe && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-3 animate-in fade-in">
            <div>
              <span className="text-xs font-black uppercase tracking-wider block text-rose-900">
                {t("Confirm Clean Device Wipe")}
              </span>
              <p className="text-xs text-rose-800 font-medium mt-1 leading-relaxed">
                {t("Are you sure? This will erase all local schedules, medication dose records, and personal journal entries from this physical device. (Your cloud account backup remains completely safe).")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExecuteWipe}
                disabled={isWiping}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition cursor-pointer"
              >
                <span>{isWiping ? t("Erasing...") : t("Yes, Erase This Device")}</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmWipe(false)}
                disabled={isWiping}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition cursor-pointer"
              >
                <span>{t("Cancel")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
