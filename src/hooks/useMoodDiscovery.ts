/**
 * useMoodDiscovery.ts
 *
 * TanStack React Query hook wrapping the mood engine. Only fires the TMDB
 * query when explicitly triggered via refetch() — keeps the single API call
 * deferred until all 4 quiz steps are completed.
 */
import { useQuery } from '@tanstack/react-query';
import { getMoodResults } from '../lib/moodEngine';
import type { QuizAnswers, MoodResult } from '../lib/moodEngine';

export function useMoodDiscovery(answers: QuizAnswers | null) {
  console.log('useMoodDiscovery hook called with:', answers);
  return useQuery<MoodResult[]>({
    queryKey: ['mood-discovery', answers],
    queryFn: () => {
      if (!answers) throw new Error('Quiz answers required');
      return getMoodResults(answers);
    },
    enabled: !!answers, // Auto-fires when all 4 answers exist
    staleTime: 1000 * 60 * 10, // 10 minutes — cache within session
    retry: 1,
  });
}
