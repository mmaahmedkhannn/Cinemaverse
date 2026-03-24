import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Star, Film, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { Link } from 'react-router-dom';
import { generateSlug } from '../utils/slugify';
import { Helmet } from 'react-helmet-async';

const DECADES = [
  { start: 1900, label: '1900s', theme: { bg: 'from-amber-900 via-[#3e2723] to-black', accent: '#d7ccc8' } },
  { start: 1920, label: '1920s', theme: { bg: 'from-[#f5f5dc] via-[#dcdcdc] to-black', accent: '#1a1a1a' } },
  { start: 1930, label: '1930s', theme: { bg: 'from-yellow-600 via-amber-700 to-black', accent: '#ffd700' } },
  { start: 1950, label: '1950s', theme: { bg: 'from-orange-600 via-red-800 to-black', accent: '#ff8c00' } },
  { start: 1970, label: '1970s', theme: { bg: 'from-[#5d4037] via-[#3e2723] to-black', accent: '#d7ccc8' } },
  { start: 1980, label: '1980s', theme: { bg: 'from-fuchsia-700 via-purple-900 to-black', accent: '#ff00ff' } },
  { start: 1990, label: '1990s', theme: { bg: 'from-teal-800 via-green-900 to-black', accent: '#00ffbf' } },
  { start: 2000, label: '2000s', theme: { bg: 'from-blue-600 via-indigo-900 to-black', accent: '#00bfff' } },
  { start: 2010, label: '2010s', theme: { bg: 'from-gray-300 via-gray-600 to-black', accent: '#ffffff' } },
  { start: 2020, label: '2020s', theme: { bg: 'from-red-900 via-black to-black', accent: '#e50914' } },
];

const MILESTONES: Record<number, string> = {
  1927: '🎬 First "Talkie" — The Jazz Singer',
  1937: '🎨 First Full Animated Film — Snow White',
  1939: '🌈 First Major Technicolor — Wizard of Oz',
  1953: '📽️ First CinemaScope Film — The Robe',
  1968: '⭐ MPAA Rating System Introduced',
  1975: '🦈 First Summer Blockbuster — Jaws',
  1977: '✨ Star Wars Changes Cinema',
  1993: '🦖 First CGI Blockbuster — Jurassic Park',
  1995: '🤖 First Full CGI Film — Toy Story',
  1999: '💊 The Matrix Revolutionizes VFX',
  2009: '🌊 Avatar — 3D Cinema Revolution',
  2019: '🎭 First Streaming Film To Win Oscar Nom',
};

const Timeline = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [activeDecade, setActiveDecade] = useState(0);
  const decadeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const timelineBlocks = DECADES.map((decade, i) => {
    const nextStart = DECADES[i + 1]?.start || 2030;
    const years = [];
    for (let y = decade.start; y < nextStart; y++) {
      if (y <= 2026) years.push(y);
    }
    return { ...decade, years };
  });

  // Enable horizontal scroll with mouse wheel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 2;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Track active decade on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const containerLeft = el.getBoundingClientRect().left;
      for (let i = decadeRefs.current.length - 1; i >= 0; i--) {
        const ref = decadeRefs.current[i];
        if (ref) {
          const rect = ref.getBoundingClientRect();
          if (rect.left <= containerLeft + 200) {
            setActiveDecade(i);
            break;
          }
        }
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToDecade = (index: number) => {
    const ref = decadeRefs.current[index];
    if (ref && scrollRef.current) {
      const containerLeft = scrollRef.current.getBoundingClientRect().left;
      const refLeft = ref.getBoundingClientRect().left;
      scrollRef.current.scrollBy({ left: refLeft - containerLeft, behavior: 'smooth' });
    }
  };

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -500 : 500, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Helmet>
        <title>Cinematic Timeline — CinemaDiscovery</title>
        <meta name="description" content="A journey through 100+ years of cinema history. From the silent era to the streaming age." />
        <link rel="canonical" href="https://cinemadiscovery.com/timeline" />
        <meta property="og:title" content="Cinematic Timeline — CinemaDiscovery" />
        <meta property="og:description" content="A journey through 100+ years of cinema history." />
        <meta property="og:url" content="https://cinemadiscovery.com/timeline" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* ── Sticky Decade Navigation Bar ── */}
      <div className="sticky top-16 z-30 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto no-scrollbar">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="shrink-0 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors mr-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Decade Chips */}
          {DECADES.map((d, i) => (
            <button
              key={d.start}
              onClick={() => scrollToDecade(i)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-sans font-semibold transition-all duration-300 ${
                activeDecade === i
                  ? 'bg-white text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {d.label}
            </button>
          ))}

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="shrink-0 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors ml-2"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Horizontal Scrolling Timeline ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar cursor-grab active:cursor-grabbing"
        style={{ scrollBehavior: 'auto' }}
      >
        <div className="flex h-[calc(100vh-8rem)] min-h-[520px]">
          {timelineBlocks.map((block, blockIdx) => (
            <div
              key={block.start}
              ref={(el) => { decadeRefs.current[blockIdx] = el; }}
              className={`flex shrink-0 bg-gradient-to-br ${block.theme.bg} relative border-r border-white/10 overflow-hidden`}
            >
              {/* Giant watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <h2
                  className="font-bebas text-[18rem] md:text-[24rem] opacity-[0.04]"
                  style={{ color: block.start === 1920 ? 'black' : block.theme.accent }}
                >
                  {block.start}s
                </h2>
              </div>

              {/* Year cards row */}
              <div className="flex gap-5 px-8 py-8 items-center z-10">
                {block.years.map(year => (
                  <YearCard
                    key={year}
                    year={year}
                    milestone={MILESTONES[year]}
                    themeAccent={block.theme.accent}
                    onExpand={() => setExpandedYear(year)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Expanded Year Modal ── */}
      <AnimatePresence>
        {expandedYear && (
          <ExpandedYearModal year={expandedYear} onClose={() => setExpandedYear(null)} />
        )}
      </AnimatePresence>
    </main>
  );
};

/* ── Year Card ── */
const YearCard = ({ year, milestone, themeAccent, onExpand }: { year: number; milestone?: string; themeAccent: string; onExpand: () => void }) => {
  const { data: movies } = useQuery({
    queryKey: ['timeline-year-preview', year],
    queryFn: () => tmdbApi.getTopMoviesByYear(year),
    staleTime: Infinity,
  });

  const previewMovies = movies?.results?.slice(0, 3) || [];
  const totalCount = movies?.total_results || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '200px' }}
      onClick={onExpand}
      className="w-56 shrink-0 bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4 flex flex-col gap-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] group hover:border-white/30 transition-all duration-400 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
    >
      {/* Accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" style={{ backgroundColor: themeAccent + '12' }} />

      {/* Year + Count */}
      <div className="flex justify-between items-center z-10">
        <h3 className="font-bebas text-4xl drop-shadow-lg" style={{ color: themeAccent }}>{year}</h3>
        <span className="text-[10px] font-sans font-bold text-gray-300 bg-white/10 px-2 py-1 rounded-full border border-white/10">
          {totalCount} Films
        </span>
      </div>

      {/* Mini Posters */}
      <div className="flex justify-center py-3 relative z-20 h-40 items-center">
        {previewMovies.map((m: any, i: number) => (
          <div
            key={m.id}
            className="w-20 h-28 rounded-lg shadow-2xl border border-white/20 absolute transition-transform duration-500 group-hover:scale-105 origin-bottom"
            style={{
              transform: `translateX(${(i - 1) * 28}px) rotate(${(i - 1) * 10}deg) scale(${i === 1 ? 1.1 : 0.85})`,
              zIndex: i === 1 ? 30 : 10,
            }}
          >
            {m.poster_path ? (
              <img src={getImageUrl(m.poster_path, 'w500')} alt={m.title} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center border border-white/10">
                <Film className="w-5 h-5 text-gray-700" />
              </div>
            )}
            {m.vote_average > 0 && i === 1 && (
              <div className="absolute -top-2 -right-2 bg-black/90 backdrop-blur-md rounded-full px-1.5 py-0.5 border border-white/20 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                <span className="text-[9px] text-white font-bold">{m.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Milestone */}
      {milestone && (
        <div className="px-3 py-2 bg-white/5 border-l-2 rounded-r-lg text-[11px] font-sans text-gray-200 z-10" style={{ borderColor: themeAccent }}>
          <Sparkles className="w-3 h-3 inline mr-1" style={{ color: themeAccent }} /> {milestone}
        </div>
      )}

      {/* Explore button */}
      <button className="mt-auto w-full py-2.5 bg-white/5 group-hover:bg-white/10 transition-all rounded-xl text-xs font-sans font-bold text-white flex items-center justify-center gap-1.5 border border-white/5 group-hover:border-white/20 z-10">
        <Film className="w-3.5 h-3.5" /> EXPLORE YEAR
      </button>
    </motion.div>
  );
};

/* ── Expanded Year Modal ── */
const ExpandedYearModal = ({ year, onClose }: { year: number; onClose: () => void }) => {
  const { data: movies, isLoading } = useQuery({
    queryKey: ['timeline-year-full', year],
    queryFn: () => tmdbApi.getTopMoviesByYear(year),
    staleTime: Infinity,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
        <h2 className="font-bebas text-5xl text-white">Class of <span className="text-primary">{year}</span></h2>
        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
          <X className="w-8 h-8" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies?.results?.map((movie: any, i: number) => (
              <Link to={`/movie/${movie.id}/${generateSlug(movie.title)}`} key={movie.id} onClick={onClose}>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group">
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 mb-3 relative shadow-2xl">
                    {movie.poster_path ? (
                      <img src={getImageUrl(movie.poster_path)} alt={movie.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600"><Film className="w-8 h-8" /></div>
                    )}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-white font-bold">{movie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-sans font-bold text-gray-200 group-hover:text-primary transition-colors line-clamp-2">{movie.title}</h3>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Timeline;
