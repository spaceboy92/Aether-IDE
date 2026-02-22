
import React, { useState } from 'react';
import { Plus, X, Layout } from 'lucide-react';

interface Task {
    id: string;
    content: string;
    column: 'todo' | 'progress' | 'done';
}

const KanbanBoard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', content: 'Initialize Project Repository', column: 'done' },
        { id: '2', content: 'Design System Architecture', column: 'progress' },
        { id: '3', content: 'Implement Authentication', column: 'todo' },
        { id: '4', content: 'Fix CSS Grid Issues', column: 'todo' },
    ]);

    const moveTask = (id: string, targetCol: Task['column']) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, column: targetCol } : t));
    };

    const addTask = (col: Task['column']) => {
        const text = prompt("Enter task details:");
        if (text) {
            setTasks([...tasks, { id: Date.now().toString(), content: text, column: col }]);
        }
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const renderColumn = (id: Task['column'], title: string, colorClass: string, borderColor: string) => (
        <div className="flex-1 min-w-[250px] flex flex-col bg-aether-panel border border-aether-border rounded-xl overflow-hidden h-full">
            <div className={`p-4 border-b border-white/5 flex justify-between items-center ${colorClass}`}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">{title}</h3>
                <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full text-white/90 font-mono">{tasks.filter(t => t.column === id).length}</span>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar bg-black/20">
                {tasks.filter(t => t.column === id).map(task => (
                    <div key={task.id} className={`bg-[#0a0a0a] border border-white/5 p-4 rounded-lg group hover:border-aether-accent/40 transition-all shadow-sm relative overflow-hidden`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${borderColor}`}></div>
                        <div className="flex justify-between items-start gap-3 mb-3">
                            <p className="text-sm text-aether-text leading-relaxed font-medium">{task.content}</p>
                            <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-aether-muted hover:text-red-400 transition-opacity"><X size={14} /></button>
                        </div>
                        <div className="flex justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                            {id !== 'todo' && <button onClick={() => moveTask(task.id, 'todo')} className="text-[9px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded uppercase font-bold text-aether-muted hover:text-white transition-colors">Backlog</button>}
                            {id !== 'progress' && <button onClick={() => moveTask(task.id, 'progress')} className="text-[9px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded uppercase font-bold text-aether-muted hover:text-white transition-colors">Doing</button>}
                            {id !== 'done' && <button onClick={() => moveTask(task.id, 'done')} className="text-[9px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded uppercase font-bold text-aether-muted hover:text-white transition-colors">Done</button>}
                        </div>
                    </div>
                ))}
                <button onClick={() => addTask(id)} className="w-full py-3 border border-dashed border-white/10 rounded-lg text-xs text-aether-muted hover:text-white hover:border-aether-accent/50 hover:bg-aether-accent/5 transition-all flex items-center justify-center gap-2 font-medium">
                    <Plus size={14} /> Create Task
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
             <div className="h-12 border-b border-aether-border flex items-center px-6 gap-3 bg-black/40">
                <Layout size={16} className="text-aether-accent" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Project Kanban Board</span>
             </div>
             <div className="flex-1 flex overflow-x-auto p-6 gap-6">
                {renderColumn('todo', 'Backlog', 'bg-red-900/10', 'bg-red-500')}
                {renderColumn('progress', 'In Progress', 'bg-blue-900/10', 'bg-blue-500')}
                {renderColumn('done', 'Completed', 'bg-green-900/10', 'bg-green-500')}
             </div>
        </div>
    );
};

export default KanbanBoard;
