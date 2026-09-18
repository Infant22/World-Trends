import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, TrendingUp } from 'lucide-react';
import { useGuest } from '../context/GuestContext';
import { fetchTrending } from '../services/api';

export const TrendingWidget: React.FC = () => {
  const { preferences } = useGuest();
  const selectedInterests = preferences.selectedInterests || [];
  const homeCountry = preferences.homeCountry || 'India';

  const { data: trendingTopics = [], isLoading } = useQuery({
    queryKey: ['trending', homeCountry, selectedInterests],
    queryFn: () => fetchTrending(homeCountry, selectedInterests),
    staleTime: 1000 * 60 * 15,
  });

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 md:p-6 relative overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200/80 dark:border-orange-500/20">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Trending Now</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Real-time X Trends</p>
            </div>
          </div>
          <span className="text-[10px] text-orange-800 dark:text-orange-300 font-mono bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-200/80 dark:border-orange-500/20 font-semibold">
            X Trends
          </span>
        </div>

        {/* Topics List */}
        {trendingTopics.length === 0 && !isLoading ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Trending unavailable
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {trendingTopics.slice(0, 4).map((topic) => (
              <div
                key={topic.id}
                className="py-2.5 px-2 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {topic.tag}
                    </span>
                    {topic.badge && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-orange-100/80 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300">
                        {topic.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{topic.category}</p>
                </div>

                {topic.momentum && (
                  <div className="text-right flex items-center gap-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{topic.momentum}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
