export type ViewState = 'ONBOARDING' | 'DASHBOARD' | 'LOADING' | 'BROWSER_MODE';

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
  };
  navigation: {
    targetUrl: string;
    currentUrl: string;
  };
}
