import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ClockCity } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format timestamp into human readable local time string
 */
export function formatLocalTime(timezone: string, locale: string = 'en-US'): string {
  try {
    return new Date().toLocaleTimeString(locale, {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return new Date().toLocaleTimeString();
  }
}

export const CITY_TIMEZONE_MAP: Record<string, string> = {
  chennai: 'Asia/Kolkata',
  coimbatore: 'Asia/Kolkata',
  bengaluru: 'Asia/Kolkata',
  bangalore: 'Asia/Kolkata',
  mumbai: 'Asia/Kolkata',
  delhi: 'Asia/Kolkata',
  'new delhi': 'Asia/Kolkata',
  hyderabad: 'Asia/Kolkata',
  kolkata: 'Asia/Kolkata',
  pune: 'Asia/Kolkata',
  kochi: 'Asia/Kolkata',
  ahmedabad: 'Asia/Kolkata',
  london: 'Europe/London',
  'new york': 'America/New_York',
  tokyo: 'Asia/Tokyo',
  dubai: 'Asia/Dubai',
  sydney: 'Australia/Sydney',
  paris: 'Europe/Paris',
  berlin: 'Europe/Berlin',
  singapore: 'Asia/Singapore',
  toronto: 'America/Toronto',
  'san francisco': 'America/Los_Angeles',
  'los angeles': 'America/Los_Angeles',
  chicago: 'America/Chicago',
  rome: 'Europe/Rome',
  bangkok: 'Asia/Bangkok',
  seoul: 'Asia/Seoul',
  cairo: 'Africa/Cairo',
  'rio de janeiro': 'America/Sao_Paulo',
  auckland: 'Pacific/Auckland',
};

export const CITY_FLAG_MAP: Record<string, string> = {
  chennai: '🇮🇳',
  coimbatore: '🇮🇳',
  bengaluru: '🇮🇳',
  mumbai: '🇮🇳',
  delhi: '🇮🇳',
  kolkata: '🇮🇳',
  pune: '🇮🇳',
  hyderabad: '🇮🇳',
  london: '🇬🇧',
  'new york': '🇺🇸',
  tokyo: '🇯🇵',
  dubai: '🇦🇪',
  sydney: '🇦🇺',
  paris: '🇫🇷',
  berlin: '🇩🇪',
  singapore: '🇸🇬',
  toronto: '🇨🇦',
  'los angeles': '🇺🇸',
  chicago: '🇺🇸',
  rome: '🇮🇹',
  bangkok: '🇹🇭',
  seoul: '🇰🇷',
  cairo: '🇪🇬',
  'rio de janeiro': '🇧🇷',
  auckland: '🇳🇿',
};

export const CITY_COUNTRY_MAP: Record<string, string> = {
  chennai: 'India',
  coimbatore: 'India',
  bengaluru: 'India',
  mumbai: 'India',
  delhi: 'India',
  kolkata: 'India',
  london: 'UK',
  'new york': 'USA',
  tokyo: 'Japan',
  dubai: 'UAE',
  sydney: 'Australia',
  paris: 'France',
  berlin: 'Germany',
  singapore: 'Singapore',
  toronto: 'Canada',
  'los angeles': 'USA',
  chicago: 'USA',
  rome: 'Italy',
  bangkok: 'Thailand',
  seoul: 'South Korea',
  cairo: 'Egypt',
  'rio de janeiro': 'Brazil',
  auckland: 'New Zealand',
};

export const getHomeTimezone = (city: string, clockCities: ClockCity[] = []): string => {
  const normalized = (city || '').trim().toLowerCase();
  const foundClockCity = clockCities.find((c) => (c.city || '').trim().toLowerCase() === normalized);
  if (foundClockCity && foundClockCity.timezone) return foundClockCity.timezone;

  if (CITY_TIMEZONE_MAP[normalized]) return CITY_TIMEZONE_MAP[normalized];
  const matchedKey = Object.keys(CITY_TIMEZONE_MAP).find((key) => normalized.includes(key));
  if (matchedKey) return CITY_TIMEZONE_MAP[matchedKey];

  return 'Asia/Kolkata';
};

export const getFlagForCity = (city: string): string => {
  const normalized = (city || '').trim().toLowerCase();
  if (CITY_FLAG_MAP[normalized]) return CITY_FLAG_MAP[normalized];
  const matchedKey = Object.keys(CITY_FLAG_MAP).find((key) => normalized.includes(key));
  if (matchedKey) return CITY_FLAG_MAP[matchedKey];
  return '🌐';
};

export const getCountryForCity = (city: string): string => {
  const normalized = (city || '').trim().toLowerCase();
  if (CITY_COUNTRY_MAP[normalized]) return CITY_COUNTRY_MAP[normalized];
  const matchedKey = Object.keys(CITY_COUNTRY_MAP).find((key) => normalized.includes(key));
  if (matchedKey) return CITY_COUNTRY_MAP[matchedKey];
  return 'Global';
};

export const GLOBAL_CITIES_DATABASE: ClockCity[] = [
  { id: 'london', city: 'London', country: 'UK', timezone: 'Europe/London', flag: '🇬🇧' },
  { id: 'new_york', city: 'New York', country: 'USA', timezone: 'America/New_York', flag: '🇺🇸' },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { id: 'dubai', city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', flag: '🇦🇪' },
  { id: 'sydney', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺' },
  { id: 'paris', city: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷' },
  { id: 'berlin', city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', flag: '🇩🇪' },
  { id: 'singapore', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬' },
  { id: 'toronto', city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦' },
  { id: 'los_angeles', city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { id: 'chicago', city: 'Chicago', country: 'USA', timezone: 'America/Chicago', flag: '🇺🇸' },
  { id: 'rome', city: 'Rome', country: 'Italy', timezone: 'Europe/Rome', flag: '🇮🇹' },
  { id: 'bangkok', city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', flag: '🇹🇭' },
  { id: 'seoul', city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', flag: '🇰🇷' },
  { id: 'cairo', city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', flag: '🇪🇬' },
  { id: 'rio', city: 'Rio de Janeiro', country: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
  { id: 'auckland', city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', flag: '🇳🇿' },
];

export function searchWorldClockCities(query: string): ClockCity[] {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  const matches = GLOBAL_CITIES_DATABASE.filter(
    (c) => c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  );

  if (matches.length > 0) return matches;

  const formattedCity = query.trim().charAt(0).toUpperCase() + query.trim().slice(1);
  return [
    {
      id: `custom-${formattedCity.toLowerCase()}`,
      city: formattedCity,
      country: getCountryForCity(formattedCity),
      timezone: getHomeTimezone(formattedCity),
      flag: getFlagForCity(formattedCity),
    },
  ];
}
