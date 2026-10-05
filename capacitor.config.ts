import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.beeyou.app',
  appName: 'BeeYou',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
