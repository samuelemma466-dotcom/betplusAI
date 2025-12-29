
import React, { useState, useEffect, memo } from 'react';
import { Match, Odd, BetSelection, StatItem } from '../types';
import { Tv, BarChart3, ChevronDown, ChevronUp, Zap, Clock, PlayCircle, TrendingUp, Lock, Percent, Activity, X } from 'lucide-react';
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
          ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] ring-1 ring-emerald-400 scale-[1.02] z-10' 
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
        <span className={`font-black tracking-tight transition-all ${
          isSelected ? 'text-xl' : 
          expanded ? 'text-lg' : 'text-sm'
        } ${
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

// --- STATS COMPONENT ---
const StatRow = ({ label, home, away, type }: StatItem) => {
  const total = home + away;
  const homeWidth = total === 0 ? 50 : (home / total) * 100;
  
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
        <span>{home}{type === 'percent' ? '%' : ''}</span>
        <span className="uppercase tracking-wider text-[10px]">{label}</span>
        <span>{away}{type === 'percent' ? '%' : ''}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
        <div 
          className="bg-slate-900 dark:bg-emerald-500 h-full transition-all duration-500" 
          style={{ width: `${homeWidth}%` }}
        />
        <div 
          className="bg-slate-300 dark:bg-slate-700 h-full transition-all duration-500" 
          style={{ width: `${100 - homeWidth}%` }}
        />
      </div>
    </div>
  );
};

const TeamForm = ({ name, results }: { name: string, results: ('W'|'L'|'D')[] }) => (
  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{name}</span>
    <div className="flex gap-1">
      {results.map((r, i) => (
        <span 
          key={i} 
          className={`
            w-5 h-5 flex items-center justify-center text-[9px] font-black rounded
            ${r === 'W' ? 'bg-emerald-500 text-white' : r === 'D' ? 'bg-slate-400 text-white' : 'bg-red-500 text-white'}
          `}
        >
          {r}
        </span>
      ))}
    </div>
  </div>
);

interface MatchCardProps {
  match: Match;
  onOddClick: (selection: BetSelection) => void;
  selectedOdds: string[];
  displayMarket: 'main' | 'secondary';
}

const MatchCard: React.FC<MatchCardProps> = memo(({ match, onOddClick, selectedOdds, displayMarket }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'markets' | 'stats'>('markets');
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  
  const visibleOdds = displayMarket === 'main' ? match.odds.main : (match.odds.secondary.length > 0 ? match.odds.secondary : match.odds.main);

  // Auto-show player when expanded if live
  useEffect(() => {
     if (isOpen && match.isLive && match.hasStream) {
        setIsPlayerVisible(true);
     }
  }, [isOpen, match.isLive, match.hasStream]);

  // Mock Form Generator (since it's not in the main data model for all matches)
  const generateMockForm = (): ('W'|'L'|'D')[] => Array.from({length: 5}, () => ['W','L','D'][Math.floor(Math.random()*3)] as any);

  const handleAiClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aiTip) { setAiTip(null); return; }
    const tip = await getMatchPrediction(match);
    setAiTip(tip);
  };

  const handleStatsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab('stats');
    if (!isOpen) setIsOpen(true);
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
                   <div className="text-xs font-black text-red-500 animate-pulse flex flex-col items-center leading-none">
                      <span className="w-2 h-2 rounded-full bg-red-500 mb-1"></span> 
                      <span className="uppercase tracking-tighter font-bold">
                        {match.sport === 'Basketball' ? match.period : (match.minute ? `${match.minute}'` : 'LIVE')}
                      </span>
                   </div>
                   {match.hasStream && <Tv size={14} className="text-emerald-500 mt-1" />}
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
           <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <img src={match.homeTeam.logo} alt="" className="w-6 h-6 object-contain" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{match.homeTeam.name}</span>
                 </div>
                 {match.isLive && (
                    <span className="text-emerald-500 dark:text-emerald-400 font-black font-mono text-xl md:text-2xl bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded min-w-[2.5rem] text-center shadow-sm">
                        {match.scores?.home}
                    </span>
                 )}
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <img src={match.awayTeam.logo} alt="" className="w-6 h-6 object-contain" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{match.awayTeam.name}</span>
                 </div>
                 {match.isLive && (
                    <span className="text-emerald-500 dark:text-emerald-400 font-black font-mono text-xl md:text-2xl bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded min-w-[2.5rem] text-center shadow-sm">
                        {match.scores?.away}
                    </span>
                 )}
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

      {/* --- Expanded Detail View --- */}
      {isOpen && (
        <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-4 animate-in slide-in-from-top-1">
           
           {/* LIVE STREAM PLAYER */}
           {match.isLive && match.hasStream && match.streamUrl && isPlayerVisible && (
              <div className="mb-6 rounded-xl overflow-hidden bg-black shadow-2xl relative group animate-in zoom-in-95 duration-300">
                 <div className="aspect-video w-full relative">
                     <iframe 
                        src={match.streamUrl} 
                        className="w-full h-full border-0" 
                        allow="autoplay; encrypted-media; picture-in-picture" 
                        allowFullScreen
                     />
                     {/* Overlay Controls / Badge */}
                     <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
                        <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-sm animate-pulse">
                           <div className="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE
                        </div>
                     </div>
                     <button 
                        onClick={(e) => { e.stopPropagation(); setIsPlayerVisible(false); }}
                        className="absolute top-3 left-3 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <X size={14} />
                     </button>
                 </div>
                 <div className="bg-slate-900/90 text-white px-3 py-2 flex items-center justify-between text-xs">
                     <div className="flex items-center gap-2">
                        <Tv size={14} className="text-emerald-400" />
                        <span className="font-bold">Live Stream</span>
                     </div>
                     <span className="text-slate-400">Low Latency Mode Active</span>
                 </div>
              </div>
           )}

           {/* Tab Navigation Header */}
           <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex gap-4">
                 <button 
                    onClick={(e) => { e.stopPropagation(); setActiveTab('markets'); }}
                    className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${activeTab === 'markets' ? 'text-emerald-500 border-emerald-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                 >
                    Betting Markets
                 </button>
                 <button 
                    onClick={handleStatsClick}
                    className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'stats' ? 'text-emerald-500 border-emerald-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                 >
                    <BarChart3 size={12} /> Stats & Form
                 </button>
                 
                 {/* Re-open player button if closed but available */}
                 {match.isLive && match.hasStream && !isPlayerVisible && (
                    <button 
                       onClick={(e) => { e.stopPropagation(); setIsPlayerVisible(true); }}
                       className="text-xs font-bold uppercase tracking-wider pb-2 border-b-2 border-transparent text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                       <PlayCircle size={12} /> Watch Live
                    </button>
                 )}
              </div>
              
              <button onClick={handleAiClick} className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-full text-[10px] font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all">
                  <Zap size={10} fill="currentColor" /> AI Insight
              </button>
           </div>

           {/* AI Prediction Text */}
           {aiTip && (
              <div className="mb-6 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-500/20 rounded-lg text-xs text-purple-800 dark:text-purple-200 font-medium animate-in fade-in">
                 <Typewriter text={aiTip} />
              </div>
           )}

           {/* --- CONTENT: MARKETS TAB --- */}
           {activeTab === 'markets' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-left-2 duration-300">
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

                 {/* Secondary Market */}
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
           )}

           {/* --- CONTENT: STATS TAB --- */}
           {activeTab === 'stats' && (
              <div className="animate-in slide-in-from-right-2 duration-300">
                 
                 {/* 1. Team Form */}
                 <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                       <Activity size={12} /> Recent Form (Last 5)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                       <TeamForm name={match.homeTeam.name} results={generateMockForm()} />
                       <TeamForm name={match.awayTeam.name} results={generateMockForm()} />
                    </div>
                 </div>

                 {/* 2. Detailed Stats */}
                 <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                       <Percent size={12} /> Match Statistics
                    </h4>
                    <div className="bg-slate-100 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                       {match.stats && match.stats.length > 0 ? (
                          match.stats.map((stat, idx) => (
                             <StatRow key={idx} {...stat} />
                          ))
                       ) : (
                          <div className="text-center py-4 text-slate-500 text-xs">
                             Detailed statistics are currently unavailable for this match.
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           )}

           {/* Footer: Close */}
           <div 
             onClick={() => setIsOpen(false)}
             className="mt-6 flex justify-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
           >
              <ChevronUp size={16} />
           </div>
        </div>
      )}
    </div>
  );
});

export default MatchCard;
