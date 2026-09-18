import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Calendar, Bookmark, ArrowRight } from 'lucide-react';
import { fetchOnThisDay } from '../services/api';

export const InterestingTodayWidget: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const { data: event } = useQuery({
    queryKey: ['onthisday'],
    queryFn: fetchOnThisDay,
    staleTime: 1000 * 60 * 60,
  });

  const year = event?.year || 1995;
  const category = event?.category || 'Milestone';
  const title = event?.title || 'First International Web Standards Consortium Established';
  const description =
    event?.description ||
    'Pioneering computer scientists assembled to form the global standards for modern web protocols, laying the foundation for modern real-time internet architectures.';
  const pageUrl = event?.pageUrl || 'https://en.wikipedia.org/wiki/World_Wide_Web_Consortium';

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 md:p-6 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Interesting Today</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">On This Day in History</p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/20 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{currentDate}</span>
          </span>
        </div>

        {/* Discovery Highlight Container */}
        <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {year} • {category}
            </span>
            <Bookmark className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {title}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>

          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pt-1 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold group cursor-pointer"
          >
            <span>Discover more history</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};
