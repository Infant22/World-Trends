import React, { useState } from 'react';
import { CountryDetails } from '../types';
import { Search, Compass, Users, Landmark, Coins, MapPin } from 'lucide-react';

interface ExploreWidgetProps {
  country: CountryDetails;
  onSearch: (countryName: string) => void;
  isLoading?: boolean;
}

export const ExploreWidget: React.FC<ExploreWidgetProps> = ({ country, onSearch, isLoading }) => {
  const [inputQuery, setInputQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      onSearch(inputQuery.trim());
      setInputQuery('');
    }
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-500/20">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Explore Nations</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Global Country Data & Map</p>
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSubmit} className="relative mb-4">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Search nation (e.g., Japan, France, Brazil)..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </form>

        {/* Country Showcase Card */}
        {isLoading ? (
          <div className="h-32 skeleton-shimmer rounded-xl" />
        ) : (
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{country.flag}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{country.name}</h3>
                  <p className="text-xs text-sky-700 dark:text-sky-400 font-semibold">{country.region} • {country.subregion}</p>
                </div>
              </div>
              <a
                href={country.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 transition-all text-xs font-semibold flex items-center gap-1 shadow-xs"
                title="View Map"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Map</span>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/60 shadow-xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mb-0.5 font-medium">
                  <Landmark className="h-3 w-3 text-amber-500" />
                  <span>Capital</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{country.capital}</div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/60 shadow-xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mb-0.5 font-medium">
                  <Users className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Population</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {(country.population / 1000000).toFixed(1)}M
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/60 shadow-xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mb-0.5 font-medium">
                  <Coins className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  <span>Currency</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {country.currencies[0]?.code || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
