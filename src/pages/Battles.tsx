import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, ThumbsUp, Clock } from 'lucide-react';
import { getImageUrl, tmdbApi } from '../services/tmdb';
import { useAuth } from '../contexts/AuthContext';
import { castVote, getUserVote, getBattle, getWeeklyBattle, getGuestId } from '../lib/battleService';
import type { Battle } from '../lib/battleService';
import { Helmet } from 'react-helmet-async';


const Battles = () => {
  const [battle, setBattle] = useState<(Battle & { userVote: any }) | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    const loadBattle = async () => {
      try {
        setLoading(true);
        const weekly = getWeeklyBattle();
        
        const b = await getBattle(weekly.battleId);
        if (!b) {
          setLoading(false);
          return;
        }
        
        // Fetch TMDB data for posters
        const m1 = await tmdbApi.getMovieDetails(b!.movie1Id).catch(() => null);
        const m2 = await tmdbApi.getMovieDetails(b!.movie2Id).catch(() => null);
        
        const bWithPosters = {
           ...b!,
           movie1Poster: m1?.poster_path || null,
           movie2Poster: m2?.poster_path || null
        };
        
        const odv = currentUser?.uid || getGuestId();
        const userVote = await getUserVote(weekly.battleId, odv);
        setBattle({ ...bWithPosters, userVote });

        const updateTimer = () => {
          const now = new Date();
          const end = weekly.endsAt;
          const diff = end.getTime() - now.getTime();
          
          if (diff <= 0) {
            setTimeLeft('Battle Ended');
            return;
          }
          
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };
        
        updateTimer();
        interval = setInterval(updateTimer, 1000);
      } catch (err: any) {
        console.error("Battles loading error:", err);
        setError(err.message || 'Failed to load battle');
      } finally {
        setLoading(false);
      }
    };
    loadBattle();

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleVote = async (movieId: number, side: 'movie1' | 'movie2') => {
    if (!battle || !battle.id || isVoting) return;
    
    setIsVoting(true);
    try {
      const odv = currentUser?.uid || getGuestId();
      await castVote(battle.id, movieId, odv, side);
      const updated = await getBattle(battle.id);
      const userVote = await getUserVote(battle.id, odv);
      setBattle(prev => prev ? { ...prev, ...updated!, userVote } : null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsVoting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark pt-20 flex flex-col justify-center items-center text-center px-4">
        <Zap className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bebas text-white mb-2">Battle Loading Failed</h2>
        <p className="text-gray-400 font-sans">{error}</p>
        <p className="text-gray-500 font-sans text-sm mt-4">Make sure you have deployed your Firestore Security Rules.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark pt-20 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-gray-500 text-sm font-sans">Loading battle...</p>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-background-dark pt-20 flex flex-col justify-center items-center text-center px-4">
        <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
          <h2 className="text-4xl font-bebas text-white tracking-widest bg-[#0a0a0f] px-8 py-4 rounded-xl border border-white/10 uppercase">No Active Battle</h2>
          <p className="text-gray-400 mt-2 font-sans bg-[#0a0a0f] px-4 py-2 rounded-xl">The system configuration has not been seeded yet. Check back later!</p>
        </div>
      </div>
    );
  }

  const total = (battle.movie1Votes || 0) + (battle.movie2Votes || 0);
  const pct1 = total > 0 ? Math.round(((battle.movie1Votes || 0) / total) * 100) : 50;
  const pct2 = total > 0 ? 100 - pct1 : 50;
  const hasVoted = !!battle.userVote;
  const winner = pct1 > pct2 ? 'movie1' : pct2 > pct1 ? 'movie2' : null;

  return (
    <main className="min-h-screen bg-background-dark pt-20 pb-20">
      <Helmet>
        <title>Weekly Movie Battles | CinemaDiscovery</title>
        <meta name="description" content="Vote in our weekly movie battles! Pit two cinematic masterpieces against each other and see who wins." />
        <link rel="canonical" href="https://cinemadiscovery.com/battles" />
        <meta property="og:title" content="Weekly Movie Battles | CinemaDiscovery" />
        <meta property="og:description" content="Vote in our weekly movie battles! Pit two cinematic masterpieces against each other and see who wins." />
        <meta property="og:url" content="https://cinemadiscovery.com/battles" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-bebas text-6xl md:text-8xl text-white tracking-wider mb-4">
            Weekly <span className="text-primary">Battle</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-yellow-400 font-bebas text-xl bg-yellow-400/10 border border-yellow-400/20 py-2 px-6 rounded-full inline-flex">
            <Clock className="w-5 h-5" />
            Battle ends in: {timeLeft}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-red-900/10 pointer-events-none" />
          
          <div className="px-6 py-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm text-yellow-500 font-bebas tracking-widest">{battle.category}</span>
            <span className="text-sm text-gray-400 font-sans">{total} Total Votes</span>
          </div>

          <div className="p-8 md:p-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
              
              {/* Movie 1 */}
              <div className={`flex-1 text-center w-full transition-opacity ${hasVoted && winner === 'movie2' ? 'opacity-50' : ''}`}>
                <div className="w-48 md:w-64 h-72 md:h-96 mx-auto rounded-2xl overflow-hidden bg-white/5 mb-6 relative shadow-2xl transition-transform hover:scale-[1.02]">
                  {battle.movie1Poster && (
                    <img src={getImageUrl(battle.movie1Poster, 'w500')} alt={battle.movie1Title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  )}
                  {hasVoted && winner === 'movie1' && (
                    <div className="absolute inset-0 border-4 border-yellow-400 rounded-2xl">
                      <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 drop-shadow-2xl fill-yellow-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-bebas text-3xl md:text-4xl text-white mb-6">{battle.movie1Title}</h3>
                
                {!hasVoted ? (
                  <button
                    onClick={() => handleVote(battle.movie1Id, 'movie1')}
                    disabled={isVoting}
                    className="px-8 py-4 bg-primary hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-lg font-bebas tracking-wide rounded-xl w-full max-w-xs mx-auto transition-all shadow-lg hover:shadow-primary/50"
                  >
                    <ThumbsUp className="w-5 h-5 inline mr-2" /> {isVoting ? 'PROCESSING...' : 'VOTE FOR THIS'}
                  </button>
                ) : (
                  <div className="max-w-xs mx-auto">
                    <div className="flex justify-between text-white font-sans text-sm mb-2">
                      <span>{battle.movie1Title}</span>
                      <span className="font-bold text-yellow-400">{pct1}%</span>
                    </div>
                    <div className="bg-white/10 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct1}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${winner === 'movie1' ? 'bg-yellow-400' : 'bg-gray-400'}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* VS Divider */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center my-8 md:my-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-900 to-black border-4 border-primary shadow-[0_0_50px_rgba(229,9,20,0.6)] flex items-center justify-center relative z-10 transform hover:scale-110 transition-transform duration-500">
                  <Zap className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 drop-shadow-[0_0_20px_rgba(253,224,71,1)] fill-yellow-400 animate-pulse" />
                </div>
              </div>

              {/* Movie 2 */}
              <div className={`flex-1 text-center w-full transition-opacity ${hasVoted && winner === 'movie1' ? 'opacity-50' : ''}`}>
                <div className="w-48 md:w-64 h-72 md:h-96 mx-auto rounded-2xl overflow-hidden bg-white/5 mb-6 relative shadow-2xl transition-transform hover:scale-[1.02]">
                  {battle.movie2Poster && (
                    <img src={getImageUrl(battle.movie2Poster, 'w500')} alt={battle.movie2Title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  )}
                  {hasVoted && winner === 'movie2' && (
                    <div className="absolute inset-0 border-4 border-yellow-400 rounded-2xl">
                      <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 drop-shadow-2xl fill-yellow-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-bebas text-3xl md:text-4xl text-white mb-6">{battle.movie2Title}</h3>
                
                {!hasVoted ? (
                  <button
                    onClick={() => handleVote(battle.movie2Id, 'movie2')}
                    disabled={isVoting}
                    className="px-8 py-4 bg-primary hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-lg font-bebas tracking-wide rounded-xl w-full max-w-xs mx-auto transition-all shadow-lg hover:shadow-primary/50"
                  >
                    <ThumbsUp className="w-5 h-5 inline mr-2" /> {isVoting ? 'PROCESSING...' : 'VOTE FOR THIS'}
                  </button>
                ) : (
                  <div className="max-w-xs mx-auto">
                    <div className="flex justify-between text-white font-sans text-sm mb-2">
                      <span>{battle.movie2Title}</span>
                      <span className="font-bold text-yellow-400">{pct2}%</span>
                    </div>
                    <div className="bg-white/10 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct2}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${winner === 'movie2' ? 'bg-yellow-400' : 'bg-gray-400'}`}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Battles;
