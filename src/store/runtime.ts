import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type NodeStatus = 'active' | 'syncing' | 'standby' | 'error';

interface RuntimeNode {
  id: string;
  name: string;
  status: NodeStatus;
  detail: string;
  enabled: boolean;
}

interface RuntimeState {
  nodes: RuntimeNode[];
  runtimeVersion: string;
  isInitialized: boolean;
  logs: { ts: number; msg: string; level: 'info' | 'warn' | 'error' }[];

  // Actions
  toggleNode:   (id: string) => void;
  addLog:       (msg: string, level?: 'info' | 'warn' | 'error') => void;
  clearLogs:    () => void;
  setNodeStatus:(id: string, status: NodeStatus, detail?: string) => void;
}

const DEFAULT_NODES: RuntimeNode[] = [
  { id: 'wasm',  name: 'WASM Sandbox',       status: 'active',  detail: 'Isolation level 4', enabled: true },
  { id: 'ens',   name: 'ENS Resolver',        status: 'active',  detail: 'Ethereum mainnet',  enabled: true },
  { id: 'ipfs',  name: 'IPFS Gateway',        status: 'active',  detail: 'ipfs.io + fallbacks', enabled: true },
  { id: 'p2p',   name: 'P2P Mesh',            status: 'standby', detail: 'libp2p ready',      enabled: false },
  { id: 'btc',   name: 'Bitcoin Light Client',status: 'standby', detail: 'BIP157 headers',    enabled: false },
];

export const useRuntimeStore = create<RuntimeState>()(
  persist(
    (set) => ({
      nodes: DEFAULT_NODES,
      runtimeVersion: '0.94.1',
      isInitialized: true,
      logs: [
        { ts: Date.now(), msg: 'Orivon runtime initialized', level: 'info' },
        { ts: Date.now(), msg: 'WASM sandbox ready (isolation level 4)', level: 'info' },
        { ts: Date.now(), msg: 'ENS resolver connected to Ethereum mainnet', level: 'info' },
        { ts: Date.now(), msg: 'IPFS gateway active: ipfs.io', level: 'info' },
      ],

      toggleNode: (id) =>
        set(s => ({
          nodes: s.nodes.map(n =>
            n.id === id ? { ...n, enabled: !n.enabled, status: n.enabled ? 'standby' : 'active' } : n
          ),
        })),

      addLog: (msg, level = 'info') =>
        set(s => ({
          logs: [...s.logs.slice(-199), { ts: Date.now(), msg, level }],
        })),

      clearLogs: () => set({ logs: [] }),

      setNodeStatus: (id, status, detail) =>
        set(s => ({
          nodes: s.nodes.map(n => (n.id === id ? { ...n, status, ...(detail ? { detail } : {}) } : n)),
        })),
    }),
    {
      name: 'orivon-runtime',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ nodes: s.nodes, runtimeVersion: s.runtimeVersion }),
    }
  )
);
