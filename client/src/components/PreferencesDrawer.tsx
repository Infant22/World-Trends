import React, { useState } from 'react';
import { useGuest } from '../context/GuestContext';
import { NewsLanguage } from '../types';
import { X, Check, RotateCcw, MapPin, DollarSign, LayoutGrid, Sparkles, Search, Globe } from 'lucide-react';

interface PreferencesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_CITIES = [
  'Chennai',
  'Coimbatore',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Kolkata',
  'Pune',
  'Kochi',
  'Ahmedabad',
];
const POPULAR_CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD'];
const INTEREST_OPTIONS = ['Tech', 'Sports', 'World News', 'Finance', 'Movies', 'Science'];
const NEWS_LANGUAGE_OPTIONS: { id: NewsLanguage; label: string }[] = [
  { id: 'english', label: 'English' },
  { id: 'tamil', label: 'தமிழ் (Tamil)' },
  { id: 'malayalam', label: 'മലയാളം (Malayalam)' },
  { id: 'telugu', label: 'తెలుగు (Telugu)' },
];

export const PreferencesDrawer: React.FC<PreferencesDrawerProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, toggleWidget, resetPreferences } = useGuest();
  const [cityInput, setCityInput] = useState(preferences.homeCity);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setCityInput(preferences.homeCity);
  }, [preferences.homeCity]);

  React.useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const triggerToast = (message: string, type: 'success' | 'error') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleConfirmReset = () => {
    try {
      resetPreferences();
      setCityInput('Chennai');
      setShowResetConfirm(false);
      triggerToast('✓ Preferences restored to defaults', 'success');
    } catch {
      setShowResetConfirm(false);
      triggerToast('✕ Failed to restore preferences', 'error');
    }
  };

  const isSetDisabled =
    !cityInput.trim() || cityInput.trim().toLowerCase() === preferences.homeCity.toLowerCase();

  const handleCitySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSetDisabled) {
      updatePreferences({ homeCity: cityInput.trim() });
    }
  };

  const handleInterestToggle = (interest: string) => {
    const exists = preferences.selectedInterests.includes(interest);
    const updated = exists
      ? preferences.selectedInterests.filter((i) => i !== interest)
      : [...preferences.selectedInterests, interest];
    updatePreferences({ selectedInterests: updated });
  };

  const formatWidgetLabel = (key: string) => {
    if (key === 'worldClock') return 'World Clock';
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Guest Personalization</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Your preferences are saved automatically on this device. No account required.
          </p>

          {/* Section 1: Home City */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Home Location</span>
            </label>
            <form onSubmit={handleCitySave} className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter city name..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSetDisabled}
                className={`px-4 py-2 rounded-lg font-medium text-xs transition-all shadow-xs ${
                  isSetDisabled
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-sky-500 hover:bg-sky-600 text-white cursor-pointer'
                }`}
              >
                Set
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCityInput(c);
                    updatePreferences({ homeCity: c });
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                    preferences.homeCity.toLowerCase() === c.toLowerCase()
                      ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Preferred Currency */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Target Conversion Currency</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CURRENCIES.map((curr) => (
                <button
                  key={curr}
                  onClick={() => updatePreferences({ targetCurrency: curr })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    preferences.targetCurrency === curr
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: News Language */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <Globe className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>News Language</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {NEWS_LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => updatePreferences({ newsLanguage: lang.id })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border transition-all cursor-pointer ${
                    (preferences.newsLanguage || 'english') === lang.id
                      ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-900 dark:text-sky-300 border-sky-300 dark:border-sky-500/40 font-semibold shadow-xs'
                      : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{lang.label}</span>
                  {(preferences.newsLanguage || 'english') === lang.id && <Check className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Interests */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <span>Topics You Follow</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const active = preferences.selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {active && <Check className="h-3 w-3" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Visible Dashboard Sections */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <LayoutGrid className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Dashboard Widgets</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(preferences.visibleWidgets)
                .filter(([widgetKey]) => widgetKey !== 'explore')
                .map(([widgetKey, isVisible]) => (
                <button
                  key={widgetKey}
                  onClick={() => toggleWidget(widgetKey as any)}
                  role="switch"
                  aria-checked={Boolean(isVisible)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border transition-all cursor-pointer ${
                    isVisible
                      ? 'bg-sky-50/60 dark:bg-sky-500/10 border-sky-200/80 dark:border-sky-500/30 text-slate-900 dark:text-slate-100 font-semibold'
                      : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <span>{formatWidgetLabel(widgetKey)}</span>
                  {/* Compact Toggle Switch */}
                  <div
                    className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center shrink-0 ${
                      isVisible ? 'bg-sky-500 dark:bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${
                        isVisible ? 'translate-x-3' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs transition-all shadow-md shadow-sky-500/20 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Reset all preferences?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Your location, currency, topics, and widget settings will return to their defaults.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-xs cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-blocking Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-70 bg-slate-900/95 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
          <span className={toast.type === 'success' ? 'text-emerald-400 dark:text-emerald-600 font-bold' : 'text-rose-400 dark:text-rose-600 font-bold'}>
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
};


