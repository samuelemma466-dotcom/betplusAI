
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
  // --- 5 ESSENTIAL LIVE GAMES ---
  'live_roulette_euro': { 
      id: 'live_roulette_euro', 
      name: "European Live Roulette", 
      provider: "Evolution", 
      category: "Live Casino", 
      image: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=800&auto=format&fit=crop", 
      color: "bg-red-900", 
      hot: true, 
      minBet: 100, 
      rtp: "97.30%", 
      isLive: true, 
      dealer: "Sarah", 
      players: 1543, 
      status: 'online' 
  },
  'live_bj_infinite': { 
      id: 'live_bj_infinite', 
      name: "Infinite Blackjack", 
      provider: "Evolution", 
      category: "Live Casino", 
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop", 
      color: "bg-slate-900", 
      hot: true, 
      minBet: 500, 
      rtp: "99.47%", 
      isLive: true, 
      dealer: "David", 
      players: 892, 
      status: 'online' 
  },
  'live_baccarat_speed': { 
      id: 'live_baccarat_speed', 
      name: "Speed Baccarat", 
      provider: "Pragmatic Play", 
      category: "Live Casino", 
      image: "https://images.unsplash.com/photo-1596838132731-dd96045c5869?q=80&w=800&auto=format&fit=crop", 
      color: "bg-yellow-800", 
      hot: false, 
      minBet: 200, 
      rtp: "98.94%", 
      isLive: true, 
      dealer: "Lin", 
      players: 2405, 
      status: 'online' 
  },
  'live_crazy_time': { 
      id: 'live_crazy_time', 
      name: "Crazy Time", 
      provider: "Evolution", 
      category: "Game Shows", 
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop", 
      color: "bg-pink-600", 
      hot: true, 
      minBet: 50, 
      rtp: "96.08%", 
      isLive: true, 
      dealer: "Victor", 
      players: 12500, 
      status: 'online' 
  },
  'live_dragon_tiger': { 
      id: 'live_dragon_tiger', 
      name: "Dragon Tiger", 
      provider: "Evolution", 
      category: "Live Casino", 
      image: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=800&auto=format&fit=crop", 
      color: "bg-orange-800", 
      hot: false, 
      minBet: 100, 
      rtp: "96.27%", 
      isLive: true, 
      dealer: "Elena", 
      players: 670, 
      status: 'online' 
  },

  // --- CRASH / INSTANT ---
  'aviator': { id: 'aviator', name: "Aviator", provider: "Spribe", category: "Crash", image: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=600&auto=format&fit=crop", color: "bg-red-600", hot: true, minBet: 10, rtp: "97.0%", isLive: true, players: 4205, status: 'online' },
  'mines': { id: 'mines', name: "Mines", provider: "NXB Originals", category: "Arcade", image: "https://images.unsplash.com/photo-1611416517780-eff3a13b0359?q=80&w=600&auto=format&fit=crop", color: "bg-emerald-600", hot: true, minBet: 50, rtp: "99.0%", isLive: false, status: 'online' },
  'spaceman': { id: 'spaceman', name: "Spaceman", provider: "Pragmatic Play", category: "Crash", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop", color: "bg-purple-600", hot: false, minBet: 20, rtp: "96.5%", isLive: true, players: 1200, status: 'online' },

  // --- SLOTS ---
  'slots_go': { id: 'slots_go', name: "Gates of Olympus", provider: "Pragmatic Play", category: "Slots", image: "https://images.unsplash.com/photo-1569705460063-0030d5258830?q=80&w=600&auto=format&fit=crop", color: "bg-purple-600", hot: true, minBet: 20, rtp: "96.5%", isLive: false, status: 'online' },
  'slots_sb': { id: 'slots_sb', name: "Sweet Bonanza", provider: "Pragmatic Play", category: "Slots", image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=600&auto=format&fit=crop", color: "bg-pink-500", hot: true, minBet: 20, rtp: "96.5%", isLive: false, status: 'online' },
  'slots_star': { id: 'slots_star', name: "Starburst", provider: "NetEnt", category: "Slots", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop", color: "bg-indigo-500", hot: false, minBet: 10, rtp: "96.1%", isLive: false, status: 'online' },
};

// --- AFCON / YOUTUBE STREAMS SEED ---
const STREAM_MATCHES = {
  'afcon_1': {
    id: 'afcon_1',
    sport: 'Soccer',
    league: 'AFCON 2025',
    startTime: new Date().toISOString(), // NOW
    isLive: true,
    hasStream: true,
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder/Generic Live URL
    minute: 23,
    homeTeam: { name: 'Zimbabwe', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/320px-Flag_of_Zimbabwe.svg.png' },
    awayTeam: { name: 'South Africa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Flag_of_South_Africa.svg/320px-Flag_of_South_Africa.svg.png' },
    scores: { home: 1, away: 0 },
    odds: {
      main: [
        { id: 'afcon1-1', label: '1', value: 1.85, marketType: '1x2' },
        { id: 'afcon1-x', label: 'X', value: 3.20, marketType: '1x2' },
        { id: 'afcon1-2', label: '2', value: 4.10, marketType: '1x2' },
      ],
      secondary: []
    }
  },
  'afcon_2': {
    id: 'afcon_2',
    sport: 'Soccer',
    league: 'AFCON 2025',
    startTime: new Date().toISOString(), // NOW
    isLive: true,
    hasStream: true,
    streamUrl: 'https://www.youtube.com/watch?v=video_id_placeholder',
    minute: 67,
    homeTeam: { name: 'Comoros', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Flag_of_the_Comoros.svg/320px-Flag_of_the_Comoros.svg.png' },
    awayTeam: { name: 'Mali', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_Mali.svg/320px-Flag_of_Mali.svg.png' },
    scores: { home: 0, away: 2 },
    odds: {
      main: [
        { id: 'afcon2-1', label: '1', value: 5.50, marketType: '1x2' },
        { id: 'afcon2-x', label: 'X', value: 3.40, marketType: '1x2' },
        { id: 'afcon2-2', label: '2', value: 1.55, marketType: '1x2' },
      ],
      secondary: []
    }
  },
  'saudi_1': {
    id: 'saudi_1',
    sport: 'Soccer',
    league: 'Saudi Pro League',
    startTime: new Date().toISOString(),
    isLive: true,
    hasStream: true,
    streamUrl: 'https://www.youtube.com/watch?v=saudi_stream', 
    minute: 45,
    homeTeam: { name: 'Al Nassr', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c5/Al_Nassr_FC_Logo.svg' },
    awayTeam: { name: 'Al Hilal', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/Al_Hilal_SFC_Logo.svg/1200px-Al_Hilal_SFC_Logo.svg.png' },
    scores: { home: 2, away: 2 },
    odds: {
      main: [
        { id: 'saudi1-1', label: '1', value: 2.10, marketType: '1x2' },
        { id: 'saudi1-x', label: 'X', value: 3.50, marketType: '1x2' },
        { id: 'saudi1-2', label: '2', value: 2.90, marketType: '1x2' },
      ],
      secondary: []
    }
  }
};

export const seedDatabase = async () => {
  try {
    // 1. Seed Sports (Merged with Stream Matches)
    const matchesRef = ref(db, 'matches');
    const matchesSnap = await get(matchesRef);
    if (!matchesSnap.exists()) {
      const existingMocks = MOCK_MATCHES.reduce((acc, m) => ({...acc, [m.id]: {...m, startTime: m.startTime.toISOString()}}), {});
      const allMatches = { ...existingMocks, ...STREAM_MATCHES };
      await set(matchesRef, allMatches);
    } else {
       // Update with stream matches to ensure they appear
       await update(matchesRef, STREAM_MATCHES);
    }

    // 2. Seed Casino - ALWAYS UPDATE to ensure new games are present
    const casinoRef = ref(db, 'casino/games');
    // For this update, we force set to ensure new game data replaces old
    await set(casinoRef, INITIAL_CASINO_GAMES);

    // 3. Live Player Simulation (Runs once per session to keep DB alive)
    simulateLiveActivity();
    
  } catch (error) {
    console.warn("Database seeding failed:", error);
  }
};

const simulateLiveActivity = () => {
  setInterval(async () => {
    try {
      const liveGames = ['live_bj_infinite', 'live_roulette_euro', 'aviator', 'live_crazy_time'];
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
