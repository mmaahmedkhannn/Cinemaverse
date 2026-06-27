/**
 * moodEngine.ts
 *
 * Core logic for the Mood Discovery Engine. Combines quiz answers (mood,
 * audience, time, era) into TMDB Discover API parameters, fetches results,
 * and calculates a match percentage for each film.
 *
 * Fallback strategy: if keywords produce < 5 results, retries without
 * keyword filters to ensure the user always sees recommendations.
 */
import { MOODS } from '../data/moods';
import { tmdbApi } from '../services/tmdb';
import type { TMDBMovie } from '../services/tmdb';

export type AudienceType = 'solo' | 'couple' | 'group' | 'family';
export type TimeType = 'short' | 'medium' | 'long' | 'any';
export type EraType = 'latest' | '2010s' | '2000s' | 'classic' | 'any';

export interface QuizAnswers {
  moodId: string;
  audience: AudienceType;
  time: TimeType;
  era: EraType;
}

export interface MoodResult extends TMDBMovie {
  matchScore: number;
  matchReason: string;
  runtime?: number;
  tagline?: string;
  vote_count: number;
  popularity: number;
  relaxed?: boolean;
}

const ERA_MAP: Record<string, { gte?: string; lte?: string }> = {
  latest: { gte: '2023-01-01' },
  '2010s': { gte: '2010-01-01', lte: '2019-12-31' },
  '2000s': { gte: '2000-01-01', lte: '2009-12-31' },
  classic: { lte: '1999-12-31' },
};

/**
 * Builds TMDB Discover API parameters from the 4 quiz answers.
 */
export function buildMoodQuery(answers: QuizAnswers): Record<string, string | number> {
  const mood = MOODS.find((m) => m.id === answers.moodId);
  if (!mood) throw new Error(`Unknown mood: ${answers.moodId}`);

  const params: Record<string, string | number> = { ...mood.tmdbParams };

  // ── Audience filter ──
  if (answers.audience === 'family') {
    params.certification_country = 'US';
    params['certification.lte'] = 'PG-13';
    // Ensure horror is excluded for family viewing
    const existing = params.without_genres ? String(params.without_genres) : '';
    const genres = existing.split(',').filter(Boolean);
    if (!genres.includes('27')) genres.push('27');
    params.without_genres = genres.join(',');
  }

  // ── Time filter ──
  if (answers.time === 'short') {
    params['with_runtime.lte'] = 90;
  } else if (answers.time === 'medium') {
    params['with_runtime.gte'] = 90;
    params['with_runtime.lte'] = 120;
  } else if (answers.time === 'long') {
    params['with_runtime.gte'] = 120;
    params['with_runtime.lte'] = 180;
  }

  // ── Era filter ──
  if (answers.era !== 'any') {
    const era = ERA_MAP[answers.era];
    if (era) {
      if (era.gte) params['primary_release_date.gte'] = era.gte;
      if (era.lte) params['primary_release_date.lte'] = era.lte;
    }
  }

  // ── Performance defaults ──
  params.language = 'en-US';
  params.include_adult = 'false';

  // ── Quality floor: prevent zero/micro-vote spam ──────────────────────────
  // Films with 2 votes rated 10.0 beat films with 500k votes rated 8.2 without
  // this floor. Applied universally; only overrides if mood set a lower value.
  if (!params['vote_count.gte'] || Number(params['vote_count.gte']) < 500) {
    params['vote_count.gte'] = 500;
  }

  // ── Rating floor: ensure baseline watchability ───────────────────────────
  // Prevents junk even if it clears the vote_count floor.
  if (!params['vote_average.gte'] || Number(params['vote_average.gte']) < 6.0) {
    params['vote_average.gte'] = 6.0;
  }

  // ── "Latest" era override ────────────────────────────────────────────────
  // Recent films genuinely have fewer votes, so we lower the floor slightly.
  // We also force popularity.desc so big anticipated releases surface first,
  // not obscure 2024/2025 uploads that happen to have a high rating from 3 votes.
  if (answers.era === 'latest') {
    params['vote_count.gte'] = 300;      // Lower floor — new films are newer
    params.sort_by = 'popularity.desc';  // Surface well-known recent releases
  }

  return params;
}

/**
 * Calculates a match percentage (70–99) based on how well the film
 * fits the user's combined criteria.
 */
function calculateMatchScore(
  film: TMDBMovie & { popularity: number; vote_count: number },
  answers: QuizAnswers,
): number {
  let score = 75; // Base score — all results already match the core mood

  // Bonus for high ratings
  if (film.vote_average >= 8.0) score += 8;
  else if (film.vote_average >= 7.5) score += 5;
  else if (film.vote_average >= 7.0) score += 3;

  // Bonus for popularity
  if (film.popularity > 50) score += 3;
  if (film.popularity > 100) score += 2;

  // Bonus for vote count (well-reviewed)
  if (film.vote_count > 5000) score += 3;
  else if (film.vote_count > 1000) score += 2;

  // Era match bonus
  if (answers.era !== 'any' && film.release_date) {
    const year = parseInt(film.release_date.substring(0, 4), 10);
    const eraMatches =
      (answers.era === 'latest' && year >= 2023) ||
      (answers.era === '2010s' && year >= 2010 && year <= 2019) ||
      (answers.era === '2000s' && year >= 2000 && year <= 2009) ||
      (answers.era === 'classic' && year < 2000);
    if (eraMatches) score += 4;
  }

  // Cap at 99
  return Math.min(99, Math.max(70, score));
}

/**
 * Builds a human-readable "Why this pick" reason string.
 */
function buildMatchReason(answers: QuizAnswers): string {
  const mood = MOODS.find((m) => m.id === answers.moodId);
  const parts: string[] = [];

  if (mood) parts.push(mood.description);

  if (answers.time === 'short') parts.push('Under 90 min');
  else if (answers.time === 'medium') parts.push('90–120 min runtime');
  else if (answers.time === 'long') parts.push('2–3 hour epic');

  if (answers.era === 'latest') parts.push('Recent release');
  else if (answers.era !== 'any') parts.push(`${answers.era} era`);

  if (answers.audience === 'family') parts.push('Family-friendly');
  else if (answers.audience === 'couple') parts.push('Date night pick');

  return parts.join(' · ');
}
/**
 * Main entry point: fetches mood-based recommendations from TMDB.
 * Accepts an optional page number to enable fresh picks on the same quiz answers.
 * Applies fallback (removes keywords) if initial results are too few.
 *
 * Pagination strategy:
 *   1. Probe page 1 to learn total_pages → compute a safe ceiling (max 5).
 *   2. Modulo-cycle the requested page into [1..ceiling] so deep pages never
 *      land on an empty TMDB page.
 *   3. Fill to ≥ 20 unique films by merging successive cycled pages.
 *   4. If still under 20, auto-relax: remove runtime → remove era → re-fetch.
 *   5. Cap total TMDB calls at 6 per invocation to stay within the 8 s timeout.
 */
export async function getMoodResults(answers: QuizAnswers, page = 1): Promise<MoodResult[]> {
  const MAX_TMDB_CALLS = 6;
  const TARGET_FILL = 20;

  let tmdbCalls = 0;
  let relaxed = false;
  const params = buildMoodQuery(answers);
  let activeParams: Record<string, string | number | undefined> = { ...params };

  // ── 1. Probe page 1 to learn the mood's real depth ──────────────────────
  const probeResponse = await tmdbApi.discoverMovies({ ...activeParams, page: 1 });
  tmdbCalls++;
  let probeResults: TMDBMovie[] = (probeResponse.results as TMDBMovie[] | undefined) || [];
  let probeTotalPages: number = typeof probeResponse.total_pages === 'number'
    ? probeResponse.total_pages
    : 1;

  // ── Keyword fallback: if keywords are too strict, retry without them ────
  if (probeResults.length < 5 && activeParams.with_keywords) {
    const fallbackParams = { ...activeParams };
    delete fallbackParams.with_keywords;
    activeParams = fallbackParams;

    const fallbackProbe = await tmdbApi.discoverMovies({ ...activeParams, page: 1 });
    tmdbCalls++;
    probeResults = (fallbackProbe.results as TMDBMovie[] | undefined) || [];
    probeTotalPages = typeof fallbackProbe.total_pages === 'number'
      ? fallbackProbe.total_pages
      : 1;
  }

  // ── 2. Cycled fetch with current params ─────────────────────────────────
  let { films: collected, calls: usedCalls } = await fetchCycledFilms(
    activeParams, page, Math.min(probeTotalPages, 5), probeResults, tmdbCalls, MAX_TMDB_CALLS,
  );
  tmdbCalls = usedCalls;

  // ── 3. Auto-relax if under target ───────────────────────────────────────
  //    Step A: remove runtime filter
  //    Step B: remove era filter
  //    Genres, keywords, vote floors, audience, without_genres stay LOCKED.
  const relaxSteps: Array<(p: Record<string, string | number | undefined>) => void> = [
    (p) => { delete p['with_runtime.lte']; delete p['with_runtime.gte']; },
    (p) => { delete p['primary_release_date.gte']; delete p['primary_release_date.lte']; },
  ];

  for (const applyRelax of relaxSteps) {
    if (deduplicateFilms(collected).length >= TARGET_FILL || tmdbCalls >= MAX_TMDB_CALLS) break;

    // Check if this relax step would actually change anything
    const relaxedParams: Record<string, string | number | undefined> = { ...activeParams };
    applyRelax(relaxedParams);

    // Skip if params didn't change (filter wasn't present)
    if (paramsEqual(activeParams, relaxedParams)) continue;

    activeParams = relaxedParams;
    relaxed = true;

    // Re-probe with relaxed params
    const relaxProbe = await tmdbApi.discoverMovies({ ...activeParams, page: 1 });
    tmdbCalls++;
    const relaxResults: TMDBMovie[] = (relaxProbe.results as TMDBMovie[] | undefined) || [];
    const relaxTotalPages: number = typeof relaxProbe.total_pages === 'number'
      ? relaxProbe.total_pages
      : 1;

    // Merge new results into existing pool
    const { films: relaxFilms, calls: relaxCalls } = await fetchCycledFilms(
      activeParams, page, Math.min(relaxTotalPages, 5), relaxResults, tmdbCalls, MAX_TMDB_CALLS,
    );
    tmdbCalls = relaxCalls;
    collected = [...collected, ...relaxFilms];
  }

  // ── 4. Deduplicate by ID ────────────────────────────────────────────────
  const unique = deduplicateFilms(collected);

  // ── 5. Take top 20, calculate match scores, tag relaxed ─────────────────
  const reason = buildMatchReason(answers);

  return unique.slice(0, 20).map((film) => ({
    ...film,
    vote_count: (film as TMDBMovie & { vote_count: number }).vote_count ?? 0,
    popularity: (film as TMDBMovie & { popularity: number }).popularity ?? 0,
    matchScore: calculateMatchScore(
      film as TMDBMovie & { popularity: number; vote_count: number },
      answers,
    ),
    matchReason: reason,
    relaxed,
  }));
}

/**
 * Fetches films using the modulo-cycling strategy, merging pages until
 * the target is met or all available pages are exhausted.
 * Returns the raw (non-deduped) film array and the updated call count.
 */
async function fetchCycledFilms(
  activeParams: Record<string, string | number | undefined>,
  requestedPage: number,
  totalAvailablePages: number,
  probePage1Results: TMDBMovie[],
  initialCalls: number,
  maxCalls: number,
): Promise<{ films: TMDBMovie[]; calls: number }> {
  let tmdbCalls = initialCalls;
  const TARGET = 20;

  const safeCeiling = Math.max(1, totalAvailablePages);
  const cyclePage = ((Math.max(1, Math.floor(requestedPage)) - 1) % safeCeiling) + 1;

  let allResults: TMDBMovie[] = [];

  if (cyclePage === 1) {
    allResults = [...probePage1Results];
  } else {
    const cycledResponse = await tmdbApi.discoverMovies({ ...activeParams, page: cyclePage });
    tmdbCalls++;
    const cycledResults: TMDBMovie[] = (cycledResponse.results as TMDBMovie[] | undefined) || [];
    allResults = [...cycledResults, ...probePage1Results];
  }

  // Fill from successive pages
  const pagesVisited = new Set<number>();
  pagesVisited.add(cyclePage);
  pagesVisited.add(1);

  let nextRawPage = cyclePage;
  while (deduplicateFilms(allResults).length < TARGET && tmdbCalls < maxCalls) {
    nextRawPage = (nextRawPage % safeCeiling) + 1;

    if (pagesVisited.has(nextRawPage)) break;
    pagesVisited.add(nextRawPage);

    if (nextRawPage === 1) {
      allResults = [...allResults, ...probePage1Results];
    } else {
      const fillResponse = await tmdbApi.discoverMovies({ ...activeParams, page: nextRawPage });
      tmdbCalls++;
      const fillResults: TMDBMovie[] = (fillResponse.results as TMDBMovie[] | undefined) || [];
      allResults = [...allResults, ...fillResults];
    }
  }

  return { films: allResults, calls: tmdbCalls };
}

/** Deduplicate an array of TMDB films by their id, preserving first-seen order. */
function deduplicateFilms(films: TMDBMovie[]): TMDBMovie[] {
  const seen = new Set<number>();
  return films.filter((film) => {
    if (seen.has(film.id)) return false;
    seen.add(film.id);
    return true;
  });
}

/** Shallow-compare two param records to detect if a relax step actually changed anything. */
function paramsEqual(
  a: Record<string, string | number | undefined>,
  b: Record<string, string | number | undefined>,
): boolean {
  const keysA = Object.keys(a).filter((k) => a[k] !== undefined);
  const keysB = Object.keys(b).filter((k) => b[k] !== undefined);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => a[k] === b[k]);
}
