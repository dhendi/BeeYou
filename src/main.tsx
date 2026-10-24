import './utils/autoCacheBust';
import './utils/migrateLegacyStorage';
import { ensurePersistentStorage } from './utils/offlineStorage';
import { purgeLegacyApiCaches } from './utils/pwaCacheCleaner';
import { preloadAllStickersOnIdle } from './utils/stickerPreloader';
import { initServiceWorkerUpdates } from './utils/serviceWorkerUpdate';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Request persistent storage and pre-warm sticker cache for 0ms instantaneous icon rendering
if (typeof window !== 'undefined') {
  ensurePersistentStorage().catch(() => {});
  purgeLegacyApiCaches().catch(() => {});
  preloadAllStickersOnIdle();
}

// Automatically check and activate the latest PWA bundle on load
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  initServiceWorkerUpdates();
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
