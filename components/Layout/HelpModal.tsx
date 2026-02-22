
import React, { useState } from 'react';
import { X, Terminal, Keyboard, Lock, Unlock, Ghost, FileWarning, Fingerprint } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = () => {
      setUnlocked(true);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-[90%] max-w-4xl h-[85vh] bg-[#050505] border border-aether-border rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="h-16 border-b border-aether-border bg-black/40 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${unlocked ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-aether-muted'}`}>
                {unlocked ? <Unlock size={20} /> : <Lock size={20} />}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight uppercase">
                {unlocked ? 'Classified Mainframe' : 'Restricted Access'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-aether-muted hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
            
            {!unlocked ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-32 h-32 rounded-full bg-red-500/5 border border-red-500/20 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping"></div>
                        <FileWarning size={48} className="text-red-500" />
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-white tracking-widest uppercase">Clearance Required</h3>
                        <p className="text-aether-muted max-w-md mx-auto">
                            The information contained within this sector is classified Level 5. 
                            Unauthorized access triggers immediate neural termination protocols.
                        </p>
                    </div>

                    <button 
                        onClick={handleUnlock}
                        className="group relative px-8 py-4 bg-transparent border border-aether-border hover:border-red-500 rounded-xl overflow-hidden transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-red-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <div className="relative flex items-center gap-3 text-aether-muted group-hover:text-red-500 font-bold uppercase tracking-widest">
                            <Fingerprint size={24} />
                            Decrypt Data
                        </div>
                    </button>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-start gap-4 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                        <Ghost size={32} className="text-red-500 mt-1 animate-pulse" />
                        <div>
                            <h3 className="text-lg font-bold text-red-400 uppercase tracking-widest">System Override Active</h3>
                            <p className="text-sm text-red-300/80 mt-2 leading-relaxed">
                                Welcome, Developer. You have successfully bypassed the firewall. 
                                The following commands can be executed in the system terminal (bottom right) to trigger reality distortion fields.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-aether-panel border border-aether-border rounded-xl p-6 hover:border-aether-accent/30 transition-colors">
                            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                                <Terminal size={16} className="text-green-400" /> Visual Overrides
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { cmd: 'matrix', desc: 'Digital rain sequence' },
                                    { cmd: 'gta', desc: 'Wasted overlay' },
                                    { cmd: 'skyrim', desc: 'Wake up sequence' },
                                    { cmd: 'bsod', desc: 'Blue screen simulation' },
                                    { cmd: 'dvd', desc: 'Bouncing logo' },
                                    { cmd: 'sus', desc: 'Ejection protocol' },
                                    { cmd: 'singularity', desc: 'Invert reality' },
                                ].map((item) => (
                                    <div key={item.cmd} className="flex justify-between items-center group cursor-default">
                                        <code className="text-green-400 font-bold bg-black/40 px-2 py-1 rounded border border-green-900/30">{item.cmd}</code>
                                        <span className="text-xs text-aether-muted group-hover:text-white transition-colors">{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-aether-panel border border-aether-border rounded-xl p-6 hover:border-aether-accent/30 transition-colors">
                            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                                <Terminal size={16} className="text-yellow-400" /> Audio Injections
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { cmd: 'music', desc: 'Play ambient track' },
                                    { cmd: 'rickroll', desc: 'Never gonna give you up' },
                                    { cmd: 'coffin', desc: 'Astronomia dance' },
                                    { cmd: 'crab', desc: 'Crab rave' },
                                    { cmd: 'nyan', desc: 'Nyan cat loop' },
                                    { cmd: 'stop', desc: 'Kill all audio/effects' },
                                ].map((item) => (
                                    <div key={item.cmd} className="flex justify-between items-center group cursor-default">
                                        <code className="text-yellow-400 font-bold bg-black/40 px-2 py-1 rounded border border-yellow-900/30">{item.cmd}</code>
                                        <span className="text-xs text-aether-muted group-hover:text-white transition-colors">{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-aether-panel border border-aether-border rounded-xl p-6">
                        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                            <Keyboard size={16} className="text-blue-400" /> Global Shortcuts
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="bg-black/20 p-3 rounded flex justify-between items-center border border-white/5">
                                <span className="text-sm text-aether-text font-bold">Konami Code</span>
                                <span className="text-[10px] font-mono text-aether-muted bg-black px-2 py-1 rounded">↑ ↑ ↓ ↓ ← → ← → B A</span>
                            </div>
                            <div className="bg-black/20 p-3 rounded flex justify-between items-center border border-white/5">
                                <span className="text-sm text-aether-text font-bold">Barrel Roll</span>
                                <span className="text-[10px] font-mono text-aether-muted bg-black px-2 py-1 rounded">Type "roll" anywhere</span>
                            </div>
                            <div className="bg-black/20 p-3 rounded flex justify-between items-center border border-white/5">
                                <span className="text-sm text-aether-text font-bold">God Mode</span>
                                <span className="text-[10px] font-mono text-aether-muted bg-black px-2 py-1 rounded">Complete Konami Code</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-aether-border bg-black/40 text-center">
            <p className="text-[10px] text-aether-muted uppercase tracking-[0.2em] opacity-50">
                {unlocked ? 'Secure Connection Established' : 'Awaiting Authorization'}
            </p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
