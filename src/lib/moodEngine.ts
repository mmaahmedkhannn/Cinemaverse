/**
 * moodEngine.ts
 *
 * Core logic for the Mood Discovery Engine. Combines quiz answers (mood,
 * time, era) into TMDB Discover API parameters, fetches results,
 * and calculates a match percentage for each film.
 *
 * Results are sorted by rating (highest first) and reflect the honest
 * count of films TMDB returns for the chosen mood + time + era.
 * No auto-relaxing of filters; no padding to a fake count.
 */
import { MOODS } from '../data/moods';
import { tmdbApi } from '../services/tmdb';
import type { TMDBMovie } from '../services/tmdb';

export type TimeType = 'short' | 'medium' | 'long' | 'any';
export type EraType = 'latest' | '2010s' | '2000s' | 'classic' | 'any';

export interface QuizAnswers {
  moodId: string;
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
}

const ERA_MAP: Record<string, { gte?: string; lte?: string }> = {
  latest: { gte: '2023-01-01' },
  '2010s': { gte: '2010-01-01', lte: '2019-12-31' },
  '2000s': { gte: '2000-01-01', lte: '2009-12-31' },
  classic: { lte: '1999-12-31' },
};

/**
 * Builds TMDB Discover API parameters from the 3 quiz answers.
 *
 * Vote floor: 100 universally — blocks zero-vote junk while showing
 * every real film the mood+time+era combination matches.
 * Rating floor: removed — all ratings show; genre/keyword locks keep
 * results on-topic (horror stays horror, comedy stays comedy).
 * Sort: vote_average.desc — best-rated always surfaces first.
 */
export function buildMoodQuery(answers: QuizAnswers): Record<string, string | number> {
  const mood = MOODS.find((m) => m.id === answers.moodId);
  if (!mood) throw new Error(`Unknown mood: ${answers.moodId}`);

  const params: Record<string, string | number> = { ...mood.tmdbParams };

  // -- Time filter --
  if (answers.time === 'short') {
    params['with_runtime.lte'] = 90;
  } else if (answers.time === 'medium') {
    params['with_runtime.gte'] = 90;
    params['with_runtime.lte'] = 120;
  } else if (answers.time === 'long') {
    params['with_runtime.gte'] = 120;
    params['with_runtime.lte'] = 180;
  }

  // -- Era filter --
  if (answers.era !== 'any') {
    const era = ERA_MAP[answers.era];
    if (era) {
      if (era.gte) params['primary_release_date.gte'] = era.gte;
      if (era.lte) params['primary_release_date.lte'] = era.lte;
    }
  }

  // -- Performance defaults --
  params.language = 'en-US';
  params.include_adult = 'false';

  // -- Vote floor: 100 universally ------------------------------------------
  // Blocks films with 2 votes that would otherwise top a rating-sorted list,
  // while preserving every real film that matches the mood + time + era.
  params['vote_count.gte'] = 100;

  // -- Rating floor: removed ------------------------------------------------
  // Genres, keywords, and without_genres keep results on-topic.
  // Users see all matching films sorted best-rated first.
  delete (params as Record<string, unknown>)['vote_average.gte'];

  // -- Sort: best-rated first -----------------------------------------------
  params.sort_by = 'vote_average.desc';

  return params;
}

/**
 * Calculates a match percentage (70-99) based on how well the film
 * fits the user's combined criteria.
 */
function calculateMatchScore(
  film: TMDBMovie & { popularity: number; vote_count: number },
  answers: QuizAnswers,
): number {
  let score = 75; // Base score -- all results already match the core mood

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
  else if (answers.time === 'medium') parts.push('90-120 min runtime');
  else if (answers.time === 'long') parts.push('2-3 hour epic');

  if (answers.era === 'latest') parts.push('Recent release');
  else if (answers.era !== 'any') parts.push(`${answers.era} era`);

  return parts.join(' - ');
}

/**
 * Main entry point: fetches mood-based recommendations from TMDB.
 * Accepts an optional page number to enable fresh picks on the same quiz answers.
 *
 * Returns the real number of films TMDB finds -- no padding, no auto-relaxing.
 * Genres, keywords, and without_genres exclusions remain locked to the mood.
 *
 * Pagination strategy:
 *   1. Probe page 1 to learn total_pages -> compute a safe ceiling (max 5).
 *   2. Modulo-cycle the requested page into [1..ceiling] so deep pages never
 *      land on an empty TMDB page.
 *   3. If keywords produce < 5 results, retry without them (keyword fallback only).
 */
export async function getMoodResults(answers: QuizAnswers, page = 1): Promise<MoodResult[]> {
  const params = buildMoodQuery(answers);
  let activeParams: Record<string, string | number | undefined> = { ...params };

  // -- 1. Probe page 1 ------------------------------------------------------
  const probeResponse = await tmdbApi.discoverMovies({ ...activeParams, page: 1 });
  let probeResults: TMDBMovie[] = (probeResponse.results as TMDBMovie[] | undefined) || [];
  let probeTotalPages: number = typeof probeResponse.total_pages === 'number'
    ? probeResponse.total_pages
    : 1;

  // -- Keyword fallback: if keywords are too strict, retry without them ------
  if (probeResults.length < 5 && activeParams.with_keywords) {
    const fallbackParams = { ...activeParams };
    delete fallbackParams.with_keywords;
    activeParams = fallbackParams;

    const fallbackProbe = await tmdbApi.discoverMovies({ ...activeParams, page: 1 });
    probeResults = (fallbackProbe.results as TMDBMovie[] | undefined) || [];
    probeTotalPages = typeof fallbackProbe.total_pages === 'number'
      ? fallbackProbe.total_pages
      : 1;
  }

  // -- 2. Fetch the requested (cycled) page ---------------------------------
  const safeCeiling = Math.max(1, Math.min(probeTotalPages, 5));
  const cyclePage = ((Math.max(1, Math.floor(page)) - 1) % safeCeiling) + 1;

  let pageResults: TMDBMovie[];
  if (cyclePage === 1) {
    pageResults = probeResults;
  } else {
    const cycledResponse = await tmdbApi.discoverMovies({ ...activeParams, page: cyclePage });
    pageResults = (cycledResponse.results as TMDBMovie[] | undefined) || [];
  }

  // -- 3. Deduplicate and return honest count --------------------------------
  const unique = deduplicateFilms(pageResults);
  const reason = buildMatchReason(answers);

  return unique.map((film) => ({
    ...film,
    vote_count: (film as TMDBMovie & { vote_count: number }).vote_count ?? 0,
    popularity: (film as TMDBMovie & { popularity: number }).popularity ?? 0,
    matchScore: calculateMatchScore(
      film as TMDBMovie & { popularity: number; vote_count: number },
      answers,
    ),
    matchReason: reason,
  }));
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
