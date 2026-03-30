import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

interface OMDbRating {
  Source: string;
  Value: string;
}

const fetchRottenTomatoesScore = async (imdbId: string): Promise<number | null> => {
  if (!OMDB_API_KEY) return null;
  const { data } = await axios.get(`https://www.omdbapi.com/`, {
    params: { i: imdbId, apikey: OMDB_API_KEY },
  });
  if (data.Response === 'False') return null;
  const rt = data.Ratings?.find((r: OMDbRating) => r.Source === 'Rotten Tomatoes');
  if (!rt) return null;
  const score = parseInt(rt.Value, 10);
  return isNaN(score) ? null : score;
};

export const useRottenTomatoes = (imdbId: string | null | undefined) => {
  return useQuery<number | null>({
    queryKey: ['rt-score', imdbId],
    queryFn: () => fetchRottenTomatoesScore(imdbId!),
    enabled: !!imdbId && !!OMDB_API_KEY,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });
};
