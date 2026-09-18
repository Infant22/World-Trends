import axios from 'axios';
import { fetchCricLiveMatches } from './cricLiveService';

export interface SportsMatch {
  id: string;
  league: string;
  homeTeam: string;
  homeScore?: number | string;
  homeLogo?: string;
  awayTeam: string;
  awayScore?: number | string;
  awayLogo?: string;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  timeOrDate: string;
  sport?: string;
  importance?: number;
  isInternational?: boolean;
  stage?: string;
  slug?: string;
  debugSource?: string;
}

const SPORT_EMOJIS: Record<string, string> = {
  football: '⚽',
  cricket: '🏏',
  basketball: '🏀',
  tennis: '🎾',
};

function extractSlug(url?: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim().replace(/\/$/, '');
  const parts = cleanUrl.split('/');
  if (parts.length > 0) {
    return parts[parts.length - 1];
  }
  return null;
}

function normalizeStatus(statusRaw?: string, statusTextRaw?: string): 'LIVE' | 'UPCOMING' | 'FINISHED' {
  const s = (statusRaw || '').toLowerCase();
  const st = (statusTextRaw || '').toLowerCase();

  if (
    s === 'live' ||
    s === 'in_progress' ||
    s.includes('1h') ||
    s.includes('2h') ||
    s.includes('ht') ||
    s.includes('q1') ||
    s.includes('q2') ||
    s.includes('q3') ||
    s.includes('q4') ||
    s.includes('set') ||
    st.includes('live') ||
    st.includes('in progress')
  ) {
    return 'LIVE';
  }

  if (
    s === 'finished' ||
    s === 'ended' ||
    s === 'ft' ||
    s === 'aet' ||
    s === 'pen' ||
    st.includes('finished') ||
    st.includes('ended')
  ) {
    return 'FINISHED';
  }

  return 'UPCOMING';
}

function formatMatchTime(isoString?: string, status?: string, statusText?: string): string {
  if (status === 'LIVE') return statusText || 'LIVE';
  if (status === 'FINISHED') return statusText || 'FT';

  if (!isoString) return statusText || 'Scheduled';

  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return statusText || 'Scheduled';

    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) {
      return `Today ${timeStr}`;
    } else {
      const dateStr = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return `${dateStr}, ${timeStr}`;
    }
  } catch {
    return statusText || 'Scheduled';
  }
}

let cachedMatchesPayload: { timestamp: number; matches: SportsMatch[] } | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes cache TTL

const detailCache = new Map<string, { timestamp: number; data: any }>();
const DETAIL_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes detail cache

let detailApiRequestCount = 0;

export function getDetailApiRequestCount(): number {
  return detailApiRequestCount;
}

async function fetchMatchDetail(sport: string, slug: string): Promise<any | null> {
  const cacheKey = `${sport}_${slug}`;
  const now = Date.now();
  const cached = detailCache.get(cacheKey);
  if (cached && now - cached.timestamp < DETAIL_CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://sportscore.com/api/widget/match/?sport=${sport}&slug=${slug}`;
  try {
    detailApiRequestCount++;
    console.log(`[Sports Match Detail]\nsport=${sport}\nslug=${slug}\nrequested=true`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      timeout: 5000,
    });

    console.log(`httpStatus=${response.status}\nresponseReceived=true`);

    const matchDetail = response.data?.match || response.data?.data || response.data;
    if (matchDetail) {
      detailCache.set(cacheKey, { timestamp: now, data: matchDetail });
      return matchDetail;
    }
  } catch (err: any) {
    console.log(`httpStatus=${err?.response?.status || 'ERROR'}\nresponseReceived=false`);
    console.warn(`[SportScore Detail Error] sport=${sport} slug=${slug} error=${err?.message || err}`);
  }
  return null;
}

export async function fetchSportScoreMatches(forceRefresh: boolean = false): Promise<SportsMatch[]> {
  const now = Date.now();
  if (!forceRefresh && cachedMatchesPayload && now - cachedMatchesPayload.timestamp < CACHE_TTL_MS) {
    console.log(`[SportScore Service] Cache hit: ${cachedMatchesPayload.matches.length} matches (Age: ${((now - cachedMatchesPayload.timestamp) / 1000).toFixed(0)}s)`);
    return cachedMatchesPayload.matches;
  }

  const sports = ['football', 'basketball', 'tennis'];
  const poolCounts: Record<string, number> = {};
  const allMatches: SportsMatch[] = [];

  console.log(`[SportScore Service] Fetching sports matches from SportScore (football, basketball, tennis)...`);

  await Promise.all([
    ...sports.map(async (sport) => {
      const url = `https://sportscore.com/api/widget/matches/?sport=${sport}&limit=50`;
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
          timeout: 10000,
        });

        const rawList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.matches)
          ? response.data.matches
          : Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        poolCounts[sport] = rawList.length;

        rawList.forEach((m: any, idx: number) => {
          if (!m || !m.home || !m.away) return;

          const status = normalizeStatus(m.status, m.status_text);
          const timeOrDate = formatMatchTime(m.time, status, m.status_text);
          const league = (m.competition || 'Global Match').trim();

          const lowerLeague = league.toLowerCase();
          const importance =
            lowerLeague.includes('cup') ||
            lowerLeague.includes('premier') ||
            lowerLeague.includes('champions') ||
            lowerLeague.includes('nba') ||
            lowerLeague.includes('ipl')
              ? 85
              : 50;

          const isInternational =
            lowerLeague.includes(' vs ') ||
            lowerLeague.includes('world') ||
            lowerLeague.includes('t20') ||
            lowerLeague.includes('international') ||
            lowerLeague.includes('nations');

          const slug = extractSlug(m.url);

          allMatches.push({
            id: `sportscore_${sport}_${idx}_${Buffer.from(m.url || `${m.home}_${m.away}_${m.time}`).toString('base64').substring(0, 10)}`,
            league,
            homeTeam: (m.home || '').trim(),
            awayTeam: (m.away || '').trim(),
            homeScore: m.home_score !== undefined && m.home_score !== null && m.home_score !== '' ? m.home_score : undefined,
            awayScore: m.away_score !== undefined && m.away_score !== null && m.away_score !== '' ? m.away_score : undefined,
            homeLogo: m.home_logo || SPORT_EMOJIS[sport],
            awayLogo: m.away_logo || SPORT_EMOJIS[sport],
            status,
            timeOrDate,
            sport,
            importance,
            isInternational,
            slug: slug || undefined,
          });
        });
      } catch (err: any) {
        console.warn(`[SportScore API Warning] sport=${sport} error=${err?.message || err}`);
        poolCounts[sport] = 0;
      }
    }),
    (async () => {
      try {
        const cricketMatches = await fetchCricLiveMatches(forceRefresh);
        poolCounts['cricket'] = cricketMatches.length;
        allMatches.push(...cricketMatches);
      } catch (err: any) {
        console.warn(`[CricLive Fetch Warning] error=${err?.message || err}`);
        poolCounts['cricket'] = 0;
      }
    })(),
  ]);

  console.log(
    `[Sports Pool]\nfootball=${poolCounts['football'] || 0}\ncricket=${poolCounts['cricket'] || 0}\nbasketball=${poolCounts['basketball'] || 0}\ntennis=${poolCounts['tennis'] || 0}\ncombined=${allMatches.length}`
  );

  // DETECT MISSING LIVE SCORES FOR SPORTSCORE MATCHES & ENRICH
  const liveMissingScoreMatches = allMatches.filter((match) => {
    if (match.status !== 'LIVE' || match.sport === 'cricket') return false;
    const isHomeMissing =
      match.homeScore === undefined || match.homeScore === null || match.homeScore === '' || match.homeScore === '-';
    const isAwayMissing =
      match.awayScore === undefined || match.awayScore === null || match.awayScore === '' || match.awayScore === '-';
    return isHomeMissing || isAwayMissing;
  });

  if (liveMissingScoreMatches.length > 0) {
    console.log(
      `[SportScore Service] Found ${liveMissingScoreMatches.length} live match(es) with missing score data. Fetching match details...`
    );
    await Promise.all(
      liveMissingScoreMatches.map(async (match) => {
        if (!match.slug || !match.sport) return;
        const detail = await fetchMatchDetail(match.sport, match.slug);
        if (detail) {
          if (detail.home_score !== undefined && detail.home_score !== null && detail.home_score !== '') {
            match.homeScore = detail.home_score;
          }
          if (detail.away_score !== undefined && detail.away_score !== null && detail.away_score !== '') {
            match.awayScore = detail.away_score;
          }
          if (detail.status_text) {
            match.timeOrDate = detail.status_text;
          }
          if (detail.status) {
            match.status = normalizeStatus(detail.status, detail.status_text);
          }
        }
      })
    );
  }

  if (allMatches.length > 0) {
    cachedMatchesPayload = { timestamp: now, matches: allMatches };
    console.log(`[SportScore Service] Successfully fetched and normalized ${allMatches.length} matches.`);
    return allMatches;
  }

  if (cachedMatchesPayload && cachedMatchesPayload.matches.length > 0) {
    return cachedMatchesPayload.matches;
  }

  return [];
}


