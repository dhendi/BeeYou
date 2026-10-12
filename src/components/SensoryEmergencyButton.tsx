import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';

interface SensoryEmergencyButtonProps {
  className?: string;
}

export const SensoryEmergencyButton: React.FC<SensoryEmergencyButtonProps> = ({
  className = '',
}) => {
  const { activateSafeMode, isSafeModeActive, enabledFeatures } = useApp();

  if (isSafeModeActive || enabledFeatures?.emergencyAlertSOS !== true) return null;

  return (
    <div
      className={`fixed bottom-20 right-3 sm:right-6 z-40 pointer-events-none ${className}`}
    >
      <button
        type="button"
        onClick={() => {
          playChime('clear');
          activateSafeMode();
        }}
        className="pointer-events-auto group flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-2xl shadow-red-500/60 border-2 border-white ring-4 ring-red-400/50 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-red-500 animate-pulse"
        aria-label="Sensory Safe Mode: Emergency Sensory Overload Button"
        title="Emergency Overload Button: Instantly activate 4 survival communication tiles & silent caregiver notice"
      >
        <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 text-white" />
        </div>
        <span className="tracking-wide uppercase font-black">Sensory SOS</span>
      </button>
    </div>
  );
};
