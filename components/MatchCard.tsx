
import React, { useState, useEffect, memo } from 'react';
import { Match, Odd, BetSelection, StatItem } from '../types';
import { PlayCircle, Clock, BrainCircuit, Loader2, Trophy, Zap, BarChart3, ChevronDown, ChevronUp, Tv, Maximize2, Volume2, VolumeX, Pause, Play, X, TrendingUp, Settings, Signal, Sparkles } from 'lucide-react';
import { getMatchPrediction } from '../services/geminiService';
import { Typewriter } from './UiEffects';

interface OddButtonProps {
  odd: Odd;
  match: Match;
  isSelected: boolean;
  onClick: (selection: BetSelection) => void;
}

const OddButton: React.FC<OddButtonProps> = ({ odd, match, isSelected, onClick }) => {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (odd.prevValue) {
      if (odd.value > odd.prevValue) {
        setDirection('up');
      } else if (odd.value < odd.prevValue) {
        setDirection('down');
      }
      const timer = setTimeout(() => setDirection(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [odd.value, odd.prevValue]);

  return (
    <button
      onClick={() => onClick({
        matchId: match.id,
        selectionId: odd.id,
        matchTitle: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        selectionLabel: odd.label === '1' ? match.homeTeam.name : odd.label === '2' ? match.awayTeam.name : odd.label,
        oddValue: odd.value,
        marketType: odd.marketType
      })}
      className={`
        relative flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-all duration-300 font-medium text-sm overflow-hidden group/odd border
        ${isSelected 
          ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-400' 
          : odd.isBoosted
            ? 'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-slate-900 text-amber-900 dark:text-amber-100 border-amber-500/30 hover:border-amber-400/50'
            : 'bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'}
      `}
    >
      {/* Update Indicator Background */}
      {direction === 'up' && <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none"></div>}
      {direction === 'down' && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>}

      {/* Boost Badge/Icon */}
      {odd.isBoosted && !isSelected && (
        <div className="absolute top-1.5 right-1.5">
           <Zap size={10} className="text-amber-500 fill-amber-500 animate-pulse" />
        </div>
      )}

      <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 z-10 ${isSelected ? 'text-emerald-100' : odd.isBoosted ? 'text-amber-600 dark:text-amber-200/70' : 'text-slate-500'}`}>
        {odd.label === '1' ? 'HOME' : odd.label === '2' ? 'AWAY' : odd.label === 'X' ? 'DRAW' : odd.label}
      </span>
      
      <div className="flex items-center gap-1.5 z-10">
        {/* Original Value Strikethrough for Boosts */}
        {odd.isBoosted && odd.originalValue && (
            <span className={`text-[10px] line-through decoration-1 opacity-60 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                {odd.originalValue.toFixed(2)}
            </span>
        )}

        <span className={`text-lg font-black tracking-tight transition-colors duration-300 ${
          isSelected ? 'text-white' : 
          odd.isBoosted ? 'text-amber-600 dark:text-amber-400' :
          direction === 'up' ? 'text-emerald-500 dark:text-emerald-400' : 
          direction === 'down' ? 'text-red-500 dark:text-red-400' : 
          'text-slate-900 dark:text-white'
        }`}>
          {odd.value.toFixed(2)}
        </span>
        
        {/* Direction arrows */}
        {!odd.isBoosted && direction === 'up' && <TrendingUp size={12} className="text-emerald-500 dark:text-emerald-400" />}
        {!odd.isBoosted && direction === 'down' && <TrendingUp size={12} className="text-red-500 dark:text-red-400 rotate-180" />}
      </div>
    </button>
  );
};

interface MatchCardProps {
  match: Match;
  onOddClick: (selection: BetSelection) => void;
  selectedOdds: string[];
}

const MatchCard: React.FC<MatchCardProps> = memo(({ match, onOddClick, selectedOdds }) => {
  const [isOpen, setIsOpen] = useState(false); // Default: Odds Hidden
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showStream, setShowStream] = useState(false);
  
  // Stream Quality State
  const [quality, setQuality] = useState<'Auto' | '1080p' | '720p' | '360p'>('Auto');
  const [isBuffering, setIsBuffering] = useState(false);
  
  // Determine if any odd in this match is selected, if so, keep card open
  const hasSelection = match.odds.main.some(o => selectedOdds.includes(o.id)) || 
                       match.odds.secondary.some(o => selectedOdds.includes(o.id));
  
  useEffect(() => {
    if (hasSelection) setIsOpen(true);
  }, [hasSelection]);

  const handleAiClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aiTip) {
      setAiTip(null); // Toggle off
      return;
    }
    setAiLoading(true);
    // Simulate thinking delay for effect + API call
    const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
    const tipPromise = getMatchPrediction(match);
    
    const [_, tip] = await Promise.all([minDelay, tipPromise]);
    
    setAiTip(tip);
    setAiLoading(false);
  };
  
  const handleQualityChange = (newQuality: typeof quality) => {
    if (newQuality === quality) return;
    setIsBuffering(true);
    setQuality(newQuality);
    
    // Simulate stream switch buffering
    setTimeout(() => {
        setIsBuffering(false);
    }, 1500);
  };

  const getStatusText = () => {
    if (!match.isLive) return match.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (match.sport === 'Soccer') return `${match.minute}'`;
    if (match.sport === 'Basketball') return `${match.period} ${match.minute}'`;
    return 'LIVE';
  };

  // Helper to construct URL safely
  const getStreamUrl = (url: string) => {
     // If it's a YouTube Embed, we want to ensure we append params correctly
     const separator = url.includes('?') ? '&' : '?';
     return `${url}${separator}quality=${quality}`; 
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl mb-4 border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-none overflow-hidden transition-all duration-300 hover:border-emerald-500/20">
      
      {/* --- Main Card Content (Always Visible) --- */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 cursor-pointer relative"
      >
        {/* Live Indicator / Time */}
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center gap-2">
              {match.isLive ? (
                 <span className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-sm animate-pulse">
                    LIVE
                 </span>
              ) : (
                 <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                    {match.startTime.toLocaleDateString([], {weekday: 'short'})}
                 </span>
              )}
              <span className={`text-xs font-bold ${match.isLive ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                 {getStatusText()}
              </span>
              <span className="text-slate-400 dark:text-slate-600 text-[10px]">•</span>
              <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
                 {match.league}
              </span>
           </div>

           <div className="flex items-center gap-2">
              {match.hasStream && (
                 <Tv size={14} className="text-slate-400 dark:text-slate-600" />
              )}
              
              {/* --- ENHANCED GEMINI BUTTON --- */}
              <button 
                 onClick={handleAiClick}
                 className={`
                    relative flex items-center justify-center w-8 h-8 rounded-full transition-all border
                    ${aiTip 
                        ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                        : aiLoading
                            ? 'bg-slate-900 border-purple-500/50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-purple-500/50 hover:text-purple-500 dark:hover:text-purple-400'}
                 `}
              >
                 {aiLoading ? (
                    <div className="flex items-center justify-center gap-[2px]">
                        <span className="w-1 h-3 bg-purple-500 rounded-full animate-music"></span>
                        <span className="w-1 h-2 bg-purple-500 rounded-full animate-music delay-75"></span>
                        <span className="w-1 h-3 bg-purple-500 rounded-full animate-music delay-150"></span>
                    </div>
                 ) : (
                    <div className={!aiTip ? "animate-pulse opacity-75" : ""}>
                       <BrainCircuit size={16} />
                    </div>
                 )}
              </button>
           </div>
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-between">
           {/* Home Team */}
           <div className="flex items-center gap-3 flex-1">
              <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 p-1 object-contain border border-slate-100 dark:border-slate-700" />
              <div>
                 <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{match.homeTeam.name}</h3>
                 {!match.isLive && <p className="text-[10px] text-slate-500 font-medium">Home</p>}
              </div>
           </div>

           {/* Score / VS */}
           <div className="px-4 flex flex-col items-center">
              {match.isLive && match.scores ? (
                 <div className="bg-slate-100 dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 min-w-[60px] text-center">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                       {match.scores.home}-{match.scores.away}
                    </span>
                 </div>
              ) : (
                 <span className="text-slate-400 dark:text-slate-600 font-black text-xs bg-slate-100 dark:bg-slate-800/50 w-8 h-8 rounded-full flex items-center justify-center">VS</span>
              )}
           </div>

           {/* Away Team */}
           <div className="flex items-center gap-3 flex-1 justify-end text-right">
              <div>
                 <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{match.awayTeam.name}</h3>
                 {!match.isLive && <p className="text-[10px] text-slate-500 font-medium">Away</p>}
              </div>
              <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 p-1 object-contain border border-slate-100 dark:border-slate-700" />
           </div>
        </div>

        {/* AI Insight Dropdown */}
        {aiTip && (
           <div className="mt-4 bg-slate-50 dark:bg-gradient-to-r dark:from-purple-950/20 dark:to-slate-900/50 border border-purple-500/30 p-4 rounded-xl text-sm text-purple-900 dark:text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.05)] animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <div className="flex gap-3">
                 <div className="bg-purple-500/20 p-1.5 rounded-lg h-fit">
                    <Sparkles className="text-purple-400" size={16} />
                 </div>
                 <div className="text-xs leading-relaxed font-medium">
                    <Typewriter text={aiTip} />
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* --- Action Bar (Toggle) --- */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-5 py-2 flex items-center justify-center gap-2 cursor-pointer transition-colors border-t border-slate-100 dark:border-white/5
          ${isOpen ? 'bg-slate-50 dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50'}
        `}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400">
           {isOpen ? 'Hide Markets' : 'View Odds & Markets'}
        </span>
        {isOpen ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
      </div>

      {/* --- Expanded Content (Odds & Stats) --- */}
      {isOpen && (
        <div className="p-4 bg-slate-50 dark:bg-black/20 animate-in slide-in-from-top-2 duration-300">
           
           {/* Market Tabs (Visual Only for demo) */}
           <div className="flex gap-4 mb-4 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200 dark:border-white/5">
              <button className="text-emerald-600 dark:text-emerald-400 font-bold text-xs pb-2 border-b-2 border-emerald-500">Main</button>
              <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-xs pb-2">Goals</button>
              <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-xs pb-2">Halves</button>
              <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-xs pb-2">Specials</button>
           </div>

           {/* Odds Grid - Main Market */}
           <div className="grid grid-cols-3 gap-3 mb-3">
              {match.odds.main.map(odd => (
                 <OddButton 
                    key={odd.id} 
                    odd={odd} 
                    match={match}
                    isSelected={selectedOdds.includes(odd.id)}
                    onClick={onOddClick}
                 />
              ))}
           </div>

           {/* Odds Grid - Secondary Market */}
           {match.odds.secondary && match.odds.secondary.length > 0 && (
             <div className="grid grid-cols-2 gap-3 mt-3">
                {match.odds.secondary.map(odd => (
                  <OddButton 
                    key={odd.id} 
                    odd={odd} 
                    match={match}
                    isSelected={selectedOdds.includes(odd.id)}
                    onClick={onOddClick}
                  />
                ))}
             </div>
           )}

           {/* Stats / Stream Controls */}
           <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
              <button 
                 onClick={() => setShowStats(!showStats)}
                 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider bg-white dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm dark:shadow-none"
              >
                 <BarChart3 size={12} /> {showStats ? 'Hide Stats' : 'Match Stats'}
              </button>

              {match.hasStream && match.isLive && (
                  <button 
                     onClick={() => setShowStream(!showStream)}
                     className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 uppercase tracking-wider bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/40 transition-all"
                  >
                     <Tv size={12} /> {showStream ? 'Hide Stream' : 'Watch Stream'}
                  </button>
              )}
           </div>

           {/* Live Stream View */}
           {showStream && (
             <div className="mt-3 relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 group/video shadow-2xl">
                {match.streamUrl && !isBuffering ? (
                   <iframe 
                      src={getStreamUrl(match.streamUrl)}
                      title="Live Stream"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                   ></iframe>
                ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                       {isBuffering ? (
                            <>
                                <Loader2 className="animate-spin text-emerald-500 mb-2" size={32} /> 
                                <span className="text-white text-xs font-bold animate-pulse">Switching Quality to {quality}...</span>
                            </>
                       ) : (
                            <>
                                <div className="absolute inset-0 opacity-40">
                                    <img 
                                        src="https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&w=800&q=80"
                                        className="w-full h-full object-cover"
                                        alt="Stream Placeholder"
                                    />
                                </div>
                                <div className="z-10 flex flex-col items-center">
                                    <Loader2 className="animate-spin text-white mb-2" size={24} /> 
                                    <span className="text-white text-xs shadow-black drop-shadow-md">Connecting to feed...</span>
                                </div>
                            </>
                       )}
                   </div>
                )}
                
                {/* Live Badge */}
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse z-20 shadow-lg flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                </div>
                
                {/* Quality Controls Overlay (Visible on Hover) */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 flex flex-col items-end gap-1">
                     <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10 flex gap-1 shadow-lg">
                        <div className="flex items-center px-1 text-slate-400">
                             <Settings size={12} />
                        </div>
                        {['Auto', '1080p', '720p', '360p'].map((q) => (
                            <button
                                key={q}
                                onClick={() => handleQualityChange(q as any)}
                                className={`
                                    text-[10px] px-2 py-1 rounded font-bold transition-colors
                                    ${quality === q 
                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                        : 'text-slate-300 hover:text-white hover:bg-white/10'}
                                `}
                            >
                                {q}
                            </button>
                        ))}
                     </div>
                     <div className="text-[9px] text-white/50 font-mono pr-1 bg-black/40 rounded px-1">
                         {quality === 'Auto' ? 'Bitrate: Adaptive' : `Bitrate: ${quality}`}
                     </div>
                </div>

                {/* Bottom Bar Gradient for Controls visibility if needed */}
                <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
             </div>
           )}

           {/* Stats View */}
           {showStats && match.stats && (
              <div className="mt-4 space-y-3 bg-white dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                 {match.stats.map((stat, idx) => (
                    <div key={idx}>
                       <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          <span>{stat.home}</span>
                          <span className="uppercase text-slate-600 dark:text-slate-600">{stat.label}</span>
                          <span>{stat.away}</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden">
                          <div style={{ width: `${(stat.home / (stat.home + stat.away)) * 100}%` }} className="bg-emerald-500"></div>
                          <div style={{ width: `${(stat.away / (stat.home + stat.away)) * 100}%` }} className="bg-red-500"></div>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>
      )}
    </div>
  );
});

export default MatchCard;
