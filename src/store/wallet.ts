import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ethers } from 'ethers';

export type WalletStatus = 'none' | 'locked' | 'unlocked';

export interface WalletAddresses {
  eth: string;
  btc: string;
  sol: string;
}

export interface WalletAccount {
  id: string;
  name: string;
  addresses: WalletAddresses;
  isImported: boolean;
  isBackedUp: boolean;
}

interface WalletState {
  status: WalletStatus;
  accounts: WalletAccount[];
  activeAccountId: string | null;
  isGenerating: boolean;
  error: string | null;

  // Ephemeral (not persisted)
  _wallet: ethers.HDNodeWallet | null;

  // Actions
  initialize:         () => Promise<void>;
  importWallet:       (phrase: string, password: string, name?: string, onProgress?: (p: number) => void) => Promise<void>;
  unlock:             (password: string) => Promise<boolean>;
  lock:               () => void;
  clearWallet:        () => void;
  switchAccount:      (id: string) => Promise<void>;
  setBackedUp:        (v: boolean) => void;
  getBalance:         () => Promise<string>;
  getMnemonic:        (id?: string) => Promise<string | null>;

  // Internal helpers
  _setupAccount: (mnemonic: string, password: string, name: string, isImported: boolean) => Promise<WalletAccount>;
}

// BTC address from ETH private key (simplified P2WPKH-style for display)
function deriveBtcAddress(wallet: ethers.HDNodeWallet): string {
  const btcPath = "m/44'/0'/0'/0/0";
  try {
    const btcNode = wallet.derivePath(btcPath.replace("m/", ""));
    const hash = ethers.ripemd160(ethers.sha256(btcNode.publicKey));
    return `bc1q${hash.slice(2, 22)}`;
  } catch {
    return `bc1q${wallet.address.slice(2, 22).toLowerCase()}`;
  }
}

// SOL address from HD derivation (display-only for MVP)
function deriveSolAddress(wallet: ethers.HDNodeWallet): string {
  const solPath = "m/44'/501'/0'/0'";
  try {
    const node = wallet.derivePath(solPath.replace("m/", ""));
    const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const bytes = ethers.getBytes(node.publicKey).slice(0, 32);
    let result = '';
    for (let i = 0; i < 32; i++) result += base58chars[bytes[i] % 58];
    return result;
  } catch {
    return `SOL${wallet.address.slice(2, 30)}`;
  }
}

export const useWalletStore = create<WalletState>()(
  (set, get) => ({
    status: 'none',
    accounts: [],
    activeAccountId: null,
    isGenerating: false,
    error: null,
    _wallet: null,

    initialize: async () => {
      try {
        if (!window.electronAPI?.getWallet) return;
        const walletData = await window.electronAPI.getWallet();
        if (walletData.hasWallet) {
          const { accounts } = get();
          const nativeExists = accounts.some(a => a.id === 'wallet-native');

          if (!nativeExists) {
            const mnemonicData = await window.electronAPI.getMnemonic();
            const mnemonic = mnemonicData?.mnemonic;
            if (mnemonic) {
              const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
              const account: WalletAccount = {
                id: 'wallet-native',
                name: walletData.name || 'Orivon Wallet 1',
                addresses: {
                  eth: hdWallet.address,
                  btc: deriveBtcAddress(hdWallet),
                  sol: deriveSolAddress(hdWallet),
                },
                isImported: false,
                isBackedUp: false,
              };

              set({
                accounts: [account, ...accounts],
                activeAccountId: account.id,
                status: 'unlocked',
                _wallet: hdWallet
              });
            }
          }
        }
      } catch (e) {
        console.error('Wallet initialization failed:', e);
      }
    },

    _setupAccount: async (mnemonic, password, name, isImported) => {
      const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
      const id = `wallet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const account: WalletAccount = {
        id, name, isImported, isBackedUp: false,
        addresses: { eth: hdWallet.address, btc: deriveBtcAddress(hdWallet), sol: deriveSolAddress(hdWallet) },
      };
      return account;
    },

    importWallet: async (phrase, password, name = `Imported Wallet ${get().accounts.length + 1}`) => {
      set({ isGenerating: true, error: null });
      try {
        const account = await get()._setupAccount(phrase.trim(), password, name, true);
        const hdWallet = ethers.HDNodeWallet.fromPhrase(phrase.trim());
        set(s => ({
          status: 'unlocked',
          accounts: [...s.accounts, account],
          activeAccountId: account.id,
          _wallet: hdWallet,
          isGenerating: false
        }));
      } catch (e: any) {
        set({ isGenerating: false, error: e.message });
      }
    },

    unlock: async () => true, // Auto-unlock for debugging
    lock: () => set({ status: 'locked', _wallet: null }),
    clearWallet: () => set({ status: 'none', accounts: [], activeAccountId: null, _wallet: null }),
    switchAccount: async (id) => set({ activeAccountId: id }),
    setBackedUp: (v) => {
      const { activeAccountId, accounts } = get();
      if (!activeAccountId) return;
      set({ accounts: accounts.map(a => a.id === activeAccountId ? { ...a, isBackedUp: v } : a) });
    },
    getBalance: async () => '0',
    getMnemonic: async (id) => null,
  })
);
