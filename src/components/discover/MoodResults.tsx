/**
 * MoodResults.tsx
 *
 * Premium results view with cinematic intro, gold-bordered poster cards,
 * animated match badges, hover glow effects, and "Why this pick" tooltips.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RotateCcw, ArrowRight, Info, Sparkles } from 'lucide-react';
import { getImageUrl } from '../../services/tmdb';
import type { MoodResult } from '../../lib/moodEngine';

interface MoodResultsProps {
  results: MoodResult[];
  onRestart: () => void;
}

const MoodResults = ({ results, onRestart }: MoodResultsProps) => {
  const [showIntro, setShowIntro] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Cinematic reveal intro
  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: '#060609' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            onAnimationComplete={() => {
              // The component mounts, fades in, and after a short delay, fades out.
              setTimeout(() => setShowIntro(false), 2200);
            }}
          >
            <div className="text-center relative z-10 flex flex-col items-center">
              {/* Glow behind text */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(212, 164, 55, 0.15) 0%, transparent 70%)',
                  filter: 'blur(50px)',
                }}
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, ease: 'easeInOut' }}
              />

              <motion.div
                className="text-[#D4A437] mb-8"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <Sparkles className="w-16 h-16 md:w-20 md:h-20" />
              </motion.div>

              <motion.p
                className="font-bebas text-4xl md:text-5xl lg:text-7xl tracking-[0.15em] text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Your picks are ready
              </motion.p>

              <motion.div
                className="mt-8 h-[1px] rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, #D4A437, transparent)' }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.2, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen pb-24 pt-24 md:pt-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-[0.1em] mb-3"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 30%, #D4A437 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your Curated Picks
          </h2>
          <p className="text-sm md:text-base max-w-lg mx-auto font-sans" style={{ color: 'rgba(245, 245, 245, 0.5)' }}>
            10 films handpicked for your mood. Click any to explore.
          </p>
        </motion.div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {results.map((film, i) => {
            const posterUrl = getImageUrl(film.poster_path, 'w500');
            const year = film.release_date ? film.release_date.substring(0, 4) : '';
            const isHovered = hoveredId === film.id;

            return (
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative group"
                onMouseEnter={() => setHoveredId(film.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link
                  to={`/movie/${film.id}`}
                  className="block rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437]"
                  id={`result-${film.id}`}
                  aria-label={`${film.title} (${year}) — ${film.matchScore}% match`}
                  onClick={() => {
                    if (typeof window !== 'undefined' && 'gtag' in window) {
                      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'mood_result_clicked', {
                        tmdb_id: film.id,
                        movie_title: film.title,
                      });
                    }
                  }}
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={`${film.title} poster`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}

                    {/* Border + glow */}
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-400"
                      style={{
                        border: isHovered
                          ? '2px solid rgba(212, 164, 55, 0.6)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: isHovered
                          ? '0 0 30px rgba(212, 164, 55, 0.2), inset 0 0 30px rgba(0,0,0,0.3)'
                          : 'inset 0 0 30px rgba(0,0,0,0.2)',
                      }}
                    />

                    {/* Match badge */}
                    <div
                      className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider font-bebas"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212, 164, 55, 0.95) 0%, rgba(180, 140, 40, 0.95) 100%)',
                        color: '#0a0a0f',
                        boxShadow: '0 2px 12px rgba(212, 164, 55, 0.4)',
                      }}
                    >
                      {film.matchScore}%
                    </div>

                    {/* Bottom gradient */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-2/5"
                      style={{
                        background: 'linear-gradient(to top, rgba(6, 6, 9, 1) 0%, rgba(6, 6, 9, 0.7) 40%, transparent 100%)',
                      }}
                    />

                    {/* Title overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-bebas text-sm md:text-base tracking-wide text-white leading-tight truncate">
                        {film.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] sm:text-xs" style={{ color: 'rgba(245, 245, 245, 0.5)' }}>
                          {year}
                        </span>
                        {film.vote_average > 0 && (
                          <span className="text-[10px] sm:text-xs" style={{ color: 'rgba(212, 164, 55, 0.7)' }}>
                            ⭐ {film.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Why this pick — tooltip trigger */}
                <div className="mt-2 px-0.5 flex items-center justify-end">
                  <button
                    className="text-[10px] sm:text-xs flex items-center gap-1 transition-colors duration-200 cursor-help focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4A437] rounded px-1"
                    style={{ color: 'rgba(212, 164, 55, 0.5)' }}
                    aria-label={`Why this pick: ${film.matchReason}`}
                    title={film.matchReason}
                    onClick={(e) => e.preventDefault()}
                  >
                    <Info className="w-3 h-3" />
                    <span className="hidden sm:inline">Why this?</span>
                  </button>
                </div>

                {/* Hover tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 -bottom-8 z-20 mx-1"
                    >
                      <div
                        className="text-[10px] md:text-xs px-3 py-2 rounded-lg text-center"
                        style={{
                          background: 'rgba(15, 15, 20, 0.97)',
                          border: '1px solid rgba(212, 164, 55, 0.25)',
                          color: 'rgba(245, 245, 245, 0.75)',
                          backdropFilter: 'blur(12px)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        }}
                      >
                        {film.matchReason}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16 md:mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <button
            onClick={onRestart}
            className="group flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bebas text-lg tracking-wider transition-all duration-300 cursor-pointer hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437]"
            style={{
              background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.5) 0%, rgba(127, 29, 29, 0.4) 100%)',
              border: '1px solid rgba(212, 164, 55, 0.25)',
              color: '#F5F5F5',
              boxShadow: '0 4px 20px rgba(185, 28, 28, 0.2)',
            }}
            id="restart-quiz"
          >
            <RotateCcw className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-180" />
            Want different picks?
          </button>

          <Link
            to="/movies"
            className="group flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bebas text-lg tracking-wider transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437]"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(212, 164, 55, 0.15)',
              color: 'rgba(245, 245, 245, 0.6)',
            }}
            id="browse-all-movies"
          >
            Browse all movies
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default MoodResults;
