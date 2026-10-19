import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, FileText, CheckCircle2, Lock, Scale, ExternalLink } from 'lucide-react';
import { useModalBackHandler } from '../services/modalBackHandler';
import { playChime } from '../utils/audio';

export interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'licenses';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'licenses'>(initialTab);

  useModalBackHandler(isOpen, () => {
    onClose();
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#FAF8F5] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-300 dark:border-slate-800 max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col text-slate-800 dark:text-slate-100">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner">
              {activeTab === 'privacy' ? (
                <ShieldCheck className="w-5 h-5 text-white" />
              ) : activeTab === 'terms' ? (
                <FileText className="w-5 h-5 text-white" />
              ) : (
                <Scale className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white block w-fit">
                Legal &amp; Child Safety Transparency
              </span>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight">
                {activeTab === 'privacy' 
                  ? 'Privacy Policy & COPPA Disclosure' 
                  : activeTab === 'terms' 
                  ? 'Terms of Service (EULA)' 
                  : 'Third-Party Licenses & Commercial Rights'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playChime('tap');
              onClose();
            }}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="p-2 bg-amber-100/60 dark:bg-slate-800 border-b border-amber-200/80 dark:border-slate-700 flex gap-2 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('privacy');
              playChime('tap');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl transition cursor-pointer flex items-center justify-center ${
              activeTab === 'privacy'
                ? 'bg-amber-500 text-white shadow-xs font-black'
                : 'bg-white/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <span>Privacy (COPPA)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('terms');
              playChime('tap');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl transition cursor-pointer flex items-center justify-center ${
              activeTab === 'terms'
                ? 'bg-indigo-600 text-white shadow-xs font-black'
                : 'bg-white/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <span>Terms of Service</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('licenses');
              playChime('tap');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl transition cursor-pointer flex items-center justify-center ${
              activeTab === 'licenses'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'bg-white/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <span>Licenses &amp; Attribution</span>
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {activeTab === 'privacy' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
                <span className="font-black block text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Our Core Privacy Commitment
                </span>
                <p className="text-xs text-emerald-900 dark:text-emerald-200 mt-1 leading-relaxed">
                  BeeYou is designed for neurodivergent children, teens, and families. We adhere strictly to Apple App Store Kids Category guidelines and the Children&apos;s Online Privacy Protection Act (COPPA). We have zero ads, zero third-party tracking, and never sell personal information.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Children&apos;s Online Privacy (COPPA &amp; GDPR-K)
                </h3>
                <p>
                  BeeYou does not knowingly collect personal identification information directly from children under the age of 13 without verified parental consent. Family accounts are registered and managed exclusively by parents, legal guardians, or educational professionals. Communication tiles, mood logs, and visual routines are treated as confidential family data.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Zero Advertising &amp; Zero Tracking SDKs
                </h3>
                <p>
                  We believe assistive neurodivergent software should be a calm, distraction-free sanctuary. BeeYou contains:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>No third-party advertisements or commercial banners.</li>
                  <li>No cross-app tracking pixels or behavioral profiling cookies.</li>
                  <li>No monetization or resale of sensitive personal, emotional, or medical logs.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  3. Information We Collect and How It Is Used
                </h3>
                <p>
                  We collect only the minimum data necessary to deliver assistive communication and companion sync:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Parent Account Email:</strong> Used exclusively for secure sign-in, account authentication, and password/PIN resets.</li>
                  <li><strong>7-Character Sync Code:</strong> A cryptographically unguessable random code used to connect a child tablet with a caregiver phone without exposing personal identities.</li>
                  <li><strong>Custom AAC Symbols &amp; Voice Prompts:</strong> Custom photos and voice recordings chosen by families are stored locally on-device and synchronized across your private family channel.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  4. Sensitive Health, Prescription &amp; Menstrual Cycle Data (Apple Guideline 5.1.3)
                </h3>
                <p>
                  BeeYou includes specialized tools to support neurodivergent individuals and families with executive function, sensory awareness, and daily health routines. We treat this data with the highest level of privacy and sensitivity:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Prescription &amp; Medication Reminders:</strong> Names of medications, custom dosages, scheduled reminder times, administration notes (such as &ldquo;take with food&rdquo;), and dosage confirmation logs are strictly private family data.
                  </li>
                  <li>
                    <strong>Menstrual Cycle &amp; Period Tracking:</strong> Cycle dates, flow intensity, physical and emotional symptoms, and body awareness logs are maintained solely for personal sensory pacing and routine preparation.
                  </li>
                  <li>
                    <strong>Strict Anti-Monetization &amp; Non-Disclosure Guarantee:</strong> In accordance with Apple App Store Guideline 5.1.3 and global health data protections, your health, medication, and cycle records are <strong>NEVER sold, NEVER rented, NEVER shared with third-party advertisers, data brokers, or health insurance companies</strong>, and are NEVER used for behavioral targeting or commercial profiling.
                  </li>
                  <li>
                    <strong>Discreet Mode for Sensory &amp; Social Privacy:</strong> A built-in discreet toggle allows users to disguise cycle tracking as &ldquo;Wellness Rhythm&rdquo; with neutral icons, preventing unintentional disclosure on shared screens in classrooms or public settings.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  5. Security, Encryption &amp; On-Device Sanitization
                </h3>
                <p>
                  All network traffic is encrypted using TLS 1.3 (HTTPS &amp; Secure WebSockets). Caregiver PINs are salt-hashed using SHA-256 before being stored in local device memory. For shared school loaner tablets, our 1-tap &ldquo;Erase &amp; Reset Device&rdquo; tool purges all local medication records, routines, cycle logs, and journal entries.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  6. Apple Guideline 5.1.1(v) Mandatory In-App Account Deletion
                </h3>
                <p>
                  Caregivers have the right to permanently delete their account and all associated data at any time directly within the app. Tapping &ldquo;Delete Family Account&rdquo; in the Caregiver Link Tab removes your Firebase Auth record, purges your cloud database channel, and wipes local device storage immediately.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  7. Contact Our Privacy Officer
                </h3>
                <p>
                  If you have questions regarding this Privacy Policy or your child&apos;s data, please contact our support team at <strong className="text-amber-600 dark:text-amber-400">privacy@beeyou.app</strong>.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200">
                <span className="font-black block text-xs uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                  Assistive Communication Companion
                </span>
                <p className="text-xs text-indigo-900 dark:text-indigo-200 mt-1 leading-relaxed">
                  Welcome to BeeYou. By accessing or using our mobile application, you agree to these Terms of Service. BeeYou is committed to empowering neurodivergent children, teens, and adults to express themselves comfortably and safely.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Non-Medical Assistive Communication Tool
                </h3>
                <p>
                  BeeYou is an assistive augmentative and alternative communication (AAC), visual routine, and emotional regulation companion. BeeYou does not provide professional medical diagnoses, clinical treatment plans, or emergency dispatch services. Caregivers must maintain appropriate adult supervision and rely on professional emergency services (such as 911 or local emergency numbers) for urgent health crises.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Health, Medication &amp; Menstrual Cycle Disclaimer (Non-Clinical Tool)
                </h3>
                <p>
                  BeeYou features organizational tools for daily living, including medication reminders and cycle tracking. Please note the following legal and safety limitations:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Medication Reminders:</strong> The medication reminder feature is solely an organizational scheduling and prompt tool. BeeYou is NOT a clinical dispensary, medical device, or dosage calculation engine. It does NOT screen for adverse drug interactions, allergies, or contraindications. Caregivers and adult users remain solely responsible for verifying correct medications, dosages, and administration with a licensed physician or pharmacist.
                  </li>
                  <li>
                    <strong>Menstrual Cycle / Period Tracking:</strong> The cycle tracker is designed strictly for personal sensory pacing, routine planning, and emotional self-awareness. It is NOT a clinical diagnostic tool and must NEVER be used or relied upon for contraception, pregnancy prevention, or fertility planning.
                  </li>
                  <li>
                    <strong>Always Seek Professional Advice:</strong> Never disregard professional medical advice or delay seeking medical attention because of information or reminders in BeeYou. If you or your child experience a medical emergency, immediately call emergency services (such as 911 or 112).
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  3. User Ownership of Custom Content
                </h3>
                <p>
                  You and your child retain 100% intellectual property ownership of all custom words, uploaded photographs, voice audio recordings, personal routines, and journal reflections created within BeeYou. We claim zero ownership or commercial rights over your private family content.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  4. Free Basic Tier &amp; 15-Day Free Trial Terms
                </h3>
                <p>
                  BeeYou believes essential communication access is a fundamental right:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Core Features are 100% Free Forever:</strong> Basic AAC communication tiles, standard visual routines, and core sensory tools remain freely accessible at all times.</li>
                  <li><strong>15-Day Free Premium Trial:</strong> Free trial activation requires zero payment method upfront. At the conclusion of the 15-day period, the app seamlessly reverts to the Free Basic tier with zero surprise fees or automatic billings.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  5. Caregiver Account Security
                </h3>
                <p>
                  Caregivers are responsible for safeguarding their 4-digit PIN and account credentials. BeeYou employs salt-hashed cryptographic PIN storage to protect sensitive caregiver controls from unauthorized access.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  6. Termination &amp; Account Deletion
                </h3>
                <p>
                  You may terminate these terms at any time by utilizing the in-app &ldquo;Delete Family Account&rdquo; feature, which permanently erases your credentials and cloud database channels.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  7. Contact &amp; Support
                </h3>
                <p>
                  For inquiries regarding terms, licensing, or educational installations, contact us at <strong className="text-indigo-600 dark:text-indigo-400">support@beeyou.app</strong>.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'licenses' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-sm">Commercial Rights &amp; Open-Source Compliance</span>
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-300 mt-1 leading-relaxed">
                  BeeYou is committed to complete transparency, respectful attribution, and full compliance with open-source and Creative Commons licenses. All third-party assets utilized in BeeYou explicitly authorize commercial production use.
                </p>
              </div>

              {/* 1. AAC Symbols & Pictograms */}
              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                  <span>1. AAC Symbols &amp; Pictograms (Mulberry Symbol Set)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">CC BY-SA 2.0 / 4.0</span>
                </h3>
                <p>
                  BeeYou utilizes the clinical <strong>Mulberry Symbols</strong> library for augmentative and alternative communication.
                </p>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs space-y-1">
                  <p><strong>Created by:</strong> Straight Street / Paxtoncrafts Charitable Trust</p>
                  <p><strong>License:</strong> Creative Commons Attribution-ShareAlike 2.0 / 4.0 (CC BY-SA)</p>
                  <p><strong>Commercial Use:</strong> Fully permitted under CC BY-SA terms with attribution.</p>
                  <p><strong>Repository:</strong> <span className="text-indigo-600 dark:text-indigo-400">github.com/mulberrysymbols/mulberry-symbols</span></p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Notice: Mulberry Symbols are licensed under CC BY-SA. Any modified derivative symbol files are shared under the same license terms.
                </p>
              </section>

              {/* 2. Original Proprietary Art & Mascots */}
              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                  <span>2. Proprietary Stickers &amp; Mascots</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">All Rights Reserved</span>
                </h3>
                <p>
                  All custom storybook watercolor stickers, badges, wallpapers, and character mascots (Barnaby the Bee, Shelly the Wise Turtle, Rex the Dino, Hoppy the Frog, Conductor Leo the Train, Orion the Astro-Pup, Splash the Shark, Turbo Racer, and Stardust Unicorn) are original proprietary works owned 100% by BeeYou. No copyrighted third-party characters (e.g. Disney, Boardmaker PCS, PECS) are reproduced.
                </p>
              </section>

              {/* 3. Typography & Fonts */}
              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                  <span>3. Typography &amp; Typefaces</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">SIL OFL 1.1</span>
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Plus Jakarta Sans:</strong> Designed by Gumpita Rahayu (TokyoType / Tokotype). Licensed under the SIL Open Font License, Version 1.1.</li>
                  <li><strong>Outfit:</strong> Designed by Rodrigo Fuenzalida. Licensed under the SIL Open Font License, Version 1.1.</li>
                  <li><strong>Atkinson Hyperlegible:</strong> Designed by the Braille Institute of America to enhance character distinction for low-vision readers. Licensed under the SIL Open Font License, Version 1.1.</li>
                  <li><strong>OpenDyslexic:</strong> Designed by Abbie Gonzalez to assist readers with dyslexia. Licensed under the SIL Open Font License, Version 1.1.</li>
                </ul>
              </section>

              {/* 4. Software Icons */}
              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                  <span>4. UI Icons &amp; Glyphs (Lucide)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">ISC License</span>
                </h3>
                <p>
                  Interface icons are provided by <strong>Lucide Icons</strong>, licensed under the permissive ISC License. Copyright &copy; 2022-2026 Lucide Contributors. Permitted for commercial and non-commercial application packaging.
                </p>
              </section>

              {/* 5. Speech Synthesis & Audio Engine */}
              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  5. Speech Synthesis &amp; Tactile Chimes
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Operating System SpeechSynthesis (Web Speech API):</strong> Uses native Apple iOS AVSpeechSynthesizer and Android TTS voices licensed by their respective platform vendors for commercial third-party application usage.</li>
                  <li><strong>Synthesized Tactile Chimes:</strong> Procedurally generated in real time using the W3C Web Audio API (sine/triangle oscillator decay waveforms) without external copyrighted audio samples.</li>
                  <li><strong>Sensory Soundscapes:</strong> Public domain (CC0) and royalty-free ambient tracks licensed for commercial distribution.</li>
                </ul>
              </section>

              {/* 6. Assistive Design Standards & Fitzgerald Key */}
              <section className="space-y-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  6. Assistive Clinical Methodology (Fitzgerald Key)
                </h3>
                <p className="text-xs">
                  The color-coded grammatical organization (Yellow for pronouns/people, Green for verbs, Orange for nouns, Blue for descriptors/feelings, Pink for social expressions) follows the historical Fitzgerald Key clinical methodology developed by Edith Fitzgerald, a widely recognized public domain standard in assistive and augmentative speech therapy.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="shrink-0 p-3 sm:p-4 bg-amber-50 dark:bg-slate-800/80 border-t border-amber-200/80 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            BeeYou: You Can Be Yourself Here
          </span>

          <button
            type="button"
            onClick={() => {
              playChime('tap');
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer ml-auto"
          >
            <span>Close</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
