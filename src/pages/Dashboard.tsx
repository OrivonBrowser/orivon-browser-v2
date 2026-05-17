import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, Copy, CheckCircle, Lock, ArrowRight, Wallet } from 'lucide-react';
import { useWalletStore } from '../store/wallet';
import { useSettings } from '../store/settings';

interface DashboardProps {
  onOpenBrowser: () => void;
}

export default function Dashboard({ onOpenBrowser }: DashboardProps) {
  const { addresses, lock, getBalance } = useWalletStore();
  const { theme } = useSettings();
  const [copied, setCopied] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    getBalance().then(b => {
      const n = parseFloat(b);
      if (!isNaN(n)) setBalance(n.toFixed(4));
    });
  }, []);

  const copyAddr = (addr: string, key: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const chains = addresses ? [
    { key: 'eth', label: 'Ethereum', symbol: 'ETH', addr: addresses.eth, color: '#00D1FF', bal: balance ? `${balance} ETH` : null },
    { key: 'btc', label: 'Bitcoin',  symbol: 'BTC', addr: addresses.btc, color: '#00FF87', bal: null },
    { key: 'sol', label: 'Solana',   symbol: 'SOL', addr: addresses.sol, color: '#a78bfa', bal: null },
  ] : [];

  const bg = isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-black';
  const card = isDark ? 'bg-[#111] border-white/[0.07]' : 'bg-white border-black/[0.07]';

  return (
    <div className={`h-screen w-screen ${bg} flex flex-col items-center justify-center p-6`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-[#00FF87]/[0.025] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00FF87] flex items-center justify-center">
              <Globe size={16} className="text-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className={`text-[15px] font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Your Wallet</p>
              <p className={`text-[11px] ${isDark ? 'text-white/35' : 'text-black/35'}`}>Multi-chain · Encrypted locally</p>
            </div>
          </div>
          <button
            onClick={() => lock()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
              isDark ? 'border-white/10 text-white/35 hover:text-white/60 hover:border-white/20' : 'border-black/10 text-black/35 hover:text-black/60'
            }`}
          >
            <Lock size={11} /> Lock
          </button>
        </div>

        {/* Wallet cards */}
        <div className="space-y-2">
          {chains.map(chain => (
            <div key={chain.key} className={`flex items-center justify-between p-4 rounded-2xl border ${card}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${chain.color}18` }}>
                  <Wallet size={14} style={{ color: chain.color }} />
                </div>
                <div>
                  <p className={`text-[12px] font-semibold ${isDark ? 'text-white/80' : 'text-black/80'}`}>{chain.label}</p>
                  <p className={`text-[11px] font-mono ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                    {chain.addr.slice(0, 8)}…{chain.addr.slice(-6)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {chain.bal && <span className="text-[12px] font-semibold" style={{ color: chain.color }}>{chain.bal}</span>}
                <button
                  onClick={() => copyAddr(chain.addr, chain.key)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isDark ? 'hover:bg-white/8 text-white/30 hover:text-white/60' : 'hover:bg-black/5 text-black/30 hover:text-black/60'
                  }`}
                >
                  {copied === chain.key ? <CheckCircle size={13} className="text-[#00FF87]" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Open browser CTA */}
        <button
          onClick={onOpenBrowser}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-white text-black text-[13px] font-semibold hover:bg-[#00FF87] transition-all active:scale-[0.98] mt-2"
        >
          <Globe size={16} />
          Open Browser
          <ArrowRight size={15} />
        </button>

        <p className={`text-center text-[11px] ${isDark ? 'text-white/20' : 'text-black/20'}`}>
          Your keys never leave this device
        </p>
      </motion.div>
    </div>
  );
}
