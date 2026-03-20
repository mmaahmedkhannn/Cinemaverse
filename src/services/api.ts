import axios from 'axios';

// TMDB Client — supports both api_key param and Bearer token
export const tmdbClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    ...(import.meta.env.VITE_TMDB_API_KEY ? { api_key: import.meta.env.VITE_TMDB_API_KEY } : {}),
  },
  headers: {
    ...(import.meta.env.VITE_TMDB_READ_TOKEN
      ? { Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_TOKEN}` }
      : {}),
  },
});

// OMDB Client
export const omdbClient = axios.create({
  baseURL: 'https://www.omdbapi.com',
  params: {
    apikey: import.meta.env.VITE_OMDB_API_KEY,
  },
});

// Watchmode Client
export const watchmodeClient = axios.create({
  baseURL: 'https://api.watchmode.com/v1',
  params: {
    apiKey: import.meta.env.VITE_WATCHMODE_API_KEY,
  },
});
