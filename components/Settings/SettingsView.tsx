
import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { User, HardDrive, Shield, LogOut, ChevronRight, Cloud, CloudOff, RefreshCw, ExternalLink, Save, ShieldCheck, Zap, Sparkles, Code2, Globe, Send, Rocket, X } from 'lucide-react';

interface SettingsViewProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  isAdmin?: boolean;
  onClose: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout, onUpdateUser, onSyncNow, isSyncing, isAdmin, onClose }) => {
  const [metaPrompt, setMetaPrompt] = useState('');
  const [isProcessingMeta, setIsProcessingMeta] = useState(false);

  const toggleSync = () => {
    onUpdateUser({
      ...user,
      syncEnabled: !user.syncEnabled,
      driveConnected: !user.syncEnabled
    });
  };

  const handleAutoSaveIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateUser({
      ...user,
      autoSaveInterval: parseInt(e.target.value, 10)
    });
  };

  const driveFolderUrl = "https://drive.google.com/drive/search?q=AetherAgent";

  const handleMetaDeploy = () => {
    setIsProcessingMeta(true);
    // Simulation of meta-programming deployment
    setTimeout(() => {
        setIsProcessingMeta(false);
        alert("META-SINGULARITY UPDATE: Changes staged for global deployment. The AI will now reconstruct the architecture.");
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-aether-bg p-4 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl mx-auto space-y-10">
        
        <header className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
                <p className="text-aether-muted">Manage your identity, cloud connectivity, and agent configurations.</p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-aether-muted hover:text-white transition-colors"
                title="Close Settings"
            >
                <X size={24} />
            </button>
        </header>

        {/* ADMIN META-CONTROL PANEL */}
        {isAdmin && (
            <section className="space-y-4 animate-in zoom-in-95 duration-700">
                <div className="flex items-center gap-2 px-2">
                    <ShieldCheck size={18} className="text-aether-accent" />
                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-aether-accent">App Modifications & Upgrades</h3>
                </div>
                
                <div className="bg-gradient-to-br from-aether-panel to-black border border-aether-accent/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,212,255,0.05)]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Sparkles size={120} />
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                    Singularity Control Center
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full animate-pulse uppercase tracking-widest">Active Link</span>
                                </h4>
                                <p className="text-xs text-aether-muted mt-1 leading-relaxed">
                                    Authorized Admin Detected. You have direct write-access to the Aether core. Tell the AI how to upgrade the application globally.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-aether-muted uppercase tracking-widest">Neural Upgrade Prompt</label>
                            <div className="relative flex gap-2">
                                <textarea 
                                    value={metaPrompt}
                                    onChange={(e) => setMetaPrompt(e.target.value)}
                                    placeholder="Suggest features or UI modifications (e.g. 'Add a real-time collaboration layer' or 'Change the theme to Matrix Green')..."
                                    className="flex-1 bg-black/50 border border-aether-border rounded-xl p-4 text-sm text-white outline-none focus:border-aether-accent min-h-[100px] resize-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                onClick={handleMetaDeploy}
                                disabled={isProcessingMeta || !metaPrompt}
                                className="flex items-center justify-center gap-3 py-3 bg-aether-accent text-black rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-glow disabled:opacity-50"
                            >
                                {isProcessingMeta ? <RefreshCw className="animate-spin" size={18} /> : <Rocket size={18} />}
                                Deploy Global Update
                            </button>
                            <button className="flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all">
                                <Code2 size={18} />
                                Initialize Meta-IDE
                            </button>
                        </div>

                        <div className="bg-aether-accent/5 border border-aether-accent/20 rounded-xl p-4">
                            <h5 className="text-[10px] font-bold text-aether-accent uppercase mb-2 tracking-widest">AI Suggested Upgrades</h5>
                            <ul className="space-y-2">
                                <li className="text-xs text-aether-text flex items-center gap-2">
                                    <Zap size={10} className="text-aether-secondary" /> 
                                    Integrate Vector Embeddings for Project Search
                                </li>
                                <li className="text-xs text-aether-text flex items-center gap-2">
                                    <Zap size={10} className="text-aether-secondary" /> 
                                    Implement WebRTC Voice Channel for Teams
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* PROFILE SECTION */}
        <section className="bg-aether-panel border border-aether-border rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-aether-border bg-gradient-to-r from-aether-panel to-black/40">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img src={user.photoURL} alt="User" className="w-16 h-16 rounded-full border-2 border-aether-border shadow-glow" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-aether-panel rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{user.name}</h2>
                        <p className="text-sm text-aether-muted">{user.email || 'Guest Explorer'}</p>
                    </div>
                </div>
            </div>
            <div className="p-2">
                <button onClick={onLogout} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3 text-red-400">
                        <LogOut size={18} />
                        <span className="font-medium">Logout of Singularity</span>
                    </div>
                    <ChevronRight size={16} className="text-aether-muted group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </section>

        {/* PERSISTENCE SECTION */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
                <Save size={18} className="text-aether-accent" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-aether-muted">Persistence & Snapshots</h3>
            </div>
            
            <div className="bg-aether-panel border border-aether-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-bold">Auto-Save Frequency</h4>
                        <p className="text-xs text-aether-muted mt-1">How often Aether creates a local persistence checkpoint.</p>
                    </div>
                    <select 
                      value={user.autoSaveInterval || 0}
                      onChange={handleAutoSaveIntervalChange}
                      className="bg-black/50 border border-aether-border rounded-lg px-3 py-1.5 text-sm text-aether-text outline-none focus:border-aether-accent"
                    >
                      <option value={0}>Disabled</option>
                      <option value={1}>1 Minute</option>
                      <option value={5}>5 Minutes</option>
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                    </select>
                </div>
            </div>
        </section>

        {/* DRIVE SYNC SECTION */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
                <HardDrive size={18} className="text-aether-accent" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-aether-muted">Cloud Connectivity</h3>
            </div>
            
            <div className="bg-aether-panel border border-aether-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-bold">Google Drive Synchronization</h4>
                        <p className="text-xs text-aether-muted mt-1">Automatic backups and multi-device persistence.</p>
                    </div>
                    <button 
                        onClick={toggleSync}
                        className={`relative w-12 h-6 rounded-full transition-colors ${user.syncEnabled ? 'bg-aether-accent' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${user.syncEnabled ? 'translate-x-6' : ''}`}></div>
                    </button>
                </div>

                {user.syncEnabled ? (
                    <div className="bg-black/40 border border-aether-accent/20 rounded-xl p-4 animate-in zoom-in-95 duration-300">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-aether-muted">Status</label>
                                <div className="flex items-center gap-2 text-aether-accent text-sm font-medium">
                                    <Cloud size={14} />
                                    <span>Connected</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-aether-muted">Last Sync</label>
                                <div className="text-white text-sm">
                                    {user.lastSync ? new Date(user.lastSync).toLocaleString() : 'Never synced'}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onSyncNow}
                            disabled={isSyncing}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-aether-accent/10 border border-aether-accent text-aether-accent rounded-lg font-bold text-sm hover:bg-aether-accent hover:text-black transition-all"
                        >
                            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                            <span>{isSyncing ? 'Syncing...' : 'Force Sync Now'}</span>
                        </button>
                    </div>
                ) : (
                    <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-3 text-aether-muted">
                        <CloudOff size={20} />
                        <p className="text-xs">Cloud synchronization is disabled. Projects are stored locally in your browser.</p>
                    </div>
                )}
            </div>
        </section>

        <footer className="text-center pb-20">
            <p className="text-[10px] text-aether-muted uppercase tracking-[0.4em] font-medium opacity-50">Singularity Workspace Engine v1.0.4-beta</p>
        </footer>
      </div>
    </div>
  );
};

export default SettingsView;
