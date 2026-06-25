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
 * Applies fallback (removes keywords) if initial results are too few.
 */
export async function getMoodResults(answers: QuizAnswers): Promise<MoodResult[]> {
  const params = buildMoodQuery(answers);

  // First attempt with full params (including keywords)
  let response = await tmdbApi.discoverMovies({ ...params, page: 1 });
  let results: TMDBMovie[] = response.results || [];

  // Fallback: if keywords produced < 5 results, retry without them
  if (results.length < 5 && params.with_keywords) {
    const fallbackParams = { ...params };
    delete fallbackParams.with_keywords;
    response = await tmdbApi.discoverMovies({ ...fallbackParams, page: 1 });
    results = response.results || [];
  }

  // If still low, fetch page 2 and merge
  if (results.length < 20 && response.total_pages > 1) {
    const page2 = await tmdbApi.discoverMovies({ ...params, page: 2 });
    results = [...results, ...(page2.results || [])];
  }

  // Deduplicate by ID
  const seen = new Set<number>();
  const unique = results.filter((film) => {
    if (seen.has(film.id)) return false;
    seen.add(film.id);
    return true;
  });

  // Take top 20, calculate match scores
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
  }));
}
