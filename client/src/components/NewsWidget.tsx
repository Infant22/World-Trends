import React, { useState, useMemo } from 'react';
import { NewsArticle } from '../types';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import { useGuest } from '../context/GuestContext';
import { getHomeTimezone } from '../lib/utils';

export function formatNewsTimestamp(publishedAt: string, timezone: string): string {
  try {
    const articleDate = new Date(publishedAt);
    if (isNaN(articleDate.getTime())) return '';

    const now = new Date();

    const articleDayStr = articleDate.toLocaleDateString('en-US', { timeZone: timezone });
    const todayStr = now.toLocaleDateString('en-US', { timeZone: timezone });

    const timeStr = articleDate.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (articleDayStr === todayStr) {
      return timeStr;
    } else {
      const dateStr = articleDate.toLocaleDateString('en-US', {
        timeZone: timezone,
        month: 'short',
        day: 'numeric',
      });
      return `${dateStr}, ${timeStr}`;
    }
  } catch {
    return new Date(publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

interface NewsWidgetProps {
  articles: NewsArticle[];
  isLoading?: boolean;
  isError?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All News' },
  { id: 'technology', label: 'Tech' },
  { id: 'world', label: 'World' },
  { id: 'sports', label: 'Sports' },
  { id: 'finance', label: 'Finance' },
];

export const NewsWidget: React.FC<NewsWidgetProps> = ({ articles, isLoading, isError }) => {
  const { preferences } = useGuest();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  const homeTimezone = getHomeTimezone(preferences.homeCity, preferences.clockCities);
  const selectedInterests = preferences.selectedInterests || [];

  const matchesNewsTopic = (article: NewsArticle, topic: string) => {
    const t = topic.toLowerCase();
    const cat = (article.category || '').toLowerCase();
    const title = (article.title || '').toLowerCase();
    const desc = (article.description || '').toLowerCase();

    if (t === 'tech') {
      return cat === 'technology' || cat === 'tech' || title.includes('tech') || title.includes('ai') || desc.includes('tech') || desc.includes('ai');
    }
    if (t === 'sports') {
      return cat === 'sports' || title.includes('sport') || title.includes('champions') || title.includes('league') || title.includes('match') || desc.includes('sport');
    }
    if (t === 'world news') {
      return cat === 'world' || cat === 'general' || title.includes('world') || title.includes('global') || title.includes('international') || desc.includes('global');
    }
    if (t === 'finance') {
      return cat === 'finance' || cat === 'business' || title.includes('finance') || title.includes('bank') || title.includes('market') || desc.includes('inflation');
    }
    if (t === 'movies') {
      return cat === 'movies' || cat === 'entertainment' || title.includes('movie') || title.includes('film') || title.includes('cinema') || desc.includes('movie');
    }
    if (t === 'science') {
      return cat === 'science' || title.includes('science') || title.includes('space') || title.includes('research') || desc.includes('energy');
    }
    return false;
  };

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'all') {
      return articles.slice(0, 7);
    }
    return articles
      .filter((a) => a.category.toLowerCase() === selectedCategory)
      .slice(0, 4);
  }, [articles, selectedCategory]);

  const sortedArticles = useMemo(() => {
    if (selectedInterests.length === 0) return filteredArticles;

    return [...filteredArticles].sort((a, b) => {
      const aScore = selectedInterests.filter((t) => matchesNewsTopic(a, t)).length;
      const bScore = selectedInterests.filter((t) => matchesNewsTopic(b, t)).length;
      return bScore - aScore;
    });
  }, [filteredArticles, selectedInterests]);

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-5 md:p-6 skeleton-shimmer space-y-4">
        <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="space-y-3">
          <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError && articles.length === 0) {
    return (
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 md:p-6 relative overflow-hidden transition-all duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-500/20">
                <Newspaper className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Global News Stream</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Verified Editorial Coverage</p>
              </div>
            </div>
            <span className="text-[10px] text-rose-700 dark:text-rose-400 font-mono bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-200/80 dark:border-rose-500/20 font-semibold">
              Offline
            </span>
          </div>
          <div className="h-[340px] flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              News is temporarily unavailable.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Unable to connect to news service. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 md:p-6 relative overflow-hidden transition-all duration-200">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-500/20">
              <Newspaper className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Global News Stream</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Verified Editorial Coverage</p>
            </div>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3.5 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                  : 'bg-slate-100/80 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Articles Stream */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 h-[340px] overflow-y-auto pr-1 transition-all duration-200">
          {sortedArticles.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              No articles available for this category.
            </div>
          ) : (
            sortedArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className="py-3 px-2 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group flex gap-3.5 items-center"
              >
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover bg-slate-200 dark:bg-slate-800 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-[10px]">
                    <span className="font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                      {article.source}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              ✕
            </button>
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">{activeArticle.source}</span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1 mb-3">{activeArticle.title}</h2>
            {activeArticle.imageUrl && (
              <img src={activeArticle.imageUrl} alt="" className="w-full h-44 rounded-xl object-cover mb-4" />
            )}
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{activeArticle.description}</p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Close
              </button>
              <a
                href={activeArticle.url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold flex items-center gap-1 shadow-xs"
              >
                <span>Read Article</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
