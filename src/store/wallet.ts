import { create } from 'zustand';
import { ethers } from 'ethers';
import { DEMO_WALLET } from '../constants';

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
  balance_eth?: number;
  balance_usd?: number;
}

interface WalletState {
  status: WalletStatus;
  accounts: WalletAccount[];
  activeAccountId: string | null;
  isGenerating: boolean;
  error: string | null;
  password: string | null;

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
  setPassword:        (pw: string) => void;

  // Internal helpers
  _setupAccount: (mnemonic: string, password: string, name: string, isImported: boolean) => Promise<WalletAccount>;
}

export const useWalletStore = create<WalletState>()(
  (set, get) => ({
    status: 'unlocked', // Default to unlocked for demo
    accounts: [
      {
        id: 'wallet-demo-1',
        name: DEMO_WALLET.name,
        addresses: {
          eth: DEMO_WALLET.address,
          btc: 'bc1q71c7656ec7ab88b098defb751b7401b5f6d8976f',
          sol: 'ORIVON71C7656EC7ab88b098defB751B7401B5f6d8',
        },
        isImported: false,
        isBackedUp: false,
        balance_eth: DEMO_WALLET.balance_eth,
        balance_usd: DEMO_WALLET.balance_usd,
      }
    ],
    activeAccountId: 'wallet-demo-1',
    isGenerating: false,
    error: null,
    password: null,
    _wallet: null,

    initialize: async () => {
      // For demo, we already initialized with accounts in the default state
    },

    _setupAccount: async (mnemonic, password, name, isImported) => {
      // In demo, we just return the trading wallet if it looks like the demo import
      if (mnemonic.includes('venture capital market')) {
        return {
          id: 'wallet-demo-2',
          name: DEMO_WALLET.imported_wallet.name,
          isImported: true,
          isBackedUp: true,
          addresses: {
            eth: DEMO_WALLET.imported_wallet.address,
            btc: 'bc1q3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
            sol: 'TRADING3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
          },
          balance_eth: DEMO_WALLET.imported_wallet.balance_eth,
          balance_usd: DEMO_WALLET.imported_wallet.balance_usd,
        };
      }
      
      const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
      const id = `wallet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const account: WalletAccount = {
        id, name, isImported, isBackedUp: false,
        addresses: { eth: hdWallet.address, btc: `bc1q${hdWallet.address.slice(2, 22).toLowerCase()}`, sol: `SOL${hdWallet.address.slice(2, 30)}` },
      };
      return account;
    },

    importWallet: async (phrase, password, name) => {
      set({ isGenerating: true, error: null });
      try {
        const account = await get()._setupAccount(phrase.trim(), password, name || 'Imported Wallet', true);
        set(s => ({
          status: 'unlocked',
          accounts: s.accounts.some(a => a.id === account.id) ? s.accounts : [...s.accounts, account],
          activeAccountId: account.id,
          isGenerating: false
        }));
      } catch (e: any) {
        set({ isGenerating: false, error: e.message });
      }
    },

    unlock: async () => true,
    lock: () => set({ status: 'locked' }),
    clearWallet: () => set({ status: 'none', accounts: [], activeAccountId: null }),
    switchAccount: async (id) => set({ activeAccountId: id }),
    setBackedUp: (v) => {
      const { activeAccountId, accounts } = get();
      if (!activeAccountId) return;
      set({ accounts: accounts.map(a => a.id === activeAccountId ? { ...a, isBackedUp: v } : a) });
    },
    getBalance: async () => {
      const { accounts, activeAccountId } = get();
      const active = accounts.find(a => a.id === activeAccountId);
      return (active?.balance_eth ?? 0).toString();
    },
    getMnemonic: async (id) => DEMO_WALLET.mnemonic,
    setPassword: (pw) => set({ password: pw }),
  })
);
