import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TabEntry {
  id: string;
  url: string;            // Currently loaded URL (resolved)
  displayUrl: string;     // What shows in address bar (original input)
  title: string;
  favicon?: string;
  isLoading: boolean;
  history: string[];      // Back/forward history for this tab
  historyIndex: number;
  type: 'https' | 'http' | 'ens' | 'ipfs' | 'ipns' | 'search' | 'newtab' | 'settings';
  web3Score?: { trust: number; security: number; privacy: number };
  pinned?: boolean;
  createdAt: number;
}

interface TabsState {
  tabs: TabEntry[];
  activeTabId: string;

  // Actions
  addTab:       (url?: string) => string;
  closeTab:     (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab:    (id: string, patch: Partial<TabEntry>) => void;
  navigateTab:  (id: string, url: string, displayUrl: string, type: TabEntry['type']) => void;
  goBack:       (id: string) => string | null;
  goForward:    (id: string) => string | null;
  pinTab:       (id: string) => void;
  reorderTabs:  (from: number, to: number) => void;
  closeAllTabs: () => void;
}

const NEW_TAB_URL = 'orivon://newtab';

function makeTab(url = NEW_TAB_URL): TabEntry {
  return {
    id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    url,
    displayUrl: url === NEW_TAB_URL ? '' : url,
    title: url === NEW_TAB_URL ? 'New Tab' : url,
    isLoading: false,
    history: [url],
    historyIndex: 0,
    type: url === NEW_TAB_URL ? 'newtab' : 'https',
    createdAt: Date.now(),
  };
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [makeTab()],
      activeTabId: '',

      addTab: (url = NEW_TAB_URL) => {
        const tab = makeTab(url);
        set(s => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }));
        return tab.id;
      },

      closeTab: (id) => {
        const { tabs, activeTabId } = get();
        if (tabs.length === 1) {
          // Replace with new tab instead of closing
          const fresh = makeTab();
          set({ tabs: [fresh], activeTabId: fresh.id });
          return;
        }
        const idx = tabs.findIndex(t => t.id === id);
        const remaining = tabs.filter(t => t.id !== id);
        let next = activeTabId;
        if (id === activeTabId) {
          next = (remaining[idx] ?? remaining[idx - 1] ?? remaining[0]).id;
        }
        set({ tabs: remaining, activeTabId: next });
      },

      setActiveTab: (id) => set({ activeTabId: id }),

      updateTab: (id, patch) =>
        set(s => ({
          tabs: s.tabs.map(t => (t.id === id ? { ...t, ...patch } : t)),
        })),

      navigateTab: (id, url, displayUrl, type) => {
        // Internal orivon:// pages render as React components — no network request,
        // so never mark them as loading.
        const isInternal = url.startsWith('orivon://');
        const autoTitle  = url === NEW_TAB_URL     ? 'New Tab'
                         : url.includes('dashboard') ? 'Dashboard'
                         : displayUrl || url;
        set(s => ({
          tabs: s.tabs.map(t => {
            if (t.id !== id) return t;
            const newHistory = [...t.history.slice(0, t.historyIndex + 1), url];
            return {
              ...t,
              url,
              displayUrl,
              type,
              isLoading: !isInternal,
              title: autoTitle,
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          }),
        }));
      },

      goBack: (id) => {
        const tab = get().tabs.find(t => t.id === id);
        if (!tab || tab.historyIndex <= 0) return null;
        const url = tab.history[tab.historyIndex - 1];
        set(s => ({
          tabs: s.tabs.map(t =>
            t.id === id ? { ...t, historyIndex: t.historyIndex - 1, url, isLoading: true } : t
          ),
        }));
        return url;
      },

      goForward: (id) => {
        const tab = get().tabs.find(t => t.id === id);
        if (!tab || tab.historyIndex >= tab.history.length - 1) return null;
        const url = tab.history[tab.historyIndex + 1];
        set(s => ({
          tabs: s.tabs.map(t =>
            t.id === id ? { ...t, historyIndex: t.historyIndex + 1, url, isLoading: true } : t
          ),
        }));
        return url;
      },

      pinTab: (id) =>
        set(s => ({
          tabs: s.tabs.map(t => (t.id === id ? { ...t, pinned: !t.pinned } : t)),
        })),

      reorderTabs: (from, to) =>
        set(s => {
          const tabs = [...s.tabs];
          const [moved] = tabs.splice(from, 1);
          tabs.splice(to, 0, moved);
          return { tabs };
        }),

      closeAllTabs: () => {
        const fresh = makeTab();
        set({ tabs: [fresh], activeTabId: fresh.id });
      },
    }),
    {
      name: 'orivon-tabs',
      storage: createJSONStorage(() => localStorage),
      // Don't persist loading state — reset on restore
      partialize: (s) => ({
        ...s,
        tabs: s.tabs.map(t => ({ ...t, isLoading: false })),
      }),
      onRehydrateStorage: () => (state) => {
        // Fix missing activeTabId after rehydration
        if (state && (!state.activeTabId || !state.tabs.find(t => t.id === state.activeTabId))) {
          state.activeTabId = state.tabs[0]?.id ?? '';
        }
      },
    }
  )
);

export const NEW_TAB = NEW_TAB_URL;
