import { GuestPreferences } from '../types';

export type WidgetKey = 'weather' | 'news' | 'sports' | 'currency' | 'worldClock' | 'trending' | 'explore';

export interface LayoutConfig {
  mode: 'MODE_DEFAULT_7' | 'MODE_BALANCED_2COL' | 'MODE_SINGLE_COL' | 'EMPTY';
  totalActive: number;
  leftWidgets: WidgetKey[];
  rightWidgets: WidgetKey[];
  containerClass: string;
  leftColumnClass: string;
  rightColumnClass: string;
}

// Estimated section heights in pixels (section header 34px + gap 12px + card content height)
export const SECTION_HEIGHTS: Record<WidgetKey, number> = {
  weather: 286,
  news: 496,
  sports: 356,
  currency: 226,
  worldClock: 256,
  trending: 306,
  explore: 336,
};

// Canonical ordering for top-to-bottom hierarchy within each column
const CANONICAL_ORDER: WidgetKey[] = ['weather', 'news', 'sports', 'currency', 'worldClock', 'trending', 'explore'];

/**
 * Calculates the total height of a set of widgets in a single column (including 24px space-y-6 gaps).
 */
function calculateColumnHeight(widgets: WidgetKey[]): number {
  if (widgets.length === 0) return 0;
  const hasCurrency = widgets.includes('currency');
  const hasWorldClock = widgets.includes('worldClock');

  let height = 0;

  // If both currency and world clock are in the same column, they share a single "Live Utilities" header (442px total)
  if (hasCurrency && hasWorldClock) {
    height += 442;
  } else if (hasCurrency) {
    height += SECTION_HEIGHTS.currency;
  } else if (hasWorldClock) {
    height += SECTION_HEIGHTS.worldClock;
  }

  for (const key of widgets) {
    if (key !== 'currency' && key !== 'worldClock') {
      height += SECTION_HEIGHTS[key];
    }
  }

  const sectionCount =
    (hasCurrency && hasWorldClock ? 1 : (hasCurrency ? 1 : 0) + (hasWorldClock ? 1 : 0)) +
    widgets.filter((k) => k !== 'currency' && k !== 'worldClock').length;

  if (sectionCount > 1) {
    height += (sectionCount - 1) * 24;
  }

  return height;
}

/**
 * Subset partition to divide active widgets into 2 independent vertical columns
 * minimizing vertical height difference and eliminating horizontal grid row locks.
 */
function partitionWidgetsOptimal(activeKeys: WidgetKey[]): { left: WidgetKey[]; right: WidgetKey[] } {
  let bestLeft: WidgetKey[] = [];
  let bestRight: WidgetKey[] = [];
  let minDiff = Infinity;

  const n = activeKeys.length;
  const numCombos = 1 << n;

  for (let i = 0; i < numCombos; i++) {
    const left: WidgetKey[] = [];
    const right: WidgetKey[] = [];

    for (let j = 0; j < n; j++) {
      const key = activeKeys[j];
      if ((i & (1 << j)) !== 0) {
        left.push(key);
      } else {
        right.push(key);
      }
    }

    if (left.length === 0 || right.length === 0) continue;

    const leftH = calculateColumnHeight(left);
    const rightH = calculateColumnHeight(right);
    const diff = Math.abs(leftH - rightH);

    if (diff < minDiff) {
      minDiff = diff;
      bestLeft = left;
      bestRight = right;
    }
  }

  // Sort canonical order for top-to-bottom hierarchy
  bestLeft.sort((a, b) => CANONICAL_ORDER.indexOf(a) - CANONICAL_ORDER.indexOf(b));
  bestRight.sort((a, b) => CANONICAL_ORDER.indexOf(a) - CANONICAL_ORDER.indexOf(b));

  return { left: bestLeft, right: bestRight };
}

/**
 * Calculates dynamic dashboard layout columns based on currently enabled widgets.
 */
export function calculateDashboardLayout(visibleWidgets: GuestPreferences['visibleWidgets']): LayoutConfig {
  const activeKeys = CANONICAL_ORDER.filter((key) => !!visibleWidgets[key]);
  const totalActive = activeKeys.length;

  if (totalActive === 0) {
    return {
      mode: 'EMPTY',
      totalActive: 0,
      leftWidgets: [],
      rightWidgets: [],
      containerClass: 'w-full',
      leftColumnClass: 'w-full',
      rightColumnClass: 'hidden',
    };
  }

  // 1. ALL 7 WIDGETS ENABLED — Preserve exact approved 2:1 desktop main/sidebar layout
  if (totalActive === 7) {
    return {
      mode: 'MODE_DEFAULT_7',
      totalActive: 7,
      leftWidgets: ['weather', 'news', 'sports'],
      rightWidgets: ['currency', 'worldClock', 'trending', 'explore'],
      containerClass: 'grid grid-cols-1 lg:grid-cols-3 gap-6 items-start',
      leftColumnClass: 'lg:col-span-2 space-y-6',
      rightColumnClass: 'lg:col-span-1 space-y-6',
    };
  }

  // 2. SINGLE WIDGET ENABLED — Centered natural container
  if (totalActive === 1) {
    return {
      mode: 'MODE_SINGLE_COL',
      totalActive: 1,
      leftWidgets: activeKeys,
      rightWidgets: [],
      containerClass: 'max-w-4xl mx-auto space-y-6',
      leftColumnClass: 'w-full space-y-6',
      rightColumnClass: 'hidden',
    };
  }

  // 3. SPECIAL CASE FOR 6 ACTIVE WIDGETS WHEN NEWS + WEATHER + SPORTS ARE ALL ACTIVE
  if (
    totalActive === 6 &&
    visibleWidgets.weather &&
    visibleWidgets.news &&
    visibleWidgets.sports
  ) {
    const rightKeys = activeKeys.filter((k) => k !== 'weather' && k !== 'news' && k !== 'sports');
    return {
      mode: 'MODE_DEFAULT_7',
      totalActive: 6,
      leftWidgets: ['weather', 'news', 'sports'],
      rightWidgets: rightKeys,
      containerClass: 'grid grid-cols-1 lg:grid-cols-3 gap-6 items-start',
      leftColumnClass: 'lg:col-span-2 space-y-6',
      rightColumnClass: 'lg:col-span-1 space-y-6',
    };
  }

  // 4. REDUCED STATES (2–6 active widgets) — Dynamic height-balanced 2-column partition without row grid locks
  const { left, right } = partitionWidgetsOptimal(activeKeys);

  return {
    mode: 'MODE_BALANCED_2COL',
    totalActive,
    leftWidgets: left,
    rightWidgets: right,
    containerClass: 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start',
    leftColumnClass: 'space-y-6',
    rightColumnClass: 'space-y-6',
  };
}
