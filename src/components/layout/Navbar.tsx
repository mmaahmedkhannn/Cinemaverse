import { Link } from 'react-router-dom';
import { Search, User, Trophy } from 'lucide-react';
import { useState, lazy, Suspense } from 'react';
const SearchModal = lazy(() => import('../ui/SearchModal'));
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

/* ─── Desktop-only nav link helpers ─────────────────────────────────────── */

/** Returns whether a given route path matches the current location */
const isActive = (pathname: string, path: string): boolean => {
  if (path === '/') return pathname === '/';
  if (path === '/movies') return pathname.startsWith('/movies') || pathname.startsWith('/movie/');
  if (path === '/directors') return pathname.startsWith('/director');
  return pathname.startsWith(path);
};

interface NavLinkProps {
  to: string;
  label: string;
  onMouseEnter: () => void;
  active: boolean;
}

/** Standard desktop nav link — crimson underline when active, left→right animated underline on hover */
const DesktopNavLink = ({ to, label, onMouseEnter, active }: NavLinkProps) => (
  <Link
    to={to}
    onMouseEnter={onMouseEnter}
    className={[
      'group relative py-1 text-sm md:text-base font-medium font-sans',
      'transition-colors duration-200',
      active ? 'text-red-600' : 'text-gray-300 hover:text-white',
    ].join(' ')}
  >
    {label}
    {/* Active underline — always visible when active */}
    <span
      className={[
        'absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-red-600',
        'transition-opacity duration-200',
        active ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
    />
    {/* Hover underline — scales from left to right, hidden when active to avoid overlap */}
    {!active && (
      <span
        className={[
          'absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-red-600',
          'origin-left scale-x-0 group-hover:scale-x-100',
          'transition-transform duration-200 ease-out',
        ].join(' ')}
      />
    )}
  </Link>
);

/** TOP 100 desktop nav link — amber-gold styling */
interface Top100LinkProps {
  to: string;
  onMouseEnter: () => void;
  active: boolean;
}

const DesktopTop100Link = ({ to, onMouseEnter, active }: Top100LinkProps) => (
  <Link
    to={to}
    onMouseEnter={onMouseEnter}
    className={[
      'group relative flex items-center gap-1.5 py-1 text-sm md:text-base font-bebas tracking-wide',
      'transition-colors duration-200',
      active ? 'text-red-600' : 'text-[#D4A437] hover:text-[#E5B84A]',
    ].join(' ')}
  >
    <Trophy
      className={[
        'w-4 h-4 transition-all duration-300',
        active ? 'text-red-600' : 'text-[#D4A437] group-hover:text-[#E5B84A] group-hover:drop-shadow-[0_0_4px_rgba(212,164,55,0.55)]',
      ].join(' ')}
    />
    TOP 100
    {/* Active underline */}
    <span
      className={[
        'absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-red-600',
        'transition-opacity duration-200',
        active ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
    />
    {/* Hover underline */}
    {!active && (
      <span
        className={[
          'absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#D4A437]',
          'origin-left scale-x-0 group-hover:scale-x-100',
          'transition-transform duration-200 ease-out',
        ].join(' ')}
      />
    )}
  </Link>
);

/* ─── Navbar ─────────────────────────────────────────────────────────────── */

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/auth') return null;

  const preloadRoute = (path: string) => {
    switch(path) {
      case '/': import('../../pages/Home'); break;
      case '/movies': import('../../pages/Movies'); break;
      case '/tv': import('../../pages/TvShows'); break;
      case '/universe': import('../../pages/Universe'); break;
      case '/timeline': import('../../pages/Timeline'); break;
      case '/directors': import('../../pages/Directors'); break;
      case '/battles': import('../../pages/Battles'); break;
      case '/top100': import('../../pages/Top100'); break;
    }
  };

  return (
    <>
    {/* ── Glass header ─────────────────────────────────────────────────── */}
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-red-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ───────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="group flex items-center gap-4">
              {/* Circle logo — hover glow handled via CSS filter on the img */}
              <img
                src="/logo.svg"
                alt="CinemaDiscovery Logo"
                className="w-[45px] h-[45px] md:w-[52px] md:h-[52px] transition-[filter] duration-200 group-hover:drop-shadow-[0_0_8px_rgba(225,29,72,0.45)]"
              />
              {/* Wordmark — gradient crimson, Bebas Neue, premium tracking */}
              <span
                className="hidden md:block font-bebas text-[22px] md:text-[26px] font-bold tracking-[0.08em] uppercase bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #E11D48 0%, #BE123C 100%)',
                }}
              >
                CinemaDiscovery
              </span>
            </Link>
          </div>

          {/* ── Desktop nav links (md: and up only) ────────────────────── */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-10">
              <DesktopNavLink to="/"          label="Home"      onMouseEnter={() => preloadRoute('/')}          active={isActive(location.pathname, '/')} />
              <DesktopNavLink to="/movies"    label="Movies"    onMouseEnter={() => preloadRoute('/movies')}    active={isActive(location.pathname, '/movies')} />
              <DesktopNavLink to="/tv"        label="TV Shows"  onMouseEnter={() => preloadRoute('/tv')}        active={isActive(location.pathname, '/tv')} />
              <DesktopNavLink to="/universe"  label="Universe"  onMouseEnter={() => preloadRoute('/universe')}  active={isActive(location.pathname, '/universe')} />
              <DesktopNavLink to="/timeline"  label="Timeline"  onMouseEnter={() => preloadRoute('/timeline')}  active={isActive(location.pathname, '/timeline')} />
              <DesktopNavLink to="/directors" label="Directors" onMouseEnter={() => preloadRoute('/directors')} active={isActive(location.pathname, '/directors')} />
              <DesktopNavLink to="/battles"   label="Battles"   onMouseEnter={() => preloadRoute('/battles')}   active={isActive(location.pathname, '/battles')} />
              <DesktopTop100Link to="/top100" onMouseEnter={() => preloadRoute('/top100')} active={isActive(location.pathname, '/top100')} />
            </div>
          </div>

          {/* ── Right-side icons ───────────────────────────────────────── */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-300 hover:text-white hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User / profile */}
            <div className="relative flex items-center">
              <button
                onClick={() => {
                  if (loading) return;
                  if (currentUser) {
                    setIsDropdownOpen(!isDropdownOpen);
                  } else {
                    navigate('/auth');
                  }
                }}
                className="text-gray-300 hover:text-white hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors duration-200 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400 border-t-transparent animate-spin mx-auto"></div>
                ) : currentUser && currentUser.photoURL ? (
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
                      My Profile &amp; Watchlist
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
      </div>

      {/* ── Mobile scrollable nav (md:hidden — UNCHANGED from commit 25 + a0daed8) ── */}
      <div
        className="md:hidden flex overflow-x-auto py-2 pl-4 gap-4 bg-background-dark/50 border-t border-white/5 no-scrollbar snap-x scroll-pl-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <Link to="/movies" className={`snap-start transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/movies') || location.pathname.startsWith('/movie/') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Movies</Link>
        <Link to="/tv" className={`snap-start transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/tv') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>TV Shows</Link>
        <Link to="/universe" className={`snap-start transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/universe') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Universe</Link>
        <Link to="/timeline" className={`snap-start transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/timeline') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Timeline</Link>
        <Link to="/directors" className={`snap-start transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/director') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Directors</Link>
        <Link to="/battles" className={`snap-start transition-colors text-xs font-sans whitespace-nowrap ${location.pathname.startsWith('/battles') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Battles</Link>
        <Link to="/top100" className={`snap-start pr-4 flex items-center gap-1 hover:text-yellow-400 font-bebas tracking-wider text-xs whitespace-nowrap ${location.pathname.startsWith('/top100') ? 'text-primary' : 'text-yellow-500 hover:text-yellow-400'}`}><Trophy className="w-3 h-3" /> TOP 100</Link>
      </div>
    </nav>
    <Suspense fallback={null}>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </Suspense>
    </>
  );
};

export default Navbar;
