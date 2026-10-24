// Web Audio Synthesizer for Realistic Tactile Feedback
export class FidgetAudioEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPopIt(isPoppingIn = true, pitchModifier = 1.0, enabled = true) {
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. High-frequency silicone dome snap transient (physical buckling click)
      const snapLen = 0.007;
      const snapBuf = this.ctx.createBuffer(1, Math.max(1, Math.floor(this.ctx.sampleRate * snapLen)), this.ctx.sampleRate);
      const snapData = snapBuf.getChannelData(0);
      for (let i = 0; i < snapData.length; i++) {
        snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapData.length * 0.22));
      }
      const snapSource = this.ctx.createBufferSource();
      snapSource.buffer = snapBuf;

      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime((isPoppingIn ? 2600 : 1900) * pitchModifier, now);
      snapFilter.Q.setValueAtTime(3.8, now);

      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(isPoppingIn ? 0.4 : 0.25, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + snapLen);

      snapSource.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapSource.start(now);

      // 2. Resonant air cavity plop/thock (Helmholtz dome displacement)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      const startFreq = (isPoppingIn ? 440 : 340) * pitchModifier + (Math.random() * 20 - 10);
      const endFreq = (isPoppingIn ? 240 : 170) * pitchModifier;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.045);

      oscGain.gain.setValueAtTime(isPoppingIn ? 0.45 : 0.35, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      const cavityFilter = this.ctx.createBiquadFilter();
      cavityFilter.type = 'lowpass';
      cavityFilter.frequency.setValueAtTime(1300 * pitchModifier, now);

      osc.connect(cavityFilter);
      cavityFilter.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.065);

      // 3. Tactile sub-bass thump
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime((isPoppingIn ? 130 : 105) * pitchModifier, now);
      subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.035);

      subGain.gain.setValueAtTime(0.28, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.045);
    } catch (e) {}
  }

  playBubbleWrap(pitchModifier = 1.0, enabled = true) {
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Explosive air burst rupture (transient noise burst)
      const burstLen = 0.024;
      const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * burstLen));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (bufferSize * 0.16));
        data[i] = (Math.random() * 2 - 1) * decay;
      }

      const burstSource = this.ctx.createBufferSource();
      burstSource.buffer = buffer;

      const burstFilter = this.ctx.createBiquadFilter();
      burstFilter.type = 'bandpass';
      burstFilter.frequency.setValueAtTime((4200 + Math.random() * 600) * pitchModifier, now);
      burstFilter.Q.setValueAtTime(2.5, now);

      const burstGain = this.ctx.createGain();
      burstGain.gain.setValueAtTime(0.55, now);
      burstGain.gain.exponentialRampToValueAtTime(0.001, now + burstLen);

      burstSource.connect(burstFilter);
      burstFilter.connect(burstGain);
      burstGain.connect(this.ctx.destination);
      burstSource.start(now);

      // 2. Rapid acoustic air decompression pop
      const airOsc = this.ctx.createOscillator();
      const airGain = this.ctx.createGain();
      airOsc.type = 'triangle';
      const airFreq = (1200 + Math.random() * 200) * pitchModifier;
      airOsc.frequency.setValueAtTime(airFreq, now);
      airOsc.frequency.exponentialRampToValueAtTime(260 * pitchModifier, now + 0.016);

      airGain.gain.setValueAtTime(0.45, now);
      airGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      airOsc.connect(airGain);
      airGain.connect(this.ctx.destination);
      airOsc.start(now);
      airOsc.stop(now + 0.022);

      // 3. Post-pop plastic crinkle micro-crackles (realistic plastic relaxation)
      const crinkleCount = 2 + Math.floor(Math.random() * 2);
      for (let c = 0; c < crinkleCount; c++) {
        const crinkleDelay = 0.007 + (c * 0.007) + (Math.random() * 0.004);
        const crinkleLen = 0.005;
        const cBuffer = this.ctx.createBuffer(1, Math.max(1, Math.floor(this.ctx.sampleRate * crinkleLen)), this.ctx.sampleRate);
        const cData = cBuffer.getChannelData(0);
        for (let j = 0; j < cData.length; j++) {
          cData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (cData.length * 0.2));
        }
        const cSource = this.ctx.createBufferSource();
        cSource.buffer = cBuffer;

        const cFilter = this.ctx.createBiquadFilter();
        cFilter.type = 'highpass';
        cFilter.frequency.setValueAtTime(3400 + Math.random() * 800, now + crinkleDelay);

        const cGain = this.ctx.createGain();
        cGain.gain.setValueAtTime(0.18 + Math.random() * 0.08, now + crinkleDelay);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + crinkleDelay + crinkleLen);

        cSource.connect(cFilter);
        cFilter.connect(cGain);
        cGain.connect(this.ctx.destination);
        cSource.start(now + crinkleDelay);
      }
    } catch (e) {}
  }

  playPlasticUnroll(enabled = true) {
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const len = 0.14;
      const buf = this.ctx.createBuffer(1, Math.max(1, Math.floor(this.ctx.sampleRate * len)), this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3600, now);
      filter.Q.setValueAtTime(1.8, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + len);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(now);
    } catch (e) {}
  }

  playPop(pitchModifier = 1.0, enabled = true) {
    this.playPopIt(true, pitchModifier, enabled);
  }

  playSwitch(type: 'blue' | 'brown' | 'red' | 'relay', enabled = true) {
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (type === 'blue') {
        // High crisp tactile click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } else if (type === 'brown') {
        // Muted thud click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.05);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      } else if (type === 'red') {
        // Soft linear bounce
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      } else {
        // Mechanical heavy toggle relay
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      }
    } catch (e) {}
  }

  playSpinnerTick(enabled = true) {
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.015);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {}
  }
}

export const audioEngine = new FidgetAudioEngine();

export const triggerHaptic = (ms = 25, enabled = true) => {
  if (enabled && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch (e) {}
  }
};

export interface FidgetToyProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}
