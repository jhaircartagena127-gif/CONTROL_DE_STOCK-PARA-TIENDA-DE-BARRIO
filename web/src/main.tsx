import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nueva versión disponible.');
  },
  onOfflineReady() {
    console.log('App lista para trabajar sin conexión.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

