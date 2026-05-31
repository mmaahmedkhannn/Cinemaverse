/**
 * TvShowDetail.tsx
 *
 * Full detail page for an individual TV show. Mirrors MovieDetail.tsx structure but
 * adapts fields for TV-specific data (seasons, first air date, episode count).
 * Includes streaming provider links, Amazon affiliate CTA, and watchlist integration.
 *
 * Route: /tv/:id
 * Key dependencies: @tanstack/react-query, framer-motion, TMDB API, Firebase Auth
 */
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import TrailerModal from '../components/ui/TrailerModal';
import { Star, Play, Calendar, ArrowLeft, Plus, Check } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { useAuth } from '../contexts/AuthContext';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../lib/firestore';
import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import CVScore from '../components/ui/CVScore';
import { useRottenTomatoes } from '../hooks/useRottenTomatoes';
import RottenTomatoScore from '../components/ui/RottenTomatoScore';
import { AuthModal } from '../components/ui/AuthModal';
import { AmazonAffiliateButton } from '../components/ui/AmazonAffiliateButton';

const TvShowDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: tv, isLoading, error } = useQuery({
    queryKey: ['tv', id],
    queryFn: () => tmdbApi.getTvDetails(Number(id)),
    enabled: !!id,
  });

  // Fetch IMDb ID via TMDB external_ids, then RT score
  const { data: tvExternalIds } = useQuery({
    queryKey: ['tv-external-ids', id],
    queryFn: () => tmdbApi.getTvExternalIds(Number(id)),
    enabled: !!id,
  });
  const { data: rtScore } = useRottenTomatoes(tvExternalIds?.imdb_id);

  const { currentUser } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Keyboard + scroll-lock are managed inside <TrailerModal> when it mounts.

  useEffect(() => {
    const checkWatchlist = async () => {
      if (currentUser && tv) {
        const list = await getWatchlist(currentUser.uid);
        setInWatchlist(list.some(item => item.movieId === tv.id));
      } else {
        setInWatchlist(false);
      }
    };
    checkWatchlist();
  }, [currentUser, tv]);

  const toggleWatchlist = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!tv) return;

    setIsUpdating(true);
    try {
      if (inWatchlist) {
        await removeFromWatchlist(currentUser.uid, tv.id);
        setInWatchlist(false);
      } else {
        await addToWatchlist(currentUser.uid, {
          movieId: tv.id,
          title: tv.name,
          poster_path: tv.poster_path,
          addedAt: Date.now(),
          mediaType: 'tv'
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

  if (error || !tv) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bebas text-white mb-4">Show Not Found</h2>
        <p className="text-gray-400 mb-8">We couldn't load the details for this show.</p>
        <Link to="/tv" className="text-primary hover:text-white transition-colors">Return to TV Shows</Link>
      </div>
    );
  }

  // Find trailer
  const trailer = tv.videos?.results?.find(
    (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  const iframeKey = trailer?.key;

  const cast = tv.credits?.cast?.slice(0, 8) || [];
  const recommendations = tv.recommendations?.results?.slice(0, 6) || [];

  // Extract watch providers from TMDB's JustWatch-sourced data.
  // Deduplicate across flatrate/rent/buy groups using a Map (see MovieDetail.tsx for detail).
  const providersData = tv['watch/providers']?.results?.US;
  const affiliateTag = "cinemadiscove-20";
  const uniqueProviders = new Map();
  
  if (providersData) {
    ['flatrate', 'rent', 'buy'].forEach(type => {
      if (providersData[type]) {
        providersData[type].forEach((p: any) => {
           if (!uniqueProviders.has(p.provider_name)) {
             uniqueProviders.set(p.provider_name, p);
           }
        });
      }
    });
  }
  const streamProviders = Array.from(uniqueProviders.values()).slice(0, 5);

  // Override Amazon links with affiliate-tagged URLs (same strategy as MovieDetail.tsx).
  const getProviderLink = (providerName: string, defaultLink: string) => {
    if (providerName.toLowerCase().includes('amazon')) {
      return `https://www.amazon.com/s?k=${encodeURIComponent(tv.name + ' tv show')}&i=instant-video&tag=${affiliateTag}`;
    }
    return defaultLink;
  };

  return (
    <div className="min-h-screen bg-background-dark pb-20">
      <SEO
        title={`${tv.name} | CinemaDiscovery`}
        description={tv.overview?.substring(0, 160) || "View TV show details on CinemaDiscovery."}
        image={getImageUrl(tv.poster_path, 'w500')}
        url={`https://cinemadiscovery.com/tv/${tv.id}`}
        type="video.tv_show"
        schema={JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "TVSeries",
            "name": tv.name,
            "image": getImageUrl(tv.poster_path, 'w500'),
            "description": tv.overview,
            "startDate": tv.first_air_date,
            "aggregateRating": tv.vote_count > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": tv.vote_average,
              "ratingCount": tv.vote_count,
              "bestRating": "10",
              "worstRating": "1"
            } : undefined
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://cinemadiscovery.com" },
              { "@type": "ListItem", "position": 2, "name": "TV Shows", "item": "https://cinemadiscovery.com/tv" },
              { "@type": "ListItem", "position": 3, "name": tv.name, "item": `https://cinemadiscovery.com/tv/${tv.id}` }
            ]
          }
        ])}
      />

      <div className="relative min-h-[60dvh] md:min-h-[100dvh] w-full">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(tv.backdrop_path, 'w1280')}
            alt={tv.name}
            className="w-full h-full object-cover"
            fetchPriority="high"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/50 to-transparent" />

        <div className="absolute top-16 md:top-24 left-6 md:left-16 z-20">
          <Link to={-1 as any} className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors bg-black/40 px-4 min-h-[44px] rounded-full backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-[30vh] md:-mt-[40vh]">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 w-64 md:w-80 mx-auto md:mx-0"
          >
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/5 bg-gray-900">
              {tv.poster_path ? (
                <img
                  src={getImageUrl(tv.poster_path, 'w500')}
                  alt={tv.name}
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
            {tv.tagline && (
              <p className="text-secondary font-playfair italic text-lg mb-2 tracking-wide uppercase">
                "{tv.tagline}"
              </p>
            )}
            <h1 className="font-bebas text-5xl md:text-7xl text-white mb-4 leading-tight">
              {tv.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-8">
              <CVScore
                voteAverage={tv.vote_average || 0}
                voteCount={tv.vote_count || 0}
                popularity={tv.popularity || 0}
              />
              <RottenTomatoScore score={rtScore} size="lg" />
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-300">
                  <Calendar className="w-4 h-4" /> {tv.first_air_date?.substring(0, 4)}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {tv.genres?.map((g: any) => (
                    <span key={g.id} className="text-xs border border-gray-600 text-gray-300 px-2 py-1 rounded-full">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Where to Watch (JustWatch + Amazon Affiliate) */}
            <div className="mb-8">
              <h3 className="text-sm font-sans text-gray-400 mb-3 uppercase tracking-wider font-bold">Where to Watch</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center md:justify-start">
                {streamProviders.length > 0 && streamProviders.map((p: any) => (
                  <a 
                    key={p.provider_id}
                    href={getProviderLink(p.provider_name, providersData.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 bg-[#0a0a0a]/80 backdrop-blur-md border ${p.provider_name.toLowerCase().includes('amazon') ? 'border-primary/50 hover:border-primary shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10 hover:border-white/30'} rounded-2xl p-2 pr-4 transition-all duration-300 group hover:-translate-y-1`}
                    title={`Watch on ${p.provider_name}`}
                  >
                    <img 
                      src={getImageUrl(p.logo_path, 'w500')} 
                      alt={p.provider_name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl group-hover:scale-105 transition-transform"
                    />
                    <div className="flex flex-col text-left">
                       <span className="text-white text-sm font-bold font-sans line-clamp-1">{p.provider_name}</span>
                       {p.provider_name.toLowerCase().includes('amazon') ? (
                         <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Rent / Buy</span>
                       ) : (
                         <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Stream</span>
                       )}
                    </div>
                  </a>
                ))}
                <AmazonAffiliateButton title={tv.name} year={tv.first_air_date?.substring(0, 4)} />
              </div>
              {streamProviders.length > 0 && (
                <p className="text-[10px] text-gray-600 mt-3 flex items-center justify-center md:justify-start gap-1">
                  <span>Streaming data provided by</span>
                  <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">JustWatch</a>
                </p>
              )}
              <p className="text-[10px] text-gray-500 mt-1.5 flex items-center justify-center md:justify-start">
                As an Amazon Associate, CinemaDiscovery earns from qualifying purchases.
              </p>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bebas text-gray-400 mb-3">Overview</h3>
              <p className="text-gray-200 text-lg leading-relaxed font-sans max-w-3xl">
                {tv.overview}
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

      {recommendations.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <h3 className="text-3xl font-bebas text-white mb-8 border-l-4 border-primary pl-4">Similar Shows</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
            {recommendations.map((rec: any, i: number) => (
              <Link to={`/tv/${rec.id}`} key={rec.id}>
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
                        alt={rec.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center p-3 text-center">
                        <span className="text-gray-400 text-xs font-sans">{rec.name}</span>
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
                    {rec.name}
                  </h4>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Trailer Modal ── */}
      {showTrailerModal && trailer && iframeKey && (
        <TrailerModal
          iframeKey={iframeKey}
          onClose={() => setShowTrailerModal(false)}
          backdropUrl={tv.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tv.backdrop_path}` : undefined}
        />
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        message="Please sign in to add shows to your watchlist." 
      />
    </div>
  );
};

export default TvShowDetail;
