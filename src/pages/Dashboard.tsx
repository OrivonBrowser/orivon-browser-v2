import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutDashboard, Wallet, Globe, Package, Activity, Clock, Settings,
  ChevronDown, ChevronRight, Copy, Check, TrendingUp, ArrowUpRight,
  ArrowDownLeft, Plus, ArrowLeftRight, Database, Share2, CircleDot,
  Loader2, Bell, X, Shield, Search, ArrowLeft, ShoppingCart, MoreHorizontal,
  Server, Key, Terminal, ArrowUpDown, Trash2, ExternalLink, Send,
  LayoutGrid, Star, Download, Repeat, Cpu, Users, Image, Gamepad, Wrench,
  Code, BookOpen, Github, CheckCircle, SlidersHorizontal, SearchX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWalletStore } from '../store/wallet';
import { useSessionStore } from '../store/session';
import { useTabsStore } from '../store/tabs';
import { useSettings } from '../store/settings';
import AppStore from '../components/AppStore';
import { DEMO_WALLET, SETTINGS_URL, NODEMANAGER_URL } from '../constants';

// --- Types ---
type ViewType = 'Dashboard' | 'Wallet' | 'Browse Web3' | 'App Store' | 'Node Manager' | 'History' | 'Settings';

// --- Components ---

const StatusDot = ({ color, pulse }: { color: string; pulse?: boolean }) => (
  <div className={`w-1.5 h-1.5 rounded-full ${color} ${pulse ? 'animate-pulse' : ''}`} />
);

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-2 py-0.5 rounded-[6px] text-[12px] font-semibold ${className}`}>
    {children}
  </div>
);

// --- Charts ---

const PortfolioChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  const width = 800;
  const height = 180;
  const padding = 20;

  const minVal = Math.min(...data.map(d => d.value));
  const maxVal = Math.max(...data.map(d => d.value));
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((d.value - minVal) / range) * (height - padding * 2) - padding
  }));

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="w-full h-[180px] relative mt-6 group">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          d={pathD}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
        />
        
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          d={areaD}
          fill="url(#chartGradient)"
        />
      </svg>
    </div>
  );
};

// --- Dashboard Component ---

export default function Dashboard({ onOpenBrowser }: { onOpenBrowser?: (url: string) => void }) {
  const { accounts, activeAccountId, switchAccount, importWallet } = useWalletStore();
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];
  
  const [activeView, setActiveView] = useState<ViewType>('Dashboard');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; title: string; sub: string }[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 250);
    return () => clearTimeout(timer);
  }, []);

  const addToast = (title: string, sub: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, title, sub }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard': return <DashboardPage onOpenBrowser={onOpenBrowser} onToast={addToast} onBackup={() => setShowSeedModal(true)} />;
      case 'Wallet': return <WalletPage onBackup={() => setShowSeedModal(true)} onImport={() => setShowImportModal(true)} />;
      case 'Browse Web3': return <BrowseWeb3Page onOpen={onOpenBrowser} />;
      case 'App Store': return <AppStore onOpen={onOpenBrowser} onToast={addToast} />;
      case 'Node Manager': return <NodeManagerPage onToast={addToast} />;
      case 'History': return <HistoryPage onOpen={onOpenBrowser} />;
      case 'Settings': return <SettingsPage />;
      default: return <DashboardPage onOpenBrowser={onOpenBrowser} onToast={addToast} onBackup={() => setShowSeedModal(true)} />;
    }
  };

  return (
    <div className={`flex h-full w-full bg-[#0d0e14] text-[#f8fafc] font-inter overflow-hidden transition-opacity duration-250 ${isInitialLoad ? 'opacity-0' : 'opacity-100'}`}>
      {/* Sidebar */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} activeAccount={activeAccount} accounts={accounts} onSwitch={switchAccount} onImport={() => setShowImportModal(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <TopBar activeView={activeView} />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-8 pt-[84px]"
            >
              <div className="max-w-[1200px] mx-auto">
                {renderContent()}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Toasts */}
        <div className="fixed bottom-6 right-6 z-[60] space-y-3">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="bg-[#111218] border-l-3 border-[#22c55e] border border-[#1e2030] rounded-[8px] p-4 min-w-[240px] shadow-2xl"
              >
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#f8fafc]">
                  <Check size={14} className="text-[#22c55e]" /> {toast.title}
                </div>
                <div className="text-[12px] text-[#64748b] ml-5 mt-0.5">{toast.sub}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSeedModal && (
          <SeedPhraseModal onClose={() => setShowSeedModal(false)} />
        )}
        {showImportModal && (
          <ImportWalletModal 
            onClose={() => setShowImportModal(false)} 
            onImport={async (words) => {
              await importWallet(words, '', 'Trading Wallet');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sidebar ---

function Sidebar({ activeView, setActiveView, activeAccount, accounts, onSwitch, onImport }: any) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Wallet', icon: Wallet },
    { label: 'Browse Web3', icon: Globe },
    { label: 'App Store', icon: Package },
    { label: 'Node Manager', icon: Server },
    { label: 'History', icon: Clock },
    { label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[220px] h-full bg-[#0a0b11] border-r border-[#1e2030] flex flex-col shrink-0 z-50">
      <div className="p-6">
        <div className="text-[15px] text-white font-bold tracking-[0.1em]">ORIVON</div>
        <div className="text-[10px] text-[#6366f1] font-bold tracking-[0.06em] uppercase mt-0.5">The Web3 Browser</div>
      </div>

      <div className="h-px bg-[#1e2030] w-full" />

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.label}
            onClick={() => setActiveView(item.label as ViewType)}
            className={`w-full h-11 px-4 flex items-center gap-3 rounded-[8px] transition-all border-none bg-transparent cursor-pointer group relative ${
              activeView === item.label ? 'bg-[#111218] text-[#f8fafc]' : 'text-[#64748b] hover:text-[#94a3b8]'
            }`}
          >
            {activeView === item.label && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#6366f1]" />
            )}
            <item.icon size={16} className={activeView === item.label ? 'text-[#f8fafc]' : 'text-[#64748b] group-hover:text-[#94a3b8]'} />
            <span className="text-[13px] font-medium">{item.label}</span>
          </button>
        ))}

        <div className="mt-6 mb-2">
          <div className="text-[10px] text-[#475569] font-bold tracking-[0.08em] uppercase px-4">Network</div>
        </div>

        <div className="px-4 space-y-3 py-2">
          <NetworkRow label="ENS Resolver" status="Active" dotColor="bg-[#22c55e]" />
          <NetworkRow label="IPFS" status="Active" dotColor="bg-[#22c55e]" />
          <NetworkRow label="Bitcoin Node" status="Offline" dotColor="bg-[#475569]" />
        </div>
      </nav>

      <div className="p-4 relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full bg-[#111218] border border-[#1e2030] rounded-[10px] p-3 text-left hover:border-[#1e2030] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[13px] font-medium text-[#f8fafc]">{activeAccount.name}</span>
            <ChevronDown size={14} className={`text-[#64748b] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          <div className="text-[11px] text-[#64748b] font-mono mb-2">{activeAccount.addresses.eth.slice(0, 6)}...{activeAccount.addresses.eth.slice(-4)}</div>
          <div className="text-[13px] font-bold text-[#f8fafc] tabular-nums">${activeAccount.balance_usd.toLocaleString()}</div>
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <WalletSwitcherDropdown 
              accounts={accounts} 
              activeId={activeAccount.id} 
              onSwitch={(id) => { onSwitch(id); setDropdownOpen(false); }} 
              onImport={() => { onImport(); setDropdownOpen(false); }}
              onClose={() => setDropdownOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

function NetworkRow({ label, status, dotColor }: { label: string; status: string; dotColor: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className="text-[12px] text-[#f8fafc]">{label}</span>
      </div>
      <span className="text-[11px] text-[#64748b] font-medium">{status}</span>
    </div>
  );
}

// --- Top Bar ---

function TopBar({ activeView }: { activeView: ViewType }) {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 h-[52px] bg-[#0d0e14] border-b border-[#1e2030] px-8 flex items-center justify-between z-40">
      <div className="flex flex-col">
        <h1 className="text-[16px] font-bold text-[#f8fafc]">{activeView}</h1>
        {activeView === 'Dashboard' && <p className="text-[11px] text-[#64748b] font-medium">{greeting}. Here is your Web3 overview.</p>}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[12px] text-[#64748b] font-medium">
          <span>1,247,832 sites loaded</span>
          <div className="w-px h-3 bg-[#1e2030]" />
          <span>48M trackers blocked</span>
        </div>

        <button className="text-[#64748b] hover:text-[#f8fafc] transition-colors bg-transparent border-none cursor-pointer">
          <Bell size={18} />
        </button>

        <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-[13px] font-bold text-white uppercase">
          O
        </div>
      </div>
    </header>
  );
}

// --- Dashboard Page ---

function DashboardPage({ onOpenBrowser, onToast, onBackup }: any) {
  const { accounts, activeAccountId } = useWalletStore();
  const { accentColor } = useSettings();
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  const chartData = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      time: i,
      value: 12847.63 + (Math.random() - 0.5) * 400
    }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-10 gap-5">
        {/* Wallet Section (Left 6/10) */}
        <div className="col-span-6 space-y-5">
          <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] p-8 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-[20px] font-semibold text-[#f8fafc]">Portfolio</h2>
              <button className="w-8 h-8 rounded-full bg-[#161720] border border-[#1e2030] flex items-center justify-center text-[#94a3b8] hover:text-[#f8fafc] hover:border-[#6366f1] transition-all cursor-pointer">
                <Plus size={18} />
              </button>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-[44px] font-bold text-[#f8fafc] tracking-[-0.03em] tabular-nums leading-tight">
                  $12,847.63
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">+$306.82</Badge>
                  <Badge className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">+2.4%</Badge>
                </div>
              </div>

              <div className="flex gap-4">
                <CircleAction icon={ShoppingCart} label="Buy" />
                <CircleAction icon={Send} label="Send" />
                <CircleAction icon={ArrowLeftRight} label="Swap" />
                <CircleAction icon={MoreHorizontal} label="More" />
              </div>
            </div>

            {/* Chart Area */}
            <div className="mt-8">
              <div className="flex justify-end gap-2 mb-2">
                {['1H', '24H', '7D', '1M', '1Y'].map(t => (
                  <button
                    key={t}
                    className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition-all border-none cursor-pointer ${
                      t === '24H' ? 'bg-[#6366f1] text-white' : 'bg-transparent text-[#64748b] hover:text-[#94a3b8]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <PortfolioChart data={chartData} />
            </div>

            {/* Asset Tabs */}
            <div className="border-t border-[#1e2030] mt-8 pt-8">
              <div className="flex gap-8 mb-6">
                {['Assets', 'NFTs', 'Activity'].map(tab => (
                  <button
                    key={tab}
                    className={`text-[13px] font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer pb-2 relative ${
                      tab === 'Assets' ? 'text-[#f8fafc]' : 'text-[#64748b] hover:text-[#94a3b8]'
                    }`}
                  >
                    {tab}
                    {tab === 'Assets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1]" />}
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <AssetRow symbol="ETH" name="Ethereum" amount="3.4821" val="$11,203.42" change="+2.4%" color="#627EEA" />
                <AssetRow symbol="USDC" name="USD Coin" amount="1,250.00" val="$1,250.00" change="+0.01%" color="#2775CA" />
                <AssetRow symbol="UNI" name="Uniswap" amount="48.5" val="$394.21" change="-1.2%" color="#FF007A" />
              </div>
            </div>
          </div>
          
          <NodesCard onToast={onToast} />
        </div>

        {/* Right Section (4/10) */}
        <div className="col-span-4 space-y-5">
          <FeaturedAppsCard onOpen={onOpenBrowser} />
          <Web3ActivityFeed />
          <NetworkStatusDetailsCard />
        </div>
      </div>
      
      <MarketingCard />
    </div>
  );
}

function CircleAction({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className="w-[52px] h-[52px] rounded-full bg-[#1e2030] flex items-center justify-center text-white transition-all duration-150 group-hover:bg-[#252636] group-hover:scale-105">
        <Icon size={20} />
      </div>
      <span className="text-[12px] text-[#94a3b8] font-medium group-hover:text-[#f8fafc]">{label}</span>
    </div>
  );
}

// --- Wallet Page ---

function WalletPage({ onBackup, onImport }: any) {
  const { accounts, activeAccountId, switchAccount } = useWalletStore();
  
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance_usd || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[20px] font-semibold text-[#f8fafc]">Wallet</h2>
        <p className="text-[13px] text-[#64748b] mt-1">Manage your Web3 identity</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {accounts.map(acc => (
          <button
            key={acc.id}
            onClick={() => switchAccount(acc.id)}
            className={`min-w-[220px] bg-[#111218] border rounded-[12px] p-5 text-left transition-all cursor-pointer ${
              acc.id === activeAccountId ? 'border-[#6366f1]' : 'border-[#1e2030] hover:border-[#2d2e45]'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white ${acc.id === 'wallet-demo-2' ? 'bg-[#0891b2]' : 'bg-[#6366f1]'}`}>
                {acc.name.charAt(0)}
              </div>
              {acc.id === activeAccountId && (
                <div className="flex items-center gap-1.5 bg-[#22c55e]/10 px-2 py-0.5 rounded-[6px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  <span className="text-[10px] font-bold text-[#22c55e] uppercase">Active</span>
                </div>
              )}
            </div>
            <div className="text-[13px] font-bold text-[#f8fafc] mb-0.5">{acc.name}</div>
            <div className="text-[11px] text-[#64748b] font-mono mb-4">{acc.addresses.eth.slice(0, 6)}...{acc.addresses.eth.slice(-4)}</div>
            <div className="text-[18px] font-bold text-[#f8fafc] tabular-nums mb-1">${acc.balance_usd.toLocaleString()}</div>
            <div className="text-[12px] text-[#94a3b8]">{acc.balance_eth} ETH</div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              <span className="text-[11px] text-[#64748b] font-medium">Ethereum Mainnet</span>
            </div>
          </button>
        ))}
        <button 
          onClick={onImport}
          className="min-w-[220px] border border-dashed border-[#2d2e45] rounded-[12px] p-5 flex flex-col items-center justify-center gap-3 bg-transparent text-[#64748b] hover:border-[#6366f1] hover:text-[#818cf8] transition-all cursor-pointer"
        >
          <Plus size={24} />
          <span className="text-[13px] font-semibold">Add Wallet</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[16px] font-semibold text-[#f8fafc]">All Assets</h3>
          <span className="text-[14px] text-[#94a3b8]">Total: ${totalBalance.toLocaleString()}</span>
        </div>
        <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e2030] h-10">
                <th className="pl-6 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Asset</th>
                <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Wallet</th>
                <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Amount</th>
                <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Value</th>
                <th className="pr-6 text-[11px] font-bold text-[#475569] uppercase tracking-wider text-right">24H</th>
              </tr>
            </thead>
            <tbody>
              <AssetTableRow iconColor="#627EEA" symbol="ETH" name="Ethereum" network="Ethereum Mainnet" wallet="Orivon Wallet 1" amount="3.4821 ETH" value="$11,203.42" change="+2.4%" />
              <AssetTableRow iconColor="#627EEA" symbol="ETH" name="Ethereum" network="Ethereum Mainnet" wallet="Trading Wallet" amount="1.2450 ETH" value="$4,002.18" change="+2.4%" />
              <AssetTableRow iconColor="#2775CA" symbol="USDC" name="USD Coin" network="Ethereum Mainnet" wallet="Orivon Wallet 1" amount="1,250 USDC" value="$1,250.00" change="+0.01%" />
              <AssetTableRow iconColor="#FF007A" symbol="UNI" name="Uniswap" network="Ethereum Mainnet" wallet="Orivon Wallet 1" amount="48.5 UNI" value="$394.21" change="-1.2%" isNegative />
              <AssetTableRow iconColor="#F7931A" symbol="WBTC" name="Wrapped Bitcoin" network="Ethereum Mainnet" wallet="Trading Wallet" amount="0.0412 WBTC" value="$889.02" change="+1.8%" />
            </tbody>
          </table>
          <div className="h-[52px] px-6 flex items-center justify-between bg-[#0d0e14]/30">
            <span className="text-[13px] text-[#94a3b8] font-medium">Total Portfolio</span>
            <span className="text-[14px] text-[#f8fafc] font-bold tabular-nums">$17,738.83</span>
          </div>
        </div>
      </div>

      <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] p-6 space-y-6">
        <h3 className="text-[14px] font-semibold text-[#f8fafc]">Security</h3>
        <div className="space-y-4">
          <SecurityRow name="Orivon Wallet 1" status="Backed Up" isSecure onAction={() => {}} />
          <SecurityRow name="Trading Wallet" status="Backup Recommended" type="Imported" onAction={onBackup} />
        </div>
      </div>
    </div>
  );
}

function AssetTableRow({ iconColor, symbol, name, network, wallet, amount, value, change, isNegative }: any) {
  return (
    <tr className="h-[52px] border-b border-[#1e2030] hover:bg-[#161720] transition-colors group">
      <td className="pl-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: iconColor }}>{symbol}</div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-[#f8fafc]">{name}</span>
            <span className="text-[11px] text-[#64748b] font-medium">{symbol} on {network}</span>
          </div>
        </div>
      </td>
      <td><span className="text-[12px] text-[#94a3b8] font-medium">{wallet}</span></td>
      <td><span className="text-[13px] text-[#f8fafc] font-medium tabular-nums">{amount}</span></td>
      <td><span className="text-[13px] text-[#f8fafc] font-bold tabular-nums">{value}</span></td>
      <td className="pr-6 text-right">
        <span className={`text-[12px] font-bold tabular-nums ${isNegative ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>{change}</span>
      </td>
    </tr>
  );
}

function SecurityRow({ name, status, isSecure, type, onAction }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSecure ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'}`}>
          <Key size={18} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#f8fafc]">{name}</span>
            {type && <Badge className="bg-[#6366f1]/10 text-[#6366f1] text-[10px] uppercase">Imported</Badge>}
          </div>
          <span className="text-[12px] text-[#64748b]">{isSecure ? 'Wallet seed phrase is securely backed up' : 'Backup your seed phrase to secure your funds'}</span>
        </div>
      </div>
      {isSecure ? (
        <Badge className="bg-[#22c55e]/10 text-[#22c55e] px-3 py-1 uppercase text-[10px]">Backed Up</Badge>
      ) : (
        <button 
          onClick={onAction}
          className="h-8 px-4 rounded-[6px] border border-[#f59e0b] text-[#f59e0b] text-[12px] font-bold hover:bg-[#f59e0b] hover:text-white transition-all cursor-pointer bg-transparent"
        >
          Backup Seed Phrase
        </button>
      )}
    </div>
  );
}

// --- Browse Web3 Page ---

function BrowseWeb3Page({ onOpen }: any) {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'DeFi', 'Social', 'Storage', 'Nodes', 'NFTs', 'Gaming', 'Tools'];

  const dapps = [
    { n: 'Uniswap', d: 'uniswap.eth', c: 'DeFi', i: '#ff007a', s: 97, desc: 'Decentralized exchange' },
    { n: 'Mastodon', d: 'mastodon.eth', c: 'Social', i: '#2b90d9', s: 94, desc: 'Decentralized social network' },
    { n: 'Aave', d: 'aave.eth', c: 'DeFi', i: '#2ebac6', s: 92, desc: 'Liquidity protocol' },
    { n: 'ENS', d: 'ens.eth', c: 'Tools', i: '#5298ff', s: 99, desc: 'Ethereum Name Service' },
    { n: 'OpenSea', d: 'opensea.eth', c: 'NFTs', i: '#2081e2', s: 85, desc: 'NFT marketplace' },
    { n: 'Gitcoin', d: 'gitcoin.eth', c: 'Tools', i: '#00cc85', s: 96, desc: 'Funding public goods' },
    { n: 'MakerDAO', d: 'makerdao.eth', c: 'DeFi', i: '#1aab9b', s: 98, desc: 'Stablecoin system' },
    { n: 'IPFS', d: 'ipfs.eth', c: 'Storage', i: '#06b6d4', s: 99, desc: 'Peer-to-peer file system' },
    { n: 'Compound', d: 'compound.eth', c: 'DeFi', i: '#00d395', s: 95, desc: 'Money markets' },
    { n: 'Arweave', d: 'arweave.eth', c: 'Storage', i: '#000000', s: 99, desc: 'Permanent data storage' },
    { n: 'Synthetix', d: 'synthetix.eth', c: 'DeFi', i: '#00d1ff', s: 91, desc: 'Derivatives liquidity' },
    { n: 'Lido', d: 'lido.eth', c: 'DeFi', i: '#00a3ff', s: 94, desc: 'Liquid staking' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[20px] font-semibold text-[#f8fafc]">Browse Web3</h2>
        <p className="text-[13px] text-[#64748b] mt-1">Discover the decentralized web</p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
        <input 
          placeholder="Search .eth domains, DApps, and Web3 sites"
          className="w-full h-11 bg-[#111218] border border-[#1e2030] rounded-[10px] pl-12 pr-4 text-[#f8fafc] font-medium outline-none focus:border-[#6366f1] transition-all placeholder:text-[#475569]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-[6px] text-[12px] font-semibold transition-all border cursor-pointer ${
              activeCategory === cat ? 'bg-[#6366f1] border-[#6366f1] text-white' : 'bg-[#111218] border-[#1e2030] text-[#64748b] hover:border-[#2d2e45] hover:text-[#94a3b8]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-[14px] font-semibold text-[#f8fafc]">Featured</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {dapps.slice(0, 3).map(app => (
            <div key={app.n} className="min-w-[280px] bg-[#111218] border border-[#1e2030] rounded-[12px] p-6 group cursor-pointer hover:border-[#6366f1] transition-all relative">
              <div className="w-12 h-12 rounded-[12px] flex items-center justify-center text-[20px] font-bold text-white mb-4" style={{ backgroundColor: app.i }}>{app.n.charAt(0)}</div>
              <h4 className="text-[16px] font-bold text-[#f8fafc]">{app.n}</h4>
              <p className="text-[13px] text-[#64748b] mt-1">{app.desc}</p>
              <div className="absolute bottom-6 right-6 flex items-center gap-1.5 bg-[#22c55e]/10 px-2 py-0.5 rounded-[6px]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span className="text-[10px] font-bold text-[#22c55e] uppercase">{app.s}</span>
              </div>
              <button 
                onClick={() => onOpen?.(app.d)}
                className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-[12px] transition-all"
              >
                <div className="bg-[#6366f1] text-white px-6 py-2 rounded-[8px] font-bold text-[13px]">Open</div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-[#f8fafc]">All Apps</h3>
          <span className="text-[12px] text-[#475569] font-bold bg-[#161720] px-2 py-0.5 rounded">24</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {dapps.map(app => (
            <div key={app.n} className="flex items-center gap-3 p-3 rounded-[10px] bg-[#111218] border border-[#1e2030] hover:bg-[#161720] hover:border-[#6366f1] transition-all group cursor-pointer">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[14px] font-bold text-white" style={{ backgroundColor: app.i }}>{app.n.charAt(0)}</div>
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-[#111218] bg-[#22c55e]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold text-[#f8fafc] truncate block">{app.n}</span>
                <span className="text-[11px] text-[#6366f1] font-medium truncate block">{app.d}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onOpen?.(app.d); }}
                className="opacity-0 group-hover:opacity-100 text-[12px] font-bold text-[#6366f1] bg-transparent border-none cursor-pointer"
              >
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-[14px] font-semibold text-[#f8fafc]">Recently Visited</h3>
        <div className="space-y-1">
          {dapps.slice(0, 5).map(app => (
             <div key={app.d} className="h-12 flex items-center justify-between px-3 rounded-[8px] hover:bg-[#161720] transition-all group">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                   <span className="text-[13px] font-medium text-[#f8fafc] font-mono">{app.d}</span>
                   <span className="text-[11px] text-[#475569] font-medium">Visited 2 hours ago</span>
                </div>
                <button 
                   onClick={() => onOpen?.(app.d)}
                   className="opacity-0 group-hover:opacity-100 h-7 px-4 rounded-[6px] border border-[#1e2030] text-[#64748b] text-[11px] font-bold uppercase tracking-wider hover:border-[#6366f1] hover:text-[#f8fafc] transition-all cursor-pointer bg-transparent"
                >
                   Visit Again
                </button>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- App Store Page ---

function NodeManagerPage({ onToast }: any) {
  const [nodes, setNodes] = useState<Record<string, 'Online' | 'Offline' | 'Starting'>>({
    ipfs: 'Online',
    bittorrent: 'Offline',
    bitcoin: 'Offline'
  });
  const [logs, setLogs] = useState([
    '[12:34:45] Reprovide sweep completed',
    '[12:34:31] Peer discovery: 3 new peers',
    '[12:34:25] Pinned block QmContent...',
    '[12:34:22] Connected to peer QmHash...',
    '[12:34:21] Swarm listening on /ip4/192.168.1.1/tcp/4001',
  ]);
  const [btcHeight, setBtcHeight] = useState(840847);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const logPool = [
      'Peer discovery: new peer QmZk...',
      'Block fetched: QmRa...',
      'Protocol sweep in progress...',
      'DHT re-routing successful',
      'BitSwap: received block QmXy...',
      'Network DHT height synchronized'
    ];
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
      const newLog = `[${time}] ${logPool[Math.floor(Math.random() * logPool.length)]}`;
      setLogs(prev => [newLog, ...prev.slice(0, 4)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBtcHeight(h => h + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (nodes.bitcoin === 'Starting') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
             clearInterval(interval);
             setNodes(prev => ({ ...prev, bitcoin: 'Online' }));
             onToast('Bitcoin Node synced', 'Ready to validate transactions');
             return 100;
          }
          return p + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [nodes.bitcoin]);

  const handleStart = (id: string) => {
    setNodes(prev => ({ ...prev, [id]: 'Starting' }));
    if (id !== 'bitcoin') {
      setTimeout(() => {
        setNodes(prev => ({ ...prev, [id]: 'Online' }));
        onToast(`${id.toUpperCase()} Node active`, 'Module running background process');
      }, 1500);
    } else {
      setProgress(0);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[20px] font-semibold text-[#f8fafc]">Node Manager</h2>
        <p className="text-[13px] text-[#64748b] mt-1">Run Web3 infrastructure directly in your browser</p>
      </div>

      <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] p-6 flex justify-between items-center">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[18px] font-bold text-[#f8fafc]">{Object.values(nodes).filter(v => v === 'Online').length} Running</span>
          <span className="text-[12px] text-[#64748b] mt-1">Nodes Active</span>
        </div>
        <div className="w-px h-10 bg-[#1e2030]" />
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[18px] font-bold text-[#f8fafc]">24</span>
          <span className="text-[12px] text-[#64748b] mt-1">IPFS Peers</span>
        </div>
        <div className="w-px h-10 bg-[#1e2030]" />
        <div className="flex-1 flex flex-col items-center">
          <motion.span 
             key={btcHeight}
             initial={{ scale: 1.1, color: '#f8fafc' }}
             animate={{ scale: 1, color: '#f8fafc' }}
             className="text-[18px] font-bold tabular-nums"
          >
            {btcHeight.toLocaleString()}
          </motion.span>
          <span className="text-[12px] text-[#64748b] mt-1">BTC Block Height</span>
        </div>
      </div>

      <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] p-6 flex justify-between items-center">
        <div className="flex-1 flex flex-col gap-2">
           <div className="flex justify-between items-center pr-8">
              <span className="text-[11px] text-[#64748b] font-bold uppercase tracking-widest">CPU</span>
              <span className="text-[12px] text-[#f8fafc] font-bold">12%</span>
           </div>
           <div className="w-[180px] h-1.5 bg-[#1e2030] rounded-full overflow-hidden">
              <div className="h-full bg-[#6366f1] w-[12%]" />
           </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
           <div className="flex justify-between items-center pr-8">
              <span className="text-[11px] text-[#64748b] font-bold uppercase tracking-widest">Memory</span>
              <span className="text-[12px] text-[#f8fafc] font-bold">847 MB / 16 GB</span>
           </div>
           <div className="w-[180px] h-1.5 bg-[#1e2030] rounded-full overflow-hidden">
              <div className="h-full bg-[#22c55e] w-[5%]" />
           </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
           <div className="flex justify-between items-center pr-8">
              <span className="text-[11px] text-[#64748b] font-bold uppercase tracking-widest">Network</span>
              <div className="flex items-center gap-1.5 text-[12px] text-[#f8fafc] font-bold">
                 <ArrowUpDown size={12} /> 2.4 MB/s
              </div>
           </div>
           <div className="h-1.5" />
        </div>
      </div>

      <div className="space-y-4">
        <NodeManagerCard 
          id="ipfs" n="IPFS Node" v="v0.27.0" status={nodes.ipfs} icon={Database} c="#06b6d4" 
          onStart={() => handleStart('ipfs')} 
          onStop={() => setNodes(p => ({...p, ipfs: 'Offline'}))}
          body={nodes.ipfs === 'Online' ? (
             <div className="space-y-6">
                <div className="grid grid-cols-4 gap-8">
                   <div className="flex flex-col">
                      <span className="text-[11px] text-[#64748b] font-bold uppercase">Connected Peers</span>
                      <span className="text-[18px] font-bold text-[#f8fafc]">24</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[11px] text-[#64748b] font-bold uppercase">Repo Size</span>
                      <span className="text-[18px] font-bold text-[#f8fafc]">1.2 GB</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[11px] text-[#64748b] font-bold uppercase">Bandwidth In</span>
                      <span className="text-[18px] font-bold text-[#f8fafc]">847 KB/s</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[11px] text-[#64748b] font-bold uppercase">Bandwidth Out</span>
                      <span className="text-[18px] font-bold text-[#f8fafc]">124 KB/s</span>
                   </div>
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-4">
                      <span className="text-[13px] font-bold text-[#f8fafc]">Connected Peers</span>
                      <Badge className="bg-[#161720] text-[#64748b]">24</Badge>
                   </div>
                   <div className="space-y-1">
                      {[
                        { id: 'QmZk...', loc: '🇺🇸 USA', lat: '24ms', v: '1.8.0' },
                        { id: 'QmRa...', loc: '🇩🇪 Germany', lat: '48ms', v: '1.7.2' },
                        { id: 'QmXy...', loc: '🇯🇵 Japan', lat: '152ms', v: '1.8.0' },
                        { id: 'QmBa...', loc: '🇬🇧 UK', lat: '32ms', v: '1.8.1' },
                        { id: 'Qm9z...', loc: '🇨🇦 Canada', lat: '12ms', v: '1.8.0' }
                      ].map((peer, i) => (
                        <PeerRow key={peer.id} {...peer} index={i} />
                      ))}
                   </div>
                </div>
                <div className="bg-[#0a0b11] rounded-[8px] p-4 font-mono text-[12px] text-[#22c55e] space-y-1 min-h-[140px]">
                   <div className="flex items-center gap-2 text-[#64748b] mb-2">
                      <Terminal size={12} />
                      <span className="font-bold uppercase text-[10px]">Node Logs</span>
                   </div>
                   <AnimatePresence initial={false}>
                      {logs.map(log => (
                        <motion.div key={log} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="truncate">{log}</motion.div>
                      ))}
                   </AnimatePresence>
                </div>
             </div>
          ) : null}
        />

        <NodeManagerCard 
          id="bittorrent" n="BitTorrent Node" v="v1.2.4" status={nodes.bittorrent} icon={Share2} c="#f59e0b"
          onStart={() => handleStart('bittorrent')} 
          onStop={() => setNodes(p => ({...p, bittorrent: 'Offline'}))}
          body={nodes.bittorrent === 'Offline' ? (
             <div className="space-y-6">
                <p className="text-[13px] text-[#94a3b8]">Peer-to-peer file sharing network. Download and seed torrents directly in your browser without any external application.</p>
                <div className="grid grid-cols-2 gap-y-3">
                   <FeatureRow iconColor="text-[#6366f1]" label="Magnet link support" />
                   <FeatureRow iconColor="text-[#6366f1]" label="Streaming playback" />
                   <FeatureRow iconColor="text-[#6366f1]" label="DHT and PEX enabled" />
                   <FeatureRow iconColor="text-[#6366f1]" label="No port forwarding required" />
                </div>
                <button onClick={() => handleStart('bittorrent')} className="h-10 px-8 rounded-[8px] bg-[#6366f1] text-white font-bold text-[13px] hover:bg-[#4f46e5] transition-all border-none cursor-pointer">Start Node</button>
             </div>
          ) : null}
        />

        <NodeManagerCard 
          id="bitcoin" n="Bitcoin Node" v="v27.0.0" status={nodes.bitcoin} icon={CircleDot} c="#f97316"
          onStart={() => handleStart('bitcoin')} 
          onStop={() => setNodes(p => ({...p, bitcoin: 'Offline'}))}
          body={nodes.bitcoin === 'Offline' ? (
             <div className="space-y-6">
                <p className="text-[13px] text-[#94a3b8]">Full validation node using quick sync technology. Run your own sovereign infrastructure and validate your own transactions.</p>
                <div className="grid grid-cols-2 gap-y-3">
                   <FeatureRow iconColor="text-[#f97316]" label="Validates all transactions" />
                   <FeatureRow iconColor="text-[#f97316]" label="No trust required" />
                   <FeatureRow iconColor="text-[#f97316]" label="Pruned: saves disk space" />
                   <FeatureRow iconColor="text-[#f97316]" label="Quick sync from snapshot" />
                </div>
                <div className="flex items-center gap-4">
                   <Badge className="bg-[#161720] text-[#64748b] border border-[#1e2030] uppercase">Pruned Node</Badge>
                   <span className="text-[12px] text-[#64748b]">550 MB storage used</span>
                   <span className="text-[12px] text-[#64748b]">Pre-synced to block 840,000</span>
                </div>
                <button onClick={() => handleStart('bitcoin')} className="h-10 px-8 rounded-[8px] bg-[#f97316] text-white font-bold text-[13px] hover:bg-[#ea580c] transition-all border-none cursor-pointer">Start Bitcoin Node</button>
             </div>
          ) : nodes.bitcoin === 'Starting' ? (
             <div className="space-y-4">
                <div className="flex justify-between items-center text-[13px] text-[#94a3b8]">
                   <span>Syncing from snapshot...</span>
                   <span className="tabular-nums font-bold">{progress}%</span>
                </div>
                <div className="h-2 bg-[#1e2030] rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-[#f97316]" />
                </div>
                <p className="text-[12px] text-[#64748b]">This will take approximately 4-8 minutes</p>
             </div>
          ) : null}
        />
      </div>
    </div>
  );
}

function NodeManagerCard({ id, n, v, status, icon: Icon, c, body, onStart, onStop }: any) {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] p-6 transition-all">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${c}15`, color: c }}>
            <Icon size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-bold text-[#f8fafc]">{n}</span>
            <span className="text-[12px] text-[#475569]">{v}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-[6px] flex items-center gap-2 border ${status === 'Online' ? 'bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]' : 'bg-[#1e2030] border-[#2d2e45] text-[#64748b]'}`}>
            <StatusDot color={status === 'Online' ? 'bg-[#22c55e]' : status === 'Starting' ? 'bg-[#f59e0b]' : 'bg-[#475569]'} pulse={status === 'Starting'} />
            <span className="text-[11px] font-bold uppercase tracking-wider">{status}</span>
          </div>
          {status === 'Online' && (
            <button onClick={onStop} className="h-8 px-4 rounded-[6px] border border-[#ef4444]/50 text-[#ef4444] text-[12px] font-bold hover:bg-[#ef4444] hover:text-white transition-all cursor-pointer bg-transparent">Stop</button>
          )}
        </div>
      </div>
      {body && <div className="border-t border-[#1e2030] pt-6">{body}</div>}
    </div>
  );
}

function PeerRow({ id, loc, lat, v, index }: any) {
  return (
    <motion.div 
       initial={{ opacity: 0, x: -10 }}
       animate={{ opacity: 1, x: 0 }}
       transition={{ delay: index * 0.03 }}
       className="h-8 flex items-center justify-between text-[12px] font-mono text-[#64748b] hover:text-[#f8fafc] transition-colors"
    >
       <span className="w-24 shrink-0">{id}</span>
       <span className="flex-1 text-center">{loc}</span>
       <span className="w-16 text-right">{lat}</span>
       <span className="w-16 text-right">v{v}</span>
    </motion.div>
  );
}

function FeatureRow({ iconColor, label }: any) {
  return (
    <div className="flex items-center gap-3 text-[13px] text-[#94a3b8]">
       <Check size={14} className={iconColor} strokeWidth={3} /> {label}
    </div>
  );
}

// --- History Page ---

function HistoryPage({ onOpen }: any) {
  const [activeTab, setActiveTab] = useState<'Browsing' | 'Transactions'>('Browsing');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[20px] font-semibold text-[#f8fafc]">History</h2>
      </div>

      <div className="flex gap-8 border-b border-[#1e2030]">
        {['Browsing', 'Transactions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 text-[14px] font-bold transition-all bg-transparent border-none cursor-pointer relative ${
              activeTab === tab ? 'text-[#f8fafc]' : 'text-[#64748b] hover:text-[#94a3b8]'
            }`}
          >
            {tab} History
            {activeTab === tab && <motion.div layoutId="histTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1]" />}
          </button>
        ))}
      </div>

      {activeTab === 'Browsing' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
             <div className="relative w-96">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input placeholder="Search history..." className="w-full h-9 bg-[#111218] border border-[#1e2030] rounded-[8px] pl-10 pr-4 text-[13px] outline-none focus:border-[#6366f1]" />
             </div>
             <button className="text-[13px] font-bold text-[#ef4444] hover:text-[#f87171] transition-colors bg-transparent border-none cursor-pointer flex items-center gap-2">
                <Trash2 size={16} /> Clear History
             </button>
          </div>

          <HistorySection title="Today" items={[
            { d: 'uniswap.eth', t: 'Uniswap - Swap Tokens', time: '2 min ago', s: '🟢' },
            { d: 'mastodon.eth', t: 'Mastodon - Home Feed', time: '1 hr ago', s: '🟢' },
            { d: 'opensea.eth', t: 'OpenSea - NFT Marketplace', time: '2 hrs ago', s: '🟡' },
            { d: 'btcnode.eth', t: 'Bitcoin Node Dashboard', time: '3 hrs ago', s: '🟢' },
            { d: 'apps.orivon.eth', t: 'Orivon App Store', time: '4 hrs ago', s: '🟢' },
            { d: 'google.com', t: 'Google Search', time: '5 hrs ago', s: '🔴' },
            { d: 'gitcoin.eth', t: 'Gitcoin - Public Goods', time: '6 hrs ago', s: '🟢' },
          ]} onOpen={onOpen} />

          <HistorySection title="Yesterday" items={[
            { d: 'uniswap.eth', t: 'Uniswap - Pool Positions', time: '1 day ago', s: '🟢' },
            { d: 'mastodon.eth', t: 'Mastodon - Explore', time: '1 day ago', s: '🟢' },
            { d: 'twitter.com', t: 'Twitter / X', time: '1 day ago', s: '🔴' },
          ]} onOpen={onOpen} />
        </div>
      ) : (
        <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e2030] h-10">
                   <th className="pl-6 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Type</th>
                   <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Description</th>
                   <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Amount</th>
                   <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Status</th>
                   <th className="pr-6 text-[11px] font-bold text-[#475569] uppercase tracking-wider text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Sent', desc: 'to 0x742d...', amt: '-$1,609.20', cur: '0.5 ETH', status: 'Confirmed', time: '2 hrs ago' },
                  { type: 'Received', desc: 'from 0x1234...', amt: '+$3,218.40', cur: '1.0 ETH', status: 'Confirmed', time: '1 day ago', isPositive: true },
                  { type: 'Swapped', desc: '1 ETH → 3,201 USDC', amt: '$3,201.00', status: 'Confirmed', time: '2 days ago' },
                  { type: 'Sent', desc: 'to 0x9876...', amt: '-$100.00', cur: '100 USDC', status: 'Confirmed', time: '3 days ago' }
                ].map((tx, i) => (
                  <TxRow key={i} {...tx} index={i} />
                ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
}

function HistorySection({ title, items, onOpen }: any) {
  return (
    <div className="space-y-4">
       <div className="text-[11px] font-bold text-[#475569] uppercase tracking-[0.06em]">{title}</div>
       <div className="space-y-1">
          {items.map((item: any, i: number) => (
             <motion.div 
                key={item.d + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="h-12 flex items-center justify-between px-3 rounded-[8px] hover:bg-[#111218] group cursor-pointer"
             >
                <div className="flex items-center gap-4">
                   <span className="text-[10px] shrink-0">{item.s}</span>
                   <div className="w-5 h-5 rounded-md bg-[#161720] flex items-center justify-center font-bold text-[10px] text-[#64748b]">{item.d.charAt(0).toUpperCase()}</div>
                   <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-[#f8fafc]">{item.d}</span>
                      <span className="text-[12px] text-[#64748b]">{item.t}</span>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-[11px] text-[#475569] font-medium">{item.time}</span>
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); onOpen?.(item.d); }} className="p-1.5 rounded-md hover:bg-[#1e2030] text-[#64748b] hover:text-[#f8fafc] bg-transparent border-none cursor-pointer"><ExternalLink size={14} /></button>
                      <button className="p-1.5 rounded-md hover:bg-[#1e2030] text-[#64748b] hover:text-[#ef4444] bg-transparent border-none cursor-pointer"><X size={14} /></button>
                   </div>
                </div>
             </motion.div>
          ))}
       </div>
    </div>
  );
}

function TxRow({ type, desc, amt, cur, status, time, isPositive, index }: any) {
  return (
    <motion.tr 
       initial={{ opacity: 0, x: -10 }}
       animate={{ opacity: 1, x: 0 }}
       transition={{ delay: index * 0.05 }}
       className="h-14 border-b border-[#1e2030] hover:bg-[#161720] transition-colors cursor-pointer group"
    >
       <td className="pl-6">
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type === 'Sent' ? 'bg-[#ef4444]/10 text-[#ef4444]' : type === 'Received' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#6366f1]/10 text-[#6366f1]'}`}>
                {type === 'Sent' ? <ArrowUpRight size={16} /> : type === 'Received' ? <ArrowDownLeft size={16} /> : <ArrowLeftRight size={16} />}
             </div>
             <span className="text-[13px] font-bold text-[#f8fafc]">{type}</span>
          </div>
       </td>
       <td><span className="text-[12px] text-[#94a3b8] font-medium">{desc}</span></td>
       <td>
          <div className="flex flex-col">
             <span className={`text-[13px] font-bold tabular-nums ${isPositive ? 'text-[#22c55e]' : type === 'Sent' ? 'text-[#ef4444]' : 'text-[#f8fafc]'}`}>{amt}</span>
             {cur && <span className="text-[11px] text-[#64748b] tabular-nums">{cur}</span>}
          </div>
       </td>
       <td>
          <div className="flex items-center gap-2 bg-[#22c55e]/10 px-2 py-0.5 rounded-[6px] w-fit">
             <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
             <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-wider">{status}</span>
          </div>
       </td>
       <td className="pr-6 text-right"><span className="text-[11px] text-[#475569] font-medium">{time}</span></td>
    </motion.tr>
  );
}

// --- Settings Page ---

function SettingsPage() {
  const [activeCat, setActiveCat] = useState('General');
  const cats = ['General', 'Privacy', 'Web3', 'Nodes', 'Wallet', 'Search', 'About'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[20px] font-semibold text-[#f8fafc]">Settings</h2>
      </div>

      <div className="flex gap-10 items-start">
         <div className="w-48 flex flex-col gap-1 shrink-0">
            {cats.map(cat => (
               <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`h-9 px-4 rounded-[8px] text-left text-[13px] font-bold transition-all border-none bg-transparent cursor-pointer ${
                    activeCat === cat ? 'bg-[#111218] text-[#f8fafc]' : 'text-[#64748b] hover:text-[#94a3b8]'
                  }`}
               >
                  {cat}
               </button>
            ))}
         </div>

         <div className="flex-1 max-w-[600px] space-y-8">
            {activeCat === 'General' && (
               <div className="space-y-6">
                  <SettingsSection title="Preferences">
                     <SettingsRow label="Language" control={<select className="bg-[#111218] border border-[#1e2030] text-[#f8fafc] rounded-[6px] h-8 px-2 text-[12px] outline-none"><option>English (US)</option></select>} />
                     <SettingsRow label="Startup Behavior" control={<select className="bg-[#111218] border border-[#1e2030] text-[#f8fafc] rounded-[6px] h-8 px-2 text-[12px] outline-none"><option>Open Dashboard</option><option>Continue where I left off</option></select>} />
                     <SettingsRow label="Theme" control={<div className="flex items-center gap-4"><Toggle active /><span className="text-[12px] text-[#475569] font-bold uppercase italic">Light coming soon</span></div>} />
                  </SettingsSection>
               </div>
            )}
            {activeCat === 'Privacy' && (
               <div className="space-y-6">
                  <SettingsSection title="Protection">
                     <SettingsRow label="Tracker Blocking" sub="48,291,047 trackers blocked to date" control={<Toggle active />} />
                     <SettingsRow label="Fingerprint Protection" control={<Toggle active />} />
                     <SettingsRow label="Clear Browsing Data" control={<button className="h-8 px-4 rounded-[6px] border border-[#ef4444] text-[#ef4444] text-[11px] font-bold uppercase hover:bg-[#ef4444] hover:text-white transition-all bg-transparent cursor-pointer">Clear Now</button>} />
                  </SettingsSection>
               </div>
            )}
            {activeCat === 'About' && (
               <div className="space-y-6">
                  <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] p-8 flex flex-col items-center text-center">
                     <div className="text-[15px] text-white font-bold tracking-[0.1em] mb-1">ORIVON</div>
                     <div className="text-[11px] text-[#6366f1] font-bold tracking-[0.06em] uppercase mb-6">v0.1.0 MVP</div>
                     <p className="text-[13px] text-[#64748b] max-w-[320px] mb-8">A native Web3 desktop browser built for privacy, decentralization, and the future of the internet.</p>
                     <div className="flex gap-4">
                        <button className="h-8 px-4 rounded-[6px] bg-[#161720] border border-[#1e2030] text-[#94a3b8] text-[11px] font-bold uppercase tracking-widest hover:text-[#f8fafc] transition-all cursor-pointer">GitHub</button>
                        <button className="h-8 px-4 rounded-[6px] bg-[#161720] border border-[#1e2030] text-[#94a3b8] text-[11px] font-bold uppercase tracking-widest hover:text-[#f8fafc] transition-all cursor-pointer">Discord</button>
                     </div>
                     <div className="mt-12 text-[11px] text-[#475569] font-bold italic">Built with love for the decentralized web.</div>
                  </div>
               </div>
            )}
            {(!['General', 'Privacy', 'About'].includes(activeCat)) && (
               <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Settings size={40} className="text-[#2d2e45] mb-4" />
                  <span className="text-[14px] text-[#64748b] font-medium">{activeCat} settings coming soon</span>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: any) {
  return (
    <div className="space-y-4">
       <div className="text-[13px] font-bold text-[#f8fafc] pb-2 border-b border-[#1e2030]">{title}</div>
       <div className="space-y-1">{children}</div>
    </div>
  );
}

function SettingsRow({ label, sub, control }: any) {
  return (
    <div className="h-[52px] flex items-center justify-between">
       <div className="flex flex-col">
          <span className="text-[13px] font-medium text-[#94a3b8]">{label}</span>
          {sub && <span className="text-[11px] text-[#64748b]">{sub}</span>}
       </div>
       {control}
    </div>
  );
}

function Toggle({ active }: { active?: boolean }) {
  return (
    <div className={`w-8 h-4 rounded-full relative transition-all duration-200 cursor-pointer ${active ? 'bg-[#6366f1]' : 'bg-[#1e2030]'}`}>
       <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all duration-200 ${active ? 'left-[18px]' : 'left-0.5'}`} />
    </div>
  );
}

// --- Helper UI Components (Reused) ---

function NodesCard({ onToast }: { onToast: (t: string, s: string) => void }) {
  const [nodes, setNodes] = useState<Record<string, 'Online' | 'Offline' | 'Starting'>>({
    ipfs: 'Online', bittorrent: 'Offline', bitcoin: 'Offline'
  });

  const handleStart = (id: string) => {
    setNodes(prev => ({ ...prev, [id]: 'Starting' }));
    setTimeout(() => {
      setNodes(prev => ({ ...prev, [id]: 'Online' }));
      onToast(id === 'ipfs' ? 'IPFS Node started' : 'Node active', 'Module running background process');
    }, 2500);
  };

  const activeCount = Object.values(nodes).filter(s => s === 'Online').length;

  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[14px] font-bold text-[#f8fafc]">Web3 Nodes</h2>
        <Badge className="bg-[#22c55e]/10 text-[#22c55e]">{activeCount} Active</Badge>
      </div>
      <div className="space-y-0 divide-y divide-[#1e2030]">
        <NodeRow id="ipfs" name="IPFS Node" sub="Distributed file system" status={nodes.ipfs} icon={Database} iconColor="text-[#06b6d4]" iconBg="bg-[#06b6d4]/15" onStart={() => handleStart('ipfs')} onStop={() => setNodes(p=>({...p,ipfs:'Offline'}))} />
        <NodeRow id="bittorrent" name="BitTorrent" sub="P2P file sharing" status={nodes.bittorrent} icon={Share2} iconColor="text-[#f59e0b]" iconBg="bg-[#f59e0b]/15" onStart={() => handleStart('bittorrent')} onStop={() => setNodes(p=>({...p,bittorrent:'Offline'}))} />
      </div>
    </div>
  );
}

function NodeRow({ id, name, sub, status, icon: Icon, iconColor, iconBg, onStart, onStop }: any) {
  return (
    <div className="h-16 flex items-center justify-between first:pb-4 last:pt-4">
      <div className="flex items-center gap-4">
        <div className={`w-9 h-9 ${iconBg} rounded-[8px] flex items-center justify-center ${iconColor}`}><Icon size={16} /></div>
        <div className="flex flex-col"><span className="text-[13px] font-semibold text-[#f8fafc]">{name}</span><span className="text-[12px] text-[#64748b] font-medium">{sub}</span></div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2"><StatusDot color={status === 'Online' ? 'bg-[#22c55e]' : status === 'Starting' ? 'bg-[#f59e0b]' : 'bg-[#475569]'} pulse={status === 'Starting'} /><span className="text-[12px] text-[#64748b] font-medium">{status}</span></div>
        <button onClick={status === 'Online' ? onStop : onStart} disabled={status === 'Starting'} className={`h-8 px-3 rounded-[6px] border text-[12px] font-semibold transition-all cursor-pointer bg-transparent ${status === 'Online' ? 'border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444] hover:text-white' : 'border-[#6366f1] text-[#818cf8] hover:bg-[#6366f1] hover:text-white'}`}>
           {status === 'Starting' ? <Loader2 size={12} className="animate-spin" /> : status === 'Online' ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
}

function AssetRow({ symbol, name, amount, val, change, color }: any) {
  const isPositive = change.startsWith('+');
  return (
    <div className="h-11 flex items-center gap-3 px-2 rounded-[8px] hover:bg-[#161720] transition-colors group cursor-default">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ backgroundColor: color }}>{symbol}</div>
      <div className="flex-1 flex flex-col min-w-0"><span className="text-[13px] font-semibold text-[#f8fafc]">{name}</span><span className="text-[12px] text-[#64748b] font-medium tabular-nums">{amount} {symbol}</span></div>
      <div className="text-right"><div className="text-[13px] font-semibold text-[#f8fafc] tabular-nums">{val}</div><div className={`text-[11px] font-medium tabular-nums ${isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{change}</div></div>
    </div>
  );
}

function FeaturedAppsCard({ onOpen }: { onOpen?: (u: string) => void }) {
  const apps = [{ n: 'Uniswap', d: 'uniswap.eth', c: '#7c3aed', s: 'green' }, { n: 'Mastodon', d: 'mastodon.eth', c: '#2563eb', s: 'green' }, { n: 'Bitcoin', d: 'btcnode.eth', c: '#d97706', s: 'green' }, { n: 'App Store', d: 'apps.orivon.eth', c: '#6366f1', s: 'green' }, { n: 'OpenSea', d: 'opensea.eth', c: '#0891b2', s: 'amber' }, { n: 'Gitcoin', d: 'gitcoin.eth', c: '#059669', s: 'green' }];
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] p-6">
      <div className="flex justify-between items-center mb-6"><h2 className="text-[14px] font-bold text-[#f8fafc]">Explore Web3</h2><button className="text-[12px] text-[#6366f1] font-semibold hover:text-[#818cf8] transition-colors bg-transparent border-none cursor-pointer">Browse All</button></div>
      <div className="grid grid-cols-2 gap-2">
        {apps.map(app => (
          <button key={app.n} onClick={() => onOpen?.(app.d)} className="flex items-center gap-3 p-3 rounded-[10px] bg-transparent border-none text-left cursor-pointer transition-all duration-150 hover:bg-[#161720] hover:-translate-y-0.5 hover:shadow-lg group">
            <div className="relative shrink-0"><div className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[14px] font-bold text-white" style={{ backgroundColor: app.c }}>{app.n.charAt(0)}</div><div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#111218] ${app.s === 'green' ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'}`} /></div>
            <div className="flex-1 min-w-0"><span className="text-[13px] font-semibold text-[#f8fafc] truncate block">{app.n}</span><span className="text-[11px] text-[#6366f1] font-medium truncate block">{app.d}</span></div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Web3ActivityFeed() {
  const [items, setItems] = useState([{ c: 'bg-[#22c55e]', d: 'uniswap.eth', a: 'Resolved via ENS + IPFS', t: 'just now', id: 1 }, { c: 'bg-[#22c55e]', d: 'mastodon.eth', a: 'Loaded trustlessly', t: '2m ago', id: 2 }, { c: 'bg-[#f59e0b]', d: 'opensea.eth', a: 'Partial trustless detected', t: '5m ago', id: 3 }, { c: 'bg-[#ef4444]', d: 'google.com', a: 'Centralized connection', t: '8m ago', id: 4 }, { c: 'bg-[#22c55e]', d: 'btcnode.eth', a: 'Node synced 99.94%', t: '12m ago', id: 5 }, { c: 'bg-[#22c55e]', d: 'gitcoin.eth', a: 'Loaded trustlessly', t: '18m ago', id: 6 }]);
  const pool = [{ c: 'bg-[#22c55e]', d: 'aave.eth', a: 'Direct IPFS resolve', t: 'just now' }, { c: 'bg-[#22c55e]', d: 'ens.eth', a: 'Smart contract verified', t: 'just now' }, { c: 'bg-[#ef4444]', d: 'facebook.com', a: 'Centralized hop detected', t: 'just now' }];
  useEffect(() => { const interval = setInterval(() => { const newItem = { ...pool[Math.floor(Math.random() * pool.length)], id: Date.now() }; setItems(prev => [newItem, ...prev.slice(0, 5)]); }, 8000); return () => clearInterval(interval); }, []);
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] p-6 h-[320px] flex flex-col">
      <div className="flex justify-between items-center mb-6"><h2 className="text-[14px] font-bold text-[#f8fafc]">Web3 Activity</h2><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" /><span className="text-[11px] font-bold text-[#22c55e] uppercase tracking-wider">Live</span></div></div>
      <div className="flex-1 space-y-4 overflow-hidden relative"><AnimatePresence initial={false}>{items.map((item) => ( <motion.div key={item.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="flex items-center gap-3"><div className={`w-1.5 h-1.5 rounded-full ${item.c} shrink-0`} /><span className="text-[13px] text-[#f8fafc] font-mono truncate w-24 shrink-0">{item.d}</span><span className="text-[12px] text-[#64748b] truncate flex-1">{item.a}</span><span className="text-[11px] text-[#475569] font-medium shrink-0">{item.t}</span></motion.div> ))}</AnimatePresence></div>
    </div>
  );
}

function NetworkStatusDetailsCard() {
  const rows = [{ i: Globe, n: 'ENS Resolver', s: 'Active' }, { i: Database, n: 'IPFS Gateway', s: 'Active' }, { i: Search, n: 'Web3 Compass', s: 'Connected' }, { i: Activity, n: 'Bitcoin Network', s: 'Reachable' }, { i: Shield, n: 'Web3 Score', s: 'Operational' }];
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] p-6">
      <div className="flex justify-between items-center mb-6"><h2 className="text-[14px] font-bold text-[#f8fafc]">Network</h2><span className="text-[11px] font-bold text-[#22c55e] uppercase tracking-wider">All Systems Operational</span></div>
      <div className="space-y-1">{rows.map(row => ( <div key={row.n} className="h-10 flex items-center justify-between px-2 rounded-[6px] hover:bg-[#161720] group cursor-default"><div className="flex items-center gap-3"><row.i size={14} className="text-[#64748b] group-hover:text-[#94a3b8]" /><span className="text-[13px] font-medium text-[#f8fafc]">{row.n}</span></div><div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /><span className="text-[11px] font-bold text-[#22c55e] uppercase tracking-wider">{row.s}</span></div></div> ))}</div>
    </div>
  );
}

function MarketingCard() {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-[12px] p-[28px_32px] flex items-center justify-between">
      <div className="w-[55%] space-y-4"><div className="text-[10px] text-[#6366f1] font-bold tracking-[0.08em] uppercase">The Web3 Browser</div><h2 className="text-[22px] font-bold text-[#f8fafc] tracking-[-0.02em]">Built for the internet that's coming.</h2><p className="text-[14px] text-[#94a3b8] leading-[1.6] max-w-[480px]">Orivon is the first browser where Web3 is native, not bolted on. No extensions, no setup, no compromises. Just the web as it was meant to be.</p><div className="space-y-2 pt-2">{['Open any .eth domain natively', 'Run Bitcoin and IPFS nodes in one click', 'Know exactly how trustless every site is'].map(f => ( <div key={f} className="flex items-center gap-3 text-[13px] text-[#94a3b8] font-medium"><Check size={14} className="text-[#6366f1]" strokeWidth={3} /> {f}</div> ))}</div></div>
      <div className="w-[45%] flex flex-col gap-6 text-right"><StatItem val="2B" label="People coming to Web3" /><StatItem val="1 Browser" label="Built for all of them" /><StatItem val="0" label="Compromises on decentralization" /></div>
    </div>
  );
}

function StatItem({ val, label }: { val: string; label: string }) {
  return (
    <div className="flex flex-col"><span className="text-[32px] font-bold text-[#f8fafc] tracking-[-0.03em] leading-none">{val}</span><span className="text-[12px] text-[#94a3b8] font-semibold mt-1.5">{label}</span><span className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider mt-0.5">Built for all of them</span></div>
  );
}

// --- Modals (Seed Phrase, Import Wallet, etc.) ---

function SeedPhraseModal({ onClose }: { onClose: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const words = DEMO_WALLET.mnemonic.split(' ');
  const handleCopy = () => { navigator.clipboard.writeText(DEMO_WALLET.mnemonic); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[8px] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ duration: 0.15 }} className="bg-[#111218] border border-[#1e2030] rounded-[16px] p-8 max-w-[520px] w-full relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-[#64748b] hover:text-[#f8fafc] transition-colors bg-transparent border-none cursor-pointer"><X size={20} /></button>
        <h2 className="text-[18px] font-bold text-[#f8fafc] mb-6">Wallet Backup</h2>
        <div className="bg-[#ef4444]/5 border-l-3 border-[#ef4444] p-4 rounded-r-[6px] mb-8"><p className="text-[13px] text-[#ef4444] font-medium m-0 leading-relaxed">Never share your seed phrase. Anyone who has it controls your wallet.</p></div>
        <div className="relative mb-8">
          <div className="grid grid-cols-3 gap-3">{words.map((word, i) => ( <div key={i} className="bg-[#161720] border border-[#1e2030] rounded-[8px] p-[10px_14px] flex flex-col items-center justify-center"><span className="text-[10px] text-[#475569] font-bold uppercase self-start leading-none mb-1.5">{i + 1}</span><span className="text-[15px] font-bold text-[#f8fafc] font-mono tracking-tight">{word}</span></div> ))}</div>
          {!revealed && ( <div className="absolute inset-0 bg-[#0d0e14]/60 backdrop-blur-[10px] rounded-[8px] flex items-center justify-center z-10"><button onClick={() => setRevealed(true)} className="h-10 w-40 rounded-[8px] border border-[#6366f1] bg-transparent text-[#818cf8] font-bold text-[13px] hover:bg-[#6366f1] hover:text-white transition-all cursor-pointer">Reveal Seed Phrase</button></div> )}
        </div>
        <div className="flex gap-3"><button onClick={handleCopy} className="flex-1 h-11 rounded-[8px] border border-[#1e2030] bg-transparent text-[#64748b] font-bold text-[13px] flex items-center justify-center gap-2 hover:border-[#6366f1] hover:text-[#f8fafc] transition-all cursor-pointer">{copied ? <Check size={16} className="text-[#22c55e]" /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy All'}</button><button onClick={onClose} className="flex-1 h-11 rounded-[8px] bg-[#6366f1] text-white font-bold text-[13px] hover:bg-[#4f46e5] transition-all border-none cursor-pointer">I have saved it</button></div>
      </motion.div>
    </motion.div>
  );
}

function ImportWalletModal({ onClose, onImport }: { onClose: () => void; onImport: (words: string) => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const demoWords = ['venture', 'capital', 'market', 'chain', 'block', 'token', 'wallet', 'defi', 'node', 'crypto', 'zero', 'proof'];
  const handleImport = async () => { setLoading(true); await onImport(demoWords.join(' ')); setTimeout(() => { setLoading(false); setSuccess(true); setTimeout(onClose, 1000); }, 1500); };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[8px] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ duration: 0.15 }} className="bg-[#111218] border border-[#1e2030] rounded-[16px] p-8 max-w-[520px] w-full relative">
        {!success ? ( <> <button onClick={onClose} className="absolute top-6 right-6 text-[#64748b] hover:text-[#f8fafc] transition-colors bg-transparent border-none cursor-pointer"><X size={20} /></button> <h2 className="text-[18px] font-bold text-[#f8fafc] mb-1">Import Wallet</h2> <p className="text-[13px] text-[#64748b] font-medium mb-8">Enter your 12 word seed phrase below.</p> <div className="text-[12px] text-[#475569] italic mb-4 px-1">Demo seed phrase pre-filled. Click Import to continue.</div> <div className="grid grid-cols-3 gap-3 mb-8">{demoWords.map((word, i) => ( <div key={i} className="relative"><span className="absolute top-2 left-2.5 text-[9px] font-bold text-[#475569] mono tabular uppercase">{i + 1}</span><div className="w-full h-10 rounded-[8px] bg-[#161720] border border-[#1e2030] flex items-center px-3 pt-1 text-[#f8fafc] font-bold text-[13px] font-mono">{word}</div></div> ))}</div> <button onClick={handleImport} disabled={loading} className="w-full h-11 rounded-[10px] bg-[#6366f1] text-white font-bold text-[14px] hover:bg-[#4f46e5] transition-all border-none cursor-pointer flex items-center justify-center gap-3 disabled:bg-[#1e2030] disabled:text-[#475569]">{loading ? <Loader2 size={18} className="animate-spin" /> : null} {loading ? 'Importing...' : 'Verify and Import'}</button> </> ) : ( <div className="flex flex-col items-center justify-center py-12 text-center"><div className="w-12 h-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center mb-6"><Check size={24} className="text-[#22c55e]" /></div><h3 className="text-[18px] font-bold text-[#f8fafc] mb-1">Wallet Imported</h3><p className="text-[14px] text-[#64748b] font-medium">Your Trading Wallet is now active.</p></div> )}
      </motion.div>
    </motion.div>
  );
}

function WalletSwitcherDropdown({ accounts, activeId, onSwitch, onImport, onClose }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 4 }} transition={{ duration: 0.12 }} className="absolute bottom-full left-0 right-0 mb-2 bg-[#111218] border border-[#1e2030] rounded-[10px] p-2 shadow-2xl z-[60] min-w-[260px]">
      <div className="space-y-1">{accounts.map((acc: any) => ( <button key={acc.id} onClick={() => onSwitch(acc.id)} className="w-full h-12 px-3 flex items-center gap-3 rounded-[8px] hover:bg-[#161720] transition-all border-none bg-transparent cursor-pointer text-left group"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0 ${acc.id === 'wallet-demo-2' ? 'bg-[#0891b2]' : 'bg-[#6366f1]'}`}>{acc.name.charAt(0)}</div><div className="flex-1 min-w-0"><div className="text-[13px] font-bold text-[#f8fafc] truncate">{acc.name}</div><div className="text-[11px] text-[#64748b] font-mono truncate">{acc.addresses.eth.slice(0, 6)}...{acc.addresses.eth.slice(-4)}</div></div><div className="flex items-center gap-2"><span className="text-[13px] font-medium text-[#f8fafc] tabular-nums">${acc.balance_usd.toLocaleString()}</span> {acc.id === activeId && <Check size={14} className="text-[#6366f1] shrink-0" />}</div></button> ))}</div>
      <div className="h-px bg-[#1e2030] my-2" /><button onClick={onImport} className="w-full h-11 px-3 flex items-center gap-3 rounded-[8px] hover:bg-[#161720] transition-all border-none bg-transparent cursor-pointer text-[#6366f1] font-bold text-[13px]"><div className="w-8 h-8 rounded-full bg-[#6366f1]/10 flex items-center justify-center shrink-0"><Plus size={16} /></div>Add or Import Wallet</button><div className="fixed inset-0 z-[-1]" onClick={onClose} />
    </motion.div>
  );
}
