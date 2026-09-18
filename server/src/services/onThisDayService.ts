import axios from 'axios';
import { apiCache } from '../index';

export interface OnThisDayEvent {
  title: string;
  year: number | string;
  category: string;
  description: string;
  imageUrl?: string;
  pageUrl?: string;
  articleTitle?: string;
}

const DEFAULT_FALLBACK_EVENT: OnThisDayEvent = {
  title: 'First International Web Standards Consortium Established',
  year: 1995,
  category: 'Milestone',
  description:
    'Pioneering computer scientists assembled to form the global standards for modern web protocols, laying the foundation for modern real-time internet architectures.',
  pageUrl: 'https://en.wikipedia.org/wiki/World_Wide_Web_Consortium',
};

const MILESTONE_KEYWORDS = [
  'treaty', 'accord', 'revolution', 'space', 'established', 'founded', 'discovered',
  'signed', 'inaugurated', 'war', 'peace', 'independence', 'constitution', 'first',
  'milestone', 'science', 'invention', 'proclaimed', 'charter', 'launch', 'orbit'
];

function scoreEvent(item: any): number {
  let score = 50;

  // Bonus for presence of a Wikipedia page with thumbnail image
  if (item.pages && item.pages.length > 0) {
    score += 20;
    if (item.pages.some((p: any) => p.thumbnail?.source)) {
      score += 25;
    }
  }

  // Bonus for matching major historical milestone keywords
  const textLower = (item.text || '').toLowerCase();
  if (MILESTONE_KEYWORDS.some((kw) => textLower.includes(kw))) {
    score += 30;
  }

  // Bonus for recent/modern events (post 1800)
  if (item.year && item.year > 1800) {
    score += 15;
  }

  return score;
}

export async function fetchOnThisDayEvent(): Promise<OnThisDayEvent> {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const cacheKey = `onthisday_${month}_${day}`;

  // 1. Check 24-hour server cache (86400 seconds)
  const cached = apiCache.get<OnThisDayEvent>(cacheKey);
  if (cached) {
    console.log(`[OnThisDay Service] Cache hit for ${month}/${day}`);
    return cached;
  }

  console.log(`[OnThisDay Service] Fetching Wikipedia On This Day for ${month}/${day}...`);

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'WorldTrends/1.0 (https://worldtrends.app; contact@worldtrends.app)',
        Accept: 'application/json',
      },
      timeout: 8000,
    });

    const data = response.data;
    if (!data) throw new Error('Empty response from Wikipedia API');

    // Prefer human-curated 'selected' highlights, fallback to 'events'
    const candidateList: any[] = Array.isArray(data.selected) && data.selected.length > 0
      ? data.selected
      : Array.isArray(data.events) && data.events.length > 0
      ? data.events
      : [];

    if (candidateList.length === 0) {
      throw new Error('No historical events found for today');
    }

    // Rank events by significance, image availability, and historical impact
    const scoredList = candidateList.map((item) => ({
      item,
      score: scoreEvent(item),
    }));

    scoredList.sort((a, b) => b.score - a.score);
    const topItem = scoredList[0].item;

    const topPage = Array.isArray(topItem.pages) && topItem.pages.length > 0 ? topItem.pages[0] : null;

    // Clean title: page title or fallback to text snippet
    const rawTitle = topPage?.titles?.normalized || topPage?.title || topItem.text || 'Historical Event';
    const cleanTitle = String(rawTitle).replace(/_/g, ' ');

    // Description: text or page extract
    const description = topItem.text || topPage?.extract || topPage?.description || 'A major historical event occurred on this day.';

    // Image URL & Page URL
    const imageUrl = topPage?.thumbnail?.source || topPage?.originalimage?.source;
    const pageUrl = topPage?.content_urls?.desktop?.page || (topPage?.title ? `https://en.wikipedia.org/wiki/${encodeURIComponent(topPage.title)}` : undefined);

    const resultEvent: OnThisDayEvent = {
      title: cleanTitle,
      year: topItem.year || now.getFullYear(),
      category: topPage?.description ? 'Historical Milestone' : 'Historical Milestone',
      description,
      imageUrl: imageUrl || undefined,
      pageUrl: pageUrl || undefined,
      articleTitle: topPage?.title || undefined,
    };

    // Cache for 24 hours (86400 seconds)
    apiCache.set(cacheKey, resultEvent, 86400);
    return resultEvent;
  } catch (err: any) {
    console.warn(`[OnThisDay Service Warning] ${err?.message || err}`);
    if (cached) return cached;
    return DEFAULT_FALLBACK_EVENT;
  }
}
