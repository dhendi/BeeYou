import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RefreshCw, 
  Camera, 
  Heart, 
  X,
  AlertCircle,
  Wifi,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChime } from '../utils/audio';
import { BeeMascot } from './BeeYouLogo';

export interface ConnectionFeedbackState {
  isOpen: boolean;
  type: 'success' | 'failure';
  role: 'caregiver' | 'child_device';
  peerName: string;
  errorMessage?: string;
  pairingCode?: string;
}

interface ConnectionFeedbackModalProps {
  state: ConnectionFeedbackState | null;
  onClose: () => void;
  onRetry?: () => void;
  onOpenCamera?: () => void;
}

export const ConnectionFeedbackModal: React.FC<ConnectionFeedbackModalProps> = ({
  state,
  onClose,
  onRetry,
  onOpenCamera,
}) => {
  if (!state || !state.isOpen) return null;

  const isSuccess = state.type === 'success';
  const isCaregiver = state.role === 'caregiver';

  useEffect(() => {
    if (isSuccess) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      playChime('complete');
    } else {
      playChime('tap');
    }
  }, [isSuccess]);

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-2 animate-in zoom-in-95 duration-200 text-slate-800 ${
        isSuccess 
          ? 'bg-gradient-to-b from-emerald-50 via-white to-amber-50/50 border-emerald-300' 
          : 'bg-gradient-to-b from-rose-50 via-white to-stone-50 border-rose-300'
      }`}>
        
        {/* Header Ribbon */}
        <div className={`p-4 sm:p-5 text-white flex items-center justify-between ${
          isSuccess 
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700' 
            : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700'
        }`}>
          <div className="flex items-center gap-2.5">
            {isSuccess ? (
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                {isSuccess ? 'Connection Successful!' : 'Connection Failed'}
              </h3>
              <p className="text-[11px] text-white/80 font-medium">
                {isSuccess ? 'BeeYou Real-Time Link Active' : 'Could not link devices'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-center">
          
          {/* Mascot Center Illustration */}
          <div className="flex justify-center -mt-2">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-md border-2 ${
              isSuccess 
                ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                : 'bg-rose-100 border-rose-300 text-rose-700'
            }`}>
              <BeeMascot size="md" pose={isSuccess ? 'celebrating' : 'thinking'} />
            </div>
          </div>

          {/* SUCCESS CONTENT */}
          {isSuccess && (
            <div className="space-y-2 animate-in fade-in">
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {isCaregiver 
                  ? `You are connected to ${state.peerName || 'Child'}!`
                  : `${state.peerName || 'Caregiver'} is connected to your device!`
                }
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {isCaregiver 
                  ? `Real-time notifications, daily schedule updates, and instant reassurance replies are now syncing live.`
                  : `Your caregiver can now receive your help alerts in real-time and send you caring reminders.`
                }
              </p>

              {state.pairingCode && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-black border border-emerald-200 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Code: {state.pairingCode}</span>
                </div>
              )}
            </div>
          )}

          {/* FAILURE CONTENT */}
          {!isSuccess && (
            <div className="space-y-3 animate-in fade-in text-left">
              <div className="text-center">
                <h4 className="text-lg sm:text-xl font-black text-rose-950 tracking-tight">
                  Why didn't it connect?
                </h4>
                <p className="text-xs text-rose-700 font-bold mt-0.5">
                  {state.errorMessage || 'The pairing request could not be completed.'}
                </p>
              </div>

              {/* Troubleshooting Checklist */}
              <div className="p-3.5 bg-rose-50/90 rounded-2xl border border-rose-200 space-y-2 text-xs text-slate-700 font-medium">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Quick Troubleshooting Tips:</span>
                </div>
                <ul className="space-y-1.5 pl-5 list-disc text-slate-600 text-[11px]">
                  <li>
                    <strong>App is Open:</strong> Make sure the BeeYou app is open and visible on both devices.
                  </li>
                  <li>
                    <strong>Internet Connection:</strong> Ensure both phone and tablet have an active Wi-Fi or cellular connection.
                  </li>
                  <li>
                    <strong>Check Code Format:</strong> Pairing codes are 6 characters (e.g., <code className="font-mono bg-white px-1 rounded text-rose-800 font-bold">K7P4-92</code>).
                  </li>
                  <li>
                    <strong>Code Expiration:</strong> Temporary QR codes expire after 10 minutes. Tap refresh on the child's screen to get a fresh code.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-col gap-2">
            {isSuccess ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Great, Let's Go! 🎉</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                {onOpenCamera && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCamera();
                    }}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer transition active:scale-95 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Scan with Camera</span>
                  </button>
                )}

                {onRetry && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRetry();
                    }}
                    className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer transition active:scale-95 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
