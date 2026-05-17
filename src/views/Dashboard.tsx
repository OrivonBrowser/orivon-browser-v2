import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Search, 
  Globe, 
  Zap, 
  ShieldCheck, 
  LayoutGrid,
  Network,
  Link as LinkIcon,
  Circle,
  Hash,
  ArrowUpRight,
  Plus,
  Settings,
  Bell,
  Cpu,
  Layers,
  BarChart3,
  Waves,
  LogOut,
  Wallet,
  Activity,
  Box,
  Compass,
  Command,
  MoreVertical,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { AppState } from '../types';

interface DashboardProps {
  onLaunch: (url: string) => void;
  identity: AppState['identity'];
  onLock: () => void;
}

export default function Dashboard({ onLaunch, identity, onLock }: DashboardProps) {
  const [url, setUrl] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [nodes, setNodes] = useState({
    btc: true,
    ipfs: true,
    wasm: false
  });

  const [yieldAmount, setYieldAmount] = useState(12.428);

  useEffect(() => {
    const interval = setInterval(() => {
      setYieldAmount(prev => prev + 0.0034);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunch = () => {
    const target = url.trim().toLowerCase() || 'uniswap.eth';
    onLaunch(target.endsWith('.eth') || target.includes('.') ? target : `${target}.eth`);
  };

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', active: true },
    { icon: Wallet, label: 'Economy' },
    { icon: Activity, label: 'Analytics' },
    { icon: Box, label: 'Nodes' },
    { icon: Settings, label: 'Settings' },
    { icon: Compass, label: 'Explorer' },
  ];

  return (
    <div className={`h-full flex ${theme === 'dark' ? 'bg-[#080808] text-white' : 'bg-[#f5f5f5] text-black'} font-sans overflow-hidden relative transition-colors duration-500`}>
      {/* Sidebar */}
      <aside className={`w-24 lg:w-64 border-r ${theme === 'dark' ? 'border-white/5 bg-[#080808]' : 'border-black/5 bg-white'} flex flex-col items-center lg:items-start py-8 px-4 lg:px-6 z-50 transition-colors duration-500`}>
        <div className="flex items-center gap-3 mb-16 px-2">
          <div className="w-10 h-10 bg-orivon-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,135,0.2)]">
            <ShieldCheck size={24} className="text-black" />
          </div>
          <span className="hidden lg:block text-xl font-black tracking-tighter uppercase whitespace-nowrap">Orivon Shell</span>
        </div>

        <nav className="flex-1 w-full space-y-2">
          {menuItems.map((item) => (
            <button 
              key={item.label}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                item.active 
                  ? 'bg-orivon-accent text-black shadow-lg shadow-orivon-accent/10' 
                  : theme === 'dark' ? 'text-white/40 hover:bg-white/5 hover:text-white' : 'text-black/40 hover:bg-black/5 hover:text-black'
              }`}
            >
              <item.icon size={20} className={item.active ? 'text-black' : 'group-hover:scale-110 transition-transform'} />
              <span className="hidden lg:block text-xs font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="w-full pt-8 border-t border-white/5">
           <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-black/[0.03]'} space-y-4`}>
              <div className="flex items-center justify-between">
                 <span className="text-[8px] font-black uppercase tracking-widest opacity-40">System Core</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-orivon-accent animate-pulse"></div>
              </div>
              <div className="space-y-1 text-left w-full overflow-hidden">
                 <div className="text-[10px] font-bold">Node_v0.94</div>
                 <div className="text-[8px] font-mono opacity-40 uppercase tracking-tighter text-orivon-blue truncate">Encrypted_Mesh_Active</div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className={`h-20 px-8 flex items-center justify-between z-40 border-b ${theme === 'dark' ? 'border-white/5 bg-[#080808]/80' : 'border-black/5 bg-white/80'} backdrop-blur-xl sticky top-0 transition-colors duration-500`}>
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orivon-accent animate-pulse shadow-[0_0_8px_rgba(0,255,135,0.5)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Local Mesh: Connected</span>
               </div>
               <div className="text-sm font-black uppercase tracking-tight">orivon.id/alpha</div>
            </div>

            <div className={`hidden xl:flex items-center px-4 py-2 ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-black/[0.03]'} border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} rounded-full`}>
               <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mr-4">Aggregate Balance</p>
               <span className="text-sm font-black tracking-tight">$12,450.00</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Theme Toggle */}
             <div className={`flex items-center p-1 ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-black/[0.03]'} border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} rounded-2xl`}>
                <button 
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-white/40 hover:text-white'}`}
                >
                  <Sun size={14} />
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-white/10 text-white' : 'text-black/40 hover:text-black'}`}
                >
                  <Moon size={14} />
                </button>
             </div>

             <div className="h-8 w-px bg-white/10 mx-2"></div>

             {/* Browser Mode Toggle */}
             <button 
               onClick={() => onLaunch('browser_mode')}
               className="flex items-center gap-2 px-6 py-2.5 bg-orivon-accent text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orivon-accent/10 hover:brightness-110 active:scale-[0.98] transition-all"
             >
                <Monitor size={14} />
                Browser Mode
             </button>

             <div className="flex items-center gap-4 pl-4 border-l border-white/5">
                <button className={`w-10 h-10 rounded-xl flex items-center justify-center border ${theme === 'dark' ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.03] border-black/5'} text-white/40 hover:text-white transition-all transition-colors`}>
                   <Bell size={18} className={theme !== 'dark' ? 'text-black/40' : ''} />
                </button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orivon-accent to-orivon-blue p-px shadow-lg">
                   <div className={`w-full h-full ${theme === 'dark' ? 'bg-[#0c0c0c]' : 'bg-white'} rounded-[10px] flex items-center justify-center overflow-hidden`}>
                      <User size={20} className="text-orivon-accent" />
                   </div>
                </div>
             </div>
          </div>
        </header>

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar">
          <div className="max-w-[1500px] mx-auto space-y-10">
            
            {/* Top Grid: Welcome + Multi-Chain Trackers */}
            <div className="grid grid-cols-12 gap-8">
              {/* Welcome Section */}
              <div className="col-span-12 xl:col-span-4 flex flex-col justify-between py-2">
                 <div className="space-y-4">
                   <p className="opacity-40 text-[11px] font-black uppercase tracking-[0.4em]">Welcome back,</p>
                   <div className="space-y-1 text-left">
                      <h1 className="text-6xl font-black tracking-tighter leading-none">Orivon.id/</h1>
                      <h1 className="text-6xl font-black tracking-tighter opacity-20 leading-none">alpha</h1>
                   </div>
                   <div className="pt-4 flex gap-3">
                      <span className="px-5 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                         Premium Shell
                      </span>
                   </div>
                 </div>

                 {/* Trustlessity Rating Module */}
                 <div className={`mt-10 p-8 rounded-[2.5rem] ${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'} border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} shadow-2xl relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-orivon-accent/5 blur-[80px] pointer-events-none transition-all group-hover:bg-orivon-accent/10"></div>
                    <div className="space-y-6 relative z-10">
                       <div className="flex justify-between items-center text-left">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Wallet Trustlessity</span>
                          <ShieldCheck size={16} className="text-orivon-accent" />
                       </div>
                       <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black tracking-tighter">96.8<span className="text-xl opacity-20 ml-1">%</span></span>
                       </div>
                       <div className="flex gap-2">
                          <span className="px-3 py-1 bg-orivon-accent/10 border border-orivon-accent/20 rounded-lg text-[8px] font-black text-orivon-accent tracking-widest uppercase">Decentralized</span>
                          <span className="px-3 py-1 bg-orivon-blue/10 border border-orivon-blue/20 rounded-lg text-[8px] font-black text-orivon-blue tracking-widest uppercase">Secure Context</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Multi-Chain Account Tracker Module */}
              <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
                 <div className="flex justify-between items-center px-4">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40">Multi-Chain Account Tracker</h2>
                    <span className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em] font-mono">Kernel_Binding: Active</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                    {[
                      { coin: 'Bitcoin', symbol: 'BTC', val: '0.194', fiat: '$12,241.50', tag: 'Native SegWit', color: 'bg-[#fffd82]', text: 'text-black', icon: User },
                      { coin: 'Ethereum', symbol: 'ETH', val: '1.428', fiat: '$4,831.12', tag: 'EVM Context', color: 'bg-[#a8a8ff]', text: 'text-black', icon: Activity },
                      { coin: 'Solana', symbol: 'SOL', val: '42.91', fiat: '$6,231.84', tag: 'Ed25519 Link', color: 'bg-orivon-accent', text: 'text-black', icon: Wallet },
                    ].map((asset) => (
                      <motion.div 
                        key={asset.coin}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className={`p-8 rounded-[3rem] ${asset.color} ${asset.text} shadow-2xl flex flex-col justify-between relative overflow-hidden group h-full`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 blur-[40px] pointer-events-none group-hover:bg-black/10 transition-all"></div>
                        <div className="flex justify-between items-start mb-10">
                           <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center">
                              <asset.icon size={20} />
                           </div>
                           <div className="px-3 py-1 bg-black/10 rounded-lg text-[8px] font-black uppercase tracking-widest opacity-60 font-mono">
                             {asset.tag}
                           </div>
                        </div>
                        <div className="space-y-1 text-left">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{asset.coin} ({asset.symbol})</p>
                           <p className="text-4xl font-black tracking-tighter leading-none">{asset.val}</p>
                           <div className="flex justify-between items-center pt-6 mt-6 border-t border-black/5 opacity-60">
                              <span className="text-xs font-mono font-bold">{asset.fiat}</span>
                              <ArrowUpRight size={16} />
                           </div>
                        </div>
                      </motion.div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Middle Grid: Runtime Engine + Tokenomics */}
            <div className="grid grid-cols-12 gap-8">
               {/* Native Engine Runtime Dock */}
               <div className={`col-span-12 xl:col-span-5 p-10 rounded-[3rem] ${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'} border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} shadow-2xl space-y-10 flex flex-col`}>
                  <div className="flex justify-between items-center text-left">
                     <div className="flex items-center gap-4">
                        <Cpu size={20} className="text-orivon-accent" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">Native Engine Runtime Dock</h3>
                     </div>
                     <span className="px-2.5 py-1 bg-orivon-accent/10 text-orivon-accent rounded-lg text-[8px] font-black uppercase">v2.4_iso</span>
                  </div>

                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                     {[
                       { label: 'Bitcoin Light Client', status: `Syncing Blocks (94%)`, active: nodes.btc, color: 'bg-orivon-accent', key: 'btc' },
                       { label: 'IPFS Node Client', status: `Active (8 Connected Peers)`, active: nodes.ipfs, color: 'bg-orivon-blue', key: 'ipfs' },
                       { label: 'WASM Sandbox Kernel', status: 'Standby / Secure', active: nodes.wasm, color: 'bg-white/20', key: 'wasm' }
                     ].map(node => (
                       <div key={node.label} className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-black/[0.02]'} border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} flex items-center justify-between group hover:border-orivon-accent/20 transition-all`}>
                          <div className="space-y-1.5 text-left">
                             <div className="text-sm font-black tracking-tight">{node.label}</div>
                             <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${node.color} ${node.active ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`}></div>
                                <div className="text-[9px] font-mono font-bold opacity-40 uppercase tracking-[0.1em]">{node.status}</div>
                             </div>
                          </div>
                          <button 
                            onClick={() => setNodes(prev => ({ ...prev, [node.key as any]: !prev[node.key as keyof typeof prev] }))}
                            className={`w-12 h-6 rounded-full relative transition-all duration-500 p-1 cursor-pointer ${node.active ? 'bg-orivon-accent/30' : 'bg-white/10'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 shadow-sm ${node.active ? 'right-1 bg-orivon-accent' : 'left-1 bg-white/40'}`}></div>
                          </button>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Tokenomics & Economy Module */}
               <div className={`col-span-12 xl:col-span-7 p-10 rounded-[3rem] ${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'} border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} shadow-2xl flex flex-col justify-between`}>
                  <div className="flex justify-between items-center mb-12 text-left">
                     <div className="flex items-center gap-4">
                        <Wallet size={20} className="text-orivon-blue" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">ORIVON Economy Module</h3>
                     </div>
                     <div className="flex gap-2">
                        <span className="px-3 py-1 bg-orivon-accent/10 border border-orivon-accent/20 rounded-lg text-[8px] font-black text-orivon-accent uppercase tracking-widest">$ORV ACTIVE</span>
                     </div>
                  </div>

                  <div className="space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                        <div className="space-y-3">
                           <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Liquid Token Balance</p>
                           <div className="flex items-baseline gap-2">
                              <span className="text-5xl font-black tabular-nums tracking-tighter">10,000.00</span>
                              <span className="text-[12px] font-black text-orivon-accent">$ORV</span>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Staked Token Allocation</p>
                           <div className="flex items-baseline gap-2">
                              <span className="text-5xl font-black tabular-nums tracking-tighter opacity-40">5,000.00</span>
                              <span className="text-[12px] font-black text-orivon-blue">STAKED</span>
                           </div>
                        </div>
                     </div>

                     <div className={`p-8 rounded-[2.5rem] ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-black/[0.02]'} border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} flex flex-col md:flex-row items-center justify-between gap-8 group`}>
                        <div className="space-y-2 text-center md:text-left">
                           <p className="text-[10px] font-black opacity-30 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                              <Activity size={12} className="text-orivon-accent" />
                              Hardware Yield Counter
                           </p>
                           <p className="text-[11px] font-bold text-orivon-accent uppercase tracking-[0.2em]">+12.4 $ORV / HOUR EARNED</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                           <span className="text-6xl font-black tabular-nums tracking-tighter text-orivon-accent">+{yieldAmount.toFixed(4)}</span>
                           <span className="text-[10px] font-black opacity-20 tracking-widest">$ORV</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bottom Row: Launcher Hub */}
            <div className="space-y-10 pt-10 border-t border-white/5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-6">
                    <h2 className="text-[12px] font-black uppercase tracking-[0.8em] opacity-20 whitespace-nowrap">Decentralized App Launcher</h2>
                 </div>
                 
                 {/* Integrated Search Launcher */}
                 <div className="flex-1 max-w-2xl w-full relative group">
                    <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 group-focus-within:text-orivon-accent transition-all" />
                    <input 
                      type="text" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
                      placeholder="Execute specific .eth app on-the-fly..." 
                      className={`w-full h-16 ${theme === 'dark' ? 'bg-[#121212] border-white/5' : 'bg-white border-black/5'} border px-16 rounded-3xl text-sm font-mono focus:outline-none focus:border-orivon-accent/50 focus:ring-4 focus:ring-orivon-accent/5 transition-all shadow-xl`}
                    />
                    <button 
                      onClick={handleLaunch}
                      className="absolute right-3 top-3 bottom-3 px-8 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-orivon-accent hover:text-black transition-all active:scale-[0.95]"
                    >
                      Execute
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                 {[
                   { name: 'Uniswap V4', id: 'UN', desc: 'Concentrated liquidity AMM protocol with local hook execution.', score: '99%', accent: 'text-pink-500', url: 'uniswap.eth', tag: 'DEX' },
                   { name: 'BitTorrent', id: 'BT', desc: 'Secure P2P data distribution via decentralized sovereign clusters.', score: '95%', accent: 'text-orivon-blue', url: 'bittorrent.eth', tag: 'P2P' },
                   { name: 'Radicle Git', id: 'RD', desc: 'Peer-to-peer code collaboration and sovereign version control.', score: '98%', accent: 'text-purple-400', url: 'radicle.eth', tag: 'DEV' }
                 ].map((app) => (
                   <motion.div 
                    key={app.name}
                    whileHover={{ y: -8 }}
                    className={`p-10 rounded-[3.5rem] ${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'} border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} flex flex-col justify-between h-[450px] group transition-all hover:border-orivon-accent/30 shadow-2xl relative overflow-hidden`}
                   >
                     <div className="absolute top-0 right-0 w-48 h-48 bg-orivon-accent/5 blur-[100px] pointer-events-none group-hover:bg-orivon-accent/10 transition-all"></div>
                     <div className="flex justify-between items-start mb-6">
                        <div className={`w-16 h-16 rounded-[1.6rem] ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-black/[0.03]'} border ${theme === 'dark' ? 'border-white/10' : 'border-black/10'} flex items-center justify-center font-black text-2xl transition-all group-hover:border-orivon-accent/40 group-hover:${app.accent}`}>{app.id}</div>
                        <div className="px-4 py-1.5 bg-orivon-accent/10 border border-orivon-accent/20 rounded-full text-[9px] font-black text-orivon-accent uppercase tracking-widest shadow-lg shadow-orivon-accent/5 font-mono">Trust Score: {app.score}</div>
                     </div>
                     <div className="space-y-6 flex-1 text-left">
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                              <h3 className="text-3xl font-black tracking-tighter uppercase leading-tight">{app.name}</h3>
                              <span className="px-2 py-0.5 bg-orivon-accent/10 text-orivon-accent text-[8px] font-bold rounded-md tracking-widest">{app.tag}</span>
                           </div>
                           <p className="text-sm opacity-40 leading-relaxed font-medium">
                             {app.desc}
                           </p>
                        </div>
                     </div>
                     <button 
                      onClick={() => onLaunch(app.url)}
                      className={`w-full py-5 rounded-2xl ${theme === 'dark' ? 'bg-white/[0.05]' : 'bg-black/[0.05]'} border ${theme === 'dark' ? 'border-white/10' : 'border-black/10'} text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-orivon-accent hover:text-black hover:border-orivon-accent active:scale-[0.98] shadow-lg`}
                     >
                       Launch Execution
                     </button>
                   </motion.div>
                 ))}
              </div>
            </div>
          </div>
        </main>

        {/* Status Bar Ticker */}
        <footer className={`h-12 border-t ${theme === 'dark' ? 'border-white/5 bg-[#080808]' : 'border-black/5 bg-white'} flex items-center justify-between px-10 text-[9px] font-mono font-black uppercase tracking-[0.5em] opacity-20 overflow-hidden relative z-50 transition-colors duration-500`}>
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex gap-20 whitespace-nowrap"
          >
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex gap-20">
                <span className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-orivon-accent"></div>
                  CORE_STABLE_X94
                </span>
                <span>// KERNEL_BINDING: SECURE_TRANS_0x24</span>
                <span className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-orivon-blue"></div>
                  MESH_STRENGTH: NOMINAL
                </span>
                <span>// HEARTBEAT_P2P: 1.2MS</span>
                <span>// ENCRYPTION: 4096B_ECDSA</span>
              </div>
            ))}
          </motion.div>
        </footer>
      </div>
    </div>
  );
}
