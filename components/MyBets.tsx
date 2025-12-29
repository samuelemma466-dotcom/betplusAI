import React, { useState, useEffect } from 'react';
import { PlacedBet } from '../types';
import { Trophy, Clock, CheckCircle2, XCircle, AlertCircle, Coins, ArrowRight, History, Loader2 } from 'lucide-react';

interface MyBetsProps {
  bets: PlacedBet[];
  onCashOut: (betId: string, amount: number) => void;
}

const MyBets: React.FC<MyBetsProps> = ({ bets, onCashOut }) => {
  const [activeTab, setActiveTab] = useState<'open' | 'settled'>('open');
  const [cashOutLoaders, setCashOutLoaders] = useState<Record<string, boolean>>({});
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const openBets = bets.filter(b => b.status === 'open');
  const settledBets = bets.filter(b => b.status !== 'open');
  const currentList = activeTab === 'open' ? openBets : settledBets;

  const handleCashOutClick = (bet: PlacedBet) => {
    setCashOutLoaders(prev => ({ ...prev, [bet.id]: true }));
    
    // Simulate API delay
    setTimeout(() => {
        const amount = bet.cashOutOffer || bet.stake * 0.9;
        onCashOut(bet.id, amount);
        setCashOutLoaders(prev => ({ ...prev, [bet.id]: false }));

        // Show Success Notification
        setSuccessNotification(`Cashed out $${amount.toFixed(2)} successfully!`);
        setTimeout(() => setSuccessNotification(null), 3500);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Success Notification Toast */}
      {successNotification && (
         <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.4)] animate-in fade-in slide-in-from-top-4 duration-300 border border-emerald-400/50 backdrop-blur-md">
            <div className="bg-white rounded-full p-0.5">
               <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={3} />
            </div>
            <span className="font-bold text-sm tracking-wide shadow-black drop-shadow-sm">{successNotification}</span>
         </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4 md:px-0">
         <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <History className="text-emerald-500" /> My Bets
         </h2>
         <div className="bg-slate-800 p-1 rounded-lg flex text-xs font-bold">
            <button 
               onClick={() => setActiveTab('open')}
               className={`px-4 py-2 rounded-md transition-all ${activeTab === 'open' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
               Open ({openBets.length})
            </button>
            <button 
               onClick={() => setActiveTab('settled')}
               className={`px-4 py-2 rounded-md transition-all ${activeTab === 'settled' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
               Settled ({settledBets.length})
            </button>
         </div>
      </div>

      {/* List */}
      <div className="space-y-4 px-4 md:px-0">
        {currentList.length === 0 ? (
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-slate-500">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                 <Trophy size={32} className="opacity-20" />
              </div>
              <p className="font-medium text-lg">No {activeTab} bets found</p>
              <p className="text-sm opacity-60">Place some bets to see them here.</p>
           </div>
        ) : (
           currentList.map(bet => (
              <div key={bet.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-700 transition-colors">
                 
                 {/* Ticket Header */}
                 <div className="bg-slate-950/50 p-3 flex justify-between items-center border-b border-slate-800">
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${bet.status === 'open' ? 'bg-emerald-500 animate-pulse' : bet.status === 'won' ? 'bg-green-500' : bet.status === 'lost' ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                       <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          {bet.selections.length > 1 ? `Accumulator (${bet.selections.length})` : 'Single Bet'}
                       </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                       ID: {bet.id.slice(-8)} • {new Date(bet.placedAt).toLocaleDateString()}
                    </span>
                 </div>

                 {/* Selections */}
                 <div className="p-4 space-y-3">
                    {bet.selections.map((sel, idx) => (
                       <div key={idx} className="flex justify-between items-start group">
                          <div className="flex-1">
                             <div className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{sel.selectionLabel}</div>
                             <div className="text-xs text-slate-500">{sel.marketType}</div>
                             <div className="text-xs text-slate-400 mt-0.5">{sel.matchTitle}</div>
                          </div>
                          <div className="bg-slate-800 px-2 py-1 rounded text-emerald-400 font-bold text-sm">
                             {sel.oddValue.toFixed(2)}
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* Footer & Actions */}
                 <div className="bg-slate-800/50 p-4 border-t border-slate-800">
                    <div className="flex justify-between items-end mb-4">
                       <div>
                          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Stake</div>
                          <div className="text-white font-bold text-lg">${bet.stake.toFixed(2)}</div>
                       </div>
                       <div className="text-right">
                          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Potential Return</div>
                          <div className={`font-black text-xl ${bet.status === 'won' ? 'text-green-400' : 'text-emerald-400'}`}>
                             ${bet.potentialReturn.toFixed(2)}
                          </div>
                       </div>
                    </div>

                    {/* Cash Out Action */}
                    {bet.status === 'open' && (
                       <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-amber-500">
                             <Clock size={14} className="animate-spin-slow" />
                             <span>Market active</span>
                          </div>
                          <button 
                             onClick={() => handleCashOutClick(bet)}
                             disabled={cashOutLoaders[bet.id]}
                             className="bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                          >
                             {cashOutLoaders[bet.id] ? (
                                <Loader2 size={16} className="animate-spin" />
                             ) : (
                                <Coins size={16} />
                             )}
                             Cash Out ${bet.cashOutOffer?.toFixed(2) || (bet.stake * 0.95).toFixed(2)}
                          </button>
                       </div>
                    )}
                    
                    {/* Status Badges for Settled */}
                    {bet.status === 'won' && (
                       <div className="flex items-center justify-center gap-2 bg-green-500/10 text-green-400 py-2 rounded-lg font-bold text-sm border border-green-500/20">
                          <CheckCircle2 size={18} /> YOU WON!
                       </div>
                    )}
                    {bet.status === 'lost' && (
                       <div className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 py-2 rounded-lg font-bold text-sm border border-red-500/20">
                          <XCircle size={18} /> Bet Lost
                       </div>
                    )}
                    {bet.status === 'cashed_out' && (
                        <div className="flex items-center justify-center gap-2 bg-slate-700/30 text-slate-400 py-2 rounded-lg font-bold text-sm border border-slate-600">
                           <Coins size={18} /> Cashed Out
                        </div>
                    )}
                 </div>
              </div>
           ))
        )}
      </div>
    </div>
  );
};

export default MyBets;