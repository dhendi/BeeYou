import { registerPlugin } from '@capacitor/core';
import type { NativePiperPrototype } from './definitions';

export * from './definitions';

/**
 * Isolated Native Piper iOS Prototype Plugin.
 *
 * This prototype is strictly isolated from production AAC speech.
 * On non-iOS platforms or in browser environments where native Capacitor iOS
 * bindings are not compiled/present, it reports `available: false`.
 */
const NativePiperPrototypePlugin = registerPlugin<NativePiperPrototype>('NativePiperPrototype', {
  web: () => ({
    async isAvailable() {
      return {
        available: false,
        platform: 'web',
        reason: 'Native Piper prototype is only implemented on native iOS Capacitor targets.',
      };
    },
    async loadVoice() {
      return { success: false, error: 'Not supported in web environment.' };
    },
    async synthesize() {
      return { success: false, error: 'Not supported in web environment.' };
    },
    async play() {
      return { success: false, error: 'Not supported in web environment.' };
    },
    async stop() {
      // No-op on web
    },
  }),
});

export default NativePiperPrototypePlugin;
