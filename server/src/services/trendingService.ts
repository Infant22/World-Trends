import axios from 'axios';
import { apiCache } from '../index';

export interface TrendingTopic {
  id: string;
  tag: string;
  category: string;
  badge?: string;
  momentum?: string;
}

const COUNTRY_TO_TRENDS24_SLUG: Record<string, string> = {
  india: 'india',
  in: 'india',
  'united states': 'united-states',
  usa: 'united-states',
  us: 'united-states',
  'united kingdom': 'united-kingdom',
  uk: 'united-kingdom',
  gb: 'united-kingdom',
  japan: 'japan',
  jp: 'japan',
  australia: 'australia',
  au: 'australia',
  canada: 'canada',
  ca: 'canada',
  germany: 'germany',
  de: 'germany',
  france: 'france',
  fr: 'france',
  brazil: 'brazil',
  br: 'brazil',
  singapore: 'singapore',
  sg: 'singapore',
  'united arab emirates': 'united-arab-emirates',
  uae: 'united-arab-emirates',
};

export function getTrends24Slug(country?: string): string {
  if (!country) return 'india';
  const clean = country.toLowerCase().trim();
  return COUNTRY_TO_TRENDS24_SLUG[clean] || 'united-states';
}

function formatTrendTag(rawName: string): string {
  const clean = rawName.trim();

  if (clean.startsWith('#')) {
    return clean;
  }

  const camel = clean
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\u0900-\u097F\u0D00-\u0D7F\u0B80-\u0BFF\u0C00-\u0C7F]/g, '');

  if (camel) {
    return `#${camel}`;
  }
  return `#${clean.replace(/\s+/g, '')}`;
}

function isLatinOrCommonScript(str: string): boolean {
  return /[a-zA-Z0-9]/.test(str);
}

function inferConfidentCategory(name: string): string | null {
  const clean = name.toLowerCase().trim();
  const rawClean = clean.replace(/[^a-z0-9]/g, '');

  // 1. Discard pure numbers or cryptic currency strings e.g. "14 Cr", "14cr", "2026", "100k"
  if (/^\d+(cr|k|m|b)?$/i.test(rawClean)) {
    return null;
  }

  // 2. Discard cryptic strings under 3 chars unless known acronym
  if (rawClean.length < 3 && !['ai', 'un', 'eu', 'uk', 'us', 'ip', 'f1'].includes(rawClean)) {
    return null;
  }

  const words = clean.split(/[^a-z0-9]+/);

  // 3. Check Sports
  if (
    clean.includes('vs') ||
    words.some((w) =>
      [
        'match', 'cup', 'trophy', 'league', 'cricket', 'football', 'soccer',
        'nfl', 'nba', 'ucl', 'ipl', 't20', 'odi', 'derby', 'f1', 'tennis',
        'score', 'wicket', 'runs', 'goal', 'aew', 'dwts', 'munbha', 'alcantara'
      ].includes(w)
    )
  ) {
    return 'Sports';
  }

  // 4. Check Politics
  if (
    clean.includes('modi') ||
    clean.includes('annamalai') ||
    words.some((w) =>
      [
        'bjp', 'congress', 'pm', 'minister', 'president', 'election', 'parliament',
        'senate', 'republican', 'democrat', 'biden', 'trump', 'govt', 'policy',
        'vote', 'voter', 'governor', 'mp', 'mla', 'narendra'
      ].includes(w)
    )
  ) {
    return 'Politics';
  }

  // 5. Check Technology
  const techTerms = new Set([
    'ai', 'openai', 'chatgpt', 'gpt', 'iphone', 'apple', 'google', 'microsoft',
    'nvidia', 'tesla', 'tech', 'software', 'app', 'device', 'chip', 'semiconductor',
    'discord', 'gta', 'hardware', 'spacex', 'robotics'
  ]);
  if (words.some((w) => techTerms.has(w))) {
    return 'Technology';
  }

  // 6. Check Finance
  const financeTerms = new Set([
    'stock', 'stocks', 'market', 'nifty', 'sensex', 'ipo', 'shares', 'bank',
    'bitcoin', 'btc', 'crypto', 'ethereum', 'inflation', 'fed', 'economy',
    'trade', 'tax', 'rupee', 'dollar', 'multibagger', 'finance'
  ]);
  if (words.some((w) => financeTerms.has(w))) {
    return 'Finance';
  }

  // 7. Check Entertainment
  const entTerms = new Set([
    'movie', 'film', 'actor', 'actress', 'cinema', 'song', 'music', 'album',
    'trailer', 'oscar', 'oscars', 'grammy', 'series', 'show', 'season',
    'raaka', 'jailer', 'coolie', 'bday', 'sheeran', 'macklemore', 'spoilers', 'rhoslc'
  ]);
  if (words.some((w) => entTerms.has(w))) {
    return 'Entertainment';
  }

  // 8. Check World
  const worldTerms = new Set([
    'gaza', 'israel', 'palestine', 'ukraine', 'russia', 'china', 'un', 'g20',
    'summit', 'diplomacy', 'treaty', 'nation', 'global', 'peace', 'puja', 'vishwakarma', 'festival'
  ]);
  if (words.some((w) => worldTerms.has(w))) {
    return 'World';
  }

  // 9. Check Science
  const scienceTerms = new Set([
    'nasa', 'isro', 'space', 'astronomy', 'rocket', 'vaccine', 'pharma', 'physics', 'atom'
  ]);
  if (words.some((w) => scienceTerms.has(w))) {
    return 'Science';
  }

  // Ambiguous or unconfident category -> Return null to DISCARD candidate
  return null;
}

export async function fetchRealTimeXTrends(
  country?: string,
  userInterests: string[] = []
): Promise<TrendingTopic[]> {
  const slug = getTrends24Slug(country);
  const cacheKey = `xtrends_confident_v3_${slug}`;

  // 1. Check 15-minute server memory cache
  const cached = apiCache.get<TrendingTopic[]>(cacheKey);
  if (cached) {
    console.log(`[X Trends Service] Cache hit for slug=${slug}`);
    return cached;
  }

  console.log(`[X Trends Service] Fetching live X trends for slug=${slug}...`);

  try {
    const url = `https://trends24.in/${slug}/`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 8000,
    });

    const html = response.data;
    if (!html || typeof html !== 'string') {
      throw new Error('Empty response from Trends24');
    }

    const regex = /<a[^>]*href="https:\/\/twitter.com\/search\?q=[^"]*"[^>]*>([^<]+)<\/a>/g;
    let match: RegExpExecArray | null;
    const rawList: string[] = [];

    while ((match = regex.exec(html)) !== null) {
      const name = match[1].trim();
      if (name && !rawList.some((r) => r.toLowerCase() === name.toLowerCase())) {
        rawList.push(name);
      }
    }

    if (rawList.length === 0) {
      throw new Error('No trends found in Trends24 output');
    }

    // Filter non-Latin script raw searches if Latin alternatives exist to satisfy language preference
    const latinList = rawList.filter(isLatinOrCommonScript);
    const candidateList = latinList.length >= 4 ? latinList : rawList;

    // Map candidates to TrendingTopic models
    const userInterestsLower = userInterests.map((i) => i.toLowerCase().trim());

    let scoredCandidates = candidateList.map((rawName, idx) => {
      const tag = formatTrendTag(rawName);
      let score = 100 - idx;

      if (
        userInterestsLower.some(
          (ui) =>
            rawName.toLowerCase().includes(ui) ||
            tag.toLowerCase().includes(ui)
        )
      ) {
        score += 15;
      }

      return {
        rawName,
        tag,
        score,
        originalRank: idx + 1,
      };
    });

    if (userInterests.length > 0) {
      scoredCandidates.sort((a, b) => b.score - a.score);
    }

    // Filter candidates: DISCARD ambiguous items without a confident category!
    const finalTrends: TrendingTopic[] = [];
    const seenTags = new Set<string>();

    for (const item of scoredCandidates) {
      if (finalTrends.length >= 4) break;

      const category = inferConfidentCategory(item.rawName);

      // Discard ambiguous or unconfident trends!
      if (!category) {
        console.log(`[X Trends Service] Discarding ambiguous trend: '${item.rawName}'`);
        continue;
      }

      const key = item.tag.toLowerCase();
      if (!seenTags.has(key)) {
        seenTags.add(key);
        let badge = 'TRENDING';
        if (finalTrends.length === 0) badge = '🔥 HOT';

        finalTrends.push({
          id: `xtrend_${slug}_${finalTrends.length + 1}_${item.tag.replace('#', '').toLowerCase()}`,
          tag: item.tag,
          category,
          badge,
          momentum: 'Trending',
        });
      }
    }

    // Cache results for 15 minutes (900 seconds)
    apiCache.set(cacheKey, finalTrends, 900);
    return finalTrends;
  } catch (err: any) {
    console.warn(`[X Trends Service Warning] ${err?.message || err}`);
    if (cached) return cached;
    return [];
  }
}
