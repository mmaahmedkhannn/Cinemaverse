import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Star, Film, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { Link } from 'react-router-dom';
import { generateSlug } from '../utils/slugify';
import { Helmet } from 'react-helmet-async';

const DECADES = [
  { start: 1900, label: '1900s', theme: { bg: 'from-amber-900 via-[#3e2723] to-black', accent: '#d7ccc8', text: 'Sepia / The Birth of Cinema' } },
  { start: 1920, label: '1920s', theme: { bg: 'from-[#f5f5dc] via-[#dcdcdc] to-black', accent: '#1a1a1a', text: 'Cream / Silent Era Art Deco' } },
  { start: 1930, label: '1930s & 40s', theme: { bg: 'from-yellow-600 via-amber-700 to-black', accent: '#ffd700', text: 'Golden Yellow / Classic Hollywood' } },
  { start: 1950, label: '1950s & 60s', theme: { bg: 'from-orange-600 via-red-800 to-black', accent: '#ff8c00', text: 'Warm Orange / Retro Style' } },
  { start: 1970, label: '1970s', theme: { bg: 'from-[#5d4037] via-[#3e2723] to-black', accent: '#d7ccc8', text: 'Gritty Brown / New Hollywood' } },
  { start: 1980, label: '1980s', theme: { bg: 'from-fuchsia-700 via-purple-900 to-black', accent: '#ff00ff', text: 'Neon Pink / Synthwave Aesthetic' } },
  { start: 1990, label: '1990s', theme: { bg: 'from-teal-800 via-green-900 to-black', accent: '#00ffbf', text: 'Green / Grunge VHS Style' } },
  { start: 2000, label: '2000s', theme: { bg: 'from-blue-600 via-indigo-900 to-black', accent: '#00bfff', text: 'Blue / Digital Era' } },
  { start: 2010, label: '2010s', theme: { bg: 'from-gray-300 via-gray-600 to-black', accent: '#ffffff', text: 'Sharp White / Modern' } },
  { start: 2020, label: '2020s', theme: { bg: 'from-red-900 via-black to-black', accent: '#e50914', text: 'Deep Red / Streaming Era' } },
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

  // Group years into blocks by decade definitions
  const timelineBlocks = DECADES.map((decade, i) => {
    const nextStart = DECADES[i + 1]?.start || 2030;
    const years = [];
    for (let y = decade.start; y < nextStart; y++) {
      if (y <= 2026) years.push(y);
    }
    return { ...decade, years };
  });

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -600, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 600, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black pt-20 flex flex-col overflow-hidden relative">
      <Helmet>
        <title>Cinematic Timeline — CinemaDiscovery</title>
        <meta name="description" content="A journey through 100+ years of cinema history. From the silent era to the streaming age." />
      </Helmet>
      
      {/* Film Reel Decorative Header */}
      <div className="w-full h-8 bg-black flex items-center justify-around overflow-hidden opacity-30 border-b border-white/10 shrink-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="w-4 h-6 bg-white/20 rounded-[2px]" />
        ))}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto hide-scrollbar relative" ref={scrollRef}>
        <div className="flex flex-col md:flex-row h-full min-h-[80vh] md:w-max">
          {timelineBlocks.map((block) => (
            <div 
              key={block.start} 
              className={`flex flex-col md:flex-row bg-gradient-to-br ${block.theme.bg} relative p-8 md:p-12 shrink-0 border-r border-white/10`}
            >
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />
              
              {/* Decade Title Sideways on Desktop */}
              <div className="md:w-32 shrink-0 flex items-start md:items-center justify-start z-10 mb-8 md:mb-0">
                <h2 
                  className="font-bebas text-6xl md:text-8xl md:-rotate-90 origin-center whitespace-nowrap"
                  style={{ color: block.start === 1920 ? 'black' : block.theme.accent }}
                >
                  {block.label}
                </h2>
              </div>

              {/* Years Grid inside Decade */}
              <div className="flex flex-col md:flex-row gap-6 z-10 md:w-max">
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

      {/* Floating Scroll Controls */}
      <div className="fixed bottom-10 right-10 flex gap-4 z-40 hidden md:flex">
        <button onClick={scrollLeft} className="w-14 h-14 bg-black/80 backdrop-blur border border-white/20 rounded-full flex justify-center items-center hover:bg-white/10 hover:border-white transition-all text-white shadow-2xl">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button onClick={scrollRight} className="w-14 h-14 bg-black/80 backdrop-blur border border-white/20 rounded-full flex justify-center items-center hover:bg-white/10 hover:border-white transition-all text-white shadow-2xl">
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Expanded Year Modal */}
      <AnimatePresence>
        {expandedYear && (
          <ExpandedYearModal year={expandedYear} onClose={() => setExpandedYear(null)} />
        )}
      </AnimatePresence>

      {/* Film Reel Decorative Footer */}
      <div className="w-full h-8 bg-black flex items-center justify-around overflow-hidden opacity-30 border-t border-white/10 shrink-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="w-4 h-6 bg-white/20 rounded-[2px]" />
        ))}
      </div>
    </div>
  );
};

// Year Card Child Component
const YearCard = ({ year, milestone, themeAccent, onExpand }: { year: number, milestone?: string, themeAccent: string, onExpand: () => void }) => {
  const { data: movies } = useQuery({
    queryKey: ['timeline-year-preview', year],
    queryFn: () => tmdbApi.getTopMoviesByYear(year),
    staleTime: Infinity
  });

  const previewMovies = movies?.results?.slice(0, 3) || [];
  const totalCount = movies?.total_results || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "200px" }}
      className="w-72 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col gap-4 shadow-xl shrink-0 group hover:border-white/30 transition-colors cursor-pointer"
      onClick={onExpand}
    >
      <div className="flex justify-between items-center bg-black/40 -mx-5 -mt-5 px-5 py-4 border-b border-white/10 rounded-t-2xl">
        <h3 className="font-bebas text-5xl" style={{ color: themeAccent }}>{year}</h3>
        <span className="text-xs font-sans text-gray-400 bg-white/10 px-2 py-1 rounded border border-white/5">
          {totalCount} Films
        </span>
      </div>

      {/* Mini Posters */}
      <div className="flex -space-x-4 justify-center py-4 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden group-hover:bg-white/10 transition-colors">
        {previewMovies.map((m: any, i: number) => (
          <div key={m.id} className="w-20 h-28 rounded shadow-2xl border-2 border-black relative z-10" style={{ transform: `rotate(${i === 0 ? '-10deg' : i === 2 ? '10deg' : '0deg'}) scale(${i === 1 ? 1.1 : 1})`, zIndex: i === 1 ? 20 : 10 }}>
            {m.poster_path ? (
              <img src={getImageUrl(m.poster_path, 'w500')} alt={m.title} className="w-full h-full object-cover" />
            ) : <div className="w-full h-full bg-gray-800" />}
          </div>
        ))}
      </div>

      {milestone && (
        <div className="mt-auto px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-transparent border-l-2 border-yellow-500 rounded text-xs font-sans text-gray-200">
          <Sparkles className="w-3 h-3 inline mr-1 text-yellow-500" /> {milestone}
        </div>
      )}

      <button className="mt-auto w-full py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-sm font-sans font-bold text-white flex items-center justify-center gap-2">
        <Film className="w-4 h-4" /> EXPLORE YEAR
      </button>
    </motion.div>
  );
};

// Expanded Full Screen Modal
const ExpandedYearModal = ({ year, onClose }: { year: number, onClose: () => void }) => {
  const { data: movies, isLoading } = useQuery({
    queryKey: ['timeline-year-full', year],
    queryFn: () => tmdbApi.getTopMoviesByYear(year),
    staleTime: Infinity
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col"
    >
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
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 mb-3 relative shadow-2xl">
                    {movie.poster_path ? (
                      <img src={getImageUrl(movie.poster_path)} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Film className="w-8 h-8" />
                      </div>
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
