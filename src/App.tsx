/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import Browser    from './components/Browser';
import { useSettings }   from './store/settings';
import logo from '@/assets/logo.png';
import Spinner from './components/Spinner';
import { DASHBOARD_URL } from './constants';

export default function App() {
  const { theme } = useSettings();
  const [hasError, setHasError] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const platform = (window.electronAPI?.platform || navigator.platform).toLowerCase();
    const isMac = platform.includes('mac') || platform.includes('darwin');
    const isWindows = platform.includes('win');
    const isLinux = platform.includes('linux');

    document.documentElement.setAttribute('data-platform', 
      isMac ? 'mac' : isWindows ? 'windows' : 'linux'
    );

    if (window.electronAPI?.window) {
      window.electronAPI.window.onFullscreenChange((isFullscreen) => {
        document.documentElement.classList.toggle('fullscreen', isFullscreen);
      });
      window.electronAPI.window.onMaximizedChange((isMaximized) => {
        document.documentElement.classList.toggle('maximized', isMaximized);
      });
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setHasError(true);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection caught:", event.reason);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#13141a', color: 'white', padding: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Something went wrong</h1>
        <p style={{ color: '#9a9ba5', marginBottom: 24 }}>The application encountered an unexpected error.</p>
        <button
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          style={{ padding: '8px 24px', background: '#4f46e5', borderRadius: 8, border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Reset and Reload
        </button>
      </div>
    );
  }

  if (showSplash) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#13141a', color: 'white' }}>
        <img src={logo} alt="Orivon" style={{ height: 48, objectFit: 'contain', marginBottom: 24 }} />
        <Spinner size={32} color="#4f46e5" />
        <p style={{ marginTop: 24, fontSize: 13, color: '#9a9ba5', fontWeight: 500 }}>Starting Orivon Browser...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', background: '#13141a', color: 'white' }}>
      <Browser />
    </div>
  );
}
