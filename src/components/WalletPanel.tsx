/**
 * WalletPanel — dropdown panel from the wallet button in the browser toolbar.
 * Contains wallet addresses, settings, and create/import options.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, Lock, Unlock, Copy, CheckCircle, Sun, Moon, Plus, Key,
  Shield, Globe, Network, Cpu, AlertCircle, X
} from 'lucide-react';
import { useWalletStore } from '../store/wallet';
import { useSettings } from '../store/settings';
import { useRuntimeStore } from '../store/runtime';

interface WalletPanelProps {
  onClose: () => void;
  onOpenWalletModal: (mode: 'create' | 'import' | 'unlock') => void;
}

type PanelTab = 'wallet' | 'settings' | 'network';

export default function WalletPanel({ onClose, onOpenWalletModal }: WalletPanelProps) {
  const { status, addresses, lock, getBalance } = useWalletStore();
  const { theme, setTheme, blockTrackers, setBlockTrackers, blockAds, setBlockAds, showWeb3Scores, setShowWeb3Scores } = useSettings();
  const { nodes, toggleNode } = useRuntimeStore();
  const [tab, setTab] = useState<PanelTab>('wallet');
  const [copied, setCopied] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (status === 'unlocked' && tab === 'wallet') {
      getBalance().then(b => { const n = parseFloat(b); if (!isNaN(n)) setBalance(n.toFixed(4)); });
    }
  }, [tab, status]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const bg    = isDark ? 'bg-[#161616] border-white/10'   : 'bg-white border-black/10';
  const row   = isDark ? 'hover:bg-white/5 text-white/70' : 'hover:bg-black/4 text-black/70';
  const muted = isDark ? 'text-white/35'                   : 'text-black/35';
  const subBg = isDark ? 'bg-white/[0.04]'                 : 'bg-black/[0.03]';

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute top-full right-0 mt-1.5 w-72 rounded-2xl border shadow-2xl overflow-hidden z-50 ${bg}`}
    >
      {/* Tab bar */}
      <div className={`flex border-b ${isDark ? 'border-white/[0.07]' : 'border-black/[0.07]'}`}>
        {(['wallet', 'settings', 'network'] as PanelTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
              tab === t
                ? isDark ? 'text-white border-b border-white/40 -mb-px' : 'text-black border-b border-black/40 -mb-px'
                : muted
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto scrollbar-thin">

        {/* ── Wallet tab ──────────────────────────────────────────────────── */}
        {tab === 'wallet' && (
          <>
            {status === 'unlocked' && addresses ? (
              <>
                {[
                  { key: 'eth', label: 'Ethereum', addr: addresses.eth, color: '#00D1FF', bal: balance ? `${balance} ETH` : undefined },
                  { key: 'btc', label: 'Bitcoin',  addr: addresses.btc, color: '#00FF87' },
                  { key: 'sol', label: 'Solana',   addr: addresses.sol, color: '#a78bfa' },
                ].map(chain => (
                  <div key={chain.key} className={`p-3 rounded-xl ${subBg} space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: chain.color }}>{chain.label}</span>
                      <div className="flex items-center gap-1.5">
                        {chain.bal && <span className="text-[11px] font-semibold" style={{ color: chain.color }}>{chain.bal}</span>}
                        <button onClick={() => copy(chain.addr, chain.key)} className={`w-6 h-6 rounded-md flex items-center justify-center ${row} transition-all`}>
                          {copied === chain.key ? <CheckCircle size={11} className="text-[#00FF87]" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                    <p className={`text-[10px] font-mono break-all ${muted}`}>{chain.addr}</p>
                  </div>
                ))}
                <button
                  onClick={() => { lock(); onClose(); }}
                  className={`flex items-center gap-2 w-full h-9 px-3 rounded-xl text-[12px] font-medium transition-all ${row}`}
                >
                  <Lock size={13} /> Lock wallet
                </button>
              </>
            ) : status === 'locked' ? (
              <div className="space-y-3">
                <div className={`p-3 rounded-xl ${subBg} flex items-center gap-3`}>
                  <Lock size={16} className="text-yellow-500/70" />
                  <div>
                    <p className={`text-[12px] font-semibold ${isDark ? 'text-white/80' : 'text-black/80'}`}>Wallet locked</p>
                    <p className={`text-[11px] ${muted}`}>{addresses?.eth.slice(0,8)}…{addresses?.eth.slice(-6)}</p>
                  </div>
                </div>
                <button
                  onClick={() => { onOpenWalletModal('unlock'); onClose(); }}
                  className="w-full h-9 rounded-xl bg-[#00FF87] text-black text-[12px] font-semibold hover:brightness-105 transition-all"
                >
                  Unlock wallet
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className={`text-[12px] ${muted} text-center py-1`}>No wallet connected</p>
                <button
                  onClick={() => { onOpenWalletModal('create'); onClose(); }}
                  className={`flex items-center gap-2.5 w-full h-10 px-3 rounded-xl text-[12px] font-medium border ${isDark ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]' : 'border-black/10 bg-black/[0.02] hover:bg-black/[0.04]'} transition-all`}
                >
                  <Plus size={13} className="text-[#00FF87]" /> Create new wallet
                </button>
                <button
                  onClick={() => { onOpenWalletModal('import'); onClose(); }}
                  className={`flex items-center gap-2.5 w-full h-10 px-3 rounded-xl text-[12px] font-medium border ${isDark ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]' : 'border-black/10 bg-black/[0.02] hover:bg-black/[0.04]'} transition-all`}
                >
                  <Key size={13} className={muted} /> Import wallet
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Settings tab ────────────────────────────────────────────────── */}
        {tab === 'settings' && (
          <div className="space-y-1">
            {/* Theme */}
            <div className="flex items-center justify-between h-10 px-1">
              <span className={`text-[12px] font-medium ${isDark ? 'text-white/70' : 'text-black/70'}`}>Theme</span>
              <div className={`flex p-0.5 rounded-lg ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.05]'}`}>
                {(['dark', 'light'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                      theme === t
                        ? isDark ? 'bg-white/10 text-white' : 'bg-white text-black shadow-sm'
                        : muted
                    }`}
                  >
                    {t === 'dark' ? <Moon size={11} /> : <Sun size={11} />}
                    {t === 'dark' ? 'Dark' : 'Light'}
                  </button>
                ))}
              </div>
            </div>
            {[
              { label: 'Block trackers', value: blockTrackers, onChange: setBlockTrackers },
              { label: 'Block ads',      value: blockAds,      onChange: setBlockAds },
              { label: 'Web3 scores',    value: showWeb3Scores, onChange: setShowWeb3Scores },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between h-10 px-1">
                <span className={`text-[12px] font-medium ${isDark ? 'text-white/70' : 'text-black/70'}`}>{item.label}</span>
                <button onClick={() => item.onChange(!item.value)} className="relative">
                  <div className={`w-9 h-5 rounded-full transition-colors ${item.value ? 'bg-[#00FF87]' : isDark ? 'bg-white/15' : 'bg-black/15'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${item.value ? 'left-4' : 'left-0.5'}`} />
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Network tab ─────────────────────────────────────────────────── */}
        {tab === 'network' && (
          <div className="space-y-2">
            {nodes.map(node => (
              <div key={node.id} className={`flex items-center justify-between p-3 rounded-xl ${subBg}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    node.status === 'active' ? 'bg-[#00FF87]' :
                    node.status === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-white/20'
                  }`} />
                  <div>
                    <p className={`text-[12px] font-medium ${isDark ? 'text-white/75' : 'text-black/75'}`}>{node.name}</p>
                    <p className={`text-[10px] font-mono ${muted}`}>{node.detail}</p>
                  </div>
                </div>
                <button onClick={() => toggleNode(node.id)}>
                  <div className={`w-8 h-4.5 rounded-full transition-colors flex items-center px-0.5 ${node.enabled ? 'bg-[#00FF87]' : isDark ? 'bg-white/12' : 'bg-black/12'}`}
                    style={{ height: 18 }}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${node.enabled ? 'ml-3' : 'ml-0'}`} />
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
