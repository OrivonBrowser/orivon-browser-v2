# Orivon Browser the future of web3

A native Web3 desktop browser built on Electron and Chromium.  
Browse ENS domains, IPFS apps, and the open web with a built-in multi-chain wallet.

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher

### Launch the Electron browser

```bash
npm install
npm run dev
```

This opens the **real Electron desktop application**

---

## Build installable packages

```bash
# macOS (.dmg — Intel + Apple Silicon)
npm run build:mac

# Windows (.exe NSIS installer)
npm run build:win

# Linux (.AppImage)
npm run build:linux

# All platforms at once
npm run dist
```

Installers are saved to the `release/` folder.

---

## User flow

1. **First launch** → Create Wallet · Import Wallet · Open Browser (no wallet)
2. **Create Wallet** → 12-word seed phrase displayed → set password → wallet encrypted locally
3. **Dashboard** → view multi-chain addresses → Open Browser
4. **Browser** → full Chromium browsing, Chrome-style tabs, ENS/IPFS resolution
5. **Wallet button** (top-right toolbar) → manage wallet, settings, network

---

## What works

| Feature | Status |
|---------|--------|
| Real page browsing (Chromium webview) | ✅ |
| ENS domain resolution (`.eth`) | ✅ |
| IPFS link loading (`ipfs://`) | ✅ |
| Multi-tab browsing | ✅ |
| Back / Forward / Reload | ✅ |
| Wallet create / import (BIP-39) | ✅ |
| Encrypted local wallet storage | ✅ |
| Dark / Light theme (persisted) | ✅ |
| Web3 trust/security/privacy scores | ✅ |
| Auto-update via GitHub Releases | ✅ |

---

## All scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | **Launch Electron** in dev mode with live reload |
| `npm run build` | Build all outputs (icons + electron-vite) |
| `npm run build:mac` | Package macOS DMG |
| `npm run build:win` | Package Windows NSIS installer |
| `npm run build:linux` | Package Linux AppImage |
| `npm run dist` | Package all platforms |
| `npm run lint` | TypeScript type-check |
| `npm run clean` | Remove `out/` and `release/` |

---

## Stack

| Layer | Technology |
|-------|------------|
| Desktop shell | Electron 42 + Chromium |
| Frontend | React 19 · TypeScript · TailwindCSS 4 |
| Build | electron-vite 5 · Vite 6 |
| Wallet | ethers.js v6 · BIP-39 / BIP-44 |
| State | Zustand (localStorage persistence) |
| Web3 | ENS via eth.limo · IPFS public gateways |
| Packaging | electron-builder 26 |
| Updates | electron-updater |

---

## Shipping a release

```bash
git tag v0.94.1
git push origin v0.94.1
# → GitHub Actions builds Win / Mac / Linux and publishes to GitHub Releases
```
