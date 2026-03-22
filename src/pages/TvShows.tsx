import { useState, useEffect, Fragment } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Search, Filter } from 'lucide-react';
import { tmdbApi, getImageUrl, type TMDBTvShow } from '../services/tmdb';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { generateSlug } from '../utils/slugify';

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, "All Time"];

// Required genres: Drama | Comedy | Thriller | Sci-Fi | Horror | Animation | Reality | Documentary | Crime
// Note: TMDB combines Sci-Fi & Fantasy (10765), Action & Adventure (10759).
const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popularity.desc' },
  { label: 'Highest Rated', value: 'vote_average.desc' },
  { label: 'First Air Date', value: 'first_air_date.desc' },
  { label: 'Most Watched', value: 'vote_count.desc' },
];

const TvShowCard = ({ show, genresMap, index }: { show: TMDBTvShow, genresMap: Record<number, string>, index: number }) => {
  
  // Get max 2 genres
  const showGenres = show.genre_ids?.slice(0, 2).map((id) => genresMap[id]).filter(Boolean) || [];

  return (
    <Link to={`/tv/${show.id}/${generateSlug(show.name)}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
        className="group cursor-pointer flex flex-col h-full"
      >
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/5 bg-[#111]">
          {show.poster_path ? (
            <img
              src={getImageUrl(show.poster_path, 'w500')}
              alt={show.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4 text-center">
              <span className="text-gray-500 font-bebas text-xl">{show.name}</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <span className="flex items-center gap-1.5 text-secondary font-sans text-sm font-bold bg-black/60 w-max px-2.5 py-1 rounded-md mb-2 backdrop-blur-md border border-secondary/30">
              <Star className="w-4 h-4 fill-secondary text-secondary" />
              {show.vote_average ? show.vote_average.toFixed(1) : 'NR'}
            </span>
            <div className="w-full bg-primary text-white text-center font-bold py-2 rounded-lg text-sm font-sans hover:bg-red-700 transition">
              View Episodes
            </div>
          </div>

        </div>
        
        <div className="flex-grow flex flex-col justify-start px-1">
          <h3 className="text-base font-sans font-bold text-gray-200 group-hover:text-primary transition-colors line-clamp-1">
            {show.name}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-sm font-sans text-gray-500 font-medium">
              {show.first_air_date ? show.first_air_date.substring(0, 4) : 'TBA'}
            </span>
            {showGenres.length > 0 && (
               <span className="text-xs font-sans text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 truncate max-w-[120px]">
                 {showGenres.join(', ')}
               </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const TvShows = () => {
  const [selectedYear, setSelectedYear] = useState<number | string>("All Time");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: genresList } = useQuery({
    queryKey: ['tvGenres'],
    queryFn: tmdbApi.getTvGenres,
  });

  // Map genre IDs to names for the cards
  const genresMap = (genresList || []).reduce((acc: any, genre: any) => {
    acc[genre.id] = genre.name;
    return acc;
  }, {});

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['tvShows', selectedYear, selectedGenre, sortBy, debouncedQuery],
    queryFn: ({ pageParam = 1 }) => tmdbApi.discoverTvShows({
      page: pageParam,
      ...(selectedGenre && !debouncedQuery ? { with_genres: selectedGenre.toString() } : {}),
      ...(selectedYear !== "All Time" && !debouncedQuery ? { first_air_date_year: Number(selectedYear) } : {}),
      ...(!debouncedQuery ? { sort_by: sortBy } : {}),
      ...(debouncedQuery ? { query: debouncedQuery } : {}),
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 500;
      if (bottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten infinite query results
  const shows: TMDBTvShow[] = data?.pages?.flatMap(page => page?.results || []) || [];

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto min-h-screen">
      <Helmet>
        <title>TV Shows Directory — CinemaDiscovery</title>
        <meta name="description" content="Binge-worthy series from every network. Filter by year and genre to discover your next obsession." />
        <link rel="canonical" href="https://cinemadiscovery.com/tv" />
      </Helmet>
      
      {/* ── Title & Search ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-bebas text-5xl md:text-6xl text-white mb-2 tracking-wide">
            {debouncedQuery ? `Search Results for "${debouncedQuery}"` : 'TV Shows Directory'}
          </h1>
          <p className="text-gray-400 font-sans max-w-2xl">
            Binge-worthy series from every network. Filter by year and genre to discover your next obsession.
          </p>
        </div>
        
        <div className="relative w-full md:w-80 flex-shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search TV shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080810]/80 border border-white/20 rounded-full py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all font-sans"
          />
        </div>
      </div>

      {/* ── Filter Controls ── */}
      {!debouncedQuery && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 mb-10 flex flex-col md:flex-row gap-6">
          
          {/* Year Tabs */}
          <div className="flex-grow">
            <h3 className="text-xs font-sans text-gray-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
               Select Year
            </h3>
            <div className="flex flex-wrap gap-2">
              {YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-full font-sans text-sm font-semibold transition-all duration-300 ${
                    selectedYear === year 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 border border-primary' 
                      : 'bg-transparent text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px md:h-auto w-full md:w-px bg-white/10 hidden md:block"></div>

          {/* Dropsdowns: Genre & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <div>
               <h3 className="text-xs font-sans text-gray-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                 <Filter className="w-3 h-3" /> Genre
              </h3>
              <select
                className="w-full sm:w-48 bg-[#0a0a0f] border border-white/20 rounded-xl py-2.5 px-4 text-sm font-sans text-gray-200 focus:outline-none focus:border-secondary appearance-none cursor-pointer"
                value={selectedGenre || ''}
                onChange={(e) => setSelectedGenre(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">All Genres</option>
                {/* Dynamically inject user-requested core genres or just map map all available */}
                {genresList?.map((genre: any) => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>

            <div>
               <h3 className="text-xs font-sans text-gray-500 uppercase tracking-wider font-bold mb-3">
                 Sort By
              </h3>
              <select
                className="w-full sm:w-48 bg-[#0a0a0f] border border-white/20 rounded-xl py-2.5 px-4 text-sm font-sans text-gray-200 focus:outline-none focus:border-secondary appearance-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Movie Grid ── */}
      {isLoading && shows.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array(24).fill(0).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-lg border border-white/5" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-red-400">Error loading TV shows. Please try again.</div>
      ) : shows.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {shows.map((show, i) => (
              <Fragment key={`${show.id}-${i}`}>
                <TvShowCard show={show} genresMap={genresMap} index={i} />
              </Fragment>
            ))}
          </div>
          
          {/* Loading More Indicator */}
          {isFetchingNextPage && (
            <div className="flex justify-center mt-12 py-8">
              <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {!hasNextPage && shows.length > 0 && (
            <div className="text-center mt-12 py-8 text-gray-500 font-sans border-t border-white/5">
              You've reached the end of the archive.
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-2xl border border-white/10 mt-8">
          <p className="text-gray-300 font-bebas text-3xl mb-3 mt-4">No Matches Found</p>
          <p className="text-gray-500 font-sans max-w-md">Try expanding your Year or Genre criteria to discover more shows in our database.</p>
        </div>
      )}
    </div>
  );
};

export default TvShows;
