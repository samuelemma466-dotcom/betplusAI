
import React, { useState } from 'react';
import { Match, SportCategory, BetSelection } from '../types';
import { SPORTS } from '../constants';
import MatchCard from './MatchCard';
import AdBanner from './AdBanner';
import { Trophy, Flame, Calendar, ChevronRight, TrendingUp } from 'lucide-react';

interface SportsViewProps {
  matches: Match[];
  activeCategory: SportCategory;
  setActiveCategory: (cat: SportCategory) => void;
  filter: 'all' | 'live' | 'upcoming';
  setFilter: (f: 'all' | 'live' | 'upcoming') => void;
  onOddClick: (selection: BetSelection) => void;
  selectedOdds: string[];
}

const TOP_LEAGUES = [
  { name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'NBA', icon: '🏀' },
  { name: 'Champions League', icon: '🏆' },
  { name: 'NFL', icon: '🏈' },
  { name: 'La Liga', icon: '🇪🇸' },
];

const SportsView: React.FC<SportsViewProps> = ({ 
  matches, 
  activeCategory, 
  setActiveCategory, 
  filter, 
  setFilter, 
  onOddClick, 
  selectedOdds 
}) => {
  
  // Local state for sub-league filter if needed in future
  const [activeLeague, setActiveLeague] = useState<string | null>(null);

  const filteredMatches = matches.filter(m => {
     // Sport Category Filter
     if (activeCategory && m.sport !== activeCategory) return false;

     // Main Filter
     if (filter === 'live' && !m.isLive) return false;
     if (filter === 'upcoming' && m.isLive) return false;
     
     // League Filter
     if (activeLeague && m.league !== activeLeague) return false;

     return true;
  });

  const liveCount = matches.filter(m => m.sport === activeCategory && m.isLive).length;

  return (
    <div className="space-y-6">
      
      {/* 1. HERO BANNER (Only on 'all' view) */}
      {filter === 'all' && (
        <div className="px-4 sm:px-0 animate-in fade-in slide-in-from-top-4 duration-500">
           <AdBanner />
        </div>
      )}

      {/* 2. SPORT CATEGORY NAVIGATION */}
      <div className="sticky top-16 z-20 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-sm py-2 border-b border-slate-200 dark:border-slate-800">
         <div className="flex gap-2 overflow-x-auto px-4 sm:px-0 no-scrollbar items-center">
            {SPORTS.map(sport => {
               const sportLiveCount = matches.filter(m => m.sport === sport.id && m.isLive).length;
               return (
                  <button
                     key={sport.id}
                     onClick={() => setActiveCategory(sport.id)}
                     className={`
                        relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all whitespace-nowrap border
                        ${activeCategory === sport.id 
                           ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md' 
                           : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}
                     `}
                  >
                     <span className="text-base">{sport.icon}</span>
                     <span className="text-xs font-bold uppercase tracking-wider">{sport.name}</span>
                     {sportLiveCount > 0 && (
                        <span className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeCategory === sport.id ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                           {sportLiveCount}
                        </span>
                     )}
                  </button>
               );
            })}
         </div>
      </div>

      {/* 3. SUB-NAVIGATION (Quick Leagues) */}
      {filter === 'all' && (
         <div className="px-4 sm:px-0">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <TrendingUp size={12} /> Popular Leagues
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
               {TOP_LEAGUES.map((league, idx) => (
                  <button 
                     key={idx}
                     className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors group text-left"
                  >
                     <span className="text-lg group-hover:scale-110 transition-transform">{league.icon}</span>
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{league.name}</span>
                  </button>
               ))}
            </div>
         </div>
      )}

      {/* 4. VIEW FILTERS (Live / Upcoming) */}
      <div className="px-4 sm:px-0 flex items-center justify-between">
         <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button 
               onClick={() => setFilter('all')}
               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
               Lobby
            </button>
            <button 
               onClick={() => setFilter('live')}
               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${filter === 'live' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
               <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${filter === 'live' ? 'animate-pulse' : ''}`}></span> Live
            </button>
            <button 
               onClick={() => setFilter('upcoming')}
               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'upcoming' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
               Upcoming
            </button>
         </div>
         
         {/* Sort / Calendar (Visual Only) */}
         <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <Calendar size={18} />
         </button>
      </div>

      {/* 5. MATCH LIST */}
      <div className="px-4 sm:px-0 pb-10 min-h-[50vh]">
         {filteredMatches.length > 0 ? (
            <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
               {/* Section Title */}
               <div className="flex items-center gap-2 mb-2">
                  {filter === 'live' ? (
                     <Flame size={16} className="text-red-500" /> 
                  ) : (
                     <Trophy size={16} className="text-amber-500" />
                  )}
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                     {filter === 'live' ? 'In-Play Events' : filter === 'upcoming' ? 'Scheduled' : 'Highlights'}
                  </h2>
               </div>

               {filteredMatches.map(match => (
                  <MatchCard 
                     key={match.id} 
                     match={match} 
                     onOddClick={onOddClick}
                     selectedOdds={selectedOdds}
                  />
               ))}
            </div>
         ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
               <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                  <Trophy size={32} className="opacity-30" />
               </div>
               <p className="font-bold text-lg">No matches found</p>
               <p className="text-xs mt-1 opacity-70">Try changing the category or filter.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default SportsView;
