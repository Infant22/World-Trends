import React, { useState, useEffect } from 'react';
import { useGuest } from '../context/GuestContext';
import { Sun, Moon, MapPin, Settings, Search, Globe2 } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenExplore: (query: string) => void;
}

const CITY_TIMEZONE_MAP: Record<string, string> = {
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
};

const getHomeTimezone = (city: string, clockCities: any[] = []): string => {
  const normalized = (city || '').trim().toLowerCase();
  const foundClockCity = clockCities.find((c) => (c.city || '').trim().toLowerCase() === normalized);
  if (foundClockCity && foundClockCity.timezone) return foundClockCity.timezone;

  if (CITY_TIMEZONE_MAP[normalized]) return CITY_TIMEZONE_MAP[normalized];

  const matchedKey = Object.keys(CITY_TIMEZONE_MAP).find((key) => normalized.includes(key));
  if (matchedKey) return CITY_TIMEZONE_MAP[matchedKey];

  return 'Asia/Kolkata';
};

const getGreetingForHour = (hour: number): string => {
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 22) return 'Good Evening';
  return 'Good Night';
};

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenExplore }) => {
  const { preferences, updatePreferences } = useGuest();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timezone = getHomeTimezone(preferences.homeCity, preferences.clockCities);

      try {
        const dateStr = now.toLocaleDateString('en-US', {
          timeZone: timezone,
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        });

        const timeStr = now.toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        setCurrentTime(`${dateStr} • ${timeStr}`);

        const hourStr = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          hour12: false,
        }).format(now);
        const hour = parseInt(hourStr, 10);
        setGreeting(getGreetingForHour(hour));
      } catch {
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        setCurrentTime(`${dateStr} • ${timeStr}`);
        setGreeting(getGreetingForHour(now.getHours()));
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [preferences.homeCity, preferences.clockCities]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    onOpenExplore(searchQuery.trim());
    setSearchQuery('');
  };

  const toggleTheme = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: nextTheme });
  };

  return (
    <header className="relative md:sticky md:top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 md:bg-white/80 md:dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 mb-4 sm:mb-5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-4">
        {/* Brand & Location Greeting */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Globe2 className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none truncate">
                WORLD TRENDS
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium truncate">
                <span className="truncate">{greeting}</span>
                <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
                <MapPin className="h-3 w-3 text-sky-500 inline shrink-0" />
                <span className="text-sky-700 dark:text-sky-300 font-semibold truncate max-w-[90px] sm:max-w-[140px]">
                  {preferences.homeCity}
                </span>
              </p>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="md:hidden flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {preferences.theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Guest preferences"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Live Time Indicator (Visible on small screens < md) */}
        <div className="md:hidden flex items-center justify-between w-full text-[10px] font-mono px-0.5 text-slate-500 dark:text-slate-400 border-t border-b border-slate-100 dark:border-slate-800/60 py-1 my-0.5">
          <span className="text-sky-600 dark:text-sky-400 font-bold truncate pr-2">{currentTime}</span>
          <span className="font-sans font-medium text-[9px] uppercase tracking-wider text-slate-400 shrink-0">Live Dashboard</span>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-64 lg:w-80 min-w-0 relative shrink-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, nation, or topic..."
              className="w-full h-8.5 pl-9 pr-3 rounded-lg bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
        </form>

        {/* Desktop Navigation Controls & Live Clock (Visible >= md) */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">
          <div className="text-right border-r border-slate-200 dark:border-slate-800 pr-2.5 lg:pr-3">
            <div className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 tracking-wide whitespace-nowrap">{currentTime}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Live Dashboard</div>
          </div>

          <button
            onClick={toggleTheme}
            className="h-8.5 px-2.5 lg:px-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium shrink-0 cursor-pointer"
            title="Toggle theme"
          >
            {preferences.theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden lg:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden lg:inline">Dark</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="h-8.5 px-2.5 lg:px-3 rounded-lg bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>Preferences</span>
          </button>
        </div>
      </div>
    </header>
  );
};
