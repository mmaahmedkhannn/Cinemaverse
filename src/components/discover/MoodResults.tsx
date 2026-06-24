/**
 * MoodResults.tsx
 *
 * Final results view for the Mood Discovery Engine. Displays 10 curated
 * film recommendations in a cinematic grid with match percentage badges,
 * posters, "Why this pick" tooltips, and navigation to movie detail pages.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RotateCcw, ArrowRight, Info } from 'lucide-react';
import { getImageUrl } from '../../services/tmdb';
import type { MoodResult } from '../../lib/moodEngine';

interface MoodResultsProps {
  results: MoodResult[];
  onRestart: () => void;
}

const MoodResults = ({ results, onRestart }: MoodResultsProps) => {
  const [showIntro, setShowIntro] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Cinematic intro → then reveal results
  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          onAnimationComplete={() => {
            setTimeout(() => setShowIntro(false), 1800);
          }}
        >
          <motion.p
            className="font-bebas text-3xl md:text-5xl lg:text-6xl tracking-widest"
            style={{ color: '#D4A437' }}
            animate={{
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 2.5, times: [0, 0.3, 0.7, 1] }}
          >
            Your picks are ready...
          </motion.p>
          <motion.div
            className="mt-6 mx-auto w-16 h-0.5 rounded-full"
            style={{ backgroundColor: '#D4A437' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-24 md:pt-28 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-wide text-white mb-3">
            Your Curated Picks
          </h2>
          <p className="text-sm md:text-base max-w-lg mx-auto" style={{ color: 'rgba(245, 245, 245, 0.6)' }}>
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                className="relative group"
                onMouseEnter={() => setHoveredId(film.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link
                  to={`/movie/${film.id}`}
                  className="block rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437]"
                  id={`result-${film.id}`}
                  aria-label={`${film.title} (${year}) — ${film.matchScore}% match`}
                  onClick={() => {
                    // GA4 event
                    if (typeof window !== 'undefined' && 'gtag' in window) {
                      (window as Record<string, unknown> & { gtag: (...args: unknown[]) => void }).gtag('event', 'mood_result_clicked', {
                        tmdb_id: film.id,
                        movie_title: film.title,
                      });
                    }
                  }}
                >
                  {/* Poster */}
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={`${film.title} poster`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}

                    {/* Gold border glow on hover */}
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
                      style={{
                        border: isHovered
                          ? '2px solid rgba(212, 164, 55, 0.6)'
                          : '1px solid rgba(212, 164, 55, 0.15)',
                        boxShadow: isHovered
                          ? '0 0 20px rgba(212, 164, 55, 0.2)'
                          : 'none',
                      }}
                    />

                    {/* Match percentage badge */}
                    <div
                      className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold"
                      style={{
                        background: 'rgba(212, 164, 55, 0.9)',
                        color: '#0a0a0f',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {film.matchScore}%
                    </div>

                    {/* Bottom gradient */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1/3"
                      style={{
                        background: 'linear-gradient(to top, rgba(10, 10, 15, 0.95) 0%, transparent 100%)',
                      }}
                    />
                  </div>
                </Link>

                {/* Film info */}
                <div className="mt-2.5 px-0.5">
                  <h3 className="font-bebas text-sm md:text-base tracking-wide text-white leading-tight truncate">
                    {film.title}
                  </h3>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs" style={{ color: 'rgba(245, 245, 245, 0.5)' }}>
                      {year}
                      {film.vote_average > 0 && (
                        <> · ⭐ {film.vote_average.toFixed(1)}</>
                      )}
                    </span>

                    {/* Why this pick tooltip trigger */}
                    <button
                      className="text-xs flex items-center gap-1 transition-colors duration-200 cursor-help focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4A437] rounded"
                      style={{ color: 'rgba(212, 164, 55, 0.7)' }}
                      aria-label={`Why this pick: ${film.matchReason}`}
                      title={film.matchReason}
                      onClick={(e) => e.preventDefault()}
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Tooltip on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 right-0 -bottom-10 z-10 mx-1"
                    >
                      <div
                        className="text-[10px] md:text-xs px-3 py-2 rounded-lg text-center"
                        style={{
                          background: 'rgba(15, 15, 20, 0.95)',
                          border: '1px solid rgba(212, 164, 55, 0.3)',
                          color: 'rgba(245, 245, 245, 0.8)',
                          backdropFilter: 'blur(12px)',
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
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14 md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bebas text-lg tracking-wide transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437]"
            style={{
              background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.5) 0%, rgba(127, 29, 29, 0.4) 100%)',
              border: '1px solid rgba(185, 28, 28, 0.5)',
              color: '#F5F5F5',
            }}
            id="restart-quiz"
          >
            <RotateCcw className="w-4 h-4" />
            Want different picks?
          </button>

          <Link
            to="/movies"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bebas text-lg tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437]"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 164, 55, 0.2)',
              color: 'rgba(245, 245, 245, 0.7)',
            }}
            id="browse-all-movies"
          >
            Browse all movies
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default MoodResults;
