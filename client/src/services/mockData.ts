import { WeatherData, CurrencyRate, CountryDetails, NewsArticle, SportsMatch, ExploreResult } from '../types';

export const MOCK_WEATHER: WeatherData = {
  city: 'Chennai',
  country: 'India',
  temp: 29,
  feelsLike: 32,
  condition: 'Partly Cloudy',
  conditionCode: 1003,
  icon: '🌤️',
  humidity: 74,
  windSpeed: 14,
  uvIndex: 7,
  aqi: { index: 42, label: 'Good', status: 'Good' },
  highTemp: 31,
  lowTemp: 25,
  updatedAt: new Date().toISOString(),
  forecast: [
    { time: '12:00 PM', temp: 29, condition: 'Partly Cloudy', pop: 10 },
    { time: '03:00 PM', temp: 31, condition: 'Sunny', pop: 5 },
    { time: '06:00 PM', temp: 28, condition: 'Clear', pop: 0 },
    { time: '09:00 PM', temp: 26, condition: 'Clear', pop: 0 },
    { time: '12:00 AM', temp: 25, condition: 'Clear', pop: 0 },
  ],
  dailyForecast: [
    { day: 'Today', date: 'Sep 9', highTemp: 31, lowTemp: 25, condition: 'Partly Cloudy' },
    { day: 'Thu', date: 'Sep 10', highTemp: 32, lowTemp: 26, condition: 'Sunny' },
    { day: 'Fri', date: 'Sep 11', highTemp: 30, lowTemp: 25, condition: 'Chance of Rain' },
    { day: 'Sat', date: 'Sep 12', highTemp: 29, lowTemp: 24, condition: 'Thunderstorm' },
    { day: 'Sun', date: 'Sep 13', highTemp: 31, lowTemp: 25, condition: 'Partly Cloudy' },
  ],
};

export const MOCK_CURRENCY_RATES: CurrencyRate = {
  base: 'USD',
  date: new Date().toISOString().split('T')[0],
  rates: {
    INR: 83.92,
    EUR: 0.92,
    GBP: 0.77,
    JPY: 143.45,
    AUD: 1.49,
    CAD: 1.36,
    SGD: 1.31,
    CNY: 7.12,
  },
};

export const MOCK_NEWS: NewsArticle[] = [
  // Technology
  {
    id: 'tech-1',
    title: 'Global Tech Summit 2026 Announces Next-Gen AI Standards',
    description: 'Tech leaders assemble to establish international protocols for agentic AI and cloud infrastructure.',
    source: 'TechCrunch',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
    publishedAt: '2026-09-11T10:30:00Z',
    category: 'technology',
  },
  {
    id: 'tech-2',
    title: 'Quantum Computing Milestone: 10,000 Qubit Fault-Tolerant Processor Unveiled',
    description: 'Researchers demonstrate quantum algorithms operating with unprecedented error suppression.',
    source: 'Wired',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    publishedAt: '2026-09-11T09:15:00Z',
    category: 'technology',
  },
  {
    id: 'tech-3',
    title: 'Autonomous Spatial Computing Glasses Reach Mass Consumer Market',
    description: 'Lightweight neural smart glasses replace traditional displays as developer ecosystems adapt rapidly.',
    source: 'The Verge',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&q=80',
    publishedAt: '2026-09-11T08:00:00Z',
    category: 'technology',
  },
  {
    id: 'tech-4',
    title: 'Open-Source Multimodal Models Match Frontier Industry Benchmarks',
    description: 'Decentralized AI development teams release high-efficiency models for edge devices.',
    source: 'MIT Tech Review',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
    publishedAt: '2026-09-11T06:45:00Z',
    category: 'technology',
  },

  // World News
  {
    id: 'world-1',
    title: 'Renewable Energy Reaches Record 45% Share in Global Power Grid',
    description: 'Solar and wind installations surge globally as utility-scale battery storage costs drop significantly.',
    source: 'BBC News',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80',
    publishedAt: '2026-09-11T08:15:00Z',
    category: 'world',
  },
  {
    id: 'world-2',
    title: 'Historic International Accord Signed for Ocean Sanctuary Protection',
    description: 'Over 140 nations ratify binding treaties to preserve international waters and deep-sea biodiversity.',
    source: 'Reuters',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
    publishedAt: '2026-09-11T07:30:00Z',
    category: 'world',
  },
  {
    id: 'world-3',
    title: 'Trans-Continental High-Speed Rail Corridor Commences Full Service',
    description: 'Inter-state transit networks expand, reducing regional aviation emissions across key trade corridors.',
    source: 'Al Jazeera',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80',
    publishedAt: '2026-09-11T05:20:00Z',
    category: 'world',
  },
  {
    id: 'world-4',
    title: 'UN Global Urban Summit Highlights Zero-Emission Smart Municipalities',
    description: 'Metropolitan centers integrate vertical greenery, district cooling, and automated electric transit.',
    source: 'The Guardian',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?w=600&q=80',
    publishedAt: '2026-09-11T04:10:00Z',
    category: 'world',
  },

  // Sports
  {
    id: 'sports-1',
    title: 'Champions League Thriller: Dramatic Late Equalizer in Semi-Final',
    description: 'Incredible injury-time strike forces extra time in front of 80,000 cheering fans.',
    source: 'ESPN',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
    publishedAt: '2026-09-11T07:45:00Z',
    category: 'sports',
  },
  {
    id: 'sports-2',
    title: 'T20 World Cup Clash: India Secures Dominant Victory Over Australia',
    description: 'Masterclass bowling performance restricts opponents as middle-order batters chase down target easily.',
    source: 'Cricinfo',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80',
    publishedAt: '2026-09-11T06:30:00Z',
    category: 'sports',
  },
  {
    id: 'sports-3',
    title: 'Grand Slam Epic: 5-Set Tennis Semi-Final Captivates Global Audience',
    description: 'Top seeds battle for over four hours in an unforgettable showcase of baseline endurance.',
    source: 'Sky Sports',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80',
    publishedAt: '2026-09-11T05:15:00Z',
    category: 'sports',
  },
  {
    id: 'sports-4',
    title: 'World Athletics Championship: Sprint Record Broken in Photo Finish',
    description: 'Sprinters push human limits as new timing technology verifies record-breaking hundredths of a second.',
    source: 'NBC Sports',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
    publishedAt: '2026-09-11T03:50:00Z',
    category: 'sports',
  },

  // Finance
  {
    id: 'finance-1',
    title: 'Central Banks Signal Interest Rate Cuts Amid Inflation Cooling',
    description: 'Financial markets react positively as economic indicators show steady global normalization.',
    source: 'Bloomberg',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    publishedAt: '2026-09-11T06:20:00Z',
    category: 'finance',
  },
  {
    id: 'finance-2',
    title: 'Global Stock Indexes Surge to New All-Time Highs in Broad Rally',
    description: 'Strong quarterly earnings across technology and green manufacturing fuel investor sentiment.',
    source: 'Financial Times',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=80',
    publishedAt: '2026-09-11T05:40:00Z',
    category: 'finance',
  },
  {
    id: 'finance-3',
    title: 'Digital Interbank Settlement System Adopted by Major Global Institutions',
    description: 'Cross-border commercial transactions achieve real-time clearance with near-zero transfer friction.',
    source: 'Wall Street Journal',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
    publishedAt: '2026-09-11T04:25:00Z',
    category: 'finance',
  },
  {
    id: 'finance-4',
    title: 'Clean Energy Technology Funding Rounds Break Historical Records',
    description: 'Venture capital investment accelerates into next-generation battery storage and hydrogen infrastructure.',
    source: 'CNBC',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
    publishedAt: '2026-09-11T02:15:00Z',
    category: 'finance',
  },
];

export const MOCK_SPORTS: SportsMatch[] = [
  // 1. Cricket - Live T20 World Cup Final
  {
    id: 's-cricket-1',
    league: 'T20 World Cup',
    sport: 'Cricket',
    homeTeam: 'India',
    homeScore: 184,
    homeLogo: '🏏',
    awayTeam: 'Australia',
    awayScore: 152,
    awayLogo: '🏏',
    status: 'LIVE',
    timeOrDate: '18.4 overs',
    importance: 98,
    isInternational: true,
    stage: 'Final',
  },
  // 2. Football - Live Champions League Final
  {
    id: 's-football-1',
    league: 'Champions League',
    sport: 'Football',
    homeTeam: 'Real Madrid',
    homeScore: 2,
    homeLogo: '⚽',
    awayTeam: 'Manchester City',
    awayScore: 1,
    awayLogo: '⚽',
    status: 'LIVE',
    timeOrDate: "78'",
    importance: 96,
    isInternational: true,
    stage: 'Final',
  },
  // 3. Tennis - Live Grand Slam Final
  {
    id: 's-tennis-1',
    league: 'Wimbledon',
    sport: 'Tennis',
    homeTeam: 'Carlos Alcaraz',
    homeScore: 2,
    homeLogo: '🎾',
    awayTeam: 'Jannik Sinner',
    awayScore: 1,
    awayLogo: '🎾',
    status: 'LIVE',
    timeOrDate: 'Set 4 • 4-3',
    importance: 94,
    isInternational: true,
    stage: 'Final',
  },
  // 4. Basketball - Live NBA Finals
  {
    id: 's-basketball-1',
    league: 'NBA Finals',
    sport: 'Basketball',
    homeTeam: 'Boston Celtics',
    homeScore: 104,
    homeLogo: '🏀',
    awayTeam: 'LA Lakers',
    awayScore: 101,
    awayLogo: '🏀',
    status: 'LIVE',
    timeOrDate: 'Q4 • 2:15',
    importance: 92,
    isInternational: false,
    stage: 'Final',
  },
  // 5. Hockey - Live FIH World Cup Final
  {
    id: 's-hockey-1',
    league: 'FIH World Cup',
    sport: 'Hockey',
    homeTeam: 'Netherlands',
    homeScore: 3,
    homeLogo: '🏑',
    awayTeam: 'Germany',
    awayScore: 2,
    awayLogo: '🏑',
    status: 'LIVE',
    timeOrDate: "Q4 • 8'",
    importance: 88,
    isInternational: true,
    stage: 'Final',
  },
  // 6. Football - Live Premier League Match
  {
    id: 's-football-2',
    league: 'Premier League',
    sport: 'Football',
    homeTeam: 'Arsenal',
    homeScore: 1,
    homeLogo: '⚽',
    awayTeam: 'Chelsea',
    awayScore: 0,
    awayLogo: '⚽',
    status: 'LIVE',
    timeOrDate: "62'",
    importance: 82,
    isInternational: false,
    stage: 'Regular Season',
  },
  // 7. Formula 1 - Upcoming Monaco GP
  {
    id: 's-f1-1',
    league: 'Formula 1',
    sport: 'Formula 1',
    homeTeam: 'Monaco GP',
    homeLogo: '🏎️',
    awayTeam: 'Main Race',
    awayLogo: '🏎️',
    status: 'UPCOMING',
    timeOrDate: 'Sun 6:30 PM',
    importance: 90,
    isInternational: true,
    stage: 'Final',
  },
  // 8. Football - Upcoming El Clásico
  {
    id: 's-football-3',
    league: 'La Liga',
    sport: 'Football',
    homeTeam: 'Barcelona',
    homeLogo: '⚽',
    awayTeam: 'Real Madrid',
    awayLogo: '⚽',
    status: 'UPCOMING',
    timeOrDate: 'Today 11:30 PM',
    importance: 89,
    isInternational: false,
    stage: 'Regular Season',
  },
  // 9. Cricket - Upcoming Test Match
  {
    id: 's-cricket-2',
    league: 'Test Series',
    sport: 'Cricket',
    homeTeam: 'England',
    homeLogo: '🏏',
    awayTeam: 'India',
    awayLogo: '🏏',
    status: 'UPCOMING',
    timeOrDate: 'Tomorrow 3:30 PM',
    importance: 87,
    isInternational: true,
    stage: 'Regular Season',
  },
  // 10. Basketball - Finished Game
  {
    id: 's-basketball-2',
    league: 'EuroLeague',
    sport: 'Basketball',
    homeTeam: 'Real Madrid',
    homeScore: 89,
    homeLogo: '🏀',
    awayTeam: 'Panathinaikos',
    awayScore: 85,
    awayLogo: '🏀',
    status: 'FINISHED',
    timeOrDate: 'R. Madrid won',
    importance: 80,
    isInternational: true,
    stage: 'Final',
  },
];

export const MOCK_COUNTRY_JAPAN: ExploreResult = {
  type: 'country',
  title: 'Japan',
  subtitle: 'Asia • Eastern Asia',
  flagOrIcon: '🇯🇵',
  name: 'Japan',
  officialName: 'Japan',
  flag: '🇯🇵',
  capital: 'Tokyo',
  region: 'Asia',
  subregion: 'Eastern Asia',
  population: 125100000,
  languages: ['Japanese'],
  currencies: [{ code: 'JPY', name: 'Japanese yen', symbol: '¥' }],
  timezones: ['UTC+09:00'],
  latlng: [36.2048, 138.2529],
  mapUrl: 'https://goo.gl/maps/5ieEAp2rQq22',
  details: [
    { label: 'Capital', value: 'Tokyo' },
    { label: 'Population', value: '125.1M' },
    { label: 'Currency', value: 'JPY (¥)' },
  ],
};

export const MOCK_COUNTRY_USA: ExploreResult = {
  type: 'country',
  title: 'United States',
  subtitle: 'Americas • North America',
  flagOrIcon: '🇺🇸',
  name: 'United States',
  officialName: 'United States of America',
  flag: '🇺🇸',
  capital: 'Washington, D.C.',
  region: 'Americas',
  subregion: 'North America',
  population: 331900000,
  languages: ['English'],
  currencies: [{ code: 'USD', name: 'US Dollar', symbol: '$' }],
  timezones: ['UTC-05:00'],
  latlng: [37.0902, -95.7129],
  mapUrl: 'https://maps.google.com/?q=USA',
  details: [
    { label: 'Capital', value: 'Washington, D.C.' },
    { label: 'Population', value: '331.9M' },
    { label: 'Currency', value: 'USD ($)' },
  ],
};

export const MOCK_COUNTRY_INDIA: ExploreResult = {
  type: 'country',
  title: 'India',
  subtitle: 'Asia • Southern Asia',
  flagOrIcon: '🇮🇳',
  name: 'India',
  officialName: 'Republic of India',
  flag: '🇮🇳',
  capital: 'New Delhi',
  region: 'Asia',
  subregion: 'Southern Asia',
  population: 1408000000,
  languages: ['Hindi', 'English'],
  currencies: [{ code: 'INR', name: 'Indian Rupee', symbol: '₹' }],
  timezones: ['UTC+05:30'],
  latlng: [20.5937, 78.9629],
  mapUrl: 'https://maps.google.com/?q=India',
  details: [
    { label: 'Capital', value: 'New Delhi' },
    { label: 'Population', value: '1408.0M' },
    { label: 'Currency', value: 'INR (₹)' },
  ],
};

export const MOCK_COUNTRY_UK: ExploreResult = {
  type: 'country',
  title: 'United Kingdom',
  subtitle: 'Europe • Northern Europe',
  flagOrIcon: '🇬🇧',
  name: 'United Kingdom',
  officialName: 'United Kingdom of Great Britain and Northern Ireland',
  flag: '🇬🇧',
  capital: 'London',
  region: 'Europe',
  subregion: 'Northern Europe',
  population: 67300000,
  languages: ['English'],
  currencies: [{ code: 'GBP', name: 'British Pound', symbol: '£' }],
  timezones: ['UTC+00:00'],
  latlng: [55.3781, -3.436],
  mapUrl: 'https://maps.google.com/?q=UK',
  details: [
    { label: 'Capital', value: 'London' },
    { label: 'Population', value: '67.3M' },
    { label: 'Currency', value: 'GBP (£)' },
  ],
};

export const MOCK_COUNTRY_FRANCE: ExploreResult = {
  type: 'country',
  title: 'France',
  subtitle: 'Europe • Western Europe',
  flagOrIcon: '🇫🇷',
  name: 'France',
  officialName: 'French Republic',
  flag: '🇫🇷',
  capital: 'Paris',
  region: 'Europe',
  subregion: 'Western Europe',
  population: 67750000,
  languages: ['French'],
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
  timezones: ['UTC+01:00'],
  latlng: [46.2276, 2.2137],
  mapUrl: 'https://maps.google.com/?q=France',
  details: [
    { label: 'Capital', value: 'Paris' },
    { label: 'Population', value: '67.8M' },
    { label: 'Currency', value: 'EUR (€)' },
  ],
};

export const MOCK_COUNTRY_GERMANY: ExploreResult = {
  type: 'country',
  title: 'Germany',
  subtitle: 'Europe • Western Europe',
  flagOrIcon: '🇩🇪',
  name: 'Germany',
  officialName: 'Federal Republic of Germany',
  flag: '🇩🇪',
  capital: 'Berlin',
  region: 'Europe',
  subregion: 'Western Europe',
  population: 83200000,
  languages: ['German'],
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
  timezones: ['UTC+01:00'],
  latlng: [51.1657, 10.4515],
  mapUrl: 'https://maps.google.com/?q=Germany',
  details: [
    { label: 'Capital', value: 'Berlin' },
    { label: 'Population', value: '83.2M' },
    { label: 'Currency', value: 'EUR (€)' },
  ],
};

export const MOCK_COUNTRY_CANADA: ExploreResult = {
  type: 'country',
  title: 'Canada',
  subtitle: 'Americas • North America',
  flagOrIcon: '🇨🇦',
  name: 'Canada',
  officialName: 'Canada',
  flag: '🇨🇦',
  capital: 'Ottawa',
  region: 'Americas',
  subregion: 'North America',
  population: 38250000,
  languages: ['English', 'French'],
  currencies: [{ code: 'CAD', name: 'Canadian Dollar', symbol: '$' }],
  timezones: ['UTC-05:00'],
  latlng: [56.1304, -106.3468],
  mapUrl: 'https://maps.google.com/?q=Canada',
  details: [
    { label: 'Capital', value: 'Ottawa' },
    { label: 'Population', value: '38.3M' },
    { label: 'Currency', value: 'CAD ($)' },
  ],
};

export const MOCK_COUNTRY_AUSTRALIA: ExploreResult = {
  type: 'country',
  title: 'Australia',
  subtitle: 'Oceania • Australia and New Zealand',
  flagOrIcon: '🇦🇺',
  name: 'Australia',
  officialName: 'Commonwealth of Australia',
  flag: '🇦🇺',
  capital: 'Canberra',
  region: 'Oceania',
  subregion: 'Australia and New Zealand',
  population: 25690000,
  languages: ['English'],
  currencies: [{ code: 'AUD', name: 'Australian Dollar', symbol: '$' }],
  timezones: ['UTC+10:00'],
  latlng: [-25.2744, 133.7751],
  mapUrl: 'https://maps.google.com/?q=Australia',
  details: [
    { label: 'Capital', value: 'Canberra' },
    { label: 'Population', value: '25.7M' },
    { label: 'Currency', value: 'AUD ($)' },
  ],
};

export const MOCK_COUNTRY: CountryDetails = MOCK_COUNTRY_JAPAN as unknown as CountryDetails;

export function searchExploreData(query: string): ExploreResult | null {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();

  // 1. Country Matches
  if (q === 'japan' || q === 'jp' || q === 'nippon') return MOCK_COUNTRY_JAPAN;
  if (q === 'usa' || q === 'united states' || q === 'us' || q === 'america' || q === 'united states of america') return MOCK_COUNTRY_USA;
  if (q === 'india' || q === 'in' || q === 'bharat') return MOCK_COUNTRY_INDIA;
  if (q === 'uk' || q === 'united kingdom' || q === 'britain' || q === 'england') return MOCK_COUNTRY_UK;
  if (q === 'france' || q === 'fr') return MOCK_COUNTRY_FRANCE;
  if (q === 'germany' || q === 'de') return MOCK_COUNTRY_GERMANY;
  if (q === 'canada' || q === 'ca') return MOCK_COUNTRY_CANADA;
  if (q === 'australia' || q === 'au') return MOCK_COUNTRY_AUSTRALIA;

  // 2. Person Matches
  if (q.includes('virat') || q.includes('kohli')) {
    return {
      type: 'person',
      title: 'Virat Kohli',
      subtitle: 'Professional Cricketer • India Icon',
      flagOrIcon: '🏏',
      name: 'Virat Kohli',
      description: 'International cricket superstar, former captain of the Indian national team, and one of the highest run-scorers in modern cricket history.',
      details: [
        { label: 'Role', value: 'Top-order Batsman' },
        { label: 'Team', value: 'India / RCB' },
        { label: 'Status', value: 'Active Legend' },
      ],
    };
  }

  if (q.includes('astra') || q.includes('gpt')) {
    return {
      type: 'person',
      title: 'GPT ASTRA',
      subtitle: 'Agentic AI Architecture • System Platform',
      flagOrIcon: '⚡',
      name: 'GPT ASTRA',
      description: 'Advanced agentic AI system engineered for real-time data synthesis, dynamic dashboard personalization, and structured intelligence automation.',
      details: [
        { label: 'Category', value: 'Agentic AI' },
        { label: 'Architecture', value: 'Multimodal' },
        { label: 'Status', value: 'Live Engine' },
      ],
    };
  }

  if (q.includes('messi')) {
    return {
      type: 'person',
      title: 'Lionel Messi',
      subtitle: 'Professional Footballer • Argentina Icon',
      flagOrIcon: '⚽',
      name: 'Lionel Messi',
      description: 'World Cup champion and multi-time Ballon d\'Or recipient, widely recognized as one of the greatest football players in history.',
      details: [
        { label: 'Role', value: 'Forward / Playmaker' },
        { label: 'Team', value: 'Argentina / Inter Miami' },
        { label: 'Status', value: 'Active Legend' },
      ],
    };
  }

  if (q.includes('musk') || q.includes('elon')) {
    return {
      type: 'person',
      title: 'Elon Musk',
      subtitle: 'Tech Entrepreneur • Executive',
      flagOrIcon: '🚀',
      name: 'Elon Musk',
      description: 'Lead engineer at SpaceX, CEO of Tesla, and prominent innovator in aerospace, electric vehicles, and AI systems.',
      details: [
        { label: 'Focus', value: 'Aerospace & EVs' },
        { label: 'Role', value: 'CEO / Founder' },
        { label: 'Status', value: 'Active' },
      ],
    };
  }

  // 3. Location Matches
  if (q.includes('chennai') || q.includes('madras')) {
    return {
      type: 'location',
      title: 'Chennai',
      subtitle: 'Tamil Nadu, India • Major Metropolitan',
      flagOrIcon: '📍',
      name: 'Chennai',
      description: 'Capital city of Tamil Nadu, major economic, cultural, and educational hub in South India renowned for software parks, automotive manufacturing, and coastal heritage.',
      details: [
        { label: 'Country', value: 'India' },
        { label: 'Timezone', value: 'IST (UTC+5:30)' },
        { label: 'Key Hub', value: 'Tech & Industry' },
      ],
    };
  }

  if (q.includes('mumbai') || q.includes('bombay')) {
    return {
      type: 'location',
      title: 'Mumbai',
      subtitle: 'Maharashtra, India • Financial Capital',
      flagOrIcon: '📍',
      name: 'Mumbai',
      description: 'Financial capital of India, home to national stock exchanges, commercial banking headquarters, and the Indian film industry.',
      details: [
        { label: 'Country', value: 'India' },
        { label: 'Timezone', value: 'IST (UTC+5:30)' },
        { label: 'Key Hub', value: 'Finance & Film' },
      ],
    };
  }

  if (q.includes('delhi')) {
    return {
      type: 'location',
      title: 'Delhi / New Delhi',
      subtitle: 'National Capital Territory, India',
      flagOrIcon: '📍',
      name: 'Delhi',
      description: 'Capital territory of India, political hub, and historic metropolis combining governance, culture, and ancient monuments.',
      details: [
        { label: 'Country', value: 'India' },
        { label: 'Timezone', value: 'IST (UTC+5:30)' },
        { label: 'Key Hub', value: 'Governance & History' },
      ],
    };
  }

  if (q.includes('london')) {
    return {
      type: 'location',
      title: 'London',
      subtitle: 'Capital City • United Kingdom',
      flagOrIcon: '📍',
      name: 'London',
      description: 'Global financial capital and historical metropolis known for culture, international commerce, and landmark heritage.',
      details: [
        { label: 'Country', value: 'United Kingdom' },
        { label: 'Timezone', value: 'GMT (UTC+0)' },
        { label: 'Key Hub', value: 'Global Finance' },
      ],
    };
  }

  if (q.includes('new york') || q.includes('nyc')) {
    return {
      type: 'location',
      title: 'New York City',
      subtitle: 'New York, USA • Global Metropolis',
      flagOrIcon: '📍',
      name: 'New York City',
      description: 'Major global center for finance, media, art, and international diplomacy.',
      details: [
        { label: 'Country', value: 'United States' },
        { label: 'Timezone', value: 'EST (UTC-5)' },
        { label: 'Key Hub', value: 'Wall Street & Media' },
      ],
    };
  }

  // 4. Topic Matches
  if (q.includes('cricket') || q.includes('t20') || q.includes('ipl')) {
    return {
      type: 'topic',
      title: 'Cricket',
      subtitle: 'Sports Category • Global Interest',
      flagOrIcon: '🏏',
      name: 'Cricket',
      description: 'Global bat-and-ball sport played across nations, featuring premier tournaments including ICC World Cups, Test Series, and global T20 leagues.',
      details: [
        { label: 'Category', value: 'Sports' },
        { label: 'Governing Body', value: 'ICC' },
        { label: 'Momentum', value: '🔥 High Trend' },
      ],
    };
  }

  if (q.includes('football') || q.includes('soccer') || q.includes('champions league')) {
    return {
      type: 'topic',
      title: 'Football / Soccer',
      subtitle: 'Sports Category • World Sport',
      flagOrIcon: '⚽',
      name: 'Football',
      description: 'The world\'s most popular sport, featuring global competitions such as the FIFA World Cup and UEFA Champions League.',
      details: [
        { label: 'Category', value: 'Sports' },
        { label: 'Governing Body', value: 'FIFA' },
        { label: 'Momentum', value: '🔥 World #1' },
      ],
    };
  }

  if (q.includes('tech') || q.includes('ai') || q.includes('technology')) {
    return {
      type: 'topic',
      title: 'Technology & AI',
      subtitle: 'Global Innovation • Industry Category',
      flagOrIcon: '🤖',
      name: 'Technology',
      description: 'Advancements in artificial intelligence, cloud architecture, quantum computing, and agentic software frameworks.',
      details: [
        { label: 'Category', value: 'Technology' },
        { label: 'Focus', value: 'AI & Cloud' },
        { label: 'Momentum', value: '🚀 Rapid Growth' },
      ],
    };
  }

  if (q.includes('movie') || q.includes('film') || q.includes('cinema')) {
    return {
      type: 'topic',
      title: 'Movies & Cinema',
      subtitle: 'Entertainment Category • Cultural Trend',
      flagOrIcon: '🎬',
      name: 'Movies',
      description: 'Global cinematic releases, film festivals, box office trends, and entertainment streaming media.',
      details: [
        { label: 'Category', value: 'Entertainment' },
        { label: 'Focus', value: 'Film & Media' },
        { label: 'Momentum', value: '🍿 Trending' },
      ],
    };
  }

  if (q.includes('finance') || q.includes('market') || q.includes('stock')) {
    return {
      type: 'topic',
      title: 'Finance & Markets',
      subtitle: 'Economy Category • Market Trends',
      flagOrIcon: '📈',
      name: 'Finance',
      description: 'Global equity markets, central bank interest rate policies, currency exchange fluctuations, and macroeconomic indicators.',
      details: [
        { label: 'Category', value: 'Finance' },
        { label: 'Focus', value: 'Markets & Forex' },
        { label: 'Momentum', value: '📊 Live Updates' },
      ],
    };
  }

  // 5. Unsupported/Unrecognized searches
  return null;
}
