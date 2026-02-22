import React from 'react';
import { Folder, Code, Play, MessageSquare, Settings } from 'lucide-react';
import { ViewMode } from '../../types';

interface MobileNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: ViewMode.CHAT, icon: MessageSquare, label: 'Chat' },
    { id: ViewMode.EDITOR, icon: Code, label: 'Code' },
    { id: ViewMode.PREVIEW, icon: Play, label: 'Preview' },
    { id: ViewMode.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-aether-panel border-t border-aether-border flex justify-around items-center h-16 z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = currentView === item.id || (item.id === ViewMode.EDITOR && currentView === ViewMode.FILES);
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
              isActive ? 'text-aether-accent' : 'text-aether-muted hover:text-white'
            }`}
          >
            <item.icon size={20} className={isActive ? 'drop-shadow-[0_0_5px_rgba(0,212,255,0.5)]' : ''} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileNav;