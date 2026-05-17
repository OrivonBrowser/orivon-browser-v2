/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import Onboarding from './views/Onboarding';
import Dashboard  from './pages/Dashboard';
import Browser    from './components/Browser';

import { useSettings } from './store/settings';

type View = 'ONBOARDING' | 'DASHBOARD' | 'BROWSER';

// Clear all persisted session data every time the app starts.
// This ensures the onboarding flow is always shown fresh.
function clearSession() {
  ['orivon-wallet', 'orivon-tabs', 'orivon-runtime'].forEach(k =>
    localStorage.removeItem(k)
  );
}
clearSession();

export default function App() {
  const { theme } = useSettings();
  const [view, setView] = useState<View>('ONBOARDING');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const ease = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white">
      <AnimatePresence mode="wait">

        {view === 'ONBOARDING' && (
          <motion.div key="onboarding" className="h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={ease}
          >
            <Onboarding onDone={(hasWallet) => setView(hasWallet ? 'DASHBOARD' : 'BROWSER')} />
          </motion.div>
        )}

        {view === 'DASHBOARD' && (
          <motion.div key="dashboard" className="h-full"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={ease}
          >
            <Dashboard onOpenBrowser={() => setView('BROWSER')} />
          </motion.div>
        )}

        {view === 'BROWSER' && (
          <motion.div key="browser" className="h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={ease}
          >
            <Browser onOpenDashboard={() => setView('DASHBOARD')} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
