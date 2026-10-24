import React from 'react';
import { 
  X, 
  Smile, 
  Sun, 
  Hand, 
  Clock, 
  HelpCircle, 
  Star, 
  Heart, 
  Sparkles, 
  ThumbsUp, 
  Check, 
  Tablet, 
  RotateCcw, 
  VolumeX, 
  Coffee, 
  Hourglass, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Zap, 
  Frown, 
  User,
  MessageSquare
} from 'lucide-react';
import { playChime } from '../../utils/audio';
import { t } from '../../services/translator';

export interface QuickChatPhrase {
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface QuickChatGroup {
  title: string;
  phrases: QuickChatPhrase[];
}

export const QUICK_CHAT_GROUPS: QuickChatGroup[] = [
  {
    title: 'Greetings & Social',
    phrases: [
      { text: 'Hello!', icon: Smile },
      { text: 'Good morning!', icon: Sun },
      { text: 'Goodbye!', icon: Hand },
      { text: 'See you later!', icon: Clock },
      { text: 'How are you?', icon: HelpCircle },
      { text: 'Have a great day!', icon: Star },
    ],
  },
  {
    title: 'Polite & Courteous',
    phrases: [
      { text: 'Please.', icon: Heart },
      { text: 'Thank you very much!', icon: Sparkles },
      { text: "You're welcome!", icon: ThumbsUp },
      { text: 'Excuse me please.', icon: Hand },
      { text: 'I love you!', icon: Heart },
      { text: 'Yes, please.', icon: Check },
      { text: 'No, thank you.', icon: X },
    ],
  },
  {
    title: 'Self-Advocacy & AAC',
    phrases: [
      { text: 'I communicate using this AAC tablet. Please give me time to reply.', icon: Tablet },
      { text: 'I do not understand. Can you explain differently?', icon: HelpCircle },
      { text: 'Can you please repeat that?', icon: RotateCcw },
      { text: 'It is too loud and overwhelming here.', icon: VolumeX },
      { text: 'I need a sensory quiet break.', icon: Coffee },
      { text: 'Please do not rush me.', icon: Hourglass },
    ],
  },
  {
    title: 'Urgent Needs',
    phrases: [
      { text: 'Please help me right now!', icon: AlertTriangle },
      { text: 'Stop that please, I do not like it.', icon: ShieldAlert },
      { text: 'I need to use the restroom.', icon: Activity },
      { text: 'Something hurts.', icon: Zap },
      { text: 'I feel sick to my tummy.', icon: Frown },
      { text: 'I want my caregiver or mom.', icon: User },
    ],
  },
];

export interface QuickChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeakPhrase: (text: string) => void;
}

export const QuickChatModal: React.FC<QuickChatModalProps> = ({
  isOpen,
  onClose,
  onSpeakPhrase,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={t('Quick Chat Expressions')}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border-4 border-purple-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-black text-base">{t('Quick Chat Expressions')}</h3>
              <p className="text-xs text-purple-100 font-medium">
                {t('Tap any phrase to speak instantly — active sentence is preserved!')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label={t('Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {QUICK_CHAT_GROUPS.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                {t(grp.title)}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grp.phrases.map((phrase, pIdx) => {
                  const IconComp = phrase.icon;
                  return (
                    <button
                      key={pIdx}
                      onClick={() => {
                        onSpeakPhrase(phrase.text);
                        playChime('tap');
                      }}
                      className="p-3 rounded-2xl border-2 border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50 text-slate-900 font-bold text-xs sm:text-sm text-left flex items-center gap-2.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span className="p-1 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                        <IconComp className="w-4 h-4" />
                      </span>
                      <span className="leading-tight">{t(phrase.text)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
