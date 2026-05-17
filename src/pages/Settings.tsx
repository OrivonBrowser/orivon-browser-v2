import React, { useState } from 'react';
import {
  Sun, Moon, Shield, Globe, Wallet, Cpu, Network,
  ChevronRight, ToggleLeft, ToggleRight, Save, AlertTriangle, Eye
} from 'lucide-react';
import { useSettings } from '../store/settings';
import { useWalletStore } from '../store/wallet';
import { useRuntimeStore } from '../store/runtime';

interface SettingsPageProps {
  onBack: () => void;
}

type Section = 'appearance' | 'privacy' | 'wallet' | 'network' | 'runtime' | 'about';

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const {
    theme, setTheme,
    blockTrackers, setBlockTrackers,
    blockAds, setBlockAds,
    showWeb3Scores, setShowWeb3Scores,
    searchEngine, setSearchEngine,
    homepage, setHomepage,
    ipfsGateway, setIpfsGateway,
    rpcUrl, setRpcUrl,
  } = useSettings();

  const { status: walletStatus, addresses, lock, clearWallet } = useWalletStore();
  const { nodes, toggleNode, runtimeVersion } = useRuntimeStore();

  const [section, setSection] = useState<Section>('appearance');
  const [homepageInput, setHomepageInput] = useState(homepage);
  const [rpcInput, setRpcInput] = useState(rpcUrl);
  const [ipfsInput, setIpfsInput] = useState(ipfsGateway);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isDark  = theme === 'dark';
  const bg      = isDark ? 'bg-[#0f0f0f]'         : 'bg-[#f5f5f5]';
  const card    = isDark ? 'bg-[#1a1a1a]'           : 'bg-white';
  const border  = isDark ? 'border-white/[0.07]'    : 'border-black/[0.07]';
  const textHi  = isDark ? 'text-white/75'           : 'text-black/75';
  const textMid = isDark ? 'text-white/45'           : 'text-black/45';
  const textLow = isDark ? 'text-white/25'           : 'text-black/25';
  const inputBg = isDark ? 'bg-black/40'             : 'bg-white';

  const nav: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'appearance', label: 'Appearance',  icon: Sun     },
    { id: 'privacy',    label: 'Privacy',     icon: Shield  },
    { id: 'wallet',     label: 'Wallet',      icon: Wallet  },
    { id: 'network',    label: 'Network',     icon: Globe   },
    { id: 'runtime',    label: 'Runtime',     icon: Cpu     },
    { id: 'about',      label: 'About',       icon: Eye     },
  ];

  return (
    <div className={`h-full flex ${bg}`}>
      {/* Left nav */}
      <div className={`w-52 shrink-0 border-r ${border} flex flex-col`}>
        <div className={`h-12 flex items-center px-5 border-b ${border}`}>
          <span className={`text-[13px] font-semibold ${textHi}`}>Settings</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {nav.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-3 h-9 px-3 w-full rounded-lg text-[12px] font-medium transition-all mb-0.5 ${
                section === item.id
                  ? isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                  : `${textMid} ${isDark ? 'hover:bg-white/[0.05] hover:text-white/65' : 'hover:bg-black/[0.04] hover:text-black/65'}`
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className={`p-3 border-t ${border}`}>
          <button
            onClick={onBack}
            className={`w-full h-9 rounded-lg text-[12px] font-medium ${textMid} ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-black/[0.04]'} transition-all`}
          >
            ← Back to browser
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-lg space-y-6">

          {/* ── Appearance ─────────────────────────────────────────────────────── */}
          {section === 'appearance' && (
            <>
              <h2 className={`text-[18px] font-bold ${textHi}`}>Appearance</h2>
              <SettingsCard isDark={isDark} card={card} border={border}>
                <p className={`text-[12px] font-semibold ${textHi} mb-4`}>Theme</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['dark', 'light'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex items-center justify-center gap-2 h-10 rounded-xl border text-[12px] font-medium transition-all ${
                        theme === t
                          ? 'border-[#00FF87] text-[#00FF87] bg-[#00FF87]/8'
                          : `${border} ${textMid} ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`
                      }`}
                    >
                      {t === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                      {t === 'dark' ? 'Dark' : 'Light'}
                    </button>
                  ))}
                </div>
              </SettingsCard>

              <SettingsCard isDark={isDark} card={card} border={border}>
                <p className={`text-[12px] font-semibold ${textHi} mb-4`}>Homepage</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={homepageInput}
                    onChange={e => setHomepageInput(e.target.value)}
                    placeholder="orivon://newtab or https://..."
                    className={`flex-1 h-9 ${inputBg} border ${border} rounded-lg px-3 text-[12px] font-mono ${textHi} placeholder:${textLow} focus:outline-none focus:border-[#00FF87]/40 transition-all`}
                  />
                  <button
                    onClick={() => setHomepage(homepageInput)}
                    className="h-9 px-4 rounded-lg bg-[#00FF87]/15 text-[#00FF87] text-[11px] font-semibold hover:bg-[#00FF87]/25 transition-all"
                  >
                    <Save size={12} />
                  </button>
                </div>
              </SettingsCard>

              <SettingsCard isDark={isDark} card={card} border={border}>
                <p className={`text-[12px] font-semibold ${textHi} mb-4`}>Search Engine</p>
                <div className="space-y-2">
                  {(['google', 'duckduckgo', 'brave'] as const).map(eng => (
                    <label
                      key={eng}
                      className={`flex items-center justify-between h-10 px-3 rounded-lg cursor-pointer transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/4'}`}
                    >
                      <span className={`text-[12px] font-medium ${textMid} capitalize`}>{eng}</span>
                      <div
                        onClick={() => setSearchEngine(eng)}
                        className={`w-4 h-4 rounded-full border-2 transition-all ${
                          searchEngine === eng ? 'border-[#00FF87] bg-[#00FF87]' : `${border} ${isDark ? 'border-white/20' : 'border-black/20'}`
                        }`}
                      />
                    </label>
                  ))}
                </div>
              </SettingsCard>
            </>
          )}

          {/* ── Privacy ────────────────────────────────────────────────────────── */}
          {section === 'privacy' && (
            <>
              <h2 className={`text-[18px] font-bold ${textHi}`}>Privacy & Security</h2>
              <SettingsCard isDark={isDark} card={card} border={border}>
                <div className="space-y-4">
                  <Toggle label="Block Trackers" sub="Prevent cross-site tracking"        value={blockTrackers} onChange={setBlockTrackers} isDark={isDark} textHi={textHi} textLow={textLow} />
                  <Toggle label="Block Ads"      sub="Filter advertising content"          value={blockAds}      onChange={setBlockAds}      isDark={isDark} textHi={textHi} textLow={textLow} />
                  <Toggle label="Web3 Scores"    sub="Show trust/security/privacy scores"  value={showWeb3Scores} onChange={setShowWeb3Scores} isDark={isDark} textHi={textHi} textLow={textLow} />
                </div>
              </SettingsCard>
            </>
          )}

          {/* ── Wallet ─────────────────────────────────────────────────────────── */}
          {section === 'wallet' && (
            <>
              <h2 className={`text-[18px] font-bold ${textHi}`}>Wallet</h2>
              {walletStatus === 'none' ? (
                <SettingsCard isDark={isDark} card={card} border={border}>
                  <p className={`text-[12px] ${textMid}`}>
                    No wallet configured. Set up a wallet during onboarding or restart the browser to start the wallet wizard.
                  </p>
                </SettingsCard>
              ) : (
                <>
                  <SettingsCard isDark={isDark} card={card} border={border}>
                    <p className={`text-[12px] font-semibold ${textHi} mb-3`}>Addresses</p>
                    <div className="space-y-3">
                      {addresses && [
                        { chain: 'ETH', addr: addresses.eth, color: '#00D1FF' },
                        { chain: 'BTC', addr: addresses.btc, color: '#00FF87' },
                        { chain: 'SOL', addr: addresses.sol, color: '#a78bfa' },
                      ].map(a => (
                        <div key={a.chain} className={`p-3 rounded-xl ${isDark ? 'bg-black/30' : 'bg-[#f0f0f0]'} border ${border}`}>
                          <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${textLow}`}>{a.chain}</p>
                          <p className="font-mono text-[11px] break-all" style={{ color: a.color }}>{a.addr}</p>
                        </div>
                      ))}
                    </div>
                  </SettingsCard>

                  <SettingsCard isDark={isDark} card={card} border={border}>
                    <p className={`text-[12px] font-semibold ${textHi} mb-3`}>Wallet Actions</p>
                    <div className="flex flex-col gap-2">
                      {walletStatus === 'unlocked' && (
                        <button
                          onClick={() => lock()}
                          className={`h-10 rounded-xl text-[12px] font-medium border ${border} ${textMid} ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/4'} transition-all`}
                        >
                          Lock Wallet
                        </button>
                      )}
                      {!showClearConfirm ? (
                        <button
                          onClick={() => setShowClearConfirm(true)}
                          className="h-10 rounded-xl text-[12px] font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          Remove Wallet
                        </button>
                      ) : (
                        <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/5 space-y-2">
                          <p className="text-[11px] text-red-400 flex items-center gap-1.5">
                            <AlertTriangle size={11} />
                            This will permanently delete your wallet. Make sure you have your seed phrase.
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => setShowClearConfirm(false)} className={`flex-1 h-8 rounded-lg text-[11px] ${textMid} border ${border} transition-all`}>
                              Cancel
                            </button>
                            <button
                              onClick={() => { clearWallet(); setShowClearConfirm(false); }}
                              className="flex-1 h-8 rounded-lg text-[11px] text-red-400 bg-red-500/15 hover:bg-red-500/25 transition-all"
                            >
                              Confirm Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </SettingsCard>
                </>
              )}
            </>
          )}

          {/* ── Network ────────────────────────────────────────────────────────── */}
          {section === 'network' && (
            <>
              <h2 className={`text-[18px] font-bold ${textHi}`}>Network</h2>
              <SettingsCard isDark={isDark} card={card} border={border}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className={`text-[12px] font-semibold ${textHi}`}>Ethereum RPC URL</p>
                    <p className={`text-[10px] ${textLow}`}>Used for ENS resolution and wallet queries.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rpcInput}
                        onChange={e => setRpcInput(e.target.value)}
                        className={`flex-1 h-9 ${inputBg} border ${border} rounded-lg px-3 text-[12px] font-mono ${textHi} focus:outline-none focus:border-[#00FF87]/40 transition-all`}
                      />
                      <button
                        onClick={() => setRpcUrl(rpcInput)}
                        className="h-9 px-4 rounded-lg bg-[#00FF87]/15 text-[#00FF87] text-[11px] font-semibold hover:bg-[#00FF87]/25 transition-all"
                      >
                        <Save size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-[12px] font-semibold ${textHi}`}>IPFS Gateway</p>
                    <p className={`text-[10px] ${textLow}`}>Gateway used to load IPFS and ENS content.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ipfsInput}
                        onChange={e => setIpfsInput(e.target.value)}
                        className={`flex-1 h-9 ${inputBg} border ${border} rounded-lg px-3 text-[12px] font-mono ${textHi} focus:outline-none focus:border-[#00FF87]/40 transition-all`}
                      />
                      <button
                        onClick={() => setIpfsGateway(ipfsInput)}
                        className="h-9 px-4 rounded-lg bg-[#00FF87]/15 text-[#00FF87] text-[11px] font-semibold hover:bg-[#00FF87]/25 transition-all"
                      >
                        <Save size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </SettingsCard>
            </>
          )}

          {/* ── Runtime ────────────────────────────────────────────────────────── */}
          {section === 'runtime' && (
            <>
              <h2 className={`text-[18px] font-bold ${textHi}`}>Runtime Nodes</h2>
              <SettingsCard isDark={isDark} card={card} border={border}>
                <div className="space-y-3">
                  {nodes.map(node => (
                    <div key={node.id} className="flex items-center justify-between">
                      <div>
                        <p className={`text-[12px] font-medium ${textHi}`}>{node.name}</p>
                        <p className={`text-[10px] ${textLow}`}>{node.detail}</p>
                      </div>
                      <button onClick={() => toggleNode(node.id)}>
                        {node.enabled
                          ? <ToggleRight size={22} className="text-[#00FF87]" />
                          : <ToggleLeft  size={22} className={textLow} />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </SettingsCard>
            </>
          )}

          {/* ── About ──────────────────────────────────────────────────────────── */}
          {section === 'about' && (
            <>
              <h2 className={`text-[18px] font-bold ${textHi}`}>About Orivon</h2>
              <SettingsCard isDark={isDark} card={card} border={border}>
                <div className="space-y-3">
                  {[
                    ['Version',   '0.94.1 MVP'],
                    ['Runtime',   'Electron + Chromium'],
                    ['Web3',      'ENS, IPFS, libp2p'],
                    ['Wallet',    'ethers.js v6 · BIP39 / BIP44'],
                    ['State',     'Zustand + localStorage'],
                    ['License',   'Apache 2.0'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[12px]">
                      <span className={textLow}>{k}</span>
                      <span className={`font-mono ${textMid}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </SettingsCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function SettingsCard({ children, isDark, card, border }: {
  children: React.ReactNode; isDark: boolean; card: string; border: string;
}) {
  return (
    <div className={`${card} border ${border} rounded-xl p-5`}>
      {children}
    </div>
  );
}

function Toggle({ label, sub, value, onChange, isDark, textHi, textLow }: {
  label: string; sub: string; value: boolean;
  onChange: (v: boolean) => void; isDark: boolean;
  textHi: string; textLow: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-[12px] font-medium ${textHi}`}>{label}</p>
        <p className={`text-[10px] ${textLow}`}>{sub}</p>
      </div>
      <button onClick={() => onChange(!value)}>
        {value
          ? <ToggleRight size={22} className="text-[#00FF87]" />
          : <ToggleLeft  size={22} className={textLow} />
        }
      </button>
    </div>
  );
}
