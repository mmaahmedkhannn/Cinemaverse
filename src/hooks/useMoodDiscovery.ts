/**
 * useMoodDiscovery.ts
 *
 * Stateful accumulator hook for the Mood Discovery Engine.
 *
 * Each call to loadMore() fetches the next TMDB page and APPENDS the new
 * films to the existing list — the grid grows: 20 → 40 → 60…
 * Dedup by film id is enforced via a ref-backed Set so no poster ever
 * appears twice, even across TMDB pages that overlap.
 *
 * Keeps the 100-vote floor, rating-sort, genre/keyword/exclusion locks,
 * and 6-second timeout — all of which live in moodEngine.ts (untouched).
 * keepPreviousData is preserved so the grid never flashes during a fetch.
 *
 * Exposed API:
 *   films       — accumulated MoodResult[] (grows with each loadMore)
 *   isFetching  — true while a page request is in-flight
 *   isError     — true if the current page fetch failed
 *   hasMore     — false when no new unique results came back (end of catalogue)
 *   loadMore()  — trigger the next page fetch
 *   reset()     — clear accumulated films, page → 1, hasMore → true
 *   refetch()   — re-run the current page (used by error retry in Discover)
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getMoodResults } from '../lib/moodEngine';
import type { QuizAnswers, MoodResult } from '../lib/moodEngine';

export interface UseMoodDiscoveryReturn {
  films: MoodResult[];
  isFetching: boolean;
  isError: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  refetch: () => void;
}

export function useMoodDiscovery(answers: QuizAnswers | null): UseMoodDiscoveryReturn {
  const [page, setPage] = useState(1);
  const [films, setFilms] = useState<MoodResult[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Ref-backed id set — survives re-renders, used for O(1) dedup
  const seenIds = useRef<Set<number>>(new Set());

  const { data, isFetching, isError, refetch } = useQuery<MoodResult[]>({
    queryKey: ['mood-discovery', answers, page],
    queryFn: async () => {
      if (!answers) throw new Error('Quiz answers required');

      // 6-second fail-safe: reject if TMDB takes too long
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TMDB request timeout')), 6000),
      );

      return Promise.race([getMoodResults(answers, page), timeoutPromise]);
    },
    enabled: !!answers,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,      // 5 min — same answers+page returns cached instantly
    gcTime: 30 * 60 * 1000,        // 30 min — keep in memory for re-quiz
    refetchOnWindowFocus: false,    // Don't refetch when user switches tabs
    refetchOnReconnect: false,      // Don't refetch on network reconnect
    retry: 1,                       // Retry once on failure, not 3 times
  });

  // Append new results whenever a page's data arrives
  useEffect(() => {
    if (!data) return;

    const newFilms = data.filter((film) => !seenIds.current.has(film.id));
    if (newFilms.length === 0) {
      // This page added nothing new — catalogue exhausted
      setHasMore(false);
      return;
    }

    newFilms.forEach((film) => seenIds.current.add(film.id));
    setFilms((prev) => [...prev, ...newFilms]);
  }, [data]);

  /** Fetch and append the next TMDB page. */
  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  /** Fully reset: clear films, page back to 1, hasMore → true. */
  const reset = useCallback(() => {
    seenIds.current.clear();
    setFilms([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return {
    films,
    isFetching,
    isError,
    hasMore,
    loadMore,
    reset,
    refetch,
  };
}
