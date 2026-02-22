
import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

export type SidebarMode = 'chat' | 'settings' | 'marketplace' | 'whiteboard';

interface ActivityBarProps {
  activeMode: SidebarMode;
  onChange: (mode: SidebarMode) => void;
}

const ActivityBar: React.FC<ActivityBarProps> = ({ activeMode, onChange }) => {
  const items = [
    { id: 'chat', icon: Sparkles, label: 'AI Chat' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-12 bg-black border-r border-aether-border flex flex-col items-center py-4 gap-4 z-50 shrink-0">
      {items.map((item) => {
        const isActive = activeMode === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id as SidebarMode)}
            className={`
              p-2.5 rounded-xl transition-all duration-300 group relative
              ${isActive ? 'bg-aether-accent/10 text-aether-accent' : 'text-aether-muted hover:text-white hover:bg-white/5'}
            `}
            title={item.label}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-aether-accent rounded-r-full shadow-[0_0_10px_#00d4ff]" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ActivityBar;
