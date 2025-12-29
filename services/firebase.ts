
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getDatabase, ref, get, set, update } from "firebase/database";
import { MOCK_MATCHES } from "../constants";

const firebaseConfig = {
  apiKey: "AIzaSyAkg3Pj0wPgK3G-qdLSVHOgk2n_4GRjWOw",
  authDomain: "betplusai.firebaseapp.com",
  databaseURL: "https://betplusai-default-rtdb.firebaseio.com",
  projectId: "betplusai",
  storageBucket: "betplusai.firebasestorage.app",
  messagingSenderId: "236151382844",
  appId: "1:236151382844:web:bab19231cb42dff61b3439",
  measurementId: "G-TBHYTSS1R9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

setPersistence(auth, browserLocalPersistence).catch(console.error);

// EXPERT CASINO REGISTRY SEED (ILOT/LiveScore Style Structure)
const INITIAL_CASINO_GAMES = {
  // --- CRASH / INSTANT ---
  'aviator': { id: 'aviator', name: "Aviator", provider: "Spribe", category: "Crash", image: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=600&auto=format&fit=crop", color: "bg-red-600", hot: true, minBet: 10, rtp: "97.0%", isLive: true, players: 4205, status: 'online' },
  'mines': { id: 'mines', name: "Mines", provider: "NXB Originals", category: "Arcade", image: "https://images.unsplash.com/photo-1611416517780-eff3a13b0359?q=80&w=600&auto=format&fit=crop", color: "bg-emerald-600", hot: true, minBet: 50, rtp: "99.0%", isLive: false, status: 'online' },
  'spaceman': { id: 'spaceman', name: "Spaceman", provider: "Pragmatic Play", category: "Crash", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop", color: "bg-purple-600", hot: false, minBet: 20, rtp: "96.5%", isLive: true, players: 1200, status: 'online' },
  
  // --- LIVE CASINO ---
  'live_ro_1': { id: 'live_ro_1', name: "Lightning Roulette", provider: "Evolution", category: "Live Casino", image: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=600&auto=format&fit=crop", color: "bg-yellow-600", hot: true, rtp: "97.3%", isLive: true, dealer: "Marcus", players: 842, status: 'online' },
  'live_bj_1': { id: 'live_bj_1', name: "Blackjack Platinum", provider: "Evolution", category: "Live Casino", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop", color: "bg-slate-900", hot: false, rtp: "99.5%", isLive: true, dealer: "Svetlana", players: 42, status: 'online' },
  'live_crazy': { id: 'live_crazy', name: "Crazy Time", provider: "Evolution", category: "Live Casino", image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop", color: "bg-pink-600", hot: true, rtp: "96.0%", isLive: true, dealer: "Jace", players: 15400, status: 'online' },

  // --- SLOTS ---
  'slots_go': { id: 'slots_go', name: "Gates of Olympus", provider: "Pragmatic Play", category: "Slots", image: "https://images.unsplash.com/photo-1569705460063-0030d5258830?q=80&w=600&auto=format&fit=crop", color: "bg-purple-600", hot: true, minBet: 20, rtp: "96.5%", isLive: false, status: 'online' },
  'slots_sb': { id: 'slots_sb', name: "Sweet Bonanza", provider: "Pragmatic Play", category: "Slots", image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=600&auto=format&fit=crop", color: "bg-pink-500", hot: true, minBet: 20, rtp: "96.5%", isLive: false, status: 'online' },
  'slots_star': { id: 'slots_star', name: "Starburst", provider: "NetEnt", category: "Slots", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop", color: "bg-indigo-500", hot: false, minBet: 10, rtp: "96.1%", isLive: false, status: 'online' },
  'slots_book': { id: 'slots_book', name: "Book of Dead", provider: "Play'n GO", category: "Slots", image: "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?q=80&w=600&auto=format&fit=crop", color: "bg-amber-700", hot: true, minBet: 10, rtp: "96.2%", isLive: false, status: 'online' },
  'slots_wolf': { id: 'slots_wolf', name: "Wolf Gold", provider: "Pragmatic Play", category: "Slots", image: "https://images.unsplash.com/photo-1596727147705-54a9d0b63dde?q=80&w=600&auto=format&fit=crop", color: "bg-blue-600", hot: false, minBet: 25, rtp: "96.0%", isLive: false, status: 'online' },

  // --- ARCADE / TABLE ---
  'arcade_plinko': { id: 'arcade_plinko', name: "Plinko X", provider: "SmartSoft", category: "Arcade", image: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600&auto=format&fit=crop", color: "bg-indigo-600", hot: true, minBet: 10, rtp: "98.0%", isLive: false, status: 'online' },
  'table_baccarat': { id: 'table_baccarat', name: "Speed Baccarat", provider: "Evolution", category: "Table Games", image: "https://images.unsplash.com/photo-1596838132731-dd96045c5869?q=80&w=600&auto=format&fit=crop", color: "bg-red-800", hot: false, minBet: 100, rtp: "98.9%", isLive: true, players: 302, status: 'online' },
};

export const seedDatabase = async () => {
  try {
    // 1. Seed Sports
    const matchesRef = ref(db, 'matches');
    const matchesSnap = await get(matchesRef);
    if (!matchesSnap.exists()) {
      const matchesObj = MOCK_MATCHES.reduce((acc, m) => ({...acc, [m.id]: {...m, startTime: m.startTime.toISOString()}}), {});
      await set(matchesRef, matchesObj);
    }

    // 2. Seed Casino
    const casinoRef = ref(db, 'casino/games');
    const casinoSnap = await get(casinoRef);
    if (!casinoSnap.exists()) {
      await set(casinoRef, INITIAL_CASINO_GAMES);
    }

    // 3. Live Player Simulation (Runs once per session to keep DB alive)
    simulateLiveActivity();
    
  } catch (error) {
    console.warn("Database seeding failed:", error);
  }
};

const simulateLiveActivity = () => {
  setInterval(async () => {
    try {
      const liveGames = ['live_bj_1', 'live_ro_1', 'aviator', 'live_crazy'];
      const randomGame = liveGames[Math.floor(Math.random() * liveGames.length)];
      const gameRef = ref(db, `casino/games/${randomGame}/players`);
      const snap = await get(gameRef);
      if (snap.exists()) {
        const current = snap.val() || 0;
        const drift = Math.floor(Math.random() * 20) - 10; // -10 to +10
        await update(ref(db, `casino/games/${randomGame}`), { players: Math.max(50, current + drift) });
      }
    } catch (e) {}
  }, 5000);
};
