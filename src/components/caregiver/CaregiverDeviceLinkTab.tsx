import React from 'react';
import { t } from '../../services/translator';
import { useApp } from '../../context/AppContext';
import { playChime } from '../../utils/audio';
import { getPairingCode } from '../../services/caregiverSync';
import { QRCodeView } from '../QRCodeView';
import { CaregiverLivePortal } from '../CaregiverLivePortal';
import { Heart, ExternalLink, Camera, Copy } from 'lucide-react';

interface CaregiverDeviceLinkTabProps {
  onShowNotification: (msg: string) => void;
  onOpenScanner: () => void;
  onStartTour?: () => void;
}

export const CaregiverDeviceLinkTab: React.FC<CaregiverDeviceLinkTabProps> = ({
  onShowNotification,
  onOpenScanner,
  onStartTour,
}) => {
  const {
    childProfile,
    connectionStatus,
  } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
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
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <span>{t("💡 How This Works")}</span>
            </button>
          )}
          <a
            href={`/?caregiver=true&code=${getPairingCode()}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              connectionStatus.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {connectionStatus.isConnected ? '🟢 Live Connected' : '⚪ Ready to Pair'}
            </span>
          </div>

          <div data-tour="pairing-code-display" className="text-3xl sm:text-4xl font-black tracking-widest text-slate-900 font-mono select-all">
            {getPairingCode()}
          </div>
          
          <p className="text-xs text-slate-600 font-medium">
            {t("Scan this QR code with your phone camera or enter the 6-letter code to link instantly.")}
          </p>

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                onOpenScanner();
                playChime('tap');
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer"
              title={t("Open device camera to scan pairing QR code")}
            >
              <Camera className="w-4 h-4" />
              <span>{t("Scan QR with Camera")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/?caregiver=true&code=${getPairingCode()}`;
                navigator.clipboard?.writeText(url);
                onShowNotification('Caregiver portal link copied to clipboard!');
              }}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black flex items-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>{t("Copy Direct Portal URL")}</span>
            </button>

            <a
              href={`/?caregiver=true&code=${getPairingCode()}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
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
    </div>
  );
};
