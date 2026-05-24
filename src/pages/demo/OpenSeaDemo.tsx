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
    <div className="h-full w-full bg-[#0a0b12] text-[#f1f5f9] font-inter overflow-y-auto scrollbar-thin relative pb-20">
      <IPFSBanner url="opensea.eth" score="Partial" message="Some centralized components" />

      {/* Navbar */}
      <nav className="h-16 px-8 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#0a0b12]/80 backdrop-blur-md z-10">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-[#2081e2] rounded-full flex items-center justify-center font-black text-white text-xl">S</div>
               <span className="font-black text-lg tracking-tight">OpenSea</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] font-black uppercase tracking-wider text-gray-400">
               <span className="text-white">Drops</span>
               <span className="hover:text-white transition-colors cursor-pointer">Stats</span>
               <span className="hover:text-white transition-colors cursor-pointer">Create</span>
            </div>
         </div>

         <div className="flex-1 max-w-[400px] mx-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5563]" size={16} />
            <input 
               placeholder="Search items, collections, and accounts"
               className="w-full h-10 rounded-xl bg-white/5 border border-white/10 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#6366f1] transition-all"
            />
         </div>

         <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            Orivon Wallet Connected
         </div>
      </nav>

      <div className="max-w-[1200px] mx-auto p-8">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black tracking-tight">Marketplace</h1>
            <div className="flex items-center gap-2 bg-[#13141f] border border-[#2d2e45] rounded-xl p-1">
               <button className="p-2 rounded-lg bg-white/5 text-white border-none cursor-pointer"><Grid size={18}/></button>
               <button className="p-2 rounded-lg text-gray-500 border-none cursor-pointer hover:text-white"><List size={18}/></button>
            </div>
         </div>

         <div className="grid grid-cols-4 gap-6">
            {nfts.map(nft => (
               <motion.div 
                 key={nft.id} 
                 whileHover={{ y: -4 }}
                 className="bg-[#13141f] border border-[#2d2e45] rounded-[24px] overflow-hidden shadow-xl group cursor-pointer"
               >
                  <div className="aspect-square relative">
                     <div className="absolute inset-0 transition-opacity opacity-20 group-hover:opacity-40" style={{ backgroundColor: nft.color }} />
                     <img src={nft.img} className="w-full h-full object-cover p-12" alt={nft.name} />
                     <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart size={16} />
                     </div>
                     {nft.owned && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#22c55e] text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                           <Check size={10} strokeWidth={4} /> In Your Wallet
                        </div>
                     )}
                  </div>
                  <div className="p-5">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                           <span className="text-[14px] font-black text-white">{nft.name}</span>
                           <span className="text-[11px] font-bold text-[#4b5563] uppercase tracking-wider">Orivon Collection</span>
                        </div>
                        <ExternalLink size={14} className="text-[#4b5563]" />
                     </div>
                     <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest">Floor Price</span>
                           <span className="text-sm font-black text-white">{nft.floor}</span>
                        </div>
                        <button className="bg-[#6366f1] text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all border-none cursor-pointer shadow-lg shadow-indigo-500/10">
                           Details
                        </button>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      <DemoWatermark />
    </div>
  );
}
