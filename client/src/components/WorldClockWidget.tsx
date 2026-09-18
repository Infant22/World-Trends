import React, { useState, useEffect, useMemo } from 'react';
import { useGuest } from '../context/GuestContext';
import { Clock, Plus, Trash2, Search, Check } from 'lucide-react';
import { ClockCity } from '../types';
import { searchWorldClockCities, GLOBAL_CITIES_DATABASE } from '../lib/utils';

export const WorldClockWidget: React.FC = () => {
  const { preferences, addClockCity, removeClockCity } = useGuest();
  const [times, setTimes] = useState<Record<string, { time: string; date: string }>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isMaxReached = preferences.clockCities.length >= 4;

  const searchResults = useMemo(() => {
    return searchWorldClockCities(searchQuery);
  }, [searchQuery]);

  const quickSuggestions = useMemo(() => {
    return GLOBAL_CITIES_DATABASE.filter(
      (c) => !preferences.clockCities.some((existing) => existing.city.toLowerCase() === c.city.toLowerCase())
    );
  }, [preferences.clockCities]);

  const handleAddCity = (city: ClockCity) => {
    if (isMaxReached) return;
    addClockCity(city);
    setSearchQuery('');
    if (preferences.clockCities.length + 1 >= 4) {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, { time: string; date: string }> = {};
      preferences.clockCities.slice(0, 4).forEach((c) => {
        try {
          const now = new Date();
          const timeStr = now.toLocaleTimeString('en-US', {
            timeZone: c.timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
          const dateStr = now.toLocaleDateString('en-US', {
            timeZone: c.timezone,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          newTimes[c.id] = { time: timeStr, date: dateStr };
        } catch {
          newTimes[c.id] = { time: '--:--', date: '--' };
        }
      });
      setTimes(newTimes);
    };

    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, [preferences.clockCities]);

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-4 md:p-5 relative overflow-hidden transition-all duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/20">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-none">World Clock</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Timezones</p>
            </div>
          </div>
          <button
            disabled={isMaxReached}
            onClick={() => {
              if (isMaxReached) return;
              setIsAdding(!isAdding);
              setSearchQuery('');
            }}
            className={`px-2 py-0.5 rounded-md border transition-all text-[10px] font-semibold flex items-center gap-1 ${
              isMaxReached
                ? 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-slate-800 cursor-not-allowed'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-400 border-slate-200 dark:border-slate-700 cursor-pointer'
            }`}
            title={isMaxReached ? 'Maximum 4 clock locations reached' : 'Add city to World Clock'}
          >
            <Plus className="h-3 w-3" />
            <span>{isMaxReached ? '4/4 Max' : 'Add'}</span>
          </button>
        </div>

        {/* Add City Interface */}
        {isAdding && !isMaxReached && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Quick Suggestion Buttons when search is empty */}
            {!searchQuery.trim() && (
              <div>
                <p className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Quick Suggestions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickSuggestions.slice(0, 6).map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleAddCity(city)}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-600/30 text-[10px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 transition-all flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <span>{city.flag}</span>
                      <span>{city.city}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results List when typing */}
            {searchQuery.trim() && (
              <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                {searchResults.length === 0 ? (
                  <p className="text-[10px] text-slate-400 px-2 py-1">No matching cities found</p>
                ) : (
                  searchResults.map((city) => {
                    const isAlreadyAdded = preferences.clockCities.some(
                      (c) => c.city.toLowerCase() === city.city.toLowerCase()
                    );
                    return (
                      <button
                        key={city.id}
                        disabled={isAlreadyAdded}
                        onClick={() => handleAddCity(city)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isAlreadyAdded
                            ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800/40 text-slate-400'
                            : 'hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-800 dark:text-slate-200 cursor-pointer'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          <span>{city.flag}</span>
                          <span>{city.city}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({city.country})</span>
                        </span>
                        {isAlreadyAdded ? (
                          <Check className="h-3.5 w-3.5 text-slate-400" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 text-indigo-500" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clock Cards Grid (Strictly max 4 items / 2x2 grid) */}
      <div className="grid grid-cols-2 gap-2">
        {preferences.clockCities.slice(0, 4).map((city, index) => {
          const t = times[city.id] || { time: '--:--', date: '--' };
          const isHomeCity = index === 0 || city.id === 'home';
          return (
            <div
              key={city.id}
              className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors flex flex-col justify-between group relative"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate">
                  <span>{city.flag}</span>
                  <span className="truncate">{city.city}</span>
                </span>
                {!isHomeCity && (
                  <button
                    onClick={() => removeClockCity(city.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                    title="Remove city"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="text-sm font-bold font-mono text-indigo-700 dark:text-indigo-300 tracking-tight leading-tight mt-0.5">{t.time}</div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{t.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
