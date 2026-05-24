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
      time: '2h ago',
      color: '#627eea'
    },
    {
      user: 'web3builder.eth',
      handle: '@web3builder.eth',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=builder',
      content: 'Just opened Orivon browser for the first time. Typed mastodon.eth in the URL bar and it just... worked. No MetaMask, no extension, nothing. This changes everything.',
      stats: { likes: '847', retweets: '312', replies: '89' },
      time: '4h ago',
      color: '#22c55e'
    },
    {
      user: 'defi_degen.eth',
      handle: '@defi_degen.eth',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=degen',
      content: 'Been using Orivon for a week now. The Web3 Score system alone is worth switching. Finally know which sites are actually trustless and which are just pretending.',
      stats: { likes: '1.2k', retweets: '445', replies: '167' },
      time: '6h ago',
      color: '#ff007a'
    },
    {
      user: 'cryptonative.eth',
      handle: '@cryptonative.eth',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=native',
      content: 'Running a Bitcoin pruned node directly in my browser right now. No download, no setup. Just clicked Start in the Orivon dashboard. The future is here.',
      stats: { likes: '3.1k', retweets: '1.2k', replies: '445' },
      time: '8h ago',
      color: '#f59e0b'
    }
  ];

  return (
    <div className="h-full w-full bg-[#0d0e14] text-[#f8fafc] font-inter overflow-hidden flex flex-col relative animate-fade">
      <IPFSBanner url="mastodon.eth" score="Trustless" />

      <div className="flex-1 flex max-w-[1200px] mx-auto w-full overflow-hidden px-8">
        {/* Left Column */}
        <aside className="w-[240px] border-r border-[#1e2030] py-8 pr-6 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center font-bold text-white text-lg mb-10">M</div>
            {[
              { icon: <Home size={20}/>, label: 'Home', active: true },
              { icon: <Hash size={20}/>, label: 'Explore' },
              { icon: <Bell size={20}/>, label: 'Notifications' },
              { icon: <User size={20}/>, label: 'Profile' }
            ].map(item => (
              <div key={item.label} className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all ${item.active ? 'bg-[#161720] text-[#f8fafc]' : 'text-[#64748b] hover:text-[#f8fafc]'}`}>
                 {item.icon}
                 <span className="font-semibold text-[13px] uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pl-2">
             <div className="w-9 h-9 rounded-lg bg-[#1e2030] flex items-center justify-center font-bold text-[#f8fafc] text-sm">O</div>
             <div className="flex flex-col min-w-0">
                <span className="font-semibold text-[#f8fafc] text-[13px] truncate">Orivon Wallet 1</span>
                <span className="text-[11px] text-[#475569] mono truncate tabular">{DEMO_WALLET.address.slice(0, 10)}...</span>
             </div>
          </div>
        </aside>

        {/* Center Column */}
        <main className="flex-1 border-r border-[#1e2030] flex flex-col overflow-y-auto scrollbar-thin">
           <div className="h-16 flex items-center px-6 border-b border-[#1e2030] sticky top-0 bg-[#0d0e14]/80 backdrop-blur-md z-10">
              <h2 className="text-[14px] font-semibold uppercase tracking-widest text-[#f8fafc]">Home Feed</h2>
           </div>

           <div className="p-6 border-b border-[#1e2030]">
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-lg bg-[#1e2030] flex items-center justify-center font-bold text-[#64748b]">O</div>
                 <div className="flex-1">
                    <textarea 
                      placeholder="Share something with the decentralized web..."
                      className="w-full bg-transparent border-none outline-none text-[#f8fafc] text-[16px] font-medium resize-none min-h-[80px] placeholder:text-[#475569]"
                    />
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#1e2030]">
                       <div className="flex gap-4 text-[#64748b]">
                          <Share size={18} className="hover:text-[#6366f1] transition-colors cursor-pointer" />
                          <Hash size={18} className="hover:text-[#6366f1] transition-colors cursor-pointer" />
                       </div>
                       <button className="bg-[#6366f1] text-white px-6 h-9 rounded-lg font-bold text-[13px] uppercase tracking-wider hover:bg-[#4f46e5] transition-all border-none cursor-pointer">
                          Post
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           <div>
              {posts.map((post, i) => (
                <div key={i} className="p-6 border-b border-[#1e2030] hover:bg-[#111218]/50 transition-colors cursor-pointer group">
                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0" style={{ backgroundColor: post.color }}>
                         {post.user.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                               <span className="font-semibold text-[#f8fafc] hover:underline text-[14px]">{post.user}</span>
                               <span className="text-[#475569] text-[13px]">{post.handle}</span>
                               <span className="text-[#475569] text-[12px] tabular">· {post.time}</span>
                            </div>
                            <MoreHorizontal size={16} className="text-[#475569] opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <p className="text-[#94a3b8] leading-relaxed mb-4 text-[14px] font-medium">{post.content}</p>
                         <div className="flex gap-10 text-[#475569]">
                            <div className="flex items-center gap-2 hover:text-[#6366f1] transition-colors tabular"><MessageCircle size={16}/> <span className="text-[12px] font-medium">{post.stats.replies}</span></div>
                            <div className="flex items-center gap-2 hover:text-[#22c55e] transition-colors tabular"><Repeat size={16}/> <span className="text-[12px] font-medium">{post.stats.retweets}</span></div>
                            <div className="flex items-center gap-2 hover:text-[#ef4444] transition-colors tabular"><Heart size={16}/> <span className="text-[12px] font-medium">{post.stats.likes}</span></div>
                            <div className="flex items-center gap-2 hover:text-[#f8fafc] transition-colors"><Share size={16}/></div>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </main>

        {/* Right Column */}
        <aside className="w-[300px] py-8 pl-6 space-y-8 hidden lg:flex flex-col shrink-0 overflow-y-auto scrollbar-none">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#6366f1] transition-colors" size={16} />
              <input 
                placeholder="Search decentralized web"
                className="w-full h-10 rounded-lg bg-[#111218] border border-[#1e2030] pl-11 pr-4 text-[13px] font-medium outline-none focus:border-[#6366f1] transition-all"
              />
           </div>

           <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 text-label text-[#6366f1] mb-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                 Browsing via IPFS
              </div>
              <p className="text-[13px] font-medium text-[#f8fafc] leading-relaxed mb-6">
                 This social platform runs entirely on decentralized infrastructure. No central server. No censorship.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-[#1e2030]">
                 <span className="text-label text-[#475569]">Web3 Score</span>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                    <span className="text-[11px] font-bold text-[#22c55e] uppercase tracking-wider">TRUSTLESS</span>
                 </div>
              </div>
           </div>

           <div className="space-y-5">
              <h3 className="text-label text-[#64748b]">Suggested for you</h3>
              {[
                { name: 'Orivon App Store', handle: '@apps.eth', color: '#6366f1' },
                { name: 'Uniswap Protocol', handle: '@uniswap.eth', color: '#ff007a' },
              ].map(item => (
                <div key={item.handle} className="flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: item.color }}>{item.name.charAt(0)}</div>
                      <div className="flex flex-col min-w-0">
                         <span className="font-semibold text-[#f8fafc] text-[13px] truncate group-hover:underline">{item.name}</span>
                         <span className="text-[11px] text-[#475569] font-medium">{item.handle}</span>
                      </div>
                   </div>
                   <button className="bg-[#f8fafc] text-[#0d0e14] px-3.5 py-1.5 rounded-lg font-bold text-[11px] uppercase hover:bg-[#e6e7e8] transition-colors border-none cursor-pointer">Follow</button>
                </div>
              ))}
           </div>
        </aside>
      </div>

      <DemoWatermark />
    </div>
  );
}
