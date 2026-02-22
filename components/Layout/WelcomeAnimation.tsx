
import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { FastForward, ShieldAlert, Zap, Terminal as TermIcon, Rocket, PlayCircle, Target, Activity, Cpu, Database, Eye } from 'lucide-react';

interface WelcomeAnimationProps {
  onComplete: () => void;
  username: string;
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete, username }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [dialogue, setDialogue] = useState('Initiating Aether Link...');
  const [isAlert, setIsAlert] = useState(false);
  const [frostOpacity, setFrostOpacity] = useState(0);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const SCRIPT = [
    { time: 1000, speaker: 'AETHER CORE', lang: 'en-GB', pitch: 0.7, rate: 0.9, text: "Structural integrity compromised. Event horizon breach imminent.", module: null },
    { time: 6000, speaker: 'PILOT', lang: 'en-US', pitch: 1.1, rate: 1.1, text: "Initializing override! Force-sync the Aether IDE modules. We need to warp out now!", module: 'CORE' },
    { time: 12000, speaker: 'SYSTEM', lang: 'en-GB', pitch: 0.5, rate: 1.2, text: "Syncing File Explorer... [SUCCESS]. Indexing project tree.", module: 'FILES' },
    { time: 18000, speaker: 'SYSTEM', lang: 'en-GB', pitch: 0.5, rate: 1.2, text: "Initializing AI Synthesis Core... [90%]. Thinking engine online.", module: 'AI' },
    { time: 24000, speaker: 'PILOT', lang: 'en-US', pitch: 1.4, rate: 1.3, text: "THE HULL IS STRETCHING! START THE NEURAL PREVIEW! OPEN THE GATE!", module: 'PREVIEW' },
    { time: 30000, speaker: 'SYSTEM', lang: 'en-GB', pitch: 0.3, rate: 0.8, text: "Singularity reached. Spaghettification sequence active. Welcome home, Developer.", module: 'SINGULARITY' },
    { time: 38000, speaker: 'AI CORE', lang: 'en-US', pitch: 0.9, rate: 1.0, text: `Link stable. Workspace reconstructed for user: ${username}. Happy coding.` }
  ];

  const handleStart = () => {
    synthRef.current = window.speechSynthesis;
    startTimeRef.current = Date.now();
    setIsInitialized(true);
  };

  const triggerVoice = (text: string, lang: string, pitch: number, rate: number) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitch;
    utterance.rate = rate;
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    if (!isInitialized || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.z = 1800;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Black Hole & Accretion
    const bhGroup = new THREE.Group();
    bhGroup.add(new THREE.Mesh(new THREE.SphereGeometry(60, 64, 64), new THREE.MeshBasicMaterial({ color: 0x000000 })));
    scene.add(bhGroup);

    const particlesGeo = new THREE.BufferGeometry();
    const pCount = window.innerWidth < 768 ? 20000 : 80000;
    const pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 200 + Math.random() * 2000;
      pos[i*3] = Math.cos(angle) * radius;
      pos[i*3+1] = (Math.random() - 0.5) * 50;
      pos[i*3+2] = Math.sin(angle) * radius;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const disk = new THREE.Points(particlesGeo, new THREE.PointsMaterial({ color: 0x00d4ff, size: 2, transparent: true, opacity: 0.3 }));
    bhGroup.add(disk);

    // Ship Model (Pilot Cockpit View Representation)
    const ship = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(30, 15, 60), new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1, roughness: 0.1 }));
    ship.add(hull);
    ship.position.set(0, 0, 1200);
    scene.add(ship);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.PointLight(0x00d4ff, 10, 2000);
    scene.add(light);

    let frame: number;
    let lastVoiceIdx = -1;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = elapsed / 45000; 

      let currentIdx = -1;
      for (let i = SCRIPT.length - 1; i >= 0; i--) { if (elapsed > SCRIPT[i].time) { currentIdx = i; break; } }
      if (currentIdx !== -1 && currentIdx !== lastVoiceIdx) {
        lastVoiceIdx = currentIdx;
        setDialogue(`${SCRIPT[currentIdx].speaker}: ${SCRIPT[currentIdx].text}`);
        setActiveModule(SCRIPT[currentIdx].module);
        triggerVoice(SCRIPT[currentIdx].text, SCRIPT[currentIdx].lang, SCRIPT[currentIdx].pitch, SCRIPT[currentIdx].rate);
      }

      bhGroup.rotation.y += 0.005;
      disk.rotation.y += 0.01;

      if (progress < 0.4) {
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 800, 0.005);
        ship.position.z -= 0.5;
      } else if (progress < 0.8) {
        setIsAlert(true);
        const pull = (progress - 0.4) / 0.4;
        camera.position.x += (Math.random() - 0.5) * pull * 40;
        camera.position.y += (Math.random() - 0.5) * pull * 40;
        ship.position.lerp(new THREE.Vector3(0, 0, 0), 0.02);
        ship.scale.z = 1 + pull * 15; // Spaghettification
        ship.scale.x = ship.scale.y = Math.max(0.05, 1 - pull);
        setFrostOpacity(Math.min(1, pull * 1.5));
      } else {
        setIsAlert(false);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 0, 0.08);
        if (progress >= 1) onComplete();
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    animate();
    setTimeout(() => setShowSkip(true), 5000);

    return () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [isInitialized]);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center text-white text-center p-8">
        <div className="relative mb-12">
            <Rocket size={100} className="text-aether-accent animate-float" />
            <div className="absolute -inset-10 bg-aether-accent/10 blur-[80px] rounded-full animate-pulse"></div>
        </div>
        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-[0.5em] mb-4">AETHER</h1>
        <p className="text-aether-muted font-mono uppercase tracking-[0.3em] mb-12 text-xs md:text-sm">Neural Workspace Core v2.5</p>
        <button 
          onClick={handleStart}
          className="group px-16 py-8 bg-white/5 border border-aether-accent hover:bg-aether-accent hover:text-black rounded-3xl text-xl font-black uppercase tracking-[0.4em] transition-all shadow-glow hover:scale-105 active:scale-95"
        >
          Initialize Sync
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-[10000] bg-black overflow-hidden font-sans select-none touch-none">
      {/* COCKPIT HUD */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 md:p-12">
        <div className="flex justify-between items-start">
          <div className="p-5 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl">
             <div className="flex items-center gap-3 text-aether-accent mb-3 border-b border-white/10 pb-2">
                <Target size={18} className="animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-widest">AETHER_HUD_OVR</span>
             </div>
             <div className="space-y-2 font-mono text-[9px] uppercase tracking-widest">
                <div className="flex justify-between gap-10"><span>LINK:</span> <span className="text-green-500 font-bold">NODE_STABLE</span></div>
                <div className="flex justify-between gap-10"><span>GRAV:</span> <span className={isAlert ? 'text-red-500 animate-pulse' : 'text-white'}>{isAlert ? 'CRITICAL' : 'NOMINAL'}</span></div>
                <div className="flex justify-between gap-10"><span>SYNC:</span> <span className="text-aether-accent">{activeModule || 'WAITING'}</span></div>
             </div>
          </div>
          
          <div className="flex flex-col gap-3">
             {activeModule && (
                <div className="px-5 py-3 bg-aether-accent/10 border border-aether-accent/40 rounded-xl flex items-center gap-4 animate-in slide-in-from-right duration-500">
                   {activeModule === 'FILES' && <Database size={16} className="text-aether-accent" />}
                   {activeModule === 'AI' && <Cpu size={16} className="text-aether-accent" />}
                   {activeModule === 'PREVIEW' && <Eye size={16} className="text-aether-accent" />}
                   <span className="text-[10px] font-black text-aether-accent uppercase tracking-widest">{activeModule} MODULE SYNCED</span>
                </div>
             )}
             {isAlert && <div className="px-6 py-3 bg-red-600 text-white font-black uppercase tracking-[0.3em] rounded-full animate-pulse shadow-[0_0_30px_red] text-center text-[10px]">Structural Failure</div>}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
           <div className="max-w-4xl w-full bg-black/90 border-2 border-white/10 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-3xl text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-aether-accent to-transparent animate-pulse"></div>
              <p className="text-white font-mono text-lg md:text-3xl leading-relaxed tracking-tight">
                 <span className="text-aether-accent font-black mr-4 uppercase tracking-widest text-sm md:text-lg block mb-2 opacity-50">Transmitting:</span>
                 {dialogue}
              </p>
           </div>
           {showSkip && (
            <button onClick={onComplete} className="text-white/20 hover:text-white uppercase text-[9px] tracking-[0.5em] flex items-center gap-3 transition-colors">
                Skip Re-entry <FastForward size={14} />
            </button>
           )}
        </div>
      </div>
      
      <div className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-[3s]" style={{ opacity: frostOpacity, background: 'radial-gradient(circle, transparent 20%, rgba(180, 240, 255, 0.4) 100%)' }} />
    </div>
  );
};

export default WelcomeAnimation;
