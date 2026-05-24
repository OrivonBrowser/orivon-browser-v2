import React, { useState } from 'react';
import { ChevronDown, Send, Download, ShoppingCart, RefreshCw, User, MoreHorizontal, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWalletStore, WalletAccount } from '../store/wallet';
import Spinner from './Spinner';
import { DEMO_WALLET } from '../constants';

interface WalletSwitcherProps {
  onImport: () => void;
  isMinimal?: boolean;
}

export default function WalletSwitcher({ onImport, isMinimal = false }: WalletSwitcherProps) {
  const { accounts, activeAccountId, switchAccount } = useWalletStore();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  const handleSwitch = async (id: string) => {
    if (id === activeAccountId) {
      setOpen(false);
      return;
    }
    setSwitching(true);
    setOpen(false);
    await new Promise(r => setTimeout(r, 500)); 
    await switchAccount(id);
    setSwitching(false);
  };

  if (!activeAccount) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-[#2d2e45] bg-[#1a1b2e]/50"
      >
        <div className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]">
          {activeAccount.name.charAt(0)}
        </div>
        <span className="text-sm font-bold text-[#f1f5f9]">{activeAccount.name}</span>
        <ChevronDown size={14} className={`text-[#4b5563] transition-transform ${open ? 'rotate-180' : ''}`} />
        {switching && <Spinner size={12} className="ml-1" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-64 bg-[#13141f] border border-[#2d2e45] rounded-[16px] shadow-2xl z-50 overflow-hidden py-1.5"
            >
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => handleSwitch(acc.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1e1f2e] transition-colors text-left border-none cursor-pointer ${acc.id === activeAccountId ? 'bg-[#1e1f2e]' : 'bg-transparent'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg">
                    {acc.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[#f1f5f9] truncate">{acc.name}</div>
                    <div className="text-[10px] text-[#4b5563] font-mono truncate">
                      {acc.addresses.eth.slice(0, 6)}...{acc.addresses.eth.slice(-4)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-white">${(acc.balance_usd || 0).toLocaleString()}</div>
                  </div>
                </button>
              ))}

              <div className="h-px bg-[#2d2e45] my-1.5" />

              <button
                onClick={() => { onImport(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1e1f2e] transition-colors text-left text-[#818cf8] border-none bg-transparent cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
                <span className="text-sm font-bold">Add or Import Wallet</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CompactWalletCardProps {
  onSend: () => void;
  onReceive: () => void;
  onBuy: () => void;
  onSwap: () => void;
  onImport: () => void;
  isNewTab?: boolean;
}

export function CompactWalletCard({ onSend, onReceive, onBuy, onSwap, onImport, isNewTab }: CompactWalletCardProps) {
  const { accounts, activeAccountId, getBalance, isGenerating, error } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  const handleCopy = () => {
    if (!activeAccount) return;
    navigator.clipboard.writeText(activeAccount.addresses.eth);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeAccount) return null;

  const bal_eth = activeAccount.balance_eth || 0;
  const bal_usd = activeAccount.balance_usd || 0;

  return (
    <div className={`w-full max-w-[600px] bg-[#1a1b26] border border-[#2d2e45] rounded-[16px] p-5 shadow-2xl transition-all duration-150 hover:border-[#6366f1]/30 ${isNewTab ? '' : 'hover:scale-[1.01]'}`}>
      <div className="flex justify-between items-center mb-5">
        <WalletSwitcher onImport={onImport} />
        <div className="flex items-center gap-2 text-[#4b5563] font-mono text-[11px]">
          <span>{activeAccount.addresses.eth.slice(0, 6)}...{activeAccount.addresses.eth.slice(-4)}</span>
          <button onClick={handleCopy} className="text-[#4b5563] hover:text-[#e6e7e8] transition-colors p-0 bg-transparent border-none cursor-pointer">
            {copied ? <div className="text-[#22c55e] font-bold">Copied</div> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
          </button>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-white mb-1.5 tracking-tight">
          ${bal_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-sm text-[#818cf8] font-bold tracking-wide">{bal_eth} ETH</div>
      </div>

      <div className="flex gap-3">
        {[
          { label: 'Send', icon: <ArrowUpRight size={18}/>, onClick: onSend, grad: 'from-[#4f46e5] to-[#6366f1]' },
          { label: 'Receive', icon: <ArrowDownLeft size={18}/>, onClick: onReceive, grad: 'from-[#059669] to-[#10b981]' },
          { label: 'Buy', icon: <Plus size={18}/>, onClick: onBuy, grad: 'from-[#d97706] to-[#f59e0b]' },
          { label: 'Swap', icon: <RefreshCw size={18}/>, onClick: onSwap, grad: 'from-[#7c3aed] to-[#8b5cf6]' },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className={`flex-1 h-12 rounded-[10px] bg-gradient-to-br ${btn.grad} text-white text-[13px] font-black flex items-center justify-center gap-2 hover:scale-[1.02] hover:brightness-110 transition-all border-none cursor-pointer shadow-lg`}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
