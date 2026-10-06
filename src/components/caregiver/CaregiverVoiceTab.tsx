import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  rateVoiceNaturalness,
  isVoiceFluid,
  speakText,
  getBestSystemVoice,
  stopSpeaking as haltSpeaking,
  playChime
} from '../../utils/audio';
import { Volume2, Sparkles, Mic, Check } from 'lucide-react';

interface CaregiverVoiceTabProps {
  onShowNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverVoiceTab: React.FC<CaregiverVoiceTabProps> = ({ 
  onShowNotification,
  onStartTour,
}) => {
  const {
    settings,
    updateSettings,
    speak,
    offlineVoices,
  } = useApp();

  const [voiceTestText, setVoiceTestText] = useState('I want pizza please.');
  const [auditioningVoiceURI, setAuditioningVoiceURI] = useState<string | null>(null);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [onlyFluidVoices, setOnlyFluidVoices] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-600" />
            <span>Voice Settings & Testing Tool</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Test and compare all available system voices on this device with real AAC phrases to choose the most natural, fluid voice for your child.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <span>💡 How This Works</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const best = getBestSystemVoice(settings.language);
              if (best) {
                updateSettings({ selectedVoiceURI: best.voiceURI, voicePersona: 'system' });
                onShowNotification(`Auto-selected "${best.name}" (Highest Naturalness Rating)!`);
              } else {
                updateSettings({ selectedVoiceURI: '', voicePersona: 'system' });
                onShowNotification('Set to auto-prioritize most fluid voice.');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Pick Most Natural Voice</span>
          </button>
        </div>
      </div>

      {/* 1. CURRENTLY ACTIVE VOICE CARD */}
      <div data-tour="voice-active-card" className="bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 border-2 border-indigo-200 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Active AAC Vocalizer
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
            Offline Ready
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>{settings.selectedVoiceURI ? (offlineVoices.find(v => v.voiceURI === settings.selectedVoiceURI)?.name || settings.selectedVoiceURI) : (settings.voicePersona ? `Neural Voice (${settings.voicePersona})` : 'Auto-Selected Best Natural Voice')}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                Active
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Pacing: <strong>{settings.voiceRate.toFixed(2)}x</strong> • Natural Pitch: <strong>{settings.voicePitch.toFixed(2)}</strong> • Language: <strong>{settings.language.toUpperCase()}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                speak('I want pizza please.');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Active Voice</span>
            </button>
            <button
              type="button"
              onClick={() => haltSpeaking()}
              className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Stop
            </button>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE TESTING SANDBOX */}
      <div data-tour="voice-pitch-rate-controls" className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-sky-600" />
            <span>Interactive Phrase Testing Sandbox</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Type any word or pick a preset</span>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">
            Phrase to Test:
          </label>
          <input
            type="text"
            value={voiceTestText}
            onChange={(e) => setVoiceTestText(e.target.value)}
            placeholder="Type words to test (e.g. I want pizza please)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Quick Presets:</span>
          {[
            'I want pizza please.',
            'I need a break.',
            'Can you help me please?',
            'Good morning, how are you today?',
            'I am happy and ready to play.',
            'Something hurts.',
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setVoiceTestText(preset);
                playChime('tap');
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Sliders: Pacing and Pitch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Pacing / Speed: {settings.voiceRate.toFixed(2)}x</span>
              <span className="text-[10px] text-slate-400 font-normal">0.96x is conversational</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.02"
              value={settings.voiceRate}
              onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Natural Pitch: {settings.voicePitch.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 font-normal">1.0 avoids metallic pitch</span>
            </div>
            <input
              type="range"
              min="0.9"
              max="1.15"
              step="0.02"
              value={settings.voicePitch}
              onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. ALL AVAILABLE SYSTEM VOICES */}
      <div data-tour="voice-library-list" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              All Available System Voices ({offlineVoices.length} Found)
            </h3>
            <p className="text-xs text-slate-500">
              Click the <strong>"Test"</strong> button on any voice to audition how it sounds with your test phrase.
            </p>
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={voiceSearchQuery}
              onChange={(e) => setVoiceSearchQuery(e.target.value)}
              placeholder="Search voice name..."
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold w-40"
            />

            <button
              type="button"
              onClick={() => setOnlyFluidVoices(!onlyFluidVoices)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                onlyFluidVoices
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              🌟 Natural / Fluid Only
            </button>
          </div>
        </div>

        {/* Voice list cards */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {offlineVoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              Querying system voices from device... (If none appear, click Test to initialize browser speech)
            </div>
          ) : (
            offlineVoices
              .filter((v) => {
                if (voiceSearchQuery.trim()) {
                  return v.name.toLowerCase().includes(voiceSearchQuery.toLowerCase());
                }
                if (onlyFluidVoices) {
                  return isVoiceFluid(v);
                }
                return true;
              })
              .map((voice) => {
                const isFluid = isVoiceFluid(voice);
                const score = rateVoiceNaturalness(voice);
                const isSelected = settings.selectedVoiceURI === voice.voiceURI;
                const isAuditioning = auditioningVoiceURI === voice.voiceURI;

                return (
                  <div
                    key={voice.voiceURI}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-black text-sm text-slate-800">
                          {voice.name}
                        </span>
                        {isFluid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                            🌟 Fluid Human Voice
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Standard Voice
                          </span>
                        )}
                        {voice.localService && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            100% Offline
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-medium block mt-0.5">
                        Language: <strong>{voice.lang}</strong> • Naturalness Rating: <strong>{score}</strong>
                      </span>
                    </div>

                    {/* Action Buttons: TEST and SELECT */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setAuditioningVoiceURI(voice.voiceURI);
                          speakText(voiceTestText, {
                            voiceURI: voice.voiceURI,
                            preferOfflineOnly: true,
                            rate: settings.voiceRate,
                            pitch: settings.voicePitch,
                          });
                          setTimeout(() => setAuditioningVoiceURI(null), 3000);
                        }}
                        className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                          isAuditioning
                            ? 'bg-amber-400 text-amber-950 animate-pulse ring-2 ring-amber-400'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                        title={`Test ${voice.name}`}
                      >
                        <Volume2 className="w-4 h-4 text-indigo-600" />
                        <span>{isAuditioning ? 'Playing...' : 'Test'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateSettings({
                            selectedVoiceURI: voice.voiceURI,
                            voicePersona: 'system',
                          });
                          onShowNotification(`Voice "${voice.name}" selected for child's AAC!`);
                        }}
                        className={`px-4 py-2 rounded-xl font-black text-xs transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <span>Select for AAC</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};
