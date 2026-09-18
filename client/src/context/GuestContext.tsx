import React, { createContext, useContext, useState, useEffect } from 'react';
import { GuestPreferences, ClockCity } from '../types';
import { getHomeTimezone, getFlagForCity, getCountryForCity } from '../lib/utils';

const DEFAULT_PREFERENCES: GuestPreferences = {
  homeCity: 'Chennai',
  homeCountry: 'India',
  baseCurrency: 'USD',
  targetCurrency: 'INR',
  newsLanguage: 'english',
  theme: 'dark',
  selectedInterests: [],
  favoriteCategories: [],
  clockCities: [
    { id: 'home', city: 'Chennai', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
    { id: '2', city: 'London', country: 'UK', timezone: 'Europe/London', flag: '🇬🇧' },
    { id: '3', city: 'New York', country: 'USA', timezone: 'America/New_York', flag: '🇺🇸' },
    { id: '4', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  ],
  visibleWidgets: {
    weather: true,
    currency: true,
    worldClock: true,
    news: true,
    sports: true,
    explore: true,
    trending: true,
  },
  widgetOrder: ['weather', 'currency', 'worldClock', 'news', 'sports', 'trending', 'explore'],
};

const LOCAL_STORAGE_KEY = 'world_trends_guest_prefs_v1';

interface GuestContextType {
  preferences: GuestPreferences;
  updatePreferences: (newPrefs: Partial<GuestPreferences>) => void;
  toggleWidget: (widgetId: keyof GuestPreferences['visibleWidgets']) => void;
  addClockCity: (city: ClockCity) => void;
  removeClockCity: (cityId: string) => void;
  resetPreferences: () => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<GuestPreferences>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load preferences from localStorage:', e);
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
      // Update HTML root class for dark/light mode
      const root = document.documentElement;
      if (preferences.theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else if (preferences.theme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        // Ambient default to dark with gradient class
        root.classList.add('dark');
      }
    } catch (e) {
      console.warn('Failed to save preferences to localStorage:', e);
    }
  }, [preferences]);

  const updatePreferences = (newPrefs: Partial<GuestPreferences>) => {
    setPreferences((prev) => {
      let updatedClockCities = prev.clockCities;
      if (newPrefs.homeCity && newPrefs.homeCity.trim() !== prev.homeCity) {
        const newHome = newPrefs.homeCity.trim();
        const homeClock: ClockCity = {
          id: 'home',
          city: newHome,
          country: getCountryForCity(newHome),
          timezone: getHomeTimezone(newHome),
          flag: getFlagForCity(newHome),
        };

        const homeIdx = prev.clockCities.findIndex((c) => c.id === 'home' || c.id === '1');
        if (homeIdx >= 0) {
          updatedClockCities = [...prev.clockCities];
          updatedClockCities[homeIdx] = homeClock;
        } else {
          updatedClockCities = [homeClock, ...prev.clockCities];
        }
      }
      return {
        ...prev,
        ...newPrefs,
        clockCities: updatedClockCities,
      };
    });
  };

  const toggleWidget = (widgetId: keyof GuestPreferences['visibleWidgets']) => {
    setPreferences((prev) => ({
      ...prev,
      visibleWidgets: {
        ...prev.visibleWidgets,
        [widgetId]: !prev.visibleWidgets[widgetId],
      },
    }));
  };

  const addClockCity = (city: ClockCity) => {
    setPreferences((prev) => {
      if (prev.clockCities.length >= 4) {
        return prev;
      }
      if (prev.clockCities.some((c) => c.city.toLowerCase() === city.city.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        clockCities: [...prev.clockCities, city],
      };
    });
  };

  const removeClockCity = (cityId: string) => {
    setPreferences((prev) => ({
      ...prev,
      clockCities: prev.clockCities.filter((c) => c.id !== cityId),
    }));
  };

  const resetPreferences = () => {
    setPreferences({
      ...DEFAULT_PREFERENCES,
      selectedInterests: [...DEFAULT_PREFERENCES.selectedInterests],
      favoriteCategories: [...DEFAULT_PREFERENCES.favoriteCategories],
      clockCities: DEFAULT_PREFERENCES.clockCities.map((c) => ({ ...c })),
      visibleWidgets: { ...DEFAULT_PREFERENCES.visibleWidgets },
      widgetOrder: [...DEFAULT_PREFERENCES.widgetOrder],
    });
  };

  return (
    <GuestContext.Provider
      value={{
        preferences,
        updatePreferences,
        toggleWidget,
        addClockCity,
        removeClockCity,
        resetPreferences,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
};
