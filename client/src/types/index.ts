// 🌤️ Weather Types
export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  icon: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  highTemp: number;
  lowTemp: number;
  aqi?: {
    index: number;
    label: string;
    status: 'Good' | 'Moderate' | 'Unhealthy';
  };
  forecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  updatedAt: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  pop: number; // Probability of precipitation
}

export interface DailyForecast {
  day: string;
  date: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
}

// 💱 Currency Types
export interface CurrencyRate {
  base: string;
  rates: Record<string, number>;
  date: string;
  quote?: string;
  rate?: number;
}

export interface CurrencyConversion {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
}

// 🌍 Country / Explore Types
export type ExploreResultType = 'country' | 'person' | 'location' | 'topic';

export interface ExploreDetailItem {
  label: string;
  value: string;
}

export interface ExploreResult {
  type: ExploreResultType;
  title: string;
  subtitle: string;
  flagOrIcon?: string;
  details?: ExploreDetailItem[];
  description?: string;
  linkUrl?: string;
  linkLabel?: string;
  name?: string;
  officialName?: string;
  flag?: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  languages?: string[];
  currencies?: { code: string; name: string; symbol: string }[];
  timezones?: string[];
  latlng?: [number, number];
  mapUrl?: string;
}

export interface CountryDetails {
  name: string;
  officialName: string;
  flag: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  languages: string[];
  currencies: { code: string; name: string; symbol: string }[];
  timezones: string[];
  latlng: [number, number];
  mapUrl: string;
}

// 📰 News Types
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  category: string;
  language?: string;
}

// ⚽ Sports Types
export interface SportsMatch {
  id: string;
  league: string;
  homeTeam: string;
  homeScore?: number | string;
  homeLogo?: string;
  awayTeam: string;
  awayScore?: number | string;
  awayLogo?: string;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  timeOrDate: string;
  sport?: string;
  importance?: number;
  isInternational?: boolean;
  stage?: string;
  debugSource?: string;
}

// 📜 On This Day / Interesting Today Types
export interface OnThisDayEvent {
  title: string;
  year: number | string;
  category: string;
  description: string;
  imageUrl?: string;
  pageUrl?: string;
  articleTitle?: string;
}

// 🔥 Trending Types
export interface TrendingTopic {
  id: string;
  tag: string;
  category: string;
  badge: string;
  momentum?: string;
  mentionCount?: number;
}

// 🕐 World Clock Types
export interface ClockCity {
  id: string;
  city: string;
  country: string;
  timezone: string;
  flag: string;
}

export type NewsLanguage = 'english' | 'tamil' | 'malayalam' | 'telugu';

// ⚙️ Guest Personalization Preferences
export interface GuestPreferences {
  homeCity: string;
  homeCountry: string;
  baseCurrency: string;
  targetCurrency: string;
  newsLanguage: NewsLanguage;
  theme: 'dark' | 'light' | 'ambient';
  selectedInterests: string[];
  favoriteCategories: string[];
  clockCities: ClockCity[];
  visibleWidgets: {
    weather: boolean;
    currency: boolean;
    worldClock: boolean;
    news: boolean;
    sports: boolean;
    explore: boolean;
    trending: boolean;
  };
  widgetOrder: string[];
}
