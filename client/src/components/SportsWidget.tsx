import React, { useState, useMemo } from 'react';
import { SportsMatch } from '../types';
import { Trophy } from 'lucide-react';
import { useGuest } from '../context/GuestContext';
import { rankAndFilterSportsMatches } from '../services/sportsRanking';

interface SportsWidgetProps {
  matches: SportsMatch[];
  isLoading?: boolean;
}

interface TeamLogoProps {
  logo?: string;
  teamName: string;
  sport?: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ logo, teamName, sport }) => {
  const [imgError, setImgError] = useState(false);

  const sportEmoji = useMemo(() => {
    switch ((sport || '').toLowerCase()) {
      case 'cricket':
        return '🏏';
      case 'basketball':
        return '🏀';
      case 'tennis':
        return '🎾';
      default:
        return '⚽';
    }
  }, [sport]);

  const isUrl = Boolean(logo && (logo.startsWith('http://') || logo.startsWith('https://')));

  if (isUrl && !imgError) {
    return (
      <img
        src={logo}
        alt={teamName}
        onError={() => setImgError(true)}
        className="w-4 h-4 object-contain rounded-xs shrink-0 bg-slate-200/50 dark:bg-slate-800/50"
      />
    );
  }

  const fallbackIcon = logo && !isUrl ? logo : sportEmoji;

  return <span className="text-sm shrink-0 leading-none">{fallbackIcon}</span>;
};

export const SportsWidget: React.FC<SportsWidgetProps> = ({ matches, isLoading }) => {
  const { preferences } = useGuest();
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'UPCOMING'>('ALL');

  const filteredMatches = useMemo(() => {
    return rankAndFilterSportsMatches(matches, {
      filter,
      limit: 3,
      preferences,
    });
  }, [matches, filter, preferences]);

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-full flex flex-col justify-between skeleton-shimmer">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 md:p-6 relative overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/20">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Live Sports Hub</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Scores & Schedule</p>
            </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('LIVE')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                filter === 'LIVE'
                  ? 'bg-rose-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live
            </button>
          </div>
        </div>

        {/* Match Cards List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredMatches.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              {filter === 'LIVE' ? 'No live events right now.' : 'No sports events right now.'}
            </div>
          ) : (
            filteredMatches.map((match) => (
            <div
              key={match.id}
              className="py-2.5 px-2 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="uppercase tracking-wider font-mono break-words whitespace-normal min-w-0 pr-1 leading-snug">{match.league}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[9px] shrink-0 whitespace-nowrap ml-1 ${
                    match.status === 'LIVE'
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300/80 dark:border-rose-500/30'
                      : match.status === 'FINISHED'
                      ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                      : 'bg-indigo-100/80 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300'
                  }`}
                >
                  {match.status === 'LIVE' ? `LIVE • ${match.timeOrDate}` : match.timeOrDate}
                </span>
              </div>

              {/* Teams & Scores */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-2 text-center min-w-0">
                <div className="text-left font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 min-w-0">
                  <TeamLogo logo={match.homeLogo} teamName={match.homeTeam} sport={match.sport} />
                  <span className="truncate">{match.homeTeam}</span>
                </div>

                <div className="px-2 sm:px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 font-mono font-bold text-xs text-rose-600 dark:text-rose-400 shadow-xs shrink-0 whitespace-nowrap">
                  {(() => {
                    const hasHome = match.homeScore !== undefined && match.homeScore !== null && String(match.homeScore).trim() !== '' && String(match.homeScore).toLowerCase() !== 'undefined';
                    const hasAway = match.awayScore !== undefined && match.awayScore !== null && String(match.awayScore).trim() !== '' && String(match.awayScore).toLowerCase() !== 'undefined';

                    if (!hasHome && !hasAway) return 'VS';
                    const homeDisplay = hasHome ? String(match.homeScore) : 'VS';
                    const awayDisplay = hasAway ? String(match.awayScore) : 'VS';
                    return `${homeDisplay} - ${awayDisplay}`;
                  })()}
                </div>

                <div className="text-right font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-end gap-1.5 min-w-0">
                  <span className="truncate">{match.awayTeam}</span>
                  <TeamLogo logo={match.awayLogo} teamName={match.awayTeam} sport={match.sport} />
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Data Attribution */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end">
          {(() => {
            const hasSportScore = filteredMatches.some((m) => m.sport !== 'cricket');
            const hasCricket = filteredMatches.some((m) => m.sport === 'cricket');

            if (hasSportScore && hasCricket) {
              return (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Powered by{' '}
                  <a href="https://sportscore.com" target="_blank" rel="noreferrer" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    SportScore
                  </a>{' '}
                  &{' '}
                  <a href="https://www.espn.in/cricket/" target="_blank" rel="noreferrer" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    ESPN
                  </a>
                </span>
              );
            }
            if (hasCricket && !hasSportScore) {
              return (
                <a
                  href="https://www.espn.in/cricket/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
                >
                  Powered by ESPN
                </a>
              );
            }
            return (
              <a
                href="https://sportscore.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
              >
                Powered by SportScore
              </a>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
