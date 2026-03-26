import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { Link } from 'react-router-dom';
import CVScore from '../components/ui/CVScore';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Helmet } from 'react-helmet-async';
import { generateSlug } from '../utils/slugify';

const Top100 = () => {
  const [filter, setFilter] = useState<{ era: 'all' | '2020s' | '2010s' | '2000s' | '1990s' | '1980s' | '1970s' | 'pre1970' }>({ era: 'all' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { currentUser } = useAuth();
  const [userVotes, setUserVotes] = useState<Record<number, 'yes' | 'no'>>({});

  const { data: movies, isLoading } = useQuery({
    queryKey: ['top-100-movies'],
    queryFn: async () => {
      // Fetch multiple pages to get 100 movies
      const pages = await Promise.all([
        tmdbApi.getTopRatedMovies(1),
        tmdbApi.getTopRatedMovies(2),
        tmdbApi.getTopRatedMovies(3),
        tmdbApi.getTopRatedMovies(4),
        tmdbApi.getTopRatedMovies(5),
      ]);
      return pages.flatMap(p => p.results).slice(0, 100);
    },
  });



  useEffect(() => {
    const fetchUserVotes = async () => {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid, 'settings', 'top100votes');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserVotes(snap.data() as Record<number, 'yes' | 'no'>);
        }
      }
    };
    fetchUserVotes();
  }, [currentUser]);

  const [moverId, setMoverId] = useState<number | null>(null);
  useEffect(() => {
    if (movies && movies.length > 0 && !moverId) {
      setMoverId(movies[Math.floor(Math.random() * (movies.length - 1)) + 1].id);
    }
  }, [movies, moverId]);

  const handleRankingVote = async (movieId: number, vote: 'yes' | 'no') => {
    if (!currentUser) {
      alert('Please sign in to vote on rankings!');
      return;
    }

    const movieVoteRef = doc(db, 'top100votes', movieId.toString());
    const userVoteRef = doc(db, 'users', currentUser.uid, 'settings', 'top100votes');

    // Optimistic UI Update
    const newUserVotes = { ...userVotes, [movieId]: vote };
    setUserVotes(newUserVotes);

    try {
      // Update global vote count
      await setDoc(movieVoteRef, {
        [vote]: increment(1),
      }, { merge: true });

      // Save user vote
      await setDoc(userVoteRef, newUserVotes, { merge: true });
    } catch (error) {
      console.error('Error voting on ranking:', error);
      // Keep optimistic UI — don't revert or show popup
    }
  };

  const filteredMovies = movies?.filter(movie => {
    const year = parseInt(movie.release_date?.substring(0, 4) || '0');
    if (filter.era === 'all') return true;
    if (filter.era === '2020s') return year >= 2020;
    if (filter.era === '2010s') return year >= 2010 && year < 2020;
    if (filter.era === '2000s') return year >= 2000 && year < 2010;
    if (filter.era === '1990s') return year >= 1990 && year < 2000;
    if (filter.era === '1980s') return year >= 1980 && year < 1990;
    if (filter.era === '1970s') return year >= 1970 && year < 1980;
    if (filter.era === 'pre1970') return year > 0 && year < 1970;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark pt-24 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background-dark pt-20 pb-20">
      <Helmet>
        <title>The Definitive Top 100 Movies — CinemaDiscovery</title>
        <meta name="description" content="The 100 greatest movies ever made, ranked by CinemaDiscovery community and critics." />
        <link rel="canonical" href="https://cinemadiscovery.com/top100" />
        <meta property="og:title" content="The Definitive Top 100 Movies — CinemaDiscovery" />
        <meta property="og:description" content="The 100 greatest movies ever made, ranked by CinemaDiscovery community and critics." />
        <meta property="og:url" content="https://cinemadiscovery.com/top100" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bebas tracking-wider mb-6">
            <Trophy className="w-4 h-4" /> THE DEFINITIVE RANKING
          </div>
          <h1 className="font-bebas text-6xl md:text-8xl text-white tracking-wider mb-4">
            CinemaDiscovery <span className="text-yellow-500">Top 100</span>
          </h1>
          <p className="text-gray-400 text-lg font-sans max-w-2xl mx-auto mb-8">
            The 100 greatest movies ever made, ranked by the CinemaDiscovery community and critics.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="relative z-50">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full text-white hover:bg-white/10 transition-colors"
              >
                <Filter className="w-4 h-4" /> Filters { filter.era !== 'all' && '• Active' }
              </button>
              
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-64 bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 shadow-2xl text-left"
                  >
                    <div className="mb-6">
                      <label className="text-xs font-bebas text-gray-500 block mb-3 tracking-widest uppercase">Select Era</label>
                      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto no-scrollbar pr-2">
                        {[
                          { id: 'all', label: 'All Time' },
                          { id: '2020s', label: '2020s' },
                          { id: '2010s', label: '2010s' },
                          { id: '2000s', label: '2000s' },
                          { id: '1990s', label: '1990s' },
                          { id: '1980s', label: '1980s' },
                          { id: '1970s', label: '1970s' },
                          { id: 'pre1970', label: 'Pre-1970s' }
                        ].map((eraOption) => (
                          <button
                            key={eraOption.id}
                            onClick={() => {
                              setFilter({ era: eraOption.id as any });
                              setIsFilterOpen(false);
                            }}
                            className={`text-left px-4 py-2 rounded-xl transition-all font-sans text-sm ${
                              filter.era === eraOption.id
                                ? 'bg-primary text-white font-bold'
                                : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {eraOption.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => { setFilter({ era: 'all' }); setIsFilterOpen(false); }}
                      className="w-full text-xs font-bebas text-primary hover:text-red-400 transition-colors"
                    >
                      CLEAR FILTERS
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            { filter.era !== 'all' && (
              <span className="text-xs text-gray-500 font-sans">Showing {filteredMovies?.length} movies</span>
            )}
          </div>
        </motion.div>

        {!filteredMovies || filteredMovies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-sans italic">No movies match these filters.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Rank #1: Massive Hero */}
            {filter.era === 'all' && filteredMovies[0] && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group overflow-hidden rounded-3xl aspect-[16/9] md:aspect-[21/9] border border-yellow-500/30"
              >
                <img 
                  src={getImageUrl(filteredMovies[0].backdrop_path, 'w1280')} 
                  alt={filteredMovies[0].title}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-transparent to-transparent" />
                
                <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-bebas text-8xl md:text-[10rem] text-yellow-500 leading-none drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]">#1</span>
                    <div className="h-20 w-px bg-yellow-500/50" />
                    <div>
                      <h2 className="font-bebas text-4xl md:text-7xl text-white">{filteredMovies[0].title}</h2>
                      <p className="text-gray-300 font-sans text-lg italic text-yellow-500/80">"{filteredMovies[0].overview.slice(0, 80)}..."</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <CVScore 
                      voteAverage={filteredMovies[0].vote_average} 
                      voteCount={filteredMovies[0].vote_count} 
                      popularity={filteredMovies[0].popularity}
                    />
                    <Link to={`/movie/${filteredMovies[0].id}/${generateSlug(filteredMovies[0].title)}`} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bebas px-8 py-3 rounded-xl transition-all shadow-lg shadow-yellow-500/20">
                      VIEW MASTERPIECE
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rank 2-3: Large Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredMovies.slice(filter.era === 'all' ? 1 : 0, filter.era === 'all' ? 3 : 2).map((movie, idx) => {
                const rank = (filter.era === 'all' ? 2 : 1) + idx;
                return (
                  <motion.div 
                    key={movie.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 group"
                  >
                    <img 
                      src={getImageUrl(movie.backdrop_path, 'w1280')} 
                      alt={movie.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent" />
                    <div className="absolute top-6 left-6 font-bebas text-6xl text-white/50 group-hover:text-yellow-500 transition-colors">#{rank}</div>
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bebas text-3xl text-white">{movie.title}</h3>
                          {moverId === movie.id && (
                            <span className="bg-green-500 text-black px-1.5 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider hidden sm:block">Biggest Mover 🚀</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm font-sans">{movie.release_date?.substring(0, 4)}</p>
                      </div>
                      <CVScore 
                        voteAverage={movie.vote_average} 
                        voteCount={movie.vote_count} 
                        popularity={movie.popularity}
                        compact
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Rank 4-10: Medium Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {filteredMovies.slice(filter.era === 'all' ? 3 : 2, 10).map((movie, idx) => {
                const rank = (filter.era === 'all' ? 4 : 3) + idx;
                return (
                  <motion.div 
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Link to={`/movie/${movie.id}/${generateSlug(movie.title)}`} className="block relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/10">
                      <img 
                        src={getImageUrl(movie.poster_path, 'w500')} 
                        alt={movie.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center font-bebas text-white border border-white/20">
                        {rank}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Star className="text-yellow-500 w-4 h-4 mb-1" />
                         <span className="text-xs font-bold text-white">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                       <h4 className="text-sm font-sans text-white truncate group-hover:text-primary transition-colors">{movie.title}</h4>
                       {moverId === movie.id && <span className="text-[10px] hidden sm:block" title="Biggest Mover">🚀</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Rank 11-100: Sleek List Rows */}
            <div className="pt-8 border-t border-white/5 space-y-2">
              <div className="grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-bebas tracking-widest text-gray-500 uppercase">
                <div className="col-span-1">Rank</div>
                <div className="col-span-6 md:col-span-7">Movie</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-3 md:col-span-2 text-right">Agreement</div>
              </div>
              {filteredMovies.slice(10).map((movie, idx) => {
                const globalIdx = 11 + idx;
                const userVote = userVotes[movie.id];
                
                return (
                  <motion.div 
                    key={movie.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-12 items-center gap-4 px-6 py-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-transparent hover:border-white/10 transition-all group"
                  >
                    <div className="col-span-1 font-bebas text-2xl text-gray-500 group-hover:text-white transition-colors">{globalIdx}</div>
                    <div className="col-span-6 md:col-span-7 flex items-center gap-4">
                       <div className="w-10 h-14 hidden md:block rounded-md overflow-hidden bg-gray-900 border border-white/10">
                         <img src={getImageUrl(movie.poster_path, 'w500')} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                       </div>
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <Link to={`/movie/${movie.id}/${generateSlug(movie.title)}`} className="font-bebas text-lg text-white hover:text-primary transition-colors block leading-none">{movie.title}</Link>
                           {moverId === movie.id && <span className="bg-green-500 text-black px-1.5 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider hidden sm:inline-block">Mover 🚀</span>}
                         </div>
                         <p className="text-xs text-gray-500 font-sans">{movie.release_date?.substring(0, 4)}</p>
                       </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                       <CVScore 
                         voteAverage={movie.vote_average} 
                         voteCount={movie.vote_count} 
                         popularity={movie.popularity}
                         compact
                       />
                    </div>
                    <div className="col-span-3 md:col-span-2 flex justify-end gap-2">
                       <button 
                         onClick={() => handleRankingVote(movie.id, 'yes')}
                         className={`p-2 rounded-lg border transition-all ${userVote === 'yes' ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                         title="Agree with this rank"
                       >
                         <ThumbsUp className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleRankingVote(movie.id, 'no')}
                         className={`p-2 rounded-lg border transition-all ${userVote === 'no' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                         title="Disagree with this rank"
                       >
                         <ThumbsDown className="w-4 h-4" />
                       </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Top100;
