
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSeasons } from './hooks/useSeasons';
import { getFiles, saveFile, deleteFile, generateStandaloneHTML } from './services/fileService';
import { FileNode, ViewMode, AgentAction, TerminalLog, ChatSession, MarketItem } from './types';
import { useAutonomousAgent } from './hooks/useAutonomousAgent';
import LoginScreen from './components/Auth/LoginScreen';
import FileExplorer from './components/Files/FileExplorer';
import MonacoEditorWrapper from './components/Editor/MonacoEditorWrapper';
import PreviewPane from './components/Preview/PreviewPane';
import AIAssistant from './components/AI/AIAssistant';
import Terminal from './components/Terminal/Terminal';
import HomeDashboard from './components/Home/HomeDashboard';
import SettingsView from './components/Settings/SettingsView';
import MarketplaceView from './components/Marketplace/MarketplaceView';
import FlowRadio from './components/Tools/FlowRadio';
import WelcomeAnimation from './components/Layout/WelcomeAnimation';
import HelpModal from './components/Layout/HelpModal';
import BlackholeIcon from './components/Layout/BlackholeIcon';
import { Menu, X, Rocket, Code2, Eye, Send, MessageSquare, Settings, Music, ShoppingBag, Terminal as TermIcon, ChevronLeft, Layout, Share2, Globe } from 'lucide-react';

const ADMIN_EMAILS = ['itzspaceboy92@gmail.com', 'enginastro41@gmail.com'];

const App = () => {
  const { user, loading: authLoading, completeLogin, loginGuest, logout } = useAuth();
  const season = useSeasons();
  
  // Core State
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [replayWelcome, setReplayWelcome] = useState(false);
  const [showRadio, setShowRadio] = useState(false);
  
  // Universal Layout Modes
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'chat'>('editor');
  const [sidebarMode, setSidebarMode] = useState<'files' | 'marketplace' | 'settings' | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Prefs & Theming
  const [activeFont, setActiveFont] = useState("'JetBrains Mono', monospace");
  const [activeTheme, setActiveTheme] = useState('theme_cyberpunk');
  const [minimapEnabled, setMinimapEnabled] = useState(window.innerWidth > 1024);
  
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      if (user.theme) setActiveTheme(user.theme);
      if (user.font) setActiveFont(user.font);
    }
  }, [user]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setReplayWelcome(false);
    localStorage.setItem('aether_welcome_seen', 'true');
  };

  const addLog = useCallback((type: TerminalLog['type'], message: string, source: string = 'SYSTEM') => {
      setTerminalLogs(prev => [...prev, { id: Date.now().toString(), type, message, timestamp: Date.now(), source }]);
  }, []);

  const handlePurchaseItem = (item: MarketItem) => {
      if (!user) return;

      const isOwned = user.items?.includes(item.id) || item.price === 0;
      
      if (!isOwned) {
          const balance = user.coins || 0;
          if (balance < item.price) {
              addLog('error', `Transaction Aborted: Insufficient Neural Credits for ${item.title}.`);
              return;
          }

          const updatedUser = {
              ...user,
              coins: balance - item.price,
              items: [...(user.items || []), item.id]
          };
          
          completeLogin(updatedUser);
          addLog('success', `Module Synthesized: ${item.title} added to local node library.`);
      } else {
          // APPLYING ALREADY OWNED ITEM
          if (item.category === 'theme') {
              setActiveTheme(item.id);
              completeLogin({ ...user, theme: item.id });
              addLog('system', `Visual Shell updated: ${item.title} engaged.`);
          } else if (item.category === 'font') {
              const fontMap: Record<string, string> = {
                  'font_jetbrains': "'JetBrains Mono', monospace",
                  'font_fira': "'Fira Code', monospace",
                  'font_press': "'Press Start 2P', cursive",
                  'font_orbitron': "'Orbitron', sans-serif"
              };
              const fontStack = fontMap[item.id] || activeFont;
              setActiveFont(fontStack);
              completeLogin({ ...user, font: fontStack });
              addLog('system', `Character Raster changed: ${item.title} active.`);
          }
      }
  };

  const handleDeploy = () => {
      const html = generateStandaloneHTML(files);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
          addLog('success', 'Neural Link Established: Project Deployed to Aether Cloud Node.');
      } else {
          addLog('warn', 'Pop-up blocked. Project compiled but unable to warp to new tab.');
      }
  };

  const handleAgentAction = async (actions: AgentAction[]) => {
      if (!activeSessionId) return;
      let updatedFiles = [...files];
      for (const action of actions) {
          try {
              if (action.action === 'create' || action.action === 'update') {
                  const existingIdx = updatedFiles.findIndex(f => f.name === action.path);
                  if (existingIdx !== -1) {
                      updatedFiles[existingIdx] = { ...updatedFiles[existingIdx], content: action.content || '', lastModified: Date.now() };
                      await saveFile(activeSessionId, updatedFiles[existingIdx]);
                  } else {
                      const newFile: FileNode = { id: `f_${Date.now()}`, name: action.path || 'untitled', content: action.content || '', language: action.path?.split('.').pop() || 'plaintext', lastModified: Date.now() };
                      updatedFiles.push(newFile);
                      await saveFile(activeSessionId, newFile);
                  }
              } else if (action.action === 'delete' && action.path) {
                  const fileToDelete = updatedFiles.find(f => f.name === action.path);
                  if (fileToDelete) { await deleteFile(activeSessionId, fileToDelete.id); updatedFiles = updatedFiles.filter(f => f.id !== fileToDelete.id); }
              }
          } catch (e) { addLog('error', `Neural Anomaly in ${action.path}`); }
      }
      setFiles(updatedFiles);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const { isProcessing, sendMessage } = useAutonomousAgent({ 
    files, activeSession, onUpdateSession: (s) => setSessions(prev => prev.map(x => x.id === s.id ? s : x)), onAgentAction: handleAgentAction, addLog 
  });

  const createNewSession = (initialPrompt?: string) => {
    const newSession: ChatSession = { id: `s_${Date.now()}`, title: initialPrompt ? initialPrompt.slice(0, 30) + '...' : 'New Node', messages: [], lastUpdated: Date.now() };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveTab('editor');
    setSidebarMode('files');
    getFiles(newSession.id).then(f => { setFiles(f); if (f.length > 0) setActiveFileId(f[0].id); });
    if (initialPrompt) setPendingPrompt(initialPrompt);
  };

  useEffect(() => {
    if (pendingPrompt && activeSessionId && !isProcessing) { sendMessage(pendingPrompt); setPendingPrompt(null); }
  }, [pendingPrompt, activeSessionId, isProcessing, sendMessage]);

  if (authLoading) return <div className="h-full w-full bg-black flex items-center justify-center"><BlackholeIcon className="animate-pulse" /></div>;
  if (!user) return <LoginScreen onLogin={() => {}} onGuestLogin={loginGuest} onCompleteProfile={completeLogin} loading={authLoading} />;

  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <div className={`h-[100dvh] w-full flex flex-col bg-aether-bg text-white overflow-hidden font-sans relative ${season.themeClass} ${activeTheme}`} style={{ '--font-code': activeFont } as React.CSSProperties}>
        
        {/* Ambient Nebula Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
            <div className="absolute top-[-20%] left-[-10%] w-[130%] h-[130%] bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.12),transparent_60%)] animate-nebula-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.08),transparent_50%)] animate-nebula-pulse-alt"></div>
        </div>

        {(showWelcome || replayWelcome) && <WelcomeAnimation onComplete={handleWelcomeComplete} username={user.name} />}
        {showRadio && <FlowRadio />}
        
        {/* UNIFIED UNIVERSAL HEADER */}
        <header className="h-14 bg-black/90 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between px-4 z-50 shrink-0">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveSessionId(null)}>
                <BlackholeIcon size={24} />
                <h1 className="hidden sm:block font-black text-[10px] tracking-[0.5em] uppercase text-white">Aether</h1>
            </div>

            {activeSessionId && (
                <nav className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 gap-1 shadow-2xl">
                    <button 
                        onClick={() => setActiveTab('editor')}
                        className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest transition-all ${activeTab === 'editor' ? 'bg-aether-accent text-black shadow-glow' : 'text-white/40 hover:text-white'}`}
                    >
                        <Code2 size={12} /> <span className="hidden md:inline">EDITOR</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest transition-all ${activeTab === 'preview' ? 'bg-aether-accent text-black shadow-glow' : 'text-white/40 hover:text-white'}`}
                    >
                        <Eye size={12} /> <span className="hidden md:inline">PREVIEW</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest transition-all ${activeTab === 'chat' ? 'bg-aether-accent text-black shadow-glow' : 'text-white/40 hover:text-white'}`}
                    >
                        <MessageSquare size={12} /> <span className="hidden md:inline">AI CHAT</span>
                    </button>
                </nav>
            )}

            <div className="flex items-center gap-1">
                {activeSessionId && (
                    <button 
                        onClick={handleDeploy}
                        className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all shadow-glow"
                    >
                        <Globe size={11} /> <span className="hidden sm:inline">Deploy</span>
                    </button>
                )}
                <div className="w-[1px] h-6 bg-white/10 mx-1 hidden md:block"></div>
                <button onClick={() => setSidebarMode(sidebarMode === 'files' ? null : 'files')} className={`p-2 rounded-lg transition-colors ${sidebarMode === 'files' ? 'text-aether-accent bg-aether-accent/10' : 'text-aether-muted hover:text-white'}`}><Layout size={18} /></button>
                <button onClick={() => setSidebarMode(sidebarMode === 'marketplace' ? null : 'marketplace')} className={`p-2 rounded-lg transition-colors ${sidebarMode === 'marketplace' ? 'text-aether-accent bg-aether-accent/10' : 'text-aether-muted hover:text-white'}`}><ShoppingBag size={18} /></button>
                <button onClick={() => setSidebarMode(sidebarMode === 'settings' ? null : 'settings')} className={`p-2 rounded-lg transition-colors ${sidebarMode === 'settings' ? 'text-aether-accent bg-aether-accent/10' : 'text-aether-muted hover:text-white'}`}><Settings size={18} /></button>
            </div>
        </header>

        <main className="flex-1 flex overflow-hidden relative z-10">
            {!activeSessionId ? (
                 <HomeDashboard sessions={sessions} onSelectSession={id => { setActiveSessionId(id); setActiveTab('editor'); }} onCreateSession={() => createNewSession()} onDeleteSession={id => setSessions(sessions.filter(s => s.id !== id))} onStartTemplate={(t, p) => createNewSession(p)} />
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    {/* ADAPTIVE DRAWER SIDEBAR */}
                    {sidebarMode && (
                        <div className="fixed md:relative inset-y-0 left-0 w-full md:w-80 bg-aether-panel/98 backdrop-blur-3xl border-r border-white/5 z-[60] flex flex-col animate-in slide-in-from-left duration-300 shadow-2xl">
                            <div className="flex-1 overflow-hidden flex flex-col">
                                {sidebarMode === 'files' && <FileExplorer files={files} activeFileId={activeFileId} onSelectFile={f => { setActiveFileId(f.id); if(window.innerWidth < 1024) setSidebarMode(null); }} onCreateFile={async (n, l) => { const f = { id: Date.now().toString(), name: n, language: l, content: '', lastModified: Date.now() }; await saveFile(activeSessionId, f); setFiles([...files, f]); setActiveFileId(f.id); }} onDeleteFile={async id => { await deleteFile(activeSessionId, id); setFiles(files.filter(f => f.id !== id)); }} onExport={() => {}} onApplyTemplate={() => {}} projectId={activeSessionId} />}
                                {sidebarMode === 'settings' && <SettingsView user={user} onLogout={logout} onUpdateUser={completeLogin} onSyncNow={() => {}} isSyncing={false} onClose={() => setSidebarMode(null)} />}
                                {sidebarMode === 'marketplace' && <MarketplaceView user={user} onPurchase={handlePurchaseItem} onClose={() => setSidebarMode(null)} activeTheme={activeTheme} activeFont={activeFont} />}
                            </div>
                            <button onClick={() => setSidebarMode(null)} className="absolute top-4 right-4 text-white/40 hover:text-white md:hidden"><X size={20} /></button>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                        {/* EDITOR VIEW */}
                        <div className={`flex-1 h-full overflow-hidden ${activeTab === 'editor' ? 'flex' : 'hidden'}`}>
                             {activeFile ? (
                                <MonacoEditorWrapper onMount={(e) => editorRef.current = e} code={activeFile.content} language={activeFile.language} onChange={c => { if(activeFileId) { const nf = files.map(f => f.id === activeFileId ? {...f, content: c || ''} : f); setFiles(nf); saveFile(activeSessionId, nf.find(f => f.id === activeFileId)!); }}} fontFamily={activeFont} minimapEnabled={minimapEnabled} />
                             ) : (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-30 p-8 text-center">
                                    <Rocket size={64} className="animate-float" />
                                    <p className="mt-4 uppercase tracking-[0.5em] text-[10px] font-bold">Select Node to Sync</p>
                                    <button onClick={() => setSidebarMode('files')} className="mt-6 px-4 py-2 border border-white/20 rounded-full text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all">Open Explorer</button>
                                </div>
                             )}
                        </div>

                        {/* PREVIEW VIEW */}
                        <div className={`flex-1 h-full bg-[#050505] ${activeTab === 'preview' ? 'flex' : 'hidden'}`}>
                             <PreviewPane files={files} />
                        </div>

                        {/* CHAT VIEW */}
                        <div className={`flex-1 h-full ${activeTab === 'chat' ? 'flex' : 'hidden'}`}>
                             <AIAssistant files={files} onAgentAction={handleAgentAction} sessions={sessions} activeSessionId={activeSessionId} onCreateSession={() => createNewSession()} onUpdateSession={s => setSessions(prev => prev.map(x => x.id === s.id ? s : x))} isProcessing={isProcessing} onSendMessage={sendMessage} onClose={() => setActiveTab('editor')} onOpenMarketplace={() => setSidebarMode('marketplace')} />
                        </div>
                    </div>
                </div>
            )}
        </main>

        <button onClick={() => setShowTerminal(!showTerminal)} className="fixed bottom-4 right-4 z-[70] p-3 bg-black/80 border border-white/10 rounded-full shadow-glow text-aether-accent hover:scale-110 transition-transform backdrop-blur-xl">
            <TermIcon size={16} />
        </button>

        {showTerminal && <Terminal logs={terminalLogs} isOpen={showTerminal} onToggle={() => setShowTerminal(false)} onClear={() => setTerminalLogs([])} />}

        <style>{`
            @keyframes nebula-pulse {
                0%, 100% { transform: scale(1); opacity: 0.3; filter: blur(40px); }
                50% { transform: scale(1.15); opacity: 0.5; filter: blur(20px); }
            }
            @keyframes nebula-pulse-alt {
                0%, 100% { transform: scale(1.1); opacity: 0.1; }
                50% { transform: scale(1.3); opacity: 0.2; }
            }
            .animate-nebula-pulse { animation: nebula-pulse 15s ease-in-out infinite; }
            .animate-nebula-pulse-alt { animation: nebula-pulse-alt 20s ease-in-out infinite; }
            .shadow-glow { box-shadow: 0 0 15px rgba(0, 212, 255, 0.4); }
        `}</style>
    </div>
  );
};

export default App;
