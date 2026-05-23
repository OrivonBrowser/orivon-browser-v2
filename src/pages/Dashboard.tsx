import React, { useState, useEffect } from 'react';
import {
  Search, Wallet, Send, Download, Globe,
  Cpu, Activity, History, ExternalLink,
  MessageSquare, Layers, Box, Store,
  ChevronRight, Circle, MoreHorizontal,
  Copy, Check, ArrowRight, Shield, Settings,
  Moon, Sun, Eye, EyeOff, AlertTriangle, ArrowLeft,
  ShoppingCart, RefreshCw, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWalletStore, WalletAccount } from '../store/wallet';
import { useSettings } from '../store/settings';
import logo from '@/assets/logo.png';
import { ethers } from 'ethers';
import Spinner from '../components/Spinner';

// I decided to put switcher and compact card into src/components/WalletComponents.tsx
import * as WalletComps from '../components/WalletComponents';

interface DashboardProps {
  onOpenBrowser?: (url: string) => void;
  isMinimal?: boolean;
}

const QUICK_LAUNCH = [
  { name: 'Social', icon: <MessageSquare size={20} />, url: 'orivon.eth' },
  { name: 'DeFi', icon: <Layers size={20} />, url: 'app.uniswap.org' },
  { name: 'IPFS', icon: <Box size={20} />, url: 'ipfs.io' },
  { name: 'App Store', icon: <Store size={20} />, url: 'orivon://apps' },
];

const FEATURED_SITES = [
  { name: 'Mirror', icon: '🪞', url: 'mirror.xyz' },
  { name: 'Lens', icon: '🌿', url: 'lens.xyz' },
  { name: 'Farcaster', icon: '🟣', url: 'farcaster.xyz' },
  { name: 'Snapshot', icon: '⚡', url: 'snapshot.org' },
];

export default function Dashboard({ onOpenBrowser, isMinimal = false }: DashboardProps) {
  const { accounts, activeAccountId, getBalance, setBackedUp, _wallet } = useWalletStore();
  const { searchEngine, setSearchEngine, web3ScoreProvider, setWeb3ScoreProvider, theme, setTheme } = useSettings();
  const [balance, setBalance] = useState('0');
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'activity'>('tokens');
  const [view, setView] = useState<'main' | 'backup' | 'send' | 'receive' | 'import'>('main');
  const [copied, setCopied] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  useEffect(() => {
    // Initial loading simulation
    const timer = setTimeout(() => setInitialLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeAccountId) {
      getBalance().then(setBalance);
    }
  }, [activeAccountId, getBalance]);

  // Handle direct view navigation via URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    if (v === 'send') setView('send');
    else if (v === 'receive') setView('receive');
    else if (v === 'import') setView('import');
    else if (v === 'backup') setView('backup');
  }, []);

  const [nodes, setNodes] = useState<Record<string, 'Online' | 'Offline' | 'Starting'>>({
    ipfs: 'Online',
    bittorrent: 'Offline',
    bitcoin: 'Starting'
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query && onOpenBrowser) onOpenBrowser(query);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Online') return '#00c76a';
    if (status === 'Starting') return '#f59e0b';
    return '#6b7280';
  };

  const startNode = (id: string) => {
    setNodes(prev => ({ ...prev, [id]: 'Starting' }));
    setTimeout(() => {
      setNodes(prev => ({ ...prev, [id]: 'Online' }));
    }, 2000 + Math.random() * 1000);
  };

  const stopNode = (id: string) => {
    setNodes(prev => ({ ...prev, [id]: 'Offline' }));
  };

  if (initialLoading) {
    return (
      <div className="h-full w-full bg-[#0a0a0f] flex flex-col items-center justify-center gap-6">
        <img src={logo} alt="Orivon" className="w-16 h-16 rounded-2xl animate-pulse" />
        <Spinner size={32} color="#4f46e5" />
      </div>
    );
  }

  if (view === 'backup') return <BackupView onBack={() => setView('main')} />;
  if (view === 'send') return <SendView onBack={() => setView('main')} onGoToBackup={() => setView('backup')} />;
  if (view === 'receive') return <ReceiveView onBack={() => setView('main')} address={activeAccount?.addresses.eth || ''} />;
  if (view === 'import') return <ImportView onBack={() => setView('main')} />;

  return (
    <div className="bg-[#0a0a0f] text-white min-h-full w-full flex flex-col items-center px-5 py-10 pb-20 font-inter overflow-y-auto">
      {/* Search Section */}
      <div className="w-full max-w-[640px] mb-12 text-center">
        <img src={logo} alt="Orivon" className="w-12 h-12 rounded-xl mb-6 mx-auto" />
        <form onSubmit={handleSearch}>
          <div className="relative flex items-center group">
            <Search className="absolute left-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              name="search"
              placeholder="Search Web3 or type a .eth address"
              className="w-full h-14 rounded-full bg-white/5 border border-white/10 pl-14 pr-12 text-base text-white outline-none transition-all duration-200 focus:bg-white/[0.08] focus:border-indigo-500/50"
            />
          </div>
        </form>
      </div>

      <div className="w-full max-w-[900px]">
        {/* Wallet Box */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-[#0f0f19]/50 border border-white/10 rounded-[32px] p-8 mb-8 relative shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <WalletComps.default onImport={() => setView('import')} />

            <div className="relative">
              <button
                onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white cursor-pointer hover:bg-white/10 transition-colors"
              >
                <MoreHorizontal size={20} />
              </button>

              <AnimatePresence>
                {walletMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setWalletMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-12 right-0 w-56 bg-[#1a1a24] border border-white/10 rounded-2xl p-2 z-50 shadow-2xl overflow-hidden"
                    >
                      {[
                        { label: 'View Seed Phrase', icon: <Eye size={16}/>, onClick: () => { setView('backup'); setWalletMenuOpen(false); } },
                        { label: 'Copy Wallet Address', icon: <Copy size={16}/>, onClick: () => { handleCopy(activeAccount?.addresses.eth || ''); setWalletMenuOpen(false); } },
                        { label: 'Rename Account', icon: <ExternalLink size={16}/>, onClick: () => setWalletMenuOpen(false) },
                        { label: 'Add New Account', icon: <ExternalLink size={16}/>, onClick: () => setWalletMenuOpen(false) },
                        { label: 'Import Account', icon: <ExternalLink size={16}/>, onClick: () => { setView('import'); setWalletMenuOpen(false); } },
                        { label: 'Remove Account', icon: <ExternalLink size={16}/>, onClick: () => setWalletMenuOpen(false) },
                      ].map(item => (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className="w-full px-4 py-3 flex items-center gap-3 bg-transparent border-none text-gray-400 text-[13px] font-medium cursor-pointer rounded-xl text-left hover:bg-white/5 hover:text-white transition-all"
                        >
                          {item.icon} {item.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="text-center mb-10">
            <div className="text-5xl font-black tracking-tight text-white mb-2">
              ${(parseFloat(balance) * 2450.50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-500 font-mono text-sm">
              <span>{activeAccount?.addresses.eth.slice(0, 6)}...{activeAccount?.addresses.eth.slice(-4)}</span>
              <button onClick={() => handleCopy(activeAccount?.addresses.eth || '')} className="bg-transparent border-none text-gray-600 hover:text-gray-300 cursor-pointer p-0">
                {copied ? <Check size={14} color="#00c76a" /> : <Copy size={14} />}
              </button>
            </div>
            <div className="text-gray-600 text-sm mt-1 font-medium">{balance} ETH</div>
          </div>

          <div className="flex gap-4 mb-10">
            {[
              { label: 'Send', icon: <Send size={18}/>, onClick: () => setView('send'), primary: true },
              { label: 'Receive', icon: <Download size={18}/>, onClick: () => setView('receive') },
              { label: 'Buy', icon: <ShoppingCart size={18}/>, onClick: () => {} },
              { label: 'Swap', icon: <RefreshCw size={18}/>, onClick: () => {} },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 active:scale-95 ${
                  btn.primary
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500'
                    : 'bg-white/5 text-gray-200 border border-white/10 hover:bg-white/10'
                }`}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>

          <div>
            <div className="flex gap-6 border-b border-white/5 mb-6">
              {(['tokens', 'nfts', 'activity'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-1 pb-4 bg-transparent border-none text-sm font-bold cursor-pointer relative transition-colors ${
                    activeTab === tab ? 'text-indigo-500' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-indigo-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="py-10 text-center text-gray-500 font-medium">
              {activeTab === 'tokens' && (
                <div>
                  {balance === '0' ? (
                    <p className="text-sm">No tokens yet. Start by receiving crypto.</p>
                  ) : (
                    <div className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#627eea] flex items-center justify-center font-bold text-base text-white">Ξ</div>
                        <div className="text-left">
                          <div className="font-bold text-white">Ethereum</div>
                          <div className="text-xs text-gray-500">ETH</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{balance} ETH</div>
                        <div className="text-xs text-gray-500">${(parseFloat(balance) * 2450.50).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'nfts' && (
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-700">
                       <Layers size={32} />
                    </div>
                    <p className="text-sm">No NFTs yet.</p>
                 </div>
              )}
              {activeTab === 'activity' && (
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-700">
                       <Activity size={32} />
                    </div>
                    <p className="text-sm">No transactions yet.</p>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Nodes Widget */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 mb-8 shadow-xl">
          <div className="text-xl font-bold mb-8 flex items-center gap-3">
            <Cpu size={24} className="text-indigo-500" /> Web3 Nodes
          </div>
          <div className="flex flex-col gap-6">
            {[
              { id: 'ipfs', name: 'IPFS Node' },
              { id: 'bittorrent', name: 'BitTorrent Node' },
              { id: 'bitcoin', name: 'Bitcoin Node (Pruned)', sub: 'Uses a pre-synced snapshot. Quick sync.' }
            ].map(node => (
              <div key={node.id} className="flex justify-between items-center">
                <div>
                  <div className="text-[15px] font-semibold text-gray-200">{node.name}</div>
                  {node.sub && <div className="text-xs text-gray-600 mt-1">{node.sub}</div>}
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${nodes[node.id] === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : nodes[node.id] === 'Starting' ? 'bg-amber-500' : 'bg-gray-700'}`} />
                    <span className="text-xs text-gray-500 font-medium">{nodes[node.id]}</span>
                    {nodes[node.id] === 'Starting' && <Spinner size={10} color="#f59e0b" className="ml-1" />}
                  </div>
                </div>
                <button
                  onClick={() => nodes[node.id] === 'Online' ? stopNode(node.id) : startNode(node.id)}
                  disabled={nodes[node.id] === 'Starting'}
                  className={`px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all duration-200 cursor-pointer ${
                    nodes[node.id] === 'Online'
                      ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {nodes[node.id] === 'Online' ? 'Stop' : nodes[node.id] === 'Starting' ? 'Starting' : 'Start'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Featured Web3 Sites */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-xl">
            <div className="text-lg font-bold mb-6">Explore Web3</div>
            <div className="grid grid-cols-2 gap-4">
              {FEATURED_SITES.map(site => (
                <button key={site.name} onClick={() => onOpenBrowser?.(site.url)} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 hover:bg-white/10 hover:-translate-y-1">
                  <span className="text-3xl">{site.icon}</span>
                  <span className="text-[13px] font-bold text-white">{site.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Network Status */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-xl">
            <div className="text-lg font-bold mb-6">Network</div>
            <div className="flex flex-col gap-5">
              {[
                { name: 'ENS Resolver', active: true },
                { name: 'IPFS Gateway', active: true },
                { name: 'Search Engine', val: 'Web3 Compass', active: true },
                { name: 'Web3 Score', val: web3ScoreProvider, active: true },
              ].map(item => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-[13px] text-gray-500 font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {item.val && <span className="text-xs font-bold text-gray-300">{item.val}</span>}
                    <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sites */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-xl">
            <div className="text-lg font-bold mb-6">Recent Sites</div>
            <div className="h-24 flex items-center justify-center text-gray-600 text-[13px] font-medium text-center">
              Your visited Web3 sites will appear here
            </div>
          </div>

          {/* Quick Settings */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-xl">
            <div className="text-lg font-bold mb-6">Quick Settings</div>
            <div className="flex flex-col gap-6">
               <div>
                  <div className="text-[11px] font-black text-gray-600 uppercase mb-2 tracking-wider">Search Engine</div>
                  <select
                    value={searchEngine}
                    onChange={(e) => setSearchEngine(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none cursor-pointer hover:bg-white/[0.08]"
                  >
                    <option value="web3compass">Web3 Compass</option>
                    <option value="google">Google</option>
                    <option value="duckduckgo">DuckDuckGo</option>
                  </select>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-300">Dark Mode</span>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 cursor-pointer border-none ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>
               <button className="text-indigo-500 bg-transparent border-none p-0 text-sm font-bold cursor-pointer text-left hover:text-indigo-400">More settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackupView({ onBack }: { onBack: () => void }) {
  const { getMnemonic, setBackedUp } = useWalletStore();
  const [revealed, setRevealed] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getMnemonic().then(m => {
      if (m) setMnemonic(m);
      else setError("Unable to retrieve seed phrase. Please contact support.");
    });
  }, [getMnemonic]);

  const words = mnemonic ? mnemonic.split(' ') : [];

  const handleCopyAll = () => {
    if (!mnemonic) return;
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0a0a0f] text-white min-h-full w-full py-20 px-5 flex flex-col items-center font-inter">
      <div className="w-full max-w-[640px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-gray-500 hover:text-white cursor-pointer mb-10 transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 mb-10 flex gap-5">
          <AlertTriangle size={24} className="text-rose-500 shrink-0" />
          <div>
            <div className="font-black text-rose-500 mb-1 uppercase text-xs tracking-wider">Never share your seed phrase!</div>
            <div className="text-sm text-rose-400 leading-relaxed font-medium">Anyone who has your 12-word seed phrase has full access to your wallet and funds. Orivon will never ask for this.</div>
          </div>
        </div>

        <h1 className="text-3xl font-black mb-3 tracking-tight">Backup your wallet</h1>
        <p className="text-gray-500 mb-10 leading-relaxed font-medium">Write down these 12 words in order and keep them somewhere safe offline.</p>

        {error ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-rose-500 font-bold">{error}</div>
        ) : (
          <div className="relative bg-white/5 border border-white/10 rounded-[32px] p-8 mb-10 overflow-hidden shadow-2xl">
            <div className={`grid grid-cols-3 gap-4 transition-all duration-500 ${revealed ? 'blur-0' : 'blur-xl scale-105'}`}>
              {words.map((word, i) => (
                <div key={i} className="flex flex-col bg-white/5 p-4 rounded-xl border border-white/5 relative">
                  <span className="text-[10px] font-black text-gray-700 absolute top-2 left-2 uppercase">{i + 1}</span>
                  <span className="font-bold text-white text-center mt-2">{word}</span>
                </div>
              ))}
            </div>

            {!revealed && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
                <button
                  onClick={() => setRevealed(true)}
                  className="px-8 py-4 rounded-2xl bg-indigo-600 text-white border-none font-black cursor-pointer shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 transition-all active:scale-95"
                >
                  Reveal Seed Phrase
                </button>
              </div>
            )}
          </div>
        )}

        {revealed && (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <button
                onClick={handleCopyAll}
                className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Copy size={18} /> Copy All
              </button>
              <AnimatePresence>
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xl"
                  >
                    Copied!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => { setBackedUp(true); onBack(); }}
              className="w-full h-16 rounded-2xl bg-indigo-600 text-white border-none font-black text-lg cursor-pointer hover:bg-indigo-500 shadow-xl shadow-indigo-500/20"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ImportView({ onBack }: { onBack: () => void }) {
  const { importWallet } = useWalletStore();
  const [pasteMode, setPasteMode] = useState(false);
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleWordChange = (idx: number, val: string) => {
    const newWords = [...words];
    newWords[idx] = val.trim().toLowerCase();
    setWords(newWords);
    setError(null);
  };

  const handlePasteChange = (text: string) => {
    setPastedText(text);
    const splitWords = text.trim().split(/\s+/).slice(0, 12);
    if (splitWords.length === 12) {
       setWords(splitWords.map(w => w.toLowerCase()));
    }
    setError(null);
  };

  const isComplete = words.every(w => w.length > 0);

  const handleImport = async () => {
    const mnemonic = words.join(' ');
    if (!ethers.Mnemonic.isValidMnemonic(mnemonic)) {
      setError("Invalid seed phrase. Please check your words and try again.");
      return;
    }

    setLoading(true);
    try {
      await importWallet(mnemonic, ''); // Default empty password for MVP
      setSuccess(true);
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (e) {
      setError("Failed to import wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-full w-full bg-[#0a0a0f] flex flex-col items-center justify-center text-center p-10">
        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
          <Check size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Wallet Imported</h1>
        <p className="text-gray-500 font-medium">Redirecting you back to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0f] text-white min-h-full w-full py-20 px-5 flex flex-col items-center font-inter">
      <div className="w-full max-w-[600px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-gray-500 hover:text-white cursor-pointer mb-10 transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="text-3xl font-black mb-2 tracking-tight">Import Wallet</h1>
        <p className="text-gray-500 mb-12 font-medium">Enter your 12 word seed phrase to import an existing wallet</p>

        {pasteMode ? (
          <div className="mb-10">
            <textarea
              autoFocus
              placeholder="Paste your 12 words here separated by spaces..."
              className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-bold outline-none focus:border-indigo-500/50 resize-none transition-all"
              value={pastedText}
              onChange={(e) => handlePasteChange(e.target.value)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {words.map((word, i) => (
              <div key={i} className="flex flex-col bg-white/5 rounded-2xl border border-white/10 p-3 group focus-within:border-indigo-500/50 transition-all">
                <span className="text-[10px] font-black text-gray-700 uppercase mb-1">{i + 1}</span>
                <input
                  type="text"
                  className="bg-transparent border-none text-white font-bold outline-none text-center"
                  value={word}
                  onChange={(e) => handleWordChange(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setPasteMode(!pasteMode)}
          className="bg-transparent border-none text-indigo-500 font-black text-sm cursor-pointer mb-12 hover:text-indigo-400 transition-colors"
        >
          {pasteMode ? "Use grid input instead" : "Paste as text instead"}
        </button>

        {error && <div className="text-rose-500 font-bold text-sm mb-6 text-center">{error}</div>}

        <button
          onClick={handleImport}
          disabled={!isComplete || loading}
          className={`w-full h-16 rounded-2xl font-black text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
            isComplete && !loading
              ? 'bg-indigo-600 text-white cursor-pointer hover:bg-indigo-500 shadow-xl shadow-indigo-500/20'
              : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
          }`}
        >
          {loading ? <Spinner size={20} /> : "Verify and Import"}
        </button>
      </div>
    </div>
  );
}

function SendView({ onBack, onGoToBackup }: { onBack: () => void, onGoToBackup: () => void }) {
  const { accounts, activeAccountId } = useWalletStore();
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];
  const isBackedUp = activeAccount?.isBackedUp;
  const [step, setStep] = useState(isBackedUp ? 'form' : 'warning');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => onBack(), 1500);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-black/80 fixed inset-0 z-[1000] flex flex-col items-center justify-center text-center">
        <Spinner size={48} color="#4f46e5" className="mb-6" />
        <h2 className="text-2xl font-black text-white mb-2">Broadcasting transaction</h2>
        <p className="text-gray-400 font-medium">Please wait while your transaction is being processed on the network.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-full w-full bg-[#0a0a0f] flex flex-col items-center justify-center text-center p-10">
        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
          <Check size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Transaction Sent</h1>
        <p className="text-gray-500 font-medium">Your funds are on the way!</p>
      </div>
    );
  }

  if (step === 'warning') {
    return (
      <div className="bg-[#0a0a0f] text-white h-full w-full flex items-center justify-center p-5 font-inter">
        <div className="max-w-[480px] text-center">
          <div className="w-20 h-20 rounded-[28px] bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/5">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">Back up your wallet first</h1>
          <p className="text-gray-500 leading-relaxed font-medium mb-12">
            Before you send funds, make sure your wallet is backed up. If you lose access to this device without a backup you will lose your funds permanently.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={onGoToBackup}
              className="h-16 rounded-2xl bg-indigo-600 text-white border-none font-black text-lg cursor-pointer hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Back Up Now
            </button>
            <button
              onClick={() => setStep('form')}
              className="h-16 rounded-2xl bg-transparent border-none text-gray-500 font-black text-base cursor-pointer hover:text-white transition-colors"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0f] text-white min-h-full w-full py-20 px-5 flex flex-col items-center font-inter">
      <div className="w-full max-w-[540px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-gray-500 hover:text-white cursor-pointer mb-10 transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Back
        </button>

        {!isBackedUp && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8 flex items-center gap-4">
            <AlertTriangle size={20} className="text-amber-500 shrink-0" />
            <span className="text-[13px] text-amber-500 font-bold">Wallet not backed up. Risk of permanent fund loss.</span>
          </div>
        )}

        <h1 className="text-3xl font-black mb-10 tracking-tight">Send Crypto</h1>

        <div className="flex flex-col gap-8">
          <div>
            <label className="text-[11px] font-black text-gray-600 uppercase mb-3 block tracking-wider">Network</label>
            <div className="h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center px-4 gap-4 hover:bg-white/[0.08] transition-colors cursor-pointer group">
              <div className="w-6 h-6 rounded-full bg-[#627eea] flex items-center justify-center text-[10px] font-black">Ξ</div>
              <span className="flex-1 font-bold text-sm">Ethereum Mainnet</span>
              <ChevronRight size={18} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-600 uppercase mb-3 block tracking-wider">Recipient Address</label>
            <input
              placeholder="0x... or .eth name"
              className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-4 text-white font-bold outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-600 uppercase mb-3 block tracking-wider">Amount</label>
            <div className="relative">
              <input
                placeholder="0.0"
                className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 pl-4 pr-20 text-white font-black text-xl outline-none focus:border-indigo-500/50 transition-all"
              />
              <div className="absolute right-4 top-4 font-black text-indigo-500">ETH</div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-bold text-gray-600 px-1">
              <span>Balance: 0 ETH</span>
              <span>≈ $0.00</span>
            </div>
          </div>

          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500">Network Fee</span>
                <span className="text-xs font-black text-white">0.00042 ETH ($1.03)</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500">Destination Score</span>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-xs font-black text-emerald-500">Trustless</span>
                </div>
             </div>
          </div>

          <button
            onClick={handleSend}
            className="h-16 rounded-2xl bg-indigo-600 text-white border-none font-black text-lg cursor-pointer hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all mt-4"
          >
            Confirm Send
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiveView({ onBack, address }: { onBack: () => void, address: string }) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setGenerating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0a0a0f] text-white min-h-full w-full py-20 px-5 flex flex-col items-center font-inter text-center">
      <div className="w-full max-w-[440px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-gray-500 hover:text-white cursor-pointer mb-10 transition-colors font-bold text-sm mx-auto">
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="text-3xl font-black mb-3 tracking-tight">Receive Crypto</h1>
        <p className="text-gray-500 mb-12 font-medium">Your Ethereum wallet address</p>

        <div className="bg-white p-8 rounded-[40px] inline-block mb-10 shadow-2xl shadow-indigo-500/5 relative min-w-[260px] min-h-[260px]">
          {generating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size={32} color="#4f46e5" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-black flex flex-wrap p-1">
              {Array.from({ length: 400 }).map((_, i) => (
                <div key={i} className="w-[12px] h-[12px]" style={{ background: Math.random() > 0.5 ? '#fff' : '#000' }} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 mb-8 shadow-xl">
           <span className="flex-1 text-[13px] text-white font-mono truncate">{address}</span>
           <button onClick={handleCopy} className="bg-indigo-600 border-none rounded-xl px-4 py-2 text-white text-xs font-black cursor-pointer hover:bg-indigo-500 transition-all active:scale-95">
             {copied ? 'Copied' : 'Copy'}
           </button>
        </div>

        <div className="bg-indigo-500/10 rounded-2xl p-4 flex gap-4 text-left items-start border border-indigo-500/10">
           <AlertTriangle size={20} className="text-indigo-500 shrink-0 mt-0.5" />
           <p className="text-xs text-gray-500 font-medium leading-relaxed m-0">Only send compatible tokens to this address. Sending unsupported tokens may result in permanent loss.</p>
        </div>
      </div>
    </div>
  );
}
