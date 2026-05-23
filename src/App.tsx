/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import Browser    from './components/Browser';
import { useSettings }   from './store/settings';

export const DASHBOARD_URL = 'orivon://dashboard';

export default function App() {
  const { theme } = useSettings();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-gray-400 mb-6">The application encountered an unexpected error.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-500 transition-colors"
        >
          Reload App
        </button>
      </div>
    );
  }

  const ease = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white">
      <AnimatePresence mode="wait">

        <motion.div key="browser" className="h-full"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={ease}
        >
          <Browser />
        </motion.div>

      </AnimatePresence>
    </div>
  );
}
