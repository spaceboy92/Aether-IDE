
import React, { useState, useEffect, useRef } from 'react';
import { Box, Play, Pause, Layers, Clock, Settings, Save, Smartphone, Monitor, Gamepad2, Film, X, Plus, Trash2, ChevronDown } from 'lucide-react';

interface GameEngineStudioProps {
  type: '2D' | '3D';
  onSave?: () => void;
  onClose: () => void;
  onInjectCode?: (snippet: string) => void;
}

interface Entity {
    id: number;
    name: string;
    type: 'cube' | 'sphere' | 'light' | 'camera';
}

const GameEngineStudio: React.FC<GameEngineStudioProps> = ({ type, onClose, onInjectCode }) => {
  const [activeTab, setActiveTab] = useState<'scene' | 'anim' | 'assets'>('scene');
  const [entities, setEntities] = useState<Entity[]>([
      { id: 1, name: 'Main_Camera', type: 'camera' },
      { id: 2, name: 'Directional_Light', type: 'light' },
      { id: 3, name: 'Player_Cube', type: 'cube' }
  ]);
  const [selectedEntityId, setSelectedEntityId] = useState<number>(3);
  
  // Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = 10; // seconds
  const timelineRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Playback Loop
  useEffect(() => {
      if (isPlaying) {
          lastTimeRef.current = performance.now();
          const loop = (time: number) => {
              const delta = (time - lastTimeRef.current) / 1000;
              lastTimeRef.current = time;
              
              setCurrentTime(prev => {
                  const next = prev + delta;
                  return next >= totalDuration ? 0 : next; // Loop
              });
              
              animationFrameRef.current = requestAnimationFrame(loop);
          };
          animationFrameRef.current = requestAnimationFrame(loop);
      } else {
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      }
      
      return () => {
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSeek = (e: React.MouseEvent) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.min(Math.max(x / rect.width, 0), 1);
      setCurrentTime(percentage * totalDuration);
  };

  const formatTime = (t: number) => {
      const min = Math.floor(t / 60);
      const sec = Math.floor(t % 60);
      const ms = Math.floor((t % 1) * 100);
      return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}:${ms.toString().padStart(2,'0')}`;
  };

  const addEntity = () => {
      const id = Date.now();
      setEntities([...entities, { id, name: `Entity_${id.toString().slice(-4)}`, type: 'cube' }]);
      setSelectedEntityId(id);
  };

  const deleteEntity = (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setEntities(entities.filter(ent => ent.id !== id));
      if (selectedEntityId === id) setSelectedEntityId(entities[0]?.id || 0);
  };

  const handleDeploy = () => {
      alert("Game packaged successfully! Deployment to Aether Cloud initiating...");
  };

  return (
    <div className="h-full w-full flex flex-col bg-aether-bg overflow-hidden border border-white/5 rounded-xl">
      <div className="h-10 bg-aether-panel border-b border-aether-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-aether-accent">
                {type === '3D' ? <Box size={16} /> : <Layers size={16} />}
                <span className="text-[10px] font-bold uppercase tracking-widest">Aether {type} Runtime</span>
            </div>
            <div className="h-4 w-[1px] bg-aether-border mx-2"></div>
            <div className="flex gap-1">
                {['scene', 'anim', 'assets'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-aether-accent text-black' : 'text-aether-muted hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex items-center gap-3">
             <button className="p-1.5 text-aether-muted hover:text-aether-accent transition-colors" title="Run Simulation"><Gamepad2 size={14} /></button>
             <button className="p-1.5 text-aether-muted hover:text-aether-accent transition-colors" title="Project Settings"><Settings size={14} /></button>
             <button onClick={handleDeploy} className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-[10px] font-bold hover:bg-green-500 hover:text-white transition-all">
                <Save size={12} />
                Deploy Game
             </button>
             <div className="h-4 w-[1px] bg-aether-border mx-1"></div>
             <button onClick={onClose} className="p-1.5 text-aether-muted hover:text-red-400 transition-colors" title="Close Studio">
                <X size={16} />
             </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Hierarchy */}
        <div className="w-64 border-r border-aether-border bg-aether-panel flex flex-col shrink-0">
            <div className="p-3 border-b border-aether-border text-[9px] font-bold text-aether-muted uppercase tracking-widest flex items-center justify-between bg-black/20">
                Scene Hierarchy
                <button onClick={addEntity} className="p-1 hover:text-white bg-white/5 rounded transition-colors"><Plus size={10} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {entities.map(ent => (
                    <div 
                        key={ent.id} 
                        onClick={() => setSelectedEntityId(ent.id)}
                        className={`group px-3 py-2 border rounded-lg text-[10px] cursor-pointer flex items-center justify-between transition-all ${
                            selectedEntityId === ent.id 
                            ? 'bg-aether-accent/10 border-aether-accent text-white' 
                            : 'bg-black/40 border-white/5 text-white/70 hover:border-aether-accent/40'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {ent.type === 'camera' ? <Film size={10} className="text-blue-400" /> : 
                             ent.type === 'light' ? <Settings size={10} className="text-yellow-400" /> :
                             <Box size={10} className={selectedEntityId === ent.id ? 'text-aether-accent' : 'text-white/50'} />}
                            {ent.name}
                        </div>
                        <button onClick={(e) => deleteEntity(ent.id, e)} className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1"><Trash2 size={10} /></button>
                    </div>
                ))}
            </div>
        </div>

        {/* Main Viewport */}
        <div className="flex-1 relative bg-black flex flex-col min-w-0">
            <div className="flex-1 relative group overflow-hidden bg-gradient-to-b from-[#111] to-[#000]">
                {/* 3D Grid Floor Simulation */}
                <div className="absolute inset-0 opacity-20" style={{ 
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)',
                    transformOrigin: 'bottom center'
                }}></div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className={`transition-transform duration-100 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
                        {type === '3D' ? <Box size={120} className="text-aether-accent drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]" /> : <Layers size={120} className="text-aether-accent" />}
                     </div>
                </div>
                
                {/* HUD */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-mono text-white/50">
                        FPS: <span className="text-green-500">60.0</span>
                    </div>
                    <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-mono text-white/50">
                        Entities: {entities.length}
                    </div>
                </div>
                <div className="absolute bottom-4 right-4 flex bg-black/80 backdrop-blur border border-white/10 rounded-xl p-1 gap-1">
                    <button className="p-2 text-aether-muted hover:text-white rounded hover:bg-white/10 transition-colors"><Monitor size={16} /></button>
                    <button className="p-2 text-aether-muted hover:text-white rounded hover:bg-white/10 transition-colors"><Smartphone size={16} /></button>
                </div>
            </div>

            {/* Animation Studio Timeline */}
            <div className="h-48 border-t border-aether-border bg-aether-panel flex flex-col shrink-0 select-none">
                <div className="h-8 bg-black/40 border-b border-aether-border flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Film size={12} className="text-aether-secondary" />
                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">Animation Studio</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <button onClick={togglePlay} className={`p-1.5 rounded hover:text-white transition-colors ${isPlaying ? 'text-aether-accent bg-aether-accent/10' : 'text-aether-muted'}`}>
                             {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                         </button>
                         <div className="h-4 w-[1px] bg-aether-border"></div>
                         <div className="text-[9px] font-mono text-aether-accent w-20 text-center">{formatTime(currentTime)} <span className="text-white/30">/</span> {formatTime(totalDuration)}</div>
                    </div>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-32 border-r border-aether-border shrink-0 bg-black/20 p-2 space-y-1">
                        <div className="text-[8px] text-aether-muted font-bold uppercase mb-2 px-1">Properties</div>
                        <div className="h-6 bg-white/5 rounded px-2 flex items-center justify-between text-[9px] text-white/70 border border-white/5 hover:border-aether-accent/30 cursor-pointer">
                            <span>Position</span>
                            <Settings size={8} className="opacity-50" />
                        </div>
                        <div className="h-6 bg-white/5 rounded px-2 flex items-center justify-between text-[9px] text-white/70 border border-white/5 hover:border-aether-accent/30 cursor-pointer">
                            <span>Rotation</span>
                            <Settings size={8} className="opacity-50" />
                        </div>
                        <div className="h-6 bg-white/5 rounded px-2 flex items-center justify-between text-[9px] text-white/70 border border-white/5 hover:border-aether-accent/30 cursor-pointer">
                            <span>Scale</span>
                            <Settings size={8} className="opacity-50" />
                        </div>
                    </div>
                    
                    <div 
                        className="flex-1 relative overflow-hidden bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_100%] cursor-crosshair"
                        ref={timelineRef}
                        onClick={handleSeek}
                    >
                        {/* Playhead */}
                        <div 
                            className="absolute top-0 bottom-0 w-[1px] bg-aether-accent shadow-[0_0_10px_#00d4ff] z-20 pointer-events-none"
                            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                        >
                            <div className="absolute top-0 -translate-x-1/2 -mt-1 text-aether-accent"><ChevronDown size={10} fill="currentColor" /></div>
                        </div>

                        {/* Keyframes - Position */}
                        <div className="absolute top-[13px] left-[10%] w-2 h-2 rounded-full bg-aether-secondary border border-white/20 hover:scale-150 transition-transform cursor-pointer shadow-glow z-10" title="Keyframe: Start"></div>
                        <div className="absolute top-[13px] left-[40%] w-2 h-2 rounded-full bg-aether-secondary border border-white/20 hover:scale-150 transition-transform cursor-pointer shadow-glow z-10" title="Keyframe: Mid"></div>
                        <div className="absolute top-[13px] left-[80%] w-2 h-2 rounded-full bg-aether-secondary border border-white/20 hover:scale-150 transition-transform cursor-pointer shadow-glow z-10" title="Keyframe: End"></div>
                        
                        {/* Keyframes - Rotation */}
                        <div className="absolute top-[41px] left-[30%] w-2 h-2 rounded-full bg-aether-accent border border-white/20 hover:scale-150 transition-transform cursor-pointer shadow-glow z-10"></div>
                        <div className="absolute top-[41px] left-[60%] w-2 h-2 rounded-full bg-aether-accent border border-white/20 hover:scale-150 transition-transform cursor-pointer shadow-glow z-10"></div>

                        {/* Connecting Lines */}
                        <div className="absolute top-[17px] left-[10%] w-[30%] h-[1px] bg-aether-secondary/30 pointer-events-none"></div>
                        <div className="absolute top-[17px] left-[40%] w-[40%] h-[1px] bg-aether-secondary/30 pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Sidebar: Inspector */}
        <div className="w-64 border-l border-aether-border bg-aether-panel flex flex-col shrink-0">
            <h5 className="text-[9px] font-bold text-aether-muted uppercase tracking-widest border-b border-aether-border p-3">
                Inspector
            </h5>
            <div className="p-4 space-y-6 overflow-y-auto">
                <div className="space-y-1">
                    <label className="text-[8px] uppercase font-bold text-white/40">Name</label>
                    <input 
                        type="text" 
                        value={entities.find(e => e.id === selectedEntityId)?.name || ''}
                        readOnly 
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-aether-accent"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[8px] uppercase font-bold text-white/40">Transform</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['X','Y','Z'].map(l => (
                            <div key={l} className="bg-black/40 border border-white/5 rounded p-1 text-center group hover:border-aether-accent/30 transition-colors">
                                <div className="text-[7px] text-aether-accent group-hover:text-white cursor-ew-resize select-none">{l}</div>
                                <div className="text-[10px] text-white">{(Math.sin(currentTime + (l==='X'?0:l==='Y'?1:2)) * 5).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[8px] uppercase font-bold text-white/40">Rotation</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['X','Y','Z'].map(l => (
                            <div key={l} className="bg-black/40 border border-white/5 rounded p-1 text-center group hover:border-aether-accent/30 transition-colors">
                                <div className="text-[7px] text-aether-secondary group-hover:text-white cursor-ew-resize select-none">{l}</div>
                                <div className="text-[10px] text-white">{(currentTime * 10 % 360).toFixed(1)}°</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[8px] uppercase font-bold text-white/40">Material</label>
                    <div className="w-full h-8 bg-aether-secondary/10 border border-aether-secondary/40 rounded flex items-center px-3 justify-between cursor-pointer hover:bg-aether-secondary/20 transition-colors">
                        <span className="text-[10px] text-white">Neon_Glass</span>
                        <div className="w-4 h-4 rounded bg-aether-secondary shadow-[0_0_10px_#a855f7]"></div>
                    </div>
                </div>
                
                <div className="pt-4 border-t border-white/5">
                    <button className="w-full py-1.5 rounded bg-white/5 hover:bg-white/10 text-[9px] text-white font-bold uppercase tracking-widest transition-colors border border-white/5">
                        Add Component
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GameEngineStudio;
