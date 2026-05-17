import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Globe, Copy, CheckCircle, Lock, ArrowRight, Wallet,
  Shield, Cpu, Network, TrendingUp, RefreshCcw, ExternalLink
} from 'lucide-react';
import { useWalletStore } from '../store/wallet';
import { useSettings } from '../store/settings';
import { useRuntimeStore } from '../store/runtime';

interface DashboardProps {
  onOpenBrowser: () => void;
}

const STAGGER = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] } },
});

export default function Dashboard({ onOpenBrowser }: DashboardProps) {
  const { addresses, lock, getBalance } = useWalletStore();
  const { theme, setTheme } = useSettings();
  const { nodes } = useRuntimeStore();

  const [copied, setCopied]       = useState<string | null>(null);
  const [balance, setBalance]     = useState<string | null>(null);
  const [loadingBal, setLoadingBal] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    setLoadingBal(true);
    getBalance()
      .then(b => { const n = parseFloat(b); setBalance(!isNaN(n) ? n.toFixed(6) : '0.000000'); })
      .catch(() => setBalance('0.000000'))
      .finally(() => setLoadingBal(false));
  }, []);

  const copyAddr = (addr: string, key: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const chains = addresses ? [
    {
      key: 'eth', label: 'Ethereum', symbol: 'ETH', addr: addresses.eth,
      color: '#00D1FF', bgColor: 'rgba(0,209,255,0.08)',
      bal: loadingBal ? null : balance ? `${balance} ETH` : '0.000000 ETH',
    },
    {
      key: 'btc', label: 'Bitcoin', symbol: 'BTC', addr: addresses.btc,
      color: '#00FF87', bgColor: 'rgba(0,255,135,0.08)',
      bal: null,
    },
    {
      key: 'sol', label: 'Solana', symbol: 'SOL', addr: addresses.sol,
      color: '#a78bfa', bgColor: 'rgba(167,139,250,0.08)',
      bal: null,
    },
  ] : [];

  const activeNodes = nodes.filter(n => n.enabled && n.status === 'active');

  const bg      = isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f4f4f4] text-black';
  const card    = isDark ? 'bg-[#121212] border-white/[0.08]' : 'bg-white border-black/[0.07]';
  const cardHov = isDark ? 'hover:border-white/15 hover:bg-[#161616]' : 'hover:border-black/12 hover:bg-white';
  const muted   = isDark ? 'text-white/35' : 'text-black/35';
  const subtle  = isDark ? 'text-white/55' : 'text-black/55';

  return (
    <div className={`h-screen w-screen ${bg} overflow-y-auto`}>
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#00FF87]/[0.025] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-6 py-10 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div {...STAGGER(0)} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#00FF87] flex items-center justify-center shadow-lg shadow-[#00FF87]/20">
              <Globe size={18} className="text-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className={`text-[15px] font-semibold leading-none ${isDark ? 'text-white' : 'text-black'}`}>Orivon</p>
              <p className={`text-[11px] mt-0.5 ${muted}`}>Web3 Browser</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-[13px] ${muted} ${isDark ? 'hover:bg-white/8 hover:text-white/70' : 'hover:bg-black/6 hover:text-black/70'}`}
              title="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => lock()}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium border transition-all ${
                isDark ? 'border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/8' : 'border-black/10 text-black/40 hover:text-red-500 hover:border-red-500/20'
              }`}
            >
              <Lock size={12} /> Lock
            </button>
          </div>
        </motion.div>

        {/* ── Wallet summary card ──────────────────────────────────────────── */}
        <motion.div {...STAGGER(1)} className={`rounded-2xl border p-5 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-[#00FF87]" />
              <span className={`text-[12px] font-semibold uppercase tracking-widest ${muted}`}>Wallet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse" />
              <span className={`text-[10px] font-medium ${muted}`}>Active</span>
            </div>
          </div>

          <div className="space-y-2">
            {chains.map(chain => (
              <div
                key={chain.key}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${isDark ? 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10' : 'border-black/[0.05] bg-black/[0.02] hover:bg-black/[0.04]'}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: chain.bgColor }}
                  >
                    <span className="text-[11px] font-bold" style={{ color: chain.color }}>{chain.symbol}</span>
                  </div>
                  <div>
                    <p className={`text-[13px] font-semibold ${isDark ? 'text-white/85' : 'text-black/85'}`}>{chain.label}</p>
                    <p className={`text-[10px] font-mono mt-0.5 ${muted}`}>
                      {chain.addr.slice(0, 10)}…{chain.addr.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {chain.bal && (
                    <span className="text-[11px] font-mono font-semibold" style={{ color: chain.color }}>{chain.bal}</span>
                  )}
                  <button
                    onClick={() => copyAddr(chain.addr, chain.key)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${muted} ${isDark ? 'hover:bg-white/8 hover:text-white/70' : 'hover:bg-black/6 hover:text-black/70'}`}
                  >
                    {copied === chain.key
                      ? <CheckCircle size={13} className="text-[#00FF87]" />
                      : <Copy size={13} />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Runtime status row ───────────────────────────────────────────── */}
        <motion.div {...STAGGER(2)} className="grid grid-cols-3 gap-3">
          {[
            { icon: Shield,  label: 'Security',  value: 'Active',   color: '#00FF87', dot: true  },
            { icon: Network, label: 'ENS/IPFS',  value: `${activeNodes.length} nodes`, color: '#00D1FF', dot: true  },
            { icon: Cpu,     label: 'Runtime',   value: 'v0.94.1',  color: '#a78bfa', dot: false },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl border p-3.5 flex flex-col gap-2 ${card} transition-all ${cardHov}`}>
              <div className="flex items-center justify-between">
                <item.icon size={14} style={{ color: item.color }} />
                {item.dot && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: item.color }} />}
              </div>
              <div>
                <p className={`text-[13px] font-semibold ${isDark ? 'text-white/80' : 'text-black/80'}`}>{item.value}</p>
                <p className={`text-[10px] mt-0.5 ${muted}`}>{item.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Quick actions ────────────────────────────────────────────────── */}
        <motion.div {...STAGGER(3)} className="grid grid-cols-2 gap-3">
          <QuickLink
            icon={<Globe size={14} />}
            label="Uniswap"
            sub="uniswap.eth"
            isDark={isDark}
            card={card}
            cardHov={cardHov}
            muted={muted}
          />
          <QuickLink
            icon={<Globe size={14} />}
            label="ENS Domains"
            sub="app.ens.domains"
            isDark={isDark}
            card={card}
            cardHov={cardHov}
            muted={muted}
          />
        </motion.div>

        {/* ── Open browser CTA ─────────────────────────────────────────────── */}
        <motion.div {...STAGGER(4)}>
          <button
            onClick={onOpenBrowser}
            className="w-full h-12 flex items-center justify-center gap-2.5 rounded-2xl bg-white text-black text-[14px] font-semibold hover:bg-[#00FF87] active:scale-[0.98] transition-all shadow-lg shadow-black/10"
          >
            <Globe size={16} strokeWidth={2.5} />
            Open Browser
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </motion.div>

        <motion.p {...STAGGER(5)} className={`text-center text-[11px] ${muted}`}>
          Your keys are encrypted and never leave this device
        </motion.p>

      </div>
    </div>
  );
}

function QuickLink({ icon, label, sub, isDark, card, cardHov, muted }: {
  icon: React.ReactNode; label: string; sub: string;
  isDark: boolean; card: string; cardHov: string; muted: string;
}) {
  return (
    <div className={`rounded-xl border p-3.5 flex items-center gap-3 ${card} transition-all ${cardHov} cursor-default`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.04]'}`}>
        <span className={muted}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className={`text-[12px] font-semibold truncate ${isDark ? 'text-white/75' : 'text-black/75'}`}>{label}</p>
        <p className={`text-[10px] font-mono truncate ${muted}`}>{sub}</p>
      </div>
    </div>
  );
}
