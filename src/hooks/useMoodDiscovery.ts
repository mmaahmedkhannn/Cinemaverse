/**
 * useMoodDiscovery.ts
 *
 * TanStack React Query hook wrapping the mood engine. Only fires the TMDB
 * query when explicitly triggered via refetch() — keeps the single API call
 * deferred until all 4 quiz steps are completed.
 *
 * Accepts a page argument so "Want Different Picks?" can cycle through fresh
 * TMDB pages without resetting quiz answers. keepPreviousData keeps the
 * current results visible while the new page loads.
 */
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getMoodResults } from '../lib/moodEngine';
import type { QuizAnswers, MoodResult } from '../lib/moodEngine';

export function useMoodDiscovery(answers: QuizAnswers | null, page = 1) {
  return useQuery<MoodResult[]>({
    queryKey: ['mood-discovery', answers, page],
    queryFn: async () => {
      if (!answers) throw new Error('Quiz answers required');

      // 8-second fail-safe: reject if TMDB takes too long
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TMDB request timeout')), 8000)
      );

      return Promise.race([getMoodResults(answers, page), timeoutPromise]);
    },
    enabled: !!answers,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,         // 5 min — same answers+page return cached instantly
    gcTime: 30 * 60 * 1000,           // 30 min — keep in memory for re-quiz
    refetchOnWindowFocus: false,       // Don't refetch when user switches tabs
    refetchOnReconnect: false,         // Don't refetch on network reconnect
    retry: 1,                          // Retry once on failure, not 3 times
  });
}
