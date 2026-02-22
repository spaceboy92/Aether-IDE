
import React, { useState } from 'react';
import { UserProfile, MarketItem } from '../../types';
import { ShoppingBag, Zap, Check, CreditCard, X, Search, Sword, Flame, Layout, Clock, Layers, Music, Monitor, Type, Palette } from 'lucide-react';

interface MarketplaceViewProps {
  user: UserProfile;
  onPurchase: (item: MarketItem) => void;
  onClose: () => void;
  activeTheme?: string;
  activeFont?: string;
  enabledFeatures?: {
      vim: boolean;
      minimap: boolean;
      zen: boolean;
  };
}

export const MARKET_ITEMS: MarketItem[] = [
  // --- NEW TOOLS ---
  { id: 'tool_kanban', title: 'Kanban Board', description: 'Agile project management for your neural flow.', icon: 'layout', price: 0, category: 'tool', isInstalled: false, isPremium: false },
  { id: 'tool_focus', title: 'Neural Sync Timer', description: 'Pomodoro timer to maintain cognitive synchronization.', icon: 'clock', price: 0, category: 'tool', isInstalled: false, isPremium: false },

  // --- ANIME THEMES ---
  { id: 'theme_konoha', title: 'Konoha Leaf', description: 'Orange and black ninja aesthetic.', icon: 'sword', price: 10, category: 'theme', isInstalled: false, isPremium: false },
  { id: 'theme_akatsuki', title: 'Akatsuki Cloud', description: 'Black robes with red cloud accents.', icon: 'palette', price: 15, category: 'theme', isInstalled: false, isPremium: false },
  { id: 'theme_gojo', title: 'Infinite Void', description: 'Blindfold black and infinity blue.', icon: 'palette', price: 20, category: 'theme', isInstalled: false, isPremium: false },
  { id: 'theme_sukuna', title: 'Malevolent', description: 'Cursed energy red and bone white.', icon: 'palette', price: 20, category: 'theme', isInstalled: false, isPremium: false },

  // --- PREMIUM FEATURES ---
  { id: 'pro_tier', title: 'Singularity Pro', description: 'Unlock Advanced AI instructions and Priority Processing.', icon: 'zap', price: 200, category: 'premium', isInstalled: false, isPremium: true },
  { id: 'gpu_mode', title: 'GPU Acceleration', description: 'Enable Hyper-Realistic Visuals: Noise, Blur, Chromatic Aberration.', icon: 'zap', price: 50, category: 'premium', isInstalled: false, isPremium: true },

  // --- THEMES (Classic) ---
  { id: 'theme_cyberpunk', title: 'Cyberpunk 2077', description: 'High contrast neon yellow and blue theme.', icon: 'palette', price: 0, category: 'theme', isInstalled: false, isPremium: false },
  { id: 'theme_matrix', title: 'The Matrix', description: 'Digital rain green aesthetic.', icon: 'palette', price: 10, category: 'theme', isInstalled: false, isPremium: false },
  { id: 'theme_vaporwave', title: 'Vaporwave', description: 'Pastel pinks and purples for aesthetic coding.', icon: 'palette', price: 20, category: 'theme', isInstalled: false, isPremium: false },
  { id: 'theme_dracula', title: 'Dracula', description: 'Famous dark theme for vampires.', icon: 'palette', price: 0, category: 'theme', isInstalled: false, isPremium: false },
  
  // --- FONTS ---
  { id: 'font_jetbrains', title: 'JetBrains Mono', description: 'The default typeface for developers.', icon: 'type', price: 0, category: 'font', isInstalled: false, isPremium: false },
  { id: 'font_fira', title: 'Fira Code', description: 'Monospaced font with programming ligatures.', icon: 'type', price: 0, category: 'font', isInstalled: false, isPremium: false },
  { id: 'font_press', title: 'Press Start 2P', description: 'Retro gaming pixel font.', icon: 'type', price: 10, category: 'font', isInstalled: false, isPremium: false },
  { id: 'font_orbitron', title: 'Orbitron', description: 'Futuristic sci-fi font.', icon: 'type', price: 5, category: 'font', isInstalled: false, isPremium: false },
];

const MarketplaceView: React.FC<MarketplaceViewProps> = ({ user, onPurchase, onClose, activeTheme, activeFont, enabledFeatures }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'premium' | 'theme' | 'plugin' | 'font'>('all');
  const [search, setSearch] = useState('');
  
  const installedItems = user.items || [];
  const userCoins = user.coins || 500;

  const getButtonState = (item: MarketItem) => {
      const isOwned = installedItems.includes(item.id) || item.price === 0;
      
      if (!isOwned) {
          return { 
              label: `Purchase: ${item.price} NC`, 
              disabled: item.price > userCoins, 
              style: 'bg-aether-accent text-black hover:scale-[1.02] shadow-glow' 
          };
      }

      if (item.category === 'theme') {
          const isActive = activeTheme === item.id;
          return { 
              label: isActive ? 'ACTIVE THEME' : 'ENGAGE THEME', 
              disabled: isActive, 
              style: isActive ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-white/10 text-white hover:bg-white/20' 
          };
      }

      if (item.category === 'font') {
          // Simplified font comparison
          const isActive = activeFont?.toLowerCase().includes(item.title.toLowerCase());
          return { 
              label: isActive ? 'ACTIVE TYPE' : 'ENGAGE TYPE', 
              disabled: isActive, 
              style: isActive ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-white/10 text-white hover:bg-white/20' 
          };
      }

      return { label: 'INSTALLED', disabled: true, style: 'bg-white/5 text-aether-muted' };
  };

  const filteredItems = MARKET_ITEMS.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'all' || item.category === activeTab || (activeTab === 'plugin' && (item.category === 'tool' || item.category === 'plugin'));
      return matchesSearch && matchesTab;
  });

  return (
    <div className="flex-1 flex flex-col bg-aether-bg h-full animate-in fade-in slide-in-from-left-4 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-aether-border bg-black/40 flex justify-between items-center shrink-0">
            <div>
                <h1 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-widest">
                    <ShoppingBag size={18} className="text-aether-accent" />
                    Marketplace
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_5px_#fbbf24]"></div>
                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">{userCoins} Neural Credits</span>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-aether-muted hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-aether-border flex flex-col gap-2 bg-black/20 shrink-0">
            <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-aether-muted" />
                <input 
                    type="text" 
                    placeholder="Search modules..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-black/50 border border-aether-border rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-aether-accent outline-none"
                />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'premium', 'theme', 'font', 'plugin'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)} 
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-aether-accent text-black' : 'text-aether-muted hover:bg-white/5'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/40">
            <div className="grid grid-cols-1 gap-4">
                {filteredItems.map(item => {
                    const btnState = getButtonState(item);
                    
                    return (
                        <div key={item.id} className="group bg-aether-panel border border-white/5 rounded-xl p-4 hover:border-aether-accent/30 transition-all flex flex-col relative overflow-hidden">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-lg ${item.isPremium ? 'bg-purple-500/10 text-purple-400' : 'bg-aether-accent/10 text-aether-accent'}`}>
                                    {item.icon === 'palette' ? <Palette size={20} /> : 
                                     item.icon === 'type' ? <Type size={20} /> :
                                     item.icon === 'layout' ? <Layout size={20} /> :
                                     item.icon === 'clock' ? <Clock size={20} /> :
                                     <Zap size={20} />}
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-yellow-500/80 uppercase block">{item.price === 0 ? 'FREEWARE' : `${item.price} NC`}</span>
                                    <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{item.category}</span>
                                </div>
                            </div>

                            <h3 className="text-sm font-black text-white mb-1 uppercase tracking-wider">{item.title}</h3>
                            <p className="text-[10px] text-aether-muted mb-4 leading-relaxed">{item.description}</p>

                            <button 
                                onClick={() => onPurchase(item)}
                                disabled={btnState.disabled}
                                className={`w-full py-2 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${btnState.style} disabled:opacity-50`}
                            >
                                {btnState.label}
                                {(!installedItems.includes(item.id) && item.price > 0) && <CreditCard size={12} />}
                                {(['ENGAGE THEME', 'ENGAGE TYPE'].includes(btnState.label)) && <Check size={12} />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default MarketplaceView;
