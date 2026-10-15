import { SoundscapeId } from '../../types';
import { getAudioContext } from './context';
import { playProceduralPetSound } from './chimes';

export interface ActiveSoundTrack {
  id: SoundscapeId;
  audioElement: HTMLAudioElement | null;
  gainNode: GainNode | null;
  nodes: AudioNode[];
  timers: any[];
  fadeTimer: any;
  volume: number;
  active?: boolean;
}

export function startProceduralTrack(id: SoundscapeId, volume: number, track: ActiveSoundTrack): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const targetVol = Math.max(0.0001, volume);
    masterGain.gain.setValueAtTime(targetVol * 0.3, now);
    masterGain.gain.linearRampToValueAtTime(targetVol, now + 0.08);
    masterGain.connect(ctx.destination);

    track.gainNode = masterGain;
    track.nodes.push(masterGain);
    track.active = true;

    if (id === 'rain') {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.03 * white) / 1.03;
        last = data[i];
        data[i] *= 2.2;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(350, now);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(3200, now);
      noise.connect(hp);
      hp.connect(lp);
      lp.connect(masterGain);
      noise.start();
      track.nodes.push(noise, hp, lp);

      const dripTimer = setInterval(() => {
        if (!track.active) return;
        const dCtx = getAudioContext();
        if (!dCtx || !track.gainNode) return;
        const dNow = dCtx.currentTime;
        const osc = dCtx.createOscillator();
        const g = dCtx.createGain();
        osc.type = 'sine';
        const freq = 1200 + Math.random() * 1200;
        osc.frequency.setValueAtTime(freq, dNow);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, dNow + 0.04);
        g.gain.setValueAtTime(volume * 0.25, dNow);
        g.gain.exponentialRampToValueAtTime(0.0001, dNow + 0.04);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(dNow);
        osc.stop(dNow + 0.05);
      }, 240);
      track.timers.push(dripTimer);

    } else if (id === 'thunderstorm') {
      // 1. Heavy rain bed
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.035 * white) / 1.035;
        last = data[i];
        data[i] *= 2.5;
      }
      const rainNoise = ctx.createBufferSource();
      rainNoise.buffer = buffer;
      rainNoise.loop = true;
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(2600, now);
      rainNoise.connect(rainFilter);
      rainFilter.connect(masterGain);
      rainNoise.start(now);
      track.nodes.push(rainNoise, rainFilter);

      // 2. Rolling thunder rumbles every 7-9 seconds
      const thunderTimer = setInterval(() => {
        if (!track.active) return;
        const tCtx = getAudioContext();
        if (!tCtx || !track.gainNode) return;
        const tNow = tCtx.currentTime;

        const subOsc = tCtx.createOscillator();
        const subGain = tCtx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(42, tNow);
        subOsc.frequency.exponentialRampToValueAtTime(30, tNow + 3.2);

        subGain.gain.setValueAtTime(0.0001, tNow);
        subGain.gain.linearRampToValueAtTime(volume * 0.6, tNow + 0.8);
        subGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 3.5);

        subOsc.connect(subGain);
        subGain.connect(masterGain);
        subOsc.start(tNow);
        subOsc.stop(tNow + 3.6);
      }, 7500);
      track.timers.push(thunderTimer);

    } else if (id === 'pink_noise') {
      // Balanced Pink Noise (-3dB/octave slope)
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3600, now);
      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      track.nodes.push(noise, filter);

    } else if (id === 'green_noise') {
      // Centered 500Hz nature-frequency spectrum
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const bp1 = ctx.createBiquadFilter();
      bp1.type = 'bandpass';
      bp1.frequency.setValueAtTime(500, now);
      bp1.Q.setValueAtTime(1.1, now);
      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass';
      bp2.frequency.setValueAtTime(500, now);
      bp2.Q.setValueAtTime(1.1, now);
      noise.connect(bp1);
      bp1.connect(bp2);
      bp2.connect(masterGain);
      noise.start(now);
      track.nodes.push(noise, bp1, bp2);

    } else if (id === 'cat_purr') {
      // Warm, realistic rhythmic sleeping cat purr
      const purrOsc = ctx.createOscillator();
      const purrHarmonic = ctx.createOscillator();
      const purrFilter = ctx.createBiquadFilter();
      const purrGain = ctx.createGain();

      purrOsc.type = 'triangle';
      purrOsc.frequency.setValueAtTime(86, now); // Audible warm purr fundamental
      purrHarmonic.type = 'sine';
      purrHarmonic.frequency.setValueAtTime(172, now); // 1st harmonic resonance

      purrFilter.type = 'lowpass';
      purrFilter.frequency.setValueAtTime(320, now);

      // 24Hz laryngeal flutter tremolo
      const tremolo = ctx.createOscillator();
      tremolo.type = 'sine';
      tremolo.frequency.setValueAtTime(24, now);
      const tremGain = ctx.createGain();
      tremGain.gain.setValueAtTime(0.4, now);
      tremolo.connect(tremGain);

      // Slow breathing swell (0.35 Hz)
      const breathLfo = ctx.createOscillator();
      breathLfo.type = 'sine';
      breathLfo.frequency.setValueAtTime(0.35, now);
      const breathGain = ctx.createGain();
      breathGain.gain.setValueAtTime(0.25, now);
      breathLfo.connect(breathGain);

      purrGain.gain.setValueAtTime(volume * 0.85, now);
      tremGain.connect(purrGain.gain);
      breathGain.connect(purrGain.gain);

      purrOsc.connect(purrFilter);
      purrHarmonic.connect(purrFilter);
      purrFilter.connect(purrGain);
      purrGain.connect(masterGain);

      purrOsc.start(now);
      purrHarmonic.start(now);
      tremolo.start(now);
      breathLfo.start(now);
      track.nodes.push(purrOsc, purrHarmonic, purrFilter, purrGain, tremolo, tremGain, breathLfo, breathGain);

    } else if (id === 'kitten') {
      playProceduralPetSound('kitten');
      const kittenTimer = setInterval(() => {
        if (!track.active) return;
        playProceduralPetSound('kitten');
      }, 3000);
      track.timers.push(kittenTimer);

    } else if (id === 'puppy') {
      playProceduralPetSound('puppy');
      const puppyTimer = setInterval(() => {
        if (!track.active) return;
        playProceduralPetSound('puppy');
      }, 3500);
      track.timers.push(puppyTimer);

    } else if (id === 'box_fan') {
      // Motor hum + steady air turbulence
      const motorOsc = ctx.createOscillator();
      motorOsc.type = 'triangle';
      motorOsc.frequency.setValueAtTime(60, now);
      const motorGain = ctx.createGain();
      motorGain.gain.setValueAtTime(volume * 0.35, now);
      motorOsc.connect(motorGain);
      motorGain.connect(masterGain);
      motorOsc.start(now);

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.45;
      }
      const airNoise = ctx.createBufferSource();
      airNoise.buffer = buffer;
      airNoise.loop = true;
      const airFilter = ctx.createBiquadFilter();
      airFilter.type = 'bandpass';
      airFilter.frequency.setValueAtTime(320, now);
      airFilter.Q.setValueAtTime(0.9, now);
      airNoise.connect(airFilter);
      airFilter.connect(masterGain);
      airNoise.start(now);
      track.nodes.push(motorOsc, motorGain, airNoise, airFilter);

    } else if (id === 'tibetan_bowl') {
      // 432Hz calming meditation singing bowl
      const bowlTimer = setInterval(() => {
        if (!track.active) return;
        const bCtx = getAudioContext();
        if (!bCtx || !track.gainNode) return;
        const bNow = bCtx.currentTime;

        const fundamental = bCtx.createOscillator();
        const overtone = bCtx.createOscillator();
        const bGain = bCtx.createGain();

        fundamental.type = 'sine';
        fundamental.frequency.setValueAtTime(432, bNow);
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(864.5, bNow);

        bGain.gain.setValueAtTime(0.0001, bNow);
        bGain.gain.linearRampToValueAtTime(volume * 0.5, bNow + 0.15);
        bGain.gain.exponentialRampToValueAtTime(0.0001, bNow + 4.8);

        fundamental.connect(bGain);
        overtone.connect(bGain);
        bGain.connect(masterGain);

        fundamental.start(bNow);
        overtone.start(bNow);
        fundamental.stop(bNow + 5.0);
        overtone.stop(bNow + 5.0);
      }, 5200);
      track.timers.push(bowlTimer);

    } else if (id === 'clock_tick') {
      // Grounding wooden clock cadence
      let isTick = true;
      const playClockBurst = (cCtx: AudioContext, cNow: number, tick: boolean) => {
        const osc = cCtx.createOscillator();
        const g = cCtx.createGain();
        const bFilter = cCtx.createBiquadFilter();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(tick ? 840 : 640, cNow);
        osc.frequency.exponentialRampToValueAtTime(140, cNow + 0.03);

        bFilter.type = 'bandpass';
        bFilter.frequency.setValueAtTime(900, cNow);
        bFilter.Q.setValueAtTime(2.0, cNow);

        g.gain.setValueAtTime(volume * 0.55, cNow);
        g.gain.exponentialRampToValueAtTime(0.0001, cNow + 0.035);

        osc.connect(bFilter);
        bFilter.connect(g);
        g.connect(masterGain);
        osc.start(cNow);
        osc.stop(cNow + 0.04);
      };

      // Play immediate tick on tap!
      playClockBurst(ctx, now + 0.02, true);

      const clockTimer = setInterval(() => {
        if (!track.active) return;
        const cCtx = getAudioContext();
        if (!cCtx || !track.gainNode) return;
        isTick = !isTick;
        playClockBurst(cCtx, cCtx.currentTime, isTick);
      }, 500);
      track.timers.push(clockTimer);

    } else if (id === 'morning_birds') {
      // Gentle meadow air + periodic morning birdsong
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.025 * white) / 1.025;
        last = data[i];
      }
      const wind = ctx.createBufferSource();
      wind.buffer = buffer;
      wind.loop = true;
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(650, now);
      wind.connect(windFilter);
      windFilter.connect(masterGain);
      wind.start(now);
      track.nodes.push(wind, windFilter);

      const playBirdPhrase = (mCtx: AudioContext, mNow: number) => {
        const baseFreq = 2200 + Math.random() * 700;
        [0, 0.1, 0.22].forEach((offset) => {
          const osc = mCtx.createOscillator();
          const g = mCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, mNow + offset);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, mNow + offset + 0.05);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, mNow + offset + 0.09);
          g.gain.setValueAtTime(volume * 0.35, mNow + offset);
          g.gain.exponentialRampToValueAtTime(0.0001, mNow + offset + 0.1);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(mNow + offset);
          osc.stop(mNow + offset + 0.11);
        });
      };

      // Play immediate bird song on start!
      playBirdPhrase(ctx, now + 0.05);

      const birdTimer = setInterval(() => {
        if (!track.active) return;
        const mCtx = getAudioContext();
        if (!mCtx || !track.gainNode) return;
        playBirdPhrase(mCtx, mCtx.currentTime);
      }, 2200);
      track.timers.push(birdTimer);

    } else if (id === 'underwater') {
      // Audible submerged ocean acoustics + bubbly water resonance
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(160, now); // Audible fundamental
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(volume * 0.45, now);
      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.6;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.setValueAtTime(1.2, now);
      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      track.nodes.push(subOsc, subGain, noise, filter);

      // Gentle aquatic bubbles
      const bubbleTimer = setInterval(() => {
        if (!track.active) return;
        const uCtx = getAudioContext();
        if (!uCtx || !track.gainNode) return;
        const uNow = uCtx.currentTime;
        const bOsc = uCtx.createOscillator();
        const bG = uCtx.createGain();
        bOsc.type = 'sine';
        const startF = 380 + Math.random() * 120;
        bOsc.frequency.setValueAtTime(startF, uNow);
        bOsc.frequency.exponentialRampToValueAtTime(startF * 1.5, uNow + 0.06);
        bG.gain.setValueAtTime(volume * 0.25, uNow);
        bG.gain.exponentialRampToValueAtTime(0.0001, uNow + 0.06);
        bOsc.connect(bG);
        bG.connect(masterGain);
        bOsc.start(uNow);
        bOsc.stop(uNow + 0.07);
      }, 550);
      track.timers.push(bubbleTimer);

    } else if (id === 'cafe') {
      // Cozy Raindrop Cafe
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
      }
      const room = ctx.createBufferSource();
      room.buffer = buffer;
      room.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      room.connect(filter);
      filter.connect(masterGain);
      room.start(now);
      track.nodes.push(room, filter);

    } else if (id === 'library') {
      // Sanctuary Quiet Library
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const room = ctx.createBufferSource();
      room.buffer = buffer;
      room.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      room.connect(filter);
      filter.connect(masterGain);
      room.start(now);
      track.nodes.push(room, filter);

    } else if (id === 'campfire') {
      // Night Pine Campfire with rich warmth and popping embers
      const fireBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const fireData = fireBuffer.getChannelData(0);
      let lastFire = 0;
      for (let i = 0; i < ctx.sampleRate * 3; i++) {
        const white = Math.random() * 2 - 1;
        fireData[i] = (lastFire + 0.035 * white) / 1.035;
        lastFire = fireData[i];
      }
      const fireSrc = ctx.createBufferSource();
      fireSrc.buffer = fireBuffer;
      fireSrc.loop = true;
      const fireFilter = ctx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.setValueAtTime(460, now);
      const fireGain = ctx.createGain();
      fireGain.gain.setValueAtTime(volume * 0.7, now);
      fireSrc.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(masterGain);
      fireSrc.start(now);
      track.nodes.push(fireSrc, fireFilter, fireGain);

      const crackleTimer = setInterval(() => {
        if (!track.active) return;
        const cCtx = getAudioContext();
        if (!cCtx || !track.gainNode) return;
        const cNow = cCtx.currentTime;
        if (Math.random() > 0.25) {
          const pop = cCtx.createOscillator();
          const g = cCtx.createGain();
          pop.type = 'triangle';
          pop.frequency.setValueAtTime(1200 + Math.random() * 1400, cNow);
          g.gain.setValueAtTime(volume * 0.45, cNow);
          g.gain.exponentialRampToValueAtTime(0.0001, cNow + 0.03);
          pop.connect(g);
          g.connect(masterGain);
          pop.start(cNow);
          pop.stop(cNow + 0.035);
        }
      }, 190);
      track.timers.push(crackleTimer);

    } else if (id === 'ocean') {
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.35;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.12, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(320, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      lfo.start();
      track.nodes.push(noise, filter, lfo, lfoGain);

    } else if (id === 'brown_noise') {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.8;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.Q.setValueAtTime(0.7, now);
      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      track.nodes.push(noise, filter);

    } else if (id === 'stream') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const bp1 = ctx.createBiquadFilter();
      bp1.type = 'bandpass';
      bp1.frequency.setValueAtTime(750, now);
      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass';
      bp2.frequency.setValueAtTime(1600, now);
      noise.connect(bp1);
      noise.connect(bp2);
      bp1.connect(masterGain);
      bp2.connect(masterGain);
      noise.start();
      track.nodes.push(noise, bp1, bp2);

    } else if (id === 'crickets') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.015 * white) / 1.015;
        last = data[i];
      }
      const breeze = ctx.createBufferSource();
      breeze.buffer = buffer;
      breeze.loop = true;
      const breezeFilter = ctx.createBiquadFilter();
      breezeFilter.type = 'lowpass';
      breezeFilter.frequency.setValueAtTime(320, now);
      breeze.connect(breezeFilter);
      breezeFilter.connect(masterGain);
      breeze.start();
      track.nodes.push(breeze, breezeFilter);

      const cricketTimer = setInterval(() => {
        if (!track.active) return;
        const cCtx = getAudioContext();
        if (!cCtx || !track.gainNode) return;
        const cNow = cCtx.currentTime;
        [0, 0.04, 0.08].forEach((offset) => {
          const osc = cCtx.createOscillator();
          const g = cCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(4600 + Math.random() * 200, cNow + offset);
          g.gain.setValueAtTime(volume * 0.25, cNow + offset);
          g.gain.exponentialRampToValueAtTime(0.0001, cNow + offset + 0.025);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(cNow + offset);
          osc.stop(cNow + offset + 0.03);
        });
      }, 1400);
      track.timers.push(cricketTimer);

    } else if (id === 'space_drone') {
      const freqs = [55, 110, 164.81, 220];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f + (idx % 2 === 0 ? 0.4 : -0.3), now);
        g.gain.setValueAtTime(volume * (idx === 0 ? 0.6 : 0.35), now);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        track.nodes.push(osc, g);
      });

    } else if (id === 'wind_chimes') {
      const chimePitches = [523.25, 659.25, 783.99, 880.0, 1046.5];
      const chimeTimer = setInterval(() => {
        if (!track.active) return;
        const wCtx = getAudioContext();
        if (!wCtx || !track.gainNode) return;
        const wNow = wCtx.currentTime;
        const pitch = chimePitches[Math.floor(Math.random() * chimePitches.length)];
        const osc = wCtx.createOscillator();
        const g = wCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, wNow);
        g.gain.setValueAtTime(volume * 0.35, wNow);
        g.gain.exponentialRampToValueAtTime(0.0001, wNow + 2.4);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(wNow);
        osc.stop(wNow + 2.5);
      }, 1900);
      track.timers.push(chimeTimer);

    } else if (id === 'white_noise') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.55;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(7000, now);
      source.connect(filter);
      filter.connect(masterGain);
      source.start(now);
      track.nodes.push(source, filter);

    } else if (id === 'train_chug') {
      let beat = 0;
      const trainTimer = setInterval(() => {
        if (!track.active) return;
        const tCtx = getAudioContext();
        if (!tCtx || !track.gainNode) return;
        const tNow = tCtx.currentTime;

        const bufferSize = Math.floor(tCtx.sampleRate * 0.12);
        const buffer = tCtx.createBuffer(1, bufferSize, tCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const chugSource = tCtx.createBufferSource();
        chugSource.buffer = buffer;

        const chugFilter = tCtx.createBiquadFilter();
        chugFilter.type = 'bandpass';
        chugFilter.frequency.setValueAtTime(beat % 2 === 0 ? 550 : 420, tNow);
        chugFilter.Q.setValueAtTime(2.0, tNow);

        const chugGain = tCtx.createGain();
        const chugVol = beat % 2 === 0 ? volume * 0.55 : volume * 0.35;
        chugGain.gain.setValueAtTime(chugVol, tNow);
        chugGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 0.11);

        chugSource.connect(chugFilter);
        chugFilter.connect(chugGain);
        chugGain.connect(masterGain);

        chugSource.start(tNow);
        chugSource.stop(tNow + 0.12);

        if (beat % 2 === 0) {
          const rumble = tCtx.createOscillator();
          const rGain = tCtx.createGain();
          rumble.type = 'triangle';
          rumble.frequency.setValueAtTime(65, tNow);
          rGain.gain.setValueAtTime(volume * 0.25, tNow);
          rGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 0.09);
          rumble.connect(rGain);
          rGain.connect(masterGain);
          rumble.start(tNow);
          rumble.stop(tNow + 0.1);
        }

        beat = (beat + 1) % 4;
      }, 260);
      track.timers.push(trainTimer);

    } else if (id === 'train_tracks') {
      const humBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const humData = humBuffer.getChannelData(0);
      let lastHum = 0;
      for (let i = 0; i < ctx.sampleRate * 2; i++) {
        const white = Math.random() * 2 - 1;
        humData[i] = (lastHum + 0.02 * white) / 1.02;
        lastHum = humData[i];
      }
      const humSrc = ctx.createBufferSource();
      humSrc.buffer = humBuffer;
      humSrc.loop = true;
      const humFilter = ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(140, now);
      humSrc.connect(humFilter);
      humFilter.connect(masterGain);
      humSrc.start(now);
      track.nodes.push(humSrc, humFilter);

      const railTimer = setInterval(() => {
        if (!track.active) return;
        const rCtx = getAudioContext();
        if (!rCtx || !track.gainNode) return;
        const rNow = rCtx.currentTime;

        [0, 0.11].forEach((offset, idx) => {
          const osc = rCtx.createOscillator();
          const g = rCtx.createGain();
          const filter = rCtx.createBiquadFilter();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(idx === 0 ? 520 : 410, rNow + offset);
          osc.frequency.exponentialRampToValueAtTime(110, rNow + offset + 0.05);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(950, rNow + offset);
          filter.Q.setValueAtTime(3.0, rNow + offset);

          g.gain.setValueAtTime(volume * (idx === 0 ? 0.45 : 0.35), rNow + offset);
          g.gain.exponentialRampToValueAtTime(0.0001, rNow + offset + 0.06);

          osc.connect(filter);
          filter.connect(g);
          g.connect(masterGain);

          osc.start(rNow + offset);
          osc.stop(rNow + offset + 0.07);
        });
      }, 540);
      track.timers.push(railTimer);

    } else if (id === 'driving') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const engineFilter = ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(46, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(92, now);

      engineFilter.type = 'lowpass';
      engineFilter.frequency.setValueAtTime(110, now);

      oscGain.gain.setValueAtTime(volume * 0.45, now);
      osc1.connect(engineFilter);
      osc2.connect(engineFilter);
      engineFilter.connect(oscGain);
      oscGain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      track.nodes.push(osc1, osc2, engineFilter, oscGain);

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastRoad = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastRoad + 0.04 * white) / 1.04;
        lastRoad = data[i];
      }
      const roadNoise = ctx.createBufferSource();
      roadNoise.buffer = buffer;
      roadNoise.loop = true;

      const roadFilter = ctx.createBiquadFilter();
      roadFilter.type = 'bandpass';
      roadFilter.frequency.setValueAtTime(260, now);
      roadFilter.Q.setValueAtTime(0.8, now);

      roadNoise.connect(roadFilter);
      roadFilter.connect(masterGain);
      roadNoise.start(now);
      track.nodes.push(roadNoise, roadFilter);

    } else if (id === 'city') {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastCity = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastCity + 0.02 * white) / 1.02;
        lastCity = data[i];
      }
      const cityNoise = ctx.createBufferSource();
      cityNoise.buffer = buffer;
      cityNoise.loop = true;

      const cityFilter = ctx.createBiquadFilter();
      cityFilter.type = 'lowpass';
      cityFilter.frequency.setValueAtTime(220, now);

      cityNoise.connect(cityFilter);
      cityFilter.connect(masterGain);
      cityNoise.start(now);
      track.nodes.push(cityNoise, cityFilter);

    } else if (id === 'night_time') {
      const chord = [174.61, 261.63, 440.0];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.3 : -0.2), now);
        g.gain.setValueAtTime(volume * 0.28, now);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        track.nodes.push(osc, g);
      });

    } else if (id === 'beach') {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(0.7, now);
      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      track.nodes.push(noise, filter);

    } else if (id === 'forest') {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastWind = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastWind + 0.03 * white) / 1.03;
        lastWind = data[i];
      }
      const wind = ctx.createBufferSource();
      wind.buffer = buffer;
      wind.loop = true;
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(420, now);
      wind.connect(windFilter);
      windFilter.connect(masterGain);
      wind.start(now);
      track.nodes.push(wind, windFilter);

    } else if (id === 'fireplace') {
      const fireBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const fireData = fireBuffer.getChannelData(0);
      let lastFire = 0;
      for (let i = 0; i < ctx.sampleRate * 3; i++) {
        const white = Math.random() * 2 - 1;
        fireData[i] = (lastFire + 0.025 * white) / 1.025;
        lastFire = fireData[i];
      }
      const fireSrc = ctx.createBufferSource();
      fireSrc.buffer = fireBuffer;
      fireSrc.loop = true;
      const fireFilter = ctx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.setValueAtTime(220, now);
      fireSrc.connect(fireFilter);
      fireFilter.connect(masterGain);
      fireSrc.start(now);
      track.nodes.push(fireSrc, fireFilter);

      const crackleTimer = setInterval(() => {
        if (!track.active) return;
        const mCtx = getAudioContext();
        if (!mCtx || !track.gainNode) return;
        const mNow = mCtx.currentTime;
        if (Math.random() > 0.3) {
          const osc = mCtx.createOscillator();
          const g = mCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1400 + Math.random() * 1200, mNow);
          g.gain.setValueAtTime(volume * 0.4, mNow);
          g.gain.exponentialRampToValueAtTime(0.0001, mNow + 0.03);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(mNow);
          osc.stop(mNow + 0.035);
        }
      }, 220);
      track.timers.push(crackleTimer);

    } else if (id === 'medieval_tavern') {
      const dronePitches = [73.42, 110.00, 146.83];
      dronePitches.forEach((dPitch, dIdx) => {
        const dOsc = ctx.createOscillator();
        const dGain = ctx.createGain();
        const dFilter = ctx.createBiquadFilter();
        dOsc.type = dIdx === 0 ? 'sawtooth' : 'triangle';
        dOsc.frequency.setValueAtTime(dPitch, now);
        dFilter.type = 'lowpass';
        dFilter.frequency.setValueAtTime(360, now);
        dGain.gain.setValueAtTime(volume * 0.18, now);
        dOsc.connect(dFilter);
        dFilter.connect(dGain);
        dGain.connect(masterGain);
        dOsc.start(now);
        track.nodes.push(dOsc, dFilter, dGain);
      });

    } else if (id === 'focus_20hz') {
      // 216Hz Carrier with 20Hz Beta-Wave Amplitude Modulation & Warm Focus Undertone
      const carrier = ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(216, now);

      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(0.5, now);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(20, now);
      lfo.connect(modGain.gain);

      carrier.connect(modGain);
      modGain.connect(masterGain);

      carrier.start(now);
      lfo.start(now);
      track.nodes.push(carrier, lfo, modGain);

    } else if (id === 'anxiety_396hz') {
      // Solfeggio 396Hz Liberation Tone with 0.1Hz Calming Breathing Envelope
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(396, now);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(792, now); // 1st Harmonic

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.2, now);
      osc2.connect(gain2);

      const tremolo = ctx.createOscillator();
      tremolo.type = 'sine';
      tremolo.frequency.setValueAtTime(0.1, now); // 10-second slow breathing wave

      const tremoloGain = ctx.createGain();
      tremoloGain.gain.setValueAtTime(0.75, now);
      tremolo.connect(tremoloGain.gain);

      osc.connect(tremoloGain);
      gain2.connect(tremoloGain);
      tremoloGain.connect(masterGain);

      osc.start(now);
      osc2.start(now);
      tremolo.start(now);
      track.nodes.push(osc, osc2, gain2, tremolo, tremoloGain);

    } else if (id === 'release_528hz') {
      // Solfeggio 528Hz Miracle Tone with Crystal Singing Bowl Overtones
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now);

      const oscHarmonic = ctx.createOscillator();
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(1056, now);

      const harmGain = ctx.createGain();
      harmGain.gain.setValueAtTime(0.22, now);
      oscHarmonic.connect(harmGain);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      osc.connect(filter);
      harmGain.connect(filter);
      filter.connect(masterGain);

      osc.start(now);
      oscHarmonic.start(now);
      track.nodes.push(osc, oscHarmonic, harmGain, filter);

    } else if (id === 'rain_roof') {
      // Crisp Rain Tapping on Rooftop: Rain Bed + Rhythmic Droplet Impacts
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.04 * white) / 1.04;
        last = data[i];
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1100, now);
      bp.Q.setValueAtTime(1.2, now);

      const rainBedGain = ctx.createGain();
      rainBedGain.gain.setValueAtTime(volume * 0.8, now);

      noise.connect(bp);
      bp.connect(rainBedGain);
      rainBedGain.connect(masterGain);
      noise.start(now);
      track.nodes.push(noise, bp, rainBedGain);

      // Droplet rooftop impacts
      const roofTimer = setInterval(() => {
        if (!track.active) return;
        const rCtx = getAudioContext();
        if (!rCtx || !track.gainNode) return;
        const rNow = rCtx.currentTime;
        const drop = rCtx.createOscillator();
        const dG = rCtx.createGain();
        drop.type = 'triangle';
        const dFreq = 750 + Math.random() * 950;
        drop.frequency.setValueAtTime(dFreq, rNow);
        drop.frequency.exponentialRampToValueAtTime(160, rNow + 0.03);
        dG.gain.setValueAtTime(volume * 0.35, rNow);
        dG.gain.exponentialRampToValueAtTime(0.0001, rNow + 0.035);
        drop.connect(dG);
        dG.connect(masterGain);
        drop.start(rNow);
        drop.stop(rNow + 0.04);
      }, 120);
      track.timers.push(roofTimer);

    } else if (id === 'hypnotic_words') {
      // Ethereal Multi-Formant Vocal Meditation Drone (Calming Aum/Shh Resonant Formants)
      const droneOsc = ctx.createOscillator();
      droneOsc.type = 'triangle';
      droneOsc.frequency.setValueAtTime(110, now); // A2 vocal fundamental

      const form1 = ctx.createBiquadFilter();
      form1.type = 'bandpass';
      form1.frequency.setValueAtTime(350, now); // F1 vowel formant
      form1.Q.setValueAtTime(3.5, now);

      const form2 = ctx.createBiquadFilter();
      form2.type = 'bandpass';
      form2.frequency.setValueAtTime(850, now); // F2 vowel formant
      form2.Q.setValueAtTime(4.0, now);

      const vocalGain = ctx.createGain();
      vocalGain.gain.setValueAtTime(volume * 0.65, now);

      // Slow 0.08Hz vocal breathing sweep
      const breathMod = ctx.createOscillator();
      breathMod.type = 'sine';
      breathMod.frequency.setValueAtTime(0.08, now);
      const breathModGain = ctx.createGain();
      breathModGain.gain.setValueAtTime(140, now);
      breathMod.connect(breathModGain);
      breathModGain.connect(form1.frequency);

      droneOsc.connect(form1);
      droneOsc.connect(form2);
      form1.connect(vocalGain);
      form2.connect(vocalGain);
      vocalGain.connect(masterGain);

      droneOsc.start(now);
      breathMod.start(now);
      track.nodes.push(droneOsc, form1, form2, vocalGain, breathMod, breathModGain);

    } else if (id === 'sleep_affirmations') {
      // Celestial 432Hz Ambient Sleep Sanctuary Pad
      const notes = [432, 540, 648, 810]; // 432Hz Major-7th chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (idx % 2 === 0 ? 0.3 : -0.2), now);
        g.gain.setValueAtTime(volume * 0.22, now);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);

        osc.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        osc.start(now);
        track.nodes.push(osc, filter, g);
      });

    } else if (id === 'elvish_whispers') {
      // Ethereal Pentatonic Crystal Chimes & Whispering Breeze
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.25;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(950, now);
      bp.Q.setValueAtTime(1.5, now);

      noise.connect(bp);
      bp.connect(masterGain);
      noise.start(now);
      track.nodes.push(noise, bp);

      // Magical pentatonic bell sparkles
      const chimeTimer = setInterval(() => {
        if (!track.active) return;
        const eCtx = getAudioContext();
        if (!eCtx || !track.gainNode) return;
        const eNow = eCtx.currentTime;
        const pentatonic = [440.0, 523.25, 659.25, 783.99, 880.0];
        const pitch = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        const bell = eCtx.createOscillator();
        const bG = eCtx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(pitch, eNow);
        bG.gain.setValueAtTime(volume * 0.3, eNow);
        bG.gain.exponentialRampToValueAtTime(0.0001, eNow + 1.8);
        bell.connect(bG);
        bG.connect(masterGain);
        bell.start(eNow);
        bell.stop(eNow + 1.9);
      }, 1400);
      track.timers.push(chimeTimer);

    } else if (id === 'counting_sheep') {
      // Bedtime Music Box Lullaby: Gentle Music Box Notes Over Night Meadow Drone
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(130.81, now);

      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(220, now);

      const dG = ctx.createGain();
      dG.gain.setValueAtTime(volume * 0.35, now);

      drone.connect(droneFilter);
      droneFilter.connect(dG);
      dG.connect(masterGain);
      drone.start(now);
      track.nodes.push(drone, droneFilter, dG);

      const playMusicBoxNote = (sCtx: AudioContext, sNow: number, noteFreq: number) => {
        const bell = sCtx.createOscillator();
        const bellGain = sCtx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(noteFreq, sNow);
        bellGain.gain.setValueAtTime(volume * 0.45, sNow);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, sNow + 1.8);
        bell.connect(bellGain);
        bellGain.connect(masterGain);
        bell.start(sNow);
        bell.stop(sNow + 1.9);
      };

      // Play immediate first note on tap!
      playMusicBoxNote(ctx, now + 0.05, 523.25);

      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25];
      let noteIdx = 0;
      const sheepTimer = setInterval(() => {
        if (!track.active) return;
        const sCtx = getAudioContext();
        if (!sCtx || !track.gainNode) return;
        const sNow = sCtx.currentTime;
        playMusicBoxNote(sCtx, sNow, notes[noteIdx % notes.length]);
        noteIdx++;
      }, 1800);
      track.timers.push(sheepTimer);

    } else if (id === 'bubble_wrap') {
      // Tactile, Satisfying Bubble Wrap Popping Impulses
      const playPop = (pCtx: AudioContext, pNow: number) => {
        const popOsc = pCtx.createOscillator();
        const popGain = pCtx.createGain();
        const baseFreq = 420 + Math.random() * 220;
        popOsc.type = 'triangle';
        popOsc.frequency.setValueAtTime(baseFreq, pNow);
        popOsc.frequency.exponentialRampToValueAtTime(110, pNow + 0.03);
        popGain.gain.setValueAtTime(volume * 0.6, pNow);
        popGain.gain.exponentialRampToValueAtTime(0.0001, pNow + 0.035);
        popOsc.connect(popGain);
        popGain.connect(masterGain);
        popOsc.start(pNow);
        popOsc.stop(pNow + 0.04);
      };

      // Immediate pop on tap!
      playPop(ctx, now + 0.02);

      const popTimer = setInterval(() => {
        if (!track.active) return;
        const pCtx = getAudioContext();
        if (!pCtx || !track.gainNode) return;
        playPop(pCtx, pCtx.currentTime);
      }, 320);
      track.timers.push(popTimer);
    }
  } catch (e) {
    console.error('Error starting procedural track:', e);
  }
}

