
import React, { useState, useEffect, useRef } from 'react';
import { SPORTS, MOCK_MATCHES } from './constants';
import { BetSelection, SportCategory, Match, Odd, PlacedBet, AppView, AppSettings, Transaction, UserProfile } from './types';
import MatchCard from './components/MatchCard';
import Betslip from './components/Betslip';
import JackpotGame from './components/JackpotGame';
import CasinoGame from './components/CasinoGame';
import MyBets from './components/MyBets';
import MenuDrawer from './components/MenuDrawer';
import SportsView from './components/SportsView'; 
import { AuthScreen } from './components/AuthScreen';
import { SecurityCenter } from './components/SecurityCenter';
import { Confetti, CountUp } from './components/UiEffects';
import { DepositView, WithdrawView, ProfileView, TransactionsView, HelpView, ResponsibleGamingView, SettingsView, VerificationView, BonusView, getCurrencySymbol } from './components/AccountViews';
import { Menu, Search, User, Bell, Home, Calendar, Trophy, PieChart, MenuSquare, Dices, X, CheckCircle2, Ticket, Wallet, AlertTriangle, LogOut } from 'lucide-react';

// --- TOAST COMPONENT ---
interface Toast {
  id: string;
  message: string;
  subtitle?: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SportCategory>('Soccer');
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [isMobileBetslipOpen, setIsMobileBetslipOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [currentView, setCurrentView] = useState<AppView>('sports');
  const [myBets, setMyBets] = useState<PlacedBet[]>([]);
  const [balance, setBalance] = useState(2450.50);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 0123-4567',
    avatar: 'JD',
    id: '88239102',
    level: 2,
    joinDate: 'August 2023'
  });
  
  // Idle Timer State
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const IDLE_WARN_TIME = 240000; // 4 minutes
  const IDLE_LOGOUT_TIME = 300000; // 5 minutes

  // Transaction History State
  const [transactions, setTransactions] = useState<Transaction[]>([
     { id: 'tx-102', type: 'Bet Win', method: 'Ticket #88291', amount: 150.50, date: 'May 09, 21:00', status: 'Success' },
     { id: 'tx-101', type: 'Deposit', method: 'Visa **** 4242', amount: 500.00, date: 'May 05, 11:20', status: 'Success' }
  ]);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    oddsFormat: 'decimal',
    defaultStake: 25,
    autoAcceptOdds: false,
    privacyMode: false,
    language: 'en-US',
    country: 'US',
    currency: 'USD',
    notifications: {
      marketing: true,
      matchEvents: true,
      betSettled: true,
    }
  });

  const currencySymbol = getCurrencySymbol(settings.currency);

  // Check Auth Token on Mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Apply Theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleLogout = () => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    localStorage.removeItem('authToken');
    setIsMenuOpen(false);
    setIsAuthenticated(false);
    setShowSessionWarning(false);
    addToast("Logged out successfully");
    setCurrentView('sports');
  };

  const handleAuthSuccess = () => {
    localStorage.setItem('authToken', 'secure-token-123');
    setIsAuthenticated(true);
    addToast("System Online", "Identity Verified");
  };

  // IDLE TIMER LOGIC
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      
      if (showSessionWarning) setShowSessionWarning(false);

      warnTimerRef.current = setTimeout(() => {
        setShowSessionWarning(true);
      }, IDLE_WARN_TIME);

      logoutTimerRef.current = setTimeout(() => {
        handleLogout();
        addToast("Session Expired", "You were logged out due to inactivity.");
      }, IDLE_LOGOUT_TIME);
    };

    // Events to track activity
    const events = ['mousemove', 'click', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    resetTimer(); // Start initial timer

    return () => {
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [isAuthenticated, showSessionWarning]); // Re-bind if warning state changes (to allow dismissal via activity)
  
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);

  // Helper: Show Toast
  const addToast = (message: string, subtitle?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, subtitle }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const triggerWin = (amount: number) => {
    setShowConfetti(true);
    setBalance(prev => prev + amount);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleDeposit = (amount: number, method: string) => {
      setBalance(b => b + amount);
      const newTx: Transaction = {
          id: `dep-${Date.now()}`,
          type: 'Deposit',
          method: method,
          amount: amount,
          date: new Date().toLocaleString(),
          status: 'Success'
      };
      setTransactions(prev => [newTx, ...prev]);
      addToast('Deposit Successful', `${currencySymbol}${amount.toFixed(2)} added to balance.`);
  };

  const handleWithdraw = (amount: number, method: string) => {
      setBalance(b => b - amount);
      const newTx: Transaction = {
          id: `wdr-${Date.now()}`,
          type: 'Withdrawal',
          method: method,
          amount: amount,
          date: new Date().toLocaleString(),
          status: 'Pending'
      };
      setTransactions(prev => [newTx, ...prev]);
      addToast('Withdrawal Requested', `${currencySymbol}${amount.toFixed(2)} is being processed.`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(currentMatches => {
        return currentMatches.map(match => {
          if (!match.isLive) return match;

          let newScores = match.scores ? { ...match.scores } : { home: 0, away: 0 };
          const scoreChance = Math.random();
          if (scoreChance > 0.98) {
             if (Math.random() > 0.5) newScores.home += 1;
             else newScores.away += 1;
             
             if (match.sport === 'Tennis' && newScores.detail) {
                newScores.detail = `${Math.floor(Math.random()*6)}-${Math.floor(Math.random()*6)}, ${newScores.home}-${newScores.away}`;
             }
          }

          let newMinute = match.minute;
          if (match.sport !== 'Tennis' && Math.random() > 0.7) {
             newMinute = (match.minute || 0) + 1;
          }

          const updateOdds = (odds: Odd[]) => {
             return odds.map(odd => {
                if (Math.random() > 0.7) {
                  const change = (Math.random() - 0.5) * 0.15;
                  let newVal = odd.value + change;
                  if (newVal < 1.01) newVal = 1.01;
                  return { ...odd, value: newVal, prevValue: odd.value };
                }
                return odd;
             });
          };

          return {
            ...match,
            scores: newScores,
            minute: newMinute,
            odds: {
              main: updateOdds(match.odds.main),
              secondary: updateOdds(match.odds.secondary)
            }
          };
        });
      });
      
      setMyBets(prevBets => prevBets.map(bet => {
        if (bet.status !== 'open') return bet;
        const fluctuation = 1 + (Math.random() - 0.5) * 0.04;
        let newOffer = (bet.cashOutOffer || bet.stake) * fluctuation;
        newOffer = Math.max(bet.stake * 0.1, Math.min(newOffer, bet.potentialReturn * 1.5));
        
        return { ...bet, cashOutOffer: newOffer };
      }));

    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  const handleOddClick = (selection: BetSelection) => {
    setSelections(prev => {
      const exists = prev.find(s => s.selectionId === selection.selectionId);
      if (exists) {
        return prev.filter(s => s.selectionId !== selection.selectionId);
      }
      const filtered = prev.filter(s => s.matchId !== selection.matchId);
      return [...filtered, selection];
    });
  };

  const removeSelection = (id: string) => {
    setSelections(prev => prev.filter(s => s.selectionId !== id));
  };

  const handlePlaceBet = (bet: PlacedBet) => {
    setMyBets(prev => [bet, ...prev]);
    setBalance(prev => prev - bet.stake);
    addToast('Bet Placed Successfully', `Ticket #${bet.id.slice(-6)} • Potential Win: ${currencySymbol}${bet.potentialReturn.toFixed(2)}`);
  };

  const handleCashOut = (betId: string, amount: number) => {
    setMyBets(prev => prev.map(bet => {
        if (bet.id === betId) {
            return { ...bet, status: 'cashed_out', cashOutOffer: amount };
        }
        return bet;
    }));
    triggerWin(amount);
    
    const newTx: Transaction = {
       id: `co-${Date.now()}`,
       type: 'Bet Win',
       method: 'Cash Out',
       amount: amount,
       date: new Date().toLocaleString(),
       status: 'Success'
    };
    setTransactions(prev => [newTx, ...prev]);

    addToast('Cash Out Confirmed', `Credits added: ${currencySymbol}${amount.toFixed(2)}`);
  };

  const renderContent = () => {
      switch (currentView) {
          case 'casino': return <CasinoGame onWin={(amount) => { triggerWin(amount); addToast("Big Win!", `You won ${currencySymbol}${amount.toFixed(2)}`); }} />;
          case 'jackpot': return <JackpotGame />;
          case 'my-bets': return <MyBets bets={myBets} onCashOut={handleCashOut} />;
          case 'deposit': return <DepositView onDeposit={handleDeposit} currencySymbol={currencySymbol} />;
          case 'withdraw': return <WithdrawView balance={balance} onWithdraw={handleWithdraw} currencySymbol={currencySymbol} />;
          case 'profile': return <ProfileView onNavigate={setCurrentView} settings={settings} user={userProfile} onUpdateUser={setUserProfile} />;
          case 'transactions': return <TransactionsView transactions={transactions} currencySymbol={currencySymbol} />;
          case 'help': return <HelpView />;
          case 'responsible-gaming': return <ResponsibleGamingView />;
          case 'settings': return <SettingsView settings={settings} onUpdate={setSettings} />;
          case 'security': return <SecurityCenter />;
          case 'verification': return <VerificationView />;
          case 'bonuses': return <BonusView />;
          case 'notifications': return <div className="p-8 text-center text-slate-500">No new notifications</div>;
          case 'sports':
          default:
              return (
                <SportsView 
                  matches={matches} 
                  activeCategory={activeCategory} 
                  setActiveCategory={setActiveCategory} 
                  filter={filter}
                  setFilter={setFilter}
                  onOddClick={handleOddClick}
                  selectedOdds={selections.map(s => s.selectionId)}
                />
              );
      }
  }

  // --- RENDER AUTH SCREEN IF NOT LOGGED IN ---
  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={handleAuthSuccess} />;
  }

  const isSportsView = currentView === 'sports';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-emerald-500 selection:text-white pb-20 md:pb-0 transition-colors duration-300">
      
      {/* --- GLOBAL EFFECTS --- */}
      {showConfetti && <Confetti />}

      {/* --- SESSION WARNING MODAL --- */}
      {showSessionWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full mx-4 shadow-2xl text-center">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                 <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Session Expiring</h3>
              <p className="text-slate-400 text-sm mb-6">
                 For security reasons, your session will time out in 60 seconds due to inactivity.
              </p>
              <button 
                 onClick={() => setShowSessionWarning(false)}
                 className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                 I'm still here
              </button>
           </div>
        </div>
      )}

      {/* --- TOAST CONTAINER --- */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700/50 flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-300 min-w-[300px] pointer-events-auto">
             <div className="bg-emerald-500/20 p-2 rounded-full">
                <Ticket size={18} className="text-emerald-400" />
             </div>
             <div>
                <p className="font-bold text-sm">{toast.message}</p>
                {toast.subtitle && <p className="text-xs text-slate-400">{toast.subtitle}</p>}
             </div>
             <button onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))} className="ml-auto text-slate-500 hover:text-white"><X size={14} /></button>
          </div>
        ))}
      </div>

      {/* Menu Drawer Component */}
      <MenuDrawer 
         isOpen={isMenuOpen} 
         onClose={() => setIsMenuOpen(false)} 
         onNavigate={(view) => {
             setCurrentView(view);
             setIsMenuOpen(false);
         }}
         onLogout={handleLogout}
         settings={settings}
         onSettingsUpdate={setSettings}
         user={userProfile}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => setCurrentView('sports')}>
               <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center transform rotate-3 shadow-lg shadow-emerald-500/20">
                 <span className="font-black text-white text-lg italic">B</span>
               </div>
               <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 hidden sm:block">
                 BetPulse
               </span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input 
              type="text" 
              placeholder="Search matches, leagues, or teams..." 
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={16} />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
               <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Main Balance</span>
               <CountUp 
                  value={balance} 
                  prefix={currencySymbol} 
                  className="text-emerald-500 dark:text-emerald-400 font-bold font-mono text-lg"
                  masked={settings.privacyMode}
               />
            </div>
            <button onClick={() => setCurrentView('deposit')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 md:px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2">
              <Wallet size={16} className="hidden sm:block" /> <span>DEPOSIT</span>
            </button>
            <div 
               onClick={() => setIsMenuOpen(true)}
               className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-300 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition-colors text-slate-600 dark:text-slate-300"
            >
               <User size={18} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row pt-6 px-0 sm:px-4 gap-6">
        
        {/* Left Sidebar (Sports Nav) - Hidden on Mobile */}
        <aside className="hidden md:block w-64 shrink-0 space-y-6 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
           {/* Quick Links */}
           <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Sports</h3>
              <nav className="space-y-1">
                {SPORTS.map(sport => (
                  <button
                    key={sport.id}
                    onClick={() => { setActiveCategory(sport.id); setCurrentView('sports'); setFilter('all'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      activeCategory === sport.id && currentView === 'sports'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="text-lg">{sport.icon}</span>
                    <span className="font-medium text-sm">{sport.name}</span>
                    {activeCategory === sport.id && currentView === 'sports' && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>}
                  </button>
                ))}
              </nav>
           </div>
           
           {/* Additional Links */}
           <div className="space-y-2">
              <button 
                  onClick={() => setCurrentView('casino')}
                  className={`w-full text-left cursor-pointer rounded-xl p-4 border transition-all group ${currentView === 'casino' ? 'bg-purple-100 dark:bg-purple-950/40 border-purple-200 dark:border-purple-500/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-500/30'}`}
               >
                  <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-600 text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                     <Dices size={20} />
                  </div>
                  <h3 className="font-bold text-purple-700 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300">Casino</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Slots, Live & Crash Games</p>
              </button>

              <button 
                  onClick={() => setCurrentView('jackpot')}
                  className={`w-full text-left cursor-pointer rounded-xl p-4 border transition-all ${currentView === 'jackpot' ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/30'}`}
               >
                  <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-500 text-amber-950 p-1.5 rounded-lg">
                     <Trophy size={20} className="fill-amber-950" />
                  </div>
                  <h3 className="font-bold text-amber-600 dark:text-amber-500">Super Jackpot</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Win up to ₦50,000,000</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-3/4"></div>
                  </div>
              </button>

              <button 
                  onClick={() => setCurrentView('my-bets')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${currentView === 'my-bets' ? 'bg-white dark:bg-slate-800 border-emerald-500 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
               >
                  <div className={`p-1.5 rounded-lg ${currentView === 'my-bets' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                     <PieChart size={18} />
                  </div>
                  <div className="text-left">
                     <div className="font-bold text-sm">My Bets</div>
                     <div className="text-[10px] opacity-60">{myBets.filter(b => b.status === 'open').length} Open</div>
                  </div>
              </button>
           </div>
        </aside>

        {/* Center Content (Feed) */}
        <main className="flex-1 min-w-0 flex flex-col">
          {renderContent()}
          
          {/* Footer Disclaimer */}
          <div className="mt-8 mb-4 border-t border-slate-200 dark:border-slate-800 pt-6 text-center">
             <div className="flex items-center justify-center gap-2 text-emerald-500/50 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-mono tracking-widest uppercase">Engine Status: Online</span>
                <span className="text-[10px] text-slate-500 font-mono">|</span>
                <span className="text-[10px] font-mono tracking-widest uppercase">Latency: 14ms</span>
             </div>
             <p className="text-[10px] text-slate-400 dark:text-slate-600 max-w-xl mx-auto leading-relaxed">
               BetPulse AI is a concept simulation engine powered by Google Gemini. No real currency is wagered or won. 
               Data provided for demonstration purposes only. This application is a high-fidelity tech demo.
             </p>
          </div>
        </main>

        {/* Right Sidebar (Betslip) - Only show on Sports view */}
        <div className={`hidden md:block w-80 shrink-0 ${!isSportsView ? 'hidden' : ''}`}>
          <div className="sticky top-24">
            <Betslip 
                selections={selections} 
                onRemove={removeSelection} 
                onClear={() => setSelections([])}
                isOpenMobile={isMobileBetslipOpen}
                setIsOpenMobile={setIsMobileBetslipOpen}
                onPlaceBet={handlePlaceBet}
                defaultStake={settings.defaultStake}
                currencySymbol={currencySymbol}
            />
          </div>
        </div>
        
        {/* Helper column for Jackpot/MyBets/Casino View to balance layout if needed */}
        {!isSportsView && <div className="hidden md:block w-80 shrink-0"></div>}

      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 z-30 pb-safe transition-colors duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => { setCurrentView('sports'); setFilter('all'); }} 
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'sports' && filter === 'all' ? 'text-emerald-500 -translate-y-1' : 'text-slate-400 dark:text-slate-500'}`}
        >
           <Home size={20} strokeWidth={currentView === 'sports' && filter === 'all' ? 2.5 : 2} />
           <span className="text-[10px] font-medium">Home</span>
        </button>
        <button 
          onClick={() => { setCurrentView('sports'); setFilter('live'); }} 
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'sports' && filter === 'live' ? 'text-emerald-500 -translate-y-1' : 'text-slate-400 dark:text-slate-500'}`}
        >
           <div className="relative">
              <Calendar size={20} strokeWidth={currentView === 'sports' && filter === 'live' ? 2.5 : 2} />
              {matches.some(m => m.isLive) && (
                 <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-slate-900"></span>
              )}
           </div>
           <span className="text-[10px] font-medium">Live</span>
        </button>
         <button 
           onClick={() => setCurrentView('casino')}
           className={`flex flex-col items-center gap-1 relative ${currentView === 'casino' ? 'text-purple-500 -translate-y-1' : 'text-slate-400 dark:text-slate-500 hover:text-purple-400'}`}
         >
           <div className={`absolute -top-8 rounded-full p-3 shadow-lg border-4 border-slate-100 dark:border-slate-950 transition-all ${currentView === 'casino' ? 'bg-purple-600 shadow-purple-500/40 scale-110' : 'bg-slate-700 shadow-slate-900/20'}`}>
             <Dices size={24} className="text-white" />
           </div>
           <span className="text-[10px] font-medium mt-6">Casino</span>
        </button>
        <button 
           onClick={() => setCurrentView('my-bets')}
           className={`flex flex-col items-center gap-1 transition-all ${currentView === 'my-bets' ? 'text-emerald-500 -translate-y-1' : 'text-slate-400 dark:text-slate-500'}`}
        >
           <PieChart size={20} strokeWidth={currentView === 'my-bets' ? 2.5 : 2} />
           <span className="text-[10px] font-medium">My Bets</span>
        </button>
        <button 
           onClick={() => setIsMenuOpen(true)}
           className={`flex flex-col items-center gap-1 transition-all ${isMenuOpen ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}
        >
           <MenuSquare size={20} strokeWidth={isMenuOpen ? 2.5 : 2} />
           <span className="text-[10px] font-medium">Menu</span>
        </button>
      </nav>

      {/* Mobile Betslip Drawer (Rendered at root for portal-like effect) - Only show if in Sports view */}
      {isSportsView && (
        <Betslip 
          selections={selections} 
          onRemove={removeSelection} 
          onClear={() => setSelections([])}
          isOpenMobile={isMobileBetslipOpen}
          setIsOpenMobile={setIsMobileBetslipOpen}
          onPlaceBet={handlePlaceBet}
          defaultStake={settings.defaultStake}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
};

export default App;
