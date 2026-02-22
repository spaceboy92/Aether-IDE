
import React, { useState } from 'react';
import { FileNode, PROJECT_TEMPLATES } from '../../types';
import { Folder, FileCode, Plus, Trash2, FileJson, FileType, Download, Upload, Search, Box, Image as ImageIcon, Zap, ChevronDown, Package } from 'lucide-react';
import { processDroppedFiles } from '../../services/fileService';

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onSelectFile: (file: FileNode) => void;
  onCreateFile: (name: string, lang: string) => void;
  onDeleteFile: (id: string) => void;
  onExport: () => void;
  onApplyTemplate: (type: string) => void;
  projectId: string | null;
  onFilesUpdated?: (files: FileNode[]) => void;
  onSnapshot?: () => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  activeFileId, 
  onSelectFile, 
  onCreateFile, 
  onDeleteFile,
  onExport,
  onApplyTemplate,
  projectId,
  onFilesUpdated,
  onSnapshot
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPackages, setShowPackages] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const getIcon = (file: FileNode) => {
    if (file.isBinary) return <ImageIcon size={16} className="text-pink-400" />;
    if (file.name.endsWith('.html')) return <FileCode size={16} className="text-orange-400" />;
    if (file.name.endsWith('.css')) return <FileType size={16} className="text-blue-400" />;
    if (file.name.endsWith('.js') || file.name.endsWith('.ts')) return <FileCode size={16} className="text-yellow-400" />;
    if (file.name.endsWith('.json')) return <FileJson size={16} className="text-green-400" />;
    return <FileCode size={16} className="text-aether-muted" />;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) return;
    const ext = newFileName.split('.').pop() || '';
    const langMap: Record<string, string> = { js: 'javascript', ts: 'typescript', html: 'html', css: 'css', json: 'json' };
    onCreateFile(newFileName, langMap[ext] || 'plaintext');
    setNewFileName('');
    setIsCreating(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!projectId) return;
      const updatedFiles = await processDroppedFiles(projectId, e.dataTransfer.items);
      if (onFilesUpdated) onFilesUpdated(updatedFiles);
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div 
        className={`flex flex-col h-full bg-aether-panel border-r border-aether-border relative transition-all ${isDragging ? 'ring-2 ring-aether-accent ring-inset' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
    >
      <div className="p-4 border-b border-aether-border shrink-0">
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-xs tracking-widest text-aether-muted uppercase">Workspace</h2>
            <div className="flex gap-2">
                {onSnapshot && (
                    <button onClick={onSnapshot} title="Take Snapshot" className="text-aether-muted hover:text-aether-accent"><Zap size={14} /></button>
                )}
                <button onClick={onExport} title="Download ZIP" className="text-aether-muted hover:text-aether-accent"><Download size={14} /></button>
                <button onClick={() => setIsCreating(true)} title="New File" className="text-aether-muted hover:text-aether-accent"><Plus size={14} /></button>
            </div>
        </div>
        <div className="relative">
            <Search size={12} className="absolute left-2.5 top-2.5 text-aether-muted" />
            <input 
                type="text" 
                placeholder="Find resources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-aether-border rounded-lg pl-8 pr-2 py-2 text-xs text-white focus:border-aether-accent outline-none"
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="px-2 mb-2">
            <input
              autoFocus
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.js"
              className="w-full bg-black border border-aether-accent rounded px-2 py-1.5 text-xs text-white outline-none shadow-glow"
              onBlur={() => !newFileName && setIsCreating(false)}
            />
          </form>
        )}

        {filteredFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => onSelectFile(file)}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
              activeFileId === file.id 
                ? 'bg-aether-accent/10 text-aether-accent border-l-2 border-aether-accent' 
                : 'text-aether-muted hover:bg-white/5 hover:text-white border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {getIcon(file)}
              <span className="text-xs truncate font-medium">{file.name}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-aether-border bg-black/20">
          <button 
            onClick={() => setShowPackages(!showPackages)}
            className="w-full mb-3 flex items-center justify-between text-[10px] font-bold text-aether-muted uppercase tracking-widest"
          >
              <div className="flex items-center gap-2">
                  <Package size={12} className="text-aether-accent" />
                  <span>Integrated Modules</span>
              </div>
              <ChevronDown size={12} className={`transition-transform ${showPackages ? '' : '-rotate-90'}`} />
          </button>
          
          {showPackages && (
              <div className="flex flex-wrap gap-1.5 mb-4 animate-in fade-in slide-in-from-bottom-2">
                  <span className="px-2 py-1 bg-aether-accent/10 border border-aether-accent/20 rounded text-[10px] text-aether-accent font-bold">three.js</span>
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white/50">react</span>
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white/50">tailwind</span>
              </div>
          )}
      </div>
    </div>
  );
};

export default FileExplorer;
