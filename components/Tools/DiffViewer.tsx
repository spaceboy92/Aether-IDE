
import React from 'react';
import { X, GitBranch } from 'lucide-react';
import { DiffEditor } from '@monaco-editor/react';

interface DiffViewerProps {
    onClose: () => void;
    originalContent: string;
    modifiedContent: string;
    language: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ onClose, originalContent, modifiedContent, language }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in zoom-in-95">
            <div className="w-[90vw] h-[90vh] bg-aether-panel border border-aether-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-aether-border flex justify-between items-center bg-black/40 shrink-0">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <GitBranch size={18} className="text-aether-accent" /> 
                        Source Control / Diff View
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-aether-muted hover:text-white" /></button>
                </div>
                
                <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
                     <DiffEditor 
                        height="100%"
                        language={language}
                        original={originalContent}
                        modified={modifiedContent}
                        theme="vs-dark"
                        options={{
                            readOnly: true,
                            renderSideBySide: true,
                            minimap: { enabled: false }
                        }}
                     />
                </div>
            </div>
        </div>
    );
};

export default DiffViewer;
