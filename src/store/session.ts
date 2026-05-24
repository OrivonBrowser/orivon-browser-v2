import { create } from 'zustand';

interface SessionState {
  hasOnboarded: boolean;
  hasSeenDashboardWelcome: boolean;
  installedApps: Record<string, boolean>;

  // Actions
  setHasOnboarded: (v: boolean) => void;
  setHasSeenDashboardWelcome: (v: boolean) => void;
  installApp: (appName: string) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  hasOnboarded: false,
  hasSeenDashboardWelcome: false,
  installedApps: {
    'Uniswap Module': true,
    'ENS Resolver': true,
    'IPFS Module': true,
    'Bitcoin Node': true,
  },

  setHasOnboarded: (v) => set({ hasOnboarded: v }),
  setHasSeenDashboardWelcome: (v) => set({ hasSeenDashboardWelcome: v }),
  installApp: (appName) => set((s) => ({ 
    installedApps: { ...s.installedApps, [appName]: true } 
  })),
  resetSession: () => set({
    hasOnboarded: false,
    hasSeenDashboardWelcome: false,
    installedApps: {
      'Uniswap Module': true,
      'ENS Resolver': true,
      'IPFS Module': true,
      'Bitcoin Node': true,
    },
  }),
}));
