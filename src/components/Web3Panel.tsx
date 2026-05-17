import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield, Lock, Globe, CheckCircle, AlertTriangle,
  Cpu, Network, Activity, Wallet, ChevronRight, ExternalLink,
  X, Eye
} from 'lucide-react';
import { useTabsStore, TabEntry } from '../store/tabs';
import { useWalletStore } from '../store/wallet';
import { useRuntimeStore } from '../store/runtime';
import { useSettings } from '../store/settings';

interface Web3Score {
  trust:    number;
  security: number;
  privacy:  number;
}

function computeScore(tab: TabEntry): Web3Score {
  if (!tab || tab.type === 'newtab') return { trust: 100, security: 100, privacy: 100 };

  let trust = 85, security = 80, privacy = 75;

  if (tab.type === 'ens')  { trust = 97; security = 94; privacy = 92; }
  if (tab.type === 'ipfs' || tab.type === 'ipns') { trust = 95; security = 92; privacy = 90; }
  if (tab.url.startsWith('https://')) { security = Math.max(security, 78); }
  if (tab.url.startsWith('http://'))  { security = 40; trust = 55; }

  // Penalise known tracker-heavy domains
  const heavyTrackers = ['facebook.com', 'twitter.com', 'tiktok.com', 'doubleclick.net'];
  if (heavyTrackers.some(d => tab.url.includes(d))) {
    privacy = Math.min(privacy, 45);
    trust   = Math.min(trust, 65);
  }

  return { trust, security, privacy };
}

export default function Web3Panel() {
  const { tabs, activeTabId } = useTabsStore();
  const { status: walletStatus, addresses } = useWalletStore();
  const { nodes, logs } = useRuntimeStore();
  const { theme } = useSettings();
  const [balance, setBalance] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'scores' | 'site' | 'wallet' | 'runtime'>('scores');

  const activeTab = tabs.find(t => t.id === activeTabId);
  const score     = activeTab ? computeScore(activeTab) : { trust: 100, security: 100, privacy: 100 };

  const isDark  = theme === 'dark';
  const bg      = isDark ? 'bg-[#181818]'        : 'bg-[#f0f0f0]';
  const border  = isDark ? 'border-white/[0.07]' : 'border-black/[0.07]';
  const textLow = isDark ? 'text-white/25'        : 'text-black/25';
  const textMid = isDark ? 'text-white/45'        : 'text-black/45';

  useEffect(() => {
    if (walletStatus !== 'unlocked' || !addresses) return;
    // Lazy fetch balance on wallet section open
    if (activeSection === 'wallet') {
      const { getBalance } = useWalletStore.getState();
      getBalance().then(b => setBalance(parseFloat(b).toFixed(4)));
    }
  }, [activeSection, walletStatus, addresses]);

  const sections = [
    { id: 'scores',  label: 'Scores'  },
    { id: 'site',    label: 'Site'    },
    { id: 'wallet',  label: 'Wallet'  },
    { id: 'runtime', label: 'Runtime' },
  ] as const;

  return (
    <div className={`h-full ${bg} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`h-10 flex items-center gap-2 px-4 border-b ${border} shrink-0`}>
        <Shield size={13} className="text-[#00FF87]" />
        <span className={`text-[11px] font-semibold ${textMid} uppercase tracking-widest`}>Web3 Panel</span>
      </div>

      {/* Section tabs */}
      <div className={`flex border-b ${border} shrink-0`}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-widest transition-all ${
              activeSection === s.id
                ? isDark ? 'text-white border-b border-white/40 -mb-px' : 'text-black border-b border-black/40 -mb-px'
                : textLow
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Scores ───────────────────────────────────────────────────────────── */}
        {activeSection === 'scores' && (
          <div className="space-y-4">
            {[
              { label: 'Trust Score', value: score.trust,    color: '#00FF87', icon: Shield   },
              { label: 'Security',    value: score.security, color: '#00D1FF', icon: Lock     },
              { label: 'Privacy',     value: score.privacy,  color: '#a78bfa', icon: Eye      },
            ].map(s => (
              <div key={s.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon size={12} style={{ color: s.color }} />
                    <span className={`text-[11px] font-medium ${textMid}`}>{s.label}</span>
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
                <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.value}%` }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}

            {/* Badge */}
            <div className={`mt-2 p-3 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'} border ${border}`}>
              {score.trust >= 90 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-[#00FF87]" />
                  <span className="text-[11px] font-medium text-[#00FF87]">Trusted Web3 Site</span>
                </div>
              ) : score.security < 60 ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={13} className="text-yellow-500" />
                  <span className="text-[11px] font-medium text-yellow-500">Insecure Connection</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Globe size={13} className={textMid} />
                  <span className={`text-[11px] font-medium ${textMid}`}>Standard Web Site</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Site info ─────────────────────────────────────────────────────────── */}
        {activeSection === 'site' && activeTab && (
          <div className="space-y-3">
            <InfoRow label="URL" value={activeTab.displayUrl || activeTab.url} isDark={isDark} mono />
            <InfoRow label="Protocol"   value={activeTab.type.toUpperCase()} isDark={isDark} />
            <InfoRow label="Trackers"   value="Blocked (via filter list)"      isDark={isDark} />
            <InfoRow label="Cookies"    value="Managed"                         isDark={isDark} />
            <InfoRow label="JS Enabled" value="Yes"                             isDark={isDark} />
            {activeTab.type === 'ens' && (
              <>
                <div className={`my-2 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`} />
                <InfoRow label="Resolution" value="ENS → eth.limo"  isDark={isDark} />
                <InfoRow label="Hosting"    value="IPFS / Filecoin"  isDark={isDark} />
                <InfoRow label="Censorship" value="Resistant"        isDark={isDark} color="#00FF87" />
              </>
            )}
          </div>
        )}

        {/* ── Wallet ────────────────────────────────────────────────────────────── */}
        {activeSection === 'wallet' && (
          <div className="space-y-3">
            {walletStatus === 'unlocked' && addresses ? (
              <>
                {[
                  { chain: 'ETH', addr: addresses.eth, color: '#00D1FF' },
                  { chain: 'BTC', addr: addresses.btc, color: '#00FF87' },
                  { chain: 'SOL', addr: addresses.sol, color: '#a78bfa' },
                ].map(a => (
                  <div key={a.chain} className={`p-3 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'} border ${border} space-y-1`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${textLow}`}>{a.chain}</span>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.color }} />
                    </div>
                    <p className="font-mono text-[10px] break-all" style={{ color: a.color }}>
                      {a.addr}
                    </p>
                  </div>
                ))}
                {balance !== null && (
                  <InfoRow label="ETH Balance" value={`${balance} ETH`} isDark={isDark} color="#00D1FF" />
                )}
              </>
            ) : walletStatus === 'locked' ? (
              <EmptyState icon={Lock} text="Wallet is locked" sub="Enter your password to unlock" isDark={isDark} />
            ) : (
              <EmptyState icon={Wallet} text="No wallet connected" sub="Create or import a wallet in settings" isDark={isDark} />
            )}
          </div>
        )}

        {/* ── Runtime ───────────────────────────────────────────────────────────── */}
        {activeSection === 'runtime' && (
          <div className="space-y-3">
            {nodes.map(node => (
              <div key={node.id} className={`p-3 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'} border ${border}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[12px] font-semibold ${isDark ? 'text-white/65' : 'text-black/65'}`}>{node.name}</span>
                  <StatusDot status={node.status} />
                </div>
                <p className={`text-[10px] font-mono ${textLow}`}>{node.detail}</p>
              </div>
            ))}

            <div className={`mt-2 p-3 rounded-xl ${isDark ? 'bg-black/30' : 'bg-white/50'} border ${border} space-y-1 max-h-32 overflow-y-auto`}>
              {logs.slice(-8).map((log, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] font-mono">
                  <div className={`w-1 h-1 rounded-full shrink-0 ${
                    log.level === 'error' ? 'bg-red-500' :
                    log.level === 'warn'  ? 'bg-yellow-500' : 'bg-[#00FF87]'
                  }`} />
                  <span className={textLow}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function InfoRow({
  label, value, isDark, mono, color
}: { label: string; value: string; isDark: boolean; mono?: boolean; color?: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className={`text-[11px] ${isDark ? 'text-white/30' : 'text-black/30'} shrink-0`}>{label}</span>
      <span
        className={`text-[11px] text-right ${mono ? 'font-mono' : 'font-medium'} ${isDark ? 'text-white/55' : 'text-black/55'} truncate max-w-[140px]`}
        style={color ? { color } : {}}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active:  'bg-[#00FF87]',
    syncing: 'bg-yellow-500 animate-pulse',
    standby: 'bg-white/20',
    error:   'bg-red-500',
  };
  return <div className={`w-1.5 h-1.5 rounded-full ${colors[status] ?? 'bg-white/20'}`} />;
}

function EmptyState({ icon: Icon, text, sub, isDark }: { icon: React.ElementType; text: string; sub: string; isDark: boolean }) {
  return (
    <div className={`p-4 rounded-xl text-center space-y-2 ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'} border ${isDark ? 'border-white/[0.07]' : 'border-black/[0.07]'}`}>
      <Icon size={20} className={isDark ? 'text-white/20 mx-auto' : 'text-black/20 mx-auto'} />
      <p className={`text-[12px] font-medium ${isDark ? 'text-white/40' : 'text-black/40'}`}>{text}</p>
      <p className={`text-[10px] ${isDark ? 'text-white/22' : 'text-black/22'}`}>{sub}</p>
    </div>
  );
}
