import React, { useState } from 'react';
import { ChevronDown, Send, Download, ShoppingCart, RefreshCw, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWalletStore, WalletAccount } from '../store/wallet';
import Spinner from './Spinner';

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
    await new Promise(r => setTimeout(r, 500)); // Half second fetch delay simulation
    await switchAccount(id);
    setSwitching(false);
  };

  if (!activeAccount) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold">
          {activeAccount.name.charAt(0)}
        </div>
        <span className="text-sm font-semibold text-gray-200">{activeAccount.name}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
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
              className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1"
            >
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => handleSwitch(acc.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left ${acc.id === activeAccountId ? 'bg-indigo-500/10' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {acc.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{acc.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono truncate">
                      {acc.addresses.eth.slice(0, 6)}...{acc.addresses.eth.slice(-4)}
                    </div>
                  </div>
                </button>
              ))}

              <div className="h-px bg-white/5 my-1" />

              <button
                onClick={() => { onImport(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left text-indigo-400"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
                <span className="text-sm font-medium">Add or Import Wallet</span>
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
}

export function CompactWalletCard({ onSend, onReceive, onBuy, onSwap, onImport }: CompactWalletCardProps) {
  const { accounts, activeAccountId, getBalance, isGenerating } = useWalletStore();
  const [balance, setBalance] = useState('0');

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  React.useEffect(() => {
    if (activeAccountId) {
      getBalance().then(setBalance);
    }
  }, [activeAccountId, getBalance]);

  if (isGenerating || !activeAccount) {
    return (
      <div className="w-full max-w-[640px] bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 min-h-[160px]">
        <Spinner size={24} color="#4f46e5" />
        <span className="text-sm text-gray-400">Setting up your wallet</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[640px] bg-gradient-to-br from-indigo-500/10 to-gray-900/50 border border-white/10 rounded-3xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <WalletSwitcher onImport={onImport} />
      </div>

      <div className="text-center mb-8">
        <div className="text-3xl font-extrabold tracking-tight text-white mb-1">
          ${(parseFloat(balance) * 2450.50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-sm text-gray-500 font-medium">{balance} ETH</div>
      </div>

      <div className="flex gap-4">
        {[
          { label: 'Send', icon: <Send size={16}/>, onClick: onSend, primary: true },
          { label: 'Receive', icon: <Download size={16}/>, onClick: onReceive },
          { label: 'Buy', icon: <ShoppingCart size={16}/>, onClick: onBuy },
          { label: 'Swap', icon: <RefreshCw size={16}/>, onClick: onSwap },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-150 active:scale-95 ${
              btn.primary
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500'
                : 'bg-white/5 text-gray-200 border border-white/10 hover:bg-white/10'
            }`}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
