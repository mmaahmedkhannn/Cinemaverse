import { Link } from 'react-router-dom';
import { Search, User, Trophy } from 'lucide-react';
import { useState } from 'react';
import SearchModal from '../ui/SearchModal';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
    <nav className="fixed top-0 w-full z-50 bg-background-dark/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-4">
              <img src="/logo.svg" alt="CinemaDiscovery Logo" className="w-[45px] h-[45px]" />
              <span className="hidden md:block font-bebas text-[22px] font-bold text-primary tracking-[0.1em] uppercase">
                CinemaDiscovery
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-white hover:text-secondary'}`}>Home</Link>
                <Link to="/movies" className={`transition-colors font-sans ${location.pathname.startsWith('/movies') || location.pathname.startsWith('/movie/') ? 'text-primary' : 'text-gray-300 hover:text-white'}`}>Movies</Link>
                <Link to="/tv" className={`transition-colors font-sans ${location.pathname.startsWith('/tv') ? 'text-primary' : 'text-gray-300 hover:text-white'}`}>TV Shows</Link>
                <Link to="/universe" className={`transition-colors font-sans ${location.pathname.startsWith('/universe') ? 'text-primary' : 'text-gray-300 hover:text-white'}`}>Universe</Link>
                <Link to="/timeline" className={`transition-colors font-sans ${location.pathname.startsWith('/timeline') ? 'text-primary' : 'text-gray-300 hover:text-white'}`}>Timeline</Link>
                <Link to="/directors" className={`transition-colors font-sans ${location.pathname.startsWith('/director') ? 'text-primary' : 'text-gray-300 hover:text-white'}`}>Directors</Link>
                <Link to="/battles" className={`transition-colors font-sans ${location.pathname.startsWith('/battles') ? 'text-primary' : 'text-gray-300 hover:text-white'}`}>Battles</Link>
                <Link to="/top100" className={`flex items-center gap-1.5 font-bebas tracking-wide transition-colors ${location.pathname.startsWith('/top100') ? 'text-primary' : 'text-yellow-500 hover:text-yellow-400'}`}>
                  <Trophy className="w-4 h-4" /> TOP 100
                </Link>
              </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-300 hover:text-white p-2 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                if (currentUser) {
                  setIsDropdownOpen(!isDropdownOpen);
                } else {
                  navigate('/auth');
                }
              }}
              className="text-gray-300 hover:text-white p-2 rounded-full transition-colors relative"
            >
              {currentUser && currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="w-7 h-7 rounded-full object-cover border border-white/20"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>
            <AnimatePresence>
              {isDropdownOpen && currentUser && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-48 bg-background-dark border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden z-50 text-left"
                >
                  <div className="px-4 py-2 border-b border-white/10 mb-2">
                    <p className="text-sm text-white font-medium truncate">{currentUser.displayName || 'CinemaDiscovery User'}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    My Profile & Watchlist
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/5 transition-colors mt-2"
                  >
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex overflow-x-auto py-2 px-4 gap-4 bg-background-dark/50 border-t border-white/5 no-scrollbar">
        <Link to="/movies" className={`transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/movies') || location.pathname.startsWith('/movie/') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Movies</Link>
        <Link to="/tv" className={`transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/tv') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>TV Shows</Link>
        <Link to="/universe" className={`transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/universe') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Universe</Link>
        <Link to="/timeline" className={`transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/timeline') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Timeline</Link>
        <Link to="/directors" className={`transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/director') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Directors</Link>
        <Link to="/battles" className={`transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/battles') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Battles</Link>
        <Link to="/top100" className={`flex items-center gap-1 hover:text-yellow-400 font-bebas tracking-wider text-xs whitespace-nowrap ${location.pathname.startsWith('/top100') ? 'text-primary' : 'text-yellow-500 hover:text-yellow-400'}`}><Trophy className="w-3 h-3" /> TOP 100</Link>
      </div>
    </nav>
    <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
