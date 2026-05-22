/**
 * StreamingService.tsx
 *
 * Dedicated page for /streaming/:slug — shows movies and TV shows available
 * on a given streaming service. Uses IP-based geolocation (ipapi.co) after
 * hydration to show region-specific availability. Falls back to US data.
 *
 * Prerendered HTML shell uses US data (Googlebot is US-based).
 * After hydration, getUserCountry() re-fetches with the user's actual region.
 */
import { useState, useMemo, Fragment } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, ChevronDown, Globe, Film, Tv } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { SERVICES_BY_SLUG, getServiceLogoUrl } from '../data/streamingServices';
import { getUserCountry } from '../lib/geolocation';
import SEO from '../components/SEO';
import { generateSlug } from '../utils/slugify';
import ImageWithSkeleton from '../components/ui/ImageWithSkeleton';
import { useQuery as useReactQuery } from '@tanstack/react-query';

type Tab = 'movies' | 'tv';

const StreamingService = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? SERVICES_BY_SLUG[slug] : null;

  const [activeTab, setActiveTab] = useState<Tab>('movies');

  // Detect user's country after hydration — cached in sessionStorage
  const { data: userCountry = 'US' } = useReactQuery({
    queryKey: ['userCountry'],
    queryFn: getUserCountry,
    staleTime: Infinity, // Only fetch once per session
    gcTime: Infinity,
  });

  // ── Movies infinite query ──
  const {
    data: moviesData,
    fetchNextPage: fetchMoreMovies,
    hasNextPage: hasMoreMovies,
    isFetchingNextPage: fetchingMoreMovies,
    isLoading: moviesLoading,
  } = useInfiniteQuery({
    queryKey: ['streamingMovies', service?.id, userCountry],
    queryFn: ({ pageParam = 1 }) =>
      tmdbApi.discoverMoviesByProvider(service!.id, userCountry, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: !!service,
  });

  // ── TV infinite query ──
  const {
    data: tvData,
    fetchNextPage: fetchMoreTv,
    hasNextPage: hasMoreTv,
    isFetchingNextPage: fetchingMoreTv,
    isLoading: tvLoading,
  } = useInfiniteQuery({
    queryKey: ['streamingTv', service?.id, userCountry],
    queryFn: ({ pageParam = 1 }) =>
      tmdbApi.discoverTvByProvider(service!.id, userCountry, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: !!service,
  });

  const movies = useMemo(() => {
    if (!moviesData?.pages) return [];
    const all = moviesData.pages.flatMap((p: any) => p?.results || []);
    const seen = new Set<number>();
    return all.filter((m: any) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [moviesData]);

  const tvShows = useMemo(() => {
    if (!tvData?.pages) return [];
    const all = tvData.pages.flatMap((p: any) => p?.results || []);
    const seen = new Set<number>();
    return all.filter((t: any) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }, [tvData]);

  // Invalid slug → 404 redirect to home
  if (!service) {
    return <Navigate to="/" replace />;
  }

  const logoUrl = getServiceLogoUrl(service.logoPath);
  const canonicalUrl = `https://cinemadiscovery.com/streaming/${service.slug}`;
  const pageTitle = `Best Movies and TV Shows on ${service.name} | CinemaDiscovery`;
  const pageDesc = service.metaDescription;

  const countryNames: Record<string, string> = {
    US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia',
    DE: 'Germany', FR: 'France', JP: 'Japan', IN: 'India', BR: 'Brazil',
    MX: 'Mexico', ES: 'Spain', IT: 'Italy', KR: 'South Korea', NL: 'Netherlands',
  };
  const regionName = countryNames[userCountry] || userCountry;

  return (
    <main className="min-h-screen bg-background-dark">
      <SEO
        title={pageTitle}
        description={pageDesc}
        url={canonicalUrl}
        image={logoUrl}
        type="website"
        schema={JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Best Movies and TV Shows on ${service.name}`,
          description: pageDesc,
          url: canonicalUrl,
          isPartOf: { '@type': 'WebSite', name: 'CinemaDiscovery', url: 'https://cinemadiscovery.com' },
        })}
      />

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a18] via-background-dark to-background-dark" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${service.color} 0%, transparent 70%)` }}
        />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8"
          >
            {/* Service logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex-shrink-0 bg-[#111]">
              <img src={logoUrl} alt={service.name} className="w-full h-full object-cover" />
            </div>

            <div className="text-center sm:text-left">
              <p className="text-xs font-sans text-gray-500 uppercase tracking-widest mb-1">Streaming on</p>
              <h1 className="font-bebas text-5xl md:text-6xl text-white tracking-wide mb-3">
                {service.name}
              </h1>

              {/* Region indicator */}
              <div className="inline-flex items-center gap-2 text-sm font-sans text-gray-400 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span>Showing availability in: <span className="text-white font-semibold">{regionName}</span></span>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit mb-8">
            {(['movies', 'tv'] as Tab[]).map((tab) => (
              <button
                key={tab}
                id={`streaming-tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-sans font-semibold text-sm transition-all duration-200 min-h-[44px] ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'movies' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                {tab === 'movies' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {activeTab === 'movies' ? (
          <>
            {moviesLoading && movies.length === 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-5">
                {Array(18).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : movies.length > 0 ? (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-5">
                  {movies.map((movie: any, i: number) => (
                    <Fragment key={`${movie.id}-${i}`}>
                      <Link to={`/movie/${movie.id}/${generateSlug(movie.title)}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.4) }}
                          className="group cursor-pointer"
                        >
                          <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                            {movie.poster_path ? (
                              <ImageWithSkeleton
                                src={getImageUrl(movie.poster_path, 'w500')}
                                alt={movie.title}
                                loading="lazy"
                                decoding="async"
                                containerClassName="w-full h-full"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-white/5 flex items-center justify-center p-3">
                                <span className="text-gray-500 text-xs text-center font-sans">{movie.title}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                              <span className="flex items-center gap-1 text-secondary font-sans text-xs font-bold mb-2">
                                <Star className="w-3 h-3 fill-secondary text-secondary" />
                                {movie.vote_average?.toFixed(1) ?? 'NR'}
                              </span>
                              <div className="w-full bg-primary text-white text-center font-bold py-1.5 rounded-md text-xs font-sans">
                                Details
                              </div>
                            </div>
                          </div>
                          <p className="text-xs font-sans text-gray-300 group-hover:text-white transition-colors line-clamp-1">
                            {movie.title}
                          </p>
                          <p className="text-xs font-sans text-gray-600">
                            {movie.release_date?.substring(0, 4)}
                          </p>
                        </motion.div>
                      </Link>
                    </Fragment>
                  ))}
                </div>
                {hasMoreMovies && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={() => fetchMoreMovies()}
                      disabled={fetchingMoreMovies}
                      className="flex items-center gap-2 px-8 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 rounded-full font-sans font-semibold text-white text-sm transition-all duration-300 disabled:opacity-50"
                    >
                      {fetchingMoreMovies ? (
                        <><span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />Loading...</>
                      ) : (
                        <>Load More <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 text-gray-500 font-sans">
                No movies found for {service.name} in your region.
              </div>
            )}
          </>
        ) : (
          <>
            {tvLoading && tvShows.length === 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-5">
                {Array(18).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : tvShows.length > 0 ? (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-5">
                  {tvShows.map((show: any, i: number) => (
                    <Fragment key={`${show.id}-${i}`}>
                      <Link to={`/tv/${show.id}/${generateSlug(show.name)}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.4) }}
                          className="group cursor-pointer"
                        >
                          <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                            {show.poster_path ? (
                              <ImageWithSkeleton
                                src={getImageUrl(show.poster_path, 'w500')}
                                alt={show.name}
                                loading="lazy"
                                decoding="async"
                                containerClassName="w-full h-full"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-white/5 flex items-center justify-center p-3">
                                <span className="text-gray-500 text-xs text-center font-sans">{show.name}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                              <span className="flex items-center gap-1 text-secondary font-sans text-xs font-bold mb-2">
                                <Star className="w-3 h-3 fill-secondary text-secondary" />
                                {show.vote_average?.toFixed(1) ?? 'NR'}
                              </span>
                              <div className="w-full bg-primary text-white text-center font-bold py-1.5 rounded-md text-xs font-sans">
                                Details
                              </div>
                            </div>
                          </div>
                          <p className="text-xs font-sans text-gray-300 group-hover:text-white transition-colors line-clamp-1">
                            {show.name}
                          </p>
                          <p className="text-xs font-sans text-gray-600">
                            {show.first_air_date?.substring(0, 4)}
                          </p>
                        </motion.div>
                      </Link>
                    </Fragment>
                  ))}
                </div>
                {hasMoreTv && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={() => fetchMoreTv()}
                      disabled={fetchingMoreTv}
                      className="flex items-center gap-2 px-8 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 rounded-full font-sans font-semibold text-white text-sm transition-all duration-300 disabled:opacity-50"
                    >
                      {fetchingMoreTv ? (
                        <><span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />Loading...</>
                      ) : (
                        <>Load More <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 text-gray-500 font-sans">
                No TV shows found for {service.name} in your region.
              </div>
            )}
          </>
        )}

        {/* ── SEO content block ── */}
        <div className="mt-20 pt-10 border-t border-white/5 max-w-3xl">
          <h2 className="font-bebas text-3xl text-white mb-4">
            Best Movies and TV Shows on {service.name}
          </h2>
          <p className="font-sans text-gray-400 leading-relaxed">
            {service.description}
          </p>
          <div className="flex gap-4 mt-6 flex-wrap">
            <Link
              to="/movies"
              className="text-sm font-sans font-semibold text-primary hover:text-red-400 transition-colors"
            >
              Browse All Movies →
            </Link>
            <Link
              to="/tv"
              className="text-sm font-sans font-semibold text-primary hover:text-red-400 transition-colors"
            >
              Browse All TV Shows →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default StreamingService;
