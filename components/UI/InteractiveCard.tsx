
import React from 'react';

interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  delay?: number;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ 
  children, 
  onClick, 
  className = "", 
  ariaLabel = "Interactive element",
  delay = 0 
}) => {
  return (
    <div
      onClick={onClick}
      aria-label={ariaLabel}
      role={onClick ? "button" : "region"}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => onClick && (e.key === 'Enter' || e.key === ' ') && onClick()}
      style={{ animationDelay: `${delay}ms` }}
      className={`
        group relative overflow-hidden rounded-xl border border-aether-border bg-aether-panel p-4 
        transition-all duration-300 ease-out cursor-pointer
        hover:border-aether-accent hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] 
        hover:scale-[1.02] active:scale-[0.98]
        animate-in fade-in slide-in-from-bottom-4 fill-mode-both
        ${className}
      `}
    >
      {/* Glow Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-aether-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Inner Content */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default InteractiveCard;
