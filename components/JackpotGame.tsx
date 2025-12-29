
import React, { useState, useEffect } from 'react';
import { JACKPOT_MATCHES } from '../constants';
import { Trophy, Timer, Info, Shuffle, Check, Loader2, Award, Zap, Lock, Unlock, Wand2, RefreshCw, AlertCircle, Coins, ChevronRight, LayoutGrid, ShieldCheck } from 'lucide-react';

const JackpotGame: React.FC = () => {
  const [selections, setSelections] = useState<Record<string, '1' | 'X' | '2'>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const totalMatches = JACKPOT_MATCHES.length;
  const selectedCount = Object.keys(selections).length;
  const isComplete = selectedCount === totalMatches;

  useEffect(() => {
    const deadline = JACKPOT_MATCHES[0]?.startTime.getTime() || Date.now() + 172800000;
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = deadline - now;
      if (difference <= 0) { setTimeLeft("Closed"); return; }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds}s`);
    };
    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSelect = (matchId: string, value: '1' | 'X' | '2') => {
    if (locked[matchId]) return; // Cannot change locked selections
    setSelections(prev => ({ ...prev, [matchId]: value }));
  };

  const toggleLock = (matchId: string) => {
    if (!selections[matchId]) return; // Must have a selection to lock
    setLocked(prev => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const handleAutoPick = (mode: 'all' | 'remaining') => {
    const newSelections = { ...selections };
    JACKPOT_MATCHES.forEach(match => {
      if (locked[match.id]) return; // Skip locked
      if (mode === 'remaining' && newSelections[match.id]) return;
      const options: ('1' | 'X' | '2')[] = ['1', 'X', '2'];
      newSelections[match.id] = options[Math.floor(Math.random() * 3)];
    });
    setSelections(newSelections);
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }, 2000);
  };

  return (
    <div className="bg-slate-950 pb-20 animate-in fade-in duration-700">
      
      {/* Premium Header */}
      <div className="relative bg-gradient-to-b from-amber-600 to-amber-950 p-10 rounded-b-[60px] shadow-3xl overflow-hidden mb-12">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop')] opacity-15 mix-blend-overlay bg-cover bg-center scale-110"></div>
         <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 mb-6">
               <Trophy size={20} className="text-yellow-400 animate-pulse" />
               <span className="text-[11px] font-black uppercase tracking-[0.3em] text-yellow-100">Super 12 Syndicate</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] mb-3 tracking-tighter">
               ₦50,000,000
            </h1>
            <p className="text-amber-100/60 font-bold text-lg max-w-md leading-tight mb-10">Predict all 12 matches correctly to join the legendary hall of winners.</p>
            
            <div className="flex flex-wrap justify-center gap-10">
               <div className="text-center">
                  <div className="text-[10px] font-black text-amber-200/40 uppercase tracking-[0.2em] mb-2">Window Closes</div>
                  <div className="text-white font-mono text-xl font-black flex items-center gap-3 bg-black/30 px-5 py-2 rounded-2xl border border-white/5">
                     <Timer size={18} className="text-amber-400" /> {timeLeft}
                  </div>
               </div>
               <div className="text-center">
                  <div className="text-[10px] font-black text-amber-200/40 uppercase tracking-[0.2em] mb-2">Syndicate Pool</div>
                  <div className="text-emerald-400 text-xl font-black flex items-center gap-2 bg-black/30 px-5 py-2 rounded-2xl border border-white/5">
                     <Check size={18} /> Guaranteed
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Ticket Management Console */}
      <div className="px-4 max-w-3xl mx-auto mb-12 sticky top-20 z-20">
         <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-6 rounded-[32px] shadow-3xl flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full">
               <div className="flex justify-between text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                  <span>Ticket Integrity</span>
                  <span className={isComplete ? "text-emerald-500" : "text-amber-500"}>{selectedCount}/{totalMatches} Selections Made</span>
               </div>
               <div className="h-4 bg-slate-950 rounded-full overflow-hidden p-1 border border-slate-800 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-700 shadow-[0_0_20px_rgba(245,158,11,0.5)]" 
                    style={{ width: `${(selectedCount / totalMatches) * 100}%` }}
                  ></div>
               </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
               <button 
                  onClick={() => handleAutoPick('remaining')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-slate-700 active:scale-95 shadow-lg group"
               >
                  <Wand2 size={18} className="text-amber-400 group-hover:rotate-12 transition-transform" /> Fill
               </button>
               <button 
                  onClick={() => handleAutoPick('all')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-slate-700 active:scale-95 shadow-lg group"
               >
                  <RefreshCw size={18} className="text-emerald-400 group-hover:rotate-45 transition-transform" /> SHUFFLE
               </button>
            </div>
         </div>
         <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><Lock size={12} className="text-amber-500" /> Locked games are safe from shuffle</span>
            <span className="flex items-center gap-2"><ShieldCheck size={12} className="text-emerald-500" /> Entry: ₦100.00</span>
         </div>
      </div>

      {/* Match Matrix */}
      <div className="px-4 max-w-3xl mx-auto space-y-6">
        {JACKPOT_MATCHES.map((match, index) => {
          const isLocked = locked[match.id];
          const hasSelection = !!selections[match.id];
          return (
            <div 
               key={match.id} 
               className={`relative rounded-[40px] p-8 border transition-all duration-500 shadow-2xl
                  ${isLocked ? 'bg-slate-900 border-amber-500/40 scale-[1.02]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
               `}
            >
               <div className="absolute top-6 right-8 flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-700 bg-black/40 px-3 py-1 rounded-full uppercase tracking-widest">Match {index + 1}</span>
                  <button 
                     onClick={() => toggleLock(match.id)}
                     disabled={!hasSelection}
                     className={`p-3 rounded-2xl transition-all duration-300 ${!hasSelection ? 'opacity-20 cursor-not-allowed' : isLocked ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/30' : 'bg-slate-800 text-slate-600 hover:text-white hover:bg-slate-700'}`}
                  >
                     {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                  </button>
               </div>
               
               <div className="text-center mb-8">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">{match.league} • {match.startTime.toLocaleDateString([], {weekday:'short', hour:'2-digit', minute:'2-digit'})}</p>
               </div>
               
               <div className="flex items-center justify-between gap-6 mb-10">
                  <div className="flex-1 flex flex-col items-center gap-4">
                     <div className="w-20 h-20 rounded-full bg-white/5 p-4 border border-white/5 shadow-2xl">
                        <img src={match.homeTeam.logo} alt="" className="w-full h-full object-contain" />
                     </div>
                     <span className="text-sm font-black text-white text-center tracking-tight leading-none h-8 flex items-center">{match.homeTeam.name}</span>
                  </div>
                  
                  <div className="text-slate-800 font-black text-2xl italic tracking-tighter opacity-50">VS</div>
                  
                  <div className="flex-1 flex flex-col items-center gap-4 text-right">
                     <div className="w-20 h-20 rounded-full bg-white/5 p-4 border border-white/5 shadow-2xl">
                        <img src={match.awayTeam.logo} alt="" className="w-full h-full object-contain" />
                     </div>
                     <span className="text-sm font-black text-white text-center tracking-tight leading-none h-8 flex items-center">{match.awayTeam.name}</span>
                  </div>
               </div>

               {/* Modern 1X2 Panel */}
               <div className="grid grid-cols-3 gap-4">
                  {(['1', 'X', '2'] as const).map(option => {
                    const active = selections[match.id] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelect(match.id, option)}
                        className={`
                          group relative h-16 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all duration-300 overflow-hidden border-2
                          ${active 
                            ? isLocked 
                                ? 'bg-amber-900/20 border-amber-500/50 text-amber-500'
                                : 'bg-amber-500 border-amber-400 text-black shadow-2xl shadow-amber-500/30' 
                            : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-300'}
                        `}
                      >
                         <span className="relative z-10">{option === '1' ? 'HOME' : option === '2' ? 'AWAY' : 'DRAW'}</span>
                         {active && !isLocked && (
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                         )}
                      </button>
                    );
                  })}
               </div>
            </div>
          );
        })}
      </div>

      {/* Prize Matrix Footer */}
      <div className="mt-20 px-4 max-w-3xl mx-auto pb-40">
         <div className="bg-slate-900 border border-slate-800 rounded-[48px] p-10 shadow-3xl">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
               <Coins size={20} className="text-amber-500" /> SYNDICATE PAYOUT SCALE
            </h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-6 bg-slate-950 rounded-[28px] border border-amber-500/20 group hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black font-black text-lg shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">12</div>
                     <div>
                        <span className="text-base font-black text-white block">Grand Prize Pool</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Jackpot Hit</span>
                     </div>
                  </div>
                  <span className="text-xl font-black text-amber-500 tracking-tighter">₦50,000,000.00</span>
               </div>
               <div className="flex items-center justify-between p-6 bg-slate-950 rounded-[28px] border border-slate-800">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg">11</div>
                     <div>
                        <span className="text-base font-black text-slate-300 block">Consolation Tier I</span>
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Minimum 11 Hits</span>
                     </div>
                  </div>
                  <span className="text-lg font-black text-slate-300 tracking-tighter">₦1,500,000.00</span>
               </div>
               <div className="flex items-center justify-between p-6 bg-slate-950 rounded-[28px] border border-slate-800">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 font-black text-lg">10</div>
                     <div>
                        <span className="text-base font-black text-slate-400 block">Consolation Tier II</span>
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Minimum 10 Hits</span>
                     </div>
                  </div>
                  <span className="text-lg font-black text-slate-400 tracking-tighter">₦250,000.00</span>
               </div>
            </div>
         </div>
      </div>

      {/* Floating Tactical Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-black/60 backdrop-blur-3xl border-t border-white/5 p-6 z-40 pb-safe">
         <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
            <div className="hidden sm:block text-left">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Stake</p>
               <p className="text-3xl font-black text-white italic tracking-tighter">₦100.00</p>
            </div>
            
            <button 
               onClick={handleSubmit}
               disabled={!isComplete || isSubmitting || success}
               className={`
                  flex-1 h-20 rounded-3xl font-black text-xl uppercase tracking-widest transition-all shadow-3xl flex items-center justify-center gap-4 group
                  ${success ? 'bg-emerald-500 text-white' : 
                    isComplete ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/40 hover:-translate-y-1' : 
                    'bg-slate-800 text-slate-600 cursor-not-allowed'}
               `}
            >
               {success ? (
                  <><Award className="animate-bounce" /> ENTRY SUBMITTED!</>
               ) : isSubmitting ? (
                  <><Loader2 className="animate-spin" /> VERIFYING TICKET...</>
               ) : (
                  <><Zap size={28} fill={isComplete ? "currentColor" : "none"} className="group-hover:scale-110 transition-transform" /> {isComplete ? "PLACE JACKPOT ENTRY" : `PICK ${totalMatches - selectedCount} MORE GAMES`}</>
               )}
            </button>
         </div>
      </div>
    </div>
  );
};

export default JackpotGame;
