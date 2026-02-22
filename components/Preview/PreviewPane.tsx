
import React, { useEffect, useState, useRef } from 'react';
import { FileNode } from '../../types';
import { RefreshCw, Monitor, Smartphone, Tablet, ExternalLink, Loader2, Maximize2, X, Globe, Zap } from 'lucide-react';

interface PreviewPaneProps {
  files: FileNode[];
}

const VIEWPORTS: Record<string, { w: string, h: string, label: string }> = {
  desktop: { w: '100%', h: '100%', label: 'Desktop' },
  tablet: { w: '768px', h: '95%', label: 'Tablet' },
  mobile: { w: '375px', h: '667px', label: 'Mobile' }
};

const PreviewPane: React.FC<PreviewPaneProps> = ({ files }) => {
  const [srcDoc, setSrcDoc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewport, setViewport] = useState<string>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const htmlFile = files.find(f => f.name.endsWith('html'));
    if (!htmlFile) {
      setSrcDoc('<body style="background:#050505; color:#555; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; text-transform:uppercase; letter-spacing:0.2em; text-align:center;">Neural Error:<br/>No index.html found.</body>');
      return;
    }

    let content = htmlFile.content;
    const styles = files.filter(f => f.name.endsWith('.css')).map(f => `<style>${f.content}</style>`).join('\n');
    const scripts = files.filter(f => f.name.endsWith('.js')).map(f => `<script type="module">${f.content}</script>`).join('\n');

    if (content.includes('</head>')) content = content.replace('</head>', `${styles}</head>`);
    else content = styles + content;

    if (content.includes('</body>')) content = content.replace('</body>', `${scripts}</body>`);
    else content = content + scripts;

    setSrcDoc(content);
  }, [files, key]);

  const renderIframe = (isFull: boolean) => (
    <iframe 
        key={`${key}-${isFull}`} 
        ref={isFull ? null : iframeRef} 
        srcDoc={srcDoc} 
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-none bg-white"
        sandbox="allow-scripts allow-same-origin" 
    />
  );

  return (
    <div className={`flex flex-col h-full bg-[#050505] overflow-hidden relative ${isFullscreen ? 'z-[1000]' : ''}`}>
      
      {/* FULLSCREEN OVERLAY */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[2000] bg-white flex flex-col animate-in fade-in zoom-in duration-300">
            <button 
                onClick={() => setIsFullscreen(false)}
                className="absolute top-6 right-6 z-[2001] p-4 bg-black/80 hover:bg-black text-white rounded-full shadow-2xl backdrop-blur-xl border border-white/20 transition-all hover:scale-110 active:scale-95 group"
            >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <div className="absolute top-6 left-6 z-[2001] pointer-events-none">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                    <Zap size={14} className="text-aether-accent animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Aether Immersive Preview</span>
                </div>
            </div>
            {renderIframe(true)}
        </div>
      )}

      {/* REGULAR TOOLBAR */}
      <div className="bg-black/60 border-b border-white/10 p-2 flex justify-between items-center h-12 shrink-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button onClick={() => setViewport('desktop')} className={`p-1.5 rounded-lg transition-all ${viewport === 'desktop' ? 'bg-aether-accent text-black shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 'text-white/40'}`} title="Desktop View"><Monitor size={14} /></button>
                <button onClick={() => setViewport('tablet')} className={`p-1.5 rounded-lg transition-all ${viewport === 'tablet' ? 'bg-aether-accent text-black shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 'text-white/40'}`} title="Tablet View"><Tablet size={14} /></button>
                <button onClick={() => setViewport('mobile')} className={`p-1.5 rounded-lg transition-all ${viewport === 'mobile' ? 'bg-aether-accent text-black shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 'text-white/40'}`} title="Mobile View"><Smartphone size={14} /></button>
            </div>
            <span className="hidden sm:inline text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">{VIEWPORTS[viewport].label} Mode</span>
        </div>
        
        <div className="flex items-center gap-1">
             <button onClick={() => setKey(k => k + 1)} className="p-2 text-white/40 hover:text-aether-accent transition-colors" title="Sync Neural Stream"><RefreshCw size={14} /></button>
             <button 
                onClick={() => setIsFullscreen(true)} 
                className="p-2 text-white/40 hover:text-aether-accent transition-colors" 
                title="Neural Immersion (Full Screen)"
             >
                 <Maximize2 size={14} />
             </button>
             <button 
                onClick={() => {
                    const blob = new Blob([srcDoc], { type: 'text/html' });
                    window.open(URL.createObjectURL(blob), '_blank');
                }} 
                className="p-2 text-white/40 hover:text-aether-accent transition-colors" 
                title="Warp to Standalone"
             >
                 <ExternalLink size={14} />
             </button>
        </div>
      </div>
      
      {/* SIMULATOR STAGE */}
      <div className="flex-1 relative flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.04)_0%,transparent_100%)] overflow-hidden">
        {isLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl gap-4">
                <Loader2 size={40} className="text-aether-accent animate-spin" />
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-aether-accent animate-pulse mb-1">Synthesizing</span>
                    <div className="w-24 h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-aether-accent animate-progress-glow"></div>
                    </div>
                </div>
            </div>
        )}

        <div 
            className={`bg-white transition-all duration-700 shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden relative flex flex-col ${viewport !== 'desktop' ? 'border-[12px] border-zinc-900 rounded-[2.5rem] ring-1 ring-white/10' : 'w-full h-full'}`}
            style={{ 
                width: viewport === 'desktop' ? '100%' : VIEWPORTS[viewport].w, 
                height: viewport === 'desktop' ? '100%' : VIEWPORTS[viewport].h,
                maxWidth: '100%',
                maxHeight: '100%',
                // Enhanced scaling for mobile visibility on smaller screens
                transform: (window.innerWidth < 800 && viewport !== 'desktop') ? `scale(${window.innerWidth / 500})` : 'none',
                transformOrigin: 'center center'
            }}
        >
            {/* Simulator Details */}
            {viewport === 'mobile' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-zinc-900 rounded-b-2xl z-20 flex items-center justify-center">
                    <div className="w-10 h-1 bg-zinc-800 rounded-full"></div>
                </div>
            )}
            
            <div className="flex-1 relative overflow-hidden bg-white">
                {renderIframe(false)}
            </div>
        </div>
      </div>

      <style>{`
        @keyframes progress-glow {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-progress-glow {
            animation: progress-glow 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default PreviewPane;
