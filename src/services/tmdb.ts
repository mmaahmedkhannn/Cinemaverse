import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_READ_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

// Create axios instance
export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${TMDB_READ_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Image helper function
export const getImageUrl = (path: string | null, size: 'w500' | 'original' | 'w1280' = 'w500') => {
  if (!path) return ''; // We can handle fallback in the UI
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Types
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBTvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for: (TMDBMovie | TMDBTvShow)[];
}

// Collections (Universes)
export const COLLECTIONS = {
  MCU: 86311,
  DC_EXTENDED: 529892,
  STAR_WARS: 10,
};

// API Services
export const tmdbApi = {
  // Movies
  getTrendingMovies: async (timeWindow: 'day' | 'week' = 'week'): Promise<TMDBMovie[]> => {
    const response = await tmdbClient.get(`/trending/movie/${timeWindow}`);
    return response.data.results;
  },
  
  getNowPlayingMovies: async (): Promise<TMDBMovie[]> => {
    const response = await tmdbClient.get('/movie/now_playing');
    return response.data.results;
  },

  getPopularMovies: async (): Promise<TMDBMovie[]> => {
    const response = await tmdbClient.get('/movie/popular');
    return response.data.results;
  },

  getMovieGenres: async (): Promise<TMDBGenre[]> => {
    const response = await tmdbClient.get('/genre/movie/list');
    return response.data.genres;
  },

  discoverMovies: async (params?: { 
    with_genres?: string; 
    page?: number; 
    sort_by?: string; 
    query?: string;
    primary_release_year?: number;
    'vote_count.gte'?: number;
    'vote_count.lte'?: number;
  }) => {
    // If query exists, use search endpoint instead of discover
    if (params?.query) {
      const response = await tmdbClient.get('/search/movie', {
        params: { query: params.query, page: params.page || 1 }
      });
      return response.data;
    }
    const response = await tmdbClient.get('/discover/movie', { params });
    return response.data;
  },

  getMovieDetails: async (id: number) => {
    const response = await tmdbClient.get(`/movie/${id}`, {
      params: { append_to_response: 'credits,videos,recommendations,watch/providers' }
    });
    return response.data;
  },

  searchMulti: async (query: string) => {
    const response = await tmdbClient.get('/search/multi', {
      params: { query }
    });
    return response.data.results;
  },

  // TV Shows
  getTrendingTv: async (timeWindow: 'day' | 'week' = 'week'): Promise<TMDBTvShow[]> => {
    const response = await tmdbClient.get(`/trending/tv/${timeWindow}`);
    return response.data.results;
  },

  getPopularTvShows: async (): Promise<TMDBTvShow[]> => {
    const response = await tmdbClient.get('/tv/popular');
    return response.data.results;
  },

  getTvDetails: async (id: number) => {
    const response = await tmdbClient.get(`/tv/${id}`, {
      params: { append_to_response: 'credits,videos,recommendations' }
    });
    return response.data;
  },

  getTvGenres: async (): Promise<TMDBGenre[]> => {
    const response = await tmdbClient.get('/genre/tv/list');
    return response.data.genres;
  },

  discoverTvShows: async (params?: { with_genres?: string; page?: number; sort_by?: string; query?: string; first_air_date_year?: number }) => {
    // If query exists, use search endpoint instead of discover
    if (params?.query) {
      const response = await tmdbClient.get('/search/tv', {
        params: { query: params.query, page: params.page || 1 }
      });
      return response.data;
    }
    const response = await tmdbClient.get('/discover/tv', { params });
    return response.data;
  },

  // Collections (Franchises)
  getCollection: async (collectionId: number) => {
    const response = await tmdbClient.get(`/collection/${collectionId}`);
    return response.data;
  },

  // Person / Directors
  getPopularDirectors: async (page: number = 1): Promise<{ results: TMDBPerson[], total_pages: number }> => {
    // Fetch 3 pages at once since /person/popular has mixed departments
    const pagesToFetch = [page * 3 - 2, page * 3 - 1, page * 3];
    const responses = await Promise.all(
      pagesToFetch.map(p => tmdbClient.get('/person/popular', { params: { page: p } }).catch(() => null))
    );
    
    let allResults: any[] = [];
    let totalPages = 500; // API max is usually 500
    
    responses.forEach(r => {
      if (r?.data?.results) {
        allResults = [...allResults, ...r.data.results];
        if (r.data.total_pages) {
          totalPages = Math.min(totalPages, Math.floor(r.data.total_pages / 3));
        }
      }
    });

    const directors = allResults.filter(p => p.known_for_department === 'Directing');
    
    return {
      results: directors,
      total_pages: totalPages
    };
  },

  getPersonDetails: async (id: number) => {
    const response = await tmdbClient.get(`/person/${id}`, {
      params: { append_to_response: 'movie_credits,images' }
    });
    return response.data;
  },

  getPersonMovieCredits: async (id: number) => {
    const response = await tmdbClient.get(`/person/${id}/movie_credits`);
    return response.data;
  },

  // Top rated by year (for Timeline)
  getTopMoviesByYear: async (year: number, page: number = 1) => {
    const response = await tmdbClient.get('/discover/movie', {
      params: {
        primary_release_year: year,
        sort_by: 'vote_count.desc',
        'vote_count.gte': 50,
        page,
      }
    });
    return response.data;
  },

  // Top rated movies (for Top 100)
  getTopRatedMovies: async (page: number = 1) => {
    const response = await tmdbClient.get('/movie/top_rated', { params: { page } });
    return response.data;
  },
};
