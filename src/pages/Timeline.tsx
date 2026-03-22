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
        <div className="flex flex-row h-full min-h-[80vh] w-max">
          {timelineBlocks.map((block) => (
            <div 
              key={block.start} 
              className={`flex flex-row bg-gradient-to-br ${block.theme.bg} relative p-8 md:p-16 shrink-0 border-r border-white/10 overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black/50 pointer-events-none mix-blend-multiply" />
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <h2 
                  className="font-bebas text-[25rem] md:text-[35rem] opacity-5 md:opacity-10 drop-shadow-2xl translate-x-10"
                  style={{ color: block.start === 1920 ? 'black' : block.theme.accent }}
                >
                  {block.start}s
                </h2>
              </div>

              {/* Years Grid inside Decade */}
              <div className="flex flex-row gap-8 z-10 w-max items-center">
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
      className="w-80 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col gap-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] shrink-0 group hover:border-white/30 transition-all duration-500 hover:-translate-y-2 cursor-pointer relative overflow-hidden"
      onClick={onExpand}
    >
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-700 pointer-events-none" style={{ backgroundColor: themeAccent + '15' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl -ml-10 -mb-10 transition-colors duration-700 pointer-events-none opacity-0 group-hover:opacity-50" style={{ backgroundColor: themeAccent + '10' }} />
      
      <div className="flex justify-between items-center z-10 relative">
        <h3 className="font-bebas text-6xl drop-shadow-xl" style={{ color: themeAccent }}>{year}</h3>
        <span className="text-xs font-sans font-bold text-gray-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
          {totalCount} Films
        </span>
      </div>

      {/* Mini Posters Fanned Layout */}
      <div className="flex justify-center py-6 relative z-20 h-56 items-center">
        {previewMovies.map((m: any, i: number) => (
          <div 
            key={m.id} 
            className="w-24 h-36 rounded-lg shadow-2xl border border-white/20 absolute transition-all duration-500 ease-out group-hover:scale-110 origin-bottom" 
            style={{ 
              transform: `translateX(${(i - 1) * 35}px) rotate(${(i - 1) * 12}deg) scale(${i === 1 ? 1.15 : 0.9})`, 
              zIndex: i === 1 ? 30 : 10 
            }}
          >
            {m.poster_path ? (
              <img src={getImageUrl(m.poster_path, 'w500')} alt={m.title} className="w-full h-full object-cover rounded-lg" />
            ) : <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center border border-white/10"><Film className="w-6 h-6 text-gray-700" /></div>}
            {m.vote_average > 0 && i === 1 && (
              <div className="absolute -top-3 -right-3 bg-black/90 backdrop-blur-md rounded-full px-2 py-1 border border-white/20 flex items-center gap-1 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] text-white font-bold">{m.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {milestone ? (
        <div className="mt-auto px-4 py-3 bg-gradient-to-r from-white/10 to-transparent border-l-4 rounded-r-xl text-sm font-sans text-gray-100 backdrop-blur-md z-10 font-medium shadow-lg" style={{ borderColor: themeAccent }}>
          <Sparkles className="w-4 h-4 inline mr-2 drop-shadow-md" style={{ color: themeAccent }} /> {milestone}
        </div>
      ) : (
        <div className="mt-auto h-[44px]" />
      )}

      <button className="mt-2 w-full py-4 bg-white/5 group-hover:bg-white/15 transition-all duration-300 rounded-2xl text-sm font-sans font-bold text-white flex items-center justify-center gap-2 border border-white/5 group-hover:border-white/20 z-10 backdrop-blur-md shadow-lg group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
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
