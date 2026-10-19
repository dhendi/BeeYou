import React, { useState } from 'react';
import { t } from '../../services/translator';
import { useApp } from '../../context/AppContext';
import { playChime } from '../../utils/audio';
import { getPairingCode } from '../../services/caregiverSync';
import { logoutFamilyAccount, wipeDeviceStorage, deleteFamilyAccount, updateCaregiverPin } from '../../services/authService';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { QRCodeView } from '../QRCodeView';
import { CaregiverLivePortal } from '../CaregiverLivePortal';
import { LegalModal } from '../LegalModals';
import { hashPin } from '../../utils/security';
import { runFullSecurityAudit, SecurityAuditReport, SecurityControlResult } from '../../services/securityAuditService';

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
    settings,
  } = useApp();

  const [confirmWipe, setConfirmWipe] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditResult, setAuditResult] = useState<SecurityAuditReport | null>(null);

  const handleRunDiagnostics = async () => {
    setIsRunningAudit(true);
    playChime('tap');

    try {
      const report = await runFullSecurityAudit({
        pairingCode: getPairingCode(),
        pin: settings?.pin,
      });

      setAuditResult(report);

      if (report.overallStatus === 'passed') {
        playChime('complete');
        onShowNotification(t('Security audit complete: All 5 barriers independently verified!'));
      } else if (report.overallStatus === 'warning') {
        playChime('tap');
        onShowNotification(t(`Security audit: ${report.verifiedCount} of ${report.totalControls} verified (${report.unverifiedCount} unverified).`));
      } else {
        playChime('clear');
        onShowNotification(t(`Security audit warning: ${report.failedCount} barrier(s) failed validation!`));
      }
    } catch (e: any) {
      console.error('Security audit execution error:', e);
      onShowNotification(t('Security audit encountered an unexpected error.'));
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handleUpgradeStoredPin = async () => {
    try {
      const current = settings?.pin || '1234';
      const clean = current.replace(/[^0-9]/g, '').slice(0, 4) || '1234';
      await updateCaregiverPin(clean);
      playChime('complete');
      onShowNotification(t('Caregiver PIN upgraded to salted SHA-256 hash.'));
      // Re-run diagnostic to verify
      handleRunDiagnostics();
    } catch {
      onShowNotification(t('Failed to upgrade PIN hash.'));
    }
  };

  const renderAuditCard = (
    key: 'tls' | 'pin' | 'entropy' | 'csp' | 'cloud',
    fallbackTitle: string,
    fallbackHeadline: string,
    fallbackDetail: string,
    spanClass?: string
  ) => {
    const ctrl: SecurityControlResult | undefined = auditResult?.controls[key];

    let statusBadge = (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
        {t("Pending Check")}
      </span>
    );
    let cardStyle = "bg-slate-50/70 border-slate-200";
    let titleColor = "text-slate-700";

    if (ctrl) {
      if (ctrl.status === 'verified') {
        cardStyle = "bg-emerald-50/70 border-emerald-200";
        titleColor = "text-emerald-800";
        statusBadge = (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t("Verified")}
          </span>
        );
      } else if (ctrl.status === 'failed') {
        cardStyle = "bg-rose-50/80 border-rose-300";
        titleColor = "text-rose-800";
        statusBadge = (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {t("Failed")}
          </span>
        );
      } else {
        cardStyle = "bg-amber-50/70 border-amber-200";
        titleColor = "text-amber-800";
        statusBadge = (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {t("Unverified")}
          </span>
        );
      }
    }

    return (
      <div className={`p-3.5 rounded-2xl border space-y-1.5 ${cardStyle} ${spanClass || ''}`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[11px] font-black uppercase tracking-wider ${titleColor}`}>
            {ctrl?.name || fallbackTitle}
          </span>
          {statusBadge}
        </div>
        <p className="text-xs font-bold text-slate-800">
          {ctrl?.headline || fallbackHeadline}
        </p>
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
          {ctrl?.detail || fallbackDetail}
        </p>
        {key === 'pin' && ctrl?.status === 'failed' && (
          <div className="pt-1">
            <button
              type="button"
              onClick={handleUpgradeStoredPin}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer transition active:scale-95"
            >
              <span>{t("Upgrade Stored PIN to Salted Hash")}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

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

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExecuteDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await deleteFamilyAccount(deletePassword);
      setIsDeleting(false);
      if (res.success) {
        playChime('clear');
        onShowNotification(t(res.message));
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 400);
      } else {
        setDeleteError(res.message);
        playChime('clear');
      }
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteError(err?.message || 'Failed to delete account.');
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

      {/* Security & Privacy Audit */}
      <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-black text-slate-900">
                {t("Security & Privacy Health Check")}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
              {t("Real-time verification of on-device encryption, pairing entropy, and cloud access protection.")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunDiagnostics}
            disabled={isRunningAudit}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shrink-0"
          >
            <span>{isRunningAudit ? t("Checking Barriers...") : t("Run Security Diagnostics")}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {renderAuditCard(
            'tls',
            t('Transport Encryption'),
            t('TLS 1.3 / HTTPS & WSS'),
            t('Requires secure context and encrypted REST/WebSocket connections.')
          )}
          {renderAuditCard(
            'pin',
            t('Caregiver PIN Protection'),
            t('Salt-Hashed SHA-256'),
            t('PIN must be stored as a 256-bit salted hash digest in persistent storage.')
          )}
          {renderAuditCard(
            'entropy',
            t('Pairing Code Entropy'),
            t('7-Character Base32 (34.35B)'),
            t('Unguessable pairing code generated using cryptographic random values.')
          )}
          {renderAuditCard(
            'csp',
            t('Content Security Policy'),
            t('Active DOM Meta Directives'),
            t("Strict Content-Security-Policy with object-src 'none' and restricted endpoints.")
          )}
          {renderAuditCard(
            'cloud',
            t('Cloud Partitioning & Isolation'),
            t('Server-Side Security Rules'),
            t('Live probe verifies that unauthenticated root access is rejected with Permission denied.'),
            'sm:col-span-2 lg:col-span-2'
          )}
        </div>

        {auditResult && (
          <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-bold animate-in fade-in ${
            auditResult.overallStatus === 'passed'
              ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
              : auditResult.overallStatus === 'failed'
              ? 'bg-rose-100/80 border-rose-300 text-rose-900'
              : 'bg-amber-100/70 border-amber-300 text-amber-900'
          }`}>
            <div className="flex items-center gap-2">
              {auditResult.overallStatus === 'passed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : auditResult.overallStatus === 'failed' ? (
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              )}
              <span>
                {auditResult.overallStatus === 'passed'
                  ? t("Diagnostic passed: All 5 security controls independently verified on device & live cloud.")
                  : auditResult.overallStatus === 'failed'
                  ? t(`Diagnostic failed: ${auditResult.failedCount} of ${auditResult.totalControls} security controls failed validation.`)
                  : t(`Diagnostic incomplete: ${auditResult.verifiedCount} of ${auditResult.totalControls} verified, ${auditResult.unverifiedCount} could not be confirmed.`)}
              </span>
            </div>
            <span className={`text-[11px] font-mono font-medium shrink-0 ${
              auditResult.overallStatus === 'passed'
                ? 'text-emerald-700'
                : auditResult.overallStatus === 'failed'
                ? 'text-rose-700'
                : 'text-amber-700'
            }`}>
              {t("Verified at")} {auditResult.checkedAt}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 font-medium">
            {t("Apple App Store Kids Category & COPPA Transparency")}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLegalModalTab('privacy')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
            >
              <span>{t("Privacy Policy (COPPA)")}</span>
            </button>
            <button
              type="button"
              onClick={() => setLegalModalTab('terms')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
            >
              <span>{t("Terms of Service")}</span>
            </button>
          </div>
        </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
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
            onClick={() => {
              setConfirmWipe(true);
              setConfirmDelete(false);
            }}
            className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 text-left transition cursor-pointer"
          >
            <span className="text-xs font-black text-amber-900 block">
              {t("Erase & Reset Device")}
            </span>
            <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
              {t("Completely purges local device memory while keeping cloud backup safe.")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setConfirmDelete(true);
              setConfirmWipe(false);
              setDeletePassword('');
              setDeleteError(null);
            }}
            className="p-4 rounded-2xl border-2 border-rose-300 bg-rose-50/70 hover:bg-rose-100/70 text-left transition cursor-pointer sm:col-span-2 lg:col-span-1"
          >
            <span className="text-xs font-black text-rose-800 block">
              {t("Delete Family Account")}
            </span>
            <span className="text-[11px] text-rose-600 font-medium block mt-0.5">
              {t("Permanently deletes your account and cloud Realtime Database records.")}
            </span>
          </button>
        </div>

        {confirmWipe && (
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 animate-in fade-in">
            <div>
              <span className="text-xs font-black uppercase tracking-wider block text-amber-900">
                {t("Confirm Clean Device Wipe")}
              </span>
              <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed">
                {t("Are you sure? This will erase all local schedules, medication dose records, and personal journal entries from this physical device. (Your cloud account backup remains completely safe).")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExecuteWipe}
                disabled={isWiping}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition cursor-pointer"
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

        {confirmDelete && (
          <form onSubmit={handleExecuteDelete} className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-3 animate-in fade-in">
            <div>
              <span className="text-xs font-black uppercase tracking-wider block text-rose-900">
                {t("Permanent Account Deletion (Apple Rule 5.1.1v)")}
              </span>
              <p className="text-xs text-rose-800 font-medium mt-1 leading-relaxed">
                {t("Warning: This action is permanent and cannot be undone. It will delete your family account, wipe your cloud database channel, and purge all personal schedules, medication logs, and journal entries from this device.")}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-rose-900 block">
                {t("Enter Account Password to Confirm Deletion:")}
              </label>
              <input
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={t("Your account password")}
                className="w-full max-w-sm px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white text-slate-800 text-xs font-medium focus:outline-rose-500"
              />
            </div>

            {deleteError && (
              <p className="text-xs font-bold text-rose-700 bg-rose-100/80 p-2 rounded-lg">
                {deleteError}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white font-black text-xs transition cursor-pointer"
              >
                <span>{isDeleting ? t("Deleting Account...") : t("Yes, Permanently Delete Account")}</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition cursor-pointer"
              >
                <span>{t("Cancel")}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {legalModalTab && (
        <LegalModal
          isOpen={Boolean(legalModalTab)}
          onClose={() => setLegalModalTab(null)}
          initialTab={legalModalTab}
        />
      )}
    </div>
  );
};
