import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Film, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getWatchlist } from '../lib/firestore';
import type { WatchlistItem } from '../lib/firestore';
import { getImageUrl } from '../services/tmdb';

const Profile = () => {
  const { currentUser } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (currentUser) {
        try {
          const list = await getWatchlist(currentUser.uid);
          setWatchlist(list);
        } catch (error) {
          console.error("Error fetching watchlist:", error);
        }
      }
      setLoading(false);
    };

    fetchWatchlist();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bebas text-white mb-4">You are not signed in</h2>
        <p className="text-gray-400 mb-8">Please sign in to view your profile and watchlist.</p>
        <Link to="/" className="text-primary hover:text-white transition-colors">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 mb-12 border-b border-white/10 pb-8">
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-2 border-primary object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-primary flex items-center justify-center text-3xl font-bold font-sans">
              {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bebas text-white">
              {currentUser.displayName || 'CinemaVerse User'}
            </h1>
            <p className="text-gray-400 font-sans">{currentUser.email}</p>
          </div>
        </div>

        {/* Wrapped Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-gradient-to-r from-primary/30 via-purple-900/20 to-transparent border border-primary/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Film className="w-32 h-32 rotate-12" />
          </div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="font-bebas text-3xl md:text-5xl text-white mb-2">CinemaVerse <span className="text-primary">Wrapped 2025</span></h2>
            <p className="text-gray-300 font-sans max-w-md">Relive your year in cinema with our personalized recap experience. Discover your watching habits and sharing personality!</p>
          </div>
          <Link to="/wrapped" className="relative z-10 bg-primary hover:bg-red-700 text-white font-bebas text-xl px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2">
             SEE YOUR WRAPPED <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>

        <div className="mb-8">
          <h2 className="text-3xl font-bebas text-white border-l-4 border-secondary pl-4 mb-8">
            My Watchlist
          </h2>
          
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-gray-400 font-sans">Your watchlist is empty.</p>
              <Link to="/movies" className="inline-block mt-4 text-secondary hover:text-white transition-colors font-semibold">
                Discover Movies
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {watchlist.map((item, i) => (
                <Link to={`/movie/${item.movieId}`} key={item.movieId}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group cursor-pointer flex flex-col h-full"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 shadow-lg">
                      {item.poster_path ? (
                        <img
                          src={getImageUrl(item.poster_path, 'w500')}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center p-3 text-center">
                          <span className="text-gray-400 text-xs font-sans">{item.title}</span>
                        </div>
                      )}
                      
                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-sm font-sans font-semibold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
