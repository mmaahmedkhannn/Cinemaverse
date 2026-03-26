import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Star, Film, Award, TrendingUp, Camera } from 'lucide-react';
import { tmdbApi, getImageUrl, type TMDBPerson } from '../services/tmdb';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { generateSlug } from '../utils/slugify';
import { useInView } from 'react-intersection-observer';

const Directors = () => {
  const { ref, inView } = useInView({ rootMargin: '400px' });

  // Fetch infinite distinct directors
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['directors-popular'],
    queryFn: ({ pageParam = 1 }) => tmdbApi.getPopularDirectors(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length < lastPage.total_pages) return allPages.length + 1;
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const directors: TMDBPerson[] = data?.pages?.flatMap(page => page?.results || []) || [];
  
  // Sort all directors by popularity descending
  const sortedDirectors = [...directors].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  // "Director of the Month" — pick highest popularity
  const directorOfMonth = sortedDirectors.length > 0 ? sortedDirectors[0] : null;

  return (
    <main className="min-h-screen bg-background-dark pt-24 pb-20 relative overflow-hidden">
      <Helmet>
        <title>Legendary Directors & Cinematic Visionaries | CinemaDiscovery</title>
        <meta name="description" content="Explore the universes built by the world's most renowned film directors and visionaries." />
        <link rel="canonical" href="https://cinemadiscovery.com/directors" />
        <meta property="og:title" content="Legendary Directors & Cinematic Visionaries | CinemaDiscovery" />
        <meta property="og:description" content="Explore the universes built by the world's most renowned film directors and visionaries." />
        <meta property="og:url" content="https://cinemadiscovery.com/directors" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-bebas text-6xl md:text-8xl text-white tracking-wider mb-4">
            Director <span className="text-primary">Universe</span>
          </h1>
          <p className="text-gray-400 text-lg font-sans max-w-2xl mx-auto">
            Explore the vast array of visionaries who breathed life into cinema. 
            Scroll infinitely to discover their greatest works and popularity around the globe!
          </p>
        </motion.div>

        {/* Director of the Month */}
        {directorOfMonth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-14 bg-gradient-to-r from-yellow-900/40 via-amber-900/10 to-transparent border border-yellow-500/30 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -m-16 opacity-10 blur-3xl rounded-full bg-yellow-400 w-96 h-96 pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bebas tracking-wider text-xl">DIRECTOR SPOTLIGHT</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="flex-shrink-0 w-32 md:w-48 h-32 md:h-48 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 relative z-10 z-20">
                {directorOfMonth.profile_path ? (
                  <img src={getImageUrl(directorOfMonth.profile_path, 'w500')} alt={directorOfMonth.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500"><Camera className="w-8 h-8" /></div>
                )}
              </div>
              <div className="text-center md:text-left flex-grow">
                <Link to={`/director/${directorOfMonth.id}/${generateSlug(directorOfMonth.name)}`} className="font-bebas text-4xl md:text-6xl text-white hover:text-primary transition-colors hover:drop-shadow-[0_0_10px_rgba(229,9,20,0.5)]">
                  {directorOfMonth.name}
                </Link>
                <div className="flex flex-wrap gap-2 mt-5 justify-center md:justify-start">
                  {directorOfMonth.known_for?.slice(0, 4).map((media: any) => (
                    <span key={media.id} className="text-xs bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/30 flex items-center gap-1.5 font-bold shadow-lg">
                      <Film className="w-3.5 h-3.5" /> {media.title || media.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center px-4 md:border-l border-white/10">
                <p className="text-6xl font-bebas text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">{Math.round(directorOfMonth.popularity)}</p>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Global Pop</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Infinite Directors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {sortedDirectors.slice(1).map((director, i) => ( // Skip the 1st since they are Spotlight
            <motion.div
              key={`${director.id}-${i}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Link to={`/director/${director.id}/${generateSlug(director.name)}`}>
                <div className="bg-black/40 border border-white/10 rounded-3xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_rgba(229,9,20,0.2)] transition-all duration-300 group h-full flex flex-col relative backdrop-blur-md">
                  
                  {/* Director Photo + Backdrop Header */}
                  <div className="relative h-44 bg-gradient-to-br from-gray-900 to-black border-b border-white/5 overflow-hidden">
                    {director.known_for?.[0]?.backdrop_path && (
                      <img
                        src={getImageUrl(director.known_for[0].backdrop_path, 'w500')}
                        alt={director.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-700 scale-105 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
                    
                    <div className="absolute inset-x-0 bottom-0 p-5 flex items-end gap-4 translate-y-3">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 shadow-lg shadow-black/50 mb-3 bg-gray-900 group-hover:border-primary transition-colors flex-shrink-0">
                        {director.profile_path ? (
                          <img src={getImageUrl(director.profile_path, 'w500')} alt={director.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500"><Camera className="w-6 h-6" /></div>
                        )}
                      </div>
                      <div className="pb-3">
                        <h3 className="font-bebas text-2xl md:text-3xl text-white group-hover:text-primary transition-colors leading-none drop-shadow-xl">{director.name}</h3>
                        <p className="text-[11px] text-gray-400 font-sans mt-1.5 flex items-center gap-1 font-semibold uppercase tracking-wider">
                          <TrendingUp className="w-3 h-3 text-secondary" /> Pop: {Math.round(director.popularity)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-7 flex-1 flex flex-col justify-end">
                    <p className="text-[10px] text-gray-500 font-sans mb-3 uppercase tracking-widest font-bold">Known For</p>
                    <div className="flex gap-2 mb-1">
                      {director.known_for?.slice(0, 3).map((media: any) => (
                         <div key={media.id} className="flex-1 aspect-[2/3] rounded-lg bg-white/5 overflow-hidden border border-white/10 relative group/poster shadow-lg">
                            {media.poster_path ? (
                               <img src={getImageUrl(media.poster_path, 'w500')} alt="" className="w-full h-full object-cover opacity-70 group-hover/poster:opacity-100 transition-opacity duration-300" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-600"><Film className="w-4 h-4" /></div>
                            )}
                            {media.vote_average > 0 && (
                              <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm rounded px-1.5 py-0.5 border border-white/10 flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-[10px] text-white font-bold">{media.vote_average.toFixed(1)}</span>
                              </div>
                            )}
                         </div>
                      ))}
                      {/* Empty slot fallbacks if they have less than 3 known files */}
                      {Array.from({ length: 3 - Math.min((director.known_for?.length || 0), 3) }).map((_, i) => (
                         <div key={`empty-${i}`} className="flex-1 aspect-[2/3] rounded-lg bg-white/5 border border-white/5 opacity-30" />
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* Loading Skeletons */}
        {(isLoading || isFetchingNextPage) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 mt-7">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-72 bg-white/5 animate-pulse rounded-3xl border border-white/10" />
            ))}
          </div>
        )}

        {/* Intersection Observer target block */}
        <div ref={ref} className="h-32 mt-10 w-full flex items-center justify-center">
             {hasNextPage === false && (
                <p className="text-gray-500 font-sans text-sm">You have reached the end of the universe.</p>
             )}
        </div>

      </div>
    </main>
  );
};

export default Directors;
