/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import Onboarding from './views/Onboarding';
import Browser    from './components/Browser';

import { useSettings }   from './store/settings';
import { useTabsStore }  from './store/tabs';

type View = 'ONBOARDING' | 'BROWSER';

// Clear all persisted session data every time the app starts.
function clearSession() {
  ['orivon-wallet', 'orivon-tabs', 'orivon-runtime'].forEach(k =>
    localStorage.removeItem(k)
  );
}
clearSession();

export const DASHBOARD_URL = 'orivon://dashboard';

export default function App() {
  const { theme } = useSettings();
  const [view, setView] = useState<View>('ONBOARDING');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const ease = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  const handleOnDone = (hasWallet: boolean) => {
    if (hasWallet) {
      // Navigate the initial tab to the dashboard
      const { tabs, activeTabId, navigateTab } = useTabsStore.getState();
      const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];
      if (activeTab) {
        navigateTab(activeTab.id, DASHBOARD_URL, 'Dashboard', 'https');
      }
    }
    setView('BROWSER');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white">
      <AnimatePresence mode="wait">

        {view === 'ONBOARDING' && (
          <motion.div key="onboarding" className="h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={ease}
          >
            <Onboarding onDone={handleOnDone} />
          </motion.div>
        )}

        {view === 'BROWSER' && (
          <motion.div key="browser" className="h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={ease}
          >
            <Browser onOpenOnboarding={() => setView('ONBOARDING')} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
