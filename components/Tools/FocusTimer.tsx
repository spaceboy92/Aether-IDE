
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';

interface FocusTimerProps {
    onClose: () => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ onClose }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Optional: Play sound here
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const setFocusMode = () => {
        setMode('focus');
        setTimeLeft(25 * 60);
        setIsActive(false);
    };

    const setBreakMode = () => {
        setMode('break');
        setTimeLeft(5 * 60);
        setIsActive(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed top-20 right-4 z-50 w-64 bg-aether-panel border border-aether-border rounded-xl shadow-2xl p-4 flex flex-col animate-in slide-in-from-right-10 fade-in backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-aether-accent flex items-center gap-2">
                    {mode === 'focus' ? <Zap size={14} /> : <Coffee size={14} />}
                    {mode === 'focus' ? 'Neural Sync' : 'Recharge'}
                </h3>
                <button onClick={onClose}><X size={14} className="text-aether-muted hover:text-white" /></button>
            </div>
            
            <div className="text-5xl font-mono font-bold text-center mb-6 text-white tabular-nums tracking-tighter drop-shadow-lg">
                {formatTime(timeLeft)}
            </div>

            <div className="flex justify-center gap-4 mb-4">
                <button onClick={toggleTimer} className={`p-3 rounded-full ${isActive ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-aether-accent/20 text-aether-accent border border-aether-accent/50'} hover:scale-110 transition-transform shadow-glow`}>
                    {isActive ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={resetTimer} className="p-3 rounded-full bg-white/5 border border-white/10 text-aether-muted hover:bg-white/10 hover:text-white transition-colors">
                    <RotateCcw size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={setFocusMode}
                    className={`py-1 text-[10px] font-bold uppercase rounded border transition-all ${mode === 'focus' ? 'bg-aether-accent/10 border-aether-accent text-aether-accent' : 'border-transparent text-aether-muted hover:bg-white/5'}`}
                >
                    Focus (25m)
                </button>
                <button 
                    onClick={setBreakMode}
                    className={`py-1 text-[10px] font-bold uppercase rounded border transition-all ${mode === 'break' ? 'bg-green-500/10 border-green-500 text-green-500' : 'border-transparent text-aether-muted hover:bg-white/5'}`}
                >
                    Break (5m)
                </button>
            </div>
        </div>
    );
};

export default FocusTimer;
