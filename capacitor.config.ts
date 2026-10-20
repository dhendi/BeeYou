import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.beeyou.app',
  appName: 'BeeYou',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'localhost',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
  ios: {
    limitsNavigationsToAppBoundDomains: false,
    preferredContentMode: 'mobile',
    allowsLinkPreview: false,
  },
};

export default config;
