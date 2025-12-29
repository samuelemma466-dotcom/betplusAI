
import React, { useState, useEffect, useRef } from 'react';
import { Play, Flame, Search, Zap, X, RotateCw, Trophy, History, ShieldCheck, Info, Bomb, Gem, Coins, ChevronRight, Volume2, Settings2 } from 'lucide-react';

// --- iLOT / SPORTY STYLE GAME DATABASE ---
const GAMES = [
  { 
    id: 'aviator', 
    name: "AVIATOR", 
    provider: "Spribe", 
    category: "Crash", 
    image: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=600&auto=format&fit=crop", 
    color: "bg-red-600",
    hot: true, 
    minBet: 10,
    rtp: "97.0%"
  },
  { 
    id: 'mines', 
    name: "MINES", 
    provider: "In-House", 
    category: "Arcade", 
    image: "https://images.unsplash.com/photo-1611416517780-eff3a13b0359?q=80&w=600&auto=format&fit=crop", 
    color: "bg-emerald-600",
    hot: true, 
    minBet: 50,
    rtp: "99.0%"
  },
  { 
    id: 'slots_bonanza', 
    name: "SWEET BONANZA", 
    provider: "Pragmatic", 
    category: "Slots", 
    image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=600&auto=format&fit=crop", 
    color: "bg-pink-500",
    hot: true, 
    minBet: 20,
    rtp: "96.5%"
  },
  { 
    id: 'spin_win', 
    name: "SPIN & WIN", 
    provider: "Golden Race", 
    category: "Table", 
    image: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=600&auto=format&fit=crop", 
    color: "bg-yellow-500",
    hot: false, 
    minBet: 100,
    rtp: "97.3%"
  },
  { 
    id: 'slots_olympus', 
    name: "GATES OF OLYMPUS", 
    provider: "Pragmatic", 
    category: "Slots", 
    image: "https://images.unsplash.com/photo-1569705460063-0030d5258830?q=80&w=600&auto=format&fit=crop", 
    color: "bg-purple-600",
    hot: true, 
    minBet: 20,
    rtp: "96.5%"
  },
  { 
    id: 'virtual_football', 
    name: "VIRTUAL FOOTBALL", 
    provider: "BetRadar", 
    category: "Virtuals", 
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop", 
    color: "bg-blue-600",
    hot: false, 
    minBet: 50,
    rtp: "95.0%"
  },
  { 
    id: 'mines_gold', 
    name: "MINES GOLD", 
    provider: "Turbo Games", 
    category: "Arcade", 
    image: "https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?q=80&w=600&auto=format&fit=crop", 
    color: "bg-amber-500",
    hot: false, 
    minBet: 50,
    rtp: "98.5%"
  },
  { 
    id: 'blackjack', 
    name: "BLACKJACK", 
    provider: "Evolution", 
    category: "Table", 
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop", 
    color: "bg-slate-700",
    hot: false, 
    minBet: 200,
    rtp: "99.5%"
  }
];

const CATEGORIES = [
  { id: 'All', label: "Lobby" },
  { id: 'Crash', label: "Crash" },
  { id: 'Arcade', label: "Mines" },
  { id: 'Slots', label: "Slots" },
  { id: 'Table', label: "Table" },
];

// --- 1. MINES GAME ENGINE (iLOT Style) ---
const MinesGame = ({ onClose, onWin }: { onClose: () => void, onWin: (amt: number) => void }) => {
  const [grid, setGrid] = useState<number[]>(Array(25).fill(0)); // 0: hidden, 1: gem, 2: bomb
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [mineCount, setMineCount] = useState(3);
  const [bet, setBet] = useState(100);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'cashed_out' | 'exploded'>('idle');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  
  // Audio placeholder
  const playSound = (type: 'gem' | 'bomb' | 'win') => {
    // In a real app, integrate Howler.js here
  };

  const startGame = () => {
    // Generate grid
    const newGrid = Array(25).fill(1); // 1 = Gem
    // Place bombs
    let bombsPlaced = 0;
    while (bombsPlaced < mineCount) {
      const idx = Math.floor(Math.random() * 25);
      if (newGrid[idx] !== 2) {
        newGrid[idx] = 2; // 2 = Bomb
        bombsPlaced++;
      }
    }
    setGrid(newGrid);
    setRevealed(Array(25).fill(false));
    setGameState('playing');
    setCurrentMultiplier(1.0);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing' || revealed[index]) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (grid[index] === 2) {
      // Bomb hit
      setGameState('exploded');
      playSound('bomb');
      // Reveal all
      setRevealed(Array(25).fill(true));
    } else {
      // Gem hit
      playSound('gem');
      // Calculate new multiplier based on probability
      const remainingTiles = 25 - newRevealed.filter(Boolean).length;
      const safeTiles = 25 - mineCount - newRevealed.filter((r, i) => r && grid[i] === 1).length + 1; // +1 includes current
      // Simplified multiplier logic for demo
      const growth = 1 + (mineCount / (25 - mineCount)) * 0.9;
      setCurrentMultiplier(prev => prev * growth);
    }
  };

  const cashOut = () => {
    if (gameState === 'playing') {
      const winAmount = bet * currentMultiplier;
      setGameState('cashed_out');
      playSound('win');
      onWin(winAmount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1923] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1a242d] rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-[600px] border border-slate-700">
        
        {/* Controls Sidebar */}
        <div className="w-full md:w-80 bg-[#232e38] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700">
          <div>
            <div className="flex items-center gap-2 mb-8">
               <button onClick={onClose} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"><X size={16} className="text-white" /></button>
               <h2 className="text-xl font-black text-white italic tracking-wider">MINES</h2>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Bet Amount</label>
                  <div className="flex items-center bg-[#0f1923] rounded-lg border border-slate-600 mt-2 px-3 py-2">
                     <span className="text-emerald-500 font-bold mr-2">₦</span>
                     <input 
                       type="number" 
                       value={bet} 
                       onChange={e => setBet(Number(e.target.value))}
                       disabled={gameState === 'playing'}
                       className="bg-transparent text-white font-bold w-full outline-none"
                     />
                  </div>
                  <div className="flex gap-2 mt-2">
                     {[100, 500, 1000, 5000].map(amt => (
                        <button key={amt} onClick={() => setBet(amt)} disabled={gameState === 'playing'} className="flex-1 bg-slate-700 py-1 rounded text-[10px] text-white font-bold hover:bg-slate-600">{amt}</button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Mines</label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                     {[1, 3, 5, 10, 20].map(cnt => (
                        <button 
                           key={cnt} 
                           onClick={() => setMineCount(cnt)}
                           disabled={gameState === 'playing'}
                           className={`py-2 rounded font-bold text-xs transition-colors ${mineCount === cnt ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                        >
                           {cnt}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          <div className="mt-6">
             {gameState === 'playing' ? (
                <button 
                  onClick={cashOut}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-black text-xl rounded-lg shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
                >
                   <div className="text-xs font-medium opacity-80 uppercase tracking-widest">Cash Out</div>
                   <div>₦{(bet * currentMultiplier).toFixed(2)}</div>
                </button>
             ) : (
                <button 
                  onClick={startGame}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xl rounded-lg shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                >
                   BET
                </button>
             )}
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 p-4 md:p-10 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] relative">
           {/* Multiplier Header */}
           {gameState === 'playing' && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#232e38] px-6 py-2 rounded-full border border-emerald-500/30 text-emerald-400 font-black text-2xl shadow-xl z-10">
                 x{currentMultiplier.toFixed(2)}
              </div>
           )}

           <div className="grid grid-cols-5 gap-3 w-full max-w-[400px] aspect-square">
              {grid.map((val, idx) => (
                 <button
                    key={idx}
                    onClick={() => handleTileClick(idx)}
                    disabled={gameState !== 'playing' && !revealed[idx]}
                    className={`
                       relative rounded-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center
                       ${!revealed[idx] 
                          ? 'bg-[#2c3b4a] hover:bg-[#364859] shadow-[0_4px_0_0_#1a242d]' 
                          : val === 2 
                             ? 'bg-red-500/20 shadow-none' 
                             : 'bg-emerald-500/20 shadow-none'}
                    `}
                 >
                    <div className={`transition-all duration-300 ${revealed[idx] ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                       {val === 2 ? (
                          <Bomb size={32} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                       ) : (
                          <Gem size={32} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                       )}
                    </div>
                 </button>
              ))}
           </div>
           
           {gameState === 'cashed_out' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 animate-in fade-in zoom-in">
                 <div className="bg-[#232e38] p-8 rounded-2xl border border-emerald-500/50 text-center shadow-2xl">
                    <div className="text-emerald-500 font-black text-4xl mb-2">YOU WON!</div>
                    <div className="text-white font-mono text-2xl">₦{(bet * currentMultiplier).toFixed(2)}</div>
                    <div className="text-slate-400 text-sm mt-4 font-bold uppercase tracking-widest">Multiplier: {currentMultiplier.toFixed(2)}x</div>
                 </div>
              </div>
           )}
           
           {gameState === 'exploded' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 animate-in fade-in zoom-in">
                 <div className="bg-[#232e38] p-8 rounded-2xl border border-red-500/50 text-center shadow-2xl">
                    <Bomb size={48} className="text-red-500 mx-auto mb-4" />
                    <div className="text-white font-black text-3xl mb-1">BOOM!</div>
                    <div className="text-slate-400 text-sm uppercase tracking-widest">Round Over</div>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- 2. AVIATOR CLONE (Spribe Style) ---
const AviatorGame = ({ onClose, onWin }: { onClose: () => void, onWin: (amt: number) => void }) => {
  const [history, setHistory] = useState([1.2, 5.4, 1.1, 2.3, 15.0, 1.05]);
  const [multiplier, setMultiplier] = useState(1.0);
  const [state, setState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [bet, setBet] = useState(100);
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [myWin, setMyWin] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;
    let startTime: number;
    let crashPoint: number;

    const runGame = () => {
      setState('waiting');
      setMyWin(null);
      setMultiplier(1.0);
      
      // 3s Waiting period
      setTimeout(() => {
        setState('flying');
        startTime = Date.now();
        crashPoint = Math.random() < 0.3 ? 1.0 + Math.random() * 0.2 : 1.0 + Math.pow(Math.random() * 10, 2); // Bias towards low crashes but some huge ones
        
        const loop = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          const current = 1 + (Math.pow(elapsed, 2) * 0.1) + (elapsed * 0.1); // Exponential curve
          
          if (current >= crashPoint) {
             setMultiplier(crashPoint);
             setState('crashed');
             setHistory(prev => [crashPoint, ...prev].slice(0, 15));
          } else {
             setMultiplier(current);
             animId = requestAnimationFrame(loop);
          }
        };
        animId = requestAnimationFrame(loop);
      }, 3000);
    };

    runGame();
    return () => cancelAnimationFrame(animId);
  }, []); // Run once on mount, loop internally handled via state effects in real app (simplified here)

  const handleCashout = () => {
     if (state === 'flying' && !myWin) {
        const win = bet * multiplier;
        setMyWin(win);
        onWin(win);
     }
  };

  // Canvas Drawing for Curve (Simplified)
  useEffect(() => {
     const cvs = canvasRef.current;
     if (!cvs) return;
     const ctx = cvs.getContext('2d');
     if (!ctx) return;
     
     // Clear
     ctx.clearRect(0, 0, cvs.width, cvs.height);
     
     if (state === 'waiting') {
        ctx.fillStyle = "#ffffff";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("WAITING FOR NEXT ROUND", cvs.width / 2, cvs.height / 2);
        
        // Progress Bar
        ctx.fillStyle = "#ef4444";
        const time = (Date.now() % 3000) / 3000;
        ctx.fillRect(cvs.width/2 - 50, cvs.height/2 + 20, 100 * time, 4);
     } else {
        // Draw Curve
        ctx.beginPath();
        ctx.moveTo(0, cvs.height);
        // Simple quadratic curve for demo
        const x = Math.min(cvs.width, (multiplier - 1) * 50); 
        const y = cvs.height - Math.min(cvs.height, (multiplier - 1) * 30);
        ctx.quadraticCurveTo(x/2, cvs.height, x, y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ef4444"; // Red
        ctx.stroke();
        
        // Fill gradient
        const grad = ctx.createLinearGradient(0, 0, 0, cvs.height);
        grad.addColorStop(0, "rgba(239, 68, 68, 0.5)");
        grad.addColorStop(1, "rgba(239, 68, 68, 0)");
        ctx.lineTo(x, cvs.height);
        ctx.lineTo(0, cvs.height);
        ctx.fillStyle = grad;
        ctx.fill();
     }

  }, [multiplier, state]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0c0c] flex flex-col">
       {/* Top Bar (History) */}
       <div className="h-10 bg-[#151515] flex items-center px-4 gap-2 border-b border-[#2a2a2a] overflow-x-hidden">
          <History size={14} className="text-slate-500" />
          {history.map((h, i) => (
             <div key={i} className={`px-2 py-0.5 rounded text-xs font-bold ${h < 2.0 ? 'text-blue-400 bg-blue-900/20' : h < 10 ? 'text-purple-400 bg-purple-900/20' : 'text-pink-500 bg-pink-900/20'}`}>
                {h.toFixed(2)}x
             </div>
          ))}
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white"><X size={20}/></button>
       </div>

       {/* Game Stage */}
       <div className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <div className="z-10 text-center mb-10">
             {state === 'crashed' ? (
                <>
                   <div className="text-8xl font-black text-red-600 animate-pulse tracking-tighter">FLEW AWAY!</div>
                   <div className="text-red-600 font-mono text-xl mt-2">{multiplier.toFixed(2)}x</div>
                </>
             ) : (
                <div className="text-8xl font-black text-white tracking-tighter font-mono">{multiplier.toFixed(2)}x</div>
             )}
          </div>
          
          <canvas ref={canvasRef} width={800} height={400} className="absolute inset-0 w-full h-full" />
       </div>

       {/* Betting Controls (iLOT / Spribe Style) */}
       <div className="bg-[#151515] border-t border-[#2a2a2a] p-4 pb-8">
          <div className="max-w-2xl mx-auto flex gap-4">
             {/* Bet Panel */}
             <div className="flex-1 bg-[#202020] rounded-xl p-3 border border-[#333] flex items-center gap-4">
                <div className="flex flex-col gap-1 w-24">
                   <div className="flex items-center bg-black rounded px-2 py-1 border border-[#333]">
                      <span className="text-slate-500 text-xs mr-1">₦</span>
                      <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="w-full bg-transparent text-white font-bold text-sm outline-none" />
                   </div>
                   <div className="flex gap-1">
                      <button onClick={() => setBet(b => Math.max(10, b-10))} className="bg-[#333] text-white text-[10px] w-full rounded">-</button>
                      <button onClick={() => setBet(b => b+10)} className="bg-[#333] text-white text-[10px] w-full rounded">+</button>
                   </div>
                </div>
                
                <div className="flex-1">
                   {state === 'waiting' ? (
                      <button className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-white font-black text-xl shadow-[0_4px_0_0_#059669] active:shadow-none active:translate-y-1 transition-all">
                         BET
                      </button>
                   ) : state === 'flying' ? (
                      <button 
                         onClick={handleCashout}
                         disabled={!!myWin}
                         className={`w-full h-14 rounded-lg font-black text-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all flex flex-col items-center justify-center leading-none ${myWin ? 'bg-slate-700 text-slate-400' : 'bg-orange-500 hover:bg-orange-400 text-white shadow-[0_4px_0_0_#c2410c]'}`}
                      >
                         {myWin ? <span>WON ₦{myWin.toFixed(0)}</span> : (
                             <>
                                <span className="text-sm font-medium opacity-80">CASH OUT</span>
                                <span>₦{(bet * multiplier).toFixed(0)}</span>
                             </>
                         )}
                      </button>
                   ) : (
                      <button disabled className="w-full h-14 bg-red-900/50 rounded-lg text-red-500 font-bold border border-red-900 border-dashed">
                         WAIT
                      </button>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- MAIN CASINO COMPONENT ---
const CasinoGame: React.FC<{ onWin: (amt: number) => void }> = ({ onWin }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedGame, setSelectedGame] = useState<any>(null);

  const filteredGames = activeTab === 'All' ? GAMES : GAMES.filter(g => g.category === activeTab);

  const launchGame = (game: any) => {
     if (game.id === 'aviator') setSelectedGame('aviator');
     else if (game.category === 'Arcade' || game.id === 'mines') setSelectedGame('mines');
     else setSelectedGame('generic'); // Placeholder for slots
  };

  if (selectedGame === 'aviator') return <AviatorGame onClose={() => setSelectedGame(null)} onWin={onWin} />;
  if (selectedGame === 'mines') return <MinesGame onClose={() => setSelectedGame(null)} onWin={onWin} />;

  // --- STANDARD GRID VIEW ---
  return (
    <div className="bg-slate-100 dark:bg-black min-h-screen pb-24">
       
       {/* 1. Compact Header (Mobile First) */}
       <div className="bg-emerald-700 p-4 sticky top-0 z-30 shadow-md">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                   <Flame className="text-emerald-600" size={20} fill="currentColor" />
                </div>
                <h1 className="text-white font-black italic text-xl tracking-tighter">Vegas<span className="text-yellow-400">Club</span></h1>
             </div>
             <div className="bg-black/20 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Coins size={12} className="text-yellow-400" /> ₦2,450.00
             </div>
          </div>
          
          {/* Pills Navigation */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
             {CATEGORIES.map(cat => (
                <button
                   key={cat.id}
                   onClick={() => setActiveTab(cat.id)}
                   className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTab === cat.id ? 'bg-yellow-400 text-black shadow-lg' : 'bg-emerald-800 text-emerald-100'}`}
                >
                   {cat.label}
                </button>
             ))}
          </div>
       </div>

       {/* 2. Winners Ticker (Social Proof) */}
       <div className="bg-slate-900 overflow-hidden py-2 border-b border-slate-800">
          <div className="flex animate-[slideInRight_20s_linear_infinite] gap-8 w-max px-4">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                   <span className="text-emerald-400 font-bold">080***{Math.floor(Math.random()*99)}</span> 
                   won 
                   <span className="text-yellow-400 font-bold">₦{(Math.random()*50000).toFixed(0)}</span>
                   in Aviator
                </div>
             ))}
          </div>
       </div>

       {/* 3. Dense Game Grid (Data Saver Mode) */}
       <div className="p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {filteredGames.map(game => (
             <div 
               key={game.id}
               onClick={() => launchGame(game)}
               className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-200 dark:border-slate-800 group cursor-pointer relative"
             >
                {/* Image Area */}
                <div className="aspect-square relative overflow-hidden bg-slate-800">
                   <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                   
                   {/* CSS Generated "Logo" Overlay */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center z-10">
                      {/* Brand-Specific Styles */}
                      {game.id === 'aviator' && (
                         <div className="font-black italic text-white text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>
                            <span className="text-red-500">Avia</span>tor
                         </div>
                      )}
                      {game.id === 'mines' && (
                         <div className="font-black text-emerald-400 text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-widest border-2 border-emerald-400 px-1 rounded bg-black/40">
                            MINES
                         </div>
                      )}
                      {!['aviator', 'mines'].includes(game.id) && (
                         <div className="font-black text-white text-xs uppercase leading-tight drop-shadow-md">
                            {game.name}
                         </div>
                      )}
                   </div>

                   {game.hot && <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg z-20">HOT</div>}
                </div>

                {/* Footer Info */}
                <div className="p-2 bg-white dark:bg-[#151515]">
                   <div className="flex justify-between items-center">
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[70%]">{game.provider}</div>
                      <div className="text-[8px] text-emerald-600 dark:text-emerald-500 font-mono">{game.rtp}</div>
                   </div>
                </div>
             </div>
          ))}
       </div>

       {/* Generic Game Modal Placeholder */}
       {selectedGame === 'generic' && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6">
             <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 text-center max-w-sm w-full">
                <Settings2 size={48} className="text-slate-500 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Game Loading...</h3>
                <p className="text-slate-400 text-sm mb-6">Connecting to Provider API</p>
                <button onClick={() => setSelectedGame(null)} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold">Close</button>
             </div>
          </div>
       )}
    </div>
  );
};

export default CasinoGame;
