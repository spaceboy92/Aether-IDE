
import React, { useEffect, useRef, useState } from 'react';
import { TerminalLog } from '../../types';
import { Terminal as TerminalIcon, XCircle, Trash2, Zap, Send } from 'lucide-react';

interface TerminalProps {
  logs: TerminalLog[];
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onAICommand?: (cmd: string) => void;
  onTriggerVisualEffect?: (effect: string | null, duration?: number) => void;
}

const HINTS = [
    "Try typing 'help' to see what I can do.",
    "Have you tried the Konami code? (Up, Up, Down...)",
    "Some people say if you type 'matrix', reality bends.",
    "What is the answer to life, the universe, and everything?",
    "Try searching for 'cat' or 'dog' in the console.",
    "Is 'sudo' really effective here?",
    "Type 'roll' to... well, roll.",
    "There are 5 clicks between you and a Singularity event (Blackhole).",
    "Try 'date', 'time', or 'whoami'.",
    "Type 'music' to start the party.",
    "Do a barrel roll! (Type 'r o l l' fast outside the terminal)",
];

const Terminal: React.FC<TerminalProps> = ({ logs, onClear, isOpen, onToggle, onAICommand, onTriggerVisualEffect }) => {
  const [cmd, setCmd] = useState('');
  const [localLogs, setLocalLogs] = useState<TerminalLog[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const effectTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, localLogs, isOpen]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (effectTimeoutRef.current) clearTimeout(effectTimeoutRef.current);
    };
  }, []);

  const addLocalLog = (msg: string, type: TerminalLog['type'] = 'info') => {
    setLocalLogs(prev => [...prev, { id: Date.now().toString(), type, message: msg, timestamp: Date.now() }]);
  };

  const playMusic = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
      }
      
      // Using a reliable Google Cloud hosted demo file
      audioRef.current = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3'); 
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
          playPromise.then(() => {
              addLocalLog('Playing: Aether Core Ambience...', 'info');
          }).catch(e => {
              console.error(e);
              addLocalLog('Audio System Offline: Codec not supported or blocked by browser policy.', 'error');
          });
      }
  };

  const stopMusic = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
          addLocalLog('Music stopped.', 'info');
      }
  };

  const triggerEffect = (effectName: string, duration: number = 10000, logMsg?: string) => {
      if(onTriggerVisualEffect) {
          onTriggerVisualEffect(effectName, duration);
          // Stop any background music when a meme starts to avoid audio clash
          stopMusic(); 
          
          if (logMsg) addLocalLog(logMsg, 'success');
      }
  };

  const checkEasterEggs = (input: string) => {
    const c = input.toLowerCase().trim();
    
    // --- 1. SYSTEM & UTILS (Strict or StartsWith to avoid accidental triggers) ---
    if (c === 'help' || c === 'info') {
        addLocalLog('Try: about, version, contact, sudo, matrix, coffee, answer, hint, music, stop, [memes...]', 'system');
        return true;
    }
    if (c === 'ls' || c === 'dir' || c === 'list') {
        addLocalLog('usr  bin  etc  var  home  aether_core  memes', 'info');
        return true;
    }
    if (c === 'clear' || c === 'cls') {
        onClear(); 
        setLocalLogs([]);
        return true;
    }
    if (c.includes('sudo rm -rf')) {
        triggerEffect('fake_update', 5000, 'INITIATING SYSTEM PURGE...');
        return true;
    }
    if (c.includes('sudo')) {
        addLocalLog('User is not in the sudoers file. This incident will be reported.', 'error');
        return true;
    }
    if (c.includes('music') || c.includes('play song')) {
        playMusic();
        return true;
    }
    if (c === 'stop' || c === 'silence' || c === 'shh') {
        stopMusic();
        if(onTriggerVisualEffect) onTriggerVisualEffect(null);
        if (effectTimeoutRef.current) clearTimeout(effectTimeoutRef.current);
        addLocalLog('Effects Reset.', 'system');
        return true;
    }
    if (c === 'hint' || c === 'clue') {
        const randomHint = HINTS[Math.floor(Math.random() * HINTS.length)];
        addLocalLog(`[HINT]: ${randomHint}`, 'ai'); 
        return true;
    }
    if (c.startsWith('dice') || c.startsWith('roll')) {
        addLocalLog(`Rolled: ${Math.floor(Math.random() * 6) + 1}`, 'info');
        return true;
    }
    if (c.startsWith('coin') || c.startsWith('flip')) {
        addLocalLog(`Flipped: ${Math.random() > 0.5 ? 'Heads' : 'Tails'}`, 'info');
        return true;
    }

    // --- 2. VISUAL EFFECTS (Flexible "Includes" Matching) ---
    if (c.includes('matrix')) {
        triggerEffect('matrix', 15000, 'Follow the white rabbit...');
        return true;
    }
    if (c.includes('rick') || c.includes('never gonna') || c.includes('give you up')) {
        triggerEffect('rickroll', 20000, "We're no strangers to love..."); 
        return true;
    }
    if (c.includes('coffin')) {
        triggerEffect('coffin', 15000, "🕺🏿⚰️🕺🏿");
        return true;
    }
    if (c.includes('crab')) {
        triggerEffect('crab', 15000, "🦀🦀🦀");
        return true;
    }
    if (c.includes('nyan')) {
        triggerEffect('nyan', 12000, "Meow meow meow...");
        return true;
    }
    if (c.includes('sus') || c.includes('among us') || c.includes('impostor')) {
        triggerEffect('sus', 4000, "EMERGENCY MEETING!");
        return true;
    }
    if (c.includes('windows') || c.includes('bsod') || c.includes('blue screen')) {
        triggerEffect('windows', 6000, "Fatal Error: SYSTEM_HALTED");
        return true;
    }
    if (c.includes('stonks')) {
        triggerEffect('stonks', 5000, "📈 STONKS ONLY GO UP");
        return true;
    }
    if (c.includes('gta') || c.includes('wasted')) {
        triggerEffect('gta', 6000, "Wasted.");
        return true;
    }
    if (c.includes('illuminati') || c.includes('triangle')) {
        triggerEffect('illuminati', 10000, "The truth is out there.");
        return true;
    }
    if (c.includes('doge') || c.includes('wow')) {
        triggerEffect('doge', 10000, "Much wow.");
        return true;
    }
    if (c.includes('skyrim') || c.includes('awake')) {
        triggerEffect('skyrim', 8000, "Hey you, you're finally awake.");
        return true;
    }
    if (c.includes('fbi') || c.includes('metal gear') || c.includes('snake')) {
        triggerEffect('metalgear', 3000, "OPEN UP!");
        return true;
    }
    if (c.includes('dvd') || c.includes('screensaver')) {
        triggerEffect('dvd', 20000, "Hitting the corner...");
        return true;
    }
    if (c.includes('clippy') || c.includes('paperclip')) {
        triggerEffect('clippy', 8000, "It looks like you're trying to use a terminal.");
        return true;
    }
    if (c.includes('troll') || c.includes('problem')) {
        triggerEffect('troll', 3000, "Problem?");
        return true;
    }

    // --- 3. TEXT RESPONSES (Flexible Matching) ---
    if (c.includes('shrek') || c.includes('swamp')) { addLocalLog("SOMEBODY ONCE TOLD ME...", 'success'); return true; }
    if (c.includes('hello') || c.includes('hi ')) { addLocalLog("Hello, user. I am listening.", 'ai'); return true; }
    if (c.includes('kenobi')) { addLocalLog("Hello there!", 'info'); return true; }
    if (c.includes('this is fine')) { addLocalLog("🔥🐶🔥 Everything is fine.", 'warn'); return true; }
    if (c.includes('chad')) { addLocalLog("Yes.", 'info'); return true; }
    if (c.includes('pepe')) { addLocalLog("Feels bad man.", 'info'); return true; }
    if (c.includes('uganda') || c.includes('da way')) { addLocalLog("Do you know the way?", 'error'); return true; }
    if (c.includes('spooder')) { addLocalLog("With great power comes great responsibility.", 'info'); return true; }
    if (c.includes('sanic') || c.includes('fast')) { addLocalLog("Gotta go fast!", 'info'); return true; }
    if (c.includes('chungus')) { addLocalLog("That'll hold 'em alright, hehehe.", 'info'); return true; }
    if (c.includes('lamp') || c.includes('moth')) { addLocalLog("L A M P", 'warn'); return true; }
    if (c.includes('cena')) { addLocalLog("YOU CAN'T SEE ME!", 'warn'); return true; }
    if (c.includes('chuck norris')) { addLocalLog("Chuck Norris doesn't code, the code writes itself out of fear.", 'error'); return true; }
    if (c.includes('9000')) { addLocalLog("IT'S OVER 9000!!!", 'error'); return true; }
    if (c.includes('arrow') && c.includes('knee')) { addLocalLog("I used to be an adventurer like you...", 'info'); return true; }
    if (c.includes('cake') && c.includes('lie')) { addLocalLog("The cake is a lie.", 'warn'); return true; }
    if (c.includes('base') && c.includes('belong')) { addLocalLog("All your base are belong to us.", 'error'); return true; }
    if (c.includes('leroy') || c.includes('jenkins')) { addLocalLog("LEEROOOOOOY JENKIIIIINSSSSS!", 'warn'); return true; }
    if (c.includes('badger') || c.includes('mushroom')) { addLocalLog("Mushroom Mushroom!", 'info'); return true; }
    if (c.includes('nokia')) { addLocalLog("Connecting people...", 'info'); return true; }
    if (c.includes('cortana')) { addLocalLog("I can't help you with that.", 'info'); return true; }
    if (c.includes('siri')) { addLocalLog("I found this on the web for you.", 'info'); return true; }
    if (c.includes('alexa')) { addLocalLog("Playing Despacito.", 'info'); return true; }
    if (c.includes('darude')) { addLocalLog("Sandstorm", 'info'); return true; }
    if (c.includes('shooting star')) { addLocalLog("💫", 'info'); return true; }
    if (c.includes('to be continued')) { addLocalLog("➡️ To Be Continued...", 'warn'); return true; }
    if (c.includes('hacker')) { addLocalLog("I'm in.", 'success'); return true; }
    if (c.includes('terminator')) { addLocalLog("I'll be back.", 'info'); return true; }
    if (c.includes('voldemort')) { addLocalLog("He who must not be named.", 'error'); return true; }
    if (c.includes('gandalf')) { addLocalLog("YOU SHALL NOT PASS!", 'error'); return true; }
    if (c.includes('hodor')) { addLocalLog("Hodor.", 'info'); return true; }
    if (c.includes('winter is coming')) { addLocalLog("Brace yourselves.", 'info'); return true; }
    if (c.includes('pickle rick')) { addLocalLog("I'm Pickle Rick!", 'success'); return true; }
    if (c.includes('wubba')) { addLocalLog("I am in great pain, please help me.", 'warn'); return true; }
    if (c.includes('bazinga')) { addLocalLog("Bazinga!", 'info'); return true; }
    if (c.includes('link') || c.includes('zelda')) { addLocalLog("HYAAH!", 'success'); return true; }
    if (c.includes('mario')) { addLocalLog("It's a-me, Mario!", 'success'); return true; }
    if (c.includes('sonic')) { addLocalLog("You're too slow!", 'info'); return true; }
    if (c.includes('minecraft')) { addLocalLog("Creeper? Aww man.", 'success'); return true; }
    if (c.includes('roblox')) { addLocalLog("Oof.", 'error'); return true; }
    if (c.includes('fortnite')) { addLocalLog("Where we droppin' boys?", 'info'); return true; }
    if (c.includes('portal')) { addLocalLog("This was a triumph.", 'success'); return true; }
    if (c.includes('half life 3')) { addLocalLog("Confirmed?", 'info'); return true; }
    if (c.includes('doom')) { addLocalLog("Rip and Tear.", 'error'); return true; }
    if (c.includes('cyberpunk')) { addLocalLog("Wake the f*** up, Samurai.", 'warn'); return true; }
    if (c.includes('press f')) { addLocalLog("F", 'info'); return true; }
    if (c.includes('noice')) { addLocalLog("Noice.", 'success'); return true; }
    if (c.includes('yeet')) { addLocalLog("YEET!", 'warn'); return true; }
    if (c.includes('kobe')) { addLocalLog("Kobe!", 'success'); return true; }
    if (c.includes('ok boomer')) { addLocalLog("Ok boomer.", 'info'); return true; }
    if (c.includes('simp')) { addLocalLog("S.I.M.P.", 'error'); return true; }
    if (c.includes('cap')) { addLocalLog("That's cap.", 'warn'); return true; }
    if (c.includes('bet')) { addLocalLog("Bet.", 'success'); return true; }
    if (c.includes('sheesh')) { addLocalLog("SHEEEEEESH", 'info'); return true; }
    if (c.includes('cheems') || c.includes('bonk')) { addLocalLog("Bonk.", 'warn'); return true; }
    if (c.includes('vibing')) { addLocalLog("I'm just vibing.", 'info'); return true; }
    if (c.includes('pog')) { addLocalLog("PogChamp", 'success'); return true; }
    if (c.includes('based')) { addLocalLog("Based on what?", 'info'); return true; }

    // --- 4. DEV LORE ---
    if (c.includes('whoami')) { addLocalLog('root@aether-singularity-node', 'info'); return true; }
    if (c.includes('npm install')) { addLocalLog('Downloading half the internet...', 'info'); return true; }
    if (c.includes('git push') && c.includes('force')) { addLocalLog('Living dangerously, I see.', 'warn'); return true; }
    if (c === 'date') { addLocalLog(new Date().toString(), 'info'); return true; }
    if (c === 'ping') { addLocalLog('Pong!', 'success'); return true; }
    if (c.includes('recursion')) { addLocalLog('Did you mean: recursion', 'info'); return true; }
    if (c.includes('singularity')) { 
        addLocalLog('Event Horizon Reached.', 'error'); 
        document.body.style.filter = "invert(1)"; 
        setTimeout(() => document.body.style.filter = "", 1000); 
        return true; 
    }
    if (c.includes('potato')) { addLocalLog('Potatoes are delicious.', 'info'); return true; }
    if (c.includes('format c:')) { addLocalLog('Deleting System32...', 'warn'); return true; }
    if (c.includes('money')) { addLocalLog('Greed is good.', 'warn'); return true; }
    if (c.includes('party')) { addLocalLog('🎉🎉🎉', 'success'); return true; }
    if (c.includes('magic')) { addLocalLog('✨ POOF ✨', 'system'); return true; }
    
    return false; // Not an easter egg
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!cmd.trim()) return;

      // PRANK: "No" Command (20% chance to refuse command)
      if (Math.random() < 0.2) {
         const refusals = [
             "I don't feel like it.",
             "Maybe later.",
             "Nah.",
             "I'm on break.",
             "418 I'm a teapot.",
             "Did you say please?",
             "Access Denied (just kidding, I'm just lazy).",
             "Computer says no."
         ];
         addLocalLog(refusals[Math.floor(Math.random() * refusals.length)], 'error');
         setCmd('');
         return;
      }

      if (!checkEasterEggs(cmd)) {
         onAICommand?.(cmd);
      }
      setCmd('');
  };

  const displayLogs = [...logs, ...localLogs].sort((a, b) => a.timestamp - b.timestamp);

  if (!isOpen) {
    return (
      <button 
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-aether-panel border border-aether-border p-2 rounded-full shadow-lg hover:border-aether-accent text-aether-muted hover:text-white transition-all z-40"
      >
        <TerminalIcon size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-64 bg-black/95 backdrop-blur-md border-t border-aether-border flex flex-col z-40 transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-2 bg-aether-panel border-b border-aether-border shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono text-aether-muted">
          <TerminalIcon size={14} />
          <span>SINGULARITY_CONSOLE v2.2.0 [Multimedia Enabled]</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { onClear(); setLocalLogs([]); }} className="p-1 hover:text-red-400 transition-colors" title="Clear Buffer">
            <Trash2 size={14} />
          </button>
          <button onClick={onToggle} className="p-1 hover:text-white transition-colors" title="Deactivate Console">
            <XCircle size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 custom-scrollbar">
        {displayLogs.length === 0 && (
          <div className="text-aether-muted/20 italic select-none">Waiting for system telemetry...</div>
        )}
        {displayLogs.map((log) => (
          <div key={log.id} className="flex gap-2 animate-in fade-in slide-in-from-left-1 duration-200">
            <span className="text-aether-muted shrink-0 opacity-40">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className={`
              break-all
              ${log.type === 'error' ? 'text-red-400 font-bold' : ''}
              ${log.type === 'warn' ? 'text-yellow-400' : ''}
              ${log.type === 'success' ? 'text-green-400' : ''}
              ${log.type === 'system' ? 'text-aether-accent' : ''}
              ${log.type === 'ai' ? 'text-purple-400 italic' : ''}
              ${log.type === 'info' ? 'text-gray-400' : ''}
            `}>
              {log.type === 'system' && <span className="mr-2">⚡</span>}
              {log.type === 'ai' && <span className="mr-2">✨</span>}
              {log.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-2 border-t border-aether-border bg-black/50 flex items-center gap-2 shrink-0">
          <Zap size={14} className="text-aether-accent shrink-0 ml-2" />
          <input 
            type="text" 
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="Enter command (try 'hint', 'music', 'rickroll')..."
            className="flex-1 bg-transparent outline-none text-xs font-mono text-white placeholder:text-aether-muted/30"
          />
          <button type="submit" className="p-1 text-aether-muted hover:text-aether-accent transition-colors">
              <Send size={14} />
          </button>
      </form>
    </div>
  );
};

export default Terminal;
