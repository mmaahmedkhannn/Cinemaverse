import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, ThumbsUp } from 'lucide-react';
import { getImageUrl, tmdbApi } from '../services/tmdb';
import { useAuth } from '../contexts/AuthContext';
import { castVote, getUserVote, getBattle } from '../lib/battleService';
import predefinedBattles from '../data/battlesData';

const CATEGORIES = ['All', 'GOAT', 'Superhero', 'Horror', 'Sci-Fi', 'Action', 'Drama', 'Crime', 'Animation', 'Comedy', 'NewReleases', 'Series'];

const Battles = () => {
  const [activeCat, setActiveCat] = useState('All');
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadBattles = async () => {
      try {
        setLoading(true);
        const resolved = await Promise.all(
          predefinedBattles.map(async (preset) => {
            const battleId = preset.id;
            const isSeries = preset.category === 'Series';
            
            const m1 = await (isSeries ? tmdbApi.getTvDetails(preset.movie1.tmdbId) : tmdbApi.getMovieDetails(preset.movie1.tmdbId)).catch(() => null);
            const m2 = await (isSeries ? tmdbApi.getTvDetails(preset.movie2.tmdbId) : tmdbApi.getMovieDetails(preset.movie2.tmdbId)).catch(() => null);
            
            // Bypass Firebase entirely for instant load as requested.
            // Votes will default to 0, or we can use 50/50 placeholder visual.
            // When the user votes, the real Firebase values are generated.

            return { 
              ...preset, 
              battleId, 
              movie1Id: preset.movie1.tmdbId,
              movie2Id: preset.movie2.tmdbId,
              movie1Title: preset.movie1.title,
              movie2Title: preset.movie2.title,
              movie1Votes: 0,
              movie2Votes: 0,
              userVote: null, 
              stats1: m1, 
              stats2: m2,
              movie1Poster: m1?.poster_path,
              movie2Poster: m2?.poster_path
            };
          })
        );
        setBattles(resolved as any);
      } catch (err) {
        console.error("Battles loading error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBattles();
  }, [currentUser]);

  const handleVote = async (battleId: string, movieId: number, side: 'movie1' | 'movie2', presetProps: any) => {
    if (!currentUser) { alert('Sign in to vote!'); return; }
    try {
      await castVote(battleId, movieId, currentUser.uid, side, presetProps);
      // Refresh this battle
      const updated = await getBattle(battleId);
      const userVote = await getUserVote(battleId, currentUser.uid);
      setBattles(prev => prev.map(b => b.battleId === battleId ? { ...b, ...updated, userVote } : b));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = activeCat === 'All' ? battles : battles.filter(b => b.category === activeCat);

  return (
    <div className="min-h-screen bg-background-dark pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-bebas text-6xl md:text-8xl text-white tracking-wider mb-4">
            Movie <span className="text-primary">Battles</span>
          </h1>
          <p className="text-gray-400 text-lg font-sans max-w-2xl mx-auto">
            Which movie reigns supreme? Cast your vote and settle the debate once and for all.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-4 py-2 rounded-full text-sm font-sans transition-all ${
                activeCat === cat ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map((battle, i) => {
              const total = (battle.movie1Votes || 0) + (battle.movie2Votes || 0);
              const pct1 = total > 0 ? Math.round(((battle.movie1Votes || 0) / total) * 100) : 50;
              const pct2 = total > 0 ? 100 - pct1 : 50;
              const hasVoted = !!battle.userVote;
              const winner = pct1 > pct2 ? 'movie1' : pct2 > pct1 ? 'movie2' : null;

              return (
                <motion.div
                  key={battle.battleId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                >
                  {/* Category Label */}
                  <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-sans">{battle.category}</span>
                    <span className="text-xs text-gray-500 font-sans">{total} votes</span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Movie 1 */}
                      <div className={`flex-1 text-center transition-opacity ${hasVoted && winner === 'movie2' ? 'opacity-60' : ''}`}>
                        <div className="w-32 h-48 mx-auto rounded-xl overflow-hidden bg-white/5 mb-3 relative shadow-2xl transition-transform hover:scale-105">
                          {battle.movie1Poster && (
                            <img src={getImageUrl(battle.movie1Poster)} alt={battle.movie1Title} className="w-full h-full object-cover" />
                          )}
                          {hasVoted && winner === 'movie1' && (
                            <div className="absolute inset-0 border-4 border-yellow-400 rounded-xl">
                              <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-400 drop-shadow-2xl fill-yellow-400" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-bebas text-2xl text-white mb-2">{battle.movie1Title}</h3>
                        {battle.stats1 && (
                          <div className="mb-4 space-y-1">
                            <p className="text-xs text-gray-400 font-sans">Year: {(battle.stats1.release_date || battle.stats1.first_air_date)?.substring(0,4)}</p>
                            <p className="text-xs text-gray-400 font-sans">CV Score: <span className="text-primary font-bold">{battle.stats1.vote_average?.toFixed(1)}</span></p>
                            <p className="text-xs text-gray-400 font-sans">Popularity: {Math.round(battle.stats1.popularity)}</p>
                          </div>
                        )}
                        {!hasVoted ? (
                          <button
                            onClick={() => handleVote(battle.battleId, battle.movie1Id, 'movie1', { movie1Id: battle.movie1Id, movie2Id: battle.movie2Id, movie1Title: battle.movie1Title, movie2Title: battle.movie2Title, category: battle.category })}
                            className="px-6 py-2 bg-primary hover:bg-red-700 text-white text-sm font-sans font-bold rounded-lg transition-all"
                          >
                            <ThumbsUp className="w-4 h-4 inline mr-1" /> VOTE
                          </button>
                        ) : (
                          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="origin-left">
                            <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct1}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full rounded-full ${winner === 'movie1' ? 'bg-yellow-400' : 'bg-gray-500'}`}
                              />
                            </div>
                            <p className="text-lg font-bebas mt-1" style={{ color: winner === 'movie1' ? '#facc15' : '#9ca3af' }}>{pct1}%</p>
                          </motion.div>
                        )}
                      </div>

                      {/* Dynamic VS Separator matching Cinematic UI */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-900 to-black border-4 border-primary shadow-[0_0_40px_rgba(229,9,20,0.8)] flex items-center justify-center relative z-10 transform hover:scale-110 transition-transform duration-500 mb-2 mt-8 md:mt-0">
                        <Zap className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_20px_rgba(253,224,71,1)] fill-yellow-400 animate-pulse" />
                      </div>
                      <span className="font-bebas text-white text-3xl tracking-widest mt-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">VS</span>
                    </div>

                      {/* Movie 2 */}
                      <div className={`flex-1 text-center transition-opacity ${hasVoted && winner === 'movie1' ? 'opacity-60' : ''}`}>
                        <div className="w-32 h-48 mx-auto rounded-xl overflow-hidden bg-white/5 mb-3 relative shadow-2xl transition-transform hover:scale-105">
                          {battle.movie2Poster && (
                            <img src={getImageUrl(battle.movie2Poster)} alt={battle.movie2Title} className="w-full h-full object-cover" />
                          )}
                          {hasVoted && winner === 'movie2' && (
                            <div className="absolute inset-0 border-4 border-yellow-400 rounded-xl">
                              <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-400 drop-shadow-2xl fill-yellow-400" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-bebas text-2xl text-white mb-2">{battle.movie2Title}</h3>
                        {battle.stats2 && (
                          <div className="mb-4 space-y-1">
                            <p className="text-xs text-gray-400 font-sans">Year: {(battle.stats2.release_date || battle.stats2.first_air_date)?.substring(0,4)}</p>
                            <p className="text-xs text-gray-400 font-sans">CV Score: <span className="text-primary font-bold">{battle.stats2.vote_average?.toFixed(1)}</span></p>
                            <p className="text-xs text-gray-400 font-sans">Popularity: {Math.round(battle.stats2.popularity)}</p>
                          </div>
                        )}
                        {!hasVoted ? (
                          <button
                            onClick={() => handleVote(battle.battleId, battle.movie2Id, 'movie2', { movie1Id: battle.movie1Id, movie2Id: battle.movie2Id, movie1Title: battle.movie1Title, movie2Title: battle.movie2Title, category: battle.category })}
                            className="px-6 py-2 bg-primary hover:bg-red-700 text-white text-sm font-sans font-bold rounded-lg transition-all"
                          >
                            <ThumbsUp className="w-4 h-4 inline mr-1" /> VOTE
                          </button>
                        ) : (
                          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="origin-right">
                            <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct2}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full rounded-full ${winner === 'movie2' ? 'bg-yellow-400' : 'bg-gray-500'}`}
                              />
                            </div>
                            <p className="text-lg font-bebas mt-1" style={{ color: winner === 'movie2' ? '#facc15' : '#9ca3af' }}>{pct2}%</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Battles;
