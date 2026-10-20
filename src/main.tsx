import './utils/migrateLegacyStorage';
import { ensurePersistentStorage } from './utils/offlineStorage';
import { preloadAllStickersOnIdle } from './utils/stickerPreloader';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Request persistent storage and pre-warm sticker cache for 0ms instantaneous icon rendering
if (typeof window !== 'undefined') {
  ensurePersistentStorage().catch(() => {});
  preloadAllStickersOnIdle();
}

// Automatically check and activate the latest PWA bundle on load
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.update();
    }
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Service worker claims clients in background without interrupting active user session
    // Intentionally no window.location.reload() to eliminate jarring white flash & 2nd reload
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
