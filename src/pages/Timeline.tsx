import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Star, Film, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { generateSlug } from '../utils/slugify';

const DECADES = [
  { start: 1900, label: '1900s', theme: { bg: 'from-amber-900/40 to-yellow-950/20', accent: '#704214', text: 'The Birth of Cinema' } },
  { start: 1910, label: '1910s', theme: { bg: 'from-amber-900/40 to-yellow-950/20', accent: '#704214', text: 'Early Epics' } },
  { start: 1920, label: '1920s', theme: { bg: 'from-amber-900/40 to-yellow-950/20', accent: '#f5f5dc', text: 'Silent Era' } },
  { start: 1930, label: '1930s', theme: { bg: 'from-yellow-600/30 to-amber-600/20', accent: '#ffd700', text: 'Golden Age Begins' } },
  { start: 1940, label: '1940s', theme: { bg: 'from-yellow-600/30 to-amber-600/20', accent: '#ffd700', text: 'War & Noir' } },
  { start: 1950, label: '1950s', theme: { bg: 'from-yellow-600/30 to-amber-600/20', accent: '#ffd700', text: 'Hollywood Glamour' } },
  { start: 1960, label: '1960s', theme: { bg: 'from-orange-600/30 to-red-600/20', accent: '#ff8c00', text: 'New Wave' } },
  { start: 1970, label: '1970s', theme: { bg: 'from-orange-600/30 to-red-600/20', accent: '#ff8c00', text: 'New Hollywood' } },
  { start: 1980, label: '1980s', theme: { bg: 'from-fuchsia-600/40 to-cyan-600/30', accent: '#ff00ff', text: 'Neon Synthwave' } },
  { start: 1990, label: '1990s', theme: { bg: 'from-green-900/40 to-gray-800/40', accent: '#00ff00', text: 'VHS Grunge' } },
  { start: 2000, label: '2000s', theme: { bg: 'from-blue-600/40 to-indigo-600/30', accent: '#00bfff', text: 'Digital Blue' } },
  { start: 2010, label: '2010s', theme: { bg: 'from-slate-400/20 to-gray-200/10', accent: '#ffffff', text: 'Sharp Modern' } },
  { start: 2020, label: '2020s', theme: { bg: 'from-gray-900/80 to-black', accent: '#8b0000', text: 'Sleek Dark' } },
];

const MILESTONES: Record<number, string> = {
  1927: '🎬 First "Talkie" — The Jazz Singer',
  1937: '🎨 First Full-Length Animated Film — Snow White',
  1939: '🌈 First Major Technicolor Film — The Wizard of Oz',
  1953: '📽️ First CinemaScope Film — The Robe',
  1968: '⭐ MPAA Rating System Introduced',
  1975: '🦈 First Summer Blockbuster — Jaws',
  1977: '✨ Star Wars Changes Cinema Forever',
  1993: '🦖 First CGI Blockbuster — Jurassic Park',
  1995: '🤖 First Full CGI Film — Toy Story',
  1999: '💊 The Matrix Revolutionizes VFX',
  2009: '🌊 Avatar — 3D Cinema Revolution',
  2019: '🎭 First Streaming Film to Win Oscar Nom — Roma',
};

const Timeline = () => {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  const { data: yearMovies, isLoading: loadingYear } = useQuery({
    queryKey: ['timeline-year', expandedYear],
    queryFn: () => tmdbApi.getTopMoviesByYear(expandedYear!),
    enabled: expandedYear !== null,
  });

  const getDecade = (year: number) => DECADES.find(d => year >= d.start && year < d.start + 10);

  return (
    <div className="min-h-screen bg-background-dark pt-20 pb-20">
      <Helmet>
        <title>Cinematic Timeline — CinemaDiscovery</title>
        <meta name="description" content="A journey through 100+ years of cinema history. From the silent era to the streaming age." />
        <link rel="canonical" href="https://cinemadiscovery.com/timeline" />
      </Helmet>
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-bebas text-6xl md:text-8xl text-white tracking-wider mb-4">
            Cinematic <span className="text-primary">Timeline</span>
          </h1>
          <p className="text-gray-400 text-lg font-sans max-w-2xl mx-auto">
            A journey through 100+ years of cinema history. From the silent era to the streaming age.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          {DECADES.map((decade, di) => (
            <motion.div
              key={decade.start}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: di * 0.05 }}
              className="mb-16"
            >
              {/* Decade Header */}
              <div className={`relative flex items-center mb-8 ${di % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-2 -translate-x-1/2 z-10" 
                     style={{ borderColor: decade.theme.accent, backgroundColor: decade.theme.accent }} />
                <div className={`ml-20 md:ml-0 ${di % 2 === 0 ? 'md:mr-auto md:pr-16 md:text-right md:w-1/2' : 'md:ml-auto md:pl-16 md:w-1/2'}`}>
                  <h2 className="font-bebas text-5xl tracking-wider" style={{ color: decade.theme.accent }}>
                    {decade.label}
                  </h2>
                  <p className="text-gray-400 font-sans text-sm mt-1">{decade.theme.text}</p>
                </div>
              </div>

              {/* Years in decade */}
              <div className="ml-20 md:ml-0 grid grid-cols-2 md:grid-cols-5 gap-2 max-w-4xl mx-auto">
                {Array.from({ length: 10 }, (_, i) => decade.start + i).map((year) => {
                  const milestone = MILESTONES[year];
                  const isExpanded = expandedYear === year;

                  return (
                    <div key={year}>
                      <button
                        onClick={() => setExpandedYear(isExpanded ? null : year)}
                        className={`w-full px-3 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all duration-300 flex items-center justify-between gap-1 ${
                          isExpanded
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
                        } ${milestone ? 'ring-1' : ''}`}
                        style={milestone ? { borderColor: decade.theme.accent } : {}}
                      >
                        <span>{year}</span>
                        {milestone && <Sparkles className="w-3 h-3" style={{ color: decade.theme.accent }} />}
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Expanded Year Movies */}
              <AnimatePresence>
                {expandedYear !== null && getDecade(expandedYear) === decade && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden ml-20 md:ml-0 max-w-5xl mx-auto mt-6"
                  >
                    {MILESTONES[expandedYear] && (
                      <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                        <p className="text-sm font-sans" style={{ color: decade.theme.accent }}>
                          {MILESTONES[expandedYear]}
                        </p>
                      </div>
                    )}

                    <h3 className="font-bebas text-2xl text-white mb-4 flex items-center gap-2">
                      <Film className="w-5 h-5 text-primary" /> Top Movies of {expandedYear}
                    </h3>

                    {loadingYear ? (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {yearMovies?.results?.slice(0, 10).map((movie: any, mi: number) => (
                          <Link to={`/movie/${movie.id}/${generateSlug(movie.title)}`} key={movie.id}>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: mi * 0.05 }}
                              className="group"
                            >
                              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-2 relative">
                                {movie.poster_path ? (
                                  <img src={getImageUrl(movie.poster_path)} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <Film className="w-8 h-8" />
                                  </div>
                                )}
                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-white font-bold">{movie.vote_average?.toFixed(1)}</span>
                                </div>
                              </div>
                              <p className="text-sm font-sans text-white truncate group-hover:text-primary transition-colors">{movie.title}</p>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
