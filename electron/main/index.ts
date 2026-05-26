import { app, BrowserWindow, ipcMain, shell, session, Menu, clipboard } from 'electron';
import updaterPkg from 'electron-updater';
const { autoUpdater } = updaterPkg;
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';
import { ethers } from 'ethers';
import bcrypt from 'bcryptjs';
import { resolveURL } from './resolvers/url-router';

// ─── Logger ───────────────────────────────────────────────────────────────────
// electron-log writes to:
//   macOS: ~/Library/Logs/Orivon/main.log
//   Win:   %USERPROFILE%\AppData\Roaming\Orivon\logs\main.log
//   Linux: ~/.config/Orivon/logs/main.log
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.initialize();                        // hook console.* → electron-log in renderer
autoUpdater.logger = log;

const isDev = !!process.env['ELECTRON_RENDERER_URL'];

// Chrome user-agent — must match a real Chrome version so sites like YouTube serve their
// full player with all features (seeking, quality selection, DRM, etc.)
const CHROME_UA = process.platform === 'darwin'
  ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  : process.platform === 'win32'
    ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// ─── Chromium switches (must be set before app.whenReady) ─────────────────────
//
// These affect the entire Chromium instance — not just the shell window.
// Background-tab switches are critical: they stop Chromium from pausing media,
// timers and rendering in tabs that are not currently visible.

// Keep background tabs fully alive (video/audio continues when switching tabs)
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

// Allow media to auto-play without a user gesture (required for many Web3 apps)
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Hardware video decoding (smoother YouTube, reduces CPU)
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-accelerated-video-encode');

// Disable the OS-level media-key handling that Electron intercepts — lets
// media-key events reach the webview instead (pause/play keys work in YouTube)
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

// ─── Persistent store (electron-store) ─────────────────────────────────────────
const store = new Store();

let sessionUnlocked = false;

ipcMain.handle('is-wallet-secured', () => {
  return !!store.get('wallet_secured');
});

ipcMain.handle('is-wallet-unlocked', () => {
  return sessionUnlocked;
});

ipcMain.handle('unlock-wallet', (_event, password) => {
  const stored = store.get('wallet_password_hash') as string;
  if (!stored) return { success: false, error: 'No password set' };
  
  const match = bcrypt.compareSync(password, stored);
  if (match) {
    sessionUnlocked = true;
    return { success: true };
  }
  return { success: false, error: 'Incorrect password' };
});

ipcMain.handle('set-password', (_event, password) => {
  const hash = bcrypt.hashSync(password, 12);
  store.set('wallet_password_hash', hash);
  store.set('wallet_secured', true);
  sessionUnlocked = true;
  return { success: true };
});

ipcMain.handle('onboarding:complete', () => {
  store.set('onboarding_complete', true);
  return true;
});

ipcMain.handle('onboarding:status', () => {
  return !!store.get('onboarding_complete');
});

async function initializeWallet() {
  try {
    const existing = store.get('orivon_wallet_address')
    if (!existing) {
      const wallet = ethers.Wallet.createRandom()
      store.set('orivon_wallet_address', wallet.address)
      store.set('orivon_wallet_mnemonic', wallet.mnemonic?.phrase)
      store.set('orivon_wallet_name', 'Orivon Wallet 1')
      // Also store in an array for switcher as requested later
      store.set('orivon_wallets', [{
        address: wallet.address,
        mnemonic: wallet.mnemonic?.phrase,
        name: 'Orivon Wallet 1'
      }]);
    }
  } catch (err) {
    log.error('Silent wallet init failed:', err)
  }
}

// ─── Window factory ───────────────────────────────────────────────────────────

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    // macOS: hidden Keeps native traffic lights, we position them
    // Windows/Linux: frame:false so we render our own controls
    ...(process.platform === 'darwin'
      ? {
          titleBarStyle: 'hidden' as const,
          trafficLightPosition: { x: 20, y: 10 },
          vibrancy: 'under-window' as const,
        }
      : {
          frame: false,
          titleBarStyle: 'hidden' as const,
        }),
    backgroundColor: '#1a1a1a',
    show: false,
    icon: path.join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  win.setFullScreenable(true);


  win.once('ready-to-show', () => win.show());

  if (isDev) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']!);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Window events for UI updates
  win.on('enter-full-screen', () => {
    win.webContents.send('window:fullscreen-change', true);
  });
  win.on('leave-full-screen', () => {
    win.webContents.send('window:fullscreen-change', false);
  });
  win.on('maximize', () => {
    win.webContents.send('window:maximized-change', true);
  });
  win.on('unmaximize', () => {
    win.webContents.send('window:maximized-change', false);
  });

  // Security & CORS headers for the shell window
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    if (details.url.startsWith('devtools://')) { callback({}); return; }
    
    const responseHeaders = { ...details.responseHeaders };
    
    // Set CSP
    responseHeaders['Content-Security-Policy'] = [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
      "connect-src 'self' https: wss:; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: https:;",
    ];

    // Set CORS (for webviews in the same session)
    if (!responseHeaders['Access-Control-Allow-Origin'] && !responseHeaders['access-control-allow-origin']) {
      responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    }

    callback({ responseHeaders });
  });

  return win;
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

// ─── Application menu (enables Cmd+C/V/X/Z shortcuts system-wide) ────────────
function buildAppMenu() {
  const isMac = process.platform === 'darwin';

  const editMenu: Electron.MenuItemConstructorOptions = {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteAndMatchStyle' },
      { role: 'delete' },
      { role: 'selectAll' },
    ],
  };

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{ label: app.name, submenu: [{ role: 'hide' as const }, { role: 'quit' as const }] }] : []),
    editMenu,
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── Right-click context menu for the renderer shell ─────────────────────────
function setupContextMenu(win: BrowserWindow) {
  win.webContents.on('context-menu', (_e, params) => {
    const items: Electron.MenuItemConstructorOptions[] = [];

    if (params.selectionText) {
      items.push(
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', click: () => clipboard.writeText(params.selectionText) },
        { type: 'separator' },
      );
    }

    if (params.isEditable) {
      items.push(
        { label: 'Cut',       role: 'cut' },
        { label: 'Copy',      role: 'copy' },
        { label: 'Paste',     role: 'paste' },
        { type: 'separator' },
        { label: 'Select All', role: 'selectAll' },
      );
    }

    if (items.length > 0) {
      Menu.buildFromTemplate(items).popup({ window: win });
    }
  });
}

app.whenReady().then(async () => {
  buildAppMenu();
  store.clear();
  await initializeWallet();
  // ── User agent — override for ALL requests from this session ──────────────
  // This makes sites serve the same content they'd serve to Chrome.
  // The webview element also sets useragent="" which overrides navigator.userAgent
  // inside the page — both levels are needed for full YouTube compatibility.
  session.defaultSession.setUserAgent(CHROME_UA);

  // ── Permissions — grant everything webviews ask for ───────────────────────
  // Webview pages need media access (camera, mic, DRM), notifications, etc.
  // We grant everything here; real permission UX can be layered on top later.
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(true); // allow all (media, geolocation, notifications, clipboard, etc.)
  });
  session.defaultSession.setPermissionCheckHandler(() => true);

  const win = createWindow();
  setupContextMenu(win);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const w = createWindow();
      setupContextMenu(w);
    }
  });

  if (!isDev) {
    setupAutoUpdater();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── IPC: Store ───────────────────────────────────────────────────────────────

ipcMain.handle('store:get', (_e, key: string) => {
  return key ? store.get(key) : null;
});
ipcMain.handle('store:set', (_e, key: string, value: unknown) => {
  store.set(key, value); return true;
});
ipcMain.handle('store:delete', (_e, key: string) => {
  store.delete(key); return true;
});

// ─── IPC: Wallet ───────────────────────────────────────────────────────────────

ipcMain.handle('get-wallet', () => {
  return {
    address: store.get('orivon_wallet_address') || null,
    name: store.get('orivon_wallet_name') || null,
    hasWallet: !!store.get('orivon_wallet_address')
  };
});

ipcMain.handle('get-mnemonic', () => {
  return {
    mnemonic: store.get('orivon_wallet_mnemonic') || null
  };
});

ipcMain.handle('import-wallet', async (_e, mnemonic: string) => {
  try {
    const isValid = ethers.Mnemonic.isValidMnemonic(mnemonic);
    if (!isValid) {
      return { success: false, error: 'Invalid seed phrase' };
    }
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    const wallets = (store.get('orivon_wallets') as any[]) || [];
    
    // Check if already exists
    if (wallets.some(w => w.address.toLowerCase() === wallet.address.toLowerCase())) {
        return { success: true, address: wallet.address, alreadyExists: true };
    }

    wallets.push({
      address: wallet.address,
      mnemonic: mnemonic,
      name: `Imported Wallet ${wallets.length + 1}`
    });
    store.set('orivon_wallets', wallets);
    
    // If it's the first wallet (though initializeWallet should have run), set it as active
    if (!store.get('orivon_wallet_address')) {
        store.set('orivon_wallet_address', wallet.address);
        store.set('orivon_wallet_mnemonic', mnemonic);
        store.set('orivon_wallet_name', `Imported Wallet ${wallets.length}`);
    }

    return { success: true, address: wallet.address };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// ─── IPC: URL resolution ──────────────────────────────────────────────────────

ipcMain.handle('resolve:url', async (_e, url: string) => {
  try { return await resolveURL(url); }
  catch (err) { return { ok: false, url, type: 'error', error: String(err) }; }
});

// ─── IPC: Window controls ──────────────────────────────────────────────────────

ipcMain.on('window:minimize', e => BrowserWindow.fromWebContents(e.sender)?.minimize());
ipcMain.on('window:maximize', e => {
  const w = BrowserWindow.fromWebContents(e.sender);
  w?.isMaximized() ? w.unmaximize() : w?.maximize();
});
ipcMain.on('window:close', e => BrowserWindow.fromWebContents(e.sender)?.close());
ipcMain.handle('window:is-maximized', e => BrowserWindow.fromWebContents(e.sender)?.isMaximized());
ipcMain.on('shell:open',   (_e, url: string) => shell.openExternal(url));

// ─── Security: control new windows and navigations ───────────────────────────

app.on('web-contents-created', (_e, contents) => {
  contents.on('will-navigate', (ev, url) => {
    if (url.startsWith('devtools://') && !isDev) ev.preventDefault();
  });

  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url);
    return { action: 'deny' };
  });
});

// ─── Auto-updater ─────────────────────────────────────────────────────────────

function broadcast(channel: string, ...args: unknown[]) {
  BrowserWindow.getAllWindows().forEach(w => {
    if (!w.isDestroyed()) w.webContents.send(channel, ...args);
  });
}

function setupAutoUpdater() {
  // Download updates silently in background; install on next quit by default.
  autoUpdater.autoDownload        = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    log.info('[updater] Checking for update…');
  });

  autoUpdater.on('update-available', (info: { version: string }) => {
    log.info(`[updater] Update available: ${info.version}`);
    broadcast('app:update-available', info.version);
  });

  autoUpdater.on('update-not-available', (info: { version: string }) => {
    log.info(`[updater] Already on latest version: ${info.version}`);
  });

  autoUpdater.on('error', (err: Error) => {
    log.error('[updater] Error:', err.message ?? err);
    broadcast('app:update-error', err.message ?? String(err));
  });

  autoUpdater.on('download-progress', (progress: { percent: number; bytesPerSecond: number }) => {
    const pct = Math.round(progress.percent);
    log.info(`[updater] Downloading… ${pct}% (${Math.round(progress.bytesPerSecond / 1024)} KB/s)`);
    broadcast('app:update-progress', pct);
  });

  autoUpdater.on('update-downloaded', (info: { version: string }) => {
    log.info(`[updater] Update downloaded: ${info.version}. Will install on quit.`);
    broadcast('app:update-downloaded', info.version);
  });

  // Delay first check 5 s so the window is fully ready before any notification
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err: Error) => {
      log.warn('[updater] Check failed:', err.message ?? err);
    });
  }, 5_000);

  // Re-check every 4 hours while the app is running
  setInterval(() => {
    autoUpdater.checkForUpdates().catch((err: Error) => {
      log.warn('[updater] Periodic check failed:', err.message ?? err);
    });
  }, 4 * 60 * 60 * 1_000);
}

// Called from renderer when user clicks "Restart now"
ipcMain.on('app:install-update', () => {
  log.info('[updater] User requested immediate install — quitting and installing.');
  autoUpdater.quitAndInstall(false, true); // isSilent=false, isForceRunAfter=true
});
