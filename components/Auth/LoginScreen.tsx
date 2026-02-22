
import React, { useState, useEffect, useRef } from 'react';
import { Zap, User, ArrowRight, Check, HardDrive, Shield, Loader2, AlertTriangle } from 'lucide-react';
import BlackholeIcon from '../Layout/BlackholeIcon';
import { UserProfile } from '../../types';

interface LoginScreenProps {
  onLogin: () => void;
  onGuestLogin: () => void;
  onCompleteProfile: (profile: UserProfile) => void;
  loading: boolean;
}

const GOOGLE_CLIENT_ID = "1029470745171-gfq6asvqj6a3k9h131fa47ih9hrb89r0.apps.googleusercontent.com";

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGuestLogin, onCompleteProfile, loading: parentLoading }) => {
  const [step, setStep] = useState<'login' | 'age' | 'profile' | 'permissions'>('login');
  const [localLoading, setLocalLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [driveAccess, setDriveAccess] = useState(true);
  const [prankMessage, setPrankMessage] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogle = () => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          // @ts-ignore
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: googleBtnRef.current.offsetWidth || 300,
            text: 'signin_with',
            shape: 'pill',
          });
        }
      } else {
        setTimeout(initializeGoogle, 500);
      }
    };

    if (step === 'login' && !localLoading) {
      initializeGoogle();
    }
  }, [step, localLoading]);

  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT Decode failed", e);
      return null;
    }
  };

  const handleGoogleCredentialResponse = (response: any) => {
    setLocalLoading(true);
    setTimeout(() => {
      const payload = decodeJwt(response.credential);
      if (payload) {
        setName(payload.name || '');
        setEmail(payload.email || '');
        setPhotoURL(payload.picture || '');
        setStep('age');
      }
      setLocalLoading(false);
    }, 600);
  };

  const handleGuestLogin = () => {
    setName('Guest Explorer');
    setStep('age');
  };

  const handleAgeSubmit = () => {
    const ageNum = Number(age);
    if (!age) return;
    
    setPrankMessage(null);

    // Prank Logic
    if (ageNum < 5) {
        setPrankMessage("👶 Goo goo gaga? Come back when you can reach the keyboard!");
        return;
    }

    if (ageNum <= 10) {
        setPrankMessage("🧸 Aren't you a little young to be building the Singularity? Proceed with caution.");
        setTimeout(() => setStep('profile'), 2500);
        return;
    }

    if (ageNum === 67) {
        setPrankMessage("👴 Brooooo ur 67? Massive respect. Coding is life.");
        setTimeout(() => setStep('profile'), 2500);
        return;
    }

    if (ageNum === 69) {
        setPrankMessage("😏 Nice.");
        setTimeout(() => setStep('profile'), 1500);
        return;
    }

    if (ageNum > 100) {
         setPrankMessage("👽 Bro are you an alien or something? That's ancient.");
         setTimeout(() => setStep('profile'), 2500);
         return;
    }

    setStep('profile');
  };

  const handleProfileSubmit = () => {
    if (!name.trim()) return;
    setStep('permissions');
  };

  const handleFinalize = () => {
    setLocalLoading(true);
    const newUser: UserProfile = {
      id: `u_${Date.now()}`,
      name: name,
      email: email,
      photoURL: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00d4ff&color=000`,
      isGuest: !email,
      syncEnabled: driveAccess,
      driveConnected: driveAccess,
      // @ts-ignore
      isMature: (Number(age) || 0) >= 18
    };
    setTimeout(() => {
      onCompleteProfile(newUser);
    }, 800);
  };

  const isLoading = localLoading || parentLoading;

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full bg-black text-aether-text relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #111 0%, #000 100%)' }}>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(0,212,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="z-10 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-sm w-[90%] md:w-full text-center relative overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>

        <div className="flex flex-col items-center justify-center mb-8 relative">
           <div className="relative z-10 mb-6 transition-transform duration-500 hover:scale-110">
              <BlackholeIcon size={80} />
           </div>
           <h1 className="text-4xl font-bold tracking-tighter text-white mb-2 drop-shadow-lg">AETHER</h1>
           <p className="text-aether-muted text-xs uppercase tracking-[0.2em] font-medium opacity-50">Singularity Workspace</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in zoom-in-95">
            <Loader2 className="w-8 h-8 text-aether-accent animate-spin" />
            <p className="text-sm text-aether-muted font-mono tracking-widest">WAKING THE ENGINE...</p>
          </div>
        ) : (
          <>
            {step === 'login' && (
                <div className="space-y-4 relative z-20 animate-in fade-in slide-in-from-right-4">
                    <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px] overflow-hidden rounded-xl border border-white/10 hover:border-aether-accent/50 transition-colors"></div>
                    <button onClick={handleGuestLogin} className="w-full group px-6 py-3 bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all duration-300 flex items-center justify-center gap-3">
                        <User size={16} className="text-aether-muted group-hover:text-white transition-colors" />
                        <span className="font-medium text-sm text-aether-muted group-hover:text-white transition-colors">Continue as Guest</span>
                    </button>
                </div>
            )}

            {step === 'age' && (
                <div className="space-y-4 relative z-20 animate-in fade-in slide-in-from-right-4 text-left">
                    <label className="text-xs text-aether-accent uppercase font-bold tracking-widest">Verification</label>
                    <h3 className="text-lg font-bold text-white">How many orbits have you completed?</h3>
                    <p className="text-xs text-aether-muted mb-4 leading-relaxed">Age verification ensures specific Singularity features are correctly provisioned.</p>
                    <input 
                        type="number" 
                        value={age}
                        onChange={(e) => {
                            setAge(parseInt(e.target.value) || '');
                            setPrankMessage(null);
                        }}
                        placeholder="Enter age..."
                        autoFocus
                        className="w-full bg-black/50 border border-aether-border focus:border-aether-accent rounded-xl p-4 text-white outline-none transition-all"
                    />
                    
                    {prankMessage && (
                        <div className="p-3 bg-aether-accent/10 border border-aether-accent/20 rounded-lg animate-in zoom-in slide-in-from-bottom-2">
                             <p className="text-xs font-bold text-aether-accent text-center">{prankMessage}</p>
                        </div>
                    )}

                    <button
                        onClick={handleAgeSubmit}
                        disabled={age === ''}
                        className="w-full px-6 py-3 bg-aether-accent text-black font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span>Confirm Orbit</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {step === 'profile' && (
                <div className="space-y-4 relative z-20 animate-in fade-in slide-in-from-right-4">
                    <div className="text-left mb-2">
                        <label className="text-xs text-aether-accent uppercase font-bold tracking-wider">Identity</label>
                        <h3 className="text-lg font-bold text-white">Confirm Node Alias</h3>
                    </div>
                    {photoURL && (
                      <div className="flex justify-center mb-4">
                        <img src={photoURL} alt="Profile" className="w-20 h-20 rounded-full border-2 border-aether-accent shadow-glow" />
                      </div>
                    )}
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name..."
                        className="w-full bg-black/50 border border-aether-border focus:border-aether-accent rounded-xl p-4 text-white outline-none transition-all font-sans"
                    />
                    <button
                        onClick={handleProfileSubmit}
                        disabled={!name.trim()}
                        className="w-full px-6 py-3 bg-aether-accent text-black font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span>Next</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {step === 'permissions' && (
                 <div className="space-y-6 relative z-20 animate-in fade-in slide-in-from-right-4 text-left">
                    <div>
                        <h3 className="text-lg font-bold text-white">Quantum Link</h3>
                        <p className="text-sm text-aether-muted mt-1">Enhance Aether with cloud capabilities.</p>
                    </div>
                    
                    <div 
                        onClick={() => setDriveAccess(!driveAccess)}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${driveAccess ? 'bg-aether-accent/10 border-aether-accent shadow-[0_0_15px_rgba(0,212,255,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${driveAccess ? 'bg-aether-accent text-black' : 'bg-white/10 text-aether-muted'}`}>
                            <HardDrive size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-white">Cloud Sync</h4>
                            <p className="text-xs text-aether-muted">Persist projects across neural links.</p>
                        </div>
                        {driveAccess && <Check size={20} className="text-aether-accent" />}
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg flex items-start gap-2 text-[10px] text-aether-muted leading-tight border border-white/5">
                        <Shield size={12} className="shrink-0 mt-0.5 text-aether-accent" />
                        <p>Aether operates in localized private clusters. Your neural data is yours alone.</p>
                    </div>

                    <button
                        onClick={handleFinalize}
                        className="w-full px-6 py-3 bg-aether-accent text-black font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-aether-accent/20"
                    >
                        <span>Launch Singularity</span>
                        <Zap size={16} fill="currentColor" />
                    </button>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
