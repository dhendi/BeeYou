import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { CaregiverHowItWorksModal, HelpTopic } from './CaregiverHowItWorksModal';
import { playChime } from '../utils/audio';

interface ContextualHelpButtonProps {
  topic: HelpTopic;
  label?: string;
  variant?: 'icon-only' | 'text-button' | 'pill';
  className?: string;
}

export const ContextualHelpButton: React.FC<ContextualHelpButtonProps> = ({
  topic,
  label = 'How does this work?',
  variant = 'icon-only',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playChime('tap');
    setIsOpen(true);
  };

  return (
    <>
      {variant === 'icon-only' && (
        <button
          type="button"
          onClick={handleClick}
          className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer inline-flex items-center justify-center ${className}`}
          title={label}
          aria-label={label}
        >
          <HelpCircle className="w-4 h-4 stroke-[2.2]" />
        </button>
      )}

      {variant === 'text-button' && (
        <button
          type="button"
          onClick={handleClick}
          className={`text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      )}

      {variant === 'pill' && (
        <button
          type="button"
          onClick={handleClick}
          className={`px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-2xs ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{label}</span>
        </button>
      )}

      {isOpen && (
        <CaregiverHowItWorksModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          initialTopic={topic}
        />
      )}
    </>
  );
};
