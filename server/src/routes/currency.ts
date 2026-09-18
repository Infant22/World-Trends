import { Router, Request, Response } from 'express';
import axios from 'axios';
import { apiCache } from '../index';

export const currencyRouter = Router();

const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { INR: 83.92, EUR: 0.92, GBP: 0.77, JPY: 143.45, AUD: 1.49, CAD: 1.36, SGD: 1.31, CNY: 7.12, USD: 1 },
  EUR: { USD: 1.09, INR: 91.20, GBP: 0.84, JPY: 156.10, EUR: 1 },
  INR: { USD: 0.012, EUR: 0.011, GBP: 0.0092, INR: 1 },
};

function getFallbackRate(base: string, quote: string): number | null {
  if (base === quote) return 1;
  if (FALLBACK_RATES[base]?.[quote]) return FALLBACK_RATES[base][quote];
  if (FALLBACK_RATES[quote]?.[base]) return 1 / FALLBACK_RATES[quote][base];
  return null;
}

currencyRouter.get('/', async (req: Request, res: Response) => {
  const base = ((req.query.base as string) || 'USD').trim().toUpperCase();
  const quote = ((req.query.quote as string) || (req.query.target as string) || 'INR').trim().toUpperCase();

  const cacheKey = `currency_rate_v3_${base}_${quote}`;

  // 1. Check 1-hour server-side cache (3600 seconds)
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Same base and quote
  if (base === quote) {
    const sameRateData = {
      date: new Date().toISOString().split('T')[0],
      base,
      quote,
      rate: 1,
      rates: { [quote]: 1, [base]: 1 },
    };
    apiCache.set(cacheKey, sameRateData, 3600);
    return res.json(sameRateData);
  }

  const httpHeaders = { 'User-Agent': 'WorldTrends/1.0 (contact@worldtrends.app)' };

  // 2. Primary: Frankfurter v2 API GET https://api.frankfurter.dev/v2/rate/{base}/{quote}
  try {
    const v2Url = `https://api.frankfurter.dev/v2/rate/${base.toLowerCase()}/${quote.toLowerCase()}`;
    const response = await axios.get(v2Url, { headers: httpHeaders, timeout: 5000 });
    const data = response.data;

    if (data && typeof data.rate === 'number' && data.rate > 0) {
      const rateResult = {
        date: data.date || new Date().toISOString().split('T')[0],
        base,
        quote,
        rate: data.rate,
        rates: {
          [quote]: data.rate,
          [base]: 1,
        },
      };

      // Cache live rate for 1 hour (3600 seconds)
      apiCache.set(cacheKey, rateResult, 3600);
      return res.json(rateResult);
    }
  } catch (err: any) {
    console.warn(`[Currency Route] Frankfurter v2 fetch failed for ${base}/${quote}:`, err?.message || err);
  }

  // 3. Secondary: Frankfurter v1 API GET https://api.frankfurter.app/latest?from={base}&to={quote}
  try {
    const v1Url = `https://api.frankfurter.app/latest?from=${base}&to=${quote}`;
    const response = await axios.get(v1Url, { headers: httpHeaders, timeout: 5000 });
    const data = response.data;

    if (data && data.rates && typeof data.rates[quote] === 'number' && data.rates[quote] > 0) {
      const rateVal = data.rates[quote];
      const rateResult = {
        date: data.date || new Date().toISOString().split('T')[0],
        base,
        quote,
        rate: rateVal,
        rates: {
          [quote]: rateVal,
          [base]: 1,
        },
      };

      // Cache live rate for 1 hour (3600 seconds)
      apiCache.set(cacheKey, rateResult, 3600);
      return res.json(rateResult);
    }
  } catch (err: any) {
    console.warn(`[Currency Route] Frankfurter v1 fetch failed for ${base}/${quote}:`, err?.message || err);
  }

  // 4. Valid Fallback Rate Table (Valid market rates for supported pairs when API is rate-limited/down)
  const fbRate = getFallbackRate(base, quote);
  if (fbRate !== null && fbRate > 0) {
    const fallbackPayload = {
      date: new Date().toISOString().split('T')[0],
      base,
      quote,
      rate: fbRate,
      rates: {
        [quote]: fbRate,
        [base]: 1,
      },
      isFallback: true,
    };

    // Cache fallback for 10 minutes to prevent aggressive retries
    apiCache.set(cacheKey, fallbackPayload, 600);
    return res.json(fallbackPayload);
  }

  // 5. Unavailable State (NEVER return 1.0000 silently for different base & quote)
  return res.status(503).json({
    error: 'Currency exchange rate service unavailable',
    base,
    quote,
    rate: null,
  });
});
