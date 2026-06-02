import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi, getImageUrl, type TMDBMovie } from '../services/tmdb';
import { Star, ChevronLeft, ChevronRight, Play, AlertCircle, Gem, Zap, Crown, ThumbsUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBattle, getUserVote, castVote, getWeeklyBattle, getGuestId } from '../lib/battleService';
import type { Battle } from '../lib/battleService';
import SEO from '../components/SEO';
import { generateSlug } from '../utils/slugify';
import ImageWithSkeleton from '../components/ui/ImageWithSkeleton';
import StreamingServiceRow from '../components/StreamingServiceRow';

const Home = () => {
  const { data: heroData, isLoading: isHeroLoading, error: heroError } = useQuery({
    queryKey: ['trendingMovies', 'day'],
    queryFn: () => tmdbApi.getTrendingMovies('day'),
  });

  const { data: trendingData, isLoading: isTrendingLoading } = useQuery({
    queryKey: ['trendingMovies', 'week'],
    queryFn: () => tmdbApi.getTrendingMovies('week'),
  });

  const { data: hiddenGemsData, isLoading: isGemsLoading } = useQuery({
    queryKey: ['hiddenGems'],
    queryFn: () => tmdbApi.discoverMovies({ 
      sort_by: 'vote_average.desc',
      'vote_count.gte': 100,
      'vote_count.lte': 1500, // find highly rated but lesser known
      page: 1 
    }),
  });

  const [heroIndex, setHeroIndex] = useState(0);
  const [featuredBattle, setFeaturedBattle] = useState<(Battle & { battleId: string; userVote: any; endsAt?: Date; battleCategory?: string }) | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const loadBattle = async () => {
      try {
        const weekly = getWeeklyBattle();
        
        const battle = await getBattle(weekly.battleId);
        if (!battle) return;
        
        const odv = currentUser?.uid || getGuestId();

        // Run secondary data fetches in parallel
        const [m1, m2, userVote] = await Promise.all([
          tmdbApi.getMovieDetails(battle.movie1Id).catch(() => null),
          tmdbApi.getMovieDetails(battle.movie2Id).catch(() => null),
          getUserVote(weekly.battleId, odv).catch(() => null)
        ]);
        
        const bWithPosters = {
           ...battle,
           movie1Poster: m1?.poster_path || null,
           movie2Poster: m2?.poster_path || null
        };

        setFeaturedBattle({ ...bWithPosters, battleId: weekly.battleId, userVote, endsAt: weekly.endsAt, battleCategory: battle.category });
      } catch (e) {
        console.error("Home battle loading error:", e);
      }
    };
    loadBattle();
  }, [currentUser]);


  const handleBattleVote = async (battleId: string, movieId: number, side: 'movie1' | 'movie2') => {
    if (isVoting || !featuredBattle) return;
    setIsVoting(true);
    try {
      const odv = currentUser?.uid || getGuestId();
      await castVote(battleId, movieId, odv, side);
      const [updated, userVote] = await Promise.all([
        getBattle(battleId),
        getUserVote(battleId, odv)
      ]);
      // Preserve existing poster paths from TMDB (not stored in Firestore)
      setFeaturedBattle(prev => ({
        ...prev!,
        ...updated!,
        movie1Poster: prev?.movie1Poster ?? null,
        movie2Poster: prev?.movie2Poster ?? null,
        battleId,
        userVote
      }));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsVoting(false);
    }
  };
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter movies that have backdrops for the hero section
  const heroMovies = (heroData || []).filter(m => m.backdrop_path).slice(0, 5);
  const trendingMovies = trendingData || [];
  const hiddenGems = hiddenGemsData?.results?.filter((m: TMDBMovie) => m.poster_path).slice(0, 10) || [];

  // Auto-rotate hero every 6 seconds
  useEffect(() => {
    if (heroMovies.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const currentHero = heroMovies[heroIndex];

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (heroError) {
    return (
      <div className="pt-24 px-8 flex flex-col items-center justify-center h-[50vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bebas text-white mb-2">Error Loading Data</h2>
        <p className="text-gray-400">Please check your TMDB API keys in the .env file.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background-dark">
      <SEO
        title="CinemaDiscovery | Discover Movies, TV Shows and Directors."
        description="Discover popular movies, top trending TV shows, explore director universes, and vote in weekly cinematic battles."
        url="https://cinemadiscovery.com"
        type="website"
        schema={JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "CinemaDiscovery",
          "url": "https://cinemadiscovery.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://cinemadiscovery.com/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      >
        {currentHero?.backdrop_path && (
          <link rel="preload" as="image" href={getImageUrl(currentHero.backdrop_path, 'w1280')} fetchPriority="high" />
        )}
      </SEO>
      {/* Hero Section */}
      <section className="relative min-h-[70dvh] md:min-h-[100dvh] w-full overflow-hidden bg-[#080810]">
        {!isHeroLoading && currentHero ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHero.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                <img
                  src={getImageUrl(currentHero.backdrop_path, 'w1280')}
                  alt={currentHero.title}
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </motion.div>
            </AnimatePresence>

            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080810]/80 to-transparent z-10" />

            {/* Hero Content */}
            <div className="absolute bottom-16 left-0 z-20 w-full px-6 md:px-16 max-w-4xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHero.id + '-content'}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="font-bebas text-5xl md:text-7xl text-white mb-3 tracking-wider drop-shadow-lg leading-tight">
                    {currentHero.title}
                  </h1>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="flex items-center gap-1 text-secondary font-sans font-semibold text-lg">
                      <Star className="w-5 h-5 fill-secondary text-secondary" />
                      {currentHero.vote_average ? currentHero.vote_average.toFixed(1) : 'NR'}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {currentHero.release_date?.substring(0, 4)}
                    </span>
                  </div>
                  <p className="font-sans text-gray-300 text-base md:text-lg max-w-xl line-clamp-3 mb-6">
                    {currentHero.overview}
                  </p>
                  <div className="flex gap-4">
                    <Link to={`/movie/${currentHero.id}/${generateSlug(currentHero.title)}`} className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white font-sans font-bold py-3 px-7 rounded-full shadow-lg hover:shadow-primary/50 transition-all duration-300">
                      <Play className="w-5 h-5 fill-white" /> Watch Trailer
                    </Link>
                    <Link to={`/movie/${currentHero.id}/${generateSlug(currentHero.title)}`} className="bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 text-white font-sans font-semibold py-3 px-7 rounded-full transition-all duration-300">
                      More Info
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Hero Indicators */}
            {heroMovies.length > 1 && (
              <div className="absolute bottom-6 right-6 md:right-16 z-20 flex gap-2">
                {heroMovies.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-8 bg-primary' : 'w-4 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </section>


      {/* Streaming Services Row */}
      <StreamingServiceRow />

      {/* Quick Links Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bebas text-4xl text-secondary">Trending This Week</h2>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isTrendingLoading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[220px] h-[330px] bg-white/5 animate-pulse rounded-xl snap-start" />
            ))
          ) : (
            trendingMovies.map((movie, i) => (
              <Link to={`/movie/${movie.id}/${generateSlug(movie.title)}`} key={movie.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex-shrink-0 w-[220px] group cursor-pointer snap-start p-1.5"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-[0_8px_25px_rgba(0,0,0,0.5)] border border-white/5 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                    {movie.poster_path ? (
                      <ImageWithSkeleton
                        src={getImageUrl(movie.poster_path, 'w500')}
                        alt={movie.title || 'Movie'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                        containerClassName="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center p-3 text-center">
                        <span className="text-gray-400 text-xs font-sans">{movie.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="flex items-center gap-1 text-secondary font-sans text-sm font-semibold">
                        <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                        {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-sans text-gray-200 truncate group-hover:text-primary transition-colors duration-300">
                    {movie.title}
                  </p>
                  <p className="text-xs font-sans text-gray-500">
                    {movie.release_date?.substring(0, 4)}
                  </p>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Battles Section */}
      {featuredBattle && (() => {
        const totalVotes = (featuredBattle.movie1Votes || 0) + (featuredBattle.movie2Votes || 0);
        const m1Pct = totalVotes > 0 ? Math.round(((featuredBattle.movie1Votes || 0) / totalVotes) * 100) : 50;
        const m2Pct = totalVotes > 0 ? Math.round(((featuredBattle.movie2Votes || 0) / totalVotes) * 100) : 50;
        const m1Leading = featuredBattle.movie1Votes > featuredBattle.movie2Votes;
        const m2Leading = featuredBattle.movie2Votes > featuredBattle.movie1Votes;

        return (
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Dramatic layered background */}
          <div className="absolute inset-0 bg-[#050510]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.08)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.06)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.06)_0%,transparent_50%)]" />
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          {/* Top/bottom fade borders */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="inline-flex items-center gap-2 text-yellow-400 font-bebas tracking-[0.25em] text-sm bg-yellow-400/10 px-5 py-2 rounded-full border border-yellow-400/20 mb-5 backdrop-blur-sm">
                <Zap className="w-4 h-4 fill-yellow-400" />
                WEEKLY FEATURED BATTLE
                <Zap className="w-4 h-4 fill-yellow-400" />
              </span>
              <h2 className="font-bebas text-5xl md:text-6xl lg:text-7xl text-white tracking-wide">
                Who Wins This <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-primary">Matchup</span>?
              </h2>
              <p className="font-sans text-gray-500 text-sm mt-3 max-w-md mx-auto">Cast your vote and see how the community feels about this week's cinematic showdown</p>
            </motion.div>
            
            {/* Battle Arena Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative rounded-[2rem] overflow-hidden"
            >
              {/* Card glow border effect */}
              <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-br from-primary/40 via-transparent to-purple-500/30" />
              <div className="relative bg-[#0a0a18]/90 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 md:p-12 lg:p-16">
                {/* Inner background effects */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-red-950/20 via-transparent to-indigo-950/20" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-primary/5 blur-[80px] rounded-full" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 lg:gap-8">
                  
                  {/* Movie 1 */}
                  <motion.div 
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex-1 text-center w-full max-w-xs"
                  >
                    <div className="group relative mb-5">
                      {/* Poster glow */}
                      <div className="absolute -inset-2 bg-gradient-to-b from-primary/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-40 md:w-52 mx-auto aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 group-hover:border-white/20 transition-all duration-500 group-hover:shadow-[0_25px_80px_rgba(229,9,20,0.3)] group-hover:-translate-y-1">
                        <img src={getImageUrl(featuredBattle.movie1Poster!)} alt={featuredBattle.movie1Title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        {/* Poster overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        {featuredBattle.userVote && m1Leading && (
                          <div className="absolute inset-0 border-[3px] border-yellow-400/80 rounded-2xl shadow-[inset_0_0_30px_rgba(250,204,21,0.15)]">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 rounded-full p-1.5 shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                              <Crown className="w-4 h-4 text-black" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bebas text-2xl md:text-3xl text-white mb-1 tracking-wide">{featuredBattle.movie1Title}</h3>
                    
                    {!featuredBattle.userVote ? (
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleBattleVote(featuredBattle.battleId, featuredBattle.movie1Id, 'movie1')} 
                        disabled={isVoting} 
                        className="mt-4 group/btn relative w-full max-w-[220px] mx-auto overflow-hidden rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-red-700 group-hover/btn:from-red-600 group-hover/btn:to-red-800 transition-all duration-300" />
                        <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_60%)] transition-opacity duration-300" />
                        <span className="relative flex items-center justify-center gap-2.5 py-3.5 px-6 text-white font-bold font-sans text-sm tracking-wide">
                          <ThumbsUp className="w-4 h-4" /> {isVoting ? 'VOTING...' : 'VOTE'}
                        </span>
                      </motion.button>
                    ) : (
                      <div className="mt-4 max-w-[220px] mx-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-sans text-gray-500">{featuredBattle.movie1Votes || 0} votes</span>
                          <span className={`font-bebas text-lg ${m1Leading ? 'text-yellow-400' : 'text-gray-400'}`}>{m1Pct}%</span>
                        </div>
                        <div className="bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${m1Pct}%` }} 
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                            className={`h-full rounded-full ${m1Leading ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)]' : 'bg-gradient-to-r from-gray-600 to-gray-500'}`} 
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* VS Orb */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5, type: 'spring', stiffness: 200 }}
                    className="flex-shrink-0 relative my-2 md:my-0"
                  >
                    {/* Rotating ring */}
                    <div className="absolute inset-[-12px] md:inset-[-16px] rounded-full border-2 border-dashed border-primary/30 animate-[spin_20s_linear_infinite]" />
                    <div className="absolute inset-[-6px] md:inset-[-8px] rounded-full border border-yellow-400/10 animate-[spin_15s_linear_infinite_reverse]" />
                    {/* Glow behind orb */}
                    <div className="absolute inset-[-20px] bg-primary/20 rounded-full blur-2xl animate-pulse" />
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-red-900 via-red-950 to-black border-2 border-primary/60 shadow-[0_0_50px_rgba(229,9,20,0.6),inset_0_0_20px_rgba(229,9,20,0.3)] transform hover:scale-110 transition-transform duration-500 relative z-10">
                      <Zap className="w-9 h-9 md:w-11 md:h-11 text-yellow-400 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] fill-yellow-400" />
                    </div>
                  </motion.div>

                  {/* Movie 2 */}
                  <motion.div 
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex-1 text-center w-full max-w-xs"
                  >
                    <div className="group relative mb-5">
                      {/* Poster glow */}
                      <div className="absolute -inset-2 bg-gradient-to-b from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-40 md:w-52 mx-auto aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 group-hover:border-white/20 transition-all duration-500 group-hover:shadow-[0_25px_80px_rgba(229,9,20,0.3)] group-hover:-translate-y-1">
                        <img src={getImageUrl(featuredBattle.movie2Poster!)} alt={featuredBattle.movie2Title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        {/* Poster overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        {featuredBattle.userVote && m2Leading && (
                          <div className="absolute inset-0 border-[3px] border-yellow-400/80 rounded-2xl shadow-[inset_0_0_30px_rgba(250,204,21,0.15)]">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 rounded-full p-1.5 shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                              <Crown className="w-4 h-4 text-black" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bebas text-2xl md:text-3xl text-white mb-1 tracking-wide">{featuredBattle.movie2Title}</h3>
                    
                    {!featuredBattle.userVote ? (
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleBattleVote(featuredBattle.battleId, featuredBattle.movie2Id, 'movie2')} 
                        disabled={isVoting} 
                        className="mt-4 group/btn relative w-full max-w-[220px] mx-auto overflow-hidden rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-red-700 group-hover/btn:from-red-600 group-hover/btn:to-red-800 transition-all duration-300" />
                        <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_60%)] transition-opacity duration-300" />
                        <span className="relative flex items-center justify-center gap-2.5 py-3.5 px-6 text-white font-bold font-sans text-sm tracking-wide">
                          <ThumbsUp className="w-4 h-4" /> {isVoting ? 'VOTING...' : 'VOTE'}
                        </span>
                      </motion.button>
                    ) : (
                      <div className="mt-4 max-w-[220px] mx-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-sans text-gray-500">{featuredBattle.movie2Votes || 0} votes</span>
                          <span className={`font-bebas text-lg ${m2Leading ? 'text-yellow-400' : 'text-gray-400'}`}>{m2Pct}%</span>
                        </div>
                        <div className="bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${m2Pct}%` }} 
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                            className={`h-full rounded-full ${m2Leading ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)]' : 'bg-gradient-to-r from-gray-600 to-gray-500'}`} 
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>

                </div>

                {/* Total votes & CTA */}
                <div className="relative z-10 mt-10 pt-6 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {featuredBattle.userVote && (
                      <p className="text-gray-500 font-sans text-xs">
                        <span className="text-gray-400 font-semibold">{totalVotes.toLocaleString()}</span> total votes cast
                      </p>
                    )}
                    <Link to="/battles" className="group/link inline-flex items-center gap-2 text-sm font-sans font-medium text-gray-400 hover:text-white transition-colors duration-300 ml-auto">
                      See all battles & leaderboard 
                      <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        );
      })()}



      {/* ── Hidden Gems ── */}
      <section className="bg-[#0f0f16] py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-6">
            <div>
              <h2 className="font-bebas text-4xl text-white flex items-center gap-3 mb-2">
                <Gem className="w-6 h-6 text-purple-400" />
                Hidden Gems
              </h2>
              <p className="text-gray-400 font-sans max-w-2xl">
                Critically acclaimed masterpieces that flew under the radar. High ratings, low view counts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-8">
            {isGemsLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-xl border border-white/5" />
              ))
            ) : (
              hiddenGems.map((movie: TMDBMovie, i: number) => (
                <Link to={`/movie/${movie.id}/${generateSlug(movie.title)}`} key={movie.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group cursor-pointer flex flex-col h-full p-1.5"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(168,85,247,0.35)] group-hover:-translate-y-2">
                      <ImageWithSkeleton
                        src={getImageUrl(movie.poster_path, 'w500')}
                        alt={movie.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full px-2 py-1 border border-white/10 flex items-center gap-1 z-10">
                        <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                        <span className="text-white text-xs font-bold font-sans">{movie.vote_average.toFixed(1)}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="w-full bg-primary text-white text-center font-bold py-2.5 rounded-lg text-sm font-sans hover:bg-red-700 transition shadow-lg">
                          Uncover
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm md:text-base font-sans font-semibold text-gray-200 group-hover:text-purple-400 transition-colors duration-300 line-clamp-1">
                      {movie.title}
                    </h3>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
