export type ViewState = 'ONBOARDING' | 'DASHBOARD' | 'LOADING' | 'BROWSER_MODE';
export type WalletStatus = 'GUEST' | 'LOCKED' | 'UNLOCKED';

export interface WalletAddresses {
  btc: string;
  eth: string;
  sol: string;
}

export interface AppState {
  view: ViewState;
  identity: {
    seed: string;
    addresses: WalletAddresses | null;
    isInitialized: boolean;
    isLocked: boolean;
  };
  navigation: {
    targetUrl: string;
    currentUrl: string;
  };
}
