import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, Download, ExternalLink } from 'lucide-react';
import { useWalletStore } from '../store/wallet';
import Spinner from './Spinner';

interface WalletPanelProps {
  onClose: () => void;
  onOpenDashboard: () => void;
}

export default function WalletPanel({ onClose, onOpenDashboard }: WalletPanelProps) {
  const { accounts, activeAccountId, getBalance, initialize: initializeWallet } = useWalletStore();
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeAccountId) {
      getBalance().then(b => {
        setBalance(b);
        setLoading(false);
      });
    } else {
        setLoading(false);
    }
  }, [activeAccountId, getBalance]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={  { opacity: 0, y: -8,  scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute top-[calc(100%+8px)] right-0 w-[320px] bg-[#1e1f24] border border-[#2b2c31] rounded-xl shadow-2xl z-[500] overflow-hidden flex flex-col font-inter"
    >
      {!activeAccount ? (
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#2b2c31] flex items-center justify-center mb-4">
             <ExternalLink size={24} className="text-[#9a9ba5]" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No wallet connected</h2>
          <p className="text-sm text-[#9a9ba5] mb-6">Import or create a wallet to get started with Web3.</p>
          <button
            onClick={onOpenDashboard}
            className="w-full h-10 rounded-full bg-indigo-600 text-white font-bold text-[13px] hover:bg-indigo-500 transition-colors"
          >
            Open Dashboard
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#2b2c31] flex flex-col items-center">
            <span className="text-sm font-bold text-white">{activeAccount.name}</span>
            <span className="text-[11px] font-mono text-[#9a9ba5] mt-0.5">
              {activeAccount.addresses.eth.slice(0, 6)}...{activeAccount.addresses.eth.slice(-4)}
            </span>
          </div>

          {/* Balance */}
          <div className="p-8 flex flex-col items-center">
            {loading ? (
                <Spinner size={20} color="#4f46e5" />
            ) : (
                <>
                    <span className="text-3xl font-bold text-white mb-1.5">
                        ${(activeAccount.balance_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm text-[#818cf8] font-bold">{activeAccount.balance_eth || 0} ETH</span>
                </>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 pb-6 flex gap-3">
            <button className="flex-1 h-10 rounded-lg bg-[#2b2c31] text-[#e6e7e8] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#3b3c42] transition-colors">
              <Send size={14} /> Send
            </button>
            <button className="flex-1 h-10 rounded-lg bg-[#2b2c31] text-[#e6e7e8] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#3b3c42] transition-colors">
              <Download size={14} /> Receive
            </button>
          </div>

          {/* Footer Link */}
          <button
            onClick={onOpenDashboard}
            className="w-full h-12 border-t border-[#2b2c31] text-indigo-500 font-bold text-[13px] hover:bg-[#2b2c31] transition-colors flex items-center justify-center gap-2"
          >
            Open Dashboard <ExternalLink size={12} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
