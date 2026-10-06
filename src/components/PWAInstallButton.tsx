import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'pill';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA, hide or show subtle checkmark
  if (isInstalled) {
    if (variant === 'full') {
      return (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>BeeYou App Installed</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 3000);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'pill') {
      return (
        <button
          onClick={handleInstallClick}
          title="Install BeeYou for Offline Access"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      );
    }

    if (variant === 'full') {
      return (
        <button
          onClick={handleInstallClick}
          className={`flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-sm shadow-md transition cursor-pointer ${className}`}
        >
          <Download className="w-5 h-5" />
          <span>Install BeeYou to Home Screen</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        title="Install BeeYou for full offline reliability"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-bold transition active:scale-95 cursor-pointer ${className}`}
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="Install BeeYou on iOS"
          className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs shrink-0 ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="hidden sm:inline">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Install on iPhone / iPad</h3>
                    <p className="text-xs text-slate-500 font-medium">Use offline anytime, anywhere</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <p className="leading-snug">Tap the Safari <strong>Share button</strong> <span className="text-indigo-600 font-bold">(square with arrow up)</span> at the bottom of the screen.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <p className="leading-snug">Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <p className="leading-snug">Tap <strong>"Add"</strong> in the top-right corner. BeeYou is now ready offline!</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition cursor-pointer"
              >
                Got It!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
