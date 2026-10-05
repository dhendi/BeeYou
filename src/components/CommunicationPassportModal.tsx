import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Trash2, Printer, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { playChime } from '../utils/audio';

type Section = 'communicationStyle' | 'sensoryTriggers' | 'whatHelps' | 'specialInterests' | 'comfortItems';

export const CommunicationPassportModal: React.FC = () => {
  const {
    showPassportModal,
    setShowPassportModal,
    communicationPassport,
    updateCommunicationPassport,
    childProfile,
  } = useApp();

  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [newItem, setNewItem] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const printRef = useRef<HTMLDivElement>(null);

  if (!showPassportModal) return null;

  const addItem = (section: keyof typeof communicationPassport) => {
    if (!newItem.trim()) return;
    const current = communicationPassport[section];
    if (Array.isArray(current)) {
      updateCommunicationPassport({ [section]: [...current, newItem.trim()] });
    }
    setNewItem('');
    playChime('tap');
  };

  const removeItem = (section: keyof typeof communicationPassport, idx: number) => {
    const current = communicationPassport[section];
    if (Array.isArray(current)) {
      updateCommunicationPassport({ [section]: current.filter((_, i) => i !== idx) });
    }
    playChime('clear');
  };

  const handlePrint = () => {
    window.print();
  };

  const SectionCard: React.FC<{
    title: string;
    emoji: string;
    sectionKey: Section;
    items: string[];
    bg: string;
    border: string;
  }> = ({ title, emoji, sectionKey, items, bg, border }) => {
    const isOpen = expanded[sectionKey] !== false;
    return (
      <div className={`rounded-2xl border-2 ${border} ${bg} overflow-hidden`}>
        <button
          onClick={() => setExpanded((p) => ({ ...p, [sectionKey]: !isOpen }))}
          className="w-full flex items-center justify-between p-3.5 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{emoji}</span>
            <span className="font-black text-sm text-slate-800">{title}</span>
            <span className="text-xs text-slate-500 font-medium">({items.length})</span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isOpen && (
          <div className="px-3.5 pb-3.5 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/80 rounded-xl px-3 py-2">
                <span className="flex-1 text-sm font-medium text-slate-700">{item}</span>
                <button
                  onClick={() => removeItem(sectionKey, idx)}
                  className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={editingSection === sectionKey ? newItem : ''}
                onFocus={() => { setEditingSection(sectionKey); setNewItem(''); }}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={`Add ${title.toLowerCase()}...`}
                className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                onKeyDown={(e) => e.key === 'Enter' && editingSection === sectionKey && addItem(sectionKey)}
              />
              <button
                onClick={() => editingSection === sectionKey && addItem(sectionKey)}
                className="px-3 py-2 rounded-xl bg-slate-700 text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body > *:not(.passport-print-root) { display: none !important; }
          .passport-print-root { display: block !important; position: fixed; inset: 0; z-index: 99999; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="fixed inset-0 z-[200] flex flex-col bg-white/95 backdrop-blur-sm overflow-y-auto passport-print-root">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3 sticky top-0 bg-white border-b border-slate-100 z-10 no-print">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communication Passport</p>
            <h2 className="text-xl font-black text-slate-800">How to Support {childProfile.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer hover:bg-slate-900 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => setShowPassportModal(false)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div ref={printRef} className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-4">
          {/* Identity Card */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl">🪪</div>
              <div>
                <h3 className="text-2xl font-black">{childProfile.name}</h3>
                <p className="text-indigo-200 text-sm font-medium">Communication Passport</p>
                <p className="text-xs text-white/60 mt-0.5">Please read before interacting</p>
              </div>
            </div>
          </div>

          {/* Communication Style */}
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💬</span>
              <span className="font-black text-sm text-slate-800">How I Communicate</span>
            </div>
            <textarea
              value={communicationPassport.communicationStyle}
              onChange={(e) => updateCommunicationPassport({ communicationStyle: e.target.value })}
              className="w-full bg-white/80 border border-blue-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 resize-none"
              rows={3}
              placeholder="Describe your communication style..."
            />
          </div>

          <SectionCard
            title="What Overwhelms Me (Sensory Triggers)"
            emoji="⚡"
            sectionKey="sensoryTriggers"
            items={communicationPassport.sensoryTriggers}
            bg="bg-red-50"
            border="border-red-200"
          />

          <SectionCard
            title="What Helps Me"
            emoji="💚"
            sectionKey="whatHelps"
            items={communicationPassport.whatHelps}
            bg="bg-green-50"
            border="border-green-200"
          />

          <SectionCard
            title="My Special Interests"
            emoji="⭐"
            sectionKey="specialInterests"
            items={communicationPassport.specialInterests}
            bg="bg-amber-50"
            border="border-amber-200"
          />

          <SectionCard
            title="My Comfort Items"
            emoji="🧸"
            sectionKey="comfortItems"
            items={communicationPassport.comfortItems}
            bg="bg-purple-50"
            border="border-purple-200"
          />

          {/* Emergency Note */}
          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🚨</span>
              <span className="font-black text-sm text-slate-800">Emergency Note</span>
            </div>
            <textarea
              value={communicationPassport.emergencyNote || ''}
              onChange={(e) => updateCommunicationPassport({ emergencyNote: e.target.value })}
              className="w-full bg-white/80 border border-rose-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 resize-none"
              rows={2}
              placeholder="e.g. If overwhelmed, please call Mom: 555-1234"
            />
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 py-2">
            Created with BeeYou — Neurodivergent Support App
          </div>
        </div>
      </div>
    </>
  );
};
