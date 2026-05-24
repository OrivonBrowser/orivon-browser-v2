import React, { useState } from 'react';
import { 
  ChevronDown, Send, Download, ShoppingCart, RefreshCw, User, 
  MoreHorizontal, ArrowUpRight, ArrowDownLeft, Plus, Copy, Check 
} from 'lucide-react';
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
        className="flex items-center gap-2 py-1 transition-all cursor-pointer border-none bg-transparent group"
      >
        <span className="text-[13px] font-semibold text-[#f8fafc] group-hover:text-[#818cf8]">{activeAccount.name}</span>
        <ChevronDown size={14} className={`text-[#64748b] transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        {switching && <Spinner size={12} className="ml-1" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-64 bg-[#111218] border border-[#1e2030] rounded-xl shadow-2xl z-50 overflow-hidden py-1.5"
            >
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => handleSwitch(acc.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#161720] transition-colors text-left border-none cursor-pointer ${acc.id === activeAccountId ? 'bg-[#161720]' : 'bg-transparent'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1e2030] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {acc.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#f8fafc] truncate">{acc.name}</div>
                    <div className="text-[11px] text-[#475569] mono truncate">
                      {acc.addresses.eth.slice(0, 6)}...{acc.addresses.eth.slice(-4)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-bold text-[#f8fafc] tabular">${(acc.balance_usd || 0).toLocaleString()}</div>
                  </div>
                </button>
              ))}

              <div className="h-px bg-[#1e2030] my-1.5" />

              <button
                onClick={() => { onImport(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#161720] transition-colors text-left text-[#6366f1] border-none bg-transparent cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
                <span className="text-[13px] font-bold">Add or Import Wallet</span>
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
  const { accounts, activeAccountId } = useWalletStore();
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
    <div className={`w-full bg-[#111218] border border-[#1e2030] rounded-xl p-5 transition-all duration-120 group`}>
      <div className="flex justify-between items-center mb-6">
        <WalletSwitcher onImport={onImport} />
        <div className="flex items-center gap-2 text-[#64748b] mono text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-[#161720] px-2 py-0.5 rounded border border-[#1e2030]">{activeAccount.addresses.eth.slice(0, 6)}...{activeAccount.addresses.eth.slice(-4)}</span>
          <button onClick={handleCopy} className="text-[#64748b] hover:text-[#f8fafc] transition-colors p-0 bg-transparent border-none cursor-pointer">
            {copied ? <Check size={12} className="text-[#22c55e]" strokeWidth={3} /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-[28px] font-bold text-[#f8fafc] mb-1 tabular tracking-tight">
          ${bal_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-[13px] text-[#64748b] font-medium tabular">{bal_eth} ETH</div>
      </div>

      <div className="flex gap-3">
        {[
          { label: 'Send', icon: <ArrowUpRight size={16}/>, onClick: onSend },
          { label: 'Receive', icon: <ArrowDownLeft size={16}/>, onClick: onReceive },
          { label: 'Buy', icon: <Plus size={16}/>, onClick: onBuy },
          { label: 'Swap', icon: <RefreshCw size={16}/>, onClick: onSwap },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className="flex-1 h-10 rounded-lg bg-[#161720] border border-[#1e2030] text-[#94a3b8] text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-[#1e2030] hover:text-[#f8fafc] transition-all border-none cursor-pointer"
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
