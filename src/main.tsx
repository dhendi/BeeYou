import './utils/migrateLegacyStorage';
import { ensurePersistentStorage } from './utils/offlineStorage';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Request persistent storage to protect custom AAC tiles and caregiver voice clips from OS/browser eviction
if (typeof window !== 'undefined') {
  ensurePersistentStorage().catch(() => {});
}

// Automatically check and activate the latest PWA bundle on load
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.update();
    }
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
