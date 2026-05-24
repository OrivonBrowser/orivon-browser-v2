import React, { useState, useEffect } from 'react';
import { 
  Zap, Activity, Globe, HardDrive, 
  Terminal, Server, Signal, Settings, Database
} from 'lucide-react';
import { DemoWatermark, IPFSBanner } from './DemoComponents';

export default function BitcoinNodeDemo() {
  const [blockHeight, setBlockHeight] = useState(840291);
  const [peers, setPeers] = useState(8);
  const [logs, setLogs] = useState([
    { ts: '14:20:01', msg: 'New block accepted: 00000000000000000001f3b...', level: 'success' },
    { ts: '14:20:04', msg: 'Synchronizing with peer 142.93.18.24', level: 'info' },
    { ts: '14:20:12', msg: 'Mempool updated: +142 new transactions', level: 'info' },
    { ts: '14:20:15', msg: 'Network difficulty check: OK', level: 'info' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight(prev => prev + Math.floor(Math.random() * 2));
      if (Math.random() > 0.8) setPeers(p => Math.max(5, Math.min(12, p + (Math.random() > 0.5 ? 1 : -1))));
      
      const newLog = {
        ts: new Date().toTimeString().split(' ')[0],
        msg: Math.random() > 0.5 ? 'Peer connected: ' + Math.floor(Math.random() * 255) + '.x.x.x' : 'Block ' + (blockHeight + 1) + ' verification complete',
        level: 'info'
      };
      setLogs(prev => [newLog, ...prev.slice(0, 5)]);
    }, 5000);
    return () => clearInterval(interval);
  }, [blockHeight]);

  return (
    <div className="h-full w-full bg-[#0d0e14] text-[#f8fafc] font-inter overflow-y-auto scrollbar-thin relative pb-20 animate-fade">
      <IPFSBanner url="btcnode.eth" score="Trustless" message="Native Orivon Module | Running Zero-Install Infrastructure" />

      {/* Modern sticky subheader */}
      <div className="bg-[#111218]/80 backdrop-blur-xl border-b border-[#1e2030]/50 sticky top-0 z-20 px-8 h-14 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[#f97316] text-[12px] font-black uppercase tracking-widest">
               <Zap size={14} fill="currentColor" /> BTC Node
            </div>
            <div className="h-4 w-px bg-[#1e2030]" />
            <div className="flex items-center gap-4 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-[#f8fafc]">Online</span>
               </div>
               <div className="flex items-center gap-2">
                  <Signal size={12} />
                  <span>Peers: <span className="text-[#f8fafc] tabular">{peers}</span></span>
               </div>
               <div className="flex items-center gap-2">
                  <Database size={12} />
                  <span>Height: <span className="text-[#f8fafc] tabular">{blockHeight.toLocaleString()}</span></span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-[#1e2030] text-[10px] font-bold text-[#94a3b8] uppercase tracking-tighter tabular">
               CPU: 2.4% · MEM: 128MB
            </div>
            <button className="p-1.5 hover:bg-[#1e2030] rounded-lg text-[#64748b] transition-all">
               <Settings size={16} />
            </button>
         </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-8">
         <div className="grid grid-cols-12 gap-6 mb-8">
            {/* Hero Node Status */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
               <div className="bg-[#111218] border border-[#1e2030] rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Zap size={240} />
                  </div>
                  
                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-12">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center text-white shadow-lg shadow-[#f97316]/20">
                              <span className="text-3xl font-black italic tracking-tighter">B</span>
                           </div>
                           <div className="flex flex-col">
                              <h2 className="text-[22px] font-bold tracking-tight text-[#f8fafc] mb-1">Bitcoin Core Runtime</h2>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-[#1e2030]">Native Module</span>
                                 <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-widest">Mainnet v27.0.0</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className="text-[28px] font-bold text-[#f8fafc] tabular tracking-tighter">99.94%</div>
                           <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Synchronization</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-4 gap-4">
                        {[
                          { label: 'Network', val: 'Bitcoin', icon: <Globe size={14}/> },
                          { label: 'Uptime', val: '2h 34m', icon: <Activity size={14}/> },
                          { label: 'Storage', val: '550.2 MB', icon: <HardDrive size={14}/> },
                          { label: 'Mempool', val: '14,847 TX', icon: <Server size={14}/> },
                        ].map(s => (
                          <div key={s.label} className="bg-[#0d0e14] border border-[#1e2030] rounded-xl p-4 hover:border-[#6366f1]/30 transition-all group">
                             <div className="flex items-center gap-2 text-[#64748b] mb-2 group-hover:text-[#6366f1] transition-colors">
                                {s.icon}
                                <span className="text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
                             </div>
                             <span className="text-[15px] font-bold text-[#f8fafc] tabular tracking-tight">{s.val}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Activity / Logs Section */}
               <div className="bg-[#111218] border border-[#1e2030] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-[#6366f1]" />
                        <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#f8fafc]">Node Activity</h3>
                     </div>
                     <button className="text-[10px] font-bold text-[#6366f1] uppercase tracking-widest hover:text-[#818cf8] transition-colors">View full logs</button>
                  </div>
                  <div className="space-y-3 font-mono text-[12px] bg-[#0d0e14] border border-[#1e2030] rounded-xl p-4">
                     {logs.map((log, i) => (
                       <div key={i} className="flex gap-4 group">
                          <span className="text-[#475569] shrink-0">{log.ts}</span>
                          <span className={log.level === 'success' ? 'text-[#22c55e]' : 'text-[#94a3b8]'}>{log.msg}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
               <div className="bg-[#111218] border border-[#1e2030] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                     <Activity size={18} className="text-[#f59e0b]" />
                     <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#f8fafc]">Fee Estimates</h3>
                  </div>
                  <div className="space-y-5">
                     {[
                       { label: 'Priority', val: '42 sat/vB', color: '#ef4444', desc: '~10 minutes' },
                       { label: 'Standard', val: '28 sat/vB', color: '#f59e0b', desc: '~60 minutes' },
                       { label: 'Economic', val: '12 sat/vB', color: '#22c55e', desc: '~24 hours' }
                     ].map(fee => (
                       <div key={fee.label} className="flex justify-between items-center group cursor-default">
                          <div className="flex flex-col">
                             <span className="text-[13px] font-bold text-[#f8fafc] mb-0.5">{fee.label}</span>
                             <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">{fee.desc}</span>
                          </div>
                          <div className="text-right">
                             <div className="text-[14px] font-bold tabular mb-0.5" style={{ color: fee.color }}>{fee.val}</div>
                             <div className="w-full h-1 bg-[#1e2030] rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ backgroundColor: fee.color, width: '40%' }} />
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="bg-[#111218] border border-[#1e2030] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                     <HardDrive size={18} className="text-[#6366f1]" />
                     <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#f8fafc]">Snapshot Sync</h3>
                  </div>
                  <div className="bg-[#0d0e14] border border-[#1e2030] rounded-xl p-5 mb-6 text-center">
                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-t-[#6366f1] border-r-[#6366f1] border-b-[#1e2030] border-l-[#1e2030] animate-spin mb-4" />
                     <div className="text-[20px] font-bold text-[#f8fafc] mb-1 tabular">99.94%</div>
                     <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Finalizing Index</div>
                  </div>
                  <p className="text-[11px] font-medium text-[#64748b] leading-relaxed italic px-2">
                     * Orivon uses trustless snapshots to avoid full IBD downloads while maintaining verification integrity.
                  </p>
               </div>
            </div>
         </div>

         {/* Peers Table Redesign */}
         <div className="bg-[#111218] border border-[#1e2030] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#1e2030] flex justify-between items-center bg-[#161720]/30">
               <div className="flex items-center gap-3">
                  <Globe size={18} className="text-[#06b6d4]" />
                  <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#f8fafc]">Network Topology</h3>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Inbound</span>
                     <span className="text-[12px] font-bold text-[#22c55e] tabular">{peers}</span>
                  </div>
                  <div className="w-px h-3 bg-[#1e2030] my-auto" />
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Outbound</span>
                     <span className="text-[12px] font-bold text-[#475569] tabular">0</span>
                  </div>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] border-b border-[#1e2030]">
                        <th className="px-8 py-4">Peer Address</th>
                        <th className="px-8 py-4">Client Version</th>
                        <th className="px-8 py-4">Latency</th>
                        <th className="px-8 py-4">Height</th>
                        <th className="px-8 py-4 text-right">Activity</th>
                     </tr>
                  </thead>
                  <tbody className="text-[12px] font-medium divide-y divide-[#1e2030]/30 font-mono">
                     {[
                       { ip: '142.93.18.24', ver: 'Satoshi/26.0.0', ping: '42ms', block: '840,847', score: 98 },
                       { ip: '51.15.112.98', ver: 'Satoshi/25.1.0', ping: '89ms', block: '840,847', score: 92 },
                       { ip: '185.193.15.5', ver: 'Satoshi/27.0.0', ping: '12ms', block: '840,846', score: 100 },
                       { ip: '104.248.62.2', ver: 'Satoshi/26.0.0', ping: '114ms', block: '840,847', score: 85 },
                       { ip: '34.219.1.205', ver: 'Satoshi/24.0.1', ping: '56ms', block: '840,847', score: 78 },
                     ].map((peer, i) => (
                       <tr key={i} className="hover:bg-[#161720]/50 transition-colors group">
                          <td className="px-8 py-4 text-[#f8fafc] group-hover:text-[#6366f1] transition-colors">{peer.ip}</td>
                          <td className="px-8 py-4 text-[#64748b]">{peer.ver}</td>
                          <td className="px-8 py-4 tabular text-[#94a3b8]">{peer.ping}</td>
                          <td className="px-8 py-4 tabular text-[#f8fafc]">{peer.block}</td>
                          <td className="px-8 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1 bg-[#1e2030] rounded-full overflow-hidden">
                                   <div className="h-full bg-[#22c55e]" style={{ width: `${peer.score}%` }} />
                                </div>
                                <span className="text-[#22c55e] text-[10px] font-black uppercase tracking-widest">OK</span>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      <DemoWatermark />
    </div>
  );
}
