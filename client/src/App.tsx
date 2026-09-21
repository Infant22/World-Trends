import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { GuestProvider, useGuest } from '../src/context/GuestContext';
import { Header } from './components/Header';
import { PreferencesDrawer } from './components/PreferencesDrawer';
import { WeatherWidget } from './components/WeatherWidget';
import { CurrencyWidget } from './components/CurrencyWidget';
import { WorldClockWidget } from './components/WorldClockWidget';
import { NewsWidget } from './components/NewsWidget';
import { SportsWidget } from './components/SportsWidget';
import { TrendingWidget } from './components/TrendingWidget';
import { InterestingTodayWidget } from './components/InterestingTodayWidget';
import { ExploreModal } from './components/ExploreModal';
import { fetchWeather, fetchCurrencies, fetchCountryDetails, fetchNews, fetchSports } from './services/api';
import { RefreshCw, Sparkles, Globe2, Activity, Newspaper, Trophy, LayoutGrid } from 'lucide-react';
import { calculateDashboardLayout, WidgetKey } from './services/dashboardLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

const formatLastUpdated = (lastRefreshedAt: Date | null, now: Date): string | null => {
  if (!lastRefreshedAt) return null;
  const diffMs = Math.max(0, now.getTime() - lastRefreshedAt.getTime());
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Updated just now';
  if (diffMins === 1) return 'Updated 1 min ago';
  return `Updated ${diffMins} min ago`;
};

const DashboardContent: React.FC = () => {
  const queryClientInstance = useQueryClient();
  const { preferences } = useGuest();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [exploreQuery, setExploreQuery] = useState('Japan');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const currentLang = preferences.newsLanguage || 'english';
      await Promise.all([
        queryClientInstance.fetchQuery({
          queryKey: ['news', currentLang],
          queryFn: () => fetchNews('all', currentLang, true),
        }),
        queryClientInstance.fetchQuery({
          queryKey: ['sports'],
          queryFn: () => fetchSports(true),
        }),
        queryClientInstance.refetchQueries({ type: 'active' }),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      const refreshDate = new Date();
      setLastRefreshedAt(refreshDate);
      setNow(refreshDate);
    } catch (error) {
      console.warn('[Refresh] Dashboard refetch error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // React Queries with fallback
  const weatherQuery = useQuery({
    queryKey: ['weather', preferences.homeCity],
    queryFn: () => fetchWeather(preferences.homeCity),
  });

  const currencyQuery = useQuery({
    queryKey: ['currencies', preferences.baseCurrency],
    queryFn: () => fetchCurrencies(preferences.baseCurrency),
  });

  const countryQuery = useQuery({
    queryKey: ['country', exploreQuery],
    queryFn: () => fetchCountryDetails(exploreQuery),
    enabled: isExploreOpen,
  });

  const newsQuery = useQuery({
    queryKey: ['news', preferences.newsLanguage || 'english'],
    queryFn: () => fetchNews('all', preferences.newsLanguage || 'english', false),
    staleTime: 1000 * 60 * 60, // 1 hour client cache
    gcTime: 1000 * 60 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0,
  });

  const sportsQuery = useQuery({
    queryKey: ['sports'],
    queryFn: () => fetchSports(),
    staleTime: 1000 * 60 * 2, // 2 minutes client cache for live sports
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: true,
    retry: 0,
  });

  const handleOpenExplore = (query: string) => {
    setExploreQuery(query);
    setIsExploreOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white transition-colors duration-200">
      <div>
        {/* Header Navigation Bar with Global Search */}
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenExplore={handleOpenExplore}
        />

        {/* Guest Preferences Drawer */}
        <PreferencesDrawer
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* On-Demand Country Explorer Modal */}
        <ExploreModal
          country={countryQuery.data || null}
          isOpen={isExploreOpen}
          onClose={() => setIsExploreOpen(false)}
          isLoading={countryQuery.isLoading}
        />

        {/* Main Information Dashboard Container */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 space-y-6 sm:space-y-8 w-full min-w-0">
          {/* Personalization System Status Bar */}
          <div className="py-2.5 px-3 sm:px-4 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs w-full min-w-0">
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <div className="p-1 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-500/20 shrink-0 mt-0.5 sm:mt-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="text-xs min-w-0 leading-normal">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Guest Personalization Active</span>
                <span className="text-slate-300 dark:text-slate-700 mx-1.5 sm:mx-2">•</span>
                <span className="text-slate-600 dark:text-slate-400 break-words">
                  Showing trends for <strong className="text-sky-700 dark:text-sky-300 font-semibold">{preferences.homeCity}</strong> ({preferences.targetCurrency})
                  {preferences.selectedInterests && preferences.selectedInterests.length > 0 && (
                    <span> • Prioritizing <strong className="text-sky-700 dark:text-sky-300 font-semibold">{preferences.selectedInterests.join(', ')}</strong></span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 shrink-0 gap-2.5">
              {lastRefreshedAt && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                  {formatLastUpdated(lastRefreshedAt, now)}
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Adaptive Dynamic Dashboard Layout */}
          {(() => {
            const layout = calculateDashboardLayout(preferences.visibleWidgets);

            const renderWidgetByKey = (key: WidgetKey) => {
              switch (key) {
                case 'weather':
                  return (
                    <section key="weather" className="space-y-3 w-full min-w-0">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800/60 gap-2 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-0">
                          <Activity className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                          <span className="truncate">Now in {preferences.homeCity}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono shrink-0">LIVE OVERVIEW</span>
                      </div>
                      <WeatherWidget
                        data={weatherQuery.data || ({} as any)}
                        isLoading={weatherQuery.isLoading}
                      />
                    </section>
                  );

                case 'currency':
                  return (
                    <section key="currency" className="space-y-3 w-full min-w-0">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800/60 gap-2 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-0">
                          <Globe2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">Live Utilities</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono shrink-0">CURRENCY CONVERTER</span>
                      </div>
                      <CurrencyWidget
                        data={currencyQuery.data || ({} as any)}
                        isLoading={currencyQuery.isLoading}
                      />
                    </section>
                  );

                case 'worldClock':
                  return (
                    <section key="worldClock" className="space-y-3 w-full min-w-0">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800/60 gap-2 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-0">
                          <Globe2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">Live Utilities</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono shrink-0">WORLD CLOCK</span>
                      </div>
                      <WorldClockWidget />
                    </section>
                  );

                case 'news':
                  return (
                    <section key="news" className="space-y-3 w-full min-w-0">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800/60 gap-2 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-0">
                          <Newspaper className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                          <span className="truncate">Headlines & Global News</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono shrink-0">EDITORIAL STREAM</span>
                      </div>
                      <NewsWidget
                        articles={newsQuery.data || []}
                        isLoading={newsQuery.isLoading}
                        isError={newsQuery.isError}
                      />
                    </section>
                  );

                case 'trending':
                  return (
                    <section key="trending" className="space-y-3 w-full min-w-0">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800/60 gap-2 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-0">
                          <Sparkles className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                          <span className="truncate">Trending Topics</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono shrink-0">REAL-TIME</span>
                      </div>
                      <TrendingWidget />
                    </section>
                  );

                case 'sports':
                  return (
                    <section key="sports" className="space-y-3 w-full min-w-0">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800/60 gap-2 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-0">
                          <Trophy className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span className="truncate">Sports & Discovery</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono shrink-0">LIVE ACTION</span>
                      </div>
                      <SportsWidget
                        matches={sportsQuery.data || []}
                        isLoading={sportsQuery.isLoading}
                      />
                    </section>
                  );

                case 'explore':
                  return (
                    <section key="explore" className="space-y-3 w-full min-w-0">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800/60 gap-2 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-0">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="truncate">Featured Discovery</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono shrink-0">ON THIS DAY</span>
                      </div>
                      <InterestingTodayWidget />
                    </section>
                  );

                default:
                  return null;
              }
            };

            const renderColumnWidgets = (keys: WidgetKey[]) => {
              const elements: React.ReactNode[] = [];
              for (const key of keys) {
                const widgetEl = renderWidgetByKey(key);
                if (widgetEl) elements.push(widgetEl);
              }
              return elements;
            };

            if (layout.mode === 'EMPTY') {
              return (
                <div className="glass-panel rounded-2xl p-10 text-center space-y-3 my-8">
                  <LayoutGrid className="h-8 w-8 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">All Dashboard Widgets Hidden</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    You have disabled all widgets in your preferences. Open Preferences to re-enable your favorite widgets.
                  </p>
                </div>
              );
            }

            // Mobile-specific explicit widget order sequence (< lg)
            const MOBILE_ORDER: WidgetKey[] = ['weather', 'currency', 'worldClock', 'news', 'trending', 'sports', 'explore'];
            const activeMobileKeys = MOBILE_ORDER.filter((key) => !!preferences.visibleWidgets[key]);

            return (
              <>
                {/* Mobile Viewport Layout (< lg): Clean vertical DOM sequence */}
                <div className="space-y-6 lg:hidden w-full min-w-0">
                  {activeMobileKeys.map((key) => renderWidgetByKey(key))}
                </div>

                {/* Desktop Viewport Layout (>= lg): Approved 2-column grid layout */}
                <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start w-full min-w-0">
                  <div className="lg:col-span-2 space-y-6">
                    {renderColumnWidgets(layout.leftWidgets)}
                  </div>
                  {layout.rightWidgets.length > 0 && (
                    <div className="lg:col-span-1 space-y-6">
                      {renderColumnWidgets(layout.rightWidgets)}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </main>
      </div>

      {/* Compact Dashboard Footer */}
      <footer className="mt-10 border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-3 sm:px-4 text-center text-[11px] text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-center sm:text-left">
            <Globe2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="leading-tight">World Trends — Real-Time Information Platform</span>
          </div>
          <p className="text-slate-400 dark:text-slate-400 text-[10px] leading-tight">
            React • Vite • TypeScript • Tailwind CSS • Express Backend
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GuestProvider>
        <DashboardContent />
      </GuestProvider>
    </QueryClientProvider>
  );
};

export default App;
