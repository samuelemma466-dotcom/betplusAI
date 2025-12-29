
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Fingerprint, Check } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Password Strength State
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }
    let score = 0;
    if (password.length > 6) score += 1;
    if (password.length > 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setStrength(score);
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    
    // Simulate Network Auth
    setTimeout(() => {
      setIsLoading(false);
      onAuthenticated();
    }, 1500);
  };

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col md:flex-row">
      {/* Left Panel: Hero / Branding */}
      <div className="hidden md:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden border-r border-slate-800">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-950"></div>
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-10 mix-blend-overlay"></div>
         
         <div className="relative z-10 text-center px-10">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-8 mx-auto transform rotate-3">
               <span className="font-black text-white text-4xl italic">B</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">BetPulse AI</h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
               The world's most advanced AI-powered betting simulation engine. Secure, fast, and intelligent.
            </p>
            
            <div className="mt-12 flex gap-4 justify-center">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                  <ShieldCheck size={14} className="text-emerald-500" /> AES-256 Encrypted
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                  <Fingerprint size={14} className="text-emerald-500" /> Biometric Ready
               </div>
            </div>
         </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 bg-white dark:bg-slate-950 flex items-center justify-center p-6 md:p-12 relative">
         <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-700">
            <div className="mb-10 text-center md:text-left">
               <div className="md:hidden w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg mb-6 mx-auto">
                  <span className="font-black text-white text-2xl italic">B</span>
               </div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
               </h2>
               <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {mode === 'login' 
                     ? 'Enter your credentials to access your secure wallet.' 
                     : 'Join the simulation engine today.'}
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail size={18} />
                     </div>
                     <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl block pl-11 pr-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                        placeholder="name@example.com"
                     />
                  </div>
               </div>

               <div>
                  <div className="flex justify-between mb-2 ml-1">
                     <label className="block text-xs font-bold text-slate-500 uppercase">Password</label>
                     {mode === 'login' && <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-500">Forgot?</a>}
                  </div>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                     </div>
                     <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl block pl-11 pr-11 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                        placeholder="••••••••••••"
                     />
                     <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                     >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>
                  
                  {/* Password Strength Meter (Only in Register Mode) */}
                  {mode === 'register' && password && (
                     <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Strength</span>
                           <span className={`text-[10px] font-bold ${strength <= 2 ? 'text-red-500' : strength <= 3 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                              {getStrengthLabel()}
                           </span>
                        </div>
                        <div className="flex gap-1 h-1">
                           {[1, 2, 3, 4, 5].map((idx) => (
                              <div 
                                 key={idx} 
                                 className={`flex-1 rounded-full transition-colors duration-300 ${strength >= idx ? getStrengthColor() : 'bg-slate-200 dark:bg-slate-800'}`} 
                              />
                           ))}
                        </div>
                     </div>
                  )}
               </div>

               <button 
                  type="submit"
                  disabled={isLoading || !email || !password || (mode === 'register' && strength < 2)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
               >
                  {isLoading ? (
                     <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Authenticating...
                     </span>
                  ) : (
                     <>
                        {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                     </>
                  )}
               </button>
            </form>

            <div className="mt-8 text-center">
               <p className="text-slate-500 text-sm">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button 
                     onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                     className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                     {mode === 'login' ? 'Sign up' : 'Log in'}
                  </button>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
