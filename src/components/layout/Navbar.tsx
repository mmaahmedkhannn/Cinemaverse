import { Link } from 'react-router-dom';
import { Search, User, Trophy } from 'lucide-react';
import {
  useState,
  lazy,
  Suspense,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
const SearchModal = lazy(() => import('../ui/SearchModal'));
import { useAuth } from '../../contexts/AuthContext';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
  useAnimate,
  animate,
  type Variants,
} from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface NavItem {
  to: string;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',          label: 'Home',      path: '/'          },
  { to: '/movies',    label: 'Movies',    path: '/movies'    },
  { to: '/tv',        label: 'TV Shows',  path: '/tv'        },
  { to: '/universe',  label: 'Universe',  path: '/universe'  },
  { to: '/timeline',  label: 'Timeline',  path: '/timeline'  },
  { to: '/directors', label: 'Directors', path: '/directors' },
  { to: '/battles',   label: 'Battles',   path: '/battles'   },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const isActive = (pathname: string, path: string): boolean => {
  if (path === '/') return pathname === '/';
  if (path === '/movies') return pathname.startsWith('/movies') || pathname.startsWith('/movie/');
  if (path === '/directors') return pathname.startsWith('/director');
  return pathname.startsWith(path);
};

const isTop100Active = (pathname: string) => pathname.startsWith('/top100');

/* ─── Wordmark letters ───────────────────────────────────────────────────── */

const WORD = 'CinemaDiscovery'.split('');

/* ─── Navbar ─────────────────────────────────────────────────────────────── */

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen]   = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, logout, loading }  = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const prefersReduced = useReducedMotion();

  /* ── Scroll compression ─────────────────────────────────────────────── */
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 40);
  });

  /* ── Morphing underline — imperative, zero re-renders on hover ────────── */
  const navContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs        = useRef<(HTMLAnchorElement | null)[]>([]);
  const top100Ref       = useRef<HTMLAnchorElement | null>(null);

  // The single underline element, controlled imperatively
  const [underlineRef, animateUnderline] = useAnimate();

  // Last-known active position — used to return on mouseleave
  const activePos = useRef<{ left: number; width: number } | null>(null);
  // Whether the underline has been placed at least once (avoids initial flicker)
  const underlineReady = useRef(false);

  // Measure a link relative to the nav container
  const measureLink = useCallback(
    (el: HTMLElement | null): { left: number; width: number } | null => {
      if (!el || !navContainerRef.current) return null;
      const cRect = navContainerRef.current.getBoundingClientRect();
      const lRect = el.getBoundingClientRect();
      return { left: lRect.left - cRect.left, width: lRect.width };
    },
    []
  );

  // Move underline to a position — fast path (hover) or slow path (route change)
  const moveUnderline = useCallback(
    (pos: { left: number; width: number } | null, fast: boolean) => {
      if (prefersReduced || !underlineRef.current || !pos) return;
      // First placement: snap immediately, no animation
      if (!underlineReady.current) {
        animate(underlineRef.current, { left: pos.left, width: pos.width, opacity: 1 }, { duration: 0 });
        underlineReady.current = true;
        return;
      }
      animateUnderline(
        underlineRef.current,
        { left: pos.left, width: pos.width, opacity: 1 },
        fast
          ? { duration: 0.15, ease: 'easeOut' }
          : { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
      );
    },
    [prefersReduced, underlineRef, animateUnderline]
  );

  // Update active underline position on route change
  useLayoutEffect(() => {
    if (prefersReduced) return;
    let activeEl: HTMLElement | null = null;

    NAV_ITEMS.forEach((item, i) => {
      if (isActive(location.pathname, item.path)) activeEl = linkRefs.current[i];
    });
    if (isTop100Active(location.pathname)) activeEl = top100Ref.current;

    requestAnimationFrame(() => {
      const pos = measureLink(activeEl);
      activePos.current = pos;
      if (pos) {
        moveUnderline(pos, false);
      } else if (underlineRef.current) {
        animate(underlineRef.current, { opacity: 0 }, { duration: 0.15 });
      }
    });
  }, [location.pathname, measureLink, moveUnderline, prefersReduced, underlineRef]);

  // Hover enter: move underline directly (no setState, no re-render)
  const onLinkHover = useCallback(
    (el: HTMLElement | null) => {
      if (prefersReduced) return;
      const pos = measureLink(el);
      if (pos) moveUnderline(pos, true);
    },
    [measureLink, moveUnderline, prefersReduced]
  );

  // Hover leave: snap back to active position
  const onLinkLeave = useCallback(() => {
    if (prefersReduced) return;
    if (activePos.current) {
      moveUnderline(activePos.current, true);
    } else if (underlineRef.current) {
      animate(underlineRef.current, { opacity: 0 }, { duration: 0.1 });
    }
  }, [activePos, moveUnderline, prefersReduced, underlineRef]);

  /* ── Logo reveal (one-time per session) ────────────────────────────── */
  const hasAnimated = useRef(false);
  const [logoRevealed, setLogoRevealed] = useState(prefersReduced ? true : false);

  useEffect(() => {
    if (prefersReduced) { setLogoRevealed(true); return; }
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    // Reveal fires on first mount only
    const t = setTimeout(() => setLogoRevealed(true), 50);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Trophy glint ───────────────────────────────────────────────────── */
  const glintRef   = useRef<HTMLSpanElement | null>(null);
  const glintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runGlint = useCallback(() => {
    if (prefersReduced || !glintRef.current) return;
    animate(glintRef.current, { x: ['−150%', '150%'] }, { duration: 1.2, ease: 'easeInOut' });
    glintTimer.current = setTimeout(runGlint, 10_000);
  }, [prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;
    glintTimer.current = setTimeout(runGlint, 10_000);
    return () => { if (glintTimer.current) clearTimeout(glintTimer.current); };
  }, [runGlint, prefersReduced]);

  /* ── Auth guard ─────────────────────────────────────────────────────── */
  if (location.pathname === '/auth') return null;

  /* ── Preload ────────────────────────────────────────────────────────── */
  const preloadRoute = (path: string) => {
    switch (path) {
      case '/':          import('../../pages/Home');      break;
      case '/movies':    import('../../pages/Movies');    break;
      case '/tv':        import('../../pages/TvShows');   break;
      case '/universe':  import('../../pages/Universe');  break;
      case '/timeline':  import('../../pages/Timeline');  break;
      case '/directors': import('../../pages/Directors'); break;
      case '/battles':   import('../../pages/Battles');   break;
      case '/top100':    import('../../pages/Top100');    break;
    }
  };

  /* ── Scroll-aware CSS values ────────────────────────────────────────── */
  const navHeight       = scrolled ? 'h-16' : 'h-16 md:h-20';
  const bgClass         = scrolled ? 'bg-black/95 backdrop-blur-xl' : 'bg-black/80 backdrop-blur-md';
  const borderClass     = scrolled ? 'border-red-900/50' : 'border-red-900/30';
  const logoScale       = scrolled ? 'scale-[0.92]' : 'scale-100';
  const transitionClass = 'transition-all duration-[250ms] cubic-bezier(0.4,0,0.2,1)';

  /* ── Logo variants ──────────────────────────────────────────────────── */
  const circleVariants = prefersReduced ? undefined : {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 260, damping: 22, duration: 0.45 },
    },
  };

  const wordmarkContainerVariants = prefersReduced ? undefined : {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { delayChildren: 0.08, staggerChildren: 0.03 } },
  };

  const letterVariants: Variants | undefined = prefersReduced ? undefined : {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: 'easeOut' as const } },
  };

  /* ── Displayed underline: remove old state-based computation ────────── */
  // (underline position is now driven imperatively via useAnimate)

  return (
    <>
      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav
        className={[
          'fixed top-0 w-full z-50 border-b',
          bgClass,
          borderClass,
          transitionClass,
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={['flex items-center justify-between', navHeight, transitionClass].join(' ')}>

            {/* ── Logo ──────────────────────────────────────────────── */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="group flex items-center gap-4">
                {/* CD circle — spring reveal + hover glow */}
                <motion.img
                  src="/logo.svg"
                  alt="CinemaDiscovery Logo"
                  variants={circleVariants}
                  initial={prefersReduced ? false : (logoRevealed ? 'visible' : 'hidden')}
                  animate={prefersReduced ? undefined : (logoRevealed ? 'visible' : 'hidden')}
                  className={[
                    'w-[45px] h-[45px] md:w-[52px] md:h-[52px]',
                    'transition-[filter,transform] duration-200',
                    'group-hover:drop-shadow-[0_0_10px_rgba(225,29,72,0.45)]',
                    logoScale,
                    transitionClass,
                  ].join(' ')}
                  style={{ willChange: 'transform' }}
                />

                {/* Wordmark — letter cascade reveal + hover letter-spacing expand */}
                <motion.span
                  aria-label="CinemaDiscovery"
                  variants={wordmarkContainerVariants}
                  initial={prefersReduced ? false : (logoRevealed ? 'visible' : 'hidden')}
                  animate={prefersReduced ? undefined : (logoRevealed ? 'visible' : 'hidden')}
                  className={[
                    'hidden md:flex font-bebas text-[22px] md:text-[26px] font-bold uppercase',
                    'bg-clip-text text-transparent overflow-hidden',
                    logoScale,
                    transitionClass,
                  ].join(' ')}
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #E11D48 0%, #BE123C 100%)',
                    willChange: 'transform',
                  }}
                  whileHover={prefersReduced ? undefined : { letterSpacing: '0.18em' }}
                  transition={{ duration: 0.4, ease: 'easeInOut' as const }}
                  // Base letter-spacing from prior polish
                  data-tracking="0.08em"
                >
                  {WORD.map((char, i) => (
                    <motion.span
                      key={i}
                      aria-hidden="true"
                      variants={letterVariants}
                      style={{ display: 'inline-block' }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
              </Link>
            </div>

            {/* ── Desktop nav links ─────────────────────────────────── */}
            <div className="hidden md:block">
              {/* Relative container so morphing underline can be absolutely positioned */}
              <div
                ref={navContainerRef}
                className="ml-10 flex items-baseline space-x-10 relative pb-[6px]"
              >
                {/* Single imperative underline element — positioned by useAnimate, never by React state */}
                {!prefersReduced && (
                  <motion.div
                    ref={underlineRef}
                    className="absolute bottom-0 h-[2px] rounded-full bg-red-600 pointer-events-none"
                    initial={{ opacity: 0, left: 0, width: 0 }}
                    style={{ willChange: 'left, width' }}
                  />
                )}

                {/* Standard nav items */}
                {NAV_ITEMS.map((item, i) => {
                  const active = isActive(location.pathname, item.path);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      ref={(el) => { linkRefs.current[i] = el; }}
                      onMouseEnter={() => {
                        preloadRoute(item.path);
                        onLinkHover(linkRefs.current[i]);
                      }}
                      onMouseLeave={onLinkLeave}
                      className={[
                        'relative py-1 text-sm md:text-base font-medium font-sans',
                        'transition-colors duration-200',
                        active ? 'text-red-600' : 'text-gray-300 hover:text-white',
                        // Fallback static underline when reduced motion
                        prefersReduced && active
                          ? 'underline decoration-red-600 decoration-2 underline-offset-4'
                          : '',
                      ].join(' ')}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {/* TOP 100 */}
                {(() => {
                  const active = isTop100Active(location.pathname);
                  return (
                    <Link
                      to="/top100"
                      ref={top100Ref}
                      onMouseEnter={() => {
                        preloadRoute('/top100');
                        onLinkHover(top100Ref.current);
                      }}
                      onMouseLeave={onLinkLeave}
                      className={[
                        'group/top relative flex items-center gap-1.5 py-1 text-sm md:text-base font-bebas tracking-wide overflow-hidden',
                        'transition-colors duration-200',
                        active ? 'text-red-600' : 'text-[#D4A437] hover:text-[#E5B84A]',
                        prefersReduced && active
                          ? 'underline decoration-red-600 decoration-2 underline-offset-4'
                          : '',
                      ].join(' ')}
                    >
                      {/* Trophy + glint container */}
                      <span className="relative inline-flex items-center overflow-hidden">
                        <Trophy
                          className={[
                            'w-4 h-4 transition-all duration-300',
                            active
                              ? 'text-red-600'
                              : 'text-[#D4A437] group-hover/top:text-[#E5B84A] group-hover/top:drop-shadow-[0_0_4px_rgba(212,164,55,0.55)]',
                          ].join(' ')}
                        />
                        {/* Gold glint sweep */}
                        {!prefersReduced && (
                          <span
                            ref={glintRef}
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background:
                                'linear-gradient(90deg, transparent 0%, rgba(212,164,55,0.4) 50%, transparent 100%)',
                              transform: 'translateX(-150%)',
                            }}
                          />
                        )}
                      </span>
                      TOP 100
                    </Link>
                  );
                })()}
              </div>
            </div>

            {/* ── Right icons ───────────────────────────────────────── */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-300 hover:text-white hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
              >
                <motion.span
                  className="flex items-center justify-center"
                  whileHover={prefersReduced ? undefined : {
                    rotate: 12,
                    scale: 1.08,
                  }}
                  transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{ willChange: 'transform' }}
                >
                  <Search className="w-5 h-5" />
                </motion.span>
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
                  <motion.span
                    className="flex items-center justify-center"
                    whileHover={prefersReduced ? undefined : {
                      rotate: 12,
                      scale: 1.08,
                    }}
                    transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{ willChange: 'transform' }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-400 border-t-transparent animate-spin mx-auto" />
                    ) : currentUser && currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-7 h-7 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </motion.span>
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
                        <p className="text-sm text-white font-medium truncate">
                          {currentUser.displayName || 'CinemaDiscovery User'}
                        </p>
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
