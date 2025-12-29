
import React, { useState, useEffect, memo } from 'react';
import { Match, Odd, BetSelection } from '../types';
import { Tv, BarChart3, ChevronDown, ChevronUp, Zap, Clock, PlayCircle, TrendingUp } from 'lucide-react';
import { getMatchPrediction } from '../services/geminiService';
import { Typewriter } from './UiEffects';

interface OddButtonProps {
  odd: Odd;
  match: Match;
  isSelected: boolean;
  onClick: (selection: BetSelection) => void;
  expanded?: boolean;
}

const OddButton: React.FC<OddButtonProps> = ({ odd, match, isSelected, onClick, expanded = false }) => {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (odd.prevValue) {
      if (odd.value > odd.prevValue) setDirection('up');
      else if (odd.value < odd.prevValue) setDirection('down');
      const timer = setTimeout(() => setDirection(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [odd.value, odd.prevValue]);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick({
        matchId: match.id,
        selectionId: odd.id,
        matchTitle: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        selectionLabel: odd.label === '1' ? match.homeTeam.name : odd.label === '2' ? match.awayTeam.name : odd.label,
        oddValue: odd.value,
        marketType: odd.marketType
      })}}
      className={`
        relative flex flex-col items-center justify-center rounded-lg transition-all duration-200 font-medium overflow-hidden border group
        ${expanded ? 'py-3' : 'py-2.5'}
        ${isSelected 
          ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500'}
      `}
    >
      {/* Odds Change Indicator */}
      {direction && (
        <div className={`absolute inset-0 opacity-20 pointer-events-none ${direction === 'up' ? 'bg-emerald-500' : 'bg-red-500'} transition-opacity`} />
      )}
      
      {/* Label (Hidden in compact view if standard 1x2 to save space, shown otherwise) */}
      <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-500'}`}>
        {odd.label === '1' ? '1' : odd.label === '2' ? '2' : odd.label === 'X' ? 'X' : odd.label}
      </span>

      <div className="flex items-center gap-1 z-10 relative">
        <span className={`font-black tracking-tight ${expanded ? 'text-base' : 'text-sm'} ${
          isSelected ? 'text-white' : 
          direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 
          direction === 'down' ? 'text-red-500 dark:text-red-400' : 
          'text-slate-900 dark:text-white'
        }`}>
          {odd.value.toFixed(2)}
        </span>
        {direction === 'up' && <TrendingUp size={10} className="text-emerald-500" />}
        {direction === 'down' && <TrendingUp size={10} className="text-red-500 rotate-180" />}
      </div>
    </button>
  );
};

interface MatchCardProps {
  match: Match;
  onOddClick: (selection: BetSelection) => void;
  selectedOdds: string[];
  displayMarket: 'main' | 'secondary'; // NEW: Controls which odds show on the card face
}

const MatchCard: React.FC<MatchCardProps> = memo(({ match, onOddClick, selectedOdds, displayMarket }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  
  // Decide which odds to show on the main card face
  const visibleOdds = displayMarket === 'main' ? match.odds.main : (match.odds.secondary.length > 0 ? match.odds.secondary : match.odds.main);

  const getStatusText = () => {
    if (!match.isLive) return match.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (match.sport === 'Soccer') return `${match.minute}'`;
    if (match.sport === 'Basketball') return `${match.period}`;
    return 'LIVE';
  };

  const handleAiClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aiTip) { setAiTip(null); return; }
    const tip = await getMatchPrediction(match);
    setAiTip(tip);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      
      {/* --- Main Row (Click to Expand) --- */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col sm:flex-row items-stretch cursor-pointer relative"
      >
        
        {/* Left: Match Info */}
        <div className="flex-1 p-4 flex items-center justify-between sm:border-r border-slate-100 dark:border-slate-800/50 gap-4">
           
           {/* Time / Status Column */}
           <div className="flex flex-col items-center justify-center w-14 shrink-0 gap-1">
              {match.isLive ? (
                 <>
                   <span className="text-xs font-black text-red-500 animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {match.minute}'
                   </span>
                   {match.hasStream && <Tv size={14} className="text-slate-400" />}
                 </>
              ) : (
                 <>
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {match.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </span>
                   <span className="text-[10px] text-slate-400 font-medium">
                      {match.startTime.toLocaleDateString([], {day: 'numeric', month: 'short'})}
                   </span>
                 </>
              )}
           </div>

           {/* Teams Column */}
           <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <img src={match.homeTeam.logo} alt="" className="w-5 h-5 object-contain" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{match.homeTeam.name}</span>
                 </div>
                 {match.isLive && <span className="text-emerald-500 font-bold font-mono">{match.scores?.home}</span>}
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <img src={match.awayTeam.logo} alt="" className="w-5 h-5 object-contain" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{match.awayTeam.name}</span>
                 </div>
                 {match.isLive && <span className="text-emerald-500 font-bold font-mono">{match.scores?.away}</span>}
              </div>
           </div>
        </div>

        {/* Right: Odds Grid (The "Market" Face) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/30 sm:w-64 shrink-0 flex items-center">
           <div className="grid grid-cols-3 gap-2 w-full">
              {visibleOdds.slice(0, 3).map(odd => (
                 <OddButton 
                    key={odd.id} 
                    odd={odd} 
                    match={match}
                    isSelected={selectedOdds.includes(odd.id)}
                    onClick={onOddClick}
                 />
              ))}
              {visibleOdds.length < 3 && (
                 <div className="flex items-center justify-center text-xs text-slate-400">
                    <Lock size={12} />
                 </div>
              )}
           </div>
        </div>
        
        {/* Expand Toggle Visual */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 bg-gradient-to-l from-slate-100 dark:from-slate-800 to-transparent h-full sm:flex items-center justify-center hidden opacity-0 group-hover:opacity-100 transition-opacity">
           <ChevronDown size={14} className="text-slate-400" />
        </div>

      </div>

      {/* --- Expanded Detail View (Lazy Rendered) --- */}
      {isOpen && (
        <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-4 animate-in slide-in-from-top-1">
           
           {/* AI Insight Header */}
           <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                 <button onClick={handleAiClick} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-full text-xs font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all">
                    <Zap size={12} fill="currentColor" /> AI Analysis
                 </button>
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
                    <BarChart3 size={12} /> Stats
                 </button>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                 {match.odds.main.length + match.odds.secondary.length} Markets Available
              </span>
           </div>

           {/* AI Prediction Text */}
           {aiTip && (
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-500/20 rounded-lg text-xs text-purple-800 dark:text-purple-200 font-medium">
                 <Typewriter text={aiTip} />
              </div>
           )}

           {/* Extended Markets Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Main Market */}
              <div>
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Match Winner</h4>
                 <div className="grid grid-cols-3 gap-2">
                    {match.odds.main.map(odd => (
                       <OddButton 
                          key={odd.id} 
                          odd={odd} 
                          match={match}
                          isSelected={selectedOdds.includes(odd.id)}
                          onClick={onOddClick}
                          expanded
                       />
                    ))}
                 </div>
              </div>

              {/* Secondary Market (Goals/Handicap) */}
              {match.odds.secondary.length > 0 && (
                 <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Alternative Markets</h4>
                    <div className="grid grid-cols-2 gap-2">
                       {match.odds.secondary.map(odd => (
                          <OddButton 
                             key={odd.id} 
                             odd={odd} 
                             match={match}
                             isSelected={selectedOdds.includes(odd.id)}
                             onClick={onOddClick}
                             expanded
                          />
                       ))}
                    </div>
                 </div>
              )}
           </div>

           {/* Footer: Close */}
           <div 
             onClick={() => setIsOpen(false)}
             className="mt-4 flex justify-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
           >
              <ChevronUp size={16} />
           </div>
        </div>
      )}
    </div>
  );
});

export default MatchCard;
