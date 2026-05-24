import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, Cpu, Activity, Globe, Box, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, HardDrive, Check
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
    <div className="h-full w-full bg-[#0a0b12] text-[#f1f5f9] font-inter overflow-y-auto scrollbar-thin relative pb-20">
      <IPFSBanner url="btcnode.eth" score="Trustless" message="Powered by Orivon Modules | No download required" />

      {/* Node Header */}
      <div className="bg-[#13141f]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-10 px-8 h-16 flex items-center justify-between">
         <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-wider">
            <div className="flex items-center gap-2 text-[#f97316]">
               <Zap size={16} fill="currentColor" /> Bitcoin Node
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
               Status: <span className="text-white">Syncing</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div>
               Block Height: <span className="text-white font-mono">{blockHeight.toLocaleString()} / 840,847</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div>
               Peers: <span className="text-white">{peers} connected</span>
            </div>
         </div>
         <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#22c55e]">
            Sync: 99.94%
         </div>
      </div>

      <div className="max-w-[1100px] mx-auto p-8 grid grid-cols-12 gap-8">
         {/* Main Node Card */}
         <div className="col-span-8 bg-gradient-to-br from-[#13141f] to-[#1a1b2e] border border-[#2d2e45] rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#f97316]" />
            <div className="flex justify-between items-start mb-10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[24px] bg-[#f97316] flex items-center justify-center text-white shadow-2xl shadow-orange-500/20">
                     <span className="text-3xl font-black italic">B</span>
                  </div>
                  <div className="flex flex-col">
                     <h2 className="text-2xl font-black tracking-tight">Bitcoin Core Node</h2>
                     <span className="text-sm font-bold text-[#4b5563] uppercase tracking-[0.2em]">v27.0.0 · Mainnet</span>
                  </div>
               </div>
               <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  Active Process
               </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-10">
               {[
                 { label: 'Uptime', val: '2h 34m' },
                 { label: 'Chain', val: 'Mainnet' },
                 { label: 'Pruned', val: 'Yes (550MB)' },
                 { label: 'Version', val: 'v27.0.0' },
                 { label: 'Network', val: 'Bitcoin' },
                 { label: 'Protocol', val: 'v70016' },
               ].map(stat => (
                 <div key={stat.label} className="bg-white/2 rounded-2xl p-4 border border-white/5">
                    <span className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest block mb-1">{stat.label}</span>
                    <span className="text-sm font-bold text-white">{stat.val}</span>
                 </div>
               ))}
            </div>

            <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                     <Cpu size={20} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-white uppercase tracking-tight">Running natively in Orivon Browser</span>
                     <span className="text-xs font-medium text-gray-500">Optimized for low-resource desktop environments</span>
                  </div>
               </div>
               <div className="flex items-center gap-2 text-[#22c55e] text-xs font-black uppercase tracking-widest">
                  <Check size={16} strokeWidth={4} /> No download required
               </div>
            </div>
         </div>

         {/* Mempool & Stats */}
         <div className="col-span-4 space-y-8">
            <div className="bg-[#13141f] border border-[#2d2e45] rounded-[32px] p-6 shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                  <Activity size={20} className="text-[#f97316]" />
                  <h3 className="font-black text-sm uppercase tracking-widest">Mempool Stats</h3>
               </div>
               <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                     <span className="text-xs font-bold text-[#4b5563] uppercase">Transactions</span>
                     <span className="text-xl font-black">14,847</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                     <span className="text-xs font-bold text-[#4b5563] uppercase">Memory Size</span>
                     <span className="text-xl font-black">127 MB</span>
                  </div>
                  <div className="space-y-3 pt-2">
                     <span className="text-[10px] font-black text-[#4b5563] uppercase tracking-[0.2em] block mb-3">Fee Estimates</span>
                     {[
                       { label: 'Fast (10 min)', val: '42 sat/vB', color: '#f87171' },
                       { label: 'Normal (1 hr)', val: '28 sat/vB', color: '#f59e0b' },
                       { label: 'Economy (1 day)', val: '12 sat/vB', color: '#22c55e' }
                     ].map(fee => (
                       <div key={fee.label} className="flex justify-between items-center text-xs font-bold">
                          <span className="text-gray-400">{fee.label}</span>
                          <span style={{ color: fee.color }}>{fee.val}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="bg-[#13141f] border border-[#2d2e45] rounded-[32px] p-6 shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                  <HardDrive size={20} className="text-indigo-400" />
                  <h3 className="font-black text-sm uppercase tracking-widest">Sync Progress</h3>
               </div>
               <div className="relative h-2 bg-white/5 rounded-full mb-4 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: '99.94%' }} transition={{ duration: 2 }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
               </div>
               <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                  Nodes on Orivon use pre-synced snapshots to enable near-instant activation without GBs of downloads.
               </p>
            </div>
         </div>

         {/* Peers Table */}
         <div className="col-span-12 bg-[#13141f] border border-[#2d2e45] rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Globe size={20} className="text-[#06b6d4]" />
                  <h3 className="font-black text-sm uppercase tracking-widest">Connected Peers</h3>
               </div>
               <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">8 Inbound · 0 Outbound</span>
            </div>
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest border-b border-white/5">
                     <th className="px-8 py-4">Address</th>
                     <th className="px-8 py-4">Version</th>
                     <th className="px-8 py-4">Ping</th>
                     <th className="px-8 py-4">Block Height</th>
                     <th className="px-8 py-4 text-right">Activity</th>
                  </tr>
               </thead>
               <tbody className="text-xs font-bold divide-y divide-white/2">
                  {[
                    { ip: '142.93.18.24', ver: '/Satoshi:26.0.0/', ping: '42ms', block: '840,847', activity: 'Inbound' },
                    { ip: '51.15.112.98', ver: '/Satoshi:25.1.0/', ping: '89ms', block: '840,847', activity: 'Inbound' },
                    { ip: '185.193.15.5', ver: '/Satoshi:27.0.0/', ping: '12ms', block: '840,846', activity: 'Inbound' },
                    { ip: '104.248.62.2', ver: '/Satoshi:26.0.0/', ping: '114ms', block: '840,847', activity: 'Inbound' },
                    { ip: '34.219.1.205', ver: '/Satoshi:24.0.1/', ping: '56ms', block: '840,847', activity: 'Inbound' },
                  ].map((peer, i) => (
                    <tr key={i} className="hover:bg-white/2 transition-colors">
                       <td className="px-8 py-4 font-mono text-gray-300">{peer.ip}</td>
                       <td className="px-8 py-4 text-[#4b5563]">{peer.ver}</td>
                       <td className="px-8 py-4">{peer.ping}</td>
                       <td className="px-8 py-4 text-white font-mono">{peer.block}</td>
                       <td className="px-8 py-4 text-right">
                          <span className="bg-[#22c55e]/10 text-[#22c55e] px-2 py-0.5 rounded-md text-[9px] uppercase tracking-tighter">Active</span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Blocks */}
         <div className="col-span-12 bg-[#13141f] border border-[#2d2e45] rounded-[32px] p-8 shadow-2xl">
            <h3 className="font-black text-sm uppercase tracking-widest mb-8">Recent Blocks</h3>
            <div className="space-y-4">
               {[
                 { h: 840847, hash: '00000000000000000001f3b...', time: '2 min ago', tx: 2847 },
                 { h: 840846, hash: '00000000000000000002e1c...', time: '12 min ago', tx: 3102 },
                 { h: 840845, hash: '00000000000000000000a4d...', time: '23 min ago', tx: 2956 }
               ].map(b => (
                 <div key={b.h} className="bg-white/2 border border-white/5 rounded-2xl p-5 flex justify-between items-center group hover:border-[#f97316]/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-xl bg-[#1a1b26] border border-white/5 flex items-center justify-center font-black text-[#f97316]">#</div>
                       <div className="flex flex-col">
                          <span className="text-lg font-black tracking-tight">Block {b.h}</span>
                          <span className="text-[10px] font-mono text-[#4b5563] uppercase tracking-widest">{b.hash}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-12">
                       <div className="flex flex-col text-right">
                          <span className="text-sm font-bold">{b.tx.toLocaleString()} TXs</span>
                          <span className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest">{b.time}</span>
                       </div>
                       <ChevronRight className="text-[#4b5563] group-hover:text-[#f97316] transition-colors" />
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
