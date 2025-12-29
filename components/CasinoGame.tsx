
import React, { useState, useEffect, useRef } from 'react';
import { Play, Flame, Search, Zap, X, RotateCw, Trophy, History, ShieldCheck, Info, Bomb, Gem, Coins, ChevronRight, Volume2, Settings2, Sparkles, TrendingUp, Users, MessageSquare, Send, Crown, Ghost, Meh } from 'lucide-react';

// --- GAME ASSETS & CONFIGURATION ---
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

// --- SOCIAL PROOF DATA GENERATORS ---
const FAKE_USERS = ["CryptoKing", "LuckyLola", "WhaleWatcher", "ElonMusk_Fan", "Satoshi_Nakamoto", "BetGod99", "NoFear", "DiamondHands", "MoonBoy", "HODLer"];
const CHAT_COMMENTS = [
    { msg: "Aviator is flying today! ✈️", type: "hype" },
    { msg: "Anyone got a rain code?", type: "beggar" },
    { msg: "Just cashed 50x on Mines, LETS GOOO", type: "winner" },
    { msg: "This seed is dead, changing rooms.", type: "skeptic" },
    { msg: "Admin, when is the next bonus?", type: "question" },
    { msg: "Don't be greedy guys, cash at 2x.", type: "advice" },
    { msg: "Rigged! I lost 3 in a row.", type: "rager" },
    { msg: "Good luck everyone 🍀", type: "hype" }
];

interface LiveBet {
    id: string;
    game: string;
    user: string;
    bet: number;
    multiplier: number;
    payout: number;
    isHighRoller: boolean;
}

interface ChatMessage {
    id: string;
    user: string;
    avatar: string;
    message: string;
    level: number;
}

// --- ENGINE 1: MINES (iLOT/BC.Game Logic) ---
const MinesGame = ({ onClose, onWin }: { onClose: () => void, onWin: (amt: number) => void }) => {
  const [grid, setGrid] = useState<number[]>(Array(25).fill(0)); // 0: hidden, 1: gem, 2: bomb
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [mineCount, setMineCount] = useState(3);
  const [bet, setBet] = useState(100);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'cashed_out' | 'exploded'>('idle');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [nextMultiplier, setNextMultiplier] = useState(1.0);
  
  // Calculate probability based multipliers
  const calculateNextMultiplier = (currentRevealedCount: number) => {
     // Classic Mines Formula: 0.99 * (25 choose mines) / ((25-revealed) choose mines)
     // Simplified for demo stability:
     const totalTiles = 25;
     const remainingTiles = totalTiles - currentRevealedCount;
     const safeRemaining = remainingTiles - mineCount;
     
     if (safeRemaining <= 0) return 0;
     
     const probability = safeRemaining / remainingTiles;
     return 1 / probability; 
  };

  const startGame = () => {
    const newGrid = Array(25).fill(1); // Default to Gem
    let bombsPlaced = 0;
    while (bombsPlaced < mineCount) {
      const idx = Math.floor(Math.random() * 25);
      if (newGrid[idx] !== 2) {
        newGrid[idx] = 2; // Place Bomb
        bombsPlaced++;
      }
    }
    setGrid(newGrid);
    setRevealed(Array(25).fill(false));
    setGameState('playing');
    setCurrentMultiplier(1.0);
    
    // Calculate first potential jump
    const firstJump = calculateNextMultiplier(0);
    setNextMultiplier(1.0 * firstJump);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing' || revealed[index]) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (grid[index] === 2) {
      // BOMB!
      setGameState('exploded');
      // Reveal all bombs
      const finalRevealed = newRevealed.map((r, i) => grid[i] === 2 ? true : r);
      setRevealed(finalRevealed);
    } else {
      // GEM!
      const gemsFound = newRevealed.filter((r, i) => r && grid[i] === 1).length;
      const multIncrease = calculateNextMultiplier(gemsFound - 1); // previous state
      const newMult = currentMultiplier * multIncrease;
      
      setCurrentMultiplier(newMult);
      
      // Predict next
      const nextJump = calculateNextMultiplier(gemsFound);
      setNextMultiplier(newMult * nextJump);
    }
  };

  const cashOut = () => {
    if (gameState === 'playing') {
      const winAmount = bet * currentMultiplier;
      setGameState('cashed_out');
      onWin(winAmount);
      // Reveal full board
      setRevealed(Array(25).fill(true));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a2c38] flex items-center justify-center p-0 md:p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-5xl bg-[#0f1923] md:rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full md:h-[650px] border border-[#2a3a47]">
        
        {/* Sidebar Controls (Left) */}
        <div className="w-full md:w-80 bg-[#213743] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#2a3a47] shrink-0">
          <div>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2">
                   <div className="bg-emerald-500 p-1.5 rounded-lg"><Gem size={18} className="text-white" /></div>
                   <h2 className="text-xl font-black text-white italic tracking-wider">MINES</h2>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-[#2c4654] rounded-lg transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>

            <div className="space-y-6">
               <div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                     <span>Bet Amount</span>
                     <span>₦10.00 - ₦500,000</span>
                  </div>
                  <div className="flex items-center bg-[#0f1923] rounded border border-[#2f4553] focus-within:border-emerald-500 transition-colors px-3 py-3">
                     <Coins size={16} className="text-emerald-500 mr-2" />
                     <input 
                       type="number" 
                       value={bet} 
                       onChange={e => setBet(Number(e.target.value))}
                       disabled={gameState === 'playing'}
                       className="bg-transparent text-white font-bold w-full outline-none text-sm"
                     />
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                     {[100, 500, 1000, 5000].map(amt => (
                        <button key={amt} onClick={() => setBet(amt)} disabled={gameState === 'playing'} className="bg-[#2f4553] py-1.5 rounded text-[10px] text-white font-bold hover:bg-[#3d5564] transition-colors">{amt}</button>
                     ))}
                  </div>
               </div>

               <div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                     <span>Mines</span>
                     <span className="text-white">{mineCount}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                     {[1, 3, 5, 10, 24].map(cnt => (
                        <button 
                           key={cnt} 
                           onClick={() => setMineCount(cnt)}
                           disabled={gameState === 'playing'}
                           className={`py-2 rounded font-bold text-xs transition-all ${mineCount === cnt ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-[#2f4553] text-slate-400 hover:bg-[#3d5564]'}`}
                        >
                           {cnt}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          <div className="mt-6">
             <div className="text-center mb-4 text-xs text-slate-400 font-medium">
                {gameState === 'playing' ? (
                    <>Next Tile: <span className="text-emerald-400 font-bold">x{nextMultiplier.toFixed(2)}</span></>
                ) : (
                    "Press Bet to Start"
                )}
             </div>
             {gameState === 'playing' ? (
                <button 
                  onClick={cashOut}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-black text-xl rounded-lg shadow-[0_4px_0_0_#c2410c] active:translate-y-[2px] active:shadow-none transition-all"
                >
                   <div className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Cash Out</div>
                   <div className="flex items-center justify-center gap-2">
                      <span>₦{(bet * currentMultiplier).toFixed(2)}</span>
                   </div>
                </button>
             ) : (
                <button 
                  onClick={startGame}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xl rounded-lg shadow-[0_4px_0_0_#047857] active:translate-y-[2px] active:shadow-none transition-all"
                >
                   BET
                </button>
             )}
          </div>
        </div>

        {/* Game Grid (Right) */}
        <div className="flex-1 p-4 md:p-10 flex flex-col items-center justify-center bg-[#0f1923] relative overflow-hidden">
           {/* Background Decorations */}
           <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
           
           {/* Multiplier Header */}
           {gameState === 'playing' && (
              <div className="absolute top-6 flex flex-col items-center animate-in fade-in slide-in-from-top-4">
                 <div className="bg-[#213743] px-8 py-3 rounded-full border border-emerald-500/30 text-emerald-400 font-black text-3xl shadow-2xl z-10 flex items-center gap-2">
                    <TrendingUp size={24} />
                    x{currentMultiplier.toFixed(2)}
                 </div>
                 <div className="text-slate-500 text-[10px] uppercase font-bold mt-2 tracking-widest">Current Multiplier</div>
              </div>
           )}

           <div className="grid grid-cols-5 gap-3 w-full max-w-[450px] aspect-square relative z-10">
              {grid.map((val, idx) => (
                 <button
                    key={idx}
                    onClick={() => handleTileClick(idx)}
                    disabled={gameState !== 'playing' && !revealed[idx]}
                    className={`
                       relative rounded-lg transition-all duration-200 transform
                       ${!revealed[idx] 
                          ? `bg-[#2f4553] hover:bg-[#3d5564] shadow-[0_4px_0_0_#1a2c38] ${gameState === 'playing' ? 'active:translate-y-[4px] active:shadow-none cursor-pointer' : 'cursor-default'}` 
                          : val === 2 
                             ? 'bg-[#0f1923] border-2 border-red-500/50 shadow-none' 
                             : 'bg-[#0f1923] border-2 border-emerald-500/50 shadow-none'}
                    `}
                 >
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${revealed[idx] ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                       {val === 2 ? (
                          <Bomb size={32} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse" />
                       ) : (
                          <Gem size={32} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-[spin_0.5s_ease-out]" />
                       )}
                    </div>
                 </button>
              ))}
           </div>
           
           {/* End Game Modals */}
           {gameState === 'cashed_out' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 animate-in fade-in zoom-in duration-300">
                 <div className="bg-[#213743] p-8 rounded-2xl border border-emerald-500/50 text-center shadow-2xl max-w-sm w-full mx-4">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy size={40} className="text-emerald-400" />
                    </div>
                    <div className="text-emerald-500 font-black text-4xl mb-2">YOU WON!</div>
                    <div className="text-white font-mono text-3xl font-bold mb-4">₦{(bet * currentMultiplier).toFixed(2)}</div>
                    <div className="bg-[#0f1923] p-3 rounded-lg text-slate-400 text-sm font-bold uppercase tracking-widest border border-[#2f4553]">
                        Multiplier: <span className="text-white">{currentMultiplier.toFixed(2)}x</span>
                    </div>
                 </div>
              </div>
           )}
           
           {gameState === 'exploded' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 animate-in fade-in zoom-in duration-300">
                 <div className="bg-[#213743] p-8 rounded-2xl border border-red-500/50 text-center shadow-2xl max-w-sm w-full mx-4">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Bomb size={40} className="text-red-500" />
                    </div>
                    <div className="text-white font-black text-3xl mb-2">BOOM!</div>
                    <p className="text-slate-400 text-sm mb-6">You hit a mine. Better luck next time!</p>
                    <button onClick={() => setGameState('idle')} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors">
                        Try Again
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- ENGINE 2: AVIATOR (SportyBet/Spribe Clone) ---
const AviatorGame = ({ onClose, onWin }: { onClose: () => void, onWin: (amt: number) => void }) => {
  const [history, setHistory] = useState([1.2, 5.4, 1.1, 2.3, 15.0, 1.05, 2.45, 8.90, 1.00, 1.45]);
  const [multiplier, setMultiplier] = useState(1.0);
  const [state, setState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [bet, setBet] = useState(100);
  const [myWin, setMyWin] = useState<number | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const animationRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game Loop
  useEffect(() => {
    let startTime: number;
    let crashPoint: number;
    
    const runGame = () => {
      // 1. Waiting Phase
      setState('waiting');
      setMyWin(null);
      setMultiplier(1.0);
      setLoadingProgress(0);

      const waitInterval = setInterval(() => {
          setLoadingProgress(prev => Math.min(prev + 2, 100));
      }, 50);

      // 2. Start Flight
      setTimeout(() => {
        clearInterval(waitInterval);
        setLoadingProgress(100);
        setState('flying');
        
        startTime = Date.now();
        // Weighted RNG for Crash Point (Spribe Logic approximation)
        // 1% chance of instant crash (1.00x)
        // 49% chance of < 2.00x
        const r = Math.random();
        if (r < 0.01) crashPoint = 1.00;
        else if (r < 0.5) crashPoint = 1.00 + (Math.random());
        else if (r < 0.9) crashPoint = 2.00 + (Math.random() * 5); // 2x - 7x
        else crashPoint = 7.00 + (Math.random() * 50); // Moon shot

        const loop = () => {
          const now = Date.now();
          const elapsedSeconds = (now - startTime) / 1000;
          
          // Exponential Growth Function
          // M(t) = 1 + 0.06 * t + 0.04 * t^2 (Approximation)
          const current = 1 + (0.06 * elapsedSeconds) + (0.04 * Math.pow(elapsedSeconds, 2));

          if (current >= crashPoint) {
             setMultiplier(crashPoint);
             setState('crashed');
             setHistory(prev => [crashPoint, ...prev].slice(0, 20)); // Keep last 20
             cancelAnimationFrame(animationRef.current!);
             
             // Auto restart after 3s
             setTimeout(runGame, 3000);
          } else {
             setMultiplier(current);
             animationRef.current = requestAnimationFrame(loop);
          }
        };
        animationRef.current = requestAnimationFrame(loop);
      }, 4000); // 4s waiting time
    };

    runGame();
    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleCashout = () => {
     if (state === 'flying' && !myWin) {
        const win = bet * multiplier;
        setMyWin(win);
        onWin(win);
     }
  };

  // Canvas Renderer for the Curve
  useEffect(() => {
     const cvs = canvasRef.current;
     if (!cvs) return;
     const ctx = cvs.getContext('2d');
     if (!ctx) return;
     
     // Resize canvas to match display
     const rect = cvs.getBoundingClientRect();
     cvs.width = rect.width;
     cvs.height = rect.height;

     // Clear
     ctx.clearRect(0, 0, cvs.width, cvs.height);
     
     if (state === 'waiting') {
        // Draw Loader Bar
        const barWidth = 200;
        const barHeight = 6;
        const x = (cvs.width - barWidth) / 2;
        const y = cvs.height / 2 + 40;
        
        ctx.fillStyle = "#333";
        ctx.fillRect(x, y, barWidth, barHeight);
        
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(x, y, barWidth * (loadingProgress / 100), barHeight);
        
        ctx.fillStyle = "#fff";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("WAITING FOR ROUND", cvs.width / 2, cvs.height / 2);
        
     } else {
        // Draw Plane Curve
        ctx.beginPath();
        const startX = 0;
        const startY = cvs.height;
        
        // Dynamic scaling based on multiplier
        // As multiplier grows, the curve flattens visually to keep the plane on screen
        const scaleX = cvs.width / (Math.max(5, multiplier * 2)); 
        const scaleY = cvs.height / (Math.max(2, multiplier));

        const endX = Math.min(cvs.width - 50, (multiplier - 1) * 100); 
        const endY = cvs.height - Math.min(cvs.height - 50, (multiplier - 1) * 50);
        
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#ef4444"; // Red line
        
        // Draw Bezier from bottom left
        ctx.moveTo(0, cvs.height);
        ctx.quadraticCurveTo(endX / 2, cvs.height, endX, endY);
        ctx.stroke();

        // Fill under area
        ctx.lineTo(endX, cvs.height);
        ctx.lineTo(0, cvs.height);
        const grad = ctx.createLinearGradient(0, 0, 0, cvs.height);
        grad.addColorStop(0, "rgba(239, 68, 68, 0.4)");
        grad.addColorStop(1, "rgba(239, 68, 68, 0)");
        ctx.fillStyle = grad;
        ctx.fill();
        
        // Draw Plane Icon (Simulated with shapes)
        if (state === 'flying') {
           ctx.save();
           ctx.translate(endX, endY);
           ctx.rotate(-0.2); // Tilt up
           // Plane Body
           ctx.fillStyle = "#ef4444";
           ctx.beginPath();
           ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
           ctx.fill();
           ctx.restore();
        }
     }
  }, [multiplier, state, loadingProgress]);

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col font-sans">
       {/* 1. TOP HISTORY BAR (Spribe Style) */}
       <div className="h-12 bg-[#1a1a1a] flex items-center justify-between px-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-wider">
             <div className="flex items-center gap-1"><History size={14} /> Round History</div>
             <div className="flex gap-1.5">
                {history.map((h, i) => (
                   <div key={i} className={`px-2.5 py-1 rounded-full text-[10px] font-black min-w-[3rem] text-center ${h < 2.0 ? 'text-blue-400 bg-[#1e2836]' : h < 10 ? 'text-purple-400 bg-[#2d2036]' : 'text-[#c00067] bg-[#361e2b]'}`}>
                      {h.toFixed(2)}x
                   </div>
                ))}
             </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
       </div>

       {/* 2. MAIN STAGE */}
       <div className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden">
          {/* Grid Lines */}
          <div className="absolute inset-0 opacity-20" style={{ 
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
             backgroundSize: '100px 100px' 
          }}></div>
          
          {/* Central Multiplier */}
          <div className="z-10 text-center absolute top-1/4">
             {state === 'crashed' ? (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                   <div className="text-8xl font-black text-[#ef4444] tracking-tighter drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] uppercase italic">FLEW AWAY</div>
                   <div className="text-[#ef4444] font-mono text-3xl mt-2 font-bold">{multiplier.toFixed(2)}x</div>
                </div>
             ) : state !== 'waiting' && (
                <div className="text-9xl font-black text-white tracking-tighter font-mono drop-shadow-2xl">{multiplier.toFixed(2)}x</div>
             )}
          </div>
          
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
       </div>

       {/* 3. BETTING CONTROL PANEL (iLOT/Sporty Style) */}
       <div className="bg-[#1a1a1a] border-t border-[#2a2a2a] p-4 pb-8">
          <div className="max-w-xl mx-auto">
             <div className="bg-[#242424] rounded-[20px] p-2 border border-[#333] flex gap-2">
                
                {/* Bet Input */}
                <div className="flex-1 bg-[#151515] rounded-xl border border-[#333] p-3 flex flex-col justify-center">
                   <label className="text-[10px] text-slate-500 font-bold uppercase mb-1">Bet Amount</label>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setBet(Math.max(10, bet-10))} className="w-8 h-8 rounded-lg bg-[#333] text-white hover:bg-[#444]">-</button>
                      <input 
                        type="number" 
                        value={bet} 
                        onChange={e => setBet(Number(e.target.value))} 
                        className="w-full bg-transparent text-white font-bold text-center text-lg outline-none" 
                      />
                      <button onClick={() => setBet(bet+10)} className="w-8 h-8 rounded-lg bg-[#333] text-white hover:bg-[#444]">+</button>
                   </div>
                   <div className="flex gap-1 mt-2">
                      {[100, 200, 500, 1000].map(amt => (
                         <button key={amt} onClick={() => setBet(amt)} className="flex-1 bg-[#2a2a2a] text-[9px] text-slate-400 py-1 rounded hover:text-white transition-colors">{amt}</button>
                      ))}
                   </div>
                </div>

                {/* Big Button */}
                <div className="w-48">
                   {state === 'waiting' ? (
                      <button className="w-full h-full bg-[#28a909] hover:bg-[#2dc00a] rounded-xl text-white flex flex-col items-center justify-center shadow-[0_4px_0_0_#1a7a00] active:translate-y-[2px] active:shadow-none transition-all group">
                         <span className="text-2xl font-black uppercase tracking-wider italic">BET</span>
                         <span className="text-xs font-medium opacity-80 group-hover:opacity-100">Next Round</span>
                      </button>
                   ) : state === 'flying' ? (
                      <button 
                         onClick={handleCashout}
                         disabled={!!myWin}
                         className={`w-full h-full rounded-xl flex flex-col items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-none transition-all border-2 border-transparent ${myWin ? 'bg-[#2a2a2a] text-slate-500 cursor-not-allowed' : 'bg-[#d07000] hover:bg-[#e67c00] text-white shadow-[0_4px_0_0_#9c5400] border-orange-400/20'}`}
                      >
                         {myWin ? (
                            <>
                               <span className="text-sm font-bold uppercase">CASHED OUT</span>
                               <span className="text-xl font-black text-emerald-500">₦{myWin.toFixed(0)}</span>
                            </>
                         ) : (
                             <>
                                <span className="text-xs font-bold uppercase opacity-90">CASH OUT</span>
                                <span className="text-3xl font-black tracking-tighter">₦{(bet * multiplier).toFixed(0)}</span>
                             </>
                         )}
                      </button>
                   ) : (
                      <button disabled className="w-full h-full bg-[#2a2a2a] rounded-xl text-slate-500 flex flex-col items-center justify-center border border-[#333]">
                         <span className="text-xl font-black uppercase tracking-wider italic opacity-50">WAIT</span>
                      </button>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- COMPONENT: LIVE CHAT SIMULATOR ---
const CommunityChat = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', user: 'Admin_Bot', avatar: '🤖', message: 'Welcome to VegasClub Global Chat!', level: 99 },
    ]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const randomUser = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
            const randomComment = CHAT_COMMENTS[Math.floor(Math.random() * CHAT_COMMENTS.length)];
            const newMsg: ChatMessage = {
                id: Date.now().toString(),
                user: randomUser,
                avatar: ['🐶','🐱','🦁','🐯','🐸','🐵'][Math.floor(Math.random()*6)],
                message: randomComment.msg,
                level: Math.floor(Math.random() * 50) + 1
            };
            setMessages(prev => [...prev.slice(-15), newMsg]);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const handleSend = () => {
        if (!inputValue) return;
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            user: 'You',
            avatar: '👤',
            message: inputValue,
            level: 5
        }]);
        setInputValue('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#1a2c38] border-l border-[#2f4553] shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-[#2f4553] flex justify-between items-center bg-[#213743]">
                <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-emerald-500" />
                    <span className="font-black text-white text-sm">Global Chat</span>
                    <span className="bg-emerald-500/20 text-emerald-500 text-[10px] px-1.5 rounded font-bold">1,402 Online</span>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0f1923]">
                {messages.map(msg => (
                    <div key={msg.id} className="flex gap-2 items-start text-sm group">
                        <div className="w-6 h-6 rounded bg-[#2f4553] flex items-center justify-center shrink-0 text-xs shadow border border-[#213743]">
                            {msg.avatar}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold text-xs ${msg.user === 'You' ? 'text-emerald-400' : 'text-slate-300'}`}>{msg.user}</span>
                                {msg.level > 40 && <Crown size={10} className="text-yellow-500" />}
                                <span className="text-[9px] text-slate-600 bg-[#1a2c38] px-1 rounded">Lvl {msg.level}</span>
                            </div>
                            <div className="text-slate-400 break-words leading-tight mt-0.5">{msg.message}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 bg-[#213743] border-t border-[#2f4553]">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-[#0f1923] text-white text-xs rounded-lg px-3 py-2 border border-[#2f4553] focus:border-emerald-500 outline-none"
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} className="bg-emerald-500 p-2 rounded-lg text-white hover:bg-emerald-400">
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: LIVE WINS FEED ---
const LiveFeed = () => {
    const [bets, setBets] = useState<LiveBet[]>([]);
    const [activeTab, setActiveTab] = useState<'All' | 'High'>('All');

    useEffect(() => {
        const interval = setInterval(() => {
            const game = GAMES[Math.floor(Math.random() * GAMES.length)];
            const user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
            const betAmt = Math.floor(Math.random() * 5000) + 100;
            const mult = (Math.random() * 10 + 1).toFixed(2);
            const payout = betAmt * Number(mult);
            
            // Mask user for privacy simulation
            const maskedUser = user.slice(0, 3) + "***" + user.slice(-1);

            const newBet: LiveBet = {
                id: Date.now().toString(),
                game: game.name,
                user: maskedUser,
                bet: betAmt,
                multiplier: Number(mult),
                payout: payout,
                isHighRoller: payout > 20000
            };

            setBets(prev => [newBet, ...prev].slice(0, 10)); // Keep last 10
        }, 1200);

        return () => clearInterval(interval);
    }, []);

    const displayBets = activeTab === 'High' ? bets.filter(b => b.isHighRoller) : bets;

    return (
        <div className="mt-8 bg-[#1a2c38] rounded-xl overflow-hidden border border-[#2f4553]">
            <div className="flex border-b border-[#2f4553]">
                <button 
                    onClick={() => setActiveTab('All')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest ${activeTab === 'All' ? 'bg-[#213743] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    All Bets
                </button>
                <button 
                    onClick={() => setActiveTab('High')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest ${activeTab === 'High' ? 'bg-[#213743] text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    High Rollers
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="text-slate-500 border-b border-[#2f4553]">
                            <th className="p-3 font-medium">Game</th>
                            <th className="p-3 font-medium">User</th>
                            <th className="p-3 font-medium hidden sm:table-cell">Bet Amount</th>
                            <th className="p-3 font-medium">Multiplier</th>
                            <th className="p-3 font-medium text-right">Payout</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayBets.map((bet) => (
                            <tr key={bet.id} className="animate-in slide-in-from-top-2 duration-300 border-b border-[#2f4553] last:border-0 hover:bg-[#213743] transition-colors">
                                <td className="p-3 font-bold text-white flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    {bet.game}
                                </td>
                                <td className="p-3 text-slate-300">{bet.user}</td>
                                <td className="p-3 text-slate-300 hidden sm:table-cell">₦{bet.bet.toLocaleString()}</td>
                                <td className={`p-3 font-bold ${bet.multiplier > 5 ? 'text-yellow-500' : 'text-slate-400'}`}>
                                    {bet.multiplier.toFixed(2)}x
                                </td>
                                <td className={`p-3 font-bold text-right ${bet.payout > 10000 ? 'text-emerald-400' : 'text-white'}`}>
                                    {bet.payout > 10000 && <Sparkles size={12} className="inline mr-1" />}
                                    ₦{bet.payout.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {displayBets.length === 0 && activeTab === 'High' && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                        <Ghost size={24} className="mx-auto mb-2 opacity-20" />
                        Waiting for big wins...
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN LOBBY COMPONENT ---
const CasinoGame: React.FC<{ onWin: (amt: number) => void }> = ({ onWin }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);

  const filteredGames = activeTab === 'All' ? GAMES : GAMES.filter(g => g.category === activeTab);

  const launchGame = (game: any) => {
     if (game.id === 'aviator') setSelectedGame('aviator');
     else if (game.category === 'Arcade' || game.id === 'mines') setSelectedGame('mines');
     else setSelectedGame('generic'); 
  };

  if (selectedGame === 'aviator') return <AviatorGame onClose={() => setSelectedGame(null)} onWin={onWin} />;
  if (selectedGame === 'mines') return <MinesGame onClose={() => setSelectedGame(null)} onWin={onWin} />;

  // --- LOBBY VIEW ---
  return (
    <div className="bg-slate-100 dark:bg-black min-h-screen pb-24 font-sans relative">
       
       <CommunityChat isOpen={showChat} onClose={() => setShowChat(false)} />

       {/* Floating Chat Button */}
       {!showChat && (
           <button 
                onClick={() => setShowChat(true)}
                className="fixed bottom-24 right-4 z-30 bg-[#1a2c38] text-white p-3 rounded-full shadow-xl border border-emerald-500/30 hover:scale-110 transition-transform flex items-center gap-2 group"
            >
                <div className="relative">
                    <MessageSquare size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1a2c38] animate-pulse"></span>
                </div>
                <span className="hidden group-hover:block text-xs font-bold pr-1">Global Chat</span>
            </button>
       )}

       {/* 1. Header & Balance */}
       <div className="bg-[#1a2c38] p-4 sticky top-0 z-30 shadow-md">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                   <Flame className="text-white" size={20} fill="currentColor" />
                </div>
                <div>
                   <h1 className="text-white font-black italic text-lg tracking-tighter leading-none">VEGAS<span className="text-emerald-400">CLUB</span></h1>
                   <p className="text-[10px] text-slate-400 font-medium">Licensed & Secure</p>
                </div>
             </div>
             <div className="bg-black/40 border border-white/5 px-4 py-1.5 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-400 font-bold text-xs">Online: 14,203</span>
             </div>
          </div>
          
          {/* Pills Navigation */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
             {CATEGORIES.map(cat => (
                <button
                   key={cat.id}
                   onClick={() => setActiveTab(cat.id)}
                   className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all border ${activeTab === cat.id ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-[#243542] text-slate-400 border-transparent hover:text-white'}`}
                >
                   {cat.label}
                </button>
             ))}
          </div>
       </div>

       {/* 2. Winners Ticker */}
       <div className="bg-[#132029] overflow-hidden py-2 border-b border-[#243542]">
          <div className="flex animate-[slideInRight_20s_linear_infinite] gap-12 w-max px-4">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-400">
                   <Trophy size={12} className="text-yellow-500" />
                   <span className="text-white font-bold">{FAKE_USERS[i]}***</span> 
                   won 
                   <span className="text-emerald-400 font-bold">₦{(Math.random()*50000).toFixed(0)}</span>
                   in Mines
                </div>
             ))}
          </div>
       </div>

       {/* 3. Dense Grid */}
       <div className="p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {filteredGames.map(game => (
             <div 
               key={game.id}
               onClick={() => launchGame(game)}
               className="bg-white dark:bg-[#1e2833] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-200 dark:border-[#2f3e4e] group cursor-pointer relative"
             >
                {/* Image Area with Logo Overlays */}
                <div className="aspect-square relative overflow-hidden bg-slate-800">
                   <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                   
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center z-10">
                      {game.id === 'aviator' && (
                         <div className="bg-black/60 backdrop-blur-sm rounded-xl px-2 py-1 border border-red-500/30">
                            <div className="font-black italic text-white text-lg tracking-tighter leading-none" style={{ fontFamily: 'Arial, sans-serif' }}>
                               <span className="text-[#ef4444]">Avia</span>tor
                            </div>
                         </div>
                      )}
                      
                      {game.id === 'mines' && (
                         <div className="bg-[#0f1923]/80 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-emerald-500/50 shadow-lg">
                            <div className="font-black text-emerald-400 text-sm tracking-[0.2em] border-2 border-emerald-500 px-1 rounded bg-[#0f1923]">
                               MINES
                            </div>
                         </div>
                      )}

                      {!['aviator', 'mines'].includes(game.id) && (
                         <div className="bg-black/60 backdrop-blur-md rounded-lg px-2 py-1">
                            <div className="font-black text-white text-[10px] uppercase leading-tight drop-shadow-md">
                               {game.name}
                            </div>
                         </div>
                      )}
                   </div>
                </div>

                <div className="p-2 bg-white dark:bg-[#182029]">
                   <div className="flex justify-between items-center">
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[70%]">{game.provider}</div>
                      <div className="text-[8px] text-emerald-600 dark:text-emerald-500 font-mono bg-emerald-100 dark:bg-emerald-900/30 px-1 rounded">{game.rtp}</div>
                   </div>
                </div>
             </div>
          ))}
       </div>

       {/* 4. LIVE FEED SECTION (Social Proof) */}
       <div className="px-3 mt-4">
           <div className="flex items-center gap-2 mb-2 px-1">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <h3 className="text-white font-bold text-sm uppercase tracking-wider">Live Wins</h3>
           </div>
           <LiveFeed />
       </div>

       {/* Generic Loading Modal */}
       {selectedGame === 'generic' && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6">
             <div className="bg-[#1a2c38] p-8 rounded-2xl border border-[#2f4553] text-center max-w-sm w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                
                <Settings2 size={48} className="text-slate-500 mx-auto mb-4 animate-spin-slow" />
                <h3 className="text-white font-bold text-lg mb-2">Connecting to Provider</h3>
                <p className="text-slate-400 text-sm mb-6">Secure handshake in progress...</p>
                <button onClick={() => setSelectedGame(null)} className="w-full bg-[#2f4553] text-white py-3 rounded-xl font-bold hover:bg-[#3d5564] transition-colors">Return to Lobby</button>
             </div>
          </div>
       )}
    </div>
  );
};

export default CasinoGame;
