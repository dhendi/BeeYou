export interface NativePiperPrototype {
  /**
   * Checks whether the native Piper engine is supported and available on the current device.
   */
  isAvailable(): Promise<{ available: boolean; platform: string; reason?: string }>;

  /**
   * Pre-loads an offline Piper voice model into native memory for fast synthesis.
   */
  loadVoice(options: {
    voiceId: string;
  }): Promise<{ success: boolean; error?: string }>;

  /**
   * Synthesizes input text into a local WAV audio file using the native neural runtime.
   * Runs on a background thread outside the WebKit JavaScript context.
   */
  synthesize(options: {
    text: string;
    voiceId: string;
    rate?: number;
  }): Promise<{
    success: boolean;
    audioPath?: string;
    durationMs?: number;
    error?: string;
  }>;

  /**
   * Plays a previously synthesized local WAV audio file via native CoreAudio (AVAudioPlayer).
   */
  play(options: {
    audioPath: string;
  }): Promise<{ success: boolean; error?: string }>;

  /**
   * Stops active native playback immediately and cancels pending queued requests.
   */
  stop(): Promise<void>;
}
