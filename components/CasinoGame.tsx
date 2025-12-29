
import React, { useState, useEffect, useRef } from 'react';
// Added ChevronRight to the import list below
import { Play, Star, Flame, Dices, Gamepad2, Search, Zap, X, RotateCw, Coins, Trophy, TrendingUp, AlertTriangle, ArrowLeft, LayoutGrid, Gem, Radio, Rocket, Layers, BarChart3, ShieldCheck, Info, ChevronRight } from 'lucide-react';

// --- EXPERT RESEARCHED GAME DATABASE ---
// Images selected to match the visual "vibe" of real industry titles
const GAMES = [
  { 
    id: 1, 
    name: "Aviator Pro", 
    provider: "Spribe", 
    category: "Crash", 
    image: "https://images.unsplash.com/photo-1559656717-353d2d89b335?q=80&w=600&auto=format&fit=crop", 
    hot: true, 
    rtp: "97.1%", 
    volatility: "High" 
  },
  { 
    id: 2, 
    name: "Sweet Bonanza", 
    provider: "Pragmatic", 
    category: "Slots", 
    image: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?q=80&w=600&auto=format&fit=crop", 
    hot: true, 
    rtp: "96.51%", 
    volatility: "Medium" 
  },
  { 
    id: 3, 
    name: "Gates of Olympus", 
    provider: "Pragmatic", 
    category: "Slots", 
    image: "https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?q=80&w=600&auto=format&fit=crop", 
    hot: false, 
    rtp: "96.50%", 
    volatility: "High" 
  },
  { 
    id: 4, 
    name: "Lightning Roulette", 
    provider: "Evolution", 
    category: "Live", 
    image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=600&auto=format&fit=crop", 
    hot: true, 
    rtp: "97.30%", 
    volatility: "Extreme" 
  },
  { 
    id: 5, 
    name: "Blackjack VIP", 
    provider: "Evolution", 
    category: "Live", 
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop", 
    hot: false, 
    rtp: "99.59%", 
    volatility: "Low" 
  },
  { 
    id: 6, 
    name: "Wolf Gold", 
    provider: "Pragmatic", 
    category: "Slots", 
    image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=600&auto=format&fit=crop", 
    hot: false, 
    jackpot: true, 
    rtp: "96.01%", 
    volatility: "Medium" 
  },
  { 
    id: 7, 
    name: "Crazy Time", 
    provider: "Evolution", 
    category: "Live", 
    image: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=600&auto=format&fit=crop", 
    hot: true, 
    rtp: "95.41%", 
    volatility: "Extreme" 
  },
  { 
    id: 8, 
    name: "Plinko Elite", 
    provider: "Stake", 
    category: "Crash", 
    image: "https://images.unsplash.com/photo-1605218427368-35b0f9c2d7e4?q=80&w=600&auto=format&fit=crop", 
    hot: false, 
    rtp: "99.00%", 
    volatility: "Adjustable" 
  },
  { 
    id: 9, 
    name: "Baccarat Squeeze", 
    provider: "Evolution", 
    category: "Live", 
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=600&auto=format&fit=crop", 
    hot: false, 
    rtp: "98.94%", 
    volatility: "Low" 
  }
];

const PROVIDERS = ["All", "Pragmatic", "Evolution", "Spribe", "Stake"];
const CATEGORIES = [
  { id: 'All', icon: LayoutGrid, label: "Lobby" },
  { id: 'Hot', icon: Flame, label: "Hot" },
  { id: 'Slots', icon: Gem, label: "Slots" },
  { id: 'Live', icon: Radio, label: "Live Casino" },
  { id: 'Crash', icon: Rocket, label: "Originals" },
  { id: 'Jackpots', icon: Trophy, label: "Jackpots" }
];

// --- ADVANCED CRASH ENGINE ---
const CrashGame = ({ onClose, onWin }: { onClose: () => void, onWin: (amt: number) => void }) => {
  const [multiplier, setMultiplier] = useState(1.00);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'crashed'>('idle');
  const [bet, setBet] = useState(10);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const startGame = () => {
    setGameState('running');
    setCashedOutAt(null);
    setMultiplier(1.00);
    startTimeRef.current = Date.now();
    const crashPoint = Math.random() < 0.05 ? 1.00 : (1 + Math.random() * 12); 

    const loop = () => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const currentMult = Math.pow(1.07, elapsed * 10); 

      if (currentMult >= crashPoint) {
        setGameState('crashed');
        setMultiplier(crashPoint);
        cancelAnimationFrame(animationRef.current!);
      } else {
        setMultiplier(currentMult);
        animationRef.current = requestAnimationFrame(loop);
      }
    };
    animationRef.current = requestAnimationFrame(loop);
  };

  const cashOut = () => {
    if (gameState === 'running') {
      cancelAnimationFrame(animationRef.current!);
      const winAmt = bet * multiplier;
      setCashedOutAt(multiplier);
      setGameState('idle');
      onWin(winAmt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[90vh] lg:h-[650px]">
        {/* Visual Engine (HUD Style) */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-800">
           {/* Radar Grid Overlay */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

           <div className="text-center z-10 relative">
              <div className={`text-8xl lg:text-[10rem] font-black tabular-nums tracking-tighter transition-colors duration-200 ${gameState === 'crashed' ? 'text-red-600' : cashedOutAt ? 'text-emerald-500' : 'text-white'}`}>
                 {multiplier.toFixed(2)}<span className="text-4xl lg:text-6xl opacity-40">x</span>
              </div>
              {gameState === 'crashed' && <div className="text-red-600 font-black text-3xl mt-4 animate-bounce uppercase tracking-widest italic">Crashed!</div>}
              {cashedOutAt && <div className="text-emerald-500 font-bold text-2xl mt-4 animate-pulse">Cashed Out! +${(bet * cashedOutAt - bet).toFixed(2)}</div>}
           </div>

           {/* Dynamic Plane Icon */}
           {gameState === 'running' && (
              <div 
                 className="absolute bottom-1/4 left-1/4 transition-transform duration-100 ease-linear"
                 style={{ transform: `translate(${multiplier * 10}px, -${multiplier * 15}px)` }}
              >
                 <Rocket className="text-red-500 -rotate-45" size={48} />
                 <div className="w-12 h-12 bg-red-500/20 rounded-full absolute -top-1 -left-1 animate-ping"></div>
              </div>
           )}
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-96 bg-slate-900 p-8 flex flex-col justify-between">
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="bg-red-600 p-1.5 rounded-lg shadow-lg shadow-red-900/40">
                       <Rocket size={18} className="text-white" />
                    </div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tighter">Aviator Pro</h2>
                 </div>
                 <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"><X size={24} /></button>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
                 <div className="flex justify-between items-end">
                    <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bet Amount</label>
                       <div className="text-2xl font-black text-white mt-1">${bet}</div>
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => setBet(Math.max(1, bet/2))} className="bg-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">1/2</button>
                       <button onClick={() => setBet(bet*2)} className="bg-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">2x</button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              {gameState === 'running' ? (
                <button 
                  onClick={cashOut}
                  className="w-full h-24 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-3xl rounded-[24px] shadow-xl shadow-yellow-500/20 flex flex-col items-center justify-center transition-all active:scale-95"
                >
                   <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Current Win</span>
                   <span className="flex items-center gap-1">${(bet * multiplier).toFixed(2)}</span>
                </button>
              ) : (
                <button 
                  onClick={startGame}
                  className="w-full h-24 bg-red-600 hover:bg-red-500 text-white font-black text-3xl rounded-[24px] shadow-xl shadow-red-600/20 transition-all active:scale-95"
                >
                   {gameState === 'crashed' ? 'REBET' : 'BET'}
                </button>
              )}
              <div className="flex items-center justify-center gap-2 py-4 border-t border-slate-800">
                 <ShieldCheck size={14} className="text-emerald-500" />
                 <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Provably Fair Seed: RNG-88219</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- ELITE SLOT ENGINE ---
const SlotGame = ({ onClose, name, onWin }: { onClose: () => void, name: string, onWin: (amt: number) => void }) => {
  const [reels, setReels] = useState(['💎', '💎', '💎']);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [win, setWin] = useState(0);
  const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣', '🔔', '⭐️'];

  const spin = () => {
    setSpinning(true);
    setWin(0);
    let count = 0;
    const interval = setInterval(() => {
      setReels([symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]]);
      count++;
      if (count > 25) {
        clearInterval(interval);
        const final = [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]];
        if (Math.random() > 0.82) final.fill(final[0]); // Payout Boost
        setReels(final);
        setSpinning(false);
        if (final[0] === final[1] && final[1] === final[2]) {
          const payout = bet * 15;
          setWin(payout);
          onWin(payout);
        }
      }
    }, 80);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 rounded-[48px] border-[12px] border-slate-800 overflow-hidden shadow-2xl relative">
         <button onClick={onClose} className="absolute top-8 right-8 z-10 p-2 bg-slate-800/80 rounded-full text-white hover:bg-slate-700 transition-colors"><X size={24} /></button>
         
         <div className="p-10 pt-16 flex flex-col items-center">
            <div className="bg-purple-600/20 border border-purple-500/30 px-6 py-2 rounded-full mb-8 shadow-inner">
                <span className="text-purple-400 font-black text-sm uppercase tracking-[0.3em]">{name}</span>
            </div>

            {/* Reel Matrix */}
            <div className="flex gap-5 mb-12 bg-black/80 p-8 rounded-[40px] border-4 border-slate-800 shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]">
               {reels.map((symbol, i) => (
                  <div key={i} className={`w-28 h-40 bg-gradient-to-b from-white to-slate-200 rounded-3xl flex items-center justify-center text-6xl shadow-2xl transition-all ${spinning ? 'scale-90 opacity-70 blur-[1px]' : 'scale-100 opacity-100'}`}>
                     <span className={spinning ? "animate-pulse" : "animate-in zoom-in"}>{symbol}</span>
                  </div>
               ))}
            </div>

            {/* Payline Win Overlay */}
            <div className="h-16 flex items-center justify-center mb-8">
               {win > 0 && (
                  <div className="animate-bounce bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-black px-10 py-3 rounded-2xl text-2xl shadow-2xl border-2 border-white/20">
                     MEGA WIN +${win}
                  </div>
               )}
            </div>

            {/* Spin Panel */}
            <div className="w-full flex flex-col gap-6">
               <div className="flex justify-center gap-4">
                  {[10, 20, 50, 100].map(v => (
                     <button key={v} onClick={() => setBet(v)} className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${bet === v ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>${v}</button>
                  ))}
               </div>

               <button 
                 onClick={spin}
                 disabled={spinning}
                 className="w-full h-28 bg-gradient-to-b from-purple-500 via-indigo-600 to-indigo-800 hover:from-purple-400 hover:to-indigo-500 text-white rounded-[32px] font-black text-4xl shadow-2xl shadow-indigo-600/40 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 transition-all"
               >
                  {spinning ? <RotateCw className="animate-spin" size={40} /> : "SPIN"}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- MAIN CASINO LOBBY ---
const CasinoGame: React.FC<{ onWin: (amt: number) => void }> = ({ onWin }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeProvider, setActiveProvider] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState<any>(null);

  const filteredGames = GAMES.filter(g => {
    const matchCat = activeCategory === 'All' ? true : activeCategory === 'Hot' ? g.hot : activeCategory === 'Jackpots' ? g.jackpot : g.category === activeCategory;
    const matchProv = activeProvider === 'All' ? true : g.provider === activeProvider;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchProv && matchSearch;
  });

  if (selectedGame) {
     if (selectedGame.category === 'Crash') return <CrashGame onClose={() => setSelectedGame(null)} onWin={onWin} />;
     if (selectedGame.category === 'Slots') return <SlotGame name={selectedGame.name} onClose={() => setSelectedGame(null)} onWin={onWin} />;
     
     return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in duration-500">
           <div className="absolute top-10 right-10 text-slate-500 hover:text-white cursor-pointer transition-colors" onClick={() => setSelectedGame(null)}>
              <X size={40} />
           </div>
           <div className="w-32 h-32 bg-purple-600/10 border border-purple-500/20 rounded-[40px] flex items-center justify-center mb-10 text-purple-500 animate-pulse shadow-3xl">
              <Radio size={64} />
           </div>
           <h2 className="text-5xl font-black text-white mb-6 tracking-tighter italic">{selectedGame.name}</h2>
           <p className="text-slate-400 mb-12 max-w-md leading-relaxed text-xl font-medium">
              Authenticating stream with <span className="text-purple-400 font-bold">{selectedGame.provider}</span> Private Studio...
           </p>
           <button 
              onClick={() => setSelectedGame(null)} 
              className="px-12 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl font-black text-lg shadow-2xl transition-all active:scale-95"
           >
              DISCONNECT SESSION
           </button>
        </div>
     );
  }

  return (
    <div className="animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      
      {/* Dynamic Lobby Header */}
      <div className="relative h-80 rounded-[56px] overflow-hidden mb-12 group bg-slate-900 border border-white/5 shadow-3xl">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-[2000ms]"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-slate-900/60 to-transparent"></div>
         <div className="absolute inset-0 flex flex-col justify-center px-16">
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-purple-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-2xl">PRO LOBBY</span>
                <span className="text-purple-300 text-xs font-bold flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full backdrop-blur-md border border-white/5">
                   <Zap size={14} fill="currentColor" /> Instant Payouts
                </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-4 italic tracking-tighter leading-none">NEON<br/>CASINO</h1>
            <p className="text-indigo-200/60 text-xl max-w-sm mb-10 font-medium leading-tight">Elite certified providers. Zero-latency live streams. RNG Verified.</p>
            <div className="flex gap-4">
               <button className="bg-white text-indigo-950 px-10 py-4.5 rounded-[24px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm">EXPLORE GAMES</button>
               <button className="bg-slate-800/80 backdrop-blur-md text-white px-10 py-4.5 rounded-[24px] font-black shadow-2xl border border-white/10 hover:bg-slate-700 transition-all text-sm">PROMOTIONS</button>
            </div>
         </div>
      </div>

      {/* Filter Matrix */}
      <div className="flex flex-col gap-8 mb-12">
         <div className="flex flex-wrap gap-3">
            {CATEGORIES.map(cat => (
               <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-3 px-8 py-4.5 rounded-[28px] font-black text-xs uppercase tracking-[0.15em] transition-all border-2 ${activeCategory === cat.id ? 'bg-purple-600 text-white shadow-2xl shadow-purple-900/40 border-purple-500' : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'}`}
                >
                  <cat.icon size={20} className={activeCategory === cat.id ? 'text-white' : 'text-slate-600'} />
                  {cat.label}
               </button>
            ))}
         </div>

         <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1">
               <Search className="absolute left-6 top-5 text-slate-600" size={24} />
               <input 
                  type="text" 
                  placeholder="Search 2,500+ premium titles..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-[32px] py-5 pl-16 pr-8 text-white font-bold text-lg focus:border-purple-500 outline-none transition-all placeholder:text-slate-700"
               />
            </div>
            <div className="relative">
               <select 
                  value={activeProvider}
                  onChange={(e) => setActiveProvider(e.target.value)}
                  className="bg-slate-900 border-2 border-slate-800 text-slate-500 rounded-[32px] px-10 py-5 outline-none font-black text-xs uppercase tracking-[0.2em] focus:border-purple-500 appearance-none cursor-pointer hover:border-slate-700 transition-colors min-w-[240px]"
               >
                  {PROVIDERS.map(p => <option key={p} value={p}>{p === 'All' ? 'All Providers' : p}</option>)}
               </select>
               <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
            </div>
         </div>
      </div>

      {/* Modern Casino Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 xl:gap-8">
         {filteredGames.map(game => (
            <div 
               key={game.id} 
               onClick={() => setSelectedGame(game)}
               className="group relative bg-slate-900 rounded-[40px] overflow-hidden border-2 border-slate-800 hover:border-purple-500/50 transition-all hover:-translate-y-4 cursor-pointer shadow-xl hover:shadow-[0_20px_40px_rgba(168,85,247,0.2)]"
            >
               {/* High-Fidelity Logo Cover */}
               <div className="aspect-[4/5] relative">
                  <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  
                  {/* Glassmorphic Brand Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                  
                  {/* Interactive Play Button */}
                  <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-purple-900 shadow-3xl transform scale-50 group-hover:scale-100 transition-transform duration-500 border-[6px] border-white/20">
                        <Play size={32} fill="currentColor" />
                     </div>
                  </div>

                  {/* Metadata Tags */}
                  <div className="absolute top-4 inset-x-4 flex justify-between items-start pointer-events-none">
                     <div className="flex flex-col gap-2">
                        {game.hot && <span className="bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-2xl uppercase tracking-widest flex items-center gap-1"><Flame size={10} fill="currentColor" /> HOT</span>}
                        {game.jackpot && <span className="bg-amber-500 text-black text-[8px] font-black px-2 py-1 rounded-full shadow-2xl uppercase tracking-widest flex items-center gap-1"><Trophy size={10} fill="currentColor" /> MAX</span>}
                     </div>
                     <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-xl border border-white/10 uppercase">{game.volatility === 'Extreme' ? '⚡⚡⚡' : game.volatility === 'High' ? '⚡⚡' : '⚡'}</span>
                  </div>
                  
                  {/* Bottom Info Bar */}
                  <div className="absolute bottom-4 inset-x-4 flex justify-between items-end">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">{game.provider}</span>
                        <h3 className="text-sm font-black text-white leading-none tracking-tight">{game.name}</h3>
                     </div>
                     <div className="text-right">
                        <span className="text-[9px] font-black text-emerald-400 font-mono tracking-tighter bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-emerald-500/20">{game.rtp} RTP</span>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Trust & Certifications Bar */}
      <div className="mt-20 py-10 border-t border-slate-800 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
         <div className="flex items-center gap-3 text-white font-black italic text-xl">
            <ShieldCheck size={32} /> RNG CERTIFIED
         </div>
         <div className="flex items-center gap-3 text-white font-black italic text-xl">
            <Info size={32} /> LICENSED GAMING
         </div>
         <div className="flex items-center gap-3 text-white font-black italic text-xl">
            <BarChart3 size={32} /> FAIR PLAY V2
         </div>
      </div>
    </div>
  );
};

export default CasinoGame;
