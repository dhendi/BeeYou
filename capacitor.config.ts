import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lumina.aac',
  appName: 'Lumina',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
