import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, Cpu, Activity, Globe, Box, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, HardDrive, Check,
  Database, Share2, Circle
} from 'lucide-react';
import { DemoWatermark, IPFSBanner } from './DemoComponents';

export default function BitcoinNodeDemo() {
  const [blockHeight, setBlockHeight] = useState(840291);
  const [peers, setPeers] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight(prev => prev + Math.floor(Math.random() * 2));
      if (Math.random() > 0.8) setPeers(p => Math.max(5, Math.min(12, p + (Math.random() > 0.5 ? 1 : -1))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full bg-[#0d0e14] text-[#f8fafc] font-inter overflow-y-auto scrollbar-thin relative pb-20 animate-fade">
      <IPFSBanner url="btcnode.eth" score="Trustless" message="Powered by Orivon Modules | No download required" />

      {/* Node Header */}
      <div className="bg-[#111218] border-b border-[#1e2030] sticky top-0 z-10 px-8 h-16 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2 text-[#f97316]">
               <Zap size={14} fill="currentColor" /> Bitcoin Node
            </div>
            <div className="w-px h-3 bg-[#1e2030]" />
            <div className="flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-[#f59e0b]" />
               <span className="text-[#64748b]">Status:</span> <span className="text-[#f8fafc]">Syncing</span>
            </div>
            <div className="w-px h-3 bg-[#1e2030]" />
            <div>
               <span className="text-[#64748b]">Block:</span> <span className="text-[#f8fafc] mono tabular">{blockHeight.toLocaleString()} / 840,847</span>
            </div>
            <div className="w-px h-3 bg-[#1e2030]" />
            <div>
               <span className="text-[#64748b]">Peers:</span> <span className="text-[#f8fafc] tabular">{peers}</span>
            </div>
         </div>
         <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#22c55e] tabular">
            Sync: 99.94%
         </div>
      </div>

      <div className="max-w-[1100px] mx-auto p-8 grid grid-cols-12 gap-8">
         {/* Main Node Card */}
         <div className="col-span-8 bg-[#111218] border border-[#1e2030] rounded-xl p-8 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-10">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-lg bg-[#f97316] flex items-center justify-center text-white shadow-sm">
                     <span className="text-2xl font-bold italic">B</span>
                  </div>
                  <div className="flex flex-col">
                     <h2 className="text-xl font-semibold tracking-tight text-[#f8fafc]">Bitcoin Core Node</h2>
                     <span className="text-[11px] font-medium text-[#64748b] uppercase tracking-[0.15em]">v27.0.0 · Mainnet</span>
                  </div>
               </div>
               <div className="text-[#22c55e] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#22c55e]" />
                  Active Process
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
               {[
                 { label: 'Uptime', val: '2h 34m' },
                 { label: 'Chain', val: 'Mainnet' },
                 { label: 'Pruned', val: 'Yes (550MB)' },
                 { label: 'Version', val: 'v27.0.0' },
                 { label: 'Network', val: 'Bitcoin' },
                 { label: 'Protocol', val: 'v70016' },
               ].map(stat => (
                 <div key={stat.label} className="bg-[#161720] rounded-lg p-4 border border-[#1e2030]">
                    <span className="text-label block mb-1">{stat.label}</span>
                    <span className="text-[13px] font-semibold text-[#f8fafc] tabular">{stat.val}</span>
                 </div>
               ))}
            </div>

            <div className="p-5 bg-[#0d0e14] border border-[#1e2030] rounded-xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[#111218] border border-[#1e2030] flex items-center justify-center text-[#6366f1]">
                     <Cpu size={18} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[13px] font-semibold text-[#f8fafc]">Running natively in Orivon Browser</span>
                     <span className="text-[11px] font-medium text-[#64748b]">Zero-install decentralized infrastructure</span>
                  </div>
               </div>
               <div className="flex items-center gap-2 text-[#22c55e] text-[11px] font-bold uppercase tracking-wider">
                  <Check size={14} strokeWidth={4} /> Native Module
               </div>
            </div>
         </div>

         {/* Mempool & Stats */}
         <div className="col-span-4 space-y-6">
            <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <Activity size={18} className="text-[#f97316]" />
                  <h3 className="text-[13px] font-semibold uppercase tracking-widest text-[#f8fafc]">Mempool Stats</h3>
               </div>
               <div className="space-y-6 tabular">
                  <div className="flex justify-between items-end border-b border-[#1e2030] pb-4">
                     <span className="text-label">Transactions</span>
                     <span className="text-lg font-bold">14,847</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-[#1e2030] pb-4">
                     <span className="text-label">Memory Size</span>
                     <span className="text-lg font-bold">127 MB</span>
                  </div>
                  <div className="space-y-3 pt-2">
                     <span className="text-label block mb-3 text-[#475569]">Fee Estimates</span>
                     {[
                       { label: 'Fast (10m)', val: '42 sat/vB', color: '#ef4444' },
                       { label: 'Normal (1h)', val: '28 sat/vB', color: '#f59e0b' },
                       { label: 'Economy (1d)', val: '12 sat/vB', color: '#22c55e' }
                     ].map(fee => (
                       <div key={fee.label} className="flex justify-between items-center text-[12px] font-medium">
                          <span className="text-[#64748b]">{fee.label}</span>
                          <span style={{ color: fee.color }}>{fee.val}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <HardDrive size={18} className="text-[#6366f1]" />
                  <h3 className="text-[13px] font-semibold uppercase tracking-widest text-[#f8fafc]">Sync Progress</h3>
               </div>
               <div className="relative h-1.5 bg-[#161720] rounded-full mb-4 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: '99.94%' }} transition={{ duration: 2 }}
                    className="absolute top-0 left-0 h-full bg-[#6366f1]"
                  />
               </div>
               <p className="text-[11px] font-medium text-[#64748b] leading-relaxed">
                  Orivon uses pre-synced snapshots to enable near-instant activation without GBs of downloads.
               </p>
            </div>
         </div>

         {/* Peers Table */}
         <div className="col-span-12 bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#1e2030] flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Globe size={18} className="text-[#06b6d4]" />
                  <h3 className="text-[13px] font-semibold uppercase tracking-widest text-[#f8fafc]">Connected Peers</h3>
               </div>
               <span className="text-label text-[#475569]">8 Inbound · 0 Outbound</span>
            </div>
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="text-[10px] font-bold text-[#475569] uppercase tracking-widest border-b border-[#1e2030]">
                     <th className="px-8 py-3">Address</th>
                     <th className="px-8 py-3">Version</th>
                     <th className="px-8 py-3">Ping</th>
                     <th className="px-8 py-3">Block Height</th>
                     <th className="px-8 py-3 text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="text-[12px] font-medium tabular mono divide-y divide-[#1e2030]/50">
                  {[
                    { ip: '142.93.18.24', ver: '/Satoshi:26.0.0/', ping: '42ms', block: '840,847', activity: 'Inbound' },
                    { ip: '51.15.112.98', ver: '/Satoshi:25.1.0/', ping: '89ms', block: '840,847', activity: 'Inbound' },
                    { ip: '185.193.15.5', ver: '/Satoshi:27.0.0/', ping: '12ms', block: '840,846', activity: 'Inbound' },
                    { ip: '104.248.62.2', ver: '/Satoshi:26.0.0/', ping: '114ms', block: '840,847', activity: 'Inbound' },
                    { ip: '34.219.1.205', ver: '/Satoshi:24.0.1/', ping: '56ms', block: '840,847', activity: 'Inbound' },
                  ].map((peer, i) => (
                    <tr key={i} className="hover:bg-[#161720]/50 transition-colors">
                       <td className="px-8 py-3.5 text-[#94a3b8]">{peer.ip}</td>
                       <td className="px-8 py-3.5 text-[#475569]">{peer.ver}</td>
                       <td className="px-8 py-3.5 text-[#64748b]">{peer.ping}</td>
                       <td className="px-8 py-3.5 text-[#f8fafc]">{peer.block}</td>
                       <td className="px-8 py-3.5 text-right">
                          <span className="text-[#22c55e] text-[10px] font-bold uppercase tracking-tighter">Active</span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Blocks */}
         <div className="col-span-12 bg-[#111218] border border-[#1e2030] rounded-xl p-8 shadow-sm">
            <h3 className="text-[13px] font-semibold uppercase tracking-widest mb-8 text-[#f8fafc]">Recent Blocks</h3>
            <div className="space-y-1">
               {[
                 { h: 840847, hash: '00000000000000000001f3b...', time: '2m ago', tx: 2847 },
                 { h: 840846, hash: '00000000000000000002e1c...', time: '12m ago', tx: 3102 },
                 { h: 840845, hash: '00000000000000000000a4d...', time: '23m ago', tx: 2956 }
               ].map(b => (
                 <div key={b.h} className="p-4 rounded-lg flex justify-between items-center group hover:bg-[#161720] transition-all cursor-pointer border border-transparent hover:border-[#1e2030]">
                    <div className="flex items-center gap-6">
                       <div className="w-10 h-10 rounded-lg bg-[#0d0e14] border border-[#1e2030] flex items-center justify-center font-bold text-[#f97316]">#</div>
                       <div className="flex flex-col tabular mono">
                          <span className="text-[15px] font-semibold text-[#f8fafc]">Block {b.h}</span>
                          <span className="text-[10px] text-[#475569] uppercase tracking-wider">{b.hash}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-12 tabular">
                       <div className="flex flex-col text-right">
                          <span className="text-[13px] font-semibold text-[#f8fafc]">{b.tx.toLocaleString()} TXs</span>
                          <span className="text-[10px] font-medium text-[#475569] uppercase tracking-widest">{b.time}</span>
                       </div>
                       <ChevronRight className="text-[#475569] group-hover:text-[#f8fafc] transition-colors" size={16} />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <DemoWatermark />
    </div>
  );
}
