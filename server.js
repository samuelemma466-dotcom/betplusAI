
const express = require('express');
const path = require('path');
const axios = require('axios');
const admin = require('firebase-admin');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// --- CONFIGURATION ---
const API_KEY = 'c99171a5658ec12d1ff0e76b772e7275'; // API-Sports Key
const FIREBASE_DB_URL = "https://betplusai-default-rtdb.firebaseio.com/";
const SERVICE_ACCOUNT_PATH = '/etc/secrets/serviceAccountKey.json';

// --- 1. FIREBASE ADMIN INIT ---
let db = null;

if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  try {
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: FIREBASE_DB_URL
    });
    db = admin.database();
    console.log("✅ Firebase Admin Initialized");
    
    // Start the Sync Loop immediately
    startLiveScoreSync();
  } catch (error) {
    console.error("❌ Firebase Admin Init Error:", error);
  }
} else {
  console.warn(`⚠️ Service Account not found at ${SERVICE_ACCOUNT_PATH}. Backend sync disabled.`);
}

// --- 2. EXPRESS STATIC SERVING (SPA) ---
// Serve static files from the 'dist' directory
// We use path.resolve to ensure absolute paths on Render's filesystem
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// THE FIX: Catch-all route for React Router
// This ensures that when you refresh on a route like /profile, 
// the server sends index.html instead of a 404.
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// --- 3. LIVE SCORE SYNC ENGINE ---

function startLiveScoreSync() {
  console.log("🔄 Starting Live Score Sync Engine...");
  syncLiveScores(); // Run immediately
  setInterval(syncLiveScores, 60000); // Run every 60s
}

async function syncLiveScores() {
  if (!db) return;

  try {
    console.log(`[${new Date().toISOString()}] Fetching live scores...`);
    const response = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: { 
        'x-apisports-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      },
      timeout: 10000
    });

    const matches = response.data.response;
    if (!matches || matches.length === 0) {
      console.log("No live matches found.");
      return;
    }

    const updates = {};
    
    matches.forEach(item => {
      // Transform raw API data to our App's Match Schema
      const matchData = transformFixtureToMatch(item);
      if (matchData) {
        // Write to 'matches' node so the frontend listener picks it up
        updates[`matches/${matchData.id}`] = matchData;
      }
    });

    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      console.log(`✅ Synced ${Object.keys(updates).length} live matches to Firebase.`);
    }

  } catch (error) {
    console.error("❌ Error fetching/syncing scores:", error.message);
  }
}

// --- HELPER: DATA TRANSFORMATION ---
function transformFixtureToMatch(data) {
  try {
    const { fixture, teams, goals, league } = data;
    if (!fixture || !teams) return null;

    const id = `api_${fixture.id}`;
    const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(fixture.status?.short);
    
    // Generate odds (simulated for the backend)
    const odds = generateSimulatedOdds(fixture.id, isLive);

    return {
      id: id,
      sport: 'Soccer',
      league: league?.name || 'Unknown League',
      startTime: fixture.date, // ISO String
      isLive: isLive,
      minute: fixture.status?.elapsed || 0,
      homeTeam: {
        name: teams.home?.name || 'Home Team',
        logo: teams.home?.logo || ''
      },
      awayTeam: {
        name: teams.away?.name || 'Away Team',
        logo: teams.away?.logo || ''
      },
      scores: {
        home: goals?.home ?? 0,
        away: goals?.away ?? 0
      },
      hasStream: false,
      odds: odds,
      lastUpdated: new Date().toISOString()
    };
  } catch (e) {
    return null;
  }
}

// --- HELPER: ODDS GENERATION ---
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

function generateSimulatedOdds(fixtureId, isLive) {
    let r1 = seededRandom(fixtureId);
    let r2 = seededRandom(fixtureId + 1);
    
    if (isLive) {
        // Time-based drift for live games
        const timeStep = Math.floor(Date.now() / 5000); 
        const drift = Math.sin(timeStep + fixtureId) * 0.05; 
        r1 = r1 + drift;
        r2 = r2 - (drift * 0.5);
    }
    
    const prob1 = Math.max(0.1, Math.min(0.9, 0.2 + (Math.abs(r1) * 0.6))); 
    const probX = Math.max(0.1, Math.min(0.4, 0.15 + (Math.abs(r2) * 0.2)));
    const prob2 = Math.max(0.05, 1 - prob1 - probX);

    const margin = 1.08;
    const odd1 = (1 / prob1) / margin;
    const oddX = (1 / probX) / margin;
    const odd2 = (1 / prob2) / margin;

    return {
        main: [
            { id: `odd-${fixtureId}-1`, label: '1', value: parseFloat(odd1.toFixed(2)), marketType: '1x2' },
            { id: `odd-${fixtureId}-x`, label: 'X', value: parseFloat(oddX.toFixed(2)), marketType: '1x2' },
            { id: `odd-${fixtureId}-2`, label: '2', value: parseFloat(odd2.toFixed(2)), marketType: '1x2' },
        ],
        secondary: [
            { id: `odd-${fixtureId}-o`, label: 'Over 2.5', value: parseFloat((1.75 + (r1 * 0.4)).toFixed(2)), marketType: 'OverUnder' },
            { id: `odd-${fixtureId}-u`, label: 'Under 2.5', value: parseFloat((1.75 + (r2 * 0.4)).toFixed(2)), marketType: 'OverUnder' },
        ]
    };
}
