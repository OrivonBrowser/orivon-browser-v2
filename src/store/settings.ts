import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

interface SettingsState {
  theme: Theme;
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  homepage: string;
  searchEngine: 'google' | 'duckduckgo' | 'brave' | 'web3compass';
  web3ScoreProvider: string;
  blockTrackers: boolean;
  blockAds: boolean;
  showWeb3Scores: boolean;
  ipfsGateway: string;
  rpcUrl: string;

  // Actions
  setTheme: (theme: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setHomepage: (url: string) => void;
  setSearchEngine: (engine: SettingsState['searchEngine']) => void;
  setWeb3ScoreProvider: (v: string) => void;
  setBlockTrackers: (v: boolean) => void;
  setBlockAds: (v: boolean) => void;
  setShowWeb3Scores: (v: boolean) => void;
  setIpfsGateway: (url: string) => void;
  setRpcUrl: (url: string) => void;
}

export const useSettings = create<SettingsState>()(
  (set) => ({
    theme: 'dark',
    sidebarOpen: true,
    rightPanelOpen: false,
    homepage: 'orivon://newtab',
    searchEngine: 'web3compass',
    web3ScoreProvider: 'Orivon Native',
    blockTrackers: true,
    blockAds: true,
    showWeb3Scores: true,
    ipfsGateway: 'https://ipfs.io',
    rpcUrl: 'https://cloudflare-eth.com',

    setTheme:          (theme)         => set({ theme }),
    setSidebarOpen:    (sidebarOpen)   => set({ sidebarOpen }),
    setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
    setHomepage:       (homepage)      => set({ homepage }),
    setSearchEngine:   (searchEngine)  => set({ searchEngine }),
    setWeb3ScoreProvider: (web3ScoreProvider) => set({ web3ScoreProvider }),
    setBlockTrackers:  (v)             => set({ blockTrackers: v }),
    setBlockAds:       (v)             => set({ blockAds: v }),
    setShowWeb3Scores: (v)             => set({ showWeb3Scores: v }),
    setIpfsGateway:    (url)           => set({ ipfsGateway: url }),
    setRpcUrl:         (url)           => set({ rpcUrl: url }),
  })
);
