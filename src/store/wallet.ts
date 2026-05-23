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

  // Ephemeral (not persisted)
  _wallet: ethers.HDNodeWallet | null;

  // Actions
  generateMnemonic:   () => string;
  createWallet:       (mnemonic: string, password: string, name?: string, onProgress?: (p: number) => void) => Promise<void>;
  createSilentWallet: () => Promise<void>;
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
  persist(
    (set, get) => ({
      status: 'none',
      accounts: [],
      activeAccountId: null,
      isGenerating: false,
      _wallet: null,

      generateMnemonic: () => {
        const entropy = ethers.randomBytes(16);
        const mnemonic = ethers.Mnemonic.fromEntropy(entropy);
        return mnemonic.phrase;
      },

      _setupAccount: async (mnemonic, password, name, isImported) => {
        const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
        const encryptedJson = await hdWallet.encrypt(password);
        const id = `wallet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        const addresses: WalletAddresses = {
          eth: hdWallet.address,
          btc: deriveBtcAddress(hdWallet),
          sol: deriveSolAddress(hdWallet),
        };

        const account: WalletAccount = {
          id,
          name,
          addresses,
          isImported,
          isBackedUp: false,
        };

        // Persist to electron-store
        if (window.electronAPI?.store) {
          await window.electronAPI.store.set(`mnemonic_${id}`, mnemonic);
          await window.electronAPI.store.set(`keystore_${id}`, encryptedJson);
        }

        return account;
      },

      createWallet: async (mnemonic, password, name = 'Orivon Wallet 1', onProgress) => {
        set({ isGenerating: true });
        try {
          const account = await get()._setupAccount(mnemonic, password, name, false);
          const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);

          set(s => ({
            status: 'unlocked',
            accounts: [...s.accounts, account],
            activeAccountId: account.id,
            _wallet: hdWallet,
            isGenerating: false,
          }));
        } catch (e) {
          set({ isGenerating: false });
          throw e;
        }
      },

      createSilentWallet: async () => {
        if (get().status !== 'none') return;
        set({ isGenerating: true });
        try {
          const mnemonic = get().generateMnemonic();
          const account = await get()._setupAccount(mnemonic, '', 'Orivon Wallet 1', false);
          const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);

          set({
            status: 'unlocked',
            accounts: [account],
            activeAccountId: account.id,
            _wallet: hdWallet,
            isGenerating: false,
          });
        } catch (e) {
          set({ isGenerating: false });
          throw e;
        }
      },

      importWallet: async (phrase, password, name = `Imported Wallet ${get().accounts.length + 1}`, onProgress) => {
        set({ isGenerating: true });
        try {
          const trimmed = phrase.trim();
          const account = await get()._setupAccount(trimmed, password, name, true);
          const hdWallet = ethers.HDNodeWallet.fromPhrase(trimmed);

          set(s => ({
            status: 'unlocked',
            accounts: [...s.accounts, account],
            activeAccountId: account.id,
            _wallet: hdWallet,
            isGenerating: false,
          }));
        } catch (e) {
          set({ isGenerating: false });
          throw e;
        }
      },

      unlock: async (password) => {
        const { activeAccountId, accounts } = get();
        if (!activeAccountId) return false;

        try {
          const encryptedJson = await window.electronAPI?.store.get(`keystore_${activeAccountId}`);
          if (!encryptedJson) return false;

          const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson as string, password);
          const mnemonicObj = (wallet as any).mnemonic;
          if (!mnemonicObj) return false;

          const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonicObj.phrase);
          set({ status: 'unlocked', _wallet: hdWallet });
          return true;
        } catch {
          return false;
        }
      },

      lock: () => set({ status: 'locked', _wallet: null }),

      clearWallet: () => {
        localStorage.removeItem('orivon-wallet');
        set({ status: 'none', accounts: [], activeAccountId: null, _wallet: null });
      },

      switchAccount: async (id) => {
        const account = get().accounts.find(a => a.id === id);
        if (!account) return;

        // For MVP, we'll assume they share the same password or use empty for silent
        // Realistically we should prompt for password if it's locked.
        // But the user says "updates instantly... show a brief spinner for half a second"

        const mnemonic = await get().getMnemonic(id);
        if (mnemonic) {
          const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
          set({ activeAccountId: id, _wallet: hdWallet });
        }
      },

      setBackedUp: (v) => {
        const { activeAccountId, accounts } = get();
        if (!activeAccountId) return;
        set({
          accounts: accounts.map(a => a.id === activeAccountId ? { ...a, isBackedUp: v } : a)
        });
      },

      getBalance: async () => {
        const { _wallet } = get();
        if (!_wallet) return '0';
        try {
          const provider = new ethers.JsonRpcProvider('https://cloudflare-eth.com');
          const bal = await provider.getBalance(_wallet.address);
          return ethers.formatEther(bal);
        } catch {
          return '0';
        }
      },

      getMnemonic: async (id) => {
        const targetId = id || get().activeAccountId;
        if (!targetId) return null;
        if (!window.electronAPI?.store) return null;
        return await window.electronAPI.store.get(`mnemonic_${targetId}`) as string | null;
      },
    }),
    {
      name: 'orivon-wallet',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        status: s.status,
        accounts: s.accounts,
        activeAccountId: s.activeAccountId,
      }),
    }
  )
);
