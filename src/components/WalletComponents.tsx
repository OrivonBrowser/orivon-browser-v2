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
              className="absolute top-full left-0 mt-2 w-56 bg-[#1e1f24] border border-[#2b2c31] rounded-xl shadow-2xl z-50 overflow-hidden py-1"
            >
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => handleSwitch(acc.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#2b2c31] transition-colors text-left ${acc.id === activeAccountId ? 'bg-[#2b2c31]' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {acc.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#e6e7e8] truncate">{acc.name}</div>
                    <div className="text-[10px] text-[#9a9ba5] font-mono truncate">
                      {acc.addresses.eth.slice(0, 6)}...{acc.addresses.eth.slice(-4)}
                    </div>
                  </div>
                </button>
              ))}

              <div className="h-px bg-[#2b2c31] my-1" />

              <button
                onClick={() => { onImport(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#2b2c31] transition-colors text-left text-indigo-400"
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
  const { accounts, activeAccountId, getBalance, isGenerating, error, initialize: initializeWallet } = useWalletStore();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  React.useEffect(() => {
    if (activeAccountId) {
      getBalance().then(setBalance);
      setLoading(false);
    }
  }, [activeAccountId, getBalance]);

  const handleCopy = () => {
    if (!activeAccount) return;
    navigator.clipboard.writeText(activeAccount.addresses.eth);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if ((isGenerating || loading) && !activeAccount && !error) {
    return (
      <div className="w-full max-w-[600px] bg-[#1e1f24] border border-[#2b2c31] rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[140px]">
        <Spinner size={20} color="#4f46e5" />
        <span className="text-xs text-[#9a9ba5]">Loading wallet...</span>
      </div>
    );
  }

  if (error || (!activeAccount && !loading)) {
    return (
      <div className="w-full max-w-[600px] bg-[#1e1f24] border border-[#2b2c31] rounded-xl p-6 flex flex-col items-center text-center gap-4">
        <div className="text-[#9a9ba5] text-sm font-medium">No wallet yet</div>
        <button
          onClick={() => onImport()}
          className="px-6 h-10 rounded-full bg-[#2b2c31] text-[#e6e7e8] text-[13px] font-bold hover:bg-[#3b3c42] transition-colors border border-[#3b3c42]"
        >
          Import Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px] bg-[#1e1f24] border border-[#2b2c31] rounded-xl p-4 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <WalletSwitcher onImport={onImport} />
        <div className="flex items-center gap-2 text-[#9a9ba5] font-mono text-[11px]">
          <span>{activeAccount.addresses.eth.slice(0, 6)}...{activeAccount.addresses.eth.slice(-4)}</span>
          <button onClick={handleCopy} className="text-[#9a9ba5] hover:text-[#e6e7e8] transition-colors">
            {copied ? <div className="text-[#22c55e]">Copied</div> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
          </button>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-white mb-0.5">
          ${(parseFloat(balance) * 2450.50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
        </div>
        <div className="text-[12px] text-[#9a9ba5] font-medium">{balance} ETH</div>
      </div>

      <div className="flex gap-2">
        {[
          { label: 'Send', icon: <Send size={14}/>, onClick: onSend },
          { label: 'Receive', icon: <Download size={14}/>, onClick: onReceive },
          { label: 'Buy', icon: <ShoppingCart size={14}/>, onClick: onBuy },
          { label: 'Swap', icon: <RefreshCw size={14}/>, onClick: onSwap },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className="flex-1 h-9 rounded-lg bg-[#2b2c31] text-[#e6e7e8] text-[12px] font-bold flex items-center justify-center gap-2 hover:bg-[#3b3c42] transition-colors border border-[#3b3c42]/50"
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
