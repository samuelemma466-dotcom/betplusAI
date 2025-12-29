import React, { useState, useEffect } from 'react';
import { SPORTS } from './constants';
import { BetSelection, SportCategory, Match, PlacedBet, AppView, AppSettings, Transaction, UserProfile } from './types';
import MatchCard from './components/MatchCard';
import Betslip from './components/Betslip';
import JackpotGame from './components/JackpotGame';
import CasinoGame from './components/CasinoGame';
import MyBets from './components/MyBets';
import MenuDrawer from './components/MenuDrawer';
import SportsView from './components/SportsView'; 
import AiConcierge from './components/AiConcierge';
import GlobalWinFeed from './components/GlobalWinFeed';
import { AuthScreen } from './components/AuthScreen';
import { SecurityCenter } from './components/SecurityCenter';
import { Confetti, CountUp } from './components/UiEffects';
import { DepositView, WithdrawView, ProfileView, TransactionsView, HelpView, ResponsibleGamingView, SettingsView, VerificationView, BonusView, getCurrencySymbol } from './components/AccountViews';
import { Menu, Sparkles, Dices, Home, PieChart, MenuSquare } from 'lucide-react';

// Firebase Imports
import { auth, db, seedDatabase } from './services/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { ref, onValue, set, push, get, update } from 'firebase/database';

// API Imports
import { fetchFootballMatches } from './services/footballApi';

interface WalletState {
  main: number;
  bonus: number;
}

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // Start true to block UI until Firebase replies
  const [needsVerification, setNeedsVerification] = useState(false);
  
  // --- APP STATE ---
  const [activeCategory, setActiveCategory] = useState<SportCategory>('Soccer');
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [isMobileBetslipOpen, setIsMobileBetslipOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [currentView, setCurrentView] = useState<AppView>('sports');
  const [myBets, setMyBets] = useState<PlacedBet[]>([]);
  
  const [wallet, setWallet] = useState<WalletState>({ main: 0, bonus: 0 });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Player',
    email: '',
    phone: '',
    avatar: 'PL',
    id: '',
    level: 1,
    joinDate: new Date().getFullYear().toString()
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
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
  const [firebaseMatches, setFirebaseMatches] = useState<Match[]>([]);
  const [apiMatches, setApiMatches] = useState<Match[]>([]);
  const matches = [...apiMatches, ...firebaseMatches];
  const [matchesLoading, setMatchesLoading] = useState(true); // Loading state for matches

  // --- AUTH INITIALIZATION ---
  useEffect(() => {
    // This listener handles session restoration automatically
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in (session restored)
        setCurrentUser(user);
        
        if (user.emailVerified) {
          setIsAuthenticated(true);
          setNeedsVerification(false);
          
          // Hydrate User Profile
          setUserProfile(prev => ({
              ...prev,
              name: user.displayName || user.email?.split('@')[0] || 'Player',
              email: user.email || '',
              id: user.uid,
              avatar: (user.email?.[0] || 'P').toUpperCase()
          }));

          // Initialize Database Listeners for this user
          initUserData(user.uid);
        } else {
          // Logged in but not verified
          setIsAuthenticated(false);
          setNeedsVerification(true);
        }
      } else {
        // User is logged out
        setCurrentUser(null);
        setIsAuthenticated(false);
        setNeedsVerification(false);
      }
      setAuthLoading(false); // Stop loading screen once Firebase responds
    });

    // Global Data Seeding (Runs once)
    seedDatabase();
    
    // Global Match Listeners (Firebase)
    const matchesRef = ref(db, 'matches');
    onValue(matchesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setFirebaseMatches(Object.values(data).map((m: any) => ({ 
                ...m, 
                startTime: new Date(m.startTime) 
            })));
        }
    });

    return () => unsubscribeAuth();
  }, []);

  // --- REAL-TIME API POLLING ---
  useEffect(() => {
    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout>;

    const loadRealtimeMatches = async () => {
        try {
            const data = await fetchFootballMatches();
            if (isMounted) {
                setApiMatches(data);
                setMatchesLoading(false); // Stop skeleton after first load
            }
        } catch (err) {
            console.error("Poll Error:", err);
            if (isMounted) setMatchesLoading(false);
        } finally {
            if (isMounted) {
                // Recursive polling every 5 seconds for live updates
                // This ensures we get new scores and drifting odds without overlapping requests
                timerId = setTimeout(loadRealtimeMatches, 5000); 
            }
        }
    };

    loadRealtimeMatches();

    return () => {
        isMounted = false;
        clearTimeout(timerId);
    };
  }, []);

  const initUserData = async (uid: string) => {
      // Wallet Listener
      const walletRef = ref(db, `users/${uid}/wallet`);
      const walletSnap = await get(walletRef);
      if (!walletSnap.exists()) {
          // New User Bonus
          await set(walletRef, { main: 1000, bonus: 0 }); 
      }
      onValue(walletRef, (snapshot) => {
          const val = snapshot.val();
          if (val) setWallet({ main: Number(val.main || 0), bonus: Number(val.bonus || 0) });
      });

      // Bets Listener
      onValue(ref(db, `bets/${uid}`), (snapshot) => {
          const data = snapshot.val();
          if (data) {
              const betsArray = Object.keys(data)
                  .map(k => ({ ...data[k], id: k }))
                  .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
              setMyBets(betsArray);
          }
      });

      // Transactions Listener
      onValue(ref(db, `transactions/${uid}`), (snapshot) => {
          const data = snapshot.val();
          if (data) {
              const txArray = Object.keys(data)
                  .map(k => ({ ...data[k], id: k }))
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              setTransactions(txArray);
          }
      });
  };

  // --- THEME EFFECT ---
  useEffect(() => {
    if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.theme]);

  // --- ACTIONS ---
  const handleLogout = () => {
    signOut(auth).then(() => {
        setIsMenuOpen(false);
        setCurrentView('sports');
        setSelections([]);
    });
  };

  const triggerWin = async (amount: number, gameName: string = "Casino") => {
    setShowConfetti(true);
    if (currentUser) {
       // Optimistic update done by listener, but we trigger the write
       const newBalance = wallet.main + amount;
       await update(ref(db, `users/${currentUser.uid}/wallet`), { main: newBalance });
       
       const txRef = push(ref(db, `transactions/${currentUser.uid}`));
       await set(txRef, { 
           id: txRef.key, 
           type: 'Bet Win', 
           method: gameName, 
           amount: amount, 
           date: new Date().toISOString(), 
           status: 'Success' 
       });

       // Global Feed
       push(ref(db, 'global_wins'), { 
           id: Date.now().toString(), 
           user: userProfile.name, 
           amount, 
           game: gameName, 
           timestamp: Date.now() 
       });
    }
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handlePlaceBet = async (bet: PlacedBet) => {
    if (!currentUser) return;
    if (wallet.main < bet.stake) {
        alert("Insufficient funds!");
        return;
    }
    try {
       await update(ref(db, `users/${currentUser.uid}/wallet`), { main: wallet.main - bet.stake });
       const betRef = push(ref(db, `bets/${currentUser.uid}`));
       await set(betRef, bet);
       
       const txRef = push(ref(db, `transactions/${currentUser.uid}`));
       await set(txRef, { 
           type: 'Bet Placement', 
           amount: bet.stake, 
           date: new Date().toISOString(), 
           status: 'Success',
           method: 'Sportsbook'
       });
    } catch (e) {
        console.error("Bet error", e);
    }
  };

  const handleOddClick = (selection: BetSelection) => {
    setSelections(prev => {
        // Toggle if exists
        if (prev.some(x => x.selectionId === selection.selectionId)) {
            return prev.filter(x => x.selectionId !== selection.selectionId);
        }
        // Remove if same match but different market (exclusive selection per match usually, but allowing multiples for builder)
        // For simplicity, let's allow multiple selections per match in this demo
        return [...prev, selection];
    });
  };

  // --- ROUTER ---
  const renderContent = () => {
    switch (currentView) {
      case 'casino': return <CasinoGame onWin={(amt) => triggerWin(amt, "Mines/Aviator")} />;
      case 'jackpot': return <JackpotGame />;
      case 'my-bets': return <MyBets bets={myBets} onCashOut={(id, amt) => triggerWin(amt, "Cash Out")} />;
      case 'deposit': return <DepositView onDeposit={(amt, meth) => update(ref(db, `users/${currentUser!.uid}/wallet`), { main: wallet.main + amt })} currencySymbol={currencySymbol} />;
      case 'withdraw': return <WithdrawView balance={wallet.main} onWithdraw={(amt) => update(ref(db, `users/${currentUser!.uid}/wallet`), { main: wallet.main - amt })} currencySymbol={currencySymbol} />;
      case 'profile': return <ProfileView onNavigate={setCurrentView} settings={settings} user={userProfile} onUpdateUser={setUserProfile} />;
      case 'transactions': return <TransactionsView transactions={transactions} currencySymbol={currencySymbol} />;
      case 'settings': return <SettingsView settings={settings} onUpdate={setSettings} />;
      case 'security': return <SecurityCenter />;
      case 'verification': return <VerificationView />;
      case 'bonuses': return <BonusView />;
      case 'help': return <HelpView />;
      case 'responsible-gaming': return <ResponsibleGamingView />;
      default: return (
        <SportsView 
            matches={matches} 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
            filter={filter} 
            setFilter={setFilter} 
            onOddClick={handleOddClick} 
            selectedOdds={selections.map(s => s.selectionId)} 
            isLoading={matchesLoading}
        />
      );
    }
  }

  // --- LOADING SCREEN ---
  if (authLoading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-500 p-6">
       <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-8"></div>
       <h2 className="text-xl font-black text-white mb-2 tracking-tight">Initializing NXB Engine</h2>
       <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Secure Connection...</p>
    </div>
  );

  // --- AUTH SCREEN ---
  if (!isAuthenticated) {
      return (
          <AuthScreen 
              onAuthenticated={() => setIsAuthenticated(true)} 
              initialPendingUser={needsVerification ? currentUser : null}
          />
      );
  }

  // --- MAIN APP ---
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans pb-20 md:pb-0">
      {showConfetti && <Confetti />}
      <AiConcierge isOpen={isConciergeOpen} onClose={() => setIsConciergeOpen(false)} />
      
      <MenuDrawer 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          onNavigate={v => { setCurrentView(v); setIsMenuOpen(false); }} 
          onLogout={handleLogout} 
          settings={settings} 
          onSettingsUpdate={setSettings} 
          user={userProfile} 
          balance={wallet.main} 
          bonus={wallet.bonus} 
          currencySymbol={currencySymbol} 
      />

      <div className="sticky top-0 z-40">
        <GlobalWinFeed />
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-slate-500"><Menu size={24} /></button>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => setCurrentView('sports')}>
                 <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center rotate-3 shadow-lg"><span className="font-black text-white text-lg italic">N</span></div>
                 <span className="text-xl font-bold dark:text-white hidden sm:block">NXB</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-2">
                 <span className="text-[10px] text-slate-500 uppercase font-bold">Balance</span>
                 <CountUp value={wallet.main} prefix={currencySymbol} className="text-emerald-500 font-bold font-mono text-lg" masked={settings.privacyMode} />
              </div>
              <button onClick={() => setIsConciergeOpen(true)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full hover:bg-emerald-500/20 transition-all border border-emerald-500/20 animate-pulse">
                <Sparkles size={20} />
              </button>
              <button onClick={() => setCurrentView('deposit')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-emerald-500/20">DEPOSIT</button>
            </div>
        </header>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row pt-6 px-0 sm:px-4 gap-6">
        <aside className="hidden md:block w-64 shrink-0 space-y-4 sticky top-32 h-[calc(100vh-10rem)]">
           <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <nav className="space-y-1">
                {SPORTS.map(s => (
                  <button key={s.id} onClick={() => { setActiveCategory(s.id); setCurrentView('sports'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeCategory === s.id && currentView === 'sports' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <span>{s.icon}</span><span className="font-medium text-sm">{s.name}</span>
                  </button>
                ))}
                <button onClick={() => setCurrentView('casino')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mt-4 ${currentView === 'casino' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                   <Dices size={18} /><span className="font-medium text-sm">Casino</span>
                </button>
              </nav>
           </div>
        </aside>

        <main className="flex-1 min-w-0">{renderContent()}</main>

        {currentView === 'sports' && (
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-32">
              <Betslip 
                selections={selections} 
                onRemove={(id) => setSelections(s => s.filter(x => x.selectionId !== id))} 
                onClear={() => setSelections([])} 
                isOpenMobile={isMobileBetslipOpen} 
                setIsOpenMobile={setIsMobileBetslipOpen} 
                onPlaceBet={handlePlaceBet} 
                defaultStake={settings.defaultStake} 
                currencySymbol={currencySymbol} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 z-30 shadow-lg safe-area-pb">
        <button onClick={() => setCurrentView('sports')} className={`flex flex-col items-center gap-1 ${currentView === 'sports' ? 'text-emerald-500' : 'text-slate-400'}`}><Home size={20}/><span className="text-[10px]">Home</span></button>
        <button onClick={() => setCurrentView('casino')} className={`flex flex-col items-center gap-1 ${currentView === 'casino' ? 'text-purple-500' : 'text-slate-400'}`}><Dices size={20}/><span className="text-[10px]">Casino</span></button>
        <button onClick={() => setCurrentView('my-bets')} className={`flex flex-col items-center gap-1 ${currentView === 'my-bets' ? 'text-emerald-500' : 'text-slate-400'}`}><PieChart size={20}/><span className="text-[10px]">My Bets</span></button>
        <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center gap-1 text-slate-400"><MenuSquare size={20}/><span className="text-[10px]">Menu</span></button>
      </nav>
    </div>
  );
};

export default App;