import React, { useState } from 'react';
import { 
  Search, Grid, Layout, List, Filter, 
  ExternalLink, Check, Heart
} from 'lucide-react';
import { motion } from 'motion/react';
import { DEMO_WALLET } from '../../constants';
import { DemoWatermark, IPFSBanner } from './DemoComponents';

export default function OpenSeaDemo() {
  const nfts = [
    { id: 1, name: 'Bored Ape #4821', floor: '14.2 ETH', img: 'https://api.dicebear.com/7.x/identicon/svg?seed=ape4821', color: '#6366f1', owned: true },
    { id: 2, name: 'CryptoPunk #7804', floor: '62 ETH', img: 'https://api.dicebear.com/7.x/identicon/svg?seed=punk7804', color: '#06b6d4', owned: false },
    { id: 3, name: 'Azuki #1923', floor: '8.4 ETH', img: 'https://api.dicebear.com/7.x/identicon/svg?seed=azuki1923', color: '#ff007a', owned: true },
    { id: 4, name: 'Doodle #312', floor: '3.1 ETH', img: 'https://api.dicebear.com/7.x/identicon/svg?seed=doodle312', color: '#f59e0b', owned: false },
    { id: 5, name: 'CloneX #881', floor: '2.4 ETH', img: 'https://api.dicebear.com/7.x/identicon/svg?seed=clone881', color: '#22c55e', owned: true },
    { id: 6, name: 'Pudgy Penguin #11', floor: '11.5 ETH', img: 'https://api.dicebear.com/7.x/identicon/svg?seed=pudgy11', color: '#2081e2', owned: false },
  ];

  return (
    <div className="h-full w-full bg-[#0d0e14] text-[#f8fafc] font-inter overflow-y-auto scrollbar-thin relative pb-20 animate-fade">
      <IPFSBanner url="opensea.eth" score="Partial" message="Some centralized components" />

      {/* Navbar */}
      <nav className="h-16 px-8 flex items-center justify-between border-b border-[#1e2030] sticky top-0 bg-[#0d0e14]/80 backdrop-blur-md z-10">
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-[#2081e2] rounded-lg flex items-center justify-center font-bold text-white text-xl">S</div>
               <span className="font-bold text-lg tracking-tight">OpenSea</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold uppercase tracking-wider text-[#64748b]">
               <span className="text-[#f8fafc]">Drops</span>
               <span className="hover:text-[#f8fafc] transition-colors cursor-pointer">Stats</span>
               <span className="hover:text-[#f8fafc] transition-colors cursor-pointer">Create</span>
            </div>
         </div>

         <div className="flex-1 max-w-[420px] mx-10 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#6366f1] transition-colors" size={16} />
            <input 
               placeholder="Search items, collections, and accounts"
               className="w-full h-10 rounded-lg bg-[#111218] border border-[#1e2030] pl-11 pr-4 text-[13px] font-medium outline-none focus:border-[#6366f1] transition-all"
            />
         </div>

         <div className="flex items-center gap-2 transition-all cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-[12px] font-semibold text-[#94a3b8]">Connected 0x71C7...976F</span>
         </div>
      </nav>

      <div className="max-w-[1200px] mx-auto p-8 pt-12">
         <div className="flex justify-between items-center mb-10">
            <h1 className="text-[20px] font-semibold tracking-tight text-[#f8fafc]">Marketplace</h1>
            <div className="flex items-center gap-1 bg-[#111218] border border-[#1e2030] rounded-lg p-1">
               <button className="p-1.5 rounded-md bg-[#1e2030] text-[#f8fafc] border-none cursor-pointer"><Grid size={16}/></button>
               <button className="p-1.5 rounded-md text-[#64748b] border-none cursor-pointer hover:text-[#f8fafc]"><List size={16}/></button>
            </div>
         </div>

         <div className="grid grid-cols-4 gap-6">
            {nfts.map(nft => (
               <div 
                 key={nft.id} 
                 className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden shadow-sm group cursor-pointer transition-all hover:border-[#1e2030]/80"
               >
                  <div className="aspect-square relative bg-[#0d0e14] overflow-hidden">
                     <img src={nft.img} className="w-full h-full object-cover p-12 transition-transform duration-500 group-hover:scale-105" alt={nft.name} />
                     <div className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart size={14} />
                     </div>
                     {nft.owned && (
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                           <Check size={10} strokeWidth={4} /> In Your Wallet
                        </div>
                     )}
                  </div>
                  <div className="p-4">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col min-w-0">
                           <span className="text-[14px] font-semibold text-[#f8fafc] truncate">{nft.name}</span>
                           <span className="text-[11px] font-medium text-[#475569] uppercase tracking-wider">Orivon Collection</span>
                        </div>
                        <ExternalLink size={12} className="text-[#475569] shrink-0" />
                     </div>
                     <div className="flex justify-between items-end tabular">
                        <div className="flex flex-col">
                           <span className="text-label mb-0.5 text-[#475569]">Floor Price</span>
                           <span className="text-[14px] font-bold text-[#f8fafc]">{nft.floor}</span>
                        </div>
                        <button className="bg-[#161720] border border-[#1e2030] text-[#94a3b8] px-3.5 py-1.5 rounded-lg font-semibold text-[11px] uppercase tracking-wider hover:bg-[#1e2030] hover:text-[#f8fafc] transition-all border-none cursor-pointer">
                           Details
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <DemoWatermark />
    </div>
  );
}
