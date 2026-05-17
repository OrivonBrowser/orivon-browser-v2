/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ViewState, AppState } from './types';
import Onboarding from './views/Onboarding';
import Dashboard from './views/Dashboard';
import LoadingTerminal from './views/LoadingTerminal';
import BrowserMode from './views/BrowserMode';

export default function App() {
  const [state, setState] = useState<AppState>({
    view: 'ONBOARDING',
    identity: {
      seed: 'alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima',
      addresses: null,
      isInitialized: false,
      isLocked: false,
    },
    navigation: {
      targetUrl: '',
      currentUrl: '',
    },
  });

  const setView = (view: ViewState) => {
    setState((prev) => ({ ...prev, view }));
  };

  const setIdentity = (addresses: AppState['identity']['addresses']) => {
    setState((prev) => ({
      ...prev,
      identity: { ...prev.identity, addresses, isInitialized: true, isLocked: false },
    }));
  };

  const lockWallet = () => {
    setState(prev => ({
      ...prev,
      identity: { ...prev.identity, isLocked: true }
    }));
  };

  const unlockWallet = () => {
    setState(prev => ({
      ...prev,
      identity: { ...prev.identity, isLocked: false }
    }));
  };

  const setNavigation = (targetUrl: string) => {
    setState((prev) => ({
      ...prev,
      navigation: { ...prev.navigation, targetUrl },
    }));
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-orivon-bg text-white font-sans selection:bg-orivon-accent selection:text-black">
      <AnimatePresence mode="wait">
        {state.view === 'ONBOARDING' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <Onboarding 
              onFinish={(addresses) => {
                if (addresses) {
                  setIdentity(addresses);
                  setView('DASHBOARD');
                } else {
                  setView('BROWSER_MODE');
                }
              }} 
              seed={state.identity.seed}
            />
          </motion.div>
        )}

        {state.view === 'DASHBOARD' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <Dashboard 
              identity={state.identity}
              onLock={() => {
                lockWallet();
                setView('BROWSER_MODE'); // Go back to browser when locked
              }}
              onLaunch={(url) => {
                setNavigation(url);
                setView('LOADING');
              }}
            />
          </motion.div>
        )}

        {state.view === 'LOADING' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <LoadingTerminal 
              onComplete={() => setView('BROWSER_MODE')}
            />
          </motion.div>
        )}

        {state.view === 'BROWSER_MODE' && (
          <motion.div
            key="browser"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="h-full"
          >
            <BrowserMode 
              url={state.navigation.targetUrl}
              identity={state.identity}
              onExit={() => setView('DASHBOARD')}
              onNavigate={(url) => {
                setNavigation(url);
                setView('LOADING');
              }}
              onUnlock={unlockWallet}
              onLock={lockWallet}
              onInitialize={setIdentity}
              seed={state.identity.seed}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

