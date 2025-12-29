import { Match, SportCategory, JackpotMatch } from './types';

export const SPORTS: { id: SportCategory; icon: string; name: string }[] = [
  { id: 'Soccer', icon: '⚽', name: 'Soccer' },
  { id: 'Basketball', icon: '🏀', name: 'Basketball' },
  { id: 'Tennis', icon: '🎾', name: 'Tennis' },
  { id: 'Cricket', icon: '🏏', name: 'Cricket' },
  { id: 'Esports', icon: '🎮', name: 'Esports' },
];

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    sport: 'Soccer',
    league: 'Premier League',
    startTime: new Date(new Date().getTime() - 1000 * 60 * 34), // Started 34 mins ago
    isLive: true,
    hasStream: true,
    // Soccer Highlights (Generic/Embeddable)
    streamUrl: "https://www.youtube.com/embed/Yt-0jI8g1gM?autoplay=1&mute=1&controls=1", 
    minute: 34,
    homeTeam: { name: 'Manchester City', logo: 'https://crests.football-data.org/65.svg' },
    awayTeam: { name: 'Arsenal', logo: 'https://crests.football-data.org/57.svg' },
    scores: { home: 1, away: 1 },
    stats: [
      { label: 'Possession', home: 58, away: 42, type: 'percent' },
      { label: 'Shots on Target', home: 4, away: 2, type: 'count' },
      { label: 'Corners', home: 6, away: 3, type: 'count' },
      { label: 'Yellow Cards', home: 1, away: 2, type: 'count' }
    ],
    odds: {
      main: [
        { id: 'm1-1', label: '1', value: 2.50, originalValue: 2.10, isBoosted: true, marketType: '1x2' }, // Boosted
        { id: 'm1-x', label: 'X', value: 3.40, marketType: '1x2' },
        { id: 'm1-2', label: '2', value: 3.10, marketType: '1x2' },
      ],
      secondary: [
        { id: 'm1-o', label: 'Over 2.5', value: 1.85, marketType: 'OverUnder' },
        { id: 'm1-u', label: 'Under 2.5', value: 1.95, marketType: 'OverUnder' },
      ]
    }
  },
  {
    id: 'm_laliga_1',
    sport: 'Soccer',
    league: 'La Liga',
    startTime: new Date(new Date().getTime() - 1000 * 60 * 55), // Live
    isLive: true,
    hasStream: true,
    // Free Kicks Compilation
    streamUrl: "https://www.youtube.com/embed/HiY6jWd3GkU?autoplay=1&mute=1",
    minute: 55,
    homeTeam: { name: 'Real Madrid', logo: 'https://crests.football-data.org/86.svg' },
    awayTeam: { name: 'FC Barcelona', logo: 'https://crests.football-data.org/81.svg' },
    scores: { home: 2, away: 1 },
    stats: [
      { label: 'Possession', home: 48, away: 52, type: 'percent' },
      { label: 'Shots', home: 12, away: 10, type: 'count' },
      { label: 'Fouls', home: 8, away: 6, type: 'count' }
    ],
    odds: {
      main: [
        { id: 'rma-1', label: '1', value: 2.05, marketType: '1x2' },
        { id: 'rma-x', label: 'X', value: 3.60, marketType: '1x2' },
        { id: 'rma-2', label: '2', value: 3.40, marketType: '1x2' },
      ],
      secondary: [
        { id: 'rma-o', label: 'Over 3.5', value: 2.10, marketType: 'OverUnder' },
        { id: 'rma-u', label: 'Under 3.5', value: 1.65, marketType: 'OverUnder' },
      ]
    }
  },
  {
    id: 'm3',
    sport: 'Basketball',
    league: 'NBA',
    startTime: new Date(new Date().getTime() - 1000 * 60 * 45),
    isLive: true,
    hasStream: true,
    // Basketball Dunks (Generic)
    streamUrl: "https://www.youtube.com/embed/Bibg8b3mO2s?autoplay=1&mute=1",
    minute: 8,
    period: 'Q2',
    homeTeam: { name: 'Los Angeles Lakers', logo: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg' },
    awayTeam: { name: 'Golden State Warriors', logo: 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg' },
    scores: { home: 42, away: 45 },
    stats: [
      { label: 'Field Goal %', home: 45, away: 48, type: 'percent' },
      { label: '3-Point %', home: 32, away: 40, type: 'percent' },
      { label: 'Rebounds', home: 18, away: 14, type: 'count' },
      { label: 'Turnovers', home: 5, away: 3, type: 'count' }
    ],
    odds: {
      main: [
        { id: 'm3-1', label: 'LAL', value: 1.95, marketType: 'Moneyline' },
        { id: 'm3-2', label: 'GSW', value: 1.85, marketType: 'Moneyline' },
      ],
      secondary: [
        { id: 'm3-h1', label: 'LAL +1.5', value: 1.90, marketType: 'Handicap' },
        { id: 'm3-h2', label: 'GSW -1.5', value: 1.90, marketType: 'Handicap' },
      ]
    }
  },
  {
    id: 't1',
    sport: 'Tennis',
    league: 'Wimbledon',
    startTime: new Date(new Date().getTime() - 1000 * 60 * 90),
    isLive: true,
    hasStream: true,
    // Tennis Highlights
    streamUrl: "https://www.youtube.com/embed/kYvI8s-sQhk?autoplay=1&mute=1",
    period: 'Set 3',
    homeTeam: { name: 'Carlos Alcaraz', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/320px-Flag_of_Spain.svg.png' },
    awayTeam: { name: 'Novak Djokovic', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Flag_of_Serbia.svg/320px-Flag_of_Serbia.svg.png' },
    scores: { home: 1, away: 1, detail: "6-4, 6-7, 2-1" },
    stats: [
      { label: 'Aces', home: 8, away: 12, type: 'count' },
      { label: 'Double Faults', home: 2, away: 1, type: 'count' },
      { label: '1st Serve %', home: 68, away: 72, type: 'percent' },
      { label: 'Break Points Won', home: 3, away: 2, type: 'count' }
    ],
    odds: {
      main: [
        { id: 't1-1', label: 'Alcaraz', value: 2.00, originalValue: 1.72, isBoosted: true, marketType: 'Winner' }, // Boosted
        { id: 't1-2', label: 'Djokovic', value: 2.15, marketType: 'Winner' },
      ],
      secondary: [
        { id: 't1-s1', label: 'Set 3 Winner (1)', value: 1.60, marketType: 'Winner' },
        { id: 't1-s2', label: 'Set 3 Winner (2)', value: 2.30, marketType: 'Winner' },
      ]
    }
  },
  {
    id: 'm_bundes_1',
    sport: 'Soccer',
    league: 'Bundesliga',
    startTime: new Date(new Date().getTime() - 1000 * 60 * 75), // Live
    isLive: true,
    hasStream: true,
    streamUrl: "https://www.youtube.com/embed/P9F9q1r7y7U?autoplay=1&mute=1", // Generic stadium/soccer
    minute: 75,
    homeTeam: { name: 'Dortmund', logo: 'https://crests.football-data.org/4.svg' },
    awayTeam: { name: 'RB Leipzig', logo: 'https://crests.football-data.org/721.svg' },
    scores: { home: 2, away: 2 },
    stats: [
        { label: 'Possession', home: 55, away: 45, type: 'percent' },
        { label: 'Shots', home: 14, away: 11, type: 'count' }
    ],
    odds: {
      main: [
        { id: 'bund-1', label: '1', value: 3.10, marketType: '1x2' },
        { id: 'bund-x', label: 'X', value: 2.80, marketType: '1x2' },
        { id: 'bund-2', label: '2', value: 2.90, marketType: '1x2' },
      ],
      secondary: [
        { id: 'bund-o', label: 'Over 4.5', value: 1.85, marketType: 'OverUnder' },
        { id: 'bund-u', label: 'Under 4.5', value: 1.95, marketType: 'OverUnder' },
      ]
    }
  },
  {
    id: 't_wta_1',
    sport: 'Tennis',
    league: 'WTA French Open',
    startTime: new Date(new Date().getTime() - 1000 * 60 * 40),
    isLive: true,
    hasStream: false,
    period: 'Set 2',
    homeTeam: { name: 'Iga Swiatek', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Flag_of_Poland_2.svg/320px-Flag_of_Poland_2.svg.png' },
    awayTeam: { name: 'Aryna Sabalenka', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Flag_of_Belarus.svg/320px-Flag_of_Belarus.svg.png' },
    scores: { home: 1, away: 0, detail: "6-3, 2-1" },
    odds: {
      main: [
        { id: 't2-1', label: 'Swiatek', value: 1.15, marketType: 'Winner' },
        { id: 't2-2', label: 'Sabalenka', value: 5.50, marketType: 'Winner' },
      ],
      secondary: []
    }
  },
  {
    id: 'c1',
    sport: 'Cricket',
    league: 'IPL',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 2),
    isLive: false,
    homeTeam: { name: 'Chennai Super Kings', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png' },
    awayTeam: { name: 'Mumbai Indians', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/1200px-Mumbai_Indians_Logo.svg.png' },
    odds: {
      main: [
        { id: 'c1-1', label: 'CSK', value: 1.85, marketType: 'Winner' },
        { id: 'c1-2', label: 'MI', value: 1.95, marketType: 'Winner' },
      ],
      secondary: [
        { id: 'c1-o', label: 'Total Runs > 320.5', value: 1.90, marketType: 'OverUnder' },
        { id: 'c1-u', label: 'Total Runs < 320.5', value: 1.90, marketType: 'OverUnder' },
      ]
    }
  },
  {
    id: 'e1',
    sport: 'Esports',
    league: 'CS2 Major',
    startTime: new Date(new Date().getTime() - 1000 * 60 * 15),
    isLive: true,
    hasStream: true,
    // Esports/Gaming Stream (Reliable)
    streamUrl: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&controls=0",
    minute: 0,
    period: 'Map 2',
    homeTeam: { name: 'Natus Vincere', logo: 'https://upload.wikimedia.org/wikipedia/en/a/ac/NaVi_logo.svg' },
    awayTeam: { name: 'FaZe Clan', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/FaZe_Clan.svg' },
    scores: { home: 1, away: 0, detail: "13-9, 4-2" },
    odds: {
      main: [
        { id: 'e1-1', label: 'NaVi', value: 1.55, marketType: 'Winner' },
        { id: 'e1-2', label: 'FaZe', value: 2.45, marketType: 'Winner' },
      ],
      secondary: [
        { id: 'e1-h1', label: 'Map 2 Winner (NaVi)', value: 1.80, marketType: 'Winner' },
        { id: 'e1-h2', label: 'Map 2 Winner (FaZe)', value: 1.95, marketType: 'Winner' },
      ]
    }
  },
   {
    id: 'm4',
    sport: 'Soccer',
    league: 'Serie A',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 5),
    isLive: false,
    homeTeam: { name: 'Juventus', logo: 'https://crests.football-data.org/109.svg' },
    awayTeam: { name: 'AC Milan', logo: 'https://crests.football-data.org/98.svg' },
    odds: {
      main: [
        { id: 'm4-1', label: '1', value: 2.40, marketType: '1x2' },
        { id: 'm4-x', label: 'X', value: 3.10, marketType: '1x2' },
        { id: 'm4-2', label: '2', value: 2.90, marketType: '1x2' },
      ],
      secondary: [
        { id: 'm4-o', label: 'Over 2.5', value: 2.10, marketType: 'OverUnder' },
        { id: 'm4-u', label: 'Under 2.5', value: 1.70, marketType: 'OverUnder' },
      ]
    }
  },
  {
    id: 'm5',
    sport: 'Soccer',
    league: 'Champions League',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
    isLive: false,
    homeTeam: { name: 'Bayern Munich', logo: 'https://crests.football-data.org/5.svg' },
    awayTeam: { name: 'Paris Saint-Germain', logo: 'https://crests.football-data.org/524.svg' },
    stats: [
      { label: 'Head to Head Wins', home: 4, away: 2, type: 'count' },
      { label: 'Recent Form (Last 5)', home: 5, away: 3, type: 'count' }
    ],
    odds: {
      main: [
        { id: 'm5-1', label: '1', value: 1.80, marketType: '1x2' },
        { id: 'm5-x', label: 'X', value: 4.00, marketType: '1x2' },
        { id: 'm5-2', label: '2', value: 3.80, marketType: '1x2' },
      ],
      secondary: [
        { id: 'm5-o', label: 'Over 3.5', value: 2.45, marketType: 'OverUnder' },
        { id: 'm5-u', label: 'Under 3.5', value: 1.55, marketType: 'OverUnder' },
      ]
    }
  },
  {
    id: 'm_nba_2',
    sport: 'Basketball',
    league: 'NBA',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 8), // Upcoming
    isLive: false,
    homeTeam: { name: 'Boston Celtics', logo: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg' },
    awayTeam: { name: 'Miami Heat', logo: 'https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg' },
    odds: {
      main: [
        { id: 'nba2-1', label: 'BOS', value: 1.65, marketType: 'Moneyline' },
        { id: 'nba2-2', label: 'MIA', value: 2.25, marketType: 'Moneyline' },
      ],
      secondary: [
        { id: 'nba2-h1', label: 'BOS -4.5', value: 1.90, marketType: 'Handicap' },
        { id: 'nba2-h2', label: 'MIA +4.5', value: 1.90, marketType: 'Handicap' },
      ]
    }
  },
  {
    id: 'e_lol_1',
    sport: 'Esports',
    league: 'LoL Worlds',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 3),
    isLive: false,
    homeTeam: { name: 'T1', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/T1_logo.svg/1200px-T1_logo.svg.png' },
    awayTeam: { name: 'Gen.G', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Gen.G_logo.svg/1200px-Gen.G_logo.svg.png' },
    odds: {
      main: [
        { id: 'el-1', label: 'T1', value: 1.75, marketType: 'Winner' },
        { id: 'el-2', label: 'Gen.G', value: 2.05, marketType: 'Winner' },
      ],
      secondary: []
    }
  },
   {
    id: 'b_euro_1',
    sport: 'Basketball',
    league: 'EuroLeague',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 12),
    isLive: false,
    homeTeam: { name: 'Real Madrid', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Real_Madrid_Baloncesto_logo.svg/1200px-Real_Madrid_Baloncesto_logo.svg.png' },
    awayTeam: { name: 'Olympiacos', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Olympiacos_BC_logo.svg/1200px-Olympiacos_BC_logo.svg.png' },
    odds: {
      main: [
        { id: 'be-1', label: 'RM', value: 1.50, marketType: 'Moneyline' },
        { id: 'be-2', label: 'OLY', value: 2.60, marketType: 'Moneyline' },
      ],
      secondary: []
    }
  },
  {
    id: 'm_mls_1',
    sport: 'Soccer',
    league: 'MLS',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 15),
    isLive: false,
    homeTeam: { name: 'Inter Miami', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Inter_Miami_CF_logo.svg/1200px-Inter_Miami_CF_logo.svg.png' },
    awayTeam: { name: 'LA Galaxy', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Los_Angeles_Galaxy_logo.svg/1200px-Los_Angeles_Galaxy_logo.svg.png' },
    odds: {
        main: [
            { id: 'mls-1', label: '1', value: 1.60, marketType: '1x2' },
            { id: 'mls-x', label: 'X', value: 4.20, marketType: '1x2' },
            { id: 'mls-2', label: '2', value: 4.80, marketType: '1x2' },
        ],
        secondary: []
    }
  },
  {
    id: 'c_test_1',
    sport: 'Cricket',
    league: 'Test Series',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 2),
    isLive: false,
    homeTeam: { name: 'India', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png' },
    awayTeam: { name: 'Australia', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Flag_of_Australia.svg/320px-Flag_of_Australia.svg.png' },
    odds: {
        main: [
            { id: 'ct-1', label: 'India', value: 2.10, marketType: 'Winner' },
            { id: 'ct-2', label: 'Australia', value: 2.20, marketType: 'Winner' },
            { id: 'ct-x', label: 'Draw', value: 4.50, marketType: 'Winner' },
        ],
        secondary: []
    }
  }
];

export const JACKPOT_MATCHES: JackpotMatch[] = [
  {
    id: 'j1',
    league: 'Premier League',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 48),
    homeTeam: { name: 'Chelsea', logo: 'https://crests.football-data.org/61.svg' },
    awayTeam: { name: 'Liverpool', logo: 'https://crests.football-data.org/64.svg' },
  },
  {
    id: 'j2',
    league: 'La Liga',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 49),
    homeTeam: { name: 'Real Madrid', logo: 'https://crests.football-data.org/86.svg' },
    awayTeam: { name: 'Barcelona', logo: 'https://crests.football-data.org/81.svg' },
  },
  {
    id: 'j3',
    league: 'Serie A',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 50),
    homeTeam: { name: 'Napoli', logo: 'https://crests.football-data.org/113.svg' },
    awayTeam: { name: 'Inter Milan', logo: 'https://crests.football-data.org/108.svg' },
  },
  {
    id: 'j4',
    league: 'Bundesliga',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 52),
    homeTeam: { name: 'Dortmund', logo: 'https://crests.football-data.org/4.svg' },
    awayTeam: { name: 'RB Leipzig', logo: 'https://crests.football-data.org/721.svg' },
  },
  {
    id: 'j5',
    league: 'Ligue 1',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 55),
    homeTeam: { name: 'Marseille', logo: 'https://crests.football-data.org/516.svg' },
    awayTeam: { name: 'Lyon', logo: 'https://crests.football-data.org/523.svg' },
  },
  {
    id: 'j6',
    league: 'Eredivisie',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 58),
    homeTeam: { name: 'Ajax', logo: 'https://crests.football-data.org/678.svg' },
    awayTeam: { name: 'Feyenoord', logo: 'https://crests.football-data.org/675.svg' },
  },
  {
    id: 'j7',
    league: 'Premier League',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 60),
    homeTeam: { name: 'Aston Villa', logo: 'https://crests.football-data.org/58.svg' },
    awayTeam: { name: 'Tottenham', logo: 'https://crests.football-data.org/73.svg' },
  },
  {
    id: 'j8',
    league: 'Serie A',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 62),
    homeTeam: { name: 'AS Roma', logo: 'https://crests.football-data.org/100.svg' },
    awayTeam: { name: 'Lazio', logo: 'https://crests.football-data.org/110.svg' },
  },
  {
    id: 'j9',
    league: 'La Liga',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 65),
    homeTeam: { name: 'Sevilla', logo: 'https://crests.football-data.org/559.svg' },
    awayTeam: { name: 'Real Betis', logo: 'https://crests.football-data.org/558.svg' },
  },
  {
    id: 'j10',
    league: 'Primeira Liga',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 68),
    homeTeam: { name: 'FC Porto', logo: 'https://crests.football-data.org/503.svg' },
    awayTeam: { name: 'Benfica', logo: 'https://crests.football-data.org/1903.svg' },
  },
  {
    id: 'j11',
    league: 'Championship',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 70),
    homeTeam: { name: 'Leeds United', logo: 'https://crests.football-data.org/341.svg' },
    awayTeam: { name: 'Leicester City', logo: 'https://crests.football-data.org/338.svg' },
  },
  {
    id: 'j12',
    league: 'Premier League',
    startTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 72),
    homeTeam: { name: 'Newcastle United', logo: 'https://crests.football-data.org/67.svg' },
    awayTeam: { name: 'Manchester United', logo: 'https://crests.football-data.org/66.svg' },
  },
];