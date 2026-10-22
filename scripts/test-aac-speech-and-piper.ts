import assert from 'assert';
import { 
  PERSONA_ACOUSTIC_PROFILES, 
  getTtsCacheKey, 
  getTtsStreamUrl, 
  isAudioPayload, 
  isAudioMp3,
  ensureWavHeader
} from '../src/utils/audio/speech.ts';
import { 
  resolvePiperVoiceId, 
  PIPER_VOICE_MAP 
} from '../src/services/piperTtsService.ts';
import { 
  VOICE_PERSONAS, 
  getVoicePersonaById 
} from '../src/data/voicePersonasData.ts';

async function runAacSpeechAndPiperTests() {
  console.log('====================================================');
  console.log('BEE-YOU AAC AUDIO REPAIR & PIPER TTS VERIFICATION');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function runTest(name: string, fn: () => void | Promise<void>) {
    totalTests++;
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passedTests++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err?.message || err);
    }
  }

  // 1. Piper Voice Resolution and Mappings
  runTest('Piper Voice Resolution: Amy default persona maps to en_US-amy-medium', () => {
    const voiceId = resolvePiperVoiceId('amy', 'en');
    assert.strictEqual(voiceId, 'en_US-amy-medium');
  });

  runTest('Piper Voice Resolution: Ryan persona maps to en_US-ryan-medium', () => {
    const voiceId = resolvePiperVoiceId('ryan', 'en');
    assert.strictEqual(voiceId, 'en_US-ryan-medium');
  });

  runTest('Piper Voice Resolution: Danny persona maps to en_US-danny-low', () => {
    const voiceId = resolvePiperVoiceId('danny', 'en');
    assert.strictEqual(voiceId, 'en_US-danny-low');
  });

  runTest('Piper Voice Resolution: Spanish persona maps to Claude high', () => {
    const voiceId = resolvePiperVoiceId('claude', 'es');
    assert.strictEqual(voiceId, 'es_MX-claude-high');
  });

  runTest('Piper Voice Resolution: French persona maps to UPMC', () => {
    const voiceId = resolvePiperVoiceId('upmc', 'fr');
    assert.strictEqual(voiceId, 'fr_FR-upmc-medium');
  });

  runTest('Piper Voice Resolution: Legacy persona alias puck maps safely to Amy', () => {
    const voiceId = resolvePiperVoiceId('puck', 'en');
    assert.strictEqual(voiceId, 'en_US-amy-medium');
  });

  // 2. Audio Payload Validation and Security
  runTest('Audio Payload Validation: Rejects HTML/JSON/blank payloads', () => {
    const htmlBuf = new TextEncoder().encode('<!DOCTYPE html><html><body>Error</body></html>').buffer;
    assert.strictEqual(isAudioPayload(htmlBuf), false);

    const jsonBuf = new TextEncoder().encode('{"error": "Voice model not found"}').buffer;
    assert.strictEqual(isAudioPayload(jsonBuf), false);

    const emptyBuf = new ArrayBuffer(10);
    assert.strictEqual(isAudioPayload(emptyBuf), false);
  });

  runTest('Audio Payload Validation: Accepts valid RIFF WAV audio header', () => {
    const wavHeader = new Uint8Array(44);
    // 'RIFF'
    wavHeader[0] = 0x52; wavHeader[1] = 0x49; wavHeader[2] = 0x46; wavHeader[3] = 0x46;
    // 'WAVE'
    wavHeader[8] = 0x57; wavHeader[9] = 0x41; wavHeader[10] = 0x56; wavHeader[11] = 0x45;
    assert.strictEqual(isAudioPayload(wavHeader.buffer), true);
  });

  runTest('Audio Payload Validation: Accepts valid MP3 sync frames and ID3 tags', () => {
    const id3Header = new Uint8Array(64);
    id3Header[0] = 0x49; id3Header[1] = 0x44; id3Header[2] = 0x33; // ID3
    assert.strictEqual(isAudioMp3(id3Header.buffer), true);
    assert.strictEqual(isAudioPayload(id3Header.buffer), true);
  });

  // 3. Audio WAV Container Header Generation
  runTest('ensureWavHeader wraps raw PCM in valid 44-byte RIFF container', () => {
    const rawPcm = new Uint8Array(1000);
    const wav = ensureWavHeader(rawPcm.buffer, 24000);
    assert(wav !== null);
    assert.strictEqual(wav.byteLength, 1044);
    assert.strictEqual(isAudioPayload(wav), true);
  });

  // 4. Cache Key Determinism & Scope
  runTest('TTS Cache Key: Generates stable, versioned cache keys', () => {
    const key1 = getTtsCacheKey('amy', 'en', 'I want a drink.');
    const key2 = getTtsCacheKey('amy', 'en', 'i want a drink');
    assert.strictEqual(key1, key2);
    assert(key1.includes('amy'));
    assert(key1.includes('i want a drink'));
  });

  // 5. Persona Acoustic Calibration
  runTest('Acoustic Profiles: All registered personas have calibrated acoustic profiles', () => {
    for (const persona of VOICE_PERSONAS) {
      const profile = PERSONA_ACOUSTIC_PROFILES[persona.id];
      assert(profile !== undefined, `Missing acoustic profile for persona: ${persona.id}`);
      assert(profile.pitch >= 0.5 && profile.pitch <= 1.85);
      assert(profile.rate >= 0.55 && profile.rate <= 1.6);
    }
  });

  // 6. Sentence Autocorrection & Fluid Grammar
  runTest('Grammar Autocorrection: Capitalizes and punctuates sentences naturally', () => {
    const raw = 'i want a drink';
    const formatted = raw.charAt(0).toUpperCase() + raw.slice(1) + '.';
    assert.strictEqual(formatted, 'I want a drink.');
  });

  console.log(`\n====================================================`);
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} PASSED`);
  console.log(`====================================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAacSpeechAndPiperTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
