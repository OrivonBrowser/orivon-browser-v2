/**
 * BrowserMode — kept for routing compatibility.
 * The full browser implementation lives in src/components/Browser.tsx.
 * State is managed by Zustand stores (tabs, settings, wallet, runtime).
 */
import Browser from '../components/Browser';
import { AppState, WalletAddresses } from '../types';

// Props are kept for interface compatibility with App.tsx but Browser reads
// all state directly from Zustand stores.
interface BrowserModeProps {
  url: string;
  identity: AppState['identity'];
  onExit: () => void;
  onNavigate: (url: string) => void;
  onUnlock: () => void;
  onLock: () => void;
  onInitialize: (addresses: WalletAddresses) => void;
  seed: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function BrowserMode(_props: BrowserModeProps) {
  return <Browser />;
}
