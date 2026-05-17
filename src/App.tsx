/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ethers } from 'ethers';

import { ViewState } from './types';
import Onboarding     from './views/Onboarding';
import Dashboard      from './views/Dashboard';
import LoadingTerminal from './views/LoadingTerminal';
import Browser        from './components/Browser';

import { useWalletStore }  from './store/wallet';
import { useSettings }     from './store/settings';
import { useTabsStore }    from './store/tabs';

// Legacy seed used only for the Onboarding display
const DISPLAY_SEED = 'alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima';

type LegacyIdentity = {
  seed: string;
  addresses: { btc: string; eth: string; sol: string } | null;
  isInitialized: boolean;
  isLocked: boolean;
};

export default function App() {
  const { status: walletStatus, addresses, encryptedJson, createWallet, lock, unlock } = useWalletStore();
  const { theme } = useSettings();

  // Determine initial view based on persisted wallet state
  const getInitialView = (): ViewState => {
    if (encryptedJson) return 'BROWSER_MODE';   // Has wallet → go straight to browser
    return 'ONBOARDING';
  };

  const [view, setView]               = useState<ViewState>(getInitialView);
  const [launchUrl, setLaunchUrl]     = useState('');

  // Legacy identity shape that Onboarding / Dashboard expect
  const [legacyIdentity, setLegacyIdentity] = useState<LegacyIdentity>({
    seed: DISPLAY_SEED,
    addresses: addresses
      ? { btc: addresses.btc, eth: addresses.eth, sol: addresses.sol }
      : null,
    isInitialized: walletStatus !== 'none',
    isLocked: walletStatus === 'locked',
  });

  // Keep legacy identity in sync with wallet store
  useEffect(() => {
    setLegacyIdentity({
      seed: DISPLAY_SEED,
      addresses: addresses ?? null,
      isInitialized: walletStatus !== 'none',
      isLocked: walletStatus === 'locked',
    });
  }, [walletStatus, addresses]);

  // Sync theme class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleOnboardingFinish = async (legacyAddresses: { btc: string; eth: string; sol: string } | null) => {
    if (legacyAddresses) {
      // Onboarding created a wallet via the old system — migrate to Zustand store
      // Generate a mnemonic and create encrypted wallet in store
      const entropy = ethers.randomBytes(16);
      const mnemonic = ethers.Mnemonic.fromEntropy(entropy).phrase;
      try {
        await createWallet(mnemonic, 'orivon-default', () => {});
      } catch {
        // Non-fatal: the legacy addresses are still shown
      }
      setView('DASHBOARD');
    } else {
      setView('BROWSER_MODE');
    }
  };

  const handleDashboardLaunch = (url: string) => {
    setLaunchUrl(url);
    setView('LOADING');
  };

  const handleDashboardLock = () => {
    lock();
    setView('BROWSER_MODE');
  };

  const handleLoadingComplete = () => {
    setView('BROWSER_MODE');
    // When coming from dashboard launch, open the URL in the browser store
    if (launchUrl) {
      const { addTab, setActiveTab } = useTabsStore.getState();
      const id = addTab(launchUrl);
      // Browser component will pick up the new tab automatically
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-orivon-bg text-white font-sans selection:bg-orivon-accent selection:text-black">
      <AnimatePresence mode="wait">

        {view === 'ONBOARDING' && (
          <motion.div key="onboarding"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-full"
          >
            <Onboarding
              onFinish={handleOnboardingFinish}
              seed={DISPLAY_SEED}
            />
          </motion.div>
        )}

        {view === 'DASHBOARD' && (
          <motion.div key="dashboard"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <Dashboard
              identity={legacyIdentity}
              onLock={handleDashboardLock}
              onLaunch={handleDashboardLaunch}
            />
          </motion.div>
        )}

        {view === 'LOADING' && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-full"
          >
            <LoadingTerminal onComplete={handleLoadingComplete} />
          </motion.div>
        )}

        {view === 'BROWSER_MODE' && (
          <motion.div key="browser"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-full"
          >
            <Browser />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
