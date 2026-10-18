import React, { useState } from 'react';
import { 
  Star, 
  Search, 
  Plus, 
  Check, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Edit3, 
  Heart,
  ShieldCheck,
  Filter,
  Lightbulb
} from 'lucide-react';
import { RoutineTemplate, Routine } from '../types';
import { PREBUILT_ROUTINE_TEMPLATES } from '../data/routineTemplates';
import { playChime } from '../utils/audio';
import { RoutineStickerIcon, TurtleWebbedPawStampSticker } from './icons/JournalStickers';
import { useApp } from '../context/AppContext';

interface RoutineTemplatesLibraryProps {
  onQuickImport: (template: RoutineTemplate) => void;
  onCustomizeTemplate: (template: RoutineTemplate) => void;
  existingRoutineTitles: string[];
}

export const RoutineTemplatesLibrary: React.FC<RoutineTemplatesLibraryProps> = ({
  onQuickImport,
  onCustomizeTemplate,
  existingRoutineTitles,
}) => {
  const { activeTheme } = useApp();
  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';
  const isDinoTheme = activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino';
  const isFrogTheme = activeTheme?.category === 'frog' || activeTheme?.id === 'theme-frog';

  const activeThemeCategory: NonNullable<RoutineTemplate['themeCategory']> =
    isTurtleTheme
      ? 'turtle'
      : isDinoTheme
        ? 'dinosaur'
        : isFrogTheme
          ? 'frog'
          : activeTheme?.category === 'train' || activeTheme?.id === 'theme-trains'
            ? 'train'
            : activeTheme?.category === 'space' || activeTheme?.id === 'theme-space'
              ? 'space'
              : activeTheme?.category === 'ocean' || activeTheme?.id === 'theme-ocean'
                ? 'ocean'
                : activeTheme?.category === 'fantasy' || activeTheme?.id === 'theme-fantasy'
                  ? 'fantasy'
                  : activeTheme?.category === 'racing' || activeTheme?.id === 'theme-racing'
                    ? 'racing'
                    : 'classic';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  const SPECIAL_PILL_BY_THEME: Record<string, { label: string; emoji: string }> = {
    turtle: { label: 'Wise Turtle Sanctuary', emoji: '🐢' },
    dinosaur: { label: 'Dino Kingdom', emoji: '🦖' },
    frog: { label: 'Ribbit Pond', emoji: '🐸' },
    train: { label: 'Steam Express', emoji: '🚂' },
    space: { label: 'Cosmic Explorer', emoji: '🚀' },
    ocean: { label: 'Ocean Splash', emoji: '🐬' },
    fantasy: { label: 'Magic Fairytale', emoji: '🦄' },
    racing: { label: 'Turbo Speedway', emoji: '🏎️' },
  };

  const activeSpecialPill = SPECIAL_PILL_BY_THEME[activeThemeCategory];

  const categories = [
    { id: 'all', label: 'All Templates', emoji: activeSpecialPill?.emoji || '⭐' },
    ...(activeSpecialPill ? [{ id: 'special', label: activeSpecialPill.label, emoji: activeSpecialPill.emoji }] : []),
    { id: 'morning', label: 'Morning', emoji: '🌅' },
    { id: 'school', label: 'School Day', emoji: '🏫' },
    { id: 'bedtime', label: 'Bedtime', emoji: '🌙' },
    { id: 'after-school', label: 'After-School', emoji: '🎒' },
    { id: 'appointment', label: 'Appointments & Therapy', emoji: '🦷' },
    { id: 'work', label: 'Work & Focus', emoji: '💼' },
    { id: 'custom', label: 'Outings & Weekends', emoji: '🛒' },
  ];

  const filteredTemplates = PREBUILT_ROUTINE_TEMPLATES.filter((tmpl) => {
    // Only include the special themed routine that matches the user's active theme
    if (tmpl.category === 'special' && tmpl.themeCategory !== activeThemeCategory) {
      return false;
    }
    const matchesCategory = selectedCategory === 'all' || tmpl.category === selectedCategory;
    const matchesSearch = 
      tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tmpl.recommendedFor && tmpl.recommendedFor.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedTemplateId(prev => prev === id ? null : id);
    playChime('tap');
  };

  return (
    <div className={`border-2 rounded-3xl p-5 sm:p-6 space-y-5 transition-all ${
      isTurtleTheme
        ? 'bg-gradient-to-b from-emerald-50/70 via-white to-teal-50/30 border-emerald-300 shadow-[0_4px_20px_rgba(5,150,105,0.08)]'
        : isDinoTheme
          ? 'bg-gradient-to-b from-green-50/70 via-white to-amber-50/30 border-green-400 shadow-[0_4px_20px_rgba(22,163,74,0.08)]'
          : isFrogTheme
            ? 'bg-gradient-to-b from-lime-50/70 via-white to-teal-50/30 border-lime-400 shadow-[0_4px_20px_rgba(101,163,13,0.08)]'
            : `${activeTheme?.palette?.primaryLight || 'bg-gradient-to-b from-amber-50/60 to-white'} ${activeTheme?.palette?.primaryBorder || 'border-amber-200/90'}`
    }`}>
      {/* Section Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
        isTurtleTheme ? 'border-emerald-200/80' : isDinoTheme ? 'border-green-200/80' : isFrogTheme ? 'border-lime-200/80' : 'border-amber-100'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-black shadow-xs p-1 ${
              isTurtleTheme
                ? 'bg-emerald-600'
                : isDinoTheme
                  ? 'bg-green-600'
                  : isFrogTheme
                    ? 'bg-lime-600'
                    : (activeTheme?.palette?.primaryBg || 'bg-amber-500')
            }`}>
              {isTurtleTheme ? (
                <TurtleWebbedPawStampSticker className="w-7 h-7 object-contain" />
              ) : activeSpecialPill ? (
                <RoutineStickerIcon emoji={activeSpecialPill.emoji} title={activeSpecialPill.label} className="w-7 h-7 object-contain" />
              ) : (
                <Star className="w-5 h-5" />
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {activeSpecialPill
                ? `${activeSpecialPill.label} Routine Library`
                : 'Pre-Built Routine Templates Library'}
            </h3>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {isTurtleTheme
              ? 'Clinically backed, slow & sensory-paced schedules for peaceful mornings, mindful transitions, and turtle lagoon decompression.'
              : isDinoTheme
                ? 'Clinically backed, sensory-friendly prehistoric routines for adventurous mornings, structured transitions, and calm dinosaur energy regulation.'
                : isFrogTheme
                  ? 'Clinically backed, gentle sensory-paced routines for peaceful pond mornings, mindful lily pad transitions, and evening reflection.'
                  : 'Clinically backed, sensory-friendly schedules for Morning, School, Bedtime, Therapy, and Outings. Import with 1 tap or customize for your child.'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl bg-white border font-bold text-xs text-slate-800 placeholder:font-normal placeholder:text-slate-400 ${
              isTurtleTheme
                ? 'border-emerald-200 focus:outline-emerald-500 focus:border-emerald-400'
                : isDinoTheme
                  ? 'border-green-200 focus:outline-green-500 focus:border-green-400'
                  : isFrogTheme
                    ? 'border-lime-300 focus:outline-lime-500 focus:border-lime-400'
                    : 'border-slate-300 focus:outline-amber-500 focus:border-amber-400'
            }`}
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                playChime('tap');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                isActive
                  ? isTurtleTheme
                    ? 'bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-600/30'
                    : isDinoTheme
                      ? 'bg-green-600 text-white shadow-xs scale-102 ring-2 ring-green-600/30'
                      : isFrogTheme
                        ? 'bg-lime-600 text-white shadow-xs scale-102 ring-2 ring-lime-600/30'
                        : `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-xs scale-102`
                  : isTurtleTheme
                    ? 'bg-white text-slate-700 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300'
                    : isDinoTheme
                      ? 'bg-white text-slate-700 hover:bg-green-50/70 border border-slate-200 hover:border-green-300'
                      : isFrogTheme
                        ? 'bg-white text-slate-700 hover:bg-lime-50/70 border border-slate-200 hover:border-lime-300'
                        : 'bg-white text-slate-600 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300'
              }`}
            >
              <RoutineStickerIcon emoji={cat.emoji} title={cat.label} className="w-4 h-4 object-contain" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const isAlreadyImported = existingRoutineTitles.some(
            (t) => t.toLowerCase() === template.title.toLowerCase()
          );
          const isExpanded = expandedTemplateId === template.id;

          return (
            <div
              key={template.id}
              className={`bg-white rounded-2xl border-2 transition-all shadow-xs flex flex-col justify-between ${
                isAlreadyImported 
                  ? isTurtleTheme
                    ? 'border-emerald-300 ring-2 ring-emerald-400/40 bg-emerald-50/20'
                    : isDinoTheme
                      ? 'border-green-300 ring-2 ring-green-400/40 bg-green-50/20'
                      : isFrogTheme
                        ? 'border-lime-400 ring-2 ring-lime-400/40 bg-lime-50/20'
                        : 'border-emerald-200 ring-1 ring-emerald-300/60 bg-emerald-50/10' 
                  : isTurtleTheme
                    ? 'border-emerald-200/90 hover:border-emerald-400 hover:shadow-md'
                    : isDinoTheme
                      ? 'border-green-200/90 hover:border-green-400 hover:shadow-md'
                      : isFrogTheme
                        ? 'border-lime-200/90 hover:border-lime-400 hover:shadow-md'
                        : 'border-slate-200 hover:border-amber-400 hover:shadow-md'
              }`}
            >
              <div className="p-4 sm:p-5 space-y-3">
                {/* Top Badge Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-12 h-12 p-1 rounded-2xl border flex items-center justify-center shrink-0 ${
                      isTurtleTheme
                        ? 'bg-emerald-50 border-emerald-200'
                        : isDinoTheme
                          ? 'bg-green-50 border-green-200'
                          : isFrogTheme
                            ? 'bg-lime-50 border-lime-300'
                            : 'bg-amber-50 border-amber-200/80'
                    }`}>
                      <RoutineStickerIcon emoji={template.emoji} title={template.title} className="w-9 h-9 object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base">
                          {template.title}
                        </h4>
                        {isAlreadyImported && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                            isFrogTheme ? 'bg-lime-100 text-lime-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            <Check className="w-3 h-3" />
                            Added
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-0.5">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className={`w-3 h-3 ${isTurtleTheme ? 'text-emerald-700' : isDinoTheme ? 'text-green-700' : isFrogTheme ? 'text-lime-700' : 'text-amber-600'}`} />
                          {template.time || 'Flexible'}
                        </span>
                        <span>•</span>
                        <span className="capitalize text-slate-600">
                          {template.steps.length} visual steps
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {template.description}
                </p>

                {/* Recommended For pill */}
                {template.recommendedFor && (
                  <div className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                    isTurtleTheme
                      ? 'text-emerald-950 bg-emerald-50/80 border-emerald-200'
                      : isFrogTheme
                        ? 'text-lime-950 bg-lime-50/80 border-lime-200'
                        : 'text-teal-800 bg-teal-50 border-teal-200/60'
                  }`}>
                    <Lightbulb className={`w-3.5 h-3.5 shrink-0 ${isTurtleTheme ? 'text-emerald-700' : isFrogTheme ? 'text-lime-700' : 'text-teal-600'}`} />
                    <span><strong>Best for:</strong> {template.recommendedFor}</span>
                  </div>
                )}

                {/* First / Then Preview */}
                {template.firstThen && (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isTurtleTheme
                      ? 'bg-emerald-50/60 border-emerald-200/80'
                      : isFrogTheme
                        ? 'bg-lime-50/70 border-lime-200/80'
                        : 'bg-indigo-50/70 border-indigo-200/70'
                  }`}>
                    <div className={`flex items-center gap-1.5 font-bold truncate ${
                      isTurtleTheme ? 'text-emerald-950' : isFrogTheme ? 'text-lime-950' : 'text-indigo-950'
                    }`}>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        isTurtleTheme ? 'bg-emerald-200 text-emerald-950' : isFrogTheme ? 'bg-lime-200 text-lime-950' : 'bg-indigo-200 text-indigo-900'
                      }`}>
                        First
                      </span>
                      <RoutineStickerIcon emoji={template.firstThen.firstEmoji} title={template.firstThen.first} className="w-4 h-4 shrink-0 object-contain" />
                      <span className="truncate">{template.firstThen.first}</span>
                    </div>
                    <span className={`font-bold px-1 ${isTurtleTheme ? 'text-emerald-600' : isFrogTheme ? 'text-lime-600' : 'text-indigo-400'}`}>→</span>
                    <div className={`flex items-center gap-1.5 font-bold truncate ${
                      isTurtleTheme ? 'text-teal-950' : isFrogTheme ? 'text-teal-950' : 'text-purple-950'
                    }`}>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        isTurtleTheme ? 'bg-teal-200 text-teal-950' : isFrogTheme ? 'bg-teal-200 text-teal-950' : 'bg-purple-200 text-purple-900'
                      }`}>
                        Then
                      </span>
                      <RoutineStickerIcon emoji={template.firstThen.thenEmoji} title={template.firstThen.then} className="w-4 h-4 shrink-0 object-contain" />
                      <span className="truncate">{template.firstThen.then}</span>
                    </div>
                  </div>
                )}

                {/* Steps Details Expansion */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Sequence Breakdown:
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {template.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border flex items-start gap-2 text-xs ${
                            isTurtleTheme ? 'bg-emerald-50/30 border-emerald-100' : isFrogTheme ? 'bg-lime-50/30 border-lime-100' : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 ${
                            isTurtleTheme ? 'bg-emerald-100 text-emerald-900' : isFrogTheme ? 'bg-lime-100 text-lime-900' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className={`w-7 h-7 flex items-center justify-center shrink-0 rounded-lg border p-0.5 shadow-2xs ${
                            isTurtleTheme ? 'bg-white border-emerald-200' : isFrogTheme ? 'bg-white border-lime-200' : 'bg-white border-slate-200'
                          }`}>
                            <RoutineStickerIcon emoji={st.emoji} title={st.title} className="w-5 h-5 object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800">{st.title}</div>
                            {st.instruction && (
                              <p className="text-[11px] text-slate-500 font-medium">{st.instruction}</p>
                            )}
                            {st.sensoryNote && (
                              <p className={`text-[10px] italic mt-0.5 ${
                                isTurtleTheme ? 'text-emerald-800' : isFrogTheme ? 'text-lime-800' : 'text-teal-700'
                              }`}>
                                💡 {st.sensoryNote}
                              </p>
                            )}
                          </div>
                          {st.durationMin && (
                            <span className="text-[10px] font-bold text-slate-400 shrink-0">
                              {st.durationMin}m
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className={`p-3 border-t rounded-b-2xl flex items-center justify-between gap-2 ${
                isTurtleTheme
                  ? 'bg-emerald-50/40 border-emerald-100'
                  : isDinoTheme
                    ? 'bg-green-50/40 border-green-100'
                    : isFrogTheme
                      ? 'bg-lime-50/40 border-lime-100'
                      : 'bg-slate-50 border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => toggleExpand(template.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    isTurtleTheme
                      ? 'text-emerald-900 hover:text-emerald-950 hover:bg-emerald-100/50'
                      : isDinoTheme
                        ? 'text-green-900 hover:text-green-950 hover:bg-green-100/50'
                        : isFrogTheme
                          ? 'text-lime-900 hover:text-lime-950 hover:bg-lime-100/50'
                          : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{isExpanded ? 'Hide Steps' : 'Preview Steps'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onCustomizeTemplate(template);
                      playChime('tap');
                    }}
                    className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      isTurtleTheme
                        ? 'bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-950'
                        : isDinoTheme
                          ? 'bg-white hover:bg-green-50 border-green-200 text-green-950'
                          : isFrogTheme
                            ? 'bg-white hover:bg-lime-50 border-lime-300 text-lime-950'
                            : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                    title="Customize steps, times, and First/Then before importing"
                  >
                    <Edit3 className={`w-3.5 h-3.5 ${isTurtleTheme ? 'text-emerald-700' : isDinoTheme ? 'text-green-700' : isFrogTheme ? 'text-lime-700' : 'text-amber-600'}`} />
                    <span>Customize</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onQuickImport(template);
                      playChime('star');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer ${
                      isAlreadyImported
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : isTurtleTheme
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-200'
                          : isDinoTheme
                            ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-amber-600 hover:from-green-700 hover:to-amber-700 text-white shadow-green-200'
                            : isFrogTheme
                              ? 'bg-gradient-to-r from-lime-600 via-emerald-600 to-teal-600 hover:from-lime-700 hover:to-teal-700 text-white shadow-lime-200'
                              : `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} ${activeTheme?.palette?.primaryHover || 'hover:bg-amber-600'} text-white`
                    }`}
                    title="Add directly to child active routines"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isAlreadyImported ? 'Import Again' : '1-Tap Import'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <span className="text-3xl">🔍</span>
            <h5 className="font-black text-slate-800 text-sm">No routine templates found</h5>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or selecting another category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
