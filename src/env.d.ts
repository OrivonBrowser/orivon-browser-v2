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
  getWallet: () => Promise<{
    address: string;
    name: string;
    hasWallet: boolean;
  }>;
  importWallet: (mnemonic: string) => Promise<{
    success: boolean;
    address?: string;
    error?: string;
  }>;
  updater: {
    onAvailable:  (cb: (version: string) => void) => void;
    onProgress:   (cb: (pct: number)     => void) => void;
    onDownloaded: (cb: (version: string) => void) => void;
    onError:      (cb: (msg: string)     => void) => void;
    restartAndInstall: () => void;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
