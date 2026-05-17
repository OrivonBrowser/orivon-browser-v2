import { useState } from 'react';
import { motion } from 'motion/react';
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
  Hash
} from 'lucide-react';

interface DashboardProps {
  onLaunch: (url: string) => void;
}

export default function Dashboard({ onLaunch }: DashboardProps) {
  const [url, setUrl] = useState('');
  const [nodes, setNodes] = useState({
    btc: true,
    ipfs: true
  });

  const handleLaunch = () => {
    if (url.trim()) {
      onLaunch(url.trim());
    }
  };

  const handleAppClick = (appUrl: string) => {
    setUrl(appUrl);
    onLaunch(appUrl);
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden grid-bg">
      {/* Top Navigation */}
      <header className="nav-blur h-16 px-12 flex items-center justify-between z-30">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 bg-white flex items-center justify-center rounded-[1px]">
               <span className="text-black font-black text-[10px]">O</span>
             </div>
             <div className="text-[12px] font-bold tracking-[0.2em] uppercase">Orivon Shell</div>
          </div>
          <div className="h-4 w-[1px] bg-orivon-border"></div>
          <div className="flex items-center gap-3 text-[9px] font-mono font-bold text-orivon-muted uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orivon-accent animate-pulse"></span>
              Live: 2.4ms
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-0.5">
            <div className="text-[8px] text-orivon-muted uppercase font-bold tracking-[0.2em] font-mono">Net Assets</div>
            <div className="text-sm font-bold font-mono tracking-tighter">0.00000000 <span className="text-orivon-muted">USD</span></div>
          </div>
          <div className="h-8 w-[1px] bg-orivon-border"></div>
          <div className="flex items-center gap-3 border border-orivon-border px-4 py-2 hover:border-white transition-all cursor-pointer bg-white/5">
            <div className="text-[10px] font-bold uppercase tracking-widest">Secure_Layer_v1</div>
            <User size={14} className="text-white" />
          </div>
        </div>
      </header>

      {/* Main Command Center */}
      <main className="flex-1 p-12 lg:p-20 grid grid-cols-12 gap-12 overflow-y-auto">
        
        {/* Left Column: Systems */}
        <section className="col-span-12 lg:col-span-3 space-y-10">
          <div className="space-y-6">
             <div className="text-[10px] font-mono font-bold text-orivon-muted uppercase tracking-[0.3em] flex items-center gap-3">
               <Hash size={12} />
               Active Modules
             </div>
             
             <div className="space-y-2">
                <button 
                  onClick={() => setNodes(p => ({ ...p, btc: !p.btc }))}
                  className={`w-full group web3-card p-4 flex items-center justify-between ${nodes.btc ? 'border-white/20' : 'opacity-40'}`}
                >
                  <div className="flex items-center gap-4">
                    <Zap size={14} className={nodes.btc ? 'text-orivon-accent' : 'text-orivon-muted'} />
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-widest">Bitcoin Node</div>
                      <div className="text-[8px] font-mono text-orivon-muted tracking-tighter">842,912 BLOCKS</div>
                    </div>
                  </div>
                  <Circle size={10} className={nodes.btc ? 'fill-orivon-accent text-orivon-accent' : 'text-orivon-muted'} />
                </button>

                <button 
                  onClick={() => setNodes(p => ({ ...p, ipfs: !p.ipfs }))}
                  className={`w-full group web3-card p-4 flex items-center justify-between ${nodes.ipfs ? 'border-white/20' : 'opacity-40'}`}
                >
                  <div className="flex items-center gap-4">
                    <Globe size={14} className={nodes.ipfs ? 'text-orivon-blue' : 'text-orivon-muted'} />
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-widest">IPFS_PEER</div>
                      <div className="text-[8px] font-mono text-orivon-muted tracking-tighter">64 CONNECTIONS</div>
                    </div>
                  </div>
                  <Circle size={10} className={nodes.ipfs ? 'fill-orivon-blue text-orivon-blue' : 'text-orivon-muted'} />
                </button>
             </div>
          </div>

          <div className="web3-card p-6 bg-black/40 space-y-4">
            <ShieldCheck size={20} className="text-orivon-accent" />
            <div className="text-[10px] font-bold uppercase tracking-widest">Isolated Runtime</div>
            <p className="text-[10px] text-orivon-muted font-mono leading-relaxed">
              Execution environment #XJ-92. All script modules are statically analyzed before kernel injection.
            </p>
          </div>
        </section>

        {/* Center/Right Space: Command Dashboard */}
        <section className="col-span-12 lg:col-span-9 space-y-12">
          
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter text-white">Navigate System</h2>
              <div className="h-[2px] w-12 bg-orivon-accent"></div>
            </div>

            <div className="relative group max-w-3xl">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-orivon-muted group-focus-within:text-white transition-colors">
                <Search size={24} />
              </div>
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
                placeholder="Enter protocol address or .eth endpoint"
                className="w-full h-20 bg-black border border-orivon-border px-16 text-xl font-mono text-white placeholder:text-orivon-muted focus:outline-none focus:border-white transition-all shadow-2xl"
              />
              <button 
                onClick={handleLaunch}
                className="absolute right-4 top-1/2 -translate-y-1/2 btn-primary !py-4 px-8"
              >
                Launch
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
               <div 
                onClick={() => handleAppClick('uniswap.eth')}
                className="web3-card p-6 border-white/5 hover:border-white/40 cursor-pointer group space-y-8"
               >
                 <div className="w-10 h-10 border border-orivon-border flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                   <div className="text-[10px] font-black uppercase">UN</div>
                 </div>
                 <div className="space-y-2">
                   <div className="text-xs font-bold uppercase tracking-widest">Uniswap.eth</div>
                   <div className="flex items-center gap-2 text-[9px] font-mono text-orivon-muted uppercase">
                      <LinkIcon size={10} />
                      DEX_PRT_V3
                   </div>
                 </div>
               </div>

               {[
                { name: 'Lens.id', id: 'LS' },
                { name: 'Aave.eth', id: 'AV' },
                { name: 'Curve.fi', id: 'CV' }
               ].map(app => (
                 <div key={app.name} className="web3-card p-6 border-white/5 opacity-40 grayscale group space-y-8 cursor-not-allowed">
                   <div className="w-10 h-10 border border-orivon-border flex items-center justify-center">
                     <div className="text-[10px] font-black uppercase text-orivon-muted">{app.id}</div>
                   </div>
                   <div className="space-y-2">
                     <div className="text-xs font-bold uppercase tracking-widest text-orivon-muted">{app.name}</div>
                     <div className="text-[9px] font-mono text-orivon-muted uppercase italic">Module Offline</div>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-orivon-border">
             <div className="flex gap-6">
                <Network size={20} className="text-orivon-muted" />
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em]">P2P_ROUTING</div>
                  <p className="text-[10px] text-orivon-muted font-mono leading-relaxed">
                    Global Distributed Hash Table resolution active. Skipping centralized lookup layers.
                  </p>
                </div>
             </div>
             <div className="flex gap-6">
                <LayoutGrid size={20} className="text-orivon-muted" />
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em]">WASM_SANDBOX</div>
                  <p className="text-[10px] text-orivon-muted font-mono leading-relaxed">
                    WebAssembly kernel 0.94-B. Low-level execution context for trustless modules.
                  </p>
                </div>
             </div>
          </div>
        </section>

      </main>
    </div>
  );
}
