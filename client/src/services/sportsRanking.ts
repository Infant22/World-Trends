import { SportsMatch, GuestPreferences } from '../types';

export interface RankingOptions {
  filter: 'ALL' | 'LIVE' | 'UPCOMING';
  limit?: number;
  preferences?: Partial<GuestPreferences>;
}

// Tier 1: Top-tier global sports competitions
const TIER_1_COMPETITIONS = [
  // Football
  'world cup', 'champions league', 'premier league', 'la liga', 'serie a',
  'bundesliga', 'ligue 1', 'euro 20', 'copa america', 'europa league',
  'copa libertadores', 'club world cup', 'nations league',
  // Cricket
  'icc', 't20 world cup', 'champions trophy', 'asia cup', 'ipl',
  'indian premier league', 'ashes', 'big bash', 'psl', 'cpl', 'sa20',
  't20 international', 'one day international', 'test match', 't20i', 'odi', 't20 series', 'tour of', 'series', 't20',
  // Tennis
  'wimbledon', 'us open', 'french open', 'roland garros', 'australian open',
  'atp finals', 'wta finals', 'masters 1000', 'atp 500', 'wta 1000', 'davis cup',
  // Basketball
  'nba', 'euroleague', 'fiba world cup', 'olympic basketball', 'wnba',
];

// Tier 2: Secondary major domestic & regional leagues
const TIER_2_COMPETITIONS = [
  // Football
  'major league soccer', 'mls', 'efl championship', 'eredivisie', 'primeira liga',
  'copa del rey', 'fa cup', 'dfb pokal', 'saudi pro league', 'brasileirao', 'liga mx',
  'primera division', 'division 1',
  // Cricket
  'ranji trophy', 'vitality blast', 'super smash', 'bpl', 't20 league',
  // Tennis
  'atp 250', 'wta 250', 'atp challenger', 'wta challenger', 'challenger tour', 'challenger',
  // Basketball
  'ncaa', 'liga acb', 'bbl', 'lnb', 'nbl', 'cba', 'liga mayor',
];

// Development, youth, reserve, and minor competition penalties
const MINOR_PENALTY_KEYWORDS = [
  'development', 'youth', 'u19', 'u20', 'u21', 'u23', 'under 19', 'under 20',
  'under 21', 'under 23', 'reserves', 'reserve', 'ii', ' 2', 'b team',
  'utr pro', 'utr', 'amateur', 'exhibition', '3rd tier', 'division 3',
];

// Globally prominent teams & national squads
const PROMINENT_TEAMS = [
  'india', 'australia', 'england', 'brazil', 'argentina', 'france', 'spain',
  'germany', 'portugal', 'italy', 'usa', 'united states', 'japan', 'south africa',
  'pakistan', 'new zealand', 'west indies', 'sri lanka', 'bangladesh', 'afghanistan',
  'real madrid', 'barcelona', 'manchester', 'liverpool', 'arsenal', 'chelsea',
  'bayern', 'psg', 'juventus', 'inter milan', 'milan', 'lakers', 'celtics',
  'warriors', 'bulls', 'csk', 'rcb', 'mi', 'mumbai indians', 'chennai super kings',
];

/**
 * Evaluates whether a live event has reliable, concrete live data signals
 */
export function hasReliableLiveData(match: SportsMatch): boolean {
  if (match.status !== 'LIVE') return false;

  const homeScoreStr = match.homeScore !== undefined && match.homeScore !== null ? String(match.homeScore).trim() : '';
  const awayScoreStr = match.awayScore !== undefined && match.awayScore !== null ? String(match.awayScore).trim() : '';

  const hasHomeScore = homeScoreStr !== '' && homeScoreStr !== '-';
  const hasAwayScore = awayScoreStr !== '' && awayScoreStr !== '-';

  if (hasHomeScore || hasAwayScore) {
    return true;
  }

  const statusText = (match.timeOrDate || '').toLowerCase();
  const containsNumbers = /\d+/.test(statusText);
  if (
    containsNumbers &&
    (statusText.includes('over') ||
      statusText.includes('run') ||
      statusText.includes('q1') ||
      statusText.includes('q2') ||
      statusText.includes('q3') ||
      statusText.includes('q4') ||
      statusText.includes('set') ||
      statusText.includes('min') ||
      statusText.includes("'"))
  ) {
    return true;
  }

  return false;
}

/**
 * Calculates a comprehensive match significance & relevance score.
 */
export function calculateMatchScore(match: SportsMatch, preferences?: Partial<GuestPreferences>): number {
  const leagueLower = (match.league || '').toLowerCase();
  const homeLower = (match.homeTeam || '').toLowerCase();
  const awayLower = (match.awayTeam || '').toLowerCase();
  const sportLower = (match.sport || '').toLowerCase();
  const timeOrDateLower = (match.timeOrDate || '').toLowerCase();

  let score = match.importance || 50;

  // 1. Competition Tier Base Scoring
  const isTier1Competition = TIER_1_COMPETITIONS.some((term) => leagueLower.includes(term));
  const isTier2Competition = TIER_2_COMPETITIONS.some((term) => leagueLower.includes(term));

  if (isTier1Competition || match.isInternational) {
    score += 45;
  } else if (isTier2Competition) {
    score += 20;
  }

  // 2. Minor / Development Penalties (-60 points)
  if (MINOR_PENALTY_KEYWORDS.some((kw) => leagueLower.includes(kw) || homeLower.includes(kw) || awayLower.includes(kw))) {
    score -= 60;
  }

  // 3. Team Prominence & High-Profile Matchups
  const isHomeProminent = PROMINENT_TEAMS.some((team) => homeLower.includes(team));
  const isAwayProminent = PROMINENT_TEAMS.some((team) => awayLower.includes(team));

  if (isHomeProminent && isAwayProminent) {
    score += 35; // Major dual-prominent matchup
  } else if (isHomeProminent || isAwayProminent) {
    score += 15;
  }

  // 4. Tournament Stage Significance
  if (match.stage === 'Final' || leagueLower.includes('final')) {
    score += 25;
  } else if (match.stage === 'Semi-Final' || leagueLower.includes('semi')) {
    score += 15;
  } else if (match.stage === 'Quarter-Final' || leagueLower.includes('quarter')) {
    score += 10;
  }

  // 5. International Match Bonus
  if (match.isInternational || leagueLower.includes('international')) {
    score += 25;
  }

  // 6. Cricket Specific Ranking Priority
  if (sportLower === 'cricket') {
    if (match.isInternational || isHomeProminent || isAwayProminent) {
      score += 30; // High international cricket priority
    }
    if (leagueLower.includes('t20') || leagueLower.includes('odi') || leagueLower.includes('test') || leagueLower.includes('icc')) {
      score += 20;
    }
  }

  // 7. Live & Scheduled Proximity Priority
  if (match.status === 'LIVE') {
    score += 30;
  } else if (timeOrDateLower.includes('today')) {
    score += 25; // High priority for major matches starting today
  }

  // 8. User Preferences Relevance
  if (preferences) {
    const homeCountry = (preferences.homeCountry || '').toLowerCase();
    const homeCity = (preferences.homeCity || '').toLowerCase();

    if (
      (homeCountry && (homeLower.includes(homeCountry) || awayLower.includes(homeCountry))) ||
      (homeCity && (homeLower.includes(homeCity) || awayLower.includes(homeCity)))
    ) {
      score += 15;
    }

    const interests = (preferences.selectedInterests || []).map((i) => i.toLowerCase());
    if (
      interests.some(
        (interest) =>
          sportLower.includes(interest) ||
          leagueLower.includes(interest) ||
          (interest === 'sports' && match.status === 'LIVE')
      )
    ) {
      score += 10;
    }
  }

  return score;
}

/**
 * Ranks multi-sport events based on global significance, status, stage,
 * team prominence, user preferences, and multi-sport diversity representation.
 */
export function rankAndFilterSportsMatches(
  matches: SportsMatch[],
  options: RankingOptions
): SportsMatch[] {
  const { filter, limit = 3, preferences } = options;

  if (!matches || matches.length === 0) return [];

  // 1. Filter candidates by status (ALL includes both LIVE and UPCOMING)
  let candidates = matches;
  if (filter === 'LIVE') {
    candidates = matches.filter((m) => m.status === 'LIVE');
  } else if (filter === 'UPCOMING') {
    candidates = matches.filter((m) => m.status === 'UPCOMING');
  }

  if (candidates.length === 0) return [];

  // 2. Compute significance & relevance score for each candidate match
  const scored = candidates.map((match) => ({
    match,
    score: calculateMatchScore(match, preferences),
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  if (filter === 'ALL') {
    console.log('[Sports Ranking] top candidates after ranking:');
    scored.slice(0, 10).forEach((item, idx) => {
      const m = item.match;
      console.log(`${idx + 1}. [${m.sport}] ${m.league}: ${m.homeTeam} vs ${m.awayTeam} (${m.status}) -> score=${item.score}`);
    });
  }

  // 3. Multi-sport diversity selection
  const selected: SportsMatch[] = [];
  const sportCounts: Record<string, number> = {};

  for (const item of scored) {
    if (selected.length >= limit) break;

    const sportKey = item.match.sport || 'Other';
    const currentCount = sportCounts[sportKey] || 0;

    if (currentCount === 0) {
      selected.push(item.match);
      sportCounts[sportKey] = 1;
    } else {
      // Allow second match from same sport ONLY if no unrepresented sport has a high-scoring candidate (>60)
      const hasUnrepresentedViableSport = scored.some(
        (other) =>
          !selected.includes(other.match) &&
          (sportCounts[other.match.sport || 'Other'] || 0) === 0 &&
          other.score > 60
      );

      if (!hasUnrepresentedViableSport) {
        selected.push(item.match);
        sportCounts[sportKey] = currentCount + 1;
      }
    }
  }

  // Fallback: fill remaining slots up to limit
  if (selected.length < limit) {
    for (const item of scored) {
      if (selected.length >= limit) break;
      if (!selected.includes(item.match)) {
        selected.push(item.match);
      }
    }
  }

  return selected;
}
