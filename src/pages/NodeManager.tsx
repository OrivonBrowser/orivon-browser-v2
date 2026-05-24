import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Database, Share2, CircleDot, Activity, 
  Settings, Play, Square, RefreshCw, Users, ArrowUpDown, 
  Server, ArrowDown, ArrowUp, Check, Loader2, Globe, 
  Terminal, ChevronDown, Copy, X, Plus, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../store/settings';
import { useTabsStore } from '../store/tabs';
import { SETTINGS_URL } from '../constants';

type NodeView = 'Overview' | 'IPFS' | 'BitTorrent' | 'Bitcoin' | 'Logs' | 'Settings';

export default function NodeManagerPage() {
  const [activeView, setActiveView] = useState<NodeView>('Overview');
  const [cpuUsage, setCpuUsage] = useState(12);
  const [ramUsage, setRamUsage] = useState(847);
  const [btcHeight, setBtcHeight] = useState(840847);
  const { accentColor } = useSettings();

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(8 + Math.floor(Math.random() * 10));
      setRamUsage(820 + Math.floor(Math.random() * 70));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBtcHeight(h => h + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full bg-[#0d0e14] text-[#f8fafc] font-inter overflow-hidden">
      {/* Node Manager Sidebar */}
      <aside className="w-[240px] h-full bg-[#0a0b11] border-r border-[#1e2030] flex flex-col shrink-0">
        <div className="p-6 pb-4">
          <div className="text-[11px] font-bold tracking-[0.08em] text-[#475569] uppercase">Node Manager</div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 custom-scrollbar">
          <SidebarItem icon={LayoutDashboard} label="Overview" active={activeView === 'Overview'} onClick={() => setActiveView('Overview')} />
          <SidebarItem icon={Database} label="IPFS Node" active={activeView === 'IPFS'} onClick={() => setActiveView('IPFS')} />
          <SidebarItem icon={Share2} label="BitTorrent" active={activeView === 'BitTorrent'} onClick={() => setActiveView('BitTorrent')} />
          <SidebarItem icon={CircleDot} label="Bitcoin Node" active={activeView === 'Bitcoin'} onClick={() => setActiveView('Bitcoin')} />
          <SidebarItem icon={Activity} label="Logs" active={activeView === 'Logs'} onClick={() => setActiveView('Logs')} />
          <SidebarItem icon={Settings} label="Node Settings" active={activeView === 'Settings'} onClick={() => setActiveView('Settings')} />

          <div className="h-px bg-[#1e2030] mx-3 my-4" />
          <div className="px-4 mb-2 text-[10px] font-bold text-[#475569] uppercase tracking-widest">Quick Actions</div>
          
          <QuickAction icon={Play} label="Start All Nodes" color="text-[#22c55e]" />
          <QuickAction icon={Square} label="Stop All Nodes" color="text-[#ef4444]" />
          <QuickAction icon={RefreshCw} label="Restart All" color="text-[#f59e0b]" />

          <div className="h-px bg-[#1e2030] mx-3 my-4" />
          <div className="px-4 mb-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest">System Resources</div>
          
          <div className="px-4 space-y-4 pb-6">
             <ResourceWidget label="CPU" val={`${cpuUsage}%`} progress={cpuUsage} color={accentColor} />
             <ResourceWidget label="RAM" val={`${ramUsage} MB / 16 GB`} progress={(ramUsage/16000)*100} color="#22c55e" />
             <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#64748b] font-bold uppercase">Network</span>
                <div className="flex items-center gap-1.5 text-[12px] text-[#f8fafc] font-bold tabular-nums">
                   <ArrowUpDown size={12} className="text-[#64748b]" /> 2.4 MB/s
                </div>
             </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-[52px] border-b border-[#1e2030] px-8 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h1 className="text-[20px] font-semibold text-[#f8fafc]">{activeView}</h1>
            <p className="text-[12px] text-[#64748b]">Web3 infrastructure running in your browser.</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1000px] mx-auto space-y-8 pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {renderViewContent(activeView, btcHeight, setActiveView)}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: any) {
  const { accentColor } = useSettings();
  return (
    <button
      onClick={onClick}
      className={`w-full h-[38px] px-4 flex items-center gap-3 rounded-lg transition-all border-none bg-transparent cursor-pointer group relative ${
        active ? 'bg-[#111218] text-[#f8fafc]' : 'text-[#64748b] hover:text-[#f8fafc] hover:bg-[#111218]'
      }`}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r" style={{ backgroundColor: accentColor }} />
      )}
      <Icon size={15} className={active ? '' : 'group-hover:text-[#f8fafc] transition-colors'} style={active ? { color: accentColor } : {}} />
      <span className={`text-[13px] font-medium ${active ? 'text-[#f8fafc]' : ''}`}>{label}</span>
    </button>
  );
}

function QuickAction({ icon: Icon, label, color }: any) {
  return (
    <button className={`w-full h-9 px-4 flex items-center gap-3 rounded-lg bg-transparent border-none cursor-pointer hover:bg-[#111218] transition-all group`}>
       <Icon size={14} className={color} />
       <span className={`text-[12px] font-bold uppercase tracking-wider ${color}`}>{label}</span>
    </button>
  );
}

function ResourceWidget({ label, val, progress, color }: any) {
  return (
    <div className="space-y-1.5">
       <div className="flex justify-between items-center text-[11px] font-bold uppercase">
          <span className="text-[#64748b]">{label}</span>
          <span className="text-[#f8fafc] tabular-nums">{val}</span>
       </div>
       <div className="h-1.5 w-full bg-[#1e2030] rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: `${progress}%` }} 
            className="h-full rounded-full" 
            style={{ backgroundColor: color }} 
          />
       </div>
    </div>
  );
}

function renderViewContent(view: NodeView, btcHeight: number, setView: (v: NodeView) => void) {
  switch (view) {
    case 'Overview': return <NodeOverview btcHeight={btcHeight} />;
    case 'IPFS': return <IPFSNodePage />;
    case 'Bitcoin': return <BitcoinNodePage btcHeight={btcHeight} />;
    case 'Logs': return <LogsPage />;
    case 'Settings': return <NodeSettingsPage setView={setView} />;
    default: return <div className="py-20 text-center text-[#64748b]">{view} dashboard coming soon.</div>;
  }
}

// --- View Pages ---

function NodeOverview({ btcHeight }: { btcHeight: number }) {
  return (
    <div className="space-y-6 animate-fade">
       {/* System Status Bar */}
       <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6 flex divide-x divide-[#1e2030]">
          <OverviewStat icon={Server} val="1" label="Nodes Running" color="text-[#22c55e]" />
          <OverviewStat icon={Users} val="24" label="Connected Peers" color="text-[#6366f1]" />
          <OverviewStat icon={ArrowUpDown} val="1.4 GB" label="Today" color="text-[#f59e0b]" />
          <OverviewStat icon={CircleDot} val={btcHeight.toLocaleString()} label="Bitcoin Network" color="text-[#f97316]" isBtc />
       </div>

       <div className="grid grid-cols-3 gap-6">
          <NodeStatusCard id="ipfs" name="IPFS Node" icon={Database} color="#06b6d4" status="Online" stats={{ Peers: '24', Repo: '1.2 GB', In: '847 KB/s', Out: '124 KB/s' }} />
          <NodeStatusCard id="bittorrent" name="BitTorrent" icon={Share2} color="#f59e0b" status="Offline" desc="Peer-to-peer file sharing. No external application required." features={['Magnet link support', 'DHT and PEX', 'No port forwarding']} />
          <NodeStatusCard id="bitcoin" name="Bitcoin Node" icon={CircleDot} color="#f97316" status="Offline" desc="Full validation node using quick sync technology." features={['Validates all transactions', 'Pruned: 550 MB only', 'Pre-synced snapshot']} isBtc />
       </div>

       <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-[14px] font-bold text-[#f8fafc]">Network Peers</h3>
             <span className="text-[12px] font-bold text-[#22c55e] uppercase tracking-widest">24 Connected</span>
          </div>

          <div className="relative h-[300px] bg-[#0a0b11] rounded-xl mb-8 flex items-center justify-center overflow-hidden">
             {/* Static SVG Map Visualization */}
             <svg width="600" height="300" viewBox="0 0 600 300" className="opacity-40">
                <circle cx="300" cy="150" r="4" fill="#6366f1" />
                <circle cx="300" cy="150" r="40" stroke="#6366f1" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                {[
                   {x: 300, y: 50, f: '🇩🇪', l: '12ms'}, {x: 450, y: 100, f: '🇺🇸', l: '8ms'},
                   {x: 500, y: 200, f: '🇯🇵', l: '145ms'}, {x: 400, y: 250, f: '🇬🇧', l: '18ms'},
                   {x: 200, y: 250, f: '🇸🇬', l: '98ms'}, {x: 100, y: 200, f: '🇨🇦', l: '22ms'},
                   {x: 80, y: 100, f: '🇦🇺', l: '187ms'}, {x: 180, y: 60, f: '🇧🇷', l: '74ms'}
                ].map((p, i) => (
                   <g key={i}>
                      <line x1="300" y1="150" x2={p.x} y2={p.y} stroke="#1e2030" strokeWidth="1" />
                      <circle cx={p.x} cy={p.y} r="3" fill="#06b6d4" />
                      <text x={p.x + 8} y={p.y + 4} fill="#64748b" fontSize="10" fontFamily="monospace">{p.f} {p.l}</text>
                   </g>
                ))}
             </svg>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-[#6366f1]/5 border border-[#6366f1]/20 animate-pulse" />
             </div>
          </div>

          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="h-10 border-b border-[#1e2030]">
                   <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider pl-4">Peer ID</th>
                   <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Location</th>
                   <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Latency</th>
                   <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Protocol</th>
                   <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Connected</th>
                   <th className="text-[11px] font-bold text-[#475569] uppercase tracking-wider pr-4 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-[#1e2030]">
                <PeerRow id="QmYwAPJzv5CZsnA..." loc="🇩🇪 Germany" lat="12ms" prot="IPFS/0.1.0" time="2h 14m" />
                <PeerRow id="QmNnooDu7bfjPFo..." loc="🇺🇸 USA" lat="8ms" prot="IPFS/0.1.0" time="1h 42m" />
                <PeerRow id="QmQCU2EcMqAqYi6..." loc="🇯🇵 Japan" lat="145ms" prot="IPFS/0.1.0" time="45m" />
                <PeerRow id="QmSoLMeWqB7YGVB..." loc="🇬🇧 UK" lat="18ms" prot="IPFS/0.1.0" time="3h 07m" />
             </tbody>
          </table>
       </div>
    </div>
  );
}

function OverviewStat({ icon: Icon, val, label, color, isBtc }: any) {
  return (
    <div className="flex-1 px-8 first:pl-0 last:pr-0 flex flex-col justify-center">
       <div className="flex items-center gap-3 mb-1">
          <Icon size={18} className={color} />
          <motion.span 
            key={isBtc ? val : undefined}
            initial={isBtc ? { scale: 1.1 } : {}}
            animate={isBtc ? { scale: 1 } : {}}
            className="text-[24px] font-bold text-[#f8fafc] tabular-nums"
          >
            {val}
          </motion.span>
       </div>
       <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest">{label}</span>
    </div>
  );
}

function NodeStatusCard({ id, name, icon: Icon, color, status, stats, desc, features, isBtc }: any) {
  const [currentStatus, setStatus] = useState(status);
  const [starting, setStarting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStart = () => {
    setStarting(true);
    if (isBtc) {
       let p = 0;
       const int = setInterval(() => {
          p += 2;
          setProgress(p);
          if (p >= 100) {
             clearInterval(int);
             setStatus('Online');
             setStarting(false);
          }
       }, 100);
    } else {
       setTimeout(() => {
          setStatus('Online');
          setStarting(false);
       }, 2500);
    }
  };

  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6 flex flex-col h-[340px] transition-all relative overflow-hidden" style={{ borderTop: `3px solid ${color}` }}>
       <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <Icon size={18} style={{ color }} />
             <span className="text-[14px] font-bold text-[#f8fafc]">{name}</span>
          </div>
          <div className={`px-2.5 py-1 rounded-lg flex items-center gap-2 border ${currentStatus === 'Online' ? 'bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]' : 'bg-[#1e2030] border-[#2d2e45] text-[#64748b]'}`}>
             <div className={`w-1.5 h-1.5 rounded-full ${currentStatus === 'Online' ? 'bg-[#22c55e] animate-pulse' : 'bg-[#475569]'}`} />
             <span className="text-[11px] font-bold uppercase tracking-widest">{starting ? 'Starting' : currentStatus}</span>
          </div>
       </div>

       <div className="flex-1">
          {currentStatus === 'Online' ? (
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   {Object.entries(stats || {}).map(([label, val]: any) => (
                      <div key={label} className="flex flex-col">
                         <span className="text-[20px] font-bold text-[#f8fafc] tabular-nums">{val}</span>
                         <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest">{label}</span>
                      </div>
                   ))}
                </div>
                <div className="h-10 w-full relative">
                   <LiveSparkline color={color} />
                </div>
             </div>
          ) : starting && isBtc ? (
             <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-[12px] font-bold">
                   <span className="text-[#94a3b8]">Syncing blocks...</span>
                   <span className="text-[#f8fafc] tabular-nums">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1e2030] rounded-full overflow-hidden">
                   <div className="h-full bg-[#f97316]" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[11px] text-[#64748b]">Estimated sync time: 4-8 minutes</p>
             </div>
          ) : (
             <div className="space-y-4">
                <p className="text-[13px] text-[#94a3b8] leading-relaxed">{desc}</p>
                <div className="space-y-1.5">
                   {features.map((f: any) => (
                      <div key={f} className="flex items-center gap-2 text-[12px] text-[#64748b] font-medium">
                         <Check size={12} style={{ color }} /> {f}
                      </div>
                   ))}
                </div>
                {isBtc && !starting && (
                   <div className="h-1.5 w-full bg-[#1e2030] rounded-full overflow-hidden opacity-30">
                      <div className="h-full bg-[#f97316] w-0" />
                   </div>
                )}
             </div>
          )}
       </div>

       <button 
         onClick={currentStatus === 'Online' ? () => setStatus('Offline') : handleStart}
         disabled={starting}
         className={`w-full h-9 rounded-lg border font-bold text-[13px] transition-all cursor-pointer mt-4 flex items-center justify-center gap-2 ${
           starting ? 'bg-transparent border-[#475569] text-[#475569] cursor-not-allowed' :
           currentStatus === 'Online' ? 'bg-transparent border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/10' :
           'bg-transparent border-[#6366f1] text-[#818cf8] hover:bg-[#6366f1] hover:text-white'
         }`}
       >
          {starting && <Loader2 size={14} className="animate-spin" />}
          {starting ? 'Starting Node...' : currentStatus === 'Online' ? 'Stop Node' : `Start ${id === 'bitcoin' ? 'Bitcoin' : 'Node'}`}
       </button>
    </div>
  );
}

function LiveSparkline({ color }: { color: string }) {
  const [points, setPoints] = useState(() => Array.from({ length: 20 }, () => Math.random() * 40));
  
  useEffect(() => {
    const int = setInterval(() => {
      setPoints(prev => [...prev.slice(1), Math.random() * 40]);
    }, 3000);
    return () => clearInterval(int);
  }, []);

  const path = points.map((p, i) => `${(i / 19) * 200},${40 - p}`).join(' L ');

  return (
    <svg width="100%" height="40" viewBox="0 0 200 40" className="overflow-visible">
       <motion.path 
         animate={{ d: `M 0,${40-points[0]} L ${path}` }}
         transition={{ duration: 0.5 }}
         fill="none" 
         stroke={color} 
         strokeWidth="2" 
         strokeLinecap="round" 
       />
    </svg>
  );
}

function PeerRow({ id, loc, lat, prot, time }: any) {
  return (
    <tr className="h-11 hover:bg-[#161720] transition-colors group cursor-default tabular">
       <td className="pl-4 font-mono text-[12px] text-[#f8fafc]">{id}</td>
       <td className="text-[12px] text-[#94a3b8]">{loc}</td>
       <td className="font-mono text-[12px] text-[#22c55e]">{lat}</td>
       <td className="text-[12px] text-[#64748b]">{prot}</td>
       <td className="text-[12px] text-[#64748b]">{time}</td>
       <td className="pr-4 text-right">
          <button className="opacity-0 group-hover:opacity-100 h-6 px-3 rounded border border-[#ef4444]/40 text-[#ef4444] text-[10px] font-bold uppercase hover:bg-[#ef4444]/10 transition-all bg-transparent cursor-pointer">Disconnect</button>
       </td>
    </tr>
  );
}

// --- Detail Pages ---

function IPFSNodePage() {
  const [logs, setLogs] = useState([
     '[14:23:41] Swarm listening on /ip4/0.0.0.0/tcp/4001',
     '[14:23:41] Swarm listening on /ip6/::/tcp/4001',
     '[14:23:42] Swarm key initialized',
     '[14:23:43] Bootstrapping with 4 nodes',
     '[14:23:44] Peer discovered: QmNnooDu7bfjPFoX5pZLDjUQABFjkxRVOLbcGKMbFWxVBA'
  ]);

  useEffect(() => {
    const logPool = [
       'Added block QmYwAPJ... (2048 bytes)',
       'Reprovide sweep completed (47 keys)',
       'New peer connected: QmSoLMeWqB7...',
       'GC freed 14.2 MB',
       'Pinned QmHash1abc... (uniswap.eth)',
       'Routing table updated: 24 peers'
    ];
    const int = setInterval(() => {
       const msg = logPool[Math.floor(Math.random() * logPool.length)];
       setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString('en-GB', {hour12:false})}] ${msg}`]);
    }, 4000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="space-y-8 animate-fade">
       <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
             <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#f8fafc]">IPFS Node Online</span>
                <span className="text-[12px] text-[#64748b]">Uptime: 2h 34m</span>
             </div>
          </div>
          <div className="flex gap-2">
             <button className="h-8 px-4 rounded-lg bg-[#1e2030] border border-[#1e2030] text-[#94a3b8] text-[12px] font-bold hover:text-[#f8fafc] transition-all cursor-pointer">Restart</button>
             <button className="h-8 px-4 rounded-lg border border-[#ef4444]/40 text-[#ef4444] text-[12px] font-bold hover:bg-[#ef4444]/10 transition-all cursor-pointer bg-transparent">Stop Node</button>
          </div>
       </div>

       <div className="grid grid-cols-4 gap-4">
          <DetailStat icon={Users} label="Connected Peers" val="24" color="#6366f1" />
          <DetailStat icon={Database} label="Repo Size" val="1.2 GB" color="#06b6d4" />
          <DetailStat icon={ArrowDown} label="Bandwidth In" val="847 MB" color="#22c55e" />
          <DetailStat icon={ArrowUp} label="Bandwidth Out" val="124 MB" color="#f59e0b" />
       </div>

       <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[14px] font-bold text-[#f8fafc]">Bandwidth</h3>
             <div className="flex bg-[#161720] border border-[#1e2030] rounded-lg p-1">
                {['1H', '6H', '24H', '7D'].map(t => (
                   <button key={t} className={`h-7 px-3 rounded-md text-[11px] font-bold ${t === '1H' ? 'bg-[#2d2e45] text-[#f8fafc]' : 'text-[#64748b]'} border-none cursor-pointer`}>{t}</button>
                ))}
             </div>
          </div>
          <div className="h-[220px] w-full">
             <BandwidthChart />
          </div>
       </div>

       <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6">
          <h3 className="text-[14px] font-bold text-[#f8fafc] mb-6 flex items-center gap-2"><Terminal size={14} className="text-[#6366f1]" /> Live Logs</h3>
          <div className="bg-[#0a0b11] rounded-lg p-5 font-mono text-[12px] space-y-1.5 h-[240px] overflow-y-auto custom-scrollbar">
             {logs.map((log, i) => (
                <div key={i} className={log.includes('Pinned') ? 'text-[#f8fafc]' : 'text-[#22c55e]'}>
                   <span className="text-[#475569]">{log.split(']')[0]}]</span> {log.split(']')[1]}
                </div>
             ))}
             <div className="h-px w-full" />
          </div>
       </div>
    </div>
  );
}

function BandwidthChart() {
  return (
    <svg width="100%" height="220" viewBox="0 0 800 220" className="overflow-visible opacity-80">
       <defs>
          <linearGradient id="gradDown" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
             <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradUp" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
             <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
       </defs>
       <path d="M 0,180 Q 200,80 400,140 T 800,100 L 800,220 L 0,220 Z" fill="url(#gradDown)" />
       <path d="M 0,180 Q 200,80 400,140 T 800,100" fill="none" stroke="#22c55e" strokeWidth="2" />
       
       <path d="M 0,200 Q 200,160 400,180 T 800,150 L 800,220 L 0,220 Z" fill="url(#gradUp)" />
       <path d="M 0,200 Q 200,160 400,180 T 800,150" fill="none" stroke="#f59e0b" strokeWidth="2" />

       <line x1="0" y1="220" x2="800" y2="220" stroke="#1e2030" />
       {[0, 50, 100, 150, 200].map(y => (
          <text key={y} x="-30" y={220-y} fill="#475569" fontSize="10" fontFamily="monospace">{y}MB</text>
       ))}
    </svg>
  );
}

function DetailStat({ icon: Icon, label, val, color }: any) {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5 space-y-1">
       <div className="flex items-center gap-2 text-[#64748b]">
          <Icon size={14} style={{ color }} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
       </div>
       <div className="text-[24px] font-bold text-[#f8fafc] tabular-nums">{val}</div>
    </div>
  );
}

function BitcoinNodePage({ btcHeight }: { btcHeight: number }) {
  const [isOnline, setIsOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startNode = () => {
    setSyncing(true);
    let p = 0;
    const int = setInterval(() => {
       p += 1.5;
       if (p >= 99.9) {
          clearInterval(int);
          setProgress(100);
          setTimeout(() => {
             setIsOnline(true);
             setSyncing(false);
          }, 500);
       } else {
          setProgress(p);
       }
    }, 100);
  };

  if (!isOnline && !syncing) {
    return (
      <div className="space-y-6 animate-fade">
         <div className="bg-[#f97316]/5 border border-[#f97316]/20 rounded-xl p-8 flex flex-col items-center text-center max-w-[600px] mx-auto py-12">
            <div className="w-16 h-16 rounded-2xl bg-[#f97316]/10 flex items-center justify-center text-[#f97316] mb-6">
               <CircleDot size={32} />
            </div>
            <h2 className="text-[18px] font-bold text-[#f8fafc] mb-2">Bitcoin Node - Quick Setup</h2>
            <p className="text-[14px] text-[#94a3b8] mb-8 leading-relaxed">Start your own sovereign Bitcoin infrastructure and validate transactions natively in Orivon.</p>
            
            <div className="w-full space-y-4 mb-10 text-left">
               <SetupStep step={1} label="Module installed" complete />
               <SetupStep step={2} label="Download snapshot" desc="Pre-synced to block 840,000. Saves hours." active />
               <SetupStep step={3} label="Sync remaining blocks" desc="Only ~847 blocks remaining. Takes 4-8 mins." />
            </div>

            <button onClick={startNode} className="h-11 px-10 rounded-xl bg-[#f97316] text-white font-bold text-[14px] hover:bg-[#ea580c] transition-all border-none cursor-pointer">Start Bitcoin Node</button>
            <p className="text-[11px] text-[#475569] mt-4">Pruned node uses only 550 MB of storage</p>
         </div>
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="space-y-12 animate-fade py-20 flex flex-col items-center text-center max-w-[600px] mx-auto">
         <div className="text-[18px] font-bold text-[#f8fafc]">Syncing Bitcoin Blockchain</div>
         
         <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
               <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#1e2030]" />
               <motion.circle 
                 cx="80" cy="80" r="70" 
                 stroke="#f97316" strokeWidth="8" 
                 fill="transparent" 
                 strokeDasharray="440"
                 animate={{ strokeDashoffset: 440 - (440 * progress) / 100 }}
                 strokeLinecap="round"
               />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[#f8fafc] tabular-nums">
               {progress.toFixed(1)}%
            </div>
         </div>

         <div className="space-y-2">
            <div className="text-[15px] font-bold text-[#f8fafc]">Block 840,000 → 840,847</div>
            <div className="text-[13px] text-[#64748b]">Downloading {847 - Math.floor(847 * progress / 100)} remaining blocks...</div>
            <div className="text-[13px] text-[#64748b]">Estimated: 4 minutes remaining</div>
         </div>

         <div className="w-full bg-[#0a0b11] rounded-lg p-4 font-mono text-[11px] text-[#f97316] text-left h-32 overflow-hidden border border-[#1e2030]">
            <div>Connecting to peers...</div>
            <div>Peer found: 68.183.90.88:8333</div>
            <div>Downloading headers... (840001/840847)</div>
            {progress > 20 && <div>Downloading block 840,123...</div>}
            {progress > 50 && <div>Verifying transactions...</div>}
            {progress > 80 && <div>Mempool sync initialized...</div>}
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade">
       <div className="bg-[#f97316]/5 border border-[#f97316]/20 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-2.5 rounded-full bg-[#f97316] animate-pulse" />
             <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#f8fafc]">Bitcoin Node Online</span>
                <span className="text-[12px] text-[#64748b]">Pruned Node · Quick Sync Active</span>
             </div>
          </div>
          <button onClick={() => setIsOnline(false)} className="h-8 px-4 rounded-lg border border-[#ef4444]/40 text-[#ef4444] text-[12px] font-bold hover:bg-[#ef4444]/10 transition-all cursor-pointer bg-transparent">Stop Node</button>
       </div>

       <div className="grid grid-cols-4 gap-4">
          <DetailStat icon={CircleDot} label="Block Height" val={btcHeight.toLocaleString()} color="#f97316" />
          <DetailStat icon={Users} label="Connections" val="8 peers" color="#6366f1" />
          <DetailStat icon={Activity} label="Mempool" val="14,847 txs" color="#22c55e" />
          <DetailStat icon={Check} label="Sync Status" val="99.94%" color="#06b6d4" />
       </div>

       <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#1e2030] flex justify-between items-center">
             <h3 className="text-[14px] font-bold text-[#f8fafc]">Mempool Fee Estimates</h3>
             <Badge className="bg-[#22c55e]/10 text-[#22c55e]">14,847 transactions</Badge>
          </div>
          <div className="divide-y divide-[#1e2030]">
             <MempoolRow label="Fast" fee="42 sat/vB" time="~10 minutes" color="bg-[#22c55e]" />
             <MempoolRow label="Standard" fee="28 sat/vB" time="~30 minutes" color="bg-[#f59e0b]" />
             <MempoolRow label="Economy" fee="12 sat/vB" time="~90 minutes" color="bg-[#475569]" />
          </div>
       </div>

       <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#1e2030]"><h3 className="text-[14px] font-bold text-[#f8fafc]">Recent Blocks</h3></div>
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="h-10 border-b border-[#1e2030] text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                   <th className="pl-6">Height</th>
                   <th>Hash</th>
                   <th>Time</th>
                   <th>Txs</th>
                   <th>Size</th>
                   <th className="pr-6 text-right">Miner</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-[#1e2030]">
                {[
                   {h: 840847, ha: '00000000000000000002...', t: '2m ago', tx: '2,847', s: '1.4 MB', m: 'Foundry USA'},
                   {h: 840846, ha: '00000000000000000004...', t: '14m ago', tx: '3,102', s: '1.6 MB', m: 'Antpool'},
                   {h: 840845, ha: '00000000000000000001...', t: '25m ago', tx: '2,450', s: '1.2 MB', m: 'F2Pool'},
                   {h: 840844, ha: '00000000000000000007...', t: '32m ago', tx: '3,211', s: '1.7 MB', m: 'ViaBTC'},
                ].map(b => (
                   <tr key={b.h} className="h-12 hover:bg-[#161720] transition-colors cursor-pointer tabular text-[13px]">
                      <td className="pl-6 font-bold text-[#f8fafc]">{b.h}</td>
                      <td className="font-mono text-[#64748b]">{b.ha}</td>
                      <td className="text-[#94a3b8]">{b.t}</td>
                      <td className="text-[#f8fafc]">{b.tx}</td>
                      <td className="text-[#94a3b8]">{b.s}</td>
                      <td className="pr-6 text-right text-[#6366f1] font-medium">{b.m}</td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}

function MempoolRow({ label, fee, time, color }: any) {
  return (
    <div className="h-14 flex items-center px-6 gap-6 group hover:bg-[#161720] transition-colors relative">
       <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r ${color}`} />
       <div className="w-24 font-bold text-[#f8fafc] text-[13px]">{label}</div>
       <div className="flex-1 font-mono text-[14px] font-bold text-[#f8fafc]">{fee}</div>
       <div className="text-[12px] text-[#64748b] font-medium">{time}</div>
    </div>
  );
}

function SetupStep({ step, label, desc, complete, active }: any) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border ${active ? 'border-[#f97316]/30 bg-[#f97316]/5' : 'border-transparent'}`}>
       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${complete ? 'bg-[#22c55e]/10 text-[#22c55e]' : active ? 'bg-[#f97316] text-white' : 'bg-[#1e2030] text-[#475569]'}`}>
          {complete ? <Check size={16} /> : <span className="text-[14px] font-bold">{step}</span>}
       </div>
       <div className="flex flex-col">
          <span className={`text-[14px] font-bold ${complete ? 'text-[#22c55e]' : active ? 'text-[#f8fafc]' : 'text-[#475569]'}`}>{label}</span>
          {desc && <span className="text-[12px] text-[#64748b]">{desc}</span>}
       </div>
    </div>
  );
}

function LogsPage() {
  return (
    <div className="space-y-6 animate-fade">
       <div className="flex justify-between items-center border-b border-[#1e2030] pb-4">
          <div className="flex gap-4">
             {['All', 'IPFS', 'Bitcoin', 'System'].map(t => (
                <button key={t} className={`h-8 px-4 rounded-lg text-[13px] font-bold transition-all border-none cursor-pointer ${t === 'All' ? 'bg-[#111218] text-[#f8fafc]' : 'text-[#64748b] hover:text-[#94a3b8]'}`}>{t}</button>
             ))}
          </div>
          <div className="flex gap-2">
             <button className="h-8 px-4 rounded-lg border border-[#1e2030] text-[#64748b] text-[12px] font-bold hover:text-[#f8fafc] bg-transparent cursor-pointer flex items-center gap-2"><ArrowDown size={12} /> Download Logs</button>
          </div>
       </div>
       <div className="bg-[#0a0b11] rounded-xl p-6 font-mono text-[12px] h-[500px] overflow-y-auto custom-scrollbar space-y-2">
          <LogLine src="SYS" msg="Orivon Nodes Controller v1.0 starting..." color="text-[#a855f7]" />
          <LogLine src="IPFS" msg="Swarm listening on /ip4/0.0.0.0/tcp/4001" color="text-[#06b6d4]" />
          <LogLine src="BTC" msg="Bitcoin Core v27.0.0 starting" color="text-[#f97316]" />
          <LogLine src="IPFS" msg="Peer discovery: QmNno..." color="text-[#06b6d4]" />
          <LogLine src="SYS" msg="Background worker health check: OK" color="text-[#a855f7]" />
          <LogLine src="BTC" msg="UpdateTip: new best=000000000000000...  height=840847" color="text-[#f97316]" />
       </div>
    </div>
  );
}

function LogLine({ src, msg, color }: any) {
  return (
    <div className="flex gap-4 items-start py-0.5">
       <span className="text-[#475569] shrink-0">[{new Date().toLocaleTimeString('en-GB', {hour12:false})}]</span>
       <span className={`w-12 shrink-0 font-bold ${color} text-center`}>{src}</span>
       <span className="text-[#22c55e]">{msg}</span>
    </div>
  );
}

function NodeSettingsPage({ setView }: { setView: (v: NodeView) => void }) {
  const { navigateTab, activeTabId } = useTabsStore();

  return (
    <div className="space-y-8 animate-fade">
       <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden divide-y divide-[#1e2030]">
          <div className="p-6 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#f8fafc]">Auto-start Nodes</span>
                <span className="text-[12px] text-[#64748b]">Automatically start nodes when the browser launches.</span>
             </div>
             <Toggle active={false} />
          </div>
          <div className="p-6 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#f8fafc]">Max Peers (Global)</span>
                <span className="text-[12px] text-[#64748b]">Maximum number of simultaneous P2P connections.</span>
             </div>
             <input type="number" defaultValue="200" className="bg-[#161720] border border-[#1e2030] rounded-lg h-9 px-3 text-[13px] text-[#f8fafc] w-20 text-center" />
          </div>
       </div>
       <div className="text-center">
          <button 
            onClick={() => navigateTab(activeTabId, SETTINGS_URL, SETTINGS_URL, 'https')}
            className="text-[12px] font-bold text-[#6366f1] bg-transparent border-none cursor-pointer hover:text-[#818cf8]"
          >
            Open Full Settings in Orivon →
          </button>
       </div>
    </div>
  );
}

function Toggle({ active }: { active: boolean }) {
  const { accentColor } = useSettings();
  return (
    <div className={`w-10 h-[22px] rounded-full relative transition-all duration-200 cursor-pointer ${active ? '' : 'bg-[#2d2e45]'}`} style={active ? { backgroundColor: accentColor } : {}}>
      <div className={`absolute top-0.5 bottom-0.5 w-[18px] bg-white rounded-full transition-all duration-200 ${active ? 'left-[20px]' : 'left-0.5'}`} />
    </div>
  );
}

function Badge({ children, className }: any) {
  return <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${className}`}>{children}</span>;
}
