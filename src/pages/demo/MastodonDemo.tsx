import React, { useState } from 'react';
import { 
  Home, Hash, Bell, User, MessageCircle, 
  Repeat, Heart, Share, MoreHorizontal, Check, Search
} from 'lucide-react';
import { DEMO_WALLET } from '../../constants';
import { DemoWatermark, IPFSBanner } from './DemoComponents';

export default function MastodonDemo() {
  const posts = [
    {
      user: 'vitalik.eth',
      handle: '@vitalik.eth',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vitalik',
      content: 'The future of the web is decentralized. Excited to see projects like Orivon making Web3 actually accessible to everyone. This is how we get to mass adoption.',
      stats: { likes: '2.4k', retweets: '891', replies: '234' },
      time: '2 hours ago'
    },
    {
      user: 'web3builder.eth',
      handle: '@web3builder.eth',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=builder',
      content: 'Just opened Orivon browser for the first time. Typed mastodon.eth in the URL bar and it just... worked. No MetaMask, no extension, nothing. This changes everything.',
      stats: { likes: '847', retweets: '312', replies: '89' },
      time: '4 hours ago'
    },
    {
      user: 'defi_degen.eth',
      handle: '@defi_degen.eth',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=degen',
      content: 'Been using Orivon for a week now. The Web3 Score system alone is worth switching. Finally know which sites are actually trustless and which are just pretending.',
      stats: { likes: '1.2k', retweets: '445', replies: '167' },
      time: '6 hours ago'
    },
    {
      user: 'cryptonative.eth',
      handle: '@cryptonative.eth',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=native',
      content: 'Running a Bitcoin pruned node directly in my browser right now. No download, no setup. Just clicked Start in the Orivon dashboard. The future is here.',
      stats: { likes: '3.1k', retweets: '1.2k', replies: '445' },
      time: '8 hours ago'
    }
  ];

  return (
    <div className="h-full w-full bg-[#0a0b12] text-[#f1f5f9] font-inter overflow-hidden flex flex-col relative">
      <IPFSBanner url="mastodon.eth" score="Trustless" />

      <div className="flex-1 flex max-w-[1200px] mx-auto w-full overflow-hidden">
        {/* Left Column */}
        <aside className="w-[280px] border-r border-white/5 py-6 px-4 flex flex-col justify-between shrink-0">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-[#6366f1] rounded-xl flex items-center justify-center font-black text-white text-xl mb-8">M</div>
            {[
              { icon: <Home size={22}/>, label: 'Home', active: true },
              { icon: <Hash size={22}/>, label: 'Explore' },
              { icon: <Bell size={22}/>, label: 'Notifications' },
              { icon: <User size={22}/>, label: 'Profile' }
            ].map(item => (
              <div key={item.label} className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${item.active ? 'bg-white/5 text-[#6366f1]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                 {item.icon}
                 <span className="font-black text-sm uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#13141f] border border-[#2d2e45] rounded-2xl p-4 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#6366f1] flex items-center justify-center font-black text-white text-sm">O</div>
             <div className="flex flex-col min-w-0">
                <span className="font-bold text-white text-sm truncate">Orivon Wallet 1</span>
                <span className="text-[10px] text-[#4b5563] font-mono truncate">{DEMO_WALLET.address.slice(0, 10)}...</span>
             </div>
          </div>
        </aside>

        {/* Center Column */}
        <main className="flex-1 border-r border-white/5 flex flex-col overflow-y-auto scrollbar-thin">
           <div className="h-16 flex items-center px-6 border-b border-white/5 sticky top-0 bg-[#0a0b12]/80 backdrop-blur-md z-10">
              <h2 className="font-black text-lg uppercase tracking-wider">Home Feed</h2>
           </div>

           <div className="p-6 border-b border-white/5 bg-white/2">
              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#6366f1] flex items-center justify-center font-black text-white">O</div>
                 <div className="flex-1">
                    <textarea 
                      placeholder="Share something with the decentralized web..."
                      className="w-full bg-transparent border-none outline-none text-white text-lg font-medium resize-none min-h-[100px] placeholder:text-[#4b5563]"
                    />
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                       <div className="flex gap-4 text-[#6366f1]">
                          <Share size={20} />
                          <Hash size={20} />
                       </div>
                       <button className="bg-[#6366f1] text-white px-6 py-2 rounded-xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all border-none cursor-pointer shadow-lg shadow-indigo-500/20">
                          Post
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="divide-y divide-white/5">
              {posts.map((post, i) => (
                <div key={i} className="p-6 hover:bg-white/2 transition-colors cursor-pointer group">
                   <div className="flex gap-4">
                      <img src={post.avatar} className="w-12 h-12 rounded-full bg-[#13141f] border border-white/10" alt={post.user} />
                      <div className="flex-1">
                         <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                               <span className="font-black text-white hover:underline">{post.user}</span>
                               <span className="text-[#4b5563] text-sm font-bold">{post.handle}</span>
                               <span className="text-[#4b5563] text-xs font-bold">· {post.time}</span>
                            </div>
                            <MoreHorizontal size={16} className="text-[#4b5563] opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <p className="text-[#f1f5f9] leading-relaxed mb-4 text-[15px] font-medium">{post.content}</p>
                         <div className="flex gap-10 text-[#4b5563]">
                            <div className="flex items-center gap-2 hover:text-[#6366f1] transition-colors"><MessageCircle size={18}/> <span className="text-xs font-bold">{post.stats.replies}</span></div>
                            <div className="flex items-center gap-2 hover:text-[#22c55e] transition-colors"><Repeat size={18}/> <span className="text-xs font-bold">{post.stats.retweets}</span></div>
                            <div className="flex items-center gap-2 hover:text-[#ff007a] transition-colors"><Heart size={18}/> <span className="text-xs font-bold">{post.stats.likes}</span></div>
                            <div className="flex items-center gap-2 hover:text-white transition-colors"><Share size={18}/></div>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </main>

        {/* Right Column */}
        <aside className="w-[320px] py-6 px-6 space-y-6 hidden lg:flex flex-col shrink-0 overflow-y-auto scrollbar-none">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5563]" size={18} />
              <input 
                placeholder="Search decentralized web"
                className="w-full h-12 rounded-2xl bg-[#13141f] border border-[#2d2e45] pl-12 pr-4 text-sm font-bold outline-none focus:border-[#6366f1] transition-all"
              />
           </div>

           <div className="bg-gradient-to-br from-[#1a1b2e] to-[#13141f] border border-[#6366f1]/20 rounded-[24px] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1]/10 blur-3xl rounded-full" />
              <div className="flex items-center gap-2 text-[10px] font-black text-[#6366f1] uppercase tracking-[0.2em] mb-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
                 Browsing via IPFS
              </div>
              <p className="text-sm font-black text-white leading-relaxed mb-4">
                 This social platform runs entirely on decentralized infrastructure. No central server. No censorship.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                 <span className="text-[11px] font-black uppercase text-[#4b5563]">Web3 Score</span>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span className="text-[11px] font-black text-[#22c55e] uppercase tracking-widest">TRUSTLESS</span>
                 </div>
              </div>
           </div>

           <div className="bg-[#13141f] border border-[#2d2e45] rounded-[24px] p-6 space-y-4 shadow-xl">
              <h3 className="font-black text-sm uppercase tracking-wider">Suggested for you</h3>
              {[
                { name: 'Orivon App Store', handle: '@apps.eth', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=apps' },
                { name: 'Uniswap Protocol', handle: '@uniswap.eth', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=uni' },
              ].map(item => (
                <div key={item.handle} className="flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                      <img src={item.avatar} className="w-10 h-10 rounded-full bg-black/20" alt={item.name} />
                      <div className="flex flex-col min-w-0">
                         <span className="font-bold text-white text-xs truncate group-hover:underline">{item.name}</span>
                         <span className="text-[10px] text-[#4b5563] font-bold">{item.handle}</span>
                      </div>
                   </div>
                   <button className="bg-white text-black px-4 py-1.5 rounded-full font-black text-[10px] uppercase hover:bg-[#e6e7e8] transition-colors border-none cursor-pointer">Follow</button>
                </div>
              ))}
           </div>
        </aside>
      </div>

      <DemoWatermark />
    </div>
  );
}
