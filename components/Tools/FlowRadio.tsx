
import React, { useState, useEffect } from 'react';
import { Radio, X, Music, Activity, SkipForward, SkipBack } from 'lucide-react';

const PLAYLISTS = [
  { name: 'Anime Openings', url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1305022210&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true' },
  { name: 'LoFi Hip Hop', url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1195603738&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true' },
  { name: 'Global Top 50', url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1236940024&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true' },
  { name: 'Cyberpunk Synth', url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/917320078&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true' },
  { name: 'J-Pop Hits', url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1122334455&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true' }, // Placeholder ID
  { name: 'Naruto OST', url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/333923054&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true' }
];

const FlowRadio: React.FC = () => {
  const [stationIdx, setStationIdx] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(PLAYLISTS[0].url);

  useEffect(() => {
      setIframeUrl(PLAYLISTS[stationIdx].url);
  }, [stationIdx]);

  const nextStation = () => {
      setStationIdx((prev) => (prev + 1) % PLAYLISTS.length);
  };

  const prevStation = () => {
      setStationIdx((prev) => (prev - 1 + PLAYLISTS.length) % PLAYLISTS.length);
  };

  if (minimized) {
      return (
          <div 
            onClick={() => setMinimized(false)}
            className="fixed bottom-20 right-4 z-50 w-12 h-12 bg-black border border-aether-accent/50 rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(0,212,255,0.3)] animate-pulse"
          >
              <Music size={20} className="text-aether-accent" />
          </div>
      );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 bg-black/90 backdrop-blur-xl border border-aether-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in flex flex-col">
        <div className="h-1 bg-gradient-to-r from-aether-accent to-aether-secondary animate-pulse"></div>
        <div className="p-3 bg-black/40 border-b border-aether-border flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Radio size={14} className="text-aether-accent" />
                <span className="text-xs font-bold uppercase tracking-widest text-white">Cloud Stream</span>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setMinimized(true)} className="text-aether-muted hover:text-white"><X size={14} /></button>
            </div>
        </div>

        <div className="relative aspect-video w-full bg-black">
             <iframe 
                width="100%" 
                height="100%" 
                scrolling="no" 
                frameBorder="no" 
                allow="autoplay" 
                src={iframeUrl}
                className="absolute inset-0"
             ></iframe>
        </div>

        <div className="p-3 flex items-center justify-between bg-black/60">
            <button onClick={prevStation} className="p-2 text-aether-muted hover:text-white hover:bg-white/10 rounded-lg">
                <SkipBack size={16} />
            </button>
            
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">{PLAYLISTS[stationIdx].name}</span>
                <div className="flex items-center gap-1">
                    <Activity size={8} className="text-green-400" />
                    <span className="text-[8px] text-aether-muted">SoundCloud API</span>
                </div>
            </div>

            <button onClick={nextStation} className="p-2 text-aether-muted hover:text-white hover:bg-white/10 rounded-lg">
                <SkipForward size={16} />
            </button>
        </div>
    </div>
  );
};

export default FlowRadio;
