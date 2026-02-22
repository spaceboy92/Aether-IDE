
import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Sparkles, Zap } from 'lucide-react';

interface MonacoEditorProps {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
  isAIWriting?: boolean;
  onMount?: OnMount;
  fontFamily?: string;
  minimapEnabled?: boolean;
  vimMode?: boolean;
}

const MonacoEditorWrapper: React.FC<MonacoEditorProps> = ({ 
  code, 
  language, 
  onChange, 
  readOnly = false, 
  isAIWriting = false,
  onMount,
  fontFamily,
  minimapEnabled,
  vimMode
}) => {
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Define the custom Aether theme
    monaco.editor.defineTheme('aether-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4' },
        { token: 'keyword', foreground: 'ff79c6' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'type', foreground: '8be9fd' },
      ],
      colors: {
        'editor.background': '#0f1115', // aether-bg
        'editor.foreground': '#e2e8f0',
        'editorCursor.foreground': '#00d4ff',
        'editor.lineHighlightBackground': '#161b22',
        'editorLineNumber.foreground': '#4b5563',
        'editor.selectionBackground': '#2a2f3a',
        'editorIndentGuide.background': '#2a2f3a',
        'editorIndentGuide.activeBackground': '#00d4ff'
      }
    });
    monaco.editor.setTheme('aether-dark');

    if (onMount) {
      onMount(editor, monaco);
    }
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-aether-border bg-aether-bg shadow-inner relative">
      {isAIWriting && (
        <div className="absolute top-4 right-4 z-10 bg-aether-panel/90 backdrop-blur border border-aether-accent text-aether-accent px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold animate-pulse shadow-[0_0_15px_rgba(0,212,255,0.3)]">
            <Zap size={14} fill="currentColor" />
            AI WRITING...
        </div>
      )}
      
      {/* Glow Overlay when AI is active */}
      {isAIWriting && (
          <div className="absolute inset-0 z-0 pointer-events-none border-2 border-aether-accent/30 rounded-lg shadow-[inset_0_0_20px_rgba(0,212,255,0.1)]"></div>
      )}

      <Editor
        height="100%"
        width="100%"
        language={language}
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme="aether-dark"
        options={{
          minimap: { enabled: minimapEnabled ?? false },
          fontSize: 14,
          fontFamily: fontFamily || "'JetBrains Mono', monospace",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: readOnly || isAIWriting, // Lock editor when AI is writing
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on'
        }}
      />
    </div>
  );
};

export default MonacoEditorWrapper;
