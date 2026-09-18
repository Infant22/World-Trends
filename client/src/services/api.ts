import { WeatherData, CurrencyRate, CountryDetails, NewsArticle, SportsMatch, ExploreResult, OnThisDayEvent, TrendingTopic } from '../types';
import { MOCK_WEATHER, MOCK_CURRENCY_RATES, MOCK_NEWS, MOCK_SPORTS, searchExploreData } from './mockData';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

export async function fetchWeather(city: string): Promise<WeatherData> {
  try {
    const res = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.warn(`[API] Weather fallback used for ${city}:`, error);
    return { ...MOCK_WEATHER, city };
  }
}

export async function fetchCurrencies(base: string = 'USD', quote: string = 'INR'): Promise<CurrencyRate> {
  const bUpper = (base || 'USD').trim().toUpperCase();
  const qUpper = (quote || 'INR').trim().toUpperCase();

  const res = await fetch(`${API_BASE_URL}/currency?base=${encodeURIComponent(bUpper)}&quote=${encodeURIComponent(qUpper)}`);
  if (!res.ok) {
    throw new Error(`Currency rate fetch failed with status ${res.status}`);
  }
  const data = await res.json();
  if (bUpper !== qUpper && (!data || typeof data.rate !== 'number' || data.rate <= 0)) {
    throw new Error(`Invalid exchange rate payload for ${bUpper} -> ${qUpper}`);
  }
  return data;
}

export async function fetchCountryDetails(countryName: string): Promise<ExploreResult | null> {
  if (!countryName || !countryName.trim()) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(countryName.trim())}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data || null;
  } catch (error) {
    console.warn(`[API] Universal Search fetch failed for ${countryName}:`, error);
    return null;
  }
}

export const fetchUniversalSearch = fetchCountryDetails;

export async function fetchNews(category: string = 'general', language: string = 'english', forceRefresh: boolean = false): Promise<NewsArticle[]> {
  try {
    const refreshParam = forceRefresh ? '&refresh=true' : '';
    const res = await fetch(`${API_BASE_URL}/news?category=${category}&language=${encodeURIComponent(language)}${refreshParam}`);
    if (!res.ok) {
      console.warn(`[API] News fetch HTTP error ${res.status}: returning empty list.`);
      return [];
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object') {
      const combinedMap = new Map<string, NewsArticle>();

      // 1. Add specific category articles first so their specific category ('sports', 'technology', 'finance', 'world') is strictly preserved
      ['sports', 'technology', 'finance', 'world'].forEach((catKey) => {
        if (Array.isArray(data[catKey])) {
          data[catKey].forEach((art: NewsArticle) => {
            const cleanUrl = (art.url || '').split('?')[0].toLowerCase();
            const key = art.id || cleanUrl || art.title;
            if (key && !combinedMap.has(key)) {
              combinedMap.set(key, { ...art, category: catKey as any });
            }
          });
        }
      });

      // 2. Add 'all' headlines if not already present
      if (Array.isArray(data.all)) {
        data.all.forEach((art: NewsArticle) => {
          const cleanUrl = (art.url || '').split('?')[0].toLowerCase();
          const key = art.id || cleanUrl || art.title;
          if (key && !combinedMap.has(key)) {
            combinedMap.set(key, art);
          }
        });
      }

      return Array.from(combinedMap.values());
    }
    return [];
  } catch (error) {
    console.error(`[API] Error fetching news for language ${language}:`, error);
    return [];
  }
}

export async function fetchSports(forceRefresh: boolean = false): Promise<SportsMatch[]> {
  try {
    const refreshParam = forceRefresh ? '?refresh=true' : '';
    const res = await fetch(`${API_BASE_URL}/sports${refreshParam}`);
    if (!res.ok) throw new Error(`Sports fetch failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.warn('[API] Sports fallback used:', error);
    return MOCK_SPORTS;
  }
}

export async function fetchOnThisDay(): Promise<OnThisDayEvent> {
  try {
    const res = await fetch(`${API_BASE_URL}/onthisday`);
    if (!res.ok) throw new Error(`OnThisDay fetch failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.warn('[API] OnThisDay fallback used:', error);
    return {
      title: 'First International Web Standards Consortium Established',
      year: 1995,
      category: 'Milestone',
      description:
        'Pioneering computer scientists assembled to form the global standards for modern web protocols, laying the foundation for modern real-time internet architectures.',
      pageUrl: 'https://en.wikipedia.org/wiki/World_Wide_Web_Consortium',
    };
  }
}

export async function fetchTrending(country: string = 'India', interests: string[] = []): Promise<TrendingTopic[]> {
  try {
    const interestsParam = interests.join(',');
    const res = await fetch(
      `${API_BASE_URL}/trending?country=${encodeURIComponent(country)}&interests=${encodeURIComponent(interestsParam)}`
    );
    if (!res.ok) throw new Error(`Trending fetch failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.warn('[API] Google Trends RSS fetch failed:', error);
    return [];
  }
}
