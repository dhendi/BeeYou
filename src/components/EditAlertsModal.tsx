import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  RotateCcw, 
  Bell, 
  Volume2, 
  Smartphone, 
  VolumeX, 
  Check, 
  MessageSquare, 
  ShieldAlert, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { HelpAlertPreset, CaregiverResponsePreset } from '../types';
import { playChime } from '../utils/audio';

export const EditAlertsModal: React.FC = () => {
  const {
    showEditAlertsModal,
    setShowEditAlertsModal,
    helpAlertPresets,
    addHelpAlertPreset,
    updateHelpAlertPreset,
    deleteHelpAlertPreset,
    resetHelpAlertPresets,
    caregiverResponses,
    addCaregiverResponse,
    updateCaregiverResponse,
    deleteCaregiverResponse,
    resetCaregiverResponses,
    settings,
    updateSettings,
    speak,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'alerts' | 'responses' | 'channels'>('alerts');
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);

  // New alert form state
  const [newAlert, setNewAlert] = useState<Omit<HelpAlertPreset, 'id'>>({
    label: '',
    sublabel: '',
    emoji: '🆘',
    colorClass: 'text-rose-900',
    borderClass: 'border-rose-400 hover:border-rose-500 bg-rose-50 hover:bg-rose-100',
    ttsAnnouncement: '',
    priority: 'high',
  });
  const [showAddAlertForm, setShowAddAlertForm] = useState(false);

  // New response form state
  const [newResponse, setNewResponse] = useState<Omit<CaregiverResponsePreset, 'id'>>({
    label: '',
    text: '',
    emoji: '❤️',
  });
  const [showAddResponseForm, setShowAddResponseForm] = useState(false);

  if (!showEditAlertsModal) return null;

  const handleSaveNewAlert = () => {
    if (!newAlert.label.trim()) return;
    addHelpAlertPreset({
      ...newAlert,
      ttsAnnouncement: newAlert.ttsAnnouncement.trim() || `I sent an alert: ${newAlert.label}`,
    });
    setNewAlert({
      label: '',
      sublabel: '',
      emoji: '🆘',
      colorClass: 'text-rose-900',
      borderClass: 'border-rose-400 hover:border-rose-500 bg-rose-50 hover:bg-rose-100',
      ttsAnnouncement: '',
      priority: 'high',
    });
    setShowAddAlertForm(false);
  };

  const handleSaveNewResponse = () => {
    if (!newResponse.label.trim()) return;
    addCaregiverResponse({
      ...newResponse,
      text: newResponse.text.trim() || newResponse.label,
    });
    setNewResponse({
      label: '',
      text: '',
      emoji: '❤️',
    });
    setShowAddResponseForm(false);
  };

  return (
    <div className="fixed inset-0 z-[220] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customization</p>
              <h2 className="text-xl font-black text-slate-800">Customize Alerts & Help</h2>
            </div>
          </div>
          <button
            onClick={() => setShowEditAlertsModal(false)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50">
          {[
            { id: 'alerts' as const, label: 'Alert Buttons', icon: ShieldAlert, count: helpAlertPresets.length },
            { id: 'responses' as const, label: 'Caregiver Replies', icon: MessageSquare, count: caregiverResponses.length },
            { id: 'channels' as const, label: 'Alert Channels & Sound', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); playChime('tap'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: HELP ALERT PRESETS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">
                  Manage the alert cards displayed when the user presses "I Need Help"
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { resetHelpAlertPresets(); playChime('complete'); }}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                  <button
                    onClick={() => setShowAddAlertForm(!showAddAlertForm)}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Alert Card
                  </button>
                </div>
              </div>

              {/* Add New Alert Form */}
              {showAddAlertForm && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 animate-in fade-in">
                  <h3 className="text-xs font-black text-rose-900 uppercase tracking-wider">New Help Alert Card</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Alert Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Too Loud / Sensory Break"
                        value={newAlert.label}
                        onChange={(e) => setNewAlert({ ...newAlert, label: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Emoji Icon</label>
                      <input
                        type="text"
                        placeholder="e.g. 🎧, 🛑, 😣"
                        value={newAlert.emoji}
                        onChange={(e) => setNewAlert({ ...newAlert, emoji: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-rose-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Sublabel (Helpful description)</label>
                      <input
                        type="text"
                        placeholder="e.g. Needs noise headphones or a quiet corner"
                        value={newAlert.sublabel}
                        onChange={(e) => setNewAlert({ ...newAlert, sublabel: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-rose-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Spoken Audio Announcement (TTS)</label>
                      <input
                        type="text"
                        placeholder="e.g. I sent an alert that the environment is too loud."
                        value={newAlert.ttsAnnouncement}
                        onChange={(e) => setNewAlert({ ...newAlert, ttsAnnouncement: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-rose-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowAddAlertForm(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNewAlert}
                      disabled={!newAlert.label.trim()}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white cursor-pointer"
                    >
                      Save Alert
                    </button>
                  </div>
                </div>
              )}

              {/* Alert List */}
              <div className="space-y-2.5">
                {helpAlertPresets.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl p-2 rounded-xl bg-slate-100 flex-shrink-0">{alert.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-800 truncate">{alert.label}</p>
                          {alert.isCustom && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-black">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{alert.sublabel || alert.ttsAnnouncement}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => speak(alert.ttsAnnouncement || alert.label)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                        title="Listen to announcement"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteHelpAlertPreset(alert.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer"
                        title="Delete alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CAREGIVER REPLIES */}
          {activeTab === 'responses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">
                  Predefined quick responses caregivers can tap when acknowledging an alert
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { resetCaregiverResponses(); playChime('complete'); }}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                  <button
                    onClick={() => setShowAddResponseForm(!showAddResponseForm)}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Response
                  </button>
                </div>
              </div>

              {/* Add New Response Form */}
              {showAddResponseForm && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 animate-in fade-in">
                  <h3 className="text-xs font-black text-rose-900 uppercase tracking-wider">New Caregiver Response</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Button Label *</label>
                      <input
                        type="text"
                        placeholder="e.g. Taking a quick call"
                        value={newResponse.label}
                        onChange={(e) => setNewResponse({ ...newResponse, label: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Emoji Icon</label>
                      <input
                        type="text"
                        placeholder="e.g. 🚗, ⏳, ❤️"
                        value={newResponse.emoji}
                        onChange={(e) => setNewResponse({ ...newResponse, emoji: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-rose-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Sent Text Message</label>
                      <input
                        type="text"
                        placeholder="e.g. I will be right there in 2 minutes ❤️"
                        value={newResponse.text}
                        onChange={(e) => setNewResponse({ ...newResponse, text: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-rose-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowAddResponseForm(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNewResponse}
                      disabled={!newResponse.label.trim()}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white cursor-pointer"
                    >
                      Save Response
                    </button>
                  </div>
                </div>
              )}

              {/* Response List */}
              <div className="space-y-2.5">
                {caregiverResponses.map((resp) => (
                  <div
                    key={resp.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl p-2 rounded-xl bg-slate-100 flex-shrink-0">{resp.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-800 truncate">{resp.label}</p>
                          {resp.isCustom && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-black">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">"{resp.text}"</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => deleteCaregiverResponse(resp.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer"
                        title="Delete response"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ALERT CHANNELS & SOUNDS */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500">
                Configure how alerts and caregiver responses are announced on this device
              </p>

              <div className="space-y-3">
                {/* Visual Alerts */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-800">Visual Screen Flashes & Banner</p>
                    <p className="text-xs text-slate-500">Prominent colored banners and calming pulsing animations</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ visualAlerts: !(settings.visualAlerts ?? true) })}
                    className={`w-12 h-7 rounded-full p-1 transition-all cursor-pointer flex items-center ${
                      (settings.visualAlerts ?? true) ? 'bg-rose-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Sound Alerts */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-800">Sound Effects & Chimes</p>
                    <p className="text-xs text-slate-500">Play pleasant audio chimes on alert delivery and response arrival</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ soundAlerts: !(settings.soundAlerts ?? true) })}
                    className={`w-12 h-7 rounded-full p-1 transition-all cursor-pointer flex items-center ${
                      (settings.soundAlerts ?? true) ? 'bg-rose-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Vibration / Haptics */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-800">Haptic Vibration Buzz</p>
                    <p className="text-xs text-slate-500">Tactile pulse on devices that support vibration motors</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ vibrationAlerts: !(settings.vibrationAlerts ?? true) })}
                    className={`w-12 h-7 rounded-full p-1 transition-all cursor-pointer flex items-center ${
                      (settings.vibrationAlerts ?? true) ? 'bg-rose-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Spoken Voice TTS */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-800">Spoken Voice Announcements</p>
                    <p className="text-xs text-slate-500">Read out caregiver replies and alert confirmations automatically</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ spokenAlerts: !(settings.spokenAlerts ?? true) })}
                    className={`w-12 h-7 rounded-full p-1 transition-all cursor-pointer flex items-center ${
                      (settings.spokenAlerts ?? true) ? 'bg-rose-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">Changes are saved automatically to your device.</p>
          <button
            onClick={() => setShowEditAlertsModal(false)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
