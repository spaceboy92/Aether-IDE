
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Play, Save, Terminal as TerminalIcon, Activity, Layers, Database, Code2, Cpu, X, Box, Settings, AlertTriangle } from 'lucide-react';

interface AIModelStudioProps {
    onClose: () => void;
}

const AIModelStudio: React.FC<AIModelStudioProps> = ({ onClose }) => {
    const [isTraining, setIsTraining] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [lossData, setLossData] = useState<number[]>([]);
    const [accData, setAccData] = useState<number[]>([]);
    const [currentEpoch, setCurrentEpoch] = useState(0);
    const [model, setModel] = useState<any | null>(null); // Use any because TF is loaded dynamically
    const [status, setStatus] = useState("Initializing...");
    const [tfReady, setTfReady] = useState(false);

    // Model Config
    const [layers, setLayers] = useState([
        { type: 'dense', units: 32, activation: 'relu' },
        { type: 'dense', units: 1, activation: 'sigmoid' } // Default XOR output
    ]);
    const [learningRate, setLearningRate] = useState(0.1);
    const [epochs, setEpochs] = useState(200);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load TensorFlow.js dynamically to prevent build/load errors
    useEffect(() => {
        const loadTF = async () => {
            if ((window as any).tf) {
                setTfReady(true);
                setStatus("Ready (Cached)");
                addLog("TensorFlow.js Core Loaded (Cached).");
                return;
            }

            try {
                addLog("Fetching TensorFlow.js core...");
                const script = document.createElement('script');
                // Use a specific version to ensure compatibility
                script.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js";
                script.async = true;
                script.onload = () => {
                    const tf = (window as any).tf;
                    if (tf) {
                        setTfReady(true);
                        setStatus("Ready");
                        const ver = tf.version ? tf.version.tfjs : 'Unknown';
                        addLog(`TensorFlow.js v${ver} Initialized.`);
                    } else {
                        setStatus("Error");
                        addLog("TF loaded but object missing.");
                    }
                };
                script.onerror = () => {
                    setStatus("Error Loading TF");
                    addLog("Failed to load TensorFlow.js from CDN.");
                };
                document.body.appendChild(script);
            } catch (e: any) {
                setStatus("Error");
                addLog("TF Load Error: " + e.message);
            }
        };
        loadTF();
    }, []);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const getTF = () => (window as any).tf;

    const buildModel = () => {
        const tf = getTF();
        if (!tf) return null;

        const m = tf.sequential();
        layers.forEach((layer, i) => {
            if (layer.type === 'dense') {
                m.add(tf.layers.dense({
                    units: layer.units,
                    activation: layer.activation as any,
                    inputShape: i === 0 ? [2] : undefined // Default input shape 2 for XOR
                }));
            }
        });
        m.compile({
            optimizer: tf.train.sgd(learningRate),
            loss: 'meanSquaredError',
            metrics: ['accuracy']
        });
        setModel(m);
        addLog(`Model compiled with ${layers.length} layers.`);
        return m;
    };

    const trainModel = async () => {
        if (isTraining || !tfReady) return;
        
        const tf = getTF();
        if (!tf) {
            addLog("TensorFlow not ready.");
            return;
        }

        setIsTraining(true);
        setStatus("Training...");
        setLossData([]);
        setAccData([]);
        
        // Rebuild model if needed or reuse
        let m = model;
        if (!m) {
             m = buildModel();
        }
        
        if (!m) {
            setIsTraining(false);
            addLog("Failed to build model.");
            return;
        }

        // XOR Data
        const xs = tf.tensor2d([[0, 0], [0, 1], [1, 0], [1, 1]], [4, 2]);
        const ys = tf.tensor2d([[0], [1], [1], [0]], [4, 1]);

        addLog("Starting training on XOR dataset...");

        try {
            await m.fit(xs, ys, {
                epochs: epochs,
                callbacks: {
                    onEpochEnd: async (epoch: number, logs: any) => {
                        setCurrentEpoch(epoch + 1);
                        if (logs) {
                            setLossData(prev => [...prev, logs.loss]);
                            setAccData(prev => [...prev, logs.acc]);
                        }
                        // Yield to UI thread to prevent freeze
                        await tf.nextFrame();
                    }
                }
            });
            addLog("Training Complete.");
            setStatus("Idle");
        } catch (err: any) {
            addLog("Error: " + err.message);
            setStatus("Error");
        }
        
        setIsTraining(false);
        xs.dispose();
        ys.dispose();
    };

    // Draw Visualization Graph
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = h * (i / 4);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        if (lossData.length === 0) {
            ctx.fillStyle = '#333';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText("NO METRICS DATA", w/2, h/2);
            return;
        }

        // Draw Loss
        if (lossData.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#ef4444'; // Red for Loss
            ctx.lineWidth = 2;
            const maxLoss = Math.max(...lossData, 0.5);
            lossData.forEach((val, i) => {
                const x = (i / epochs) * w;
                const y = h - (val / maxLoss) * h; // Normalize
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        }

        // Draw Accuracy
        if (accData.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#22c55e'; // Green for Acc
            ctx.lineWidth = 2;
            accData.forEach((val, i) => {
                const x = (i / epochs) * w;
                const y = h - (val * h); // Acc is 0-1
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        }

    }, [lossData, accData, epochs]);

    return (
        <div className="h-full w-full flex flex-col bg-[#050505] text-white">
            {/* Pro Header */}
            <div className="h-14 border-b border-aether-border bg-black flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <Brain size={24} className="text-purple-500 animate-pulse" />
                    <div>
                        <h2 className="text-base font-bold uppercase tracking-widest text-white">Neural Lab <span className="text-purple-500">PRO</span></h2>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isTraining ? 'bg-yellow-500 animate-ping' : (tfReady ? 'bg-green-500' : 'bg-red-500')}`}></span>
                            <span className="text-[10px] text-aether-muted font-mono">{status} | {tfReady ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {!tfReady && (
                        <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-[10px] font-bold">
                            <AlertTriangle size={12} />
                            INITIALIZING ENGINE...
                        </div>
                    )}
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                        <Cpu size={14} className="text-aether-accent" />
                        <span className="text-xs font-mono">CPU Mode</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-aether-muted hover:text-white transition-colors"><X size={20} /></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Config & Layers */}
                <div className="w-80 border-r border-aether-border bg-aether-panel flex flex-col">
                    <div className="p-4 border-b border-aether-border">
                        <h3 className="text-xs font-bold text-aether-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Settings size={14} /> Model Configuration
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-gray-400 font-bold block mb-1">Learning Rate</label>
                                <input 
                                    type="number" step="0.01" 
                                    value={learningRate} 
                                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                                    className="w-full bg-black border border-white/10 rounded p-2 text-xs text-white font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 font-bold block mb-1">Epochs</label>
                                <input 
                                    type="number"
                                    value={epochs} 
                                    onChange={(e) => setEpochs(parseInt(e.target.value))}
                                    className="w-full bg-black border border-white/10 rounded p-2 text-xs text-white font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        <h3 className="text-xs font-bold text-aether-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Layers size={14} /> Layer Stack
                        </h3>
                        <div className="space-y-2">
                            {layers.map((l, i) => (
                                <div key={i} className="bg-black/40 border border-purple-500/30 rounded p-3 relative group">
                                    <div className="text-xs font-bold text-purple-300 uppercase mb-1">{l.type.toUpperCase()}</div>
                                    <div className="text-[10px] text-gray-400 font-mono">
                                        Units: {l.units} | Act: {l.activation}
                                    </div>
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-purple-500/50 rounded-r"></div>
                                </div>
                            ))}
                            <button className="w-full py-2 border border-dashed border-white/10 rounded text-xs text-gray-500 hover:text-white hover:border-white/30 transition-all">
                                + Add Layer
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border-t border-aether-border bg-black/20">
                        <button 
                            onClick={trainModel}
                            disabled={isTraining || !tfReady}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isTraining || !tfReady ? 'bg-white/10 text-white/50 cursor-wait' : 'bg-green-600 hover:bg-green-500 text-white shadow-glow'}`}
                        >
                            {isTraining ? <Activity size={16} className="animate-spin" /> : <Play size={16} />}
                            {isTraining ? `Training (Ep ${currentEpoch})` : (tfReady ? 'Start Training' : 'Loading Engine...')}
                        </button>
                    </div>
                </div>

                {/* MIDDLE: Visualizer */}
                <div className="flex-1 flex flex-col bg-[#0a0a0a] relative p-6">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-20"></div>
                    
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-xl font-bold text-white tracking-tight">Real-time Metrics</h3>
                        <div className="flex gap-4 text-xs font-mono">
                            <div className="flex items-center gap-2 text-red-400">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div> Loss: {lossData[lossData.length-1]?.toFixed(4) || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div> Acc: {accData[accData.length-1]?.toFixed(4) || 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-black border border-white/10 rounded-xl relative overflow-hidden shadow-2xl">
                        <canvas ref={canvasRef} width={800} height={400} className="w-full h-full object-contain" />
                        {lossData.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-aether-muted opacity-30">
                                <Activity size={64} className="mb-4" />
                                <span className="text-sm font-mono">Waiting for training data...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Logs */}
                <div className="w-80 border-l border-aether-border bg-black flex flex-col">
                    <div className="h-10 bg-aether-panel border-b border-aether-border flex items-center px-4 gap-2">
                        <TerminalIcon size={14} className="text-aether-muted" />
                        <span className="text-xs font-bold text-aether-muted uppercase tracking-widest">Console Output</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1 text-gray-400 custom-scrollbar">
                        {logs.map((log, i) => (
                            <div key={i} className="break-words border-l-2 border-white/10 pl-2">
                                <span className="text-purple-400">&gt;</span> {log}
                            </div>
                        ))}
                        <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIModelStudio;
