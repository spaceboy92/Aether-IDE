
import React, { useRef, useState, useEffect } from 'react';
import { Eraser, PenTool, Download, Trash2, Palette, Undo, Redo } from 'lucide-react';

const NeuralCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#00d4ff');
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  
  // History for Undo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Handle resize
    const resize = () => {
        const parent = canvas.parentElement;
        if(parent) {
            // Save content
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCtx?.drawImage(canvas, 0, 0);

            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
            
            // Restore content
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.fillStyle = '#080808';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(tempCanvas, 0, 0);
            }
        }
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Init background
    const ctx = canvas.getContext('2d');
    if(ctx) {
        ctx.fillStyle = '#080808';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    }

    return () => window.removeEventListener('resize', resize);
  }, []);

  const saveState = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
      if (historyStep > 0) {
          const newStep = historyStep - 1;
          setHistoryStep(newStep);
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx && history[newStep]) {
              ctx.putImageData(history[newStep], 0, 0);
          }
      }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#080808' : color;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
        setIsDrawing(false);
        saveState();
    }
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
          ctx.fillStyle = '#080808';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          saveState();
      }
  };

  const downloadCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const link = document.createElement('a');
          link.download = 'aether-sketch.png';
          link.href = canvas.toDataURL();
          link.click();
      }
  };

  return (
    <div className="flex-1 relative h-full flex flex-col bg-[#080808]">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-aether-panel border border-aether-border rounded-xl p-2 flex items-center gap-2 shadow-2xl z-10">
          <button 
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors ${tool === 'pen' ? 'bg-aether-accent text-black' : 'text-aether-muted hover:text-white'}`}
          >
              <PenTool size={18} />
          </button>
          <button 
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-aether-accent text-black' : 'text-aether-muted hover:text-white'}`}
          >
              <Eraser size={18} />
          </button>
          <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
          />
          <input 
            type="range" 
            min="1" max="20" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))} 
            className="w-20 accent-aether-accent"
          />
          <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
          <button onClick={handleUndo} className="p-2 text-aether-muted hover:text-white"><Undo size={18} /></button>
          <button onClick={clearCanvas} className="p-2 text-aether-muted hover:text-red-400"><Trash2 size={18} /></button>
          <button onClick={downloadCanvas} className="p-2 text-aether-muted hover:text-green-400"><Download size={18} /></button>
      </div>

      <canvas 
        ref={canvasRef}
        className="touch-none cursor-crosshair flex-1"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
};

export default NeuralCanvas;
