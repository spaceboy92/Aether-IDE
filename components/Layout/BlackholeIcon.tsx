
import React, { useState } from 'react';

interface BlackholeIconProps {
  size?: number;
  className?: string;
}

const BlackholeIcon: React.FC<BlackholeIconProps> = ({ size = 40, className = '' }) => {
  const [clickCount, setClickCount] = useState(0);
  const [isSingularity, setIsSingularity] = useState(false);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 5) {
      setIsSingularity(true);
      setTimeout(() => {
        setIsSingularity(false);
        setClickCount(0);
        // Maybe trigger a small visual glitch globally?
        document.body.classList.add('glitch-active');
        setTimeout(() => document.body.classList.remove('glitch-active'), 500);
      }, 2000);
    }
  };

  return (
    <div 
      className={`blackhole-container ${className} cursor-pointer transition-transform duration-300 ${isSingularity ? 'scale-150 animate-pulse' : 'hover:scale-110'}`} 
      style={{ width: size, height: size }}
      onClick={handleClick}
      title={clickCount > 0 ? `${5 - clickCount} clicks to instability` : 'Singularity Core'}
    >
      {/* Outer Ring */}
      <div 
        className="blackhole-accretion" 
        style={{ 
          width: size * 1.6, 
          height: size * 1.6,
          animationDuration: isSingularity ? '0.2s' : '4s'
        }}
      ></div>
      {/* Inner Ring */}
      <div 
        className={`absolute rounded-full border border-aether-accent/30 ${isSingularity ? 'animate-spin' : 'animate-spin-slow'}`}
        style={{ 
          width: size * 1.3, 
          height: size * 1.3,
          animationDuration: isSingularity ? '0.5s' : '12s'
        }}
      ></div>
      {/* Core */}
      <div className={`blackhole-core transition-colors ${isSingularity ? 'bg-white shadow-[0_0_50px_#fff]' : 'bg-black'}`} style={{ width: size, height: size }}></div>
    </div>
  );
};

export default BlackholeIcon;
