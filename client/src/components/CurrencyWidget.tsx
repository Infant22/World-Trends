import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CurrencyRate } from '../types';
import { ArrowLeftRight, DollarSign } from 'lucide-react';
import { useGuest } from '../context/GuestContext';
import { fetchCurrencies } from '../services/api';

interface CurrencyWidgetProps {
  data: CurrencyRate;
  isLoading?: boolean;
}

const SUPPORTED_CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'CNY'];

export const CurrencyWidget: React.FC<CurrencyWidgetProps> = ({ data, isLoading }) => {
  const { preferences, updatePreferences } = useGuest();
  const [amount, setAmount] = useState<number>(1);
  const [fromCurr, setFromCurr] = useState<string>('USD');
  const [toCurr, setToCurr] = useState<string>(preferences.targetCurrency || 'INR');

  useEffect(() => {
    if (preferences.targetCurrency && preferences.targetCurrency !== toCurr) {
      setToCurr(preferences.targetCurrency);
    }
  }, [preferences.targetCurrency]);

  // Fetch exchange rate from Express backend for current (fromCurr -> toCurr) pair
  const rateQuery = useQuery({
    queryKey: ['currencyRate', fromCurr, toCurr],
    queryFn: () => fetchCurrencies(fromCurr, toCurr),
    staleTime: 1000 * 60 * 60, // 1 hour client cache
    gcTime: 1000 * 60 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const conversionRate = useMemo(() => {
    if (fromCurr === toCurr) return 1;
    if (rateQuery.data && typeof rateQuery.data.rate === 'number' && rateQuery.data.rate > 0) {
      return rateQuery.data.rate;
    }
    if (data?.rates?.[toCurr] && data?.rates?.[fromCurr] && data.rates[fromCurr] > 0) {
      const r = data.rates[toCurr] / data.rates[fromCurr];
      if (r > 0 && Math.abs(r - 1) > 0.0001) return r;
    }
    return null;
  }, [rateQuery.data, data, fromCurr, toCurr]);

  const rawConverted = conversionRate !== null ? amount * conversionRate : 0;

  const formattedConvertedAmount = useMemo(() => {
    if (conversionRate === null) return 'Unavailable';
    try {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(rawConverted);
    } catch {
      return rawConverted.toFixed(2);
    }
  }, [rawConverted, conversionRate]);

  if (isLoading || (rateQuery.isLoading && !rateQuery.data)) {
    return (
      <div className="glass-panel rounded-2xl p-5 skeleton-shimmer min-h-[160px] flex flex-col justify-between">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  const handleToCurrChange = (val: string) => {
    setToCurr(val);
    updatePreferences({ targetCurrency: val });
  };

  const swapCurrencies = () => {
    const nextFrom = toCurr;
    const nextTo = fromCurr;
    setFromCurr(nextFrom);
    setToCurr(nextTo);
    updatePreferences({ targetCurrency: nextTo });
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-4 md:p-5 relative overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-none">Currency Exchange</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Live Rates</p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-mono bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-500/20 font-semibold">
            Today
          </span>
        </div>

        {/* Amount & Selectors Row */}
        <div className="flex flex-wrap sm:grid sm:grid-cols-[1fr_auto] items-end gap-2 mb-3">
          <div className="flex-1 min-w-[100px]">
            <label className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">Amount</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              className="w-full h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <select
              value={fromCurr}
              onChange={(e) => setFromCurr(e.target.value)}
              className="h-8 px-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={swapCurrencies}
              className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:scale-105 shrink-0"
              title="Swap currencies"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>

            <select
              value={toCurr}
              onChange={(e) => handleToCurrChange(e.target.value)}
              className="h-8 px-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result Output Card */}
      <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-slate-900/60 border border-emerald-200/70 dark:border-emerald-500/20 flex items-center justify-between">
        <div>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">Result</span>
          <div className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tight leading-none mt-0.5">
            {formattedConvertedAmount} <span className="text-xs text-slate-600 dark:text-slate-300 font-normal">{toCurr}</span>
          </div>
        </div>
        <div className="text-right text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          <div>1 {fromCurr} = {conversionRate !== null ? `${conversionRate.toFixed(4)} ${toCurr}` : 'Unavailable'}</div>
        </div>
      </div>
    </div>
  );
};
