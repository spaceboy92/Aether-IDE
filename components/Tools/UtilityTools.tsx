
import React, { useState } from 'react';
import { X, Wand2, Palette } from 'lucide-react';

interface UtilityToolsProps {
    activeTool: string;
    onClose: () => void;
}

const UtilityTools: React.FC<UtilityToolsProps> = ({ activeTool, onClose }) => {
    const [regex, setRegex] = useState('');
    const [testStr, setTestStr] = useState('');
    const [color, setColor] = useState('#00d4ff');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95">
            <div className="w-[400px] bg-aether-panel border border-aether-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-3 border-b border-aether-border flex justify-between items-center bg-black/40">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        {activeTool === 'tool_regex' ? <Wand2 size={16} className="text-aether-accent"/> : <Palette size={16} className="text-aether-accent"/>}
                        {activeTool === 'tool_regex' ? 'Regex Tester' : 'Neural Palette'}
                    </h3>
                    <button onClick={onClose}><X size={18} className="text-aether-muted hover:text-white" /></button>
                </div>
                
                <div className="p-4 space-y-4">
                    {activeTool === 'tool_regex' ? (
                        <>
                            <div>
                                <label className="text-xs text-aether-muted uppercase font-bold">Pattern</label>
                                <input type="text" className="w-full bg-black border border-white/10 rounded p-2 text-sm text-yellow-400 font-mono" value={regex} onChange={e => setRegex(e.target.value)} placeholder="/^[a-z]+$/" />
                            </div>
                            <div>
                                <label className="text-xs text-aether-muted uppercase font-bold">Test String</label>
                                <input type="text" className="w-full bg-black border border-white/10 rounded p-2 text-sm text-white font-mono" value={testStr} onChange={e => setTestStr(e.target.value)} />
                            </div>
                            <div className="p-3 bg-black/40 rounded border border-white/5">
                                <div className="text-[10px] text-aether-muted uppercase font-bold mb-1">Result</div>
                                {(() => {
                                    try {
                                        const r = new RegExp(regex);
                                        const match = r.test(testStr);
                                        return <span className={match ? "text-green-500 font-bold" : "text-red-500 font-bold"}>{match ? "MATCH FOUND" : "NO MATCH"}</span>;
                                    } catch(e) { return <span className="text-red-500">Invalid Regex</span>; }
                                })()}
                            </div>
                        </>
                    ) : (
                        <>
                           <div className="flex gap-4">
                                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-20 h-20 rounded cursor-pointer" />
                                <div className="space-y-2 flex-1">
                                    <div>
                                        <label className="text-xs text-aether-muted uppercase font-bold">HEX</label>
                                        <input type="text" readOnly value={color} className="w-full bg-black border border-white/10 rounded p-1 text-xs text-white font-mono" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-aether-muted uppercase font-bold">RGB</label>
                                        <input type="text" readOnly value={`rgb(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)})`} className="w-full bg-black border border-white/10 rounded p-1 text-xs text-white font-mono" />
                                    </div>
                                </div>
                           </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UtilityTools;
