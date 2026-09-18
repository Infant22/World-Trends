import axios from 'axios';
import { SportsMatch } from './sportScoreService';

function cleanTeamName(rawName?: string): string {
  if (!rawName) return '';
  return String(rawName).replace(/\[.*?\]/g, '').trim();
}

const INTL_TEAMS: Record<string, string> = {
  'india': '🇮🇳',
  'australia': '🇦🇺',
  'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'pakistan': '🇵🇰',
  'south africa': '🇿🇦',
  'new zealand': '🇳🇿',
  'west indies': '🌴',
  'sri lanka': '🇱🇰',
  'bangladesh': '🇧🇩',
  'afghanistan': '🇦🇫',
  'zimbabwe': '🇿🇼',
  'ireland': '🇮🇪',
  'netherlands': '🇳🇱',
  'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'nepal': '🇳🇵',
  'uae': '🇦🇪',
  'usa': '🇺🇸',
  'canada': '🇨🇦',
  'oman': '🇴🇲',
  'namibia': '🇳🇦',
  'uganda': '🇺🇬',
  'hong kong': '🇭🇰',
  'ind': '🇮🇳',
  'aus': '🇦🇺',
  'eng': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'pak': '🇵🇰',
  'sa': '🇿🇦',
  'nz': '🇳🇿',
  'wi': '🌴',
  'sl': '🇱🇰',
  'ban': '🇧🇩',
  'afg': '🇦🇫',
  'zim': '🇿🇼',
  'ire': '🇮🇪',
  'ned': '🇳🇱',
  'sco': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'nep': '🇳🇵',
};

function getTeamLogoOrFlag(teamName: string, directLogo?: string): string {
  if (directLogo && (directLogo.startsWith('http://') || directLogo.startsWith('https://'))) {
    return directLogo;
  }

  const lower = (teamName || '').toLowerCase().trim();
  for (const [key, flag] of Object.entries(INTL_TEAMS)) {
    if (lower === key || lower.startsWith(key + ' ') || lower.endsWith(' ' + key)) {
      return flag;
    }
  }
  return '🏏';
}

function isNationalTeam(teamName: string): boolean {
  const lower = (teamName || '').toLowerCase().trim();
  return Object.keys(INTL_TEAMS).some(
    (key) => lower === key || lower.startsWith(key + ' ') || lower.endsWith(' ' + key)
  );
}

function parseMatchStatus(
  stateRaw?: string,
  detailRaw?: string,
  eventSummary?: string,
  fsSummary?: string,
  hasScore: boolean = false
): 'LIVE' | 'UPCOMING' | 'FINISHED' {
  const state = (stateRaw || '').toLowerCase().trim();
  const detail = (detailRaw || '').toLowerCase().trim();
  const summary = (eventSummary || '').toLowerCase().trim();
  const fsSum = (fsSummary || '').toLowerCase().trim();

  const combined = `${detail} ${summary} ${fsSum}`;

  if (state === 'post' || /won by|drawn|completed|result|final|abandoned/i.test(combined)) {
    return 'FINISHED';
  }

  if (state === 'in') {
    if (!hasScore && /starts at|scheduled to begin|yet to begin/i.test(combined)) {
      return 'UPCOMING';
    }
    return 'LIVE';
  }

  if (/live|in progress|stumps|tea|lunch|drinks|session|day|ov|need|trail|lead/i.test(combined)) {
    return 'LIVE';
  }

  return 'UPCOMING';
}

function formatMatchTime(isoString?: string, status?: 'LIVE' | 'UPCOMING' | 'FINISHED', detailText?: string): string {
  if (status === 'LIVE') return detailText || 'LIVE';
  if (status === 'FINISHED') return detailText || 'FT';

  if (!isoString) return detailText || 'Scheduled';

  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return detailText || 'Scheduled';

    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today ${timeStr}`;
    if (isTomorrow) return `Tomorrow ${timeStr}`;

    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return detailText || 'Scheduled';
  }
}

// Global server-side memory cache for ESPN Cricket data
let cachedEspnMatches: { timestamp: number; matches: SportsMatch[] } | null = null;
const ESPN_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function fetchEspnCricketMatches(forceRefresh: boolean = false): Promise<SportsMatch[]> {
  const now = Date.now();

  if (!forceRefresh && cachedEspnMatches && now - cachedEspnMatches.timestamp < ESPN_CACHE_TTL_MS) {
    return cachedEspnMatches.matches;
  }

  try {
    const url = 'https://site.web.api.espn.com/apis/v2/scoreboard/header?sport=cricket';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'WorldTrends/1.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    const normalizedMatches: SportsMatch[] = [];
    const seenIds = new Set<string>();

    const sports = Array.isArray(response.data?.sports) ? response.data.sports : [];

    for (const sport of sports) {
      if (sport.slug !== 'cricket' && sport.name !== 'cricket') continue;

      const leagues = Array.isArray(sport.leagues) ? sport.leagues : [];

      for (const league of leagues) {
        const leagueName = (league.name || league.abbreviation || 'Cricket').trim();
        const events = Array.isArray(league.events) ? league.events : [];

        for (const event of events) {
          if (!event || !event.id) continue;

          const matchId = `espn_${event.id}`;
          if (seenIds.has(matchId)) continue;
          seenIds.add(matchId);

          const competitors = Array.isArray(event.competitors) ? event.competitors : [];
          const homeComp = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
          const awayComp = competitors.find((c: any) => c.homeAway === 'away') || competitors[1];

          if (!homeComp || !awayComp) continue;

          const homeTeam = cleanTeamName(homeComp.displayName || homeComp.name || homeComp.abbreviation);
          const awayTeam = cleanTeamName(awayComp.displayName || awayComp.name || awayComp.abbreviation);

          if (!homeTeam || !awayTeam) continue;

          const homeLogo = getTeamLogoOrFlag(homeTeam, homeComp.logo);
          const awayLogo = getTeamLogoOrFlag(awayTeam, awayComp.logo);

          // Extract scores directly from competitor.score
          const rawHomeScore = homeComp.score !== undefined && homeComp.score !== null ? String(homeComp.score).trim() : '';
          const rawAwayScore = awayComp.score !== undefined && awayComp.score !== null ? String(awayComp.score).trim() : '';

          const homeScore = rawHomeScore !== '' ? rawHomeScore : undefined;
          const awayScore = rawAwayScore !== '' ? rawAwayScore : undefined;
          const hasScore = homeScore !== undefined || awayScore !== undefined;

          const stateRaw = event.fullStatus?.type?.state || event.status?.type?.state;
          const detailRaw = event.fullStatus?.type?.detail || event.fullStatus?.type?.shortDetail || '';
          const fsSummary = event.fullStatus?.summary || event.fullStatus?.longSummary || '';
          const eventSummary = event.summary || '';

          const status = parseMatchStatus(stateRaw, detailRaw, eventSummary, fsSummary, hasScore);

          let timeOrDate = 'Scheduled';

          if (status === 'LIVE') {
            if (eventSummary && !/live/i.test(eventSummary)) {
              timeOrDate = eventSummary;
            } else if (fsSummary && !/starts at|scheduled/i.test(fsSummary)) {
              timeOrDate = fsSummary;
            } else if (detailRaw && !/live/i.test(detailRaw)) {
              timeOrDate = detailRaw;
            } else {
              timeOrDate = 'Live';
            }
          } else if (status === 'FINISHED') {
            timeOrDate = fsSummary || detailRaw || 'FT';
          } else {
            if (fsSummary && /starts at/i.test(fsSummary)) {
              timeOrDate = fsSummary;
            } else {
              timeOrDate = formatMatchTime(event.date, status, detailRaw);
            }
          }

          const lowerLeague = leagueName.toLowerCase();
          const isInternational =
            (Boolean(homeComp.isNational) || isNationalTeam(homeTeam)) &&
            (Boolean(awayComp.isNational) || isNationalTeam(awayTeam)) ||
            lowerLeague.includes('tour of') ||
            lowerLeague.includes('t20i') ||
            lowerLeague.includes('odi') ||
            lowerLeague.includes('test') ||
            lowerLeague.includes('icc') ||
            lowerLeague.includes('world cup') ||
            lowerLeague.includes('champions trophy') ||
            lowerLeague.includes('asia cup') ||
            lowerLeague.includes('international') ||
            lowerLeague.includes('tri-series');

          const importance =
            isInternational ||
            lowerLeague.includes('ipl') ||
            lowerLeague.includes('cpl') ||
            lowerLeague.includes('big bash') ||
            lowerLeague.includes('psl') ||
            lowerLeague.includes('hundred')
              ? 90
              : 50;

          normalizedMatches.push({
            id: matchId,
            league: leagueName,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
            homeLogo,
            awayLogo,
            status,
            timeOrDate,
            sport: 'cricket',
            importance,
            isInternational,
          });
        }
      }
    }

    if (normalizedMatches.length > 0) {
      cachedEspnMatches = { timestamp: now, matches: normalizedMatches };
      return normalizedMatches;
    }
  } catch (err: any) {
    console.warn(`[ESPN Cricket Service Error] ${err?.message || err}`);
  }

  if (cachedEspnMatches && cachedEspnMatches.matches.length > 0) {
    return cachedEspnMatches.matches;
  }

  return [];
}

// Export alias for backward compatibility with sportScoreService
export async function fetchCricLiveMatches(forceRefresh: boolean = false): Promise<SportsMatch[]> {
  return fetchEspnCricketMatches(forceRefresh);
}
