import React, { useState, useEffect } from 'react';
import { 
  User, Palette, Globe, Shield, Wallet, Search, Server, 
  Bell, Keyboard, Download, Info, ExternalLink, HelpCircle, 
  MessageSquare, ChevronDown, Check, ShieldCheck, Activity, Plus,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../store/settings';
import { useWalletStore } from '../store/wallet';

type SettingsCategory = 'Profile' | 'Appearance' | 'Browser' | 'Privacy' | 'Wallet' | 'Search' | 'Nodes' | 'Notifications' | 'Shortcuts' | 'Downloads' | 'About';

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('Profile');
  const { accentColor, setAccentColor } = useSettings();

  return (
    <div className="flex h-full w-full bg-[#0d0e14] text-[#f8fafc] font-inter overflow-hidden">
      {/* Settings Sidebar */}
      <aside className="w-[240px] h-full bg-[#0a0b11] border-r border-[#1e2030] flex flex-col shrink-0">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold tracking-[0.1em] text-[#f8fafc]">ORIVON</span>
            <span className="text-[13px] font-medium text-[#64748b]">Settings</span>
          </div>
        </div>
        
        <div className="h-px bg-[#1e2030] mx-6 mb-4" />

        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 custom-scrollbar">
          <SidebarItem icon={User} label="Profile" active={activeCategory === 'Profile'} onClick={() => setActiveCategory('Profile')} />
          <SidebarItem icon={Palette} label="Appearance" active={activeCategory === 'Appearance'} onClick={() => setActiveCategory('Appearance')} />
          <SidebarItem icon={Globe} label="Browser" active={activeCategory === 'Browser'} onClick={() => setActiveCategory('Browser')} />
          <SidebarItem icon={Shield} label="Privacy and Security" active={activeCategory === 'Privacy'} onClick={() => setActiveCategory('Privacy')} />
          <SidebarItem icon={Wallet} label="Wallet and Web3" active={activeCategory === 'Wallet'} onClick={() => setActiveCategory('Wallet')} />
          <SidebarItem icon={Search} label="Search Engine" active={activeCategory === 'Search'} onClick={() => setActiveCategory('Search')} />
          <SidebarItem icon={Server} label="Nodes" active={activeCategory === 'Nodes'} onClick={() => setActiveCategory('Nodes')} />
          <SidebarItem icon={Bell} label="Notifications" active={activeCategory === 'Notifications'} onClick={() => setActiveCategory('Notifications')} />
          <SidebarItem icon={Keyboard} label="Shortcuts" active={activeCategory === 'Shortcuts'} onClick={() => setActiveCategory('Shortcuts')} />
          <SidebarItem icon={Download} label="Downloads" active={activeCategory === 'Downloads'} onClick={() => setActiveCategory('Downloads')} />
          <SidebarItem icon={Info} label="About Orivon" active={activeCategory === 'About'} onClick={() => setActiveCategory('About')} />

          <div className="h-px bg-[#1e2030] mx-3 my-4" />
          
          <SidebarItem icon={ExternalLink} label="Release Notes" secondary />
          <SidebarItem icon={HelpCircle} label="Help and Support" secondary />
          <SidebarItem icon={MessageSquare} label="Send Feedback" secondary />
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-[52px] border-b border-[#1e2030] px-8 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h1 className="text-[20px] font-semibold text-[#f8fafc]">{activeCategory}</h1>
            <p className="text-[12px] text-[#64748b]">{getSubtitle(activeCategory)}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[720px] mx-auto space-y-8 pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {renderCategoryContent(activeCategory, accentColor, setAccentColor)}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick, secondary }: any) {
  const { accentColor } = useSettings();
  
  return (
    <button
      onClick={onClick}
      className={`w-full h-[38px] px-4 flex items-center gap-3 rounded-lg transition-all border-none bg-transparent cursor-pointer group relative ${
        active ? 'bg-[#111218] text-[#f8fafc]' : secondary ? 'text-[#64748b] hover:text-[#94a3b8]' : 'text-[#64748b] hover:text-[#f8fafc] hover:bg-[#111218]'
      }`}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r" style={{ backgroundColor: accentColor }} />
      )}
      <Icon size={15} className={active ? 'text-[#f8fafc]' : 'group-hover:text-[#f8fafc] transition-colors'} style={active ? { color: accentColor } : {}} />
      <span className={`text-[13px] font-medium ${secondary ? 'text-[12px]' : ''}`}>{label}</span>
    </button>
  );
}

function getSubtitle(cat: SettingsCategory) {
  switch (cat) {
    case 'Profile': return 'Manage your identity and account preferences.';
    case 'Appearance': return 'Customize how Orivon looks and feels.';
    case 'Browser': return 'Configure core browser behavior.';
    case 'Privacy': return 'Control your privacy and protect your browsing.';
    case 'Wallet': return 'Configure your Web3 identity and browser capabilities.';
    case 'Search': return 'Configure your default search and Web3 discovery.';
    case 'Nodes': return 'Configure how Web3 nodes run in your browser.';
    case 'About': return 'Orivon Browser information and updates.';
    default: return '';
  }
}

function renderCategoryContent(cat: SettingsCategory, accentColor: string, setAccentColor: (c: string) => void) {
  switch (cat) {
    case 'Profile': return <ProfileSettings />;
    case 'Appearance': return <AppearanceSettings accentColor={accentColor} setAccentColor={setAccentColor} />;
    case 'Browser': return <BrowserSettings />;
    case 'Privacy': return <PrivacySettings />;
    case 'Wallet': return <WalletSettings />;
    case 'Search': return <SearchSettings />;
    case 'Nodes': return <NodesSettings />;
    case 'About': return <AboutSettings />;
    default: return <div className="py-20 text-center text-[#64748b]">Settings for {cat} coming soon.</div>;
  }
}

// --- Components ---

function SettingsCard({ title, children }: any) {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-[14px] font-semibold text-[#f8fafc] px-1">{title}</h3>}
      <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden divide-y divide-[#1e2030]">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ label, sub, children, onClick }: any) {
  return (
    <div 
      className={`h-[64px] px-5 flex items-center justify-between transition-colors ${onClick ? 'cursor-pointer hover:bg-[#161720]' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-[#f8fafc]">{label}</span>
        {sub && <span className="text-[12px] text-[#64748b] leading-tight mt-0.5">{sub}</span>}
      </div>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Toggle({ active, onToggle }: { active: boolean, onToggle?: () => void }) {
  const { accentColor } = useSettings();
  return (
    <div 
      onClick={onToggle}
      className={`w-10 h-[22px] rounded-full relative transition-all duration-200 cursor-pointer ${active ? '' : 'bg-[#2d2e45]'}`}
      style={active ? { backgroundColor: accentColor } : {}}
    >
      <div className={`absolute top-0.5 bottom-0.5 w-[18px] bg-white rounded-full shadow-sm transition-all duration-200 ${active ? 'left-[20px]' : 'left-0.5'}`} />
    </div>
  );
}

// --- Category Pages ---

function ProfileSettings() {
  const { accounts, activeAccountId } = useWalletStore();
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  return (
    <div className="space-y-8 animate-fade">
      <SettingsCard title="Account">
        <SettingsRow label="Display Name">
          <input type="text" defaultValue="Orivon User" className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#f8fafc] outline-none focus:border-[#6366f1] w-48 text-right" />
        </SettingsRow>
        <SettingsRow label="Primary Wallet">
          <select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#94a3b8] outline-none">
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name} ({acc.addresses.eth.slice(0,6)}...)</option>
            ))}
          </select>
        </SettingsRow>
        <SettingsRow label="ENS Name" sub="Link your ENS name to your Orivon identity.">
          <input type="text" placeholder="your-name.eth" className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#f8fafc] outline-none focus:border-[#6366f1] w-48 text-right" />
        </SettingsRow>
        <SettingsRow label="Avatar">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#6366f1] flex items-center justify-center font-bold text-white uppercase text-[14px]">O</div>
             <button className="h-[34px] px-4 rounded-lg border border-[#1e2030] text-[13px] text-[#94a3b8] hover:border-[#6366f1] hover:text-[#818cf8] transition-all bg-transparent cursor-pointer">Change</button>
          </div>
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="Data">
        <SettingsRow label="Export Browser Data" sub="Download your browsing history and settings.">
          <button className="h-[34px] px-4 rounded-lg border border-[#1e2030] text-[13px] text-[#94a3b8] hover:border-[#6366f1] hover:text-[#818cf8] transition-all bg-transparent cursor-pointer">Export</button>
        </SettingsRow>
        <SettingsRow label="Import Settings" sub="Restore from a previous backup.">
          <button className="h-[34px] px-4 rounded-lg border border-[#1e2030] text-[13px] text-[#94a3b8] hover:border-[#6366f1] hover:text-[#818cf8] transition-all bg-transparent cursor-pointer">Import</button>
        </SettingsRow>
        <SettingsRow label="Reset All Settings" sub="Restore Orivon to default settings. This cannot be undone.">
          <button className="h-[34px] px-4 rounded-lg border border-[#ef4444]/50 text-[13px] text-[#ef4444] hover:bg-[#ef4444]/10 transition-all bg-transparent cursor-pointer">Reset</button>
        </SettingsRow>
      </SettingsCard>
    </div>
  );
}

function AppearanceSettings({ accentColor, setAccentColor }: any) {
  const [fontSize, setFontSize] = useState('Medium');

  return (
    <div className="space-y-8 animate-fade">
      <SettingsCard title="Theme">
        <SettingsRow label="Color Theme">
          <div className="flex gap-3">
             <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-7 rounded border-2 border-[#6366f1] bg-[#0d0e14] flex items-center justify-center"><Check size={12} className="text-[#6366f1]" /></div>
                <span className="text-[10px] font-bold text-[#f8fafc]">Dark</span>
             </div>
             <div className="flex flex-col items-center gap-1.5 opacity-50">
                <div className="w-10 h-7 rounded border border-[#1e2030] bg-[#f8fafc]" />
                <span className="text-[10px] font-bold text-[#64748b]">Light</span>
                <span className="text-[8px] bg-[#161720] border border-[#1e2030] rounded-sm px-1 text-[#64748b]">SOON</span>
             </div>
             <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-7 rounded border border-[#1e2030] bg-gradient-to-br from-[#0d0e14] to-[#f8fafc]" />
                <span className="text-[10px] font-bold text-[#64748b]">System</span>
             </div>
          </div>
        </SettingsRow>
        <SettingsRow label="Accent Color">
          <div className="flex gap-2">
            {[
              { c: '#6366f1', n: 'Purple' },
              { c: '#3b82f6', n: 'Blue' },
              { c: '#22c55e', n: 'Green' },
              { c: '#f59e0b', n: 'Amber' },
              { c: '#ef4444', n: 'Red' },
              { c: '#06b6d4', n: 'Cyan' },
            ].map(color => (
              <button 
                key={color.c} 
                onClick={() => setAccentColor(color.c)}
                className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${accentColor === color.c ? 'scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: color.c, borderColor: accentColor === color.c ? '#fff' : 'transparent' }}
              />
            ))}
          </div>
        </SettingsRow>
        <SettingsRow label="Font Size">
          <div className="flex bg-[#161720] border border-[#1e2030] rounded-lg p-1">
             {['Small', 'Medium', 'Large'].map(s => (
               <button 
                 key={s} 
                 onClick={() => setFontSize(s)}
                 className={`h-7 px-4 rounded-md text-[12px] font-bold transition-all border-none cursor-pointer ${fontSize === s ? 'bg-[#2d2e45] text-[#f8fafc]' : 'text-[#64748b] hover:text-[#94a3b8]'}`}
               >
                 {s}
               </button>
             ))}
          </div>
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="Layout">
        <SettingsRow label="Show Bookmarks Bar"><Toggle active /></SettingsRow>
        <SettingsRow label="Show Tab Previews"><Toggle active /></SettingsRow>
        <SettingsRow label="Compact Mode" sub="Reduce spacing for more content density."><Toggle active={false} /></SettingsRow>
        <SettingsRow label="Show Dashboard on New Tab"><Toggle active /></SettingsRow>
      </SettingsCard>

      <SettingsCard title="Dashboard">
        <SettingsRow label="Default Dashboard View">
           <select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#94a3b8] outline-none"><option>Full Dashboard</option><option>Minimal</option><option>Custom</option></select>
        </SettingsRow>
        <SettingsRow label="Show Portfolio Chart"><Toggle active /></SettingsRow>
        <SettingsRow label="Show Web3 Activity Feed"><Toggle active /></SettingsRow>
        <SettingsRow label="Show Why Orivon Banner"><Toggle active /></SettingsRow>
      </SettingsCard>
    </div>
  );
}

function BrowserSettings() {
  return (
    <div className="space-y-8 animate-fade">
      <SettingsCard title="Startup">
        <SettingsRow label="On Startup">
           <div className="space-y-2 py-2">
              <Radio label="Open dashboard" checked />
              <Radio label="Continue where you left off" />
              <Radio label="Open a specific page" />
           </div>
        </SettingsRow>
        <SettingsRow label="Homepage">
           <input type="text" defaultValue="orivon://dashboard" className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#f8fafc] outline-none focus:border-[#6366f1] w-64 text-right" />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="Tabs">
        <SettingsRow label="Show Tab Close Button">
           <select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#94a3b8] outline-none"><option>Always</option><option selected>On Hover</option><option>Never</option></select>
        </SettingsRow>
        <SettingsRow label="Confirm Before Closing Multiple Tabs"><Toggle active /></SettingsRow>
        <SettingsRow label="Show Tab Audio Icon"><Toggle active /></SettingsRow>
        <SettingsRow label="Open Links in New Tab"><Toggle active /></SettingsRow>
      </SettingsCard>

      <SettingsCard title="Downloads">
        <SettingsRow label="Default Download Location">
           <div className="flex items-center gap-3">
              <span className="text-[12px] font-mono text-[#94a3b8]">~/Downloads</span>
              <button className="h-[30px] px-3 rounded-lg border border-[#1e2030] text-[12px] text-[#94a3b8] hover:border-[#6366f1] transition-all bg-transparent cursor-pointer">Change</button>
           </div>
        </SettingsRow>
        <SettingsRow label="Ask Where to Save Each File"><Toggle active={false} /></SettingsRow>
      </SettingsCard>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-8 animate-fade">
      <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
         <div className="h-[80px] px-6 flex items-center gap-5 bg-[#6366f1]/5">
            <div className="w-12 h-12 rounded-xl bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1]"><Shield size={24} /></div>
            <div className="flex-1">
               <div className="text-[14px] font-bold text-[#f8fafc]">Trackers Blocked</div>
               <div className="text-[12px] text-[#64748b]">Orivon has blocked trackers from tracking you.</div>
            </div>
            <div className="text-[22px] font-bold text-[#6366f1] tabular-nums">48,291,047</div>
         </div>
         <div className="divide-y divide-[#1e2030]">
            <SettingsRow label="Block Trackers and Ads"><Toggle active /></SettingsRow>
            <SettingsRow label="Block Fingerprinting"><Toggle active /></SettingsRow>
            <SettingsRow label="Block Phishing Sites"><Toggle active /></SettingsRow>
            <SettingsRow label="HTTPS Upgrade" sub="Automatically upgrade HTTP to HTTPS."><Toggle active /></SettingsRow>
         </div>
      </div>

      <SettingsCard title="Privacy">
        <SettingsRow label="Send Do Not Track" sub="Ask sites not to track you. Note: Most sites ignore this."><Toggle active={false} /></SettingsRow>
        <SettingsRow label="Block Cookies from Third Parties"><Toggle active /></SettingsRow>
        <SettingsRow label="Clear Cookies on Close"><Toggle active={false} /></SettingsRow>
      </SettingsCard>

      <SettingsCard title="Clear Browsing Data">
         <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <Checkbox label="Browsing History" checked />
               <Checkbox label="Cookies and Site Data" />
               <Checkbox label="Cached Images and Files" checked />
               <Checkbox label="Passwords" />
            </div>
            <div className="flex items-center justify-between">
               <span className="text-[13px] text-[#64748b]">Time range</span>
               <select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#94a3b8] outline-none"><option>Last hour</option><option selected>Last 24 hours</option><option>Last 7 days</option><option>All time</option></select>
            </div>
            <button className="w-full h-10 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/5 text-[#ef4444] text-[13px] font-bold hover:bg-[#ef4444]/10 transition-all cursor-pointer">Clear Data</button>
         </div>
      </SettingsCard>
    </div>
  );
}

function WalletSettings() {
  const { accounts } = useWalletStore();
  return (
    <div className="space-y-8 animate-fade">
      <SettingsCard title="Connected Wallets">
        {accounts.map((acc, i) => (
          <SettingsRow key={acc.id} label={acc.name} sub={acc.addresses.eth}>
             <div className="flex items-center gap-3">
                {i === 0 && <span className="bg-[#6366f1]/10 text-[#6366f1] text-[10px] font-bold uppercase px-2 py-0.5 rounded">Primary</span>}
                <button className="p-1.5 rounded-lg text-[#64748b] hover:text-[#f8fafc] hover:bg-[#161720] bg-transparent border-none cursor-pointer"><MoreHorizontal size={16} /></button>
             </div>
          </SettingsRow>
        ))}
        <div className="h-[52px] px-5 flex items-center justify-center border-t border-dashed border-[#2d2e45] cursor-pointer hover:bg-[#6366f1]/5 transition-all group">
           <div className="flex items-center gap-2 text-[#6366f1] font-bold text-[13px]"><Plus size={16} /> Add or Import Wallet</div>
        </div>
      </SettingsCard>

      <SettingsCard title="Web3 Behavior">
        <SettingsRow label="Default Network">
           <select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#94a3b8] outline-none">
             <option selected>Ethereum Mainnet</option>
             <option>Polygon</option>
             <option>Arbitrum</option>
             <option>Optimism</option>
             <option>Base</option>
             <option>Custom</option>
           </select>
        </SettingsRow>
        <SettingsRow label="ENS Resolution" sub="Automatically resolve .eth domains."><Toggle active /></SettingsRow>
        <SettingsRow label="IPFS Gateway"><select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#94a3b8] outline-none"><option selected>Public Gateway</option><option>Local Node</option><option>Custom</option></select></SettingsRow>
        <SettingsRow label="DDOC Verification" sub="Verify data integrity for supported sites."><Toggle active /></SettingsRow>
        <SettingsRow label="Auto-Connect Wallet" sub="Automatically connect wallet to trusted Web3 sites."><Toggle active /></SettingsRow>
        <SettingsRow label="Transaction Confirmation">
           <select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#94a3b8] outline-none">
              <option selected>Always Ask</option>
              <option>Auto-approve under $10</option>
              <option>Auto-approve under $100</option>
           </select>
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="Web3 Score">
        <SettingsRow label="Default Score Provider"><select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#94a3b8] outline-none"><option selected>Orivon Web3 Score</option></select></SettingsRow>
        <SettingsRow label="Show Score on URL Bar"><Toggle active /></SettingsRow>
        <SettingsRow label="Warn on Low Score Sites"><Toggle active /></SettingsRow>
        <SettingsRow label="Score Detail Level"><select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#94a3b8] outline-none"><option>Minimal</option><option selected>Standard</option><option>Detailed</option></select></SettingsRow>
      </SettingsCard>
    </div>
  );
}

function SearchSettings() {
  return (
    <div className="space-y-8 animate-fade">
      <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
         <div className="p-6 bg-[#6366f1]/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center text-[#0ea5e9] border border-[#0ea5e9]/20"><Search size={24} /></div>
               <div className="flex flex-col">
                  <div className="text-[15px] font-bold text-[#f8fafc]">Web3 Compass</div>
                  <div className="text-[12px] text-[#6366f1]">web3compass.net</div>
               </div>
            </div>
            <button className="h-[34px] px-4 rounded-lg border border-[#1e2030] text-[13px] text-[#94a3b8] hover:border-[#6366f1] hover:text-[#818cf8] transition-all bg-transparent cursor-pointer font-bold">Change</button>
         </div>
         <div className="divide-y divide-[#1e2030]">
            <SettingsRow label="Open in New Tab"><Toggle active={false} /></SettingsRow>
            <SettingsRow label="Show Search Suggestions"><Toggle active /></SettingsRow>
            <SettingsRow label="Search Language"><select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#94a3b8] outline-none"><option selected>English</option></select></SettingsRow>
         </div>
      </div>

      <SettingsCard title="Search Engine List">
         <SearchEngineItem name="Web3 Compass" url="web3compass.net" checked isDefault />
         <SearchEngineItem name="Presearch" url="presearch.com" badge="Web3" badgeColor="#22c55e" />
         <SearchEngineItem name="DuckDuckGo" url="duckduckgo.com" />
         <SearchEngineItem name="Brave Search" url="search.brave.com" />
         <SearchEngineItem name="Google" url="google.com" badge="Low Score" badgeColor="#f59e0b" />
         <div className="h-[52px] px-5 flex items-center justify-center border-t border-dashed border-[#2d2e45] cursor-pointer hover:bg-[#6366f1]/5 transition-all group">
            <div className="flex items-center gap-2 text-[#6366f1] font-bold text-[13px]"><Plus size={16} /> Add Custom Search Engine</div>
         </div>
      </SettingsCard>
    </div>
  );
}

function NodesSettings() {
  return (
    <div className="space-y-8 animate-fade">
      <SettingsCard title="General Node Settings">
        <SettingsRow label="Auto-start Nodes on Launch" sub="Automatically start enabled nodes when browser opens."><Toggle active={false} /></SettingsRow>
        <SettingsRow label="Max Bandwidth Usage">
           <div className="flex items-center gap-4">
              <span className="text-[13px] font-bold text-[#f8fafc] tabular-nums">50 MB/s</span>
              <div className="flex gap-1">
                 <button className="w-8 h-8 rounded border border-[#1e2030] flex items-center justify-center text-[#64748b] hover:text-[#f8fafc] bg-transparent cursor-pointer">{'<'}</button>
                 <button className="w-8 h-8 rounded border border-[#1e2030] flex items-center justify-center text-[#64748b] hover:text-[#f8fafc] bg-transparent cursor-pointer">{'>'}</button>
              </div>
           </div>
        </SettingsRow>
        <SettingsRow label="Node Data Directory">
           <div className="flex items-center gap-3">
              <span className="text-[12px] font-mono text-[#94a3b8]">~/Library/Orivon/nodes</span>
              <button className="h-[30px] px-3 rounded-lg border border-[#1e2030] text-[12px] text-[#94a3b8] hover:border-[#6366f1] transition-all bg-transparent cursor-pointer">Change</button>
           </div>
        </SettingsRow>
        <SettingsRow label="Show Node Status in Sidebar"><Toggle active /></SettingsRow>
      </SettingsCard>

      <SettingsCard title="IPFS Node">
        <SettingsRow label="Enable IPFS Module"><Toggle active /></SettingsRow>
        <SettingsRow label="Auto-start IPFS"><Toggle active={false} /></SettingsRow>
        <SettingsRow label="IPFS Gateway Mode"><select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#94a3b8] outline-none"><option selected>Local Node</option><option>Public</option><option>Hybrid</option></select></SettingsRow>
        <SettingsRow label="Max Peers"><input type="number" defaultValue="50" className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#f8fafc] outline-none w-20 text-center" /></SettingsRow>
        <SettingsRow label="Storage Limit"><div className="flex gap-1"><input type="number" defaultValue="10" className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#f8fafc] outline-none w-16 text-center" /><select className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-2 text-[12px] text-[#94a3b8] outline-none"><option>GB</option><option>TB</option></select></div></SettingsRow>
      </SettingsCard>

      <SettingsCard title="Bitcoin Node">
        <SettingsRow label="Enable Bitcoin Node"><Toggle active /></SettingsRow>
        <SettingsRow label="Auto-start Bitcoin Node"><Toggle active={false} /></SettingsRow>
        <SettingsRow label="Prune Size" sub="Minimum is 550 MB."><div className="flex gap-2 items-center"><input type="number" defaultValue="550" className="bg-[#161720] border border-[#1e2030] rounded-lg h-[34px] px-3 text-[13px] text-[#f8fafc] outline-none w-20 text-center" /><span className="text-[12px] text-[#64748b]">MB</span></div></SettingsRow>
        <SettingsRow label="Use Pre-synced Snapshot" sub="Quick sync from a recent snapshot. Recommended."><Toggle active /></SettingsRow>
      </SettingsCard>
    </div>
  );
}

function AboutSettings() {
  return (
    <div className="space-y-8 animate-fade">
       <div className="bg-[#111218] border border-[#1e2030] rounded-2xl p-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1] mb-6 border border-[#6366f1]/20">
             <span className="text-4xl font-bold">O</span>
          </div>
          <h2 className="text-[24px] font-bold text-[#f8fafc] tracking-[0.08em] mb-1">ORIVON</h2>
          <div className="text-[13px] font-bold text-[#6366f1] uppercase tracking-widest mb-2">The Web3 Browser</div>
          <div className="text-[13px] text-[#64748b] mb-1">Version 0.1.0 MVP</div>
          <div className="text-[12px] text-[#475569] mb-8">Built in May 2026</div>
          
          <div className="bg-[#161720] border border-[#1e2030] rounded-xl px-6 py-4 flex items-center gap-4 mb-10">
             <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
             <span className="text-[13px] font-medium text-[#94a3b8]">You are running the latest version.</span>
             <button className="text-[13px] font-bold text-[#6366f1] bg-transparent border-none cursor-pointer hover:text-[#818cf8]">Check for Updates</button>
          </div>

          <div className="flex gap-3 mb-10">
             <AboutLink icon={ExternalLink} label="Documentation" />
             <AboutLink icon={ExternalLink} label="Discord" />
             <AboutLink icon={ExternalLink} label="GitHub" />
             <AboutLink icon={ExternalLink} label="Report Bug" />
          </div>

          <div className="space-y-2 max-w-[440px]">
             <p className="text-[12px] text-[#475569] leading-relaxed">Orivon Browser is open source software. Released under the MIT License. Built on Brave Browser, Chromium, and the Orivon Modules System.</p>
             <p className="text-[12px] text-[#475569] font-medium italic">Electron, React, TypeScript, ethers.js, IPFS, Wasmtime, Lucide Icons.</p>
          </div>
       </div>
    </div>
  );
}

function AboutLink({ icon: Icon, label }: any) {
  return (
    <button className="h-9 px-4 rounded-lg bg-[#161720] border border-[#1e2030] flex items-center gap-2 text-[13px] text-[#94a3b8] hover:text-[#f8fafc] hover:border-[#6366f1] transition-all cursor-pointer">
       <Icon size={14} /> {label}
    </button>
  );
}

// --- Icons / Helpers ---

function Radio({ label, checked }: { label: string, checked?: boolean }) {
  const { accentColor } = useSettings();
  return (
    <div className="flex items-center gap-3 cursor-pointer group">
       <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${checked ? '' : 'border-[#1e2030] group-hover:border-[#64748b]'}`} style={checked ? { borderColor: accentColor } : {}}>
          {checked && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />}
       </div>
       <span className={`text-[13px] font-medium ${checked ? 'text-[#f8fafc]' : 'text-[#64748b] group-hover:text-[#94a3b8]'}`}>{label}</span>
    </div>
  );
}

function Checkbox({ label, checked }: { label: string, checked?: boolean }) {
  const { accentColor } = useSettings();
  const [val, setVal] = useState(checked);
  return (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setVal(!val)}>
       <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${val ? '' : 'border-[#1e2030] group-hover:border-[#64748b]'}`} style={val ? { backgroundColor: accentColor, borderColor: accentColor } : {}}>
          {val && <Check size={10} strokeWidth={4} className="text-white" />}
       </div>
       <span className={`text-[13px] font-medium ${val ? 'text-[#f8fafc]' : 'text-[#64748b] group-hover:text-[#94a3b8]'}`}>{label}</span>
    </div>
  );
}

function SearchEngineItem({ name, url, checked, isDefault, badge, badgeColor }: any) {
  const { accentColor } = useSettings();
  return (
    <div className="h-[64px] px-5 flex items-center justify-between hover:bg-[#161720] transition-all cursor-pointer group">
       <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-[#161720] border border-[#1e2030] flex items-center justify-center font-bold text-[#64748b] uppercase text-[12px] group-hover:border-[#6366f1] transition-all">{name.charAt(0)}</div>
          <div className="flex flex-col">
             <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#f8fafc]">{name}</span>
                {isDefault && <span className="bg-[#6366f1]/10 text-[#6366f1] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">Default</span>}
                {badge && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: `${badgeColor}15`, color: badgeColor }}>{badge}</span>}
             </div>
             <span className="text-[11px] text-[#64748b] font-mono">{url}</span>
          </div>
       </div>
       <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${checked ? '' : 'border-[#1e2030]'}`} style={checked ? { borderColor: accentColor } : {}}>
          {checked && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />}
       </div>
    </div>
  );
}
