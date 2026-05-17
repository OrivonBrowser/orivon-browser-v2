/// <reference types="vite/client" />

interface ElectronAPI {
  platform: NodeJS.Platform;
  isElectron: boolean;
  store: {
    get:    (key: string) => Promise<unknown>;
    set:    (key: string, value: unknown) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
  };
  resolveURL: (url: string) => Promise<{
    ok: boolean;
    url: string;
    originalUrl: string;
    type: 'https' | 'http' | 'ens' | 'ipfs' | 'ipns' | 'search' | 'error';
    ipfsGateway?: string;
    ensAddress?: string;
    error?: string;
  }>;
  window: {
    minimize: () => void;
    maximize: () => void;
    close:    () => void;
  };
  openExternal: (url: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
