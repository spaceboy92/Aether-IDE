
import React, { useEffect, useState, memo, useRef } from 'react';
import { SeasonState } from '../../hooks/useSeasons';

interface EasterEggLayerProps {
  season: SeasonState;
  activeEffect?: string | null;
}

const ASSETS = {
    images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Among_Us_red_character_standing.svg/1200px-Among_Us_red_character_standing.svg.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Stonks_meme.jpg/220px-Stonks_meme.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/a/a9/Illuminati_triangle_eye.png",
        "https://upload.wikimedia.org/wikipedia/en/5/5f/Original_Doge_meme.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/To_Be_Continued.png/640px-To_Be_Continued.png",
        "https://upload.wikimedia.org/wikipedia/en/6/61/Clippy-letter.PNG", // Clippy
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/DVD_logo.svg/1200px-DVD_logo.svg.png", // DVD
        "https://i.imgflip.com/2/1bij.jpg", // One does not simply
        "https://i.kym-cdn.com/entries/icons/original/000/000/091/TrollFace.jpg" // Trollface
    ],
    audio: [
        "https://www.myinstants.com/media/sounds/among-us-role-reveal-sound.mp3",
        "https://www.myinstants.com/media/sounds/windows-xp-error.mp3",
        "https://www.myinstants.com/media/sounds/gta-v-wasted-sound-effect.mp3",
        "https://www.myinstants.com/media/sounds/x-files-theme-song-copy.mp3",
        "https://www.myinstants.com/media/sounds/level-up-sound-effect.mp3",
        "https://www.myinstants.com/media/sounds/metal-gear-solid-alert.mp3",
        "https://www.myinstants.com/media/sounds/vine-boom.mp3",
        "https://www.myinstants.com/media/sounds/discord-notification.mp3",
        "https://www.myinstants.com/media/sounds/air-horn-sound-effect.mp3",
        "https://www.myinstants.com/media/sounds/spongebob-fail.mp3",
        "https://www.myinstants.com/media/sounds/bonk_sound_effect.mp3",
        "https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3"
    ]
};

const EasterEggLayer: React.FC<EasterEggLayerProps> = ({ season, activeEffect }) => {
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [godMode, setGodMode] = useState(false);
  const [barrelRoll, setBarrelRoll] = useState(false);
  const [gravityFail, setGravityFail] = useState(false);
  const [particles, setParticles] = useState<{id: number, x: number, y: number, type: string}[]>([]);
  
  // DVD Bouncing State
  const [dvdPos, setDvdPos] = useState({ x: 100, y: 100, dx: 3, dy: 3, color: 'blue' });
  const [showDvd, setShowDvd] = useState(false);
  
  // Fake Update Progress
  const [updateProgress, setUpdateProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);

  // Preload Assets on Mount
  useEffect(() => {
    ASSETS.images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
  }, []);

  // Konami Code: Up, Up, Down, Down, Left, Right, Left, Right, B, A
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  // Barrel Roll Code: r, o, l, l
  const barrelCode = ['r', 'o', 'l', 'l'];
  const [barrelIndex, setBarrelIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // KONAMI
      if (e.key === konamiCode[konamiIndex]) {
        const next = konamiIndex + 1;
        setKonamiIndex(next);
        if (next === konamiCode.length) {
          activateGodMode();
          setKonamiIndex(0);
        }
      } else {
        setKonamiIndex(0);
      }

      // BARREL ROLL
      if (e.key.toLowerCase() === barrelCode[barrelIndex]) {
        const next = barrelIndex + 1;
        setBarrelIndex(next);
        if (next === barrelCode.length) {
          doBarrelRoll();
          setBarrelIndex(0);
        }
      } else {
        setBarrelIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIndex, barrelIndex]);

  const playAudio = (src: string, volume = 0.5, loop = false) => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
      }
      const audio = new Audio(src);
      audio.volume = volume;
      audio.loop = loop;
      audio.play().catch(e => console.log("Audio play failed (interaction needed)", e));
      audioRef.current = audio;
  };

  const playSFX = (src: string) => {
      const audio = new Audio(src);
      audio.volume = 0.6;
      audio.play().catch(() => {});
  };

  const activateGodMode = () => {
    setGodMode(!godMode);
    playAudio("https://www.myinstants.com/media/sounds/level-up-sound-effect.mp3", 0.3);
    
    if (!godMode) {
      document.body.style.filter = "contrast(1.2) saturate(1.5)";
      document.body.style.border = "5px solid #ffd700";
    } else {
      document.body.style.filter = "";
      document.body.style.border = "";
    }
  };

  const doBarrelRoll = () => {
      setBarrelRoll(true);
      document.body.style.transition = "transform 1s ease-in-out";
      document.body.style.transform = "rotate(360deg)";
      setTimeout(() => {
          setBarrelRoll(false);
          document.body.style.transform = "none";
      }, 1000);
  };

  // Effect Logic & Audio Triggering
  useEffect(() => {
    // Reset states
    setShowDvd(false);
    setGravityFail(false);
    setUpdateProgress(0);
    document.body.style.transform = "none";

    if (!activeEffect) {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        return;
    }

    // CLICK BASED SFX
    if (activeEffect === 'sfx_vine') playSFX(ASSETS.audio[6]);
    if (activeEffect === 'sfx_discord') playSFX(ASSETS.audio[7]);
    if (activeEffect === 'sfx_airhorn') playSFX(ASSETS.audio[8]);
    if (activeEffect === 'sfx_fail') playSFX(ASSETS.audio[9]);
    if (activeEffect === 'sfx_bonk') playSFX(ASSETS.audio[10]);
    if (activeEffect === 'sfx_anime') playSFX(ASSETS.audio[11]);

    // VISUALS
    switch (activeEffect) {
        case 'matrix': break; // Handled by canvas
        case 'sus': playAudio(ASSETS.audio[0]); break;
        case 'windows': playAudio(ASSETS.audio[1]); break;
        case 'gta': playAudio(ASSETS.audio[2]); break;
        case 'illuminati': playAudio(ASSETS.audio[3]); break;
        case 'metalgear': playAudio(ASSETS.audio[5]); break;
        case 'dvd': setShowDvd(true); break;
        case 'gravity': 
            setGravityFail(true); 
            playAudio(ASSETS.audio[9]); // Spongebob fail
            document.body.style.transition = "transform 3s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
            document.body.style.transform = "rotate(180deg) skew(20deg)";
            break;
        case 'clippy': playSFX(ASSETS.audio[7]); break;
        case 'fake_update': 
            // Progress bar simulation
            let p = 0;
            const intv = setInterval(() => {
                p += Math.random() * 5;
                if (p > 99) p = 99; // Stuck at 99%
                setUpdateProgress(Math.floor(p));
            }, 200);
            return () => clearInterval(intv);
    }
  }, [activeEffect]);

  // Matrix Effect Canvas
  useEffect(() => {
    if (activeEffect === 'matrix' && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#0F0"; // Matrix Green
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);
        const prevFilter = document.body.style.filter;
        document.body.style.filter = "none";

        return () => {
            clearInterval(interval);
            document.body.style.filter = prevFilter || "";
        };
    }
  }, [activeEffect]);

  // DVD Logic
  useEffect(() => {
      if (!showDvd) return;
      const interval = setInterval(() => {
          setDvdPos(prev => {
              let { x, y, dx, dy, color } = prev;
              const COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];
              x += dx;
              y += dy;
              
              if (x + 150 > window.innerWidth || x < 0) {
                  dx = -dx;
                  color = COLORS[Math.floor(Math.random() * COLORS.length)];
              }
              if (y + 100 > window.innerHeight || y < 0) {
                  dy = -dy;
                  color = COLORS[Math.floor(Math.random() * COLORS.length)];
              }
              return { x, y, dx, dy, color };
          });
      }, 16);
      return () => clearInterval(interval);
  }, [showDvd]);

  // Seasonal Particles
  useEffect(() => {
    if ((season.isNewYear || godMode) && !activeEffect) {
      const interval = setInterval(() => {
        const id = Date.now();
        const startX = Math.random() * window.innerWidth;
        setParticles(prev => {
            const newParticles = prev.length > 30 ? prev.slice(1) : prev;
            return [...newParticles, { id, x: startX, y: -20, type: '★' }];
        });
      }, 800); 
      return () => clearInterval(interval);
    } else {
        setParticles([]);
    }
  }, [season, godMode, activeEffect]);

  // Youtube Video Overlays
  const renderVideoOverlay = (videoId: string, title: string, animationClass: string) => (
    <div className="absolute inset-0 z-[10000] bg-black flex flex-col items-center justify-center animate-in zoom-in duration-500">
        <div className={`relative w-full h-full max-w-4xl max-h-[80vh] aspect-video border-4 border-aether-accent shadow-[0_0_100px_#00d4ff] rounded-xl overflow-hidden bg-black ${animationClass}`}>
            <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&showinfo=0&rel=0`} 
                title={title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="pointer-events-none"
            ></iframe>
        </div>
        <h1 className="mt-8 text-4xl font-bold text-white uppercase tracking-widest animate-pulse shadow-glow">{title}</h1>
        {/* Extra animated elements for specific videos */}
        {activeEffect === 'rickroll' && (
             <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="absolute text-6xl animate-float-note" style={{ left: `${20 * i}%`, animationDelay: `${i * 0.5}s` }}>🎵</div>
                ))}
             </div>
        )}
    </div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      
      {/* --- VIDEOS (Updated IDs to Unrestricted/10H Versions) --- */}
      {/* Rickroll: Alternative Embed Friendly Link */}
      {activeEffect === 'rickroll' && renderVideoOverlay('xvFZjo5PgG0', 'NEVER GONNA GIVE YOU UP', 'animate-dance')}
      
      {/* Coffin Dance: 10 Hour Version (Usually embed safe) */}
      {activeEffect === 'coffin' && renderVideoOverlay('yJg-Y5byMMw', 'ASTRO-NOMIA', 'animate-sway')}
      
      {/* Crab Rave: 10 Hour Version (Usually embed safe) */}
      {activeEffect === 'crab' && (
         <>
            {renderVideoOverlay('cE0wfjsybIQ', 'CRAB RAVE', '')}
            <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden z-[10001]">
                <div className="text-6xl absolute bottom-0 animate-crab-scuttle">🦀</div>
                <div className="text-6xl absolute bottom-10 animate-crab-scuttle-rev" style={{ animationDuration: '4s' }}>🦀</div>
            </div>
         </>
      )}
      
      {/* Nyan Cat: 10 Hour Version (Usually embed safe) */}
      {activeEffect === 'nyan' && (
          <div className="absolute inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-20 animate-rainbow-bg"></div>
             {renderVideoOverlay('wZZ7oFKsKzY', 'NYAN NYAN NYAN', 'animate-spin-slow')}
             <div className="absolute top-1/4 -left-20 text-6xl animate-fly-across">🐈</div>
          </div>
      )}
      
      {/* --- CUSTOM ANIMATIONS --- */}

      {/* 1. MATRIX */}
      {activeEffect === 'matrix' && (
        <canvas ref={canvasRef} className="absolute inset-0 z-10 opacity-80" />
      )}

      {/* 2. SUS (AMONG US) */}
      {activeEffect === 'sus' && (
         <div className="absolute inset-0 z-[10000] bg-black/90 flex items-center justify-center overflow-hidden">
             <div className="absolute top-1/2 left-0 w-full h-full pointer-events-none">
                 {/* Ejection Animation */}
                 <img 
                    src={ASSETS.images[0]} 
                    alt="Sus" 
                    className="w-48 h-48 object-contain absolute animate-ejection"
                 />
             </div>
             <h1 className="text-[100px] font-black text-red-600 tracking-tighter mt-4 animate-pulse" style={{ textShadow: '0 0 50px red' }}>
                 EJECTED
             </h1>
         </div>
      )}

      {/* 3. GTA WASTED */}
      {activeEffect === 'gta' && (
          <div className="absolute inset-0 z-[10000] bg-black/60 backdrop-grayscale flex items-center justify-center animate-in fade-in duration-1000">
              <div className="relative text-center">
                  <h1 
                    className="text-[100px] md:text-[150px] font-black uppercase text-red-500/90 animate-slam" 
                    style={{ 
                        fontFamily: 'sans-serif', 
                        textShadow: '0px 0px 20px black, 4px 4px 0px rgba(0,0,0,0.5)'
                    }}
                  >
                      Wasted
                  </h1>
              </div>
          </div>
      )}

      {/* 4. ILLUMINATI */}
      {activeEffect === 'illuminati' && (
          <div className="absolute inset-0 z-[10000] bg-green-900/40 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 animate-spin-slow opacity-30" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #0f0 10deg, transparent 20deg)' }}></div>
              <img 
                src={ASSETS.images[2]} 
                alt="Illuminati" 
                className="w-96 h-96 animate-pulse opacity-90 mix-blend-hard-light drop-shadow-[0_0_50px_#0f0] scale-150"
              />
          </div>
      )}

      {/* 5. WINDOWS BSOD */}
      {activeEffect === 'windows' && (
          <div className="absolute inset-0 z-[10000] bg-[#0000aa] text-white font-mono p-10 md:p-20 flex flex-col gap-4 text-lg md:text-xl cursor-none pointer-events-auto animate-glitch">
              <p>:(</p>
              <p>Your PC ran into a problem and needs to restart.</p>
              <p>THE_MEME_OVERLOAD_EXCEPTION</p>
              <div className="mt-8 text-sm">
                  <span className="animate-pulse">Collecting error info... 100%</span>
              </div>
          </div>
      )}

      {/* 6. STONKS */}
      {activeEffect === 'stonks' && (
          <div className="absolute inset-0 z-[10000] bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <div className="relative animate-in zoom-in-50 duration-500">
                  <img src={ASSETS.images[1]} className="w-[500px] rounded-xl shadow-2xl scale-125" alt="Stonks" />
                  <div className="absolute -bottom-10 right-0 text-6xl font-bold text-orange-500 bg-black px-4 py-2 rotate-6 animate-bounce">STONKS ↗</div>
                  <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
          </div>
      )}

      {/* 7. DOGE */}
      {activeEffect === 'doge' && (
          <div className="absolute inset-0 z-[10000] overflow-hidden">
             {[...Array(15)].map((_, i) => (
                 <div 
                    key={i} 
                    className="absolute animate-float"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 5 + 3}s`,
                        animationDelay: `${Math.random() * 2}s`
                    }}
                 >
                     <img src={ASSETS.images[3]} className="w-24 md:w-32 rounded-full border-4 border-yellow-400 opacity-80" alt="Doge" />
                     <span 
                        className="absolute -top-6 -right-6 text-xl md:text-2xl font-bold whitespace-nowrap"
                        style={{ color: ['#f00', '#0f0', '#00f', '#ff0', '#0ff'][i % 5], fontFamily: '"Comic Sans MS", cursive' }}
                     >
                         {['wow', 'much code', 'very react', 'so aether', 'such ai', 'many feature'][i % 6]}
                     </span>
                 </div>
             ))}
          </div>
      )}

      {/* 8. SKYRIM */}
      {activeEffect === 'skyrim' && (
          <div className="absolute inset-0 z-[10000] bg-black flex items-center justify-center animate-in fade-in duration-[3000ms]">
              <div className="absolute inset-0 bg-white/10 animate-pulse" style={{ filter: 'blur(50px)' }}></div>
              <h1 className="relative text-4xl md:text-6xl text-white/90 font-serif tracking-widest drop-shadow-2xl opacity-0 animate-in fade-in delay-1000 duration-[3000ms]">
                  THE ELDER SCROLLS V
                  <br/>
                  <span className="block text-center text-2xl mt-4 tracking-[0.5em] text-white/60">SKYRIM</span>
              </h1>
          </div>
      )}
      
      {/* 9. METAL GEAR ALERT */}
      {activeEffect === 'metalgear' && (
          <div className="absolute inset-0 z-[10000] flex items-center justify-center">
             <div className="text-red-600 text-[250px] font-bold animate-shake-hard drop-shadow-[0_0_20px_#f00]">!</div>
          </div>
      )}

      {/* 10. CLIPPY */}
      {activeEffect === 'clippy' && (
          <div className="absolute bottom-10 right-10 z-[10000] animate-pop-in">
             <div className="relative">
                 <div className="absolute -top-24 -left-48 w-64 bg-[#ffffcc] text-black p-4 rounded border border-black text-sm shadow-lg font-serif animate-typewriter">
                     It looks like you're trying to write code. <br/>
                     <span className="font-bold">Would you like me to delete it all for you?</span>
                 </div>
                 <img src={ASSETS.images[5]} className="w-32 drop-shadow-xl animate-bounce" alt="Clippy" />
             </div>
          </div>
      )}

      {/* 11. DVD SCREENSAVER */}
      {showDvd && (
          <div className="absolute inset-0 z-[10000] bg-black pointer-events-auto">
              <img 
                src={ASSETS.images[6]} 
                alt="DVD" 
                className="absolute w-32"
                style={{ 
                    left: dvdPos.x, 
                    top: dvdPos.y, 
                    filter: `drop-shadow(0 0 10px ${dvdPos.color})`
                }} 
              />
          </div>
      )}

      {/* 12. FAKE UPDATE */}
      {activeEffect === 'fake_update' && (
          <div className="absolute inset-0 z-[10000] bg-[#0078d7] flex flex-col items-center justify-center text-white cursor-none pointer-events-auto">
              <div className="animate-spin w-16 h-16 border-4 border-white/30 border-t-white rounded-full mb-8"></div>
              <div className="text-3xl font-light mb-2">Working on updates</div>
              <div className="text-3xl font-light">{updateProgress}% complete</div>
              <div className="text-base mt-8 opacity-70">Don't turn off your computer</div>
          </div>
      )}

      {/* 13. TROLLFACE */}
      {activeEffect === 'troll' && (
          <div className="absolute inset-0 z-[10000] bg-white flex items-center justify-center">
             <img src={ASSETS.images[8]} alt="Problem?" className="w-full h-full object-contain animate-shake-hard" />
          </div>
      )}

      {/* God Mode Overlay */}
      {godMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full font-bold uppercase tracking-widest shadow-[0_0_20px_#ffd700] animate-bounce z-20">
          GOD MODE ACTIVE
        </div>
      )}

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-fall text-white/50"
          style={{
            left: p.x,
            top: p.y,
            fontSize: Math.random() * 20 + 10 + 'px',
            animationDuration: Math.random() * 3 + 2 + 's',
            willChange: 'transform',
            zIndex: 15
          }}
        >
          {p.type}
        </div>
      ))}

      {/* April Fools Potato Mode Overlay */}
      {season.isAprilFools && !activeEffect && (
        <div className="absolute bottom-4 right-4 text-[100px] opacity-10 rotate-12 select-none z-0">
          🥔
        </div>
      )}
      
      <style>{`
        @keyframes fall {
          to { transform: translate3d(0, 100vh, 0) rotate(360deg); }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
        }

        @keyframes ejection {
          0% { transform: translateX(-20vw) rotate(0deg); }
          100% { transform: translateX(120vw) rotate(720deg); }
        }
        .animate-ejection {
          animation: ejection 4s linear infinite;
        }

        @keyframes slam {
          0% { transform: scale(2); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-slam {
          animation: slam 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes shake-hard {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake-hard {
          animation: shake-hard 0.5s infinite;
        }

        @keyframes float-note {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(20deg); opacity: 0; }
        }
        .animate-float-note {
          animation: float-note 2s linear infinite;
        }

        @keyframes crab-scuttle {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(100vw); }
        }
        .animate-crab-scuttle {
          animation: crab-scuttle 5s linear infinite;
        }
        .animate-crab-scuttle-rev {
            animation: crab-scuttle 5s linear reverse infinite;
        }

        @keyframes rainbow-bg {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
        .animate-rainbow-bg {
            background-size: 200% 200%;
            animation: rainbow-bg 3s ease infinite;
        }

        @keyframes fly-across {
            0% { left: -20%; }
            100% { left: 120%; }
        }
        .animate-fly-across {
            animation: fly-across 4s linear infinite;
        }

        @keyframes pop-in {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
            animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes glitch {
           0% { clip-path: inset(40% 0 61% 0); transform: skew(0.5deg); }
           20% { clip-path: inset(92% 0 1% 0); transform: skew(0.3deg); }
           40% { clip-path: inset(43% 0 1% 0); transform: skew(0.1deg); }
           60% { clip-path: inset(25% 0 58% 0); transform: skew(0.6deg); }
           80% { clip-path: inset(54% 0 7% 0); transform: skew(0.2deg); }
           100% { clip-path: inset(58% 0 43% 0); transform: skew(0.4deg); }
        }
        .animate-glitch {
            animation: glitch 0.3s infinite linear alternate-reverse;
        }

        .animate-dance {
            animation: shake-hard 2s infinite;
        }
        
        @keyframes sway {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
        }
        .animate-sway {
            animation: sway 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default memo(EasterEggLayer);
