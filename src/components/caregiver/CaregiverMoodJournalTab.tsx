import React from 'react';
import { useApp } from '../../context/AppContext';
import { MOOD_META, TRIGGER_META, COPING_META } from '../../data/defaultData';
import { playChime } from '../../utils/audio';
import { Plus, Trash2, AlertTriangle, Lock } from 'lucide-react';

export const CaregiverMoodJournalTab: React.FC = () => {
  const {
    enabledFeatures,
    toggleFeature,
    moodJournalEntries,
    deleteMoodJournalEntry,
    setShowMoodJournalModal,
  } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <span>Mood Journal & Self-Reflection Hub</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Designed for teens and adults. Tracks emotional intensity, energy levels, sensory distress, triggers, and neurodivergent coping strategies.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowMoodJournalModal(true);
            playChime('tap');
          }}
          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Open Mood Journal Studio</span>
        </button>
      </div>

      {/* Feature Active / Inactive Banner */}
      {enabledFeatures?.moodJournal === false && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-black text-amber-900">
                Mood Journal is currently turned off for this profile.
              </p>
              <p className="text-[11px] text-amber-800">
                Enable it in Feature Controls to display in the user's header and feelings tab.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              toggleFeature('moodJournal');
              playChime('star');
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 cursor-pointer"
          >
            Enable Feature
          </button>
        </div>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-purple-700 block">Total Reflections</span>
          <span className="text-2xl font-black text-purple-950 mt-1 block">{moodJournalEntries.length}</span>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-slate-500 block">Private Entries</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {moodJournalEntries.filter((e) => e.isPrivate).length}
          </span>
        </div>
        <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-sky-700 block">Average Energy</span>
          <span className="text-2xl font-black text-sky-950 mt-1 block">
            {moodJournalEntries.length > 0
              ? (moodJournalEntries.reduce((acc, e) => acc + e.energyLevel, 0) / moodJournalEntries.length).toFixed(1)
              : '-'}
            /10
          </span>
        </div>
        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-rose-700 block">Avg Sensory Load</span>
          <span className="text-2xl font-black text-rose-950 mt-1 block">
            {moodJournalEntries.length > 0
              ? (moodJournalEntries.reduce((acc, e) => acc + e.sensoryDistress, 0) / moodJournalEntries.length).toFixed(1)
              : '-'}
            /10
          </span>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          Logged Reflections History
        </h3>

        {moodJournalEntries.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-2">
            <span className="text-3xl block">📖</span>
            <p className="text-xs font-bold text-slate-600">No reflections logged yet</p>
            <p className="text-[11px] text-slate-400">
              When the user reflects on their emotions and sensory experiences, entries will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {moodJournalEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-purple-200 transition-colors shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-purple-50">
                      {MOOD_META[entry.primaryMood]?.emoji || '💭'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {MOOD_META[entry.primaryMood]?.label || entry.primaryMood}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          Intensity: {entry.moodIntensity}/10
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          Energy: {entry.energyLevel}/5
                        </span>
                        {entry.sensoryDistress > 50 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            Sensory: {entry.sensoryDistress}%
                          </span>
                        )}
                        {entry.isPrivate && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> Private
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        deleteMoodJournalEntry(entry.id);
                        playChime('tap');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-2 rounded-xl cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {(entry.journalText || entry.gratitudeOrWin) && (
                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700">
                    {entry.gratitudeOrWin && (
                      <p className="font-bold text-purple-900 text-[11px] mb-0.5">
                        Anchor: "{entry.gratitudeOrWin}"
                      </p>
                    )}
                    <p className="whitespace-pre-line">{entry.journalText}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {entry.triggers.map((t) => (
                    <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      {TRIGGER_META[t] ? `${TRIGGER_META[t].emoji} ${TRIGGER_META[t].label}` : `⚡ ${t}`}
                    </span>
                  ))}
                  {entry.copingStrategies.map((c) => (
                    <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-900 border border-teal-200">
                      {COPING_META[c] ? `${COPING_META[c].emoji} ${COPING_META[c].label}` : `🛠️ ${c}`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
