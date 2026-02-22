
import React, { useState } from 'react';
import { X, Plus, Copy, Trash2, Code, Terminal } from 'lucide-react';

interface SnippetManagerProps {
    onClose: () => void;
    onInject: (code: string) => void;
}

const SnippetManager: React.FC<SnippetManagerProps> = ({ onClose, onInject }) => {
    const [snippets, setSnippets] = useState<{id: string, name: string, code: string}[]>([
        { id: '1', name: 'React Component', code: 'const Component = () => {\n  return <div>Hello</div>;\n};' },
        { id: '2', name: 'Tailwind Button', code: '<button className="px-4 py-2 bg-blue-500 text-white rounded">Click Me</button>' },
        { id: '3', name: 'Fetch API', code: 'fetch("https://api.example.com")\n  .then(res => res.json())\n  .then(data => console.log(data));' }
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCode, setNewCode] = useState('');

    const handleAdd = () => {
        if(!newName || !newCode) return;
        setSnippets([...snippets, { id: Date.now().toString(), name: newName, code: newCode }]);
        setIsAdding(false);
        setNewName('');
        setNewCode('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in-95">
            <div className="w-[600px] max-h-[80vh] bg-aether-panel border border-aether-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-aether-border flex justify-between items-center bg-black/40">
                    <h3 className="font-bold text-white flex items-center gap-2"><Code size={18} className="text-aether-accent" /> Snippet Library</h3>
                    <button onClick={onClose}><X size={20} className="text-aether-muted hover:text-white" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {snippets.map(s => (
                        <div key={s.id} className="bg-black/20 border border-white/5 rounded-lg p-3 hover:border-aether-accent/50 transition-all group">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-sm text-aether-text">{s.name}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onInject(s.code)} className="px-2 py-1 bg-aether-accent text-black text-xs font-bold rounded hover:bg-white">Inject</button>
                                    <button onClick={() => setSnippets(snippets.filter(x => x.id !== s.id))} className="text-red-400 hover:bg-red-500/10 p-1 rounded"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <pre className="text-[10px] font-mono bg-black/50 p-2 rounded text-aether-muted overflow-x-auto">
                                {s.code}
                            </pre>
                        </div>
                    ))}
                </div>

                {isAdding ? (
                    <div className="p-4 border-t border-aether-border bg-black/40 space-y-3">
                        <input type="text" placeholder="Snippet Name" className="w-full bg-black border border-white/10 rounded p-2 text-sm text-white" value={newName} onChange={e => setNewName(e.target.value)} />
                        <textarea placeholder="Code..." className="w-full bg-black border border-white/10 rounded p-2 text-sm text-white font-mono h-20" value={newCode} onChange={e => setNewCode(e.target.value)} />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs font-bold text-aether-muted">Cancel</button>
                            <button onClick={handleAdd} className="px-3 py-1.5 bg-aether-accent text-black text-xs font-bold rounded">Save Snippet</button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 border-t border-aether-border bg-black/40">
                        <button onClick={() => setIsAdding(true)} className="w-full py-2 bg-white/5 border border-white/10 rounded text-aether-muted hover:bg-white/10 hover:text-white text-sm font-bold flex items-center justify-center gap-2">
                            <Plus size={16} /> Add New Snippet
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SnippetManager;
