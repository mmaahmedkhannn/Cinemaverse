import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi, getImageUrl, type TMDBMovie } from '../services/tmdb';
import { Star, ChevronLeft, ChevronRight, Play, AlertCircle, Gem, Zap, Crown, ThumbsUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBattle, getUserVote, castVote, getWeeklyBattle } from '../lib/battleService';
import type { Battle } from '../lib/battleService';
import { Helmet } from 'react-helmet-async';
import { generateSlug } from '../utils/slugify';

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
  const [featuredBattle, setFeaturedBattle] = useState<(Battle & { battleId: string; userVote: any }) | null>(null);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const loadBattle = async () => {
      try {
        const weekly = await getWeeklyBattle();
        if (!weekly) return;
        
        const battle = await getBattle(weekly.battleId);
        if (!battle) return;
        
        const m1 = await tmdbApi.getMovieDetails(battle.movie1Id).catch(() => null);
        const m2 = await tmdbApi.getMovieDetails(battle.movie2Id).catch(() => null);
        
        const bWithPosters = {
           ...battle,
           movie1Poster: m1?.poster_path || null,
           movie2Poster: m2?.poster_path || null
        };

        const userVote = currentUser ? await getUserVote(weekly.battleId, currentUser.uid) : null;
        setFeaturedBattle({ ...bWithPosters, battleId: weekly.battleId, userVote });
      } catch (e) {
        console.error("Home battle loading error:", e);
      }
    };
    loadBattle();
  }, [currentUser]);

  const handleBattleVote = async (battleId: string, movieId: number, side: 'movie1' | 'movie2') => {
    if (!currentUser) { alert('Sign in to vote!'); return; }
    try {
      await castVote(battleId, movieId, currentUser.uid, side);
      const updated = await getBattle(battleId);
      const userVote = await getUserVote(battleId, currentUser.uid);
      setFeaturedBattle({ ...updated!, battleId, userVote });
    } catch (e: any) {
      alert(e.message);
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
    <div className="pt-16">
      <Helmet>
        <title>CinemaDiscovery — The Ultimate Movie & TV Database</title>
        <meta name="description" content="Discover Every Story Ever Told" />
        <link rel="canonical" href="https://cinemadiscovery.com" />
        {currentHero?.backdrop_path && (
          <link rel="preload" as="image" href={getImageUrl(currentHero.backdrop_path, 'original')} fetchPriority="high" />
        )}
      </Helmet>
      {/* ── Hero Section ── */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-[#080810]">
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
                  src={getImageUrl(currentHero.backdrop_path, 'original')}
                  alt={currentHero.title}
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                  loading="eager"
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



      {/* ── Trending Now ── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isTrendingLoading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[180px] h-[270px] bg-white/5 animate-pulse rounded-lg" />
            ))
          ) : (
            trendingMovies.map((movie, i) => (
              <Link to={`/movie/${movie.id}/${generateSlug(movie.title)}`} key={movie.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex-shrink-0 w-[180px] group cursor-pointer"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                    {movie.poster_path ? (
                      <img
                        src={getImageUrl(movie.poster_path, 'w500')}
                        alt={movie.title || 'Movie'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center p-3 text-center">
                        <span className="text-gray-400 text-xs font-sans">{movie.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="flex items-center gap-1 text-secondary font-sans text-sm font-semibold">
                        <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                        {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-sans text-gray-200 truncate group-hover:text-white transition-colors">
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

      {/* ── Featured Daily Battle ── */}
      {featuredBattle && (
        <section className="bg-gradient-to-b from-[#080810] to-[#0a0a0f] py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-yellow-400 font-bebas tracking-widest text-lg bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-400/20 mb-4 inline-block">WEEKLY FEATURED BATTLE</span>
              <h2 className="font-bebas text-5xl text-white">Who Wins This Matchup?</h2>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                
                {/* Movie 1 */}
                <div className="flex-1 text-center w-full">
                  <div className="w-32 md:w-48 h-48 md:h-72 mx-auto rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-105 mb-4 relative">
                    <img src={getImageUrl(featuredBattle.movie1Poster!)} alt={featuredBattle.movie1Title} loading="lazy" className="w-full h-full object-cover" />
                    {featuredBattle.userVote && (featuredBattle.movie1Votes > featuredBattle.movie2Votes) && (
                      <div className="absolute inset-0 border-4 border-yellow-400 rounded-xl"><Crown className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-400 fill-yellow-400" /></div>
                    )}
                  </div>
                  <h3 className="font-bebas text-2xl md:text-3xl text-white mb-4">{featuredBattle.movie1Title}</h3>
                  {!featuredBattle.userVote ? (
                    <button onClick={() => handleBattleVote(featuredBattle.battleId, featuredBattle.movie1Id, 'movie1')} className="px-8 py-3 bg-primary hover:bg-red-700 text-white font-bold rounded-xl w-full transition-all">
                      <ThumbsUp className="w-5 h-5 inline mr-2" /> VOTE
                    </button>
                  ) : (
                    <div>
                      <div className="bg-white/10 rounded-full h-4 overflow-hidden mb-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round(((featuredBattle.movie1Votes || 0) / ((featuredBattle.movie1Votes||0) + (featuredBattle.movie2Votes||0))) * 100)}%` }} className="h-full bg-yellow-400" />
                      </div>
                      <p className="font-bebas text-xl text-yellow-400">{Math.round(((featuredBattle.movie1Votes || 0) / ((featuredBattle.movie1Votes||0) + (featuredBattle.movie2Votes||0))) * 100)}%</p>
                    </div>
                  )}
                </div>

                {/* VS */}
                <div className="flex-shrink-0 relative my-4 md:my-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex z-10 items-center justify-center bg-gradient-to-br from-red-900 to-black border-4 border-primary shadow-[0_0_40px_rgba(229,9,20,0.8)] transform hover:scale-110 transition-transform duration-500">
                    <Zap className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 drop-shadow-[0_0_20px_rgba(253,224,71,1)] fill-yellow-400 animate-pulse" />
                  </div>
                </div>

                {/* Movie 2 */}
                <div className="flex-1 text-center w-full">
                  <div className="w-32 md:w-48 h-48 md:h-72 mx-auto rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-105 mb-4 relative">
                    <img src={getImageUrl(featuredBattle.movie2Poster!)} alt={featuredBattle.movie2Title} loading="lazy" className="w-full h-full object-cover" />
                    {featuredBattle.userVote && (featuredBattle.movie2Votes > featuredBattle.movie1Votes) && (
                      <div className="absolute inset-0 border-4 border-yellow-400 rounded-xl"><Crown className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-400 fill-yellow-400" /></div>
                    )}
                  </div>
                  <h3 className="font-bebas text-2xl md:text-3xl text-white mb-4">{featuredBattle.movie2Title}</h3>
                  {!featuredBattle.userVote ? (
                    <button onClick={() => handleBattleVote(featuredBattle.battleId, featuredBattle.movie2Id, 'movie2')} className="px-8 py-3 bg-primary hover:bg-red-700 text-white font-bold rounded-xl w-full transition-all">
                      <ThumbsUp className="w-5 h-5 inline mr-2" /> VOTE
                    </button>
                  ) : (
                    <div>
                      <div className="bg-white/10 rounded-full h-4 overflow-hidden mb-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round(((featuredBattle.movie2Votes || 0) / ((featuredBattle.movie1Votes||0) + (featuredBattle.movie2Votes||0))) * 100)}%` }} className="h-full bg-yellow-400" />
                      </div>
                      <p className="font-bebas text-xl text-yellow-400">{Math.round(((featuredBattle.movie2Votes || 0) / ((featuredBattle.movie1Votes||0) + (featuredBattle.movie2Votes||0))) * 100)}%</p>
                    </div>
                  )}
                </div>

              </div>
              <div className="text-center mt-8 pt-6 border-t border-white/10">
                <Link to="/battles" className="text-primary hover:text-white font-sans text-sm transition-colors">See all battles & leaderboard →</Link>
              </div>
            </div>
          </div>
        </section>
      )}



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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {isGemsLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-lg border border-white/5" />
              ))
            ) : (
              hiddenGems.map((movie: TMDBMovie, i: number) => (
                <Link to={`/movie/${movie.id}/${generateSlug(movie.title)}`} key={movie.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group cursor-pointer flex flex-col h-full"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all">
                      <img
                        src={getImageUrl(movie.poster_path, 'w500')}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full px-2 py-1 border border-white/10 flex items-center gap-1 z-10">
                        <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                        <span className="text-white text-xs font-bold font-sans">{movie.vote_average.toFixed(1)}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="w-full bg-primary text-white text-center font-bold py-2 rounded-lg text-sm font-sans hover:bg-red-700 transition">
                          Uncover
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm md:text-base font-sans font-semibold text-gray-200 group-hover:text-purple-400 transition-colors line-clamp-1">
                      {movie.title}
                    </h3>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
