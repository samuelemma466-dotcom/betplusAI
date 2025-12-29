
import { Match, Odd } from '../types';

const API_KEY = 'c99171a5658ec12d1ff0e76b772e7275'; // Provided Key
const BASE_URL = 'https://v3.football.api-sports.io';

const HEADERS = {
  'x-rapidapi-host': 'v3.football.api-sports.io',
  'x-apisports-key': API_KEY
};

// Priority League IDs to ensure quality content
const PRIORITY_LEAGUES = [39, 140, 135, 78, 61, 2, 3, 848, 1, 274, 279];

// Deterministic random number generator based on seed
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

// Simulate odds since the free API tier might not provide them reliably for all fixtures
// Enhanced: Accepts isLive param to introduce drift over time for live matches
const generateSimulatedOdds = (fixtureId: number, isLive: boolean): { main: Odd[], secondary: Odd[] } => {
    let r1 = seededRandom(fixtureId);
    let r2 = seededRandom(fixtureId + 1);
    
    // For live matches, introduce volatility based on time
    if (isLive) {
        // Use Date.now() but stepped every 5 seconds to match polling, scaled down
        const timeStep = Math.floor(Date.now() / 5000); 
        // Create a drift factor that oscillates slightly
        const drift = Math.sin(timeStep + fixtureId) * 0.05; 
        
        // Apply drift
        r1 = r1 + drift;
        // Inverse drift for the other side slightly
        r2 = r2 - (drift * 0.5);
    }
    
    // Clamp values to sane probabilities (0.1 to 0.9)
    const prob1 = Math.max(0.1, Math.min(0.9, 0.2 + (Math.abs(r1) * 0.6))); 
    const probX = Math.max(0.1, Math.min(0.4, 0.15 + (Math.abs(r2) * 0.2)));
    const prob2 = Math.max(0.05, 1 - prob1 - probX); // Remainder

    // Convert probability to Decimal Odds (plus a small house edge margin)
    // Margin approx 1.05 to 1.10
    const margin = 1.08;
    const odd1 = (1 / prob1) / margin; // e.g. 1/0.5 = 2.0 -> 1.85
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
};

const transformFixtureToMatch = (data: any): Match => {
    try {
        const { fixture, teams, goals, league } = data;
        if (!fixture || !teams) return null as any;

        // Determine status
        const liveStatus = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'];
        const isLive = liveStatus.includes(fixture.status?.short);

        const odds = generateSimulatedOdds(fixture.id, isLive);

        return {
            id: `api_${fixture.id}`,
            sport: 'Soccer',
            league: league?.name || 'Unknown League',
            startTime: new Date(fixture.date),
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
            stats: [], 
            odds: odds,
            hasStream: false 
        };
    } catch (e) {
        console.warn("Error transforming fixture", e);
        return null as any;
    }
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

export const fetchFootballMatches = async (): Promise<Match[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Parallel fetch: Live matches (fast) and Today's Schedule (large)
    const [liveResponse, scheduledResponse] = await Promise.all([
        fetchWithTimeout(`${BASE_URL}/fixtures?live=all`, { method: 'GET', headers: HEADERS }).catch(e => null),
        fetchWithTimeout(`${BASE_URL}/fixtures?date=${today}`, { method: 'GET', headers: HEADERS }).catch(e => null)
    ]);
    
    let matchesMap = new Map<number, Match>();

    // 1. Process Scheduled Matches (Filtered)
    if (scheduledResponse && scheduledResponse.ok) {
        const scheduledData = await scheduledResponse.json();
        
        if (scheduledData && Array.isArray(scheduledData.response)) {
            // Filter Logic: Prioritize major leagues
            let filteredRaw = scheduledData.response.filter((item: any) => 
                item?.league?.id && PRIORITY_LEAGUES.includes(item.league.id)
            );

            // Fallback if no major league games
            if (filteredRaw.length < 5) {
                filteredRaw = scheduledData.response.slice(0, 30);
            } else {
                filteredRaw = filteredRaw.slice(0, 50);
            }

            filteredRaw.forEach((item: any) => {
                const match = transformFixtureToMatch(item);
                if (match) matchesMap.set(item.fixture.id, match);
            });
        }
    }

    // 2. Process Live Matches (Always include all live games, overwriting scheduled)
    if (liveResponse && liveResponse.ok) {
        const liveData = await liveResponse.json();
        if (liveData && Array.isArray(liveData.response)) {
            liveData.response.forEach((item: any) => {
                const match = transformFixtureToMatch(item);
                if (match) matchesMap.set(item.fixture.id, match);
            });
        }
    }

    // Convert Map to Array
    const allMatches = Array.from(matchesMap.values());

    // Sort: Live first, then by time
    return allMatches.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return a.startTime.getTime() - b.startTime.getTime();
    });

  } catch (error) {
    console.error("Failed to fetch football matches:", error);
    return [];
  }
};
