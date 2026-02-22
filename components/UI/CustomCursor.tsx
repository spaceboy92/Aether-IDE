
import React, { useEffect, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const mainCursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const trailPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const isInitialized = useRef(false);

  useEffect(() => {
    // Add class to body to hide native cursor once React logic is ready
    document.documentElement.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      if (!isInitialized.current) {
        isInitialized.current = true;
        if (mainCursorRef.current) mainCursorRef.current.style.opacity = '1';
        if (trailRef.current) trailRef.current.style.opacity = '1';
      }

      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      const target = e.target as HTMLElement;
      const isPointer = 
        window.getComputedStyle(target).cursor === 'pointer' ||
        ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) ||
        target.closest('button') || target.closest('a') || target.closest('[role="button"]');

      if (mainCursorRef.current) {
        if (isPointer) {
          mainCursorRef.current.classList.add('scale-[2.0]', 'bg-white', 'shadow-[0_0_20px_#fff]');
          mainCursorRef.current.classList.remove('bg-aether-accent', 'shadow-[0_0_10px_#00d4ff]');
        } else {
          mainCursorRef.current.classList.remove('scale-[2.0]', 'bg-white', 'shadow-[0_0_20px_#fff]');
          mainCursorRef.current.classList.add('bg-aether-accent', 'shadow-[0_0_10px_#00d4ff]');
        }
      }
      
      if (trailRef.current) {
        if (isPointer) {
          trailRef.current.classList.add('scale-150', 'border-white/50');
          trailRef.current.classList.remove('border-aether-secondary/30');
        } else {
          trailRef.current.classList.remove('scale-150', 'border-white/50');
          trailRef.current.classList.add('border-aether-secondary/30');
        }
      }
    };

    const animate = () => {
      if (mainCursorRef.current) {
        mainCursorRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      trailPos.current.x += (mousePos.current.x - trailPos.current.x) * 0.15;
      trailPos.current.y += (mousePos.current.y - trailPos.current.y) * 0.15;

      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0)`;
      }

      requestAnimationFrame(animate);
    };

    const handleMouseLeave = () => {
       if (mainCursorRef.current) mainCursorRef.current.style.opacity = '0';
       if (trailRef.current) trailRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
       if (mainCursorRef.current) mainCursorRef.current.style.opacity = '1';
       if (trailRef.current) trailRef.current.style.opacity = '1';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    const animationFrame = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <div 
        ref={mainCursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-aether-accent rounded-full z-[1000] pointer-events-none transition-all duration-300 ease-out shadow-[0_0_10px_#00d4ff]"
        style={{ margin: '-4px 0 0 -4px', opacity: 0, willChange: 'transform' }}
      />
      
      <div 
        ref={trailRef}
        className="fixed top-0 left-0 w-8 h-8 border border-aether-secondary/30 rounded-full z-[999] pointer-events-none transition-all duration-500 ease-out flex items-center justify-center"
        style={{ margin: '-16px 0 0 -16px', opacity: 0, willChange: 'transform' }}
      >
        <div className="absolute inset-0 rounded-full border border-aether-accent/10 animate-pulse" />
      </div>
    </>
  );
};

export default CustomCursor;
