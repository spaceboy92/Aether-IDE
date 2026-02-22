
import React, { useState } from 'react';
import { ChatSession } from '../../types';
import { Plus, MessageSquare, Search, Trash2, ArrowRight, Sparkles, Wand2 } from 'lucide-react';
import InteractiveCard from '../UI/InteractiveCard';

interface HomeDashboardProps {
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onStartTemplate?: (title: string, prompt: string) => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ 
  sessions, 
  onSelectSession, 
  onCreateSession,
  onDeleteSession,
  onStartTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedSessions = {
    today: [] as ChatSession[],
    yesterday: [] as ChatSession[],
    last7Days: [] as ChatSession[],
    older: [] as ChatSession[]
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const last7Days = today - 86400000 * 7;

  filteredSessions.forEach(session => {
    if (session.lastUpdated >= today) groupedSessions.today.push(session);
    else if (session.lastUpdated >= yesterday) groupedSessions.yesterday.push(session);
    else if (session.lastUpdated >= last7Days) groupedSessions.last7Days.push(session);
    else groupedSessions.older.push(session);
  });

  const examplePrompts = [
    {
      title: "Interactive Portfolio",
      description: "Modern personal site with hero section, projects grid, and contact form.",
      prompt: "Create a modern personal portfolio website with a hero section, about me, projects gallery with hover effects, and a functional-looking contact form using Tailwind CSS and glassmorphism design."
    },
    {
      title: "Kanban Task Board",
      description: "Drag-and-drop task management with persistence.",
      prompt: "Build a drag-and-drop Kanban board application with columns for Todo, In Progress, and Done. Include features to add new tasks, delete tasks, and persist data to local storage."
    },
    {
      title: "3D Solar System",
      description: "Interactive Three.js visualization with orbits.",
      prompt: "Use Three.js to build an interactive 3D solar system. Include a glowing sun, rotating planets with different colors/sizes, and orbit controls to navigate the scene."
    },
    {
      title: "Crypto Dashboard",
      description: "Real-time data visualization with charts.",
      prompt: "Create a cryptocurrency dashboard layout. Include a main price chart using a canvas drawing, a sidebar with trending coins, and a portfolio summary section with percentage gains/losses."
    },
    {
      title: "Retro Arcade Game",
      description: "Playable canvas-based space shooter.",
      prompt: "Develop a retro-style space shooter game using HTML5 Canvas. Implement a player ship controlled by arrow keys, shooting mechanics, falling asteroids as enemies, and a score counter."
    },
    {
      title: "Chat Application UI",
      description: "Responsive messaging interface.",
      prompt: "Design a responsive chat application interface. Include a sidebar for contacts, a main chat area with message bubbles (sent/received), an input area with attachment icons, and a dark mode theme."
    }
  ];

  const renderSessionList = (list: ChatSession[], title: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-[10px] font-bold text-aether-muted uppercase tracking-[0.2em] mb-4 px-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((session, idx) => (
            <InteractiveCard 
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              ariaLabel={`Open session ${session.title}`}
              delay={idx * 50}
              className="group/card !p-3"
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className="p-1.5 bg-aether-bg rounded-lg group-hover/card:bg-aether-accent/10 transition-colors">
                  <MessageSquare size={14} className="text-aether-muted group-hover/card:text-aether-accent" />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                  className="p-1 text-aether-muted hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <h4 className="text-xs font-semibold text-aether-text truncate pr-4">{session.title}</h4>
              <p className="text-[10px] text-aether-muted line-clamp-1 h-3 opacity-60">
                {session.messages.find(m => m.role === 'user')?.text || "Neural Cluster Initialized"}
              </p>
            </InteractiveCard>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-aether-bg text-aether-text p-4 md:p-8 lg:p-12 relative scroll-smooth">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aether-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
             <InteractiveCard 
              onClick={onCreateSession}
              className="p-2 border-aether-accent/40 bg-aether-accent/10 group/init !rounded-full !w-12 !h-12 flex items-center justify-center border-dashed"
              ariaLabel="Initialize New Node"
            >
                <Plus size={20} className="text-aether-accent group-hover/init:rotate-90 transition-transform" />
            </InteractiveCard>
            <div>
              <h1 className="text-xl font-bold mb-0.5 flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-aether-muted text-2xl">Aether Singularity</span>
              </h1>
              <p className="text-[10px] text-aether-muted font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  AI Synthesis Engine: Online
              </p>
            </div>
          </div>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-aether-muted" size={14} />
            <input 
              type="text" 
              placeholder="Search neural history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-aether-panel border border-aether-border rounded-full pl-9 pr-4 py-1.5 text-xs focus:border-aether-accent outline-none transition-all"
            />
          </div>
        </div>

        <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
                <Wand2 size={16} className="text-aether-accent" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Quick Start Prompts</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examplePrompts.map((item, idx) => (
                    <InteractiveCard 
                        key={idx} 
                        onClick={() => onStartTemplate && onStartTemplate(item.title, item.prompt)}
                        className="!p-5 border-aether-border/50 hover:border-aether-accent/40 group/prmt"
                        delay={idx * 100}
                    >
                        <div className="mb-3 flex items-center justify-between">
                             <div className="p-2 rounded-lg bg-white/5 group-hover/prmt:bg-aether-accent/10 transition-colors">
                                <Sparkles size={16} className="text-aether-muted group-hover/prmt:text-aether-accent" />
                             </div>
                             <ArrowRight size={14} className="text-aether-muted opacity-0 group-hover/prmt:opacity-100 -translate-x-2 group-hover/prmt:translate-x-0 transition-all" />
                        </div>
                        <h4 className="font-bold text-sm text-white mb-2">{item.title}</h4>
                        <p className="text-[11px] text-aether-muted leading-relaxed">{item.description}</p>
                    </InteractiveCard>
                ))}
            </div>
        </div>

        {sessions.length > 0 && (
          <>
            {renderSessionList(groupedSessions.today, "Nodes Active Today")}
            {renderSessionList(groupedSessions.yesterday, "Yesterday's Waves")}
            {renderSessionList(groupedSessions.last7Days, "Distant Signals")}
          </>
        )}
      </div>
    </div>
  );
};

export default HomeDashboard;
