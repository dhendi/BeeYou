import React, { useState } from 'react';
import { 
  Sparkles, 
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Templates', emoji: '✨' },
    { id: 'morning', label: 'Morning', emoji: '🌅' },
    { id: 'school', label: 'School Day', emoji: '🏫' },
    { id: 'bedtime', label: 'Bedtime', emoji: '🌙' },
    { id: 'after-school', label: 'After-School', emoji: '🎒' },
    { id: 'appointment', label: 'Appointments & Therapy', emoji: '🦷' },
    { id: 'custom', label: 'Outings & Weekends', emoji: '🛒' },
  ];

  const filteredTemplates = PREBUILT_ROUTINE_TEMPLATES.filter((tmpl) => {
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
    <div className="bg-gradient-to-b from-sky-50/60 to-white border-2 border-sky-200 rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Pre-Built Routine Templates Library
            </h3>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Clinically backed, sensory-friendly schedules for Morning, School, Bedtime, Therapy, and Outings. 
            Import with 1 tap or customize for your child.
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
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-sky-500"
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
                  ? 'bg-sky-600 text-white shadow-xs scale-102'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cat.emoji}</span>
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
                  ? 'border-emerald-200 ring-1 ring-emerald-300/60 bg-emerald-50/10' 
                  : 'border-slate-200 hover:border-sky-300 hover:shadow-md'
              }`}
            >
              <div className="p-4 sm:p-5 space-y-3">
                {/* Top Badge Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-2 bg-sky-50 rounded-2xl border border-sky-100 shrink-0">
                      {template.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base">
                          {template.title}
                        </h4>
                        {isAlreadyImported && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Added
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-0.5">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3 h-3 text-sky-600" />
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
                  <div className="text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span><strong>Best for:</strong> {template.recommendedFor}</span>
                  </div>
                )}

                {/* First / Then Preview */}
                {template.firstThen && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-950 font-bold truncate">
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-200 text-indigo-900 text-[10px] font-black uppercase">
                        First
                      </span>
                      <span className="truncate">{template.firstThen.firstEmoji} {template.firstThen.first}</span>
                    </div>
                    <span className="text-indigo-400 font-bold px-1">→</span>
                    <div className="flex items-center gap-1.5 text-purple-950 font-bold truncate">
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-200 text-purple-900 text-[10px] font-black uppercase">
                        Then
                      </span>
                      <span className="truncate">{template.firstThen.thenEmoji} {template.firstThen.then}</span>
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
                          className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-base shrink-0">{st.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800">{st.title}</div>
                            {st.instruction && (
                              <p className="text-[11px] text-slate-500 font-medium">{st.instruction}</p>
                            )}
                            {st.sensoryNote && (
                              <p className="text-[10px] text-teal-700 italic mt-0.5">
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
              <div className="p-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(template.id)}
                  className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
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
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    title="Customize steps, times, and First/Then before importing"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-sky-600" />
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
                        : 'bg-sky-600 hover:bg-sky-700 text-white'
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
