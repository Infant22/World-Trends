import axios from 'axios';
import { apiCache } from './cache';
import { getNewsDataFeed } from './newsDataService';

export type SearchResultType = 'country' | 'location' | 'person' | 'sports' | 'topic' | 'entertainment';

export interface SearchDetailItem {
  label: string;
  value: string;
}

export interface UniversalSearchResult {
  type: SearchResultType;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  url?: string;
  flagOrIcon?: string;
  countryCode?: string;
  capital?: string;
  population?: number;
  currencies?: any[];
  languages?: string[];
  latitude?: number;
  longitude?: number;
  timezone?: string;
  mapUrl?: string;
  latlng?: [number, number];
  details?: SearchDetailItem[];
  confidence?: number;
  relatedData?: any;
}

const PERSON_DESCRIPTORS = [
  'youtuber', 'vlogger', 'video jockey', 'actor', 'actress', 'director', 'filmmaker',
  'singer', 'musician', 'artist', 'cricketer', 'footballer', 'tennis player', 'athlete',
  'politician', 'influencer', 'presenter', 'anchor', 'host', 'comedian', 'author',
  'journalist', 'person', 'human', 'born 19', 'born 20', 'executive', 'businessman',
  'producer', 'researcher', 'scientist', 'wrestler', 'boxer', 'driver', 'model',
  'ruler', 'president', 'prime minister', 'personality', 'creator', 'channel', 'duo'
];

const ENTERTAINMENT_DESCRIPTORS = [
  'film', 'movie', 'television series', 'music album', 'song', 'cinema', 'drama',
  'comic', 'video game', 'soundtrack', 'novel'
];

const SPORTS_DESCRIPTORS = [
  'sport', 'football club', 'tennis', 'basketball', 'cricket', 'league', 'tournament',
  'championship', 'association football', 'racing', 'racket sport', 'team sport'
];

const TECH_DESCRIPTORS = [
  'company', 'technology', 'software', 'cryptocurrency', 'corporation', 'developer',
  'framework', 'artificial intelligence', 'platform', 'app', 'multinational', 'digital currency'
];

// Generic context and intent words that can be present in user queries
const CONTEXT_WORDS = new Set([
  'youtube', 'vlog', 'vlogs', 'vlogger', 'channel', 'streamer', 'gaming', 'gamer', 'live',
  'instagram', 'twitter', 'tiktok', 'facebook', 'podcast', 'podcasts', 'video', 'videos',
  'official', 'page', 'website', 'wiki', 'wikipedia', 'bio', 'biography', 'profile',
  'actor', 'actress', 'star', 'hero', 'heroine', 'director', 'filmmaker', 'producer',
  'movie', 'movies', 'film', 'films', 'cinema', 'series', 'show', 'shows', 'tv', 'drama',
  'singer', 'singers', 'musician', 'artist', 'song', 'songs', 'music', 'album', 'soundtrack',
  'player', 'athlete', 'cricket', 'cricketer', 'football', 'footballer', 'soccer', 'tennis',
  'match', 'stats', 'highlights', 'team', 'club', 'vs',
  'company', 'corporation', 'inc', 'ltd', 'corp', 'tech', 'technology', 'app', 'software', 'news'
]);

function normalize(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🏳️';
  return String.fromCodePoint(...countryCode.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0)));
}

interface AnalyzedQuery {
  raw: string;
  normalized: string;
  tokens: string[];
  identityTokens: string[];
  contextTokens: string[];
  variants: string[];
  isPureContextQuery: boolean;
}

function analyzeQuery(query: string): AnalyzedQuery {
  const raw = query.trim();
  const normalized = normalize(raw);
  const tokens = normalized.split(/\s+/).filter(Boolean);

  const identityTokens: string[] = [];
  const contextTokens: string[] = [];

  for (const token of tokens) {
    if (CONTEXT_WORDS.has(token)) {
      contextTokens.push(token);
    } else {
      identityTokens.push(token);
    }
  }

  const isPureContextQuery = identityTokens.length === 0;
  const effectiveIdentityTokens = isPureContextQuery ? tokens : identityTokens;

  const variantsSet = new Set<string>();
  variantsSet.add(raw);

  if (!isPureContextQuery && effectiveIdentityTokens.length > 0) {
    const identityString = effectiveIdentityTokens.join(' ');
    variantsSet.add(identityString);

    const capIdentityString = effectiveIdentityTokens
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
      .join(' ');
    variantsSet.add(capIdentityString);
  }

  return {
    raw,
    normalized,
    tokens,
    identityTokens: effectiveIdentityTokens,
    contextTokens,
    variants: Array.from(variantsSet),
    isPureContextQuery,
  };
}

// 1. DYNAMIC COUNTRY DISCOVERY (Open-Meteo PCLI)
async function discoverCountry(query: string): Promise<UniversalSearchResult | null> {
  const qNorm = normalize(query);
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    const res = await axios.get(url, { timeout: 3500 });
    const results: any[] = res.data?.results || [];

    const countryMatch = results.find(
      (r: any) =>
        (r.feature_code === 'PCLI' || r.feature_code === 'PCLD' || r.feature_code === 'PCL') &&
        (normalize(r.name) === qNorm ||
          normalize(r.country) === qNorm ||
          (qNorm === 'usa' && r.country_code === 'US') ||
          (qNorm === 'us' && r.country_code === 'US') ||
          (qNorm === 'uk' && r.country_code === 'GB') ||
          (qNorm === 'uae' && r.country_code === 'AE'))
    );

    if (countryMatch) {
      const code = countryMatch.country_code || 'US';
      const flag = getCountryFlag(code);
      return {
        type: 'country',
        title: countryMatch.name,
        subtitle: `${countryMatch.country || countryMatch.name} • Country Overview`,
        description: `${countryMatch.name} is a sovereign country. Timezone: ${countryMatch.timezone || 'N/A'}. Population: ${countryMatch.population ? countryMatch.population.toLocaleString() : 'N/A'}. Coordinates: ${countryMatch.latitude.toFixed(2)}°, ${countryMatch.longitude.toFixed(2)}°.`,
        flagOrIcon: flag,
        countryCode: code,
        capital: countryMatch.admin1 || countryMatch.name,
        population: countryMatch.population || 0,
        mapUrl: `https://maps.google.com/?q=${countryMatch.latitude},${countryMatch.longitude}`,
        latlng: [countryMatch.latitude, countryMatch.longitude],
        confidence: 0.95,
        details: [
          { label: 'Timezone', value: countryMatch.timezone || 'N/A' },
          { label: 'Population', value: countryMatch.population ? countryMatch.population.toLocaleString() : 'N/A' },
          { label: 'Country Code', value: code },
          { label: 'Source', value: 'OPEN-METEO' },
        ],
      };
    }
  } catch (err: any) {
    console.warn('[SearchService] Country discovery error:', err?.message || err);
  }

  return null;
}

// 2. DYNAMIC CITY / LOCATION DISCOVERY (Open-Meteo Geocoding)
async function discoverLocation(query: string): Promise<UniversalSearchResult | null> {
  const qNorm = normalize(query);

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    const res = await axios.get(url, { timeout: 3500 });
    const results: any[] = res.data?.results || [];

    const cityCandidates = results.filter(
      (r: any) => r.feature_code !== 'PCLI' && r.feature_code !== 'PCLD' && r.feature_code !== 'PCL'
    );

    if (cityCandidates.length > 0) {
      const sorted = cityCandidates.sort((a: any, b: any) => (b.population || 0) - (a.population || 0));
      const exact = sorted.find((r: any) => normalize(r.name) === qNorm) || sorted[0];

      const isMajorLoc = exact.population > 5000 || ['PPLC', 'PPLA', 'PPLA2', 'ADM1'].includes(exact.feature_code);
      if (exact && isMajorLoc && (exact.country || exact.admin1)) {
        const adminPart = exact.admin1 ? `${exact.admin1}, ` : '';
        const countryPart = exact.country || '';
        return {
          type: 'location',
          title: exact.name,
          subtitle: `${adminPart}${countryPart}`.trim(),
          description: `Location situated in ${countryPart || 'the region'}. Coordinates: ${exact.latitude.toFixed(2)}°, ${exact.longitude.toFixed(2)}°. Timezone: ${exact.timezone || 'N/A'}.`,
          flagOrIcon: '📍',
          latitude: exact.latitude,
          longitude: exact.longitude,
          timezone: exact.timezone,
          mapUrl: `https://maps.google.com/?q=${exact.latitude},${exact.longitude}`,
          confidence: 0.90,
          details: [
            { label: 'Country', value: exact.country || 'N/A' },
            { label: 'Timezone', value: exact.timezone || 'N/A' },
            { label: 'Population', value: exact.population ? exact.population.toLocaleString() : 'N/A' },
            { label: 'Source', value: 'OPEN-METEO' },
          ],
        };
      }
    }
  } catch (err: any) {
    console.warn('[SearchService] Location discovery error:', err?.message || err);
  }

  return null;
}

// 3. SOURCE-DRIVEN MULTI-CANDIDATE DISCOVERY & RELEVANCE SCORING (Wikidata + Wikipedia + News Candidate Extraction)
async function discoverEntity(query: string): Promise<UniversalSearchResult | null> {
  const analyzed = analyzeQuery(query);
  const candidatesMap = new Map<string, { title: string; label: string; description: string; aliases: string[]; wikidataId: string | null; source: string; newsMatches?: any[] }>();

  const httpHeaders = { 'User-Agent': 'WorldTrends/1.0 (contact@worldtrends.app)' };

  // Multi-Variant Discovery in Parallel across unique normalized query variants
  const seenNorm = new Set<string>();
  const distinctVariants = analyzed.variants.filter((v) => {
    const n = normalize(v);
    if (!n || seenNorm.has(n)) return false;
    seenNorm.add(n);
    return true;
  });

  await Promise.all(
    distinctVariants.map(async (variant) => {
      const vClean = variant.trim();
      const vNorm = normalize(vClean);

      // Source A: Wikidata Search API
      try {
        const wdUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(vClean)}&language=en&format=json&limit=5`;
        const wdRes = await axios.get(wdUrl, { headers: httpHeaders, timeout: 2500 });
        for (const h of wdRes.data?.search || []) {
          if (!h.label) continue;
          const key = normalize(h.label);
          if (!candidatesMap.has(key)) {
            candidatesMap.set(key, {
              title: h.label,
              label: h.label,
              description: h.description || '',
              aliases: h.aliases || [],
              wikidataId: h.id,
              source: 'wikidata',
            });
          }
        }
      } catch (e) {}

      // Source B: Wikipedia Search API
      try {
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(vClean)}&format=json&utf8=1&srlimit=5`;
        const wikiRes = await axios.get(wikiUrl, { headers: httpHeaders, timeout: 2500 });
        for (const h of wikiRes.data?.query?.search || []) {
          const title: string = h.title;
          if (title.startsWith('List of') && !vNorm.includes('list')) continue;
          if (title.startsWith('Portal:') || title.startsWith('Wikipedia:')) continue;

          const cleanTitle = title.replace(/\s*\([^)]*\)/g, '').trim();
          const key = normalize(cleanTitle);

          if (!candidatesMap.has(key)) {
            candidatesMap.set(key, {
              title,
              label: cleanTitle,
              description: h.snippet ? h.snippet.replace(/<[^>]*>/g, '') : '',
              aliases: [],
              wikidataId: null,
              source: 'wikipedia',
            });
          }
        }
      } catch (e) {}

      // Source C: Dynamic Web & News Search Candidate Extraction (Fallback for emerging entities)
      if (candidatesMap.size === 0) {
        try {
          const apiKey = process.env.NEWS_DATA_API_KEY || 'pub_a98f5794028649f4bb82a548d393c9cc';
          const newsSearchUrl = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${encodeURIComponent(vClean)}`;
          const newsRes = await axios.get(newsSearchUrl, { timeout: 2000 });
          const results: any[] = newsRes.data?.results || [];

          if (results.length > 0) {
            const formattedTitle = vClean.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const key = normalize(formattedTitle);

            if (!candidatesMap.has(key)) {
              candidatesMap.set(key, {
                title: formattedTitle,
                label: formattedTitle,
                description: results[0].description || results[0].title || `Emerging creator / entity with current media coverage.`,
                aliases: [],
                wikidataId: null,
                source: 'newsdata',
                newsMatches: results,
              });
            }
          }
        } catch (e) {}
      }
    })
  );

  const candidateList = Array.from(candidatesMap.values());
  if (candidateList.length === 0) return null;

  // Enrich & Evaluate Candidates in Parallel
  const enrichedCandidates = await Promise.all(
    candidateList.map(async (cand) => {
      let pageData: any = null;

      let isDisambiguationPage = false;
      if (cand.source === 'wikidata' || cand.source === 'wikipedia') {
        try {
          const sumRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cand.title)}`, {
            headers: httpHeaders,
            timeout: 2500,
          });
          if (sumRes.data) {
            if (sumRes.data.type === 'disambiguation') {
              isDisambiguationPage = true;
            } else {
              pageData = sumRes.data;
            }
          }
        } catch (e) {}
      }

      const cleanTitleNorm = normalize(cand.label);
      const fullTitleNorm = normalize(cand.title);
      const rawDesc = cand.description + ' ' + (pageData?.description || '') + ' ' + (isDisambiguationPage ? 'disambiguation family name' : '');
      const descNorm = normalize(rawDesc);

      const candLabelTokens = cleanTitleNorm.split(/\s+/).filter(Boolean);
      const candAliasTokens = cand.aliases.flatMap((a) => normalize(a).split(/\s+/)).filter(Boolean);
      const allCandTokens = new Set([...candLabelTokens, ...candAliasTokens]);

      let score = 0;

      // 1. Identity Token Overlap Matching
      const matchedTokens = analyzed.identityTokens.filter((t) => allCandTokens.has(t));
      const tokenOverlapRatio = analyzed.identityTokens.length > 0 ? matchedTokens.length / analyzed.identityTokens.length : 0;

      if (cleanTitleNorm === analyzed.normalized || fullTitleNorm === analyzed.normalized) {
        score += 45; // Exact Full Query Match
      } else if (tokenOverlapRatio === 1.0 && (candLabelTokens.length === analyzed.identityTokens.length || cleanTitleNorm.startsWith(analyzed.identityTokens.join(' ')))) {
        score += 45; // Exact Core Identity Token Match (e.g. "VJ siddhu vlogs" -> "VJ Siddhu")
      } else if (cand.aliases.some((a) => normalize(a) === analyzed.normalized || normalize(a) === analyzed.identityTokens.join(' '))) {
        score += 40; // Exact Alias Match
      } else if (tokenOverlapRatio === 1.0) {
        score += 35; // All Identity Tokens Match Candidate
      } else if (tokenOverlapRatio >= 0.5) {
        score += 20; // Partial Identity Overlap
      } else {
        score -= 35; // Negative score for indirect text mention without token match
      }

      // 2. Pure Context Safeguard & Generic Disambiguation Detection
      if (analyzed.isPureContextQuery) {
        // For pure context queries like "actor", "vlogs", "youtube": candidate title must match or start with the query
        if (cleanTitleNorm !== analyzed.normalized && !cleanTitleNorm.startsWith(analyzed.normalized)) {
          score -= 40;
        }
      }

      // Disambiguation & Generic Surname Entity Detection
      const isGenericSurnameOrDisambiguation =
        descNorm.includes('family name') ||
        descNorm.includes('surname') ||
        descNorm.includes('disambiguation') ||
        descNorm.includes('given name') ||
        descNorm.includes('patronymic') ||
        fullTitleNorm.includes('disambiguation');

      if (isGenericSurnameOrDisambiguation && analyzed.contextTokens.length > 0) {
        score -= 40; // Penalize generic family name/disambiguation when query contains context intent
      }

      // 3. Source Agreement Signals
      if (cand.source === 'wikidata' && pageData) score += 10;
      if (cand.newsMatches && cand.newsMatches.length > 0) score += 10;

      // 4. Entity Class Identification
      const isPerson = PERSON_DESCRIPTORS.some((kw) => descNorm.includes(kw));
      const isSports = SPORTS_DESCRIPTORS.some((kw) => descNorm.includes(kw));
      const isTech = TECH_DESCRIPTORS.some((kw) => descNorm.includes(kw)) || descNorm.includes('cryptocurrency') || descNorm.includes('digital currency');
      const isEnt = (ENTERTAINMENT_DESCRIPTORS.some((kw) => descNorm.includes(kw)) || fullTitleNorm.includes('film') || fullTitleNorm.includes('movie')) && !isTech && !isSports;

      // 5. Specific Named Entity & Context Token Evidence Alignment Boost
      const isSpecificNamedEntity = candLabelTokens.length >= 2 || (isPerson && !isGenericSurnameOrDisambiguation);
      if (isSpecificNamedEntity && tokenOverlapRatio === 1.0 && analyzed.contextTokens.length > 0) {
        score += 35; // Specific Named Entity + Context Alignment Boost (e.g. "mbappe football" -> "Kylian Mbappé")
      }

      if (analyzed.contextTokens.length > 0) {
        const hasContextEvidence = analyzed.contextTokens.some((ct) => descNorm.includes(ct) || candLabelTokens.includes(ct) || candAliasTokens.includes(ct));
        if (hasContextEvidence || (isPerson && ['vlogs', 'youtube', 'actor', 'singer', 'cricket', 'vlogger', 'football', 'footballer', 'soccer'].some((kw) => analyzed.contextTokens.includes(kw)))) {
          score += 20; // Context Alignment Boost
        }
      }

      const isMultiWordIdentity = analyzed.identityTokens.length >= 2;

      if (isPerson) {
        if (isMultiWordIdentity || tokenOverlapRatio === 1.0) score += 25;
      }
      if (isSports) score += 20;
      if (isTech) score += 20;
      if (isEnt && (fullTitleNorm.includes('film') || fullTitleNorm.includes('movie') || tokenOverlapRatio === 1.0)) score += 15;

      const confidence = Math.min(1.0, Math.max(0.0, score / 60));

      let type: SearchResultType = 'topic';
      let icon = '🔥';
      let subtitle = pageData?.description || cand.description || 'Topic Overview';

      if (isPerson) {
        type = 'person';
        icon = '👤';
        if (!pageData?.description && !cand.description) subtitle = 'Person / Public Figure';
      } else if (isSports) {
        type = 'sports';
        icon = '⚽';
        if (!pageData?.description && !cand.description) subtitle = 'Sports & Athletics';
      } else if (isTech) {
        type = 'topic';
        icon = '⚡';
        if (!pageData?.description && !cand.description) subtitle = 'Technology & Industry';
      } else if (isEnt) {
        type = 'entertainment';
        icon = '🎬';
        if (!pageData?.description && !cand.description) subtitle = 'Entertainment & Culture';
      }

      return {
        cand,
        pageData,
        score,
        confidence,
        type,
        icon,
        subtitle,
      };
    })
  );

  enrichedCandidates.sort((a, b) => b.confidence - a.confidence);
  const top = enrichedCandidates[0];

  // CONFIDENCE THRESHOLD CHECK (>= 0.70)
  if (!top || top.confidence < 0.70) {
    return null;
  }

  const item = top.cand;
  const page = top.pageData;

  return {
    type: top.type,
    title: page?.titles?.clean || item.label || item.title,
    subtitle: top.subtitle,
    description: page?.extract || item.description || `${item.label} is a globally searchable entity.`,
    image: page?.thumbnail?.source || page?.originalimage?.source,
    url: page?.content_urls?.desktop?.page || (item.wikidataId ? `https://www.wikidata.org/wiki/${item.wikidataId}` : undefined),
    flagOrIcon: top.icon,
    confidence: top.confidence,
    details: [
      { label: 'Category', value: top.type.toUpperCase() },
      { label: 'Source', value: item.source.toUpperCase() },
    ],
  };
}

export async function resolveUniversalSearch(query: string): Promise<UniversalSearchResult | null> {
  if (!query || !query.trim()) return null;
  const q = query.trim();
  const cacheKey = `universal_search_v13_${q.toLowerCase()}`;

  // 1. Check Server Cache (15 minutes)
  const cached = apiCache.get<UniversalSearchResult | null>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Multi-Source Pipeline Execution Order:
  // 1. Dynamic Sovereign Country Discovery (Open-Meteo PCLI)
  const country = await discoverCountry(q);
  if (country) {
    apiCache.set(cacheKey, country, 900);
    return country;
  }

  // 2. Dynamic City / Location Discovery (For exact city name matches)
  const location = await discoverLocation(q);
  if (location && normalize(location.title) === normalize(q)) {
    apiCache.set(cacheKey, location, 900);
    return location;
  }

  // 3. Multi-Source Entity Discovery (Wikidata + Wikipedia + NewsData Candidate Extraction)
  const entity = await discoverEntity(q);
  if (entity) {
    apiCache.set(cacheKey, entity, 900);
    return entity;
  }

  // Fallback to location if entity discovery didn't find a strong match
  if (location) {
    apiCache.set(cacheKey, location, 900);
    return location;
  }

  // 4. Genuine No Results (Below 0.70 Confidence)
  return null;
}
