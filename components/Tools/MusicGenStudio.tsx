
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic, Sliders, Download, Music, Disc, Activity, Volume2, Wand2, X, ChevronDown, ChevronRight, Search, Zap, Layers, Radio, Sparkles } from 'lucide-react';
import { generateMusicalScore } from '../../services/geminiService';

interface Track {
    id: string;
    title: string;
    duration: string;
    genre: string;
    subGenre: string;
    timestamp: number;
    prompt: string;
    coverColor: string;
    scoreData?: any; // The Tone.js JSON data
}

// Extensive Genre Database
const GENRE_DB: Record<string, string[]> = {
    "POP": ["Pop", "Dance Pop", "Teen Pop", "Electropop", "Synth Pop", "Indie Pop", "Art Pop", "Dream Pop", "Hyperpop", "K-Pop", "J-Pop", "C-Pop", "Latin Pop", "Europop", "Power Pop", "Pop Rock"],
    "ROCK": ["Rock", "Classic Rock", "Hard Rock", "Soft Rock", "Arena Rock", "Progressive Rock", "Psychedelic Rock", "Experimental Rock", "Alternative Rock", "Indie Rock", "Garage Rock", "Post-Rock", "Math Rock", "Noise Rock", "Art Rock", "Glam Rock", "Surf Rock", "Grunge", "Shoegaze", "Stoner Rock", "Desert Rock", "Sludge Rock", "Space Rock"],
    "METAL": ["Heavy Metal", "Thrash Metal", "Death Metal", "Black Metal", "Doom Metal", "Power Metal", "Speed Metal", "Symphonic Metal", "Folk Metal", "Viking Metal", "Progressive Metal", "Groove Metal", "Nu Metal", "Industrial Metal", "Extreme Metal", "Technical Death Metal", "Melodic Death Metal", "Atmospheric Black Metal", "Depressive Black Metal", "Deathcore", "Metalcore"],
    "ELECTRONIC": ["Electronic", "EDM", "House", "Techno", "Trance", "Dubstep", "Drum & Bass", "Jungle", "Breakbeat", "Electro", "Deep House", "Tech House", "Progressive House", "Tropical House", "Acid House", "Funky House", "Minimal Techno", "Detroit Techno", "Industrial Techno", "Hard Techno", "Acid Techno", "Bass & Experimental", "Future Bass", "Trap (EDM)", "Glitch", "IDM", "Ambient", "Downtempo"],
    "HIP-HOP": ["Hip-Hop", "Rap", "Boom Bap", "Trap", "Drill", "Conscious Rap", "Gangsta Rap", "Alternative Hip-Hop", "Underground Rap", "Cloud Rap", "Emo Rap", "Horrorcore", "East Coast Rap", "West Coast Rap", "Southern Rap", "UK Rap", "Desi Hip-Hop"],
    "R&B/SOUL": ["R&B", "Soul", "Neo Soul", "Contemporary R&B", "Alternative R&B", "Funk", "Quiet Storm", "Gospel"],
    "JAZZ": ["Jazz", "Smooth Jazz", "Bebop", "Hard Bop", "Cool Jazz", "Modal Jazz", "Free Jazz", "Fusion", "Latin Jazz", "Swing", "Big Band"],
    "CLASSICAL": ["Classical", "Baroque", "Romantic", "Contemporary Classical", "Minimalism", "Opera", "Symphony", "Chamber Music", "Choral", "Film Score"],
    "FOLK": ["Folk", "Indie Folk", "Acoustic Folk", "Country Folk", "Celtic Folk", "Nordic Folk", "Tribal Music", "Ethnic Music", "World Music"],
    "COUNTRY": ["Country", "Classic Country", "Modern Country", "Country Pop", "Country Rock", "Bluegrass", "Americana", "Outlaw Country"],
    "LATIN": ["Latin", "Reggaeton", "Salsa", "Bachata", "Merengue", "Latin Trap", "Latin Pop", "Regional Mexican", "Flamenco"],
    "REGIONAL": ["Indian", "Carnatic", "Hindustani", "Bollywood", "Kollywood", "Tollywood", "Indie Indian", "Desi Pop", "Devotional", "Bhajan", "Qawwali", "African", "Afrobeats", "Afro-House", "Highlife", "Soukous", "Amapiano", "Middle Eastern", "Arabic Pop", "Persian Classical", "Sufi", "Turkish Folk"],
    "AMBIENT": ["Ambient", "Chillout", "Lo-Fi", "Study Beats", "Meditation Music", "Healing Frequencies", "Nature Sounds", "New Age"],
    "EXPERIMENTAL": ["Phonk", "Vaporwave", "Synthwave", "Retrowave", "Cyberpunk", "Industrial", "Noise", "Darkwave", "Witch House"],
    "MEDIA": ["Video Game Music", "Anime OST", "Movie OST", "Background Score", "Trailer Music", "Commercial Music"],
    "FUSION": ["Jazz Hop", "Folk Metal", "Rap Rock", "Electronic Rock", "EDM Classical Fusion", "Devotional EDM", "Phonk Devotional", "AI-Generated Music"]
};

interface MusicGenStudioProps {
    onClose: () => void;
}

const MusicGenStudio: React.FC<MusicGenStudioProps> = ({ onClose }) => {
    // Generation State
    const [prompt, setPrompt] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<string>('Auto'); // Default to Auto
    const [duration, setDuration] = useState<number>(30); // Seconds
    const [hasLyrics, setHasLyrics] = useState(false);
    
    // Playback State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStep, setGenerationStep] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [library, setLibrary] = useState<Track[]>([]);
    const [volume, setVolume] = useState(0.5);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const toneRef = useRef<any>(null); // Store Tone.js instance
    const synthsRef = useRef<any[]>([]);
    const transportRef = useRef<any>(null);

    // Load Tone.js dynamically
    useEffect(() => {
        if (!window.document.getElementById('tonejs-script')) {
            const script = document.createElement('script');
            script.id = 'tonejs-script';
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js';
            script.async = true;
            script.onload = () => {
                // @ts-ignore
                toneRef.current = window.Tone;
                console.log("Tone.js Loaded");
            };
            document.body.appendChild(script);
        } else {
            // @ts-ignore
            if (window.Tone) toneRef.current = window.Tone;
        }

        return () => {
            stopPlayback();
        };
    }, []);

    // Visualizer Loop
    useEffect(() => {
        if (!isPlaying || !currentTrack) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const draw = () => {
            if(!isPlaying) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bars = 64;
            const barWidth = canvas.width / bars;
            const time = Date.now() / 1000;
            
            // Sync visualization to Tone.js meter if possible, else fallback to math
            for (let i = 0; i < bars; i++) {
                const x = i * barWidth;
                
                // Visualization based on track BPM if available
                const bpm = currentTrack.scoreData?.bpm || 120;
                const speed = bpm / 60;
                
                let height = Math.sin(time * speed * 5 + i * 0.2) * 50 + Math.cos(time * speed * 2 + i * 0.1) * 30;
                height = Math.abs(height) + 10;
                
                // Color based on genre/cover
                const hue = (i / bars) * 360 + (time * 50); 
                const gradient = ctx.createLinearGradient(0, canvas.height - height * 2, 0, canvas.height);
                gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0)`);
                gradient.addColorStop(0.5, currentTrack.coverColor);
                gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0.8)`);

                ctx.fillStyle = gradient;
                
                const y = (canvas.height - height) / 2;
                ctx.fillRect(x, y, barWidth - 1, height);
            }
            
            // Update time display from Tone.js Transport
            if (toneRef.current) {
                const Tone = toneRef.current;
                setCurrentTime(Tone.Transport.seconds);
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, currentTrack]);

    const handleGenerate = async () => {
        if (!prompt.trim() && selectedGenre !== 'Auto') {
             // If manual genre is selected, prompt is optional (we can generate just based on genre)
        } else if (!prompt.trim()) {
             // If Auto, we need a prompt
             if (selectedGenre === 'Auto') {
                 alert("Please describe the music you want to generate.");
                 return;
             }
        }

        if (!toneRef.current) {
            alert("Audio Engine loading... please wait.");
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(10);
        setGenerationStep(selectedGenre === 'Auto' ? "Analyzing prompt for genre traits..." : "Initializing Neural Composition...");

        // Start Tone Context
        await toneRef.current.start();

        setGenerationProgress(30);
        setGenerationStep(`Composing...`);

        // CALL GEMINI API
        const score = await generateMusicalScore(prompt, selectedGenre);
        
        if (!score) {
            setIsGenerating(false);
            alert("Composition failed. The muse is silent.");
            return;
        }

        setGenerationProgress(70);
        setGenerationStep("Synthesizing audio buffers...");

        // Generate a random cover color based on genre
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // Use inferred genre if available
        const finalGenre = score.detectedGenre || selectedGenre;

        const newTrack: Track = {
            id: Date.now().toString(),
            title: score.title || `${finalGenre} Track`,
            genre: selectedCategory || 'AI',
            subGenre: finalGenre,
            duration: `00:30`, // Placeholder, actual duration depends on loop
            timestamp: Date.now(),
            prompt: prompt,
            coverColor: randomColor,
            scoreData: score
        };

        setLibrary([newTrack, ...library]);
        setCurrentTrack(newTrack);
        setGenerationProgress(100);
        setGenerationStep("Complete.");
        
        setTimeout(() => {
            setIsGenerating(false);
            playTrack(newTrack);
        }, 500);
    };

    const stopPlayback = () => {
        if (toneRef.current) {
            toneRef.current.Transport.stop();
            toneRef.current.Transport.cancel();
            synthsRef.current.forEach(s => s.dispose());
            synthsRef.current = [];
        }
        setIsPlaying(false);
    };

    const playTrack = async (track: Track) => {
        if (!toneRef.current || !track.scoreData) return;
        const Tone = toneRef.current;

        // Stop previous
        stopPlayback();

        // Setup BPM
        Tone.Transport.bpm.value = track.scoreData.bpm;
        setTotalDuration(10); // Loop logic is hard to estimate exact duration without analysis

        // Create Instruments
        track.scoreData.tracks.forEach((t: any) => {
            let synth;
            if (t.type === 'metal') synth = new Tone.MetalSynth().toDestination();
            else if (t.type === 'membrane') synth = new Tone.MembraneSynth().toDestination();
            else synth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: t.type || 'triangle' } }).toDestination();
            
            synth.volume.value = -10 + (volume * 20 - 20); // Map 0-1 volume to dB
            synthsRef.current.push(synth);

            const part = new Tone.Part((time: any, note: any) => {
                if (note.note) {
                    synth.triggerAttackRelease(note.note, note.duration, time);
                }
            }, t.notes);
            
            part.start(0);
            part.loop = true;
            part.loopEnd = "4m"; // 4 bars loop
        });

        Tone.Transport.start();
        setIsPlaying(true);
    };

    const togglePlay = () => {
        if (!toneRef.current) return;
        if (isPlaying) {
            toneRef.current.Transport.pause();
            setIsPlaying(false);
        } else {
            toneRef.current.Transport.start();
            setIsPlaying(true);
        }
    };

    const handleTrackSelect = (track: Track) => {
        setCurrentTrack(track);
        playTrack(track);
    };

    const formatTime = (time: number) => {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div className="flex flex-col h-full bg-aether-bg border border-aether-border rounded-xl overflow-hidden relative">
            
            {/* Top Bar */}
            <div className="h-14 border-b border-aether-border bg-aether-panel flex justify-between items-center px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg shadow-glow">
                        <Music size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">Sonic Architect</h2>
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneRef.current ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            <p className="text-[10px] text-aether-muted">{toneRef.current ? 'Real-time Synthesis Engine Ready' : 'Loading Audio Engine...'}</p>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-aether-muted hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANEL: CONFIGURATION */}
                <div className="w-80 border-r border-aether-border bg-black/20 flex flex-col shrink-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                        
                        {/* Prompt Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-aether-muted uppercase tracking-widest">Prompt</label>
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the melody (e.g., 'A melancholic piano riff in C minor' or 'Aggressive industrial drums')"
                                className="w-full h-24 bg-black/50 border border-aether-border rounded-xl p-3 text-xs text-white focus:border-aether-accent outline-none resize-none transition-all"
                            />
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-aether-muted uppercase tracking-widest">Duration (s)</label>
                                <input 
                                    type="number" 
                                    min="5" max="300" 
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="w-full bg-black/50 border border-aether-border rounded-lg p-2 text-xs text-white outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-aether-muted uppercase tracking-widest">Mode</label>
                                <button 
                                    onClick={() => setHasLyrics(!hasLyrics)}
                                    className={`w-full p-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${hasLyrics ? 'bg-aether-accent text-black border-aether-accent' : 'bg-transparent text-aether-muted border-white/10'}`}
                                >
                                    {hasLyrics ? <Mic size={12} /> : <Activity size={12} />}
                                    {hasLyrics ? 'Lyrics' : 'Instrumental'}
                                </button>
                            </div>
                        </div>

                        {/* Genre Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-aether-muted uppercase tracking-widest flex items-center justify-between">
                                <span>Style Model</span>
                                <span className="text-aether-accent">{selectedGenre}</span>
                            </label>
                            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40">
                                {/* AUTO BUTTON */}
                                <div className="border-b border-white/5">
                                    <button 
                                        onClick={() => { setSelectedCategory(null); setSelectedGenre('Auto'); }}
                                        className={`w-full flex items-center gap-2 p-3 text-xs font-bold hover:bg-white/5 transition-colors ${selectedGenre === 'Auto' ? 'text-aether-accent bg-white/5' : 'text-aether-muted'}`}
                                    >
                                        <Sparkles size={14} />
                                        Auto-Detect from Prompt
                                    </button>
                                </div>

                                {Object.keys(GENRE_DB).map(category => (
                                    <div key={category} className="border-b border-white/5 last:border-0">
                                        <button 
                                            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                                            className={`w-full flex items-center justify-between p-3 text-xs font-bold hover:bg-white/5 transition-colors ${selectedCategory === category ? 'text-white bg-white/5' : 'text-aether-muted'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {selectedCategory === category ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                {category}
                                            </div>
                                            <span className="text-[9px] bg-white/10 px-1.5 rounded text-white/50">{GENRE_DB[category].length}</span>
                                        </button>
                                        
                                        {selectedCategory === category && (
                                            <div className="bg-black/60 p-2 grid grid-cols-2 gap-1 animate-in slide-in-from-top-2">
                                                {GENRE_DB[category].map(genre => (
                                                    <button 
                                                        key={genre}
                                                        onClick={() => setSelectedGenre(genre)}
                                                        className={`text-[10px] text-left px-2 py-1.5 rounded truncate transition-all ${selectedGenre === genre ? 'bg-aether-accent text-black font-bold' : 'text-aether-muted hover:text-white hover:bg-white/10'}`}
                                                    >
                                                        {genre}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-aether-border bg-black/60 backdrop-blur">
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || (!prompt && selectedGenre === 'Auto')}
                            className="w-full py-3 bg-aether-accent text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <Activity size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            {isGenerating ? 'Composing...' : 'Generate Track'}
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL: VISUALIZER & LIBRARY */}
                <div className="flex-1 flex flex-col bg-[#050505] relative">
                    
                    {/* Visualizer Stage */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                        {isGenerating && (
                            <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-24 h-24 relative mb-6">
                                    <div className="absolute inset-0 border-4 border-aether-accent/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-aether-accent border-t-transparent rounded-full animate-spin"></div>
                                    <Zap size={32} className="absolute inset-0 m-auto text-aether-accent animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2 tracking-widest uppercase">Generating</h3>
                                <p className="text-aether-accent font-mono text-sm mb-4">{generationStep}</p>
                                <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-aether-accent transition-all duration-300" style={{ width: `${generationProgress}%` }}></div>
                                </div>
                            </div>
                        )}

                        <canvas 
                            ref={canvasRef} 
                            width={1000} 
                            height={400} 
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />

                        {!currentTrack && !isGenerating && (
                            <div className="text-center opacity-30 select-none pointer-events-none">
                                <Disc size={120} className="mx-auto mb-6 animate-spin-slow" />
                                <h3 className="text-2xl font-bold uppercase tracking-[0.5em]">Aether Audio</h3>
                                <p className="text-sm mt-2 font-mono">Select a genre or enter a prompt to begin</p>
                            </div>
                        )}

                        {currentTrack && !isGenerating && (
                            <div className="relative z-10 text-center">
                                <div 
                                    className="w-48 h-48 mx-auto mb-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/10 relative overflow-hidden group"
                                    style={{ background: `linear-gradient(135deg, ${currentTrack.coverColor}20, #000)` }}
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                    <Disc size={64} className={`text-white/80 transition-all duration-[5s] ${isPlaying ? 'animate-spin' : ''}`} />
                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={togglePlay}>
                                        {isPlaying ? <Pause size={48} className="text-white" fill="white" /> : <Play size={48} className="text-white" fill="white" />}
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg max-w-xl mx-auto leading-tight">{currentTrack.title}</h1>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs text-white font-medium backdrop-blur-md">{currentTrack.subGenre}</span>
                                    <span className="text-xs text-aether-muted font-mono">{currentTrack.duration}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Library & Playback Controls */}
                    <div className="h-64 bg-aether-panel border-t border-aether-border flex flex-col">
                        {/* Playback Bar */}
                        <div className="h-16 border-b border-aether-border flex items-center px-4 gap-4 bg-black/20">
                            <button 
                                onClick={togglePlay}
                                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0"
                            >
                                {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
                            </button>
                            
                            <div className="flex-1 flex flex-col justify-center gap-1">
                                <div className="flex justify-between text-[10px] text-aether-muted font-mono uppercase tracking-widest">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>--:--</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    {/* Progress Bar requires known duration which loops lack in Tone.js without transport manipulation, simplified for this */}
                                    <div className="h-full bg-gradient-to-r from-aether-accent to-aether-secondary rounded-full relative w-full opacity-50"></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-32">
                                <Volume2 size={16} className="text-aether-muted" />
                                <input 
                                    type="range" 
                                    min="0" max="1" step="0.05" 
                                    value={volume} 
                                    onChange={(e) => {
                                        const v = parseFloat(e.target.value);
                                        setVolume(v);
                                        if (toneRef.current) toneRef.current.Destination.volume.value = -10 + (v * 20 - 20);
                                    }}
                                    className="flex-1 h-1 bg-white/20 rounded-full accent-white cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Tracks List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            <div className="text-[10px] font-bold text-aether-muted uppercase tracking-widest px-4 py-2 sticky top-0 bg-aether-panel z-10 flex justify-between">
                                <span>Generated Library ({library.length})</span>
                                <Layers size={12} />
                            </div>
                            
                            {library.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-aether-muted/30 pb-8">
                                    <Music size={32} className="mb-2" />
                                    <span className="text-xs">No tracks generated yet</span>
                                </div>
                            ) : (
                                <div className="space-y-1 px-2">
                                    {library.map((track) => (
                                        <div 
                                            key={track.id}
                                            onClick={() => handleTrackSelect(track)}
                                            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${currentTrack?.id === track.id ? 'bg-white/5 border-aether-accent/50' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}`}
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div 
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                                    style={{ background: `linear-gradient(135deg, ${track.coverColor}40, ${track.coverColor}10)` }}
                                                >
                                                    {currentTrack?.id === track.id && isPlaying ? (
                                                        <Activity size={16} className="text-white animate-pulse" />
                                                    ) : (
                                                        <Music size={16} className="text-white/70" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-xs font-bold truncate ${currentTrack?.id === track.id ? 'text-aether-accent' : 'text-white'}`}>{track.title}</span>
                                                    <div className="flex items-center gap-2 text-[10px] text-aether-muted">
                                                        <span>{track.subGenre}</span>
                                                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                        <span>{track.scoreData?.bpm} BPM</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-aether-muted hover:text-white" title="Download MIDI">
                                                    <Download size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MusicGenStudio;
