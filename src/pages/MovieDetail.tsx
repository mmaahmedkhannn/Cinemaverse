import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play, Clock, Calendar, ArrowLeft, Plus, Check, X } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { useAuth } from '../contexts/AuthContext';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../lib/firestore';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import CVScore from '../components/ui/CVScore';

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => tmdbApi.getMovieDetails(Number(id)),
    enabled: !!id,
  });

  const { currentUser } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTrailerModal(false);
      }
    };
    if (showTrailerModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showTrailerModal]);

  useEffect(() => {
    const checkWatchlist = async () => {
      if (currentUser && movie) {
        const list = await getWatchlist(currentUser.uid);
        setInWatchlist(list.some(item => item.movieId === movie.id));
      } else {
        setInWatchlist(false);
      }
    };
    checkWatchlist();
  }, [currentUser, movie]);

  const toggleWatchlist = async () => {
    if (!currentUser) {
      alert("Please sign in to add movies to your watchlist.");
      return;
    }
    if (!movie) return;

    setIsUpdating(true);
    try {
      if (inWatchlist) {
        await removeFromWatchlist(currentUser.uid, movie.id);
        setInWatchlist(false);
      } else {
        await addToWatchlist(currentUser.uid, {
          movieId: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          addedAt: Date.now(),
          mediaType: 'movie'
        });
        setInWatchlist(true);
      }
    } catch (err) {
      console.error("Error updating watchlist", err);
      alert("Failed to update watchlist.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bebas text-white mb-4">Movie Not Found</h2>
        <p className="text-gray-400 mb-8">We couldn't load the details for this movie.</p>
        <Link to="/" className="text-primary hover:text-white transition-colors">Return Home</Link>
      </div>
    );
  }

  // Find trailer
  const trailer = movie.videos?.results?.find(
    (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  // 1. TMDB API CALL DEBUGGING
  console.log("--- TMDB API CALL LOGS ---");
  console.log("Raw videos response:", movie.videos?.results);
  console.log("EXACT YOUTUBE KEY from TMDB:", trailer?.key);
  
  const iframeKey = trailer?.key;

  const cast = movie.credits?.cast?.slice(0, 8) || [];
  const recommendations = movie.recommendations?.results?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background-dark pb-20">
      <Helmet>
        <title>{movie.title} — CinemaDiscovery</title>
        <meta name="description" content={movie.overview?.substring(0, 160) || "View movie details on CinemaDiscovery."} />
        <meta property="og:title" content={`${movie.title} — CinemaDiscovery`} />
        <meta property="og:description" content={movie.overview?.substring(0, 160) || "View movie details on CinemaDiscovery."} />
        <meta property="og:image" content={getImageUrl(movie.poster_path, 'original')} />
        <meta property="og:url" content={`https://cinemadiscovery.com/movie/${movie.id}`} />
        <meta property="og:type" content="video.movie" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`https://cinemadiscovery.com/movie/${movie.id}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": movie.title,
            "image": getImageUrl(movie.poster_path, 'original'),
            "description": movie.overview,
            "datePublished": movie.release_date,
            "director": {
              "@type": "Person",
              "name": movie.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown'
            },
            "aggregateRating": movie.vote_count > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": movie.vote_average,
              "ratingCount": movie.vote_count,
              "bestRating": "10",
              "worstRating": "1"
            } : undefined
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://cinemadiscovery.com" },
              { "@type": "ListItem", "position": 2, "name": "Movies", "item": "https://cinemadiscovery.com/movies" },
              { "@type": "ListItem", "position": 3, "name": movie.title, "item": `https://cinemadiscovery.com/movie/${movie.id}` }
            ]
          })}
        </script>
      </Helmet>

      {/* ── Hero Backdrop ── */}
      <div className="relative h-[60vh] md:h-[75vh] w-full">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/50 to-transparent" />

        <div className="absolute top-24 left-6 md:left-16 z-20">
          <Link to={-1 as any} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-[30vh] md:-mt-[40vh]">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          
          {/* Poster */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 w-64 md:w-80 mx-auto md:mx-0"
          >
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/5 bg-gray-900">
              {movie.poster_path ? (
                <img
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            
            <div className="flex flex-col gap-3 mt-6">
              {trailer && (
                <button 
                  onClick={() => setShowTrailerModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-red-700 text-white font-sans font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/30 transition-all duration-300"
                >
                  <Play className="w-5 h-5 fill-white" /> Watch Trailer
                </button>
              )}
              
              <button 
                onClick={toggleWatchlist}
                disabled={isUpdating}
                className={`w-full flex items-center justify-center gap-2 font-sans font-bold py-4 rounded-xl shadow-lg transition-all duration-300 ${
                  inWatchlist 
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                    : 'bg-white text-black hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-5 h-5" /> In Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" /> Add to Watchlist
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-grow pt-4 md:pt-12 text-center md:text-left"
          >
            {movie.tagline && (
              <p className="text-secondary font-playfair italic text-lg mb-2 tracking-wide uppercase">
                "{movie.tagline}"
              </p>
            )}
            <h1 className="font-bebas text-5xl md:text-7xl text-white mb-4 leading-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-8">
              <CVScore
                voteAverage={movie.vote_average || 0}
                voteCount={movie.vote_count || 0}
                popularity={movie.popularity || 0}
              />
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1 text-gray-300">
                  <Clock className="w-4 h-4" /> {movie.runtime} min
                </span>
                <span className="flex items-center gap-1 text-gray-300">
                  <Calendar className="w-4 h-4" /> {movie.release_date?.substring(0, 4)}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {movie.genres?.map((g: any) => (
                    <span key={g.id} className="text-xs border border-gray-600 text-gray-300 px-2 py-1 rounded-full">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bebas text-gray-400 mb-3">Overview</h3>
              <p className="text-gray-200 text-lg leading-relaxed font-sans max-w-3xl">
                {movie.overview}
              </p>
            </div>



            {/* Top Cast */}
            {cast.length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl font-bebas text-white mb-6">Top Cast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {cast.map((actor: any) => (
                    <div key={actor.id} className="flex flex-col items-center md:items-start text-center md:text-left">
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-3 bg-gray-800 border border-white/10 shadow-lg">
                        {actor.profile_path ? (
                          <img
                            src={getImageUrl(actor.profile_path, 'w500')}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xl">
                            {actor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-white text-sm">{actor.name}</h4>
                      <p className="text-xs text-gray-500">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Recommendations ── */}
      {recommendations.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <h3 className="text-3xl font-bebas text-white mb-8 border-l-4 border-primary pl-4">Similar Movies</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {recommendations.map((rec: any, i: number) => (
              <Link to={`/movie/${rec.id}`} key={rec.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group cursor-pointer flex flex-col h-full"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 shadow-lg">
                    {rec.poster_path ? (
                      <img
                        src={getImageUrl(rec.poster_path, 'w500')}
                        alt={rec.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center p-3 text-center">
                        <span className="text-gray-400 text-xs font-sans">{rec.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="flex items-center gap-1 text-secondary font-sans text-sm font-semibold">
                        <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                        {rec.vote_average ? rec.vote_average.toFixed(1) : 'NR'}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-sm font-sans font-semibold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                    {rec.title}
                  </h4>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Trailer Modal ── */}
      <AnimatePresence>
        {showTrailerModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4 md:p-8"
            onClick={() => setShowTrailerModal(false)}
          >
            <div 
              className="relative w-full max-w-[900px] aspect-video"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowTrailerModal(false)}
                className="absolute -top-12 right-0 md:-right-12 xl:-right-16 z-[110] text-red-500 hover:text-red-400 transition-colors drop-shadow-[0_0_12px_rgba(239,68,68,1)]"
              >
                <X className="w-10 h-10 md:w-12 md:h-12" />
              </button>
              
              <iframe 
                src={`https://www.youtube.com/embed/${iframeKey}?autoplay=1`}
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen={true}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Trailer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieDetail;
