
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatSession, FileNode, AgentAction } from '../../types';
import { 
  Send, Bot, User, Sparkles, Loader2, Globe, ExternalLink, X, 
  History, Settings, RotateCcw, ThumbsUp, ThumbsDown, Check, 
  Plus, Mic, ArrowUp, Paperclip, Wand2, Image as ImageIcon, FileText, MicOff,
  Package, Database, Shield, Box, Zap, ShoppingBag, Minimize2, Copy
} from 'lucide-react';
import { enhancePrompt } from '../../services/geminiService';

interface AIAssistantProps {
  files: FileNode[];
  onAgentAction: (actions: AgentAction[]) => Promise<void>;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onCreateSession: () => void;
  onUpdateSession: (session: ChatSession) => void;
  isProcessing: boolean;
  onSendMessage: (text: string, attachments?: { mimeType: string, data: string }[]) => void;
  onClose: () => void;
  onOpenMarketplace: () => void;
}

const AI_FEATURES = [
  { id: 'auth', label: 'Authentication', icon: Shield, prompt: "Add a complete Authentication system using local storage simulation with Login/Signup screens." },
  { id: 'db', label: 'Mock Database', icon: Database, prompt: "Create a 'services/db.js' service that simulates a NoSQL database with CRUD operations." },
  { id: '3d', label: '3D Scene', icon: Box, prompt: "Initialize a Three.js scene with a rotating cube, lighting, and orbit controls in a new component." },
  { id: 'ui', label: 'Modern UI Kit', icon: Zap, prompt: "Create a reusable UI component library (Button, Card, Input) with Tailwind CSS and glassmorphism style." },
];

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  files, sessions, activeSessionId, onCreateSession, isProcessing, onSendMessage, onClose, onOpenMarketplace
}) => {
  const [input, setInput] = useState('');
  const [showFeatureMenu, setShowFeatureMenu] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string, type: 'image' | 'file', mimeType: string, data: string }[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages.length, isProcessing]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120); // Cap at 120px
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || !activeSessionId || isProcessing) return;
    
    const payloadAttachments = attachments.map(a => ({ mimeType: a.mimeType, data: a.data }));
    onSendMessage(input, payloadAttachments);
    
    setInput('');
    setAttachments([]);
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEnhance = async () => {
    if (!input.trim()) return;
    setIsEnhancing(true);
    const enhanced = await enhancePrompt(input);
    setInput(enhanced);
    setIsEnhancing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
          const result = ev.target?.result as string;
          const base64 = result.split(',')[1];
          setAttachments(prev => [...prev, {
              name: file.name,
              type,
              mimeType: file.type || (type === 'image' ? 'image/png' : 'text/plain'),
              data: base64
          }]);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
  };

  const toggleVoiceInput = () => {
      if (isListening) {
          setIsListening(false);
          return;
      }
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert("Voice input not supported in this browser.");
          return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => (prev ? prev + ' ' : '') + transcript);
      };
      recognition.start();
  };

  const addFeature = (prompt: string) => {
      setInput(prev => (prev ? prev + '\n' : '') + `[FEATURE REQUEST]: ${prompt}`);
      setShowFeatureMenu(false);
      if (textareaRef.current) textareaRef.current.focus();
  };

  // Simple Code Block Parser
  const renderMessageText = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
        if (part.startsWith('```')) {
            // Remove ticks and lang
            const content = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
            const lang = part.match(/^```(\w+)/)?.[1] || 'Code';
            
            const handleCopy = () => {
                navigator.clipboard.writeText(content);
            };

            return (
                <div key={index} className="my-3 bg-[#0d1117] rounded-md overflow-hidden border border-white/10 shadow-lg">
                    <div className="bg-white/5 px-3 py-1.5 flex justify-between items-center border-b border-white/5">
                        <span className="text-[10px] text-aether-muted font-bold uppercase tracking-widest">{lang}</span>
                        <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-aether-muted hover:text-white transition-colors">
                            <Copy size={12} /> Copy
                        </button>
                    </div>
                    <pre className="p-3 text-xs font-mono overflow-x-auto text-aether-text scrollbar-none">
                        {content}
                    </pre>
                </div>
            );
        }
        // Handle bolding
        return (
            <span key={index} className="whitespace-pre-wrap leading-relaxed">
                {part.split(/(\*\*.*?\*\*)/g).map((subPart, i) => 
                    subPart.startsWith('**') && subPart.endsWith('**') 
                        ? <strong key={i} className="text-white font-bold">{subPart.slice(2, -2)}</strong> 
                        : subPart
                )}
            </span>
        );
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-aether-bg border-l border-aether-border min-h-0 font-sans shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-aether-border flex items-center justify-between bg-aether-bg shrink-0 z-10">
        <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-aether-accent" fill="currentColor" />
            <span className="text-sm font-bold text-white tracking-tight">Code assistant</span>
        </div>
        
        <div className="flex items-center gap-1">
            <button className="p-2 text-aether-muted hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Open Marketplace" onClick={onOpenMarketplace}>
                <ShoppingBag size={16} />
            </button>
            <button className="p-2 text-aether-muted hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Reset Session" onClick={onCreateSession}>
                <RotateCcw size={16} />
            </button>
            <button className="p-2 text-aether-muted hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Minimize" onClick={onClose}>
                <Minimize2 size={16} />
            </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0 custom-scrollbar bg-aether-bg">
        {!activeSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-aether-muted text-center p-8 opacity-60">
                <Sparkles size={48} className="mb-4 text-aether-accent opacity-20" />
                <p className="text-sm">Start a conversation to generate code.</p>
                <button onClick={onCreateSession} className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all">
                    Start New Session
                </button>
            </div>
        ) : (
            <>
                {activeSession.messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.role === 'model' && (
                            <div className="flex items-center gap-2 mb-1 px-1">
                                <Bot size={14} className="text-aether-accent" />
                                <span className="text-[10px] font-bold text-aether-muted uppercase">Aether</span>
                            </div>
                        )}
                        
                        <div className={`relative max-w-full group ${msg.role === 'user' ? 'bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-3' : 'w-full pr-4'}`}>
                            <div className={`text-[13px] ${msg.role === 'user' ? 'text-white' : 'text-aether-text'}`}>
                                {renderMessageText(msg.text)}
                            </div>
                            
                            {/* Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                    {msg.attachments.map((att, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/10 text-[10px] text-aether-muted">
                                            {att.type === 'image' ? <ImageIcon size={10} /> : <FileText size={10} />}
                                            {att.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Grounding */}
                            {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] text-aether-muted uppercase font-bold tracking-widest">
                                        <Globe size={10} className="text-aether-secondary" />
                                        <span>Sources</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.groundingLinks.map((link, idx) => (
                                            <a 
                                                key={idx} href={link.uri} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-2 py-1 bg-black/40 hover:bg-black/60 border border-white/10 rounded text-[10px] text-aether-accent truncate max-w-full transition-colors"
                                            >
                                                <ExternalLink size={8} /> <span className="truncate max-w-[200px]">{link.title || 'Reference'}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </>
        )}
        
        {isProcessing && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-6 h-6 rounded-full bg-aether-accent/10 flex items-center justify-center">
                    <Loader2 size={12} className="text-aether-accent animate-spin" />
                </div>
                <span className="text-[12px] text-aether-muted animate-pulse">Thinking...</span>
            </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Footer Area */}
      <div className="p-4 bg-aether-bg shrink-0 relative">
        {/* Feature Menu Popover */}
        {showFeatureMenu && (
            <div className="absolute bottom-full left-4 mb-2 bg-aether-panel border border-aether-border rounded-xl shadow-2xl w-64 z-50 animate-in fade-in slide-in-from-bottom-2 overflow-hidden">
                <div className="p-2 border-b border-aether-border bg-black/40 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-aether-muted">Select Module</span>
                    <button onClick={() => setShowFeatureMenu(false)}><X size={12} /></button>
                </div>
                <div className="p-1">
                    {AI_FEATURES.map(f => (
                        <button 
                            key={f.id} 
                            onClick={() => addFeature(f.prompt)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-left transition-colors group"
                        >
                            <div className="p-1.5 bg-aether-accent/10 rounded text-aether-accent group-hover:bg-aether-accent group-hover:text-black transition-colors">
                                <f.icon size={14} />
                            </div>
                            <span className="text-xs font-medium text-white">{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Input Bar */}
        <div className={`relative bg-white/5 border transition-all duration-300 rounded-2xl ${isProcessing ? 'border-white/5 opacity-50' : 'border-white/10 focus-within:border-aether-accent/50 focus-within:bg-white/10'}`}>
            
            {/* Attachment Preview */}
            {attachments.length > 0 && (
                <div className="flex gap-2 p-2 border-b border-white/5 overflow-x-auto">
                    {attachments.map((att, i) => (
                        <div key={i} className="relative group shrink-0">
                             {att.type === 'image' && att.data ? (
                                 <img src={`data:${att.mimeType};base64,${att.data}`} alt="Preview" className="h-12 w-12 rounded object-cover border border-white/10" />
                             ) : (
                                 <div className="h-12 w-12 rounded bg-white/10 flex items-center justify-center border border-white/10">
                                     {att.type === 'image' ? <ImageIcon size={20} className="text-aether-muted" /> : <FileText size={20} className="text-aether-muted" />}
                                 </div>
                             )}
                             <button 
                                onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 <X size={10} />
                             </button>
                        </div>
                    ))}
                </div>
            )}

            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
                placeholder={isListening ? "Listening..." : "Describe your app or add modules..."}
                className="w-full bg-transparent text-sm text-white px-4 py-3 outline-none resize-none min-h-[48px] max-h-[120px] overflow-y-auto custom-scrollbar placeholder:text-white/20"
                rows={1}
            />
            
            {/* Hidden Inputs */}
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'file')} />
            <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />

            <div className="flex items-center justify-between px-2 pb-2 mt-1">
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setShowFeatureMenu(!showFeatureMenu)} 
                        className={`p-2 rounded-lg transition-all ${showFeatureMenu ? 'bg-aether-accent text-black' : 'text-aether-muted hover:text-white hover:bg-white/10'}`} 
                        title="Add Features"
                    >
                        <Package size={16} />
                    </button>
                    <button 
                        onClick={handleEnhance} 
                        disabled={isEnhancing || !input.trim()}
                        className={`p-2 rounded-lg transition-all ${isEnhancing ? 'text-aether-accent animate-pulse' : 'text-aether-muted hover:text-white hover:bg-white/10'}`} 
                        title="Enhance prompt"
                    >
                        {isEnhancing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-aether-muted hover:text-white hover:bg-white/10 rounded-lg transition-all"><Paperclip size={16} /></button>
                    <button onClick={() => imageInputRef.current?.click()} className="p-2 text-aether-muted hover:text-white hover:bg-white/10 rounded-lg transition-all"><ImageIcon size={16} /></button>
                    <button onClick={toggleVoiceInput} className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-aether-muted hover:text-white hover:bg-white/10'}`}>{isListening ? <MicOff size={16} /> : <Mic size={16} />}</button>
                </div>
                
                <button 
                    onClick={handleSend}
                    disabled={(!input.trim() && attachments.length === 0) || isProcessing}
                    className={`
                        p-2 rounded-xl transition-all duration-300
                        ${(input.trim() || attachments.length > 0) && !isProcessing 
                            ? 'bg-aether-accent text-black shadow-glow hover:scale-105 active:scale-95' 
                            : 'bg-white/10 text-white/20 cursor-not-allowed'}
                    `}
                >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={3} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
