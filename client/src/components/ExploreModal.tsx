import React from 'react';
import { ExploreResult, CountryDetails } from '../types';
import { X, Compass, Users, Landmark, Coins, MapPin, ExternalLink, User, Flame, Search, Info } from 'lucide-react';

interface ExploreModalProps {
  country: ExploreResult | CountryDetails | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const ExploreModal: React.FC<ExploreModalProps> = ({ country, isOpen, onClose, isLoading }) => {
  if (!isOpen) return null;

  const result = country as (ExploreResult & CountryDetails) | null;
  const resultType = result?.type || (result?.capital ? 'country' : null);

  const getHeaderBadge = () => {
    if (resultType === 'person') return { icon: <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />, label: 'Person / Entity Overview' };
    if (resultType === 'location') return { icon: <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />, label: 'Location Overview' };
    if (resultType === 'topic') return { icon: <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />, label: 'Topic Overview' };
    return { icon: <Compass className="h-4 w-4 text-sky-600 dark:text-sky-400" />, label: 'Country Overview' };
  };

  const badge = getHeaderBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-500/20">
            {badge.icon}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{badge.label}</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">On-Demand Intelligence Result</p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-48 skeleton-shimmer rounded-xl" />
        ) : !result ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No results found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                Try searching for a country (e.g. Japan, USA, India), city (e.g. Chennai), person (e.g. Virat Kohli), or topic (e.g. Cricket).
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{result.flagOrIcon || result.flag || '📍'}</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {result.title || result.name}
                  </h3>
                  <p className="text-xs text-sky-700 dark:text-sky-400 font-semibold">
                    {result.subtitle || `${result.region || ''} • ${result.subregion || ''}`}
                  </p>
                </div>
              </div>
              {result.mapUrl && (
                <a
                  href={result.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Google Map</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {result.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/60 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                {result.description}
              </p>
            )}

            {result.details && result.details.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                {result.details.map((detail, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/60 shadow-xs">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mb-0.5 font-medium">
                      <Info className="h-3 w-3 text-sky-500" />
                      <span>{detail.label}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{detail.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/60 shadow-xs">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mb-0.5 font-medium">
                    <Landmark className="h-3 w-3 text-amber-500" />
                    <span>Capital</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{result.capital || 'N/A'}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/60 shadow-xs">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mb-0.5 font-medium">
                    <Users className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Population</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {result.population ? `${(result.population / 1000000).toFixed(1)}M` : 'N/A'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/60 shadow-xs">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mb-0.5 font-medium">
                    <Coins className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Currency</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {result.currencies && result.currencies[0] ? result.currencies[0].code : 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
