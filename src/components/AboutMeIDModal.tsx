import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AboutMeCardData, 
  EmergencyContact, 
  UserAgeGroup 
} from '../types';
import { playChime, speakText } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  Volume2, 
  Phone, 
  Copy, 
  Check, 
  ShieldAlert, 
  Heart, 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Smile, 
  Sparkles, 
  User, 
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Eye,
  CreditCard
} from 'lucide-react';

interface AboutMeIDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutMeIDModal: React.FC<AboutMeIDModalProps> = ({ isOpen, onClose }) => {
  const {
    childProfile,
    updateChildProfile,
    userAgeGroup,
    setShowCaregiverAlertModal,
    activeTheme,
    settings
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [isWalletView, setIsWalletView] = useState(false);

  // Fallback About Me data if profile doesn't have it yet
  const defaultAboutMe: AboutMeCardData = {
    conditions: [
      userAgeGroup === 'adult' ? 'Autistic / Neurodivergent' : 'Autism Spectrum',
      'AAC Speech Communicator',
      'Sensory Processing Sensitivity',
    ],
    communicationTips: [
      'I communicate using this digital AAC app. Please give me 10-15 seconds to reply.',
      'I understand spoken words clearly. Please speak directly to me in a calm voice.',
      'If I am overwhelmed or non-verbal, please do not crowd or touch me without asking.',
      'Ask clear yes/no questions if I am experiencing sensory overload.',
    ],
    sensorySensitivities: [
      'Sudden loud noises (sirens, hand dryers, loud clapping, blenders)',
      'Bright fluorescent lights & sudden flashing flashes',
      'Unexpected physical touch or crowded tight spaces',
      'Scratchy shirt tags and rough textures',
    ],
    comfortsAndLikes: [
      userAgeGroup === 'adult' ? 'Calm quiet workspaces & ambient music' : 'Dinosaurs 🦖 & Trains 🚂',
      'Noise-canceling headphones 🎧',
      userAgeGroup === 'adult' ? 'Weighted lap pad & deep breathing' : 'Weighted blue dinosaur comfort toy 🦕',
      'Gentle pressure or quiet dim break room',
      'Taking a break outdoors or walking to regulate',
    ],
    allergiesOrMedical: [
      'Peanuts (Severe - EpiPen in front backpack pocket)',
      'Mild Asthma (Inhaler in backpack side pouch)',
    ],
    bloodType: 'O+',
    emergencyContacts: [
      {
        id: 'ec-1',
        name: userAgeGroup === 'adult' ? 'Morgan (Partner / Emergency Contact)' : 'Sarah (Mom)',
        relationship: userAgeGroup === 'adult' ? 'Partner & Primary Emergency Contact' : 'Mother & Primary Caregiver',
        phone: '(555) 234-5678',
        isPrimary: true,
        notes: 'Available anytime; please call first!',
      },
      {
        id: 'ec-2',
        name: userAgeGroup === 'adult' ? 'Taylor (Case Worker / Advocate)' : 'David (Dad)',
        relationship: userAgeGroup === 'adult' ? 'Support Coordinator' : 'Father',
        phone: '(555) 876-5432',
        isPrimary: false,
        notes: 'Backup contact',
      },
    ],
    speechSummary: `Hello! My name is ${childProfile.name || 'Friend'}. I am ${userAgeGroup === 'adult' ? 'an adult AAC user' : 'a child'} and I communicate using this tablet. If I seem overwhelmed, hurt, or need assistance, please call my emergency contact at 555-234-5678. Thank you for your patience and respect.`,
  };

  const aboutMe = childProfile.aboutMe || defaultAboutMe;

  // Local Form State for Edit Mode
  const [formData, setFormData] = useState<AboutMeCardData>(aboutMe);
  const [profileName, setProfileName] = useState(childProfile.name || 'Leo');
  const [profilePronouns, setProfilePronouns] = useState(childProfile.pronouns || 'they/them');

  // Input states for adding new items in edit mode
  const [newCondition, setNewCondition] = useState('');
  const [newSensitivity, setNewSensitivity] = useState('');
  const [newComfort, setNewComfort] = useState('');
  const [newTip, setNewTip] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  if (!isOpen) return null;

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    playChime('tap');
    setTimeout(() => setCopiedPhoneId(null), 2500);
  };

  const handleReadAloud = () => {
    playChime('star');
    const textToSpeak = aboutMe.speechSummary || `Hello, my name is ${childProfile.name}. I use this AAC device to communicate. Please give me time to respond, and contact my caregiver if I need assistance.`;
    speakText(textToSpeak);
  };

  const handleSave = () => {
    updateChildProfile({
      name: profileName.trim() || childProfile.name,
      pronouns: profilePronouns.trim(),
      aboutMe: formData,
    });
    setIsEditing(false);
    playChime('complete');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    speakText('About Me ID card updated successfully!');
  };

  const addTag = (
    field: 'conditions' | 'sensorySensitivities' | 'comfortsAndLikes' | 'communicationTips' | 'allergiesOrMedical',
    val: string,
    resetFn: (v: string) => void
  ) => {
    const trimmed = val.trim();
    if (trimmed) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], trimmed],
      }));
      resetFn('');
      playChime('tap');
    }
  };

  const removeTag = (
    field: 'conditions' | 'sensorySensitivities' | 'comfortsAndLikes' | 'communicationTips' | 'allergiesOrMedical',
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== index),
    }));
    playChime('tap');
  };

  const addEmergencyContact = () => {
    const newContact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: 'New Contact',
      relationship: 'Caregiver / Supporter',
      phone: '(555) 000-0000',
      isPrimary: formData.emergencyContacts.length === 0,
      notes: '',
    };
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact],
    }));
    playChime('tap');
  };

  const updateEmergencyContact = (id: string, updates: Partial<EmergencyContact>) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const removeEmergencyContact = (id: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id),
    }));
    playChime('tap');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl border-4 border-amber-300 overflow-hidden text-slate-800">
        
        {/* HEADER BADGE */}
        <div className="bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner border border-white/30">
              🪪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/30 text-white">
                  {userAgeGroup === 'adult' ? 'Advocacy & Medical Passport' : 'About Me ID Card'}
                </span>
                <span className="text-xs font-bold text-white/90">
                  {userAgeGroup === 'adult' ? 'Personal Profile' : 'Child Safety & AAC'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight mt-0.5">
                {childProfile.name}'s Digital ID & Safety Card
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWalletView(!isWalletView)}
              className={`p-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                isWalletView ? 'bg-amber-300 text-amber-950' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title="Toggle Wallet Badge Card View"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">{isWalletView ? 'Detailed' : 'Wallet Card'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
              title="Close ID Card"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL ACTION STRIP */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReadAloud}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Speak ID Card introduction aloud"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read ID Aloud 🔊</span>
            </button>

            <button
              onClick={() => {
                setShowCaregiverAlertModal(true);
                playChime('tap');
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all animate-pulse"
              title="Emergency SOS Alert"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS Alert 🚨</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (isEditing) {
                setFormData(aboutMe);
                setIsEditing(false);
              } else {
                setFormData(aboutMe);
                setProfileName(childProfile.name);
                setProfilePronouns(childProfile.pronouns || 'they/them');
                setIsEditing(true);
              }
              playChime('tap');
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit ID Card'}</span>
          </button>
        </div>

        {/* MODAL CONTENT BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* 1. WALLET CARD COMPACT VIEW (If enabled) */}
          {isWalletView && !isEditing && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-3 border-amber-400 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-indigo-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center text-3xl font-black shadow-md">
                    {childProfile.name?.[0] || 'L'}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{childProfile.name}</h3>
                    <p className="text-xs text-indigo-200 font-medium">Pronouns: {childProfile.pronouns || 'they/them'}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-800 text-indigo-200">
                      AAC Communicator • ID Passport
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-amber-300 font-black block">Blood Type</span>
                  <span className="text-lg font-black text-white">{aboutMe.bloodType || 'O+'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-indigo-900/60 p-3 rounded-2xl border border-indigo-700/60">
                  <span className="font-bold text-amber-300 block mb-1">Diagnoses / Needs:</span>
                  <p className="text-indigo-100 font-medium">{aboutMe.conditions.join(' • ')}</p>
                </div>
                <div className="bg-indigo-900/60 p-3 rounded-2xl border border-indigo-700/60">
                  <span className="font-bold text-amber-300 block mb-1">Key Communication Rule:</span>
                  <p className="text-indigo-100 font-medium">Please allow 10–15 seconds to reply. I understand you clearly.</p>
                </div>
              </div>

              {aboutMe.emergencyContacts?.[0] && (
                <div className="bg-rose-950/80 border-2 border-rose-500/80 p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-300 block">Emergency Contact</span>
                    <span className="font-black text-sm text-white">{aboutMe.emergencyContacts[0].name} ({aboutMe.emergencyContacts[0].relationship})</span>
                    <p className="text-xs text-rose-200 font-bold mt-0.5">{aboutMe.emergencyContacts[0].phone}</p>
                  </div>
                  <a
                    href={`tel:${aboutMe.emergencyContacts[0].phone.replace(/[^0-9+]/g, '')}`}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md tap-effect"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 2. REGULAR VIEW MODE */}
          {!isEditing && !isWalletView && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Top Hero: Identification Bar */}
              <div className="bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border-2 border-amber-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-3xl font-black shadow-md shrink-0 border-2 border-white">
                    {childProfile.name?.[0] || 'L'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                        {childProfile.name}
                      </h3>
                      {childProfile.pronouns && (
                        <span className="text-xs font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                          {childProfile.pronouns}
                        </span>
                      )}
                      <span className="text-[11px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {userAgeGroup === 'adult' ? 'Adult • 18+' : userAgeGroup === 'teen' ? 'Teen • 12–17' : 'Child • 3–11'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold mt-1">
                      🗣️ Uses this AAC app to communicate • Please give me extra time to reply
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Blood Type</span>
                  <span className="text-base font-black text-slate-800">{aboutMe.bloodType || 'O+'}</span>
                </div>
              </div>

              {/* SECTION: WHO I AM & WHAT I HAVE (Diagnoses & Conditions) */}
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                  <span className="text-xl">🧩</span>
                  <span>Who I Am & What I Have (Conditions & Diagnoses)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aboutMe.conditions.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-black text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{c}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* SECTION: HOW TO COMMUNICATE WITH ME */}
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-sky-900 font-black text-sm">
                  <span className="text-xl">🗣️</span>
                  <span>How To Best Communicate With Me</span>
                </div>
                <div className="space-y-1.5">
                  {aboutMe.communicationTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs font-bold text-sky-950 flex items-start gap-2.5"
                    >
                      <span className="text-sm shrink-0">💡</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: SENSORY SENSITIVITIES & TRIGGERS */}
              <div className="bg-white rounded-3xl border-2 border-rose-200 p-4 sm:p-5 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
                    <span className="text-xl">⚡</span>
                    <span>What I Am Sensitive To (Sensory Triggers)</span>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                    Please Be Mindful
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aboutMe.sensorySensitivities.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs font-bold text-rose-950 flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: WHAT HELPS ME & WHAT I LIKE */}
              <div className="bg-white rounded-3xl border-2 border-emerald-200 p-4 sm:p-5 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                  <span className="text-xl">💚</span>
                  <span>What Helps Me & What I Like (Comforts & Strategies)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aboutMe.comfortsAndLikes.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* SECTION: ALLERGIES & MEDICAL ALERTS */}
              {aboutMe.allergiesOrMedical?.length > 0 && (
                <div className="bg-white rounded-3xl border-2 border-amber-300 p-4 sm:p-5 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                    <span className="text-xl">⚠️</span>
                    <span>Allergies & Medical Alerts</span>
                  </div>
                  <div className="space-y-1.5">
                    {aboutMe.allergiesOrMedical.map((a, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-black text-amber-950 flex items-center gap-2"
                      >
                        <span className="text-sm">🚨</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: CAREGIVERS & EMERGENCY CONTACTS */}
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                    <span className="text-xl">📞</span>
                    <span>Caregivers & Emergency Contacts</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">Tap to call directly</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aboutMe.emergencyContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between space-y-2.5 ${
                        contact.isPrimary
                          ? 'border-rose-400 bg-rose-50/60 shadow-xs'
                          : 'border-slate-200 bg-slate-50/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-slate-900">{contact.name}</span>
                          {contact.isPrimary && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">{contact.relationship}</p>
                        {contact.notes && (
                          <p className="text-[11px] text-slate-500 font-medium mt-1">{contact.notes}</p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-800">{contact.phone}</span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyPhone(contact.phone, contact.id)}
                            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold cursor-pointer transition-all active:scale-95"
                            title="Copy Phone Number"
                          >
                            {copiedPhoneId === contact.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <a
                            href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                            title="Call phone directly"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 3. EDIT MODE FORM */}
          {isEditing && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs font-bold text-amber-900 flex items-center gap-2">
                <span>✏️</span>
                <span>You are editing this profile's About Me ID card. Save your changes at the bottom.</span>
              </div>

              {/* Name & Pronouns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">Name:</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">Pronouns:</label>
                  <input
                    type="text"
                    value={profilePronouns}
                    onChange={(e) => setProfilePronouns(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Blood Type & Audio Script */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">Blood Type (optional):</label>
                  <input
                    type="text"
                    value={formData.bloodType || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bloodType: e.target.value }))}
                    placeholder="e.g. O+, A+, B-"
                    className="w-full max-w-xs px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">
                    Spoken Voice Introduction Script (Read Aloud):
                  </label>
                  <textarea
                    rows={3}
                    value={formData.speechSummary || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, speechSummary: e.target.value }))}
                    className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-medium outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Edit Conditions */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-700 block">
                  Conditions / Diagnoses:
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.conditions.map((c, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <span>{c}</span>
                      <button onClick={() => removeTag('conditions', idx)} className="text-rose-500 hover:text-rose-700 font-black">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Add condition (e.g. ADHD, Non-speaking)..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('conditions', newCondition, setNewCondition)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Edit Sensitivities */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-700 block">
                  Sensory Sensitivities (What I'm Sensitive From):
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.sensorySensitivities.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <span>{s}</span>
                      <button onClick={() => removeTag('sensorySensitivities', idx)} className="text-rose-500 hover:text-rose-700 font-black">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSensitivity}
                    onChange={(e) => setNewSensitivity(e.target.value)}
                    placeholder="Add sensitivity (e.g. Sirens, crowded rooms)..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('sensorySensitivities', newSensitivity, setNewSensitivity)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Edit Comforts & Likes */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-700 block">
                  Comforts, Favorites & What Helps:
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.comfortsAndLikes.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <span>{item}</span>
                      <button onClick={() => removeTag('comfortsAndLikes', idx)} className="text-rose-500 hover:text-rose-700 font-black">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComfort}
                    onChange={(e) => setNewComfort(e.target.value)}
                    placeholder="Add favorite or calming tool (e.g. Headphones, Dinosaurs)..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('comfortsAndLikes', newComfort, setNewComfort)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Edit Communication Tips */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-700 block">
                  Communication Tips:
                </label>
                <div className="space-y-1">
                  {formData.communicationTips.map((tip, idx) => (
                    <div key={idx} className="p-2 bg-sky-50 rounded-xl border border-sky-200 text-xs flex items-center justify-between">
                      <span>{tip}</span>
                      <button onClick={() => removeTag('communicationTips', idx)} className="text-rose-500 hover:text-rose-700 font-black ml-2">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTip}
                    onChange={(e) => setNewTip(e.target.value)}
                    placeholder="Add communication advice (e.g. Please speak slowly)..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('communicationTips', newTip, setNewTip)}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Edit Allergies & Medical */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-700 block">
                  Allergies & Medical Alerts:
                </label>
                <div className="space-y-1">
                  {formData.allergiesOrMedical.map((a, idx) => (
                    <div key={idx} className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                      <span>{a}</span>
                      <button onClick={() => removeTag('allergiesOrMedical', idx)} className="text-rose-500 hover:text-rose-700 font-black ml-2">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add allergy / medication (e.g. Peanuts, Inhaler in bag)..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('allergiesOrMedical', newAllergy, setNewAllergy)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Edit Emergency Contacts */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-700">
                    Caregiver & Emergency Contacts:
                  </label>
                  <button
                    type="button"
                    onClick={addEmergencyContact}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Contact</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.emergencyContacts.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => updateEmergencyContact(c.id, { name: e.target.value })}
                          placeholder="Name (e.g. Sarah)"
                          className="flex-1 px-3 py-1 rounded-xl border border-slate-300 font-bold text-xs"
                        />
                        <button
                          onClick={() => removeEmergencyContact(c.id)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                          title="Remove contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={c.relationship}
                          onChange={(e) => updateEmergencyContact(c.id, { relationship: e.target.value })}
                          placeholder="Relationship (e.g. Mother)"
                          className="px-3 py-1 rounded-xl border border-slate-300 text-xs"
                        />
                        <input
                          type="text"
                          value={c.phone}
                          onChange={(e) => updateEmergencyContact(c.id, { phone: e.target.value })}
                          placeholder="Phone (e.g. 555-234-5678)"
                          className="px-3 py-1 rounded-xl border border-slate-300 text-xs font-bold"
                        />
                      </div>

                      <input
                        type="text"
                        value={c.notes || ''}
                        onChange={(e) => updateEmergencyContact(c.id, { notes: e.target.value })}
                        placeholder="Notes (e.g. Works 10 mins from school)"
                        className="w-full px-3 py-1 rounded-xl border border-slate-300 text-xs text-slate-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {isEditing ? 'Remember to save changes.' : 'Confidential emergency advocacy information.'}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save ID Card</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm cursor-pointer active:scale-95 transition-all"
              >
                Close
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
