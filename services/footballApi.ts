
import { Match, Odd } from '../types';

const API_KEY = 'c99171a5658ec12d1ff0e76b772e7275'; // Provided Key
const BASE_URL = 'https://v3.football.api-sports.io';

const HEADERS = {
  'x-rapidapi-host': 'v3.football.api-sports.io',
  'x-apisports-key': API_KEY
};

// Priority League IDs to ensure quality content
// 39: Premier League, 140: La Liga, 135: Serie A, 78: Bundesliga, 61: Ligue 1
// 2: UCL, 3: Europa, 848: Conference, 1: World Cup, 274: NPFL (Nigeria), 279: KPL (Kenya)
const PRIORITY_LEAGUES = [39, 140, 135, 78, 61, 2, 3, 848, 1, 274, 279];

// Deterministic random number generator based on seed
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

// Simulate odds since the free API tier might not provide them reliably for all fixtures
const generateSimulatedOdds = (fixtureId: number): { main: Odd[], secondary: Odd[] } => {
    const r1 = seededRandom(fixtureId);
    const r2 = seededRandom(fixtureId + 1);
    
    // Simulate realistic 1x2 odds
    const home = 1.5 + (r1 * 3.0); // 1.5 to 4.5
    const draw = 2.5 + (r2 * 2.0); // 2.5 to 4.5
    const away = 1.5 + ((1-r1) * 3.0); // Inverse of home roughly

    return {
        main: [
            { id: `odd-${fixtureId}-1`, label: '1', value: parseFloat(home.toFixed(2)), marketType: '1x2' },
            { id: `odd-${fixtureId}-x`, label: 'X', value: parseFloat(draw.toFixed(2)), marketType: '1x2' },
            { id: `odd-${fixtureId}-2`, label: '2', value: parseFloat(away.toFixed(2)), marketType: '1x2' },
        ],
        secondary: [
            { id: `odd-${fixtureId}-o`, label: 'Over 2.5', value: 1.85, marketType: 'OverUnder' },
            { id: `odd-${fixtureId}-u`, label: 'Under 2.5', value: 1.95, marketType: 'OverUnder' },
        ]
    };
};

const transformFixtureToMatch = (data: any): Match => {
    try {
        const { fixture, teams, goals, league } = data;
        if (!fixture || !teams) return null as any;

        const odds = generateSimulatedOdds(fixture.id);

        // Determine status
        const liveStatus = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'];
        const isLive = liveStatus.includes(fixture.status?.short);

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
    // We catch errors individually to ensure one failure doesn't break everything
    // Added explicit timeout to prevent hanging
    const [liveResponse, scheduledResponse] = await Promise.all([
        fetchWithTimeout(`${BASE_URL}/fixtures?live=all`, { method: 'GET', headers: HEADERS }).catch(e => null),
        fetchWithTimeout(`${BASE_URL}/fixtures?date=${today}`, { method: 'GET', headers: HEADERS }).catch(e => null)
    ]);
    
    let matchesMap = new Map<number, Match>();

    // 1. Process Scheduled Matches (Filtered)
    if (scheduledResponse && scheduledResponse.ok) {
        const scheduledData = await scheduledResponse.json();
        
        // Robust check for array existence
        if (scheduledData && Array.isArray(scheduledData.response)) {
            // Filter Logic:
            // 1. Prioritize major leagues
            let filteredRaw = scheduledData.response.filter((item: any) => 
                item?.league?.id && PRIORITY_LEAGUES.includes(item.league.id)
            );

            // Fallback if no major league games today, pick top items to ensure content
            if (filteredRaw.length < 5) {
                filteredRaw = scheduledData.response.slice(0, 30);
            } else {
                // Limit to 50 to prevent UI lag
                filteredRaw = filteredRaw.slice(0, 50);
            }

            filteredRaw.forEach((item: any) => {
                const match = transformFixtureToMatch(item);
                if (match) matchesMap.set(item.fixture.id, match);
            });
        } else if (scheduledData.errors) {
            console.warn("API Error (Scheduled):", scheduledData.errors);
        }
    }

    // 2. Process Live Matches (Always include all live games)
    if (liveResponse && liveResponse.ok) {
        const liveData = await liveResponse.json();
        if (liveData && Array.isArray(liveData.response)) {
            liveData.response.forEach((item: any) => {
                // Overwrite scheduled entry with live data if it exists
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
    // Return empty array instead of crashing so app can load
    return [];
  }
};
