import axios from 'axios';
import fs from 'fs';
import path from 'path';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  category: 'technology' | 'world' | 'sports' | 'finance';
  language?: string;
}

export type NewsLanguage = 'english' | 'tamil' | 'malayalam' | 'telugu';
export type NewsCategoryKey = 'all' | 'technology' | 'world' | 'sports' | 'finance';

interface NewsDataArticle {
  article_id?: string;
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  image_url?: string;
  source_id?: string;
  source_name?: string;
  language?: string;
  category?: string[];
}

export interface DiskCachePayload {
  updatedAt: string;
  articles: NewsArticle[];
}

const VALID_LANGUAGES: NewsLanguage[] = ['english', 'tamil', 'malayalam', 'telugu'];
const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

const NEWSDATA_LANG_CODES: Record<NewsLanguage, string> = {
  english: 'en',
  tamil: 'ta',
  malayalam: 'ml',
  telugu: 'te',
};

const NEWSDATA_CATEGORY_MAP: Record<NewsCategoryKey, string | null> = {
  all: null,
  technology: 'technology',
  world: 'world',
  sports: 'sports',
  finance: 'business',
};

export function getNewsDataLanguageCode(language: NewsLanguage): string {
  return NEWSDATA_LANG_CODES[language] || 'en';
}

export function sanitizeLanguage(lang?: string): NewsLanguage {
  const l = (lang || '').toLowerCase().trim();
  if (VALID_LANGUAGES.includes(l as NewsLanguage)) {
    return l as NewsLanguage;
  }
  return 'english';
}

export function sanitizeCategory(cat?: string): NewsCategoryKey {
  const c = (cat || '').toLowerCase().trim();
  if (c === 'tech' || c === 'technology') return 'technology';
  if (c === 'world') return 'world';
  if (c === 'sports' || c === 'sport') return 'sports';
  if (c === 'finance' || c === 'business') return 'finance';
  return 'all';
}

function getDiskCachePath(language: NewsLanguage, category: NewsCategoryKey): string {
  return path.join(__dirname, '..', '..', `data_newsdata_cache_${language}_${category}.json`);
}

function saveDiskCache(language: NewsLanguage, category: NewsCategoryKey, payload: DiskCachePayload): void {
  try {
    const filePath = getDiskCachePath(language, category);
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[NewsData Cache] Could not save disk cache file for ${language}_${category}:`, err);
  }
}

const memoryPayloads: Record<string, DiskCachePayload | null> = {};
const isRefreshInProgressMap: Record<string, boolean> = {};

function getMemoryKey(language: NewsLanguage, category: NewsCategoryKey): string {
  return `${language}_${category}`;
}

function loadDiskCachePayload(language: NewsLanguage, category: NewsCategoryKey): DiskCachePayload | null {
  try {
    const filePath = getDiskCachePath(language, category);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      let loadedArticles: NewsArticle[] = [];
      let updatedAt = new Date().toISOString();

      if (parsed && Array.isArray(parsed.articles)) {
        loadedArticles = parsed.articles;
        if (parsed.updatedAt) updatedAt = parsed.updatedAt;
      } else if (Array.isArray(parsed)) {
        loadedArticles = parsed;
      }

      console.log(`[NewsData Cache] Loaded ${loadedArticles.length} ${language}_${category} articles from disk cache.`);
      return { updatedAt, articles: loadedArticles };
    }
  } catch (err) {
    console.warn(`[NewsData Cache] Could not load disk cache for ${language}_${category}:`, err);
  }
  return null;
}

function formatSource(sourceId?: string, sourceName?: string): string {
  const raw = sourceName || sourceId || 'Global News';
  const clean = raw.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');

  if (clean.includes('techcrunch')) return 'TechCrunch';
  if (clean.includes('theverge')) return 'The Verge';
  if (clean.includes('wired')) return 'Wired';
  if (clean.includes('arstechnica')) return 'Ars Technica';
  if (clean.includes('reuters')) return 'Reuters';
  if (clean.includes('bbc')) return 'BBC News';
  if (clean.includes('bloomberg')) return 'Bloomberg';
  if (clean.includes('espn')) return 'ESPN';
  if (clean.includes('cricinfo')) return 'Cricinfo';

  const parts = clean.split(/[\._]/);
  if (parts.length > 0 && parts[0]) {
    const name = parts[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return raw;
}

export function parseNewsDataPubDate(pubDate?: string): string {
  if (!pubDate) return new Date().toISOString();
  let str = pubDate.trim();
  if (!str.includes('Z') && !str.includes('+') && !str.includes('T')) {
    str = str.replace(' ', 'T') + 'Z';
  } else if (str.includes(' ') && !str.includes('T')) {
    str = str.replace(' ', 'T');
  }
  const date = new Date(str);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizeAndDeduplicateArticles(rawArticles: NewsDataArticle[], targetLang: NewsLanguage, targetCategory: NewsCategoryKey): NewsArticle[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const normalized: NewsArticle[] = [];

  for (let i = 0; i < rawArticles.length; i++) {
    const raw = rawArticles[i];
    if (!raw) continue;

    const titleText = (raw.title || '').trim().replace(/\s+/g, ' ');
    const rawUrl = (raw.link || '').trim();
    if (!titleText || !rawUrl) continue;

    const cleanUrl = rawUrl.split('?')[0].toLowerCase();
    if (seenUrls.has(cleanUrl)) continue;

    const titleKey = titleText.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 45);
    if (titleKey && seenTitles.has(titleKey)) continue;

    seenUrls.add(cleanUrl);
    if (titleKey) seenTitles.add(titleKey);

    const source = formatSource(raw.source_id, raw.source_name);
    const publishedAt = parseNewsDataPubDate(raw.pubDate);

    let imageUrl: string | undefined = undefined;
    if (raw.image_url && (raw.image_url.startsWith('http://') || raw.image_url.startsWith('https://'))) {
      imageUrl = raw.image_url;
    }

    const rawCats = Array.isArray(raw.category) ? raw.category.map((c) => (c || '').toLowerCase()) : [];
    let cat: 'technology' | 'world' | 'sports' | 'finance' = 'world';

    if (targetCategory !== 'all') {
      cat = targetCategory;
    } else if (rawCats.includes('technology')) {
      cat = 'technology';
    } else if (rawCats.includes('sports')) {
      cat = 'sports';
    } else if (rawCats.includes('business') || rawCats.includes('finance')) {
      cat = 'finance';
    } else {
      cat = 'world';
    }

    normalized.push({
      id: `newsdata_${targetLang}_${targetCategory}_${i}_${Buffer.from(cleanUrl).toString('base64').substring(0, 10)}`,
      title: titleText,
      description: (raw.description || titleText).trim(),
      source,
      url: rawUrl,
      imageUrl,
      publishedAt,
      category: cat,
      language: raw.language || targetLang,
    });
  }

  return normalized;
}

async function fetchFromNewsDataApi(language: NewsLanguage, category: NewsCategoryKey): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_DATA_API_KEY || 'pub_a98f5794028649f4bb82a548d393c9cc';
  const langCode = getNewsDataLanguageCode(language);
  const categoryParam = NEWSDATA_CATEGORY_MAP[category];

  const params: Record<string, string> = {
    apikey: apiKey,
    language: langCode,
  };
  if (categoryParam) {
    params.category = categoryParam;
  }

  const queryParams = new URLSearchParams(params);
  const endpoint = 'https://newsdata.io/api/1/latest';
  const url = `${endpoint}?${queryParams.toString()}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'WorldTrends/1.0',
        Accept: 'application/json',
      },
      timeout: 6000,
    });

    const status = response.status;
    const results = response.data && Array.isArray(response.data.results) ? response.data.results : [];
    const resultCount = results.length;
    const firstArticleCategory = results.length > 0
      ? (Array.isArray(results[0].category) ? results[0].category.join(',') : String(results[0].category || 'none'))
      : 'none';
    const firstArticleTitle = results.length > 0 ? String(results[0].title || 'none') : 'none';

    const safeParams = new URLSearchParams(params);
    safeParams.set('apikey', 'REDACTED');

    console.log(
      `[NewsData Debug]\nlanguage=${language}\nuiCategory=${category}\nendpoint=${endpoint}\nrequestParams=${safeParams.toString()}\nstatus=${status}\nresultCount=${resultCount}\nfirstArticleCategory=${firstArticleCategory}\nfirstArticleTitle=${firstArticleTitle}`
    );

    const normalized = normalizeAndDeduplicateArticles(results, language, category);
    return normalized;
  } catch (err: any) {
    const status = err?.response?.status || 500;
    const errorData = err?.response?.data;
    const errMsg = errorData?.results?.message || errorData?.message || err?.message || err;

    const safeParams = new URLSearchParams(params);
    safeParams.set('apikey', 'REDACTED');

    console.warn(
      `[NewsData Debug Error]\nlanguage=${language}\nuiCategory=${category}\nendpoint=${endpoint}\nrequestParams=${safeParams.toString()}\nstatus=${status}\nerror=${errMsg}`
    );

    if (status === 401 || status === 403) {
      console.error(`[NewsData Auth Error] ${status}: Invalid API key or unauthorized request.`);
    } else if (status === 429) {
      console.warn(`[NewsData Rate Limit] 429: Rate limit exceeded.`);
    }
  }

  return [];
}

export async function triggerBackgroundRefresh(language: NewsLanguage = 'english', category: NewsCategoryKey = 'all'): Promise<void> {
  const memKey = getMemoryKey(language, category);
  if (isRefreshInProgressMap[memKey]) return;

  isRefreshInProgressMap[memKey] = true;
  try {
    const articles = await fetchFromNewsDataApi(language, category);
    if (articles.length > 0) {
      const payload: DiskCachePayload = { updatedAt: new Date().toISOString(), articles };
      memoryPayloads[memKey] = payload;
      saveDiskCache(language, category, payload);
    }
  } catch (err) {
    console.warn(`[NewsData Refresh Error] ${memKey}:`, err);
  } finally {
    isRefreshInProgressMap[memKey] = false;
  }
}

export async function getNewsDataFeed(
  categoryRaw: string = 'all',
  interestsStr: string = '',
  forceRefresh: boolean = false,
  rawLanguage: string = 'english'
): Promise<NewsArticle[]> {
  const language = sanitizeLanguage(rawLanguage);
  const category = sanitizeCategory(categoryRaw);
  const memKey = getMemoryKey(language, category);

  // 1. Check memory cache or load from disk cache
  if (!memoryPayloads[memKey]) {
    memoryPayloads[memKey] = loadDiskCachePayload(language, category);
  }

  const payload = memoryPayloads[memKey];

  // 2. CACHE HIT: Return cached data if available and forceRefresh is false
  if (payload && payload.articles.length > 0 && !forceRefresh) {
    console.log(`[NewsData Credit]\nlanguage: ${language}\ncategory: ${category}\nAPI request made: NO\ncache hit: YES`);
    return payload.articles;
  }

  // 3. API REQUEST: Cold start or explicit forced refresh
  console.log(`[NewsData Credit]\nlanguage: ${language}\ncategory: ${category}\nAPI request made: YES\ncache hit: NO`);
  const articles = await fetchFromNewsDataApi(language, category);

  if (articles.length > 0) {
    const newPayload: DiskCachePayload = { updatedAt: new Date().toISOString(), articles };
    memoryPayloads[memKey] = newPayload;
    saveDiskCache(language, category, newPayload);
    return articles;
  }

  // Fallback to existing cache if API returns empty array on refresh
  if (payload && payload.articles.length > 0) {
    return payload.articles;
  }

  // 4. SAVE EMPTY PAYLOAD FOR COLD START WITHOUT RESULTS
  const emptyPayload: DiskCachePayload = { updatedAt: new Date().toISOString(), articles: [] };
  memoryPayloads[memKey] = emptyPayload;
  saveDiskCache(language, category, emptyPayload);
  return [];
}
