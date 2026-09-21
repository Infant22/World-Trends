import React, { useState } from 'react';
import { WeatherData } from '../types';
import { Wind, Droplets, Thermometer, ShieldCheck } from 'lucide-react';

interface WeatherWidgetProps {
  data: WeatherData;
  isLoading?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('daily');

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-5 md:p-6 skeleton-shimmer min-h-[360px] flex flex-col justify-between">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-20 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  const aqiIndex = data.aqi?.index || 38;
  const aqiStatus = data.aqi?.status || 'Good';

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 md:p-6 relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 mb-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-3xl leading-none shrink-0">{data.icon}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none truncate max-w-[130px] xs:max-w-none">{data.city}</h2>
              {/* AQI Badge */}
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/20 flex items-center gap-1 shrink-0">
                <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>AQI {aqiIndex} • {aqiStatus}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{data.country}</p>
          </div>
        </div>

        {/* Hourly / Daily Toggle Pills */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs shrink-0 self-end xs:self-auto">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'daily'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
            }`}
          >
            5-Day
          </button>
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'hourly'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
            }`}
          >
            Hourly
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left Side: Temperature Hero & Metrics */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{Math.round(data.temp)}</span>
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">°C</span>
          </div>
          <p className="text-xs font-semibold text-sky-700 dark:text-sky-300 mt-0.5">{data.condition}</p>

          <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                <span>High / Low</span>
              </span>
              <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{data.highTemp}° / {data.lowTemp}°</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-sky-500" />
                <span>Humidity</span>
              </span>
              <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{data.humidity}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5 text-emerald-500" />
                <span>Wind</span>
              </span>
              <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{data.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Right Side: Forecast List */}
        <div className="md:col-span-7">
          {activeTab === 'daily' ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {data.dailyForecast.slice(0, 5).map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-2 px-2 rounded-lg hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200 w-16 text-left shrink-0">{d.day}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-center flex-1 truncate px-2 text-[11px] font-medium">{d.condition}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-right w-20 shrink-0">
                    <strong className="text-sky-700 dark:text-sky-300 font-bold">{d.highTemp}°</strong> / {d.lowTemp}°
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-1.5">
              {data.forecast.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center p-2 rounded-lg bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-center transition-colors"
                >
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{h.time}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white my-1">{Math.round(h.temp)}°</span>
                  <span className="text-[9px] text-sky-600 dark:text-sky-400 font-semibold">{h.pop}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
