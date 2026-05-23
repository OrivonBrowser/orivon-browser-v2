import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ethers } from 'ethers';

export type WalletStatus = 'none' | 'locked' | 'unlocked';

export interface WalletAddresses {
  eth: string;
  btc: string;
  sol: string;
}

interface WalletState {
  status: WalletStatus;
  encryptedJson: string | null;   // Persisted encrypted keystore
  addresses: WalletAddresses | null;
  mnemonic: string | null;        // Only set during creation flow, cleared after

  // Ephemeral (not persisted)
  _wallet: ethers.HDNodeWallet | null;

  // Actions
  generateMnemonic:   () => string;
  createWallet:       (mnemonic: string, password: string, onProgress?: (p: number) => void) => Promise<void>;
  createSilentWallet: () => Promise<void>;
  importWallet:       (phrase: string, password: string, onProgress?: (p: number) => void) => Promise<void>;
  unlock:             (password: string) => Promise<boolean>;
  lock:               () => void;
  clearWallet:        () => void;
  sign:               (message: string) => Promise<string | null>;
  signTypedData:      (domain: ethers.TypedDataDomain, types: Record<string, ethers.TypedDataField[]>, value: Record<string, unknown>) => Promise<string | null>;
  getBalance:         () => Promise<string>;
}

// BTC address from ETH private key (simplified P2WPKH-style for display)
function deriveBtcAddress(wallet: ethers.HDNodeWallet): string {
  // Derive BIP44 Bitcoin path from same HD root
  const btcPath = "m/44'/0'/0'/0/0";
  try {
    const btcNode = wallet.derivePath(btcPath.replace("m/", ""));
    const hash = ethers.ripemd160(ethers.sha256(btcNode.publicKey));
    return `bc1q${hash.slice(2, 22)}`; // Simplified bech32-style display
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
      encryptedJson: null,
      addresses: null,
      mnemonic: null,
      _wallet: null,

      generateMnemonic: () => {
        const entropy = ethers.randomBytes(16);
        const mnemonic = ethers.Mnemonic.fromEntropy(entropy);
        set({ mnemonic: mnemonic.phrase });
        return mnemonic.phrase;
      },

      createWallet: async (mnemonic, password, onProgress) => {
        const wallet = ethers.Wallet.fromPhrase(mnemonic);
        const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);

        onProgress?.(10);
        const encryptedJson = await wallet.encrypt(
          password,
          onProgress ? (p: number) => onProgress(10 + Math.round(p * 85)) : undefined
        );
        onProgress?.(95);

        const addresses: WalletAddresses = {
          eth: wallet.address,
          btc: deriveBtcAddress(hdWallet),
          sol: deriveSolAddress(hdWallet),
        };

        set({
          status: 'unlocked',
          encryptedJson,
          addresses,
          mnemonic: null,
          _wallet: hdWallet,
        });
        onProgress?.(100);
      },

      createSilentWallet: async () => {
        const entropy = ethers.randomBytes(16);
        const mnemonic = ethers.Mnemonic.fromEntropy(entropy);
        const wallet = ethers.Wallet.fromPhrase(mnemonic.phrase);
        const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic.phrase);

        // Silent wallet uses a default internal password for initial encryption
        const encryptedJson = await wallet.encrypt('');

        const addresses: WalletAddresses = {
          eth: wallet.address,
          btc: deriveBtcAddress(hdWallet),
          sol: deriveSolAddress(hdWallet),
        };

        set({
          status: 'unlocked',
          encryptedJson,
          addresses,
          mnemonic: null,
          _wallet: hdWallet,
        });
      },

      importWallet: async (phrase, password, onProgress) => {
        // Validate phrase
        const trimmed = phrase.trim();
        const wordCount = trimmed.split(/\s+/).length;
        if (wordCount !== 12 && wordCount !== 24) {
          throw new Error('Recovery phrase must be 12 or 24 words');
        }

        const wallet = ethers.Wallet.fromPhrase(trimmed);
        const hdWallet = ethers.HDNodeWallet.fromPhrase(trimmed);

        onProgress?.(10);
        const encryptedJson = await wallet.encrypt(
          password,
          onProgress ? (p: number) => onProgress(10 + Math.round(p * 85)) : undefined
        );
        onProgress?.(95);

        const addresses: WalletAddresses = {
          eth: wallet.address,
          btc: deriveBtcAddress(hdWallet),
          sol: deriveSolAddress(hdWallet),
        };

        set({
          status: 'unlocked',
          encryptedJson,
          addresses,
          mnemonic: null,
          _wallet: hdWallet,
        });
        onProgress?.(100);
      },

      unlock: async (password) => {
        const { encryptedJson } = get();
        if (!encryptedJson) return false;
        try {
          const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
          const hdWallet = ethers.HDNodeWallet.fromPhrase(
            (wallet as ethers.Wallet & { mnemonic?: ethers.Mnemonic }).mnemonic?.phrase ?? ''
          );
          set({ status: 'unlocked', _wallet: hdWallet.mnemonic ? hdWallet : wallet as unknown as ethers.HDNodeWallet });
          return true;
        } catch {
          return false;
        }
      },

      lock: () => set({ status: 'locked', _wallet: null }),

      clearWallet: () => {
        // Wipe all persisted Zustand stores so the next launch starts fresh
        ['orivon-wallet', 'orivon-tabs', 'orivon-runtime'].forEach(k =>
          localStorage.removeItem(k)
        );
        set({ status: 'none', encryptedJson: null, addresses: null, mnemonic: null, _wallet: null });
      },

      sign: async (message) => {
        const { _wallet } = get();
        if (!_wallet) return null;
        try {
          return await _wallet.signMessage(message);
        } catch {
          return null;
        }
      },

      signTypedData: async (domain, types, value) => {
        const { _wallet } = get();
        if (!_wallet) return null;
        try {
          return await _wallet.signTypedData(domain, types, value);
        } catch {
          return null;
        }
      },

      getBalance: async () => {
        const { addresses } = get();
        if (!addresses) return '0';
        try {
          const provider = new ethers.JsonRpcProvider('https://cloudflare-eth.com');
          const bal = await provider.getBalance(addresses.eth);
          return ethers.formatEther(bal);
        } catch {
          return '0';
        }
      },
    }),
    {
      name: 'orivon-wallet',
      storage: createJSONStorage(() => localStorage),
      // Never persist the in-memory wallet instance
      partialize: (s) => ({
        status: s.status === 'unlocked' ? 'locked' : s.status, // Always start locked
        encryptedJson: s.encryptedJson,
        addresses: s.addresses,
        mnemonic: null,
        _wallet: null,
      }),
    }
  )
);
