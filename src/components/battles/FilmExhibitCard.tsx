/**
 * FilmExhibitCard.tsx
 *
 * Museum-exhibit style film card for the Verdict Wall.
 * Each card shows a gold-framed poster, brass nameplate (title, year, director),
 * score badges (TMDB instant + RT fading in from background OMDb fetch),
 * a case-file tagline, and a "CAST YOUR VERDICT" vote button.
 *
 * After voting, the button fades out (handled by the parent) and VerdictReveal
 * takes over the bottom section.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { Crown, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '../../services/tmdb';
import { useRottenTomatoes } from '../../hooks/useRottenTomatoes';
import RottenTomatoScore from '../ui/RottenTomatoScore';

interface FilmExhibitCardProps {
  /** TMDB movie ID */
  movieId: number;
  title: string;
  /** Full poster URL (already resolved via getImageUrl) */
  posterUrl: string;
  /** One-line editorial tagline from additional_battles.json */
  tagline: string;
  /** Whether this film is currently winning (shown after vote) */
  isWinner: boolean;
  /** Whether the user has already voted in this battle */
  hasVoted: boolean;
  /** Whether a vote submission is in progress */
  isVoting: boolean;
  /** Side: 'movie1' (left exhibit) or 'movie2' (right exhibit) */
  side: 'movie1' | 'movie2';
  /** TMDB vote_average (0–10) already available from getMovieDetails call */
  tmdbScore: number | null;
  /** Slide-in direction for entrance animation */
  slideFrom: 'left' | 'right';
  onVote: () => void;
}

const FilmExhibitCard = ({
  movieId,
  title,
  posterUrl,
  tagline,
  isWinner,
  hasVoted,
  isVoting,
  side,
  tmdbScore,
  slideFrom,
  onVote,
}: FilmExhibitCardProps) => {
  const shouldReduceMotion = useReducedMotion();

  // Fetch IMDb ID → RT score in background (1-hour cache to protect OMDb quota)
  const { data: externalIds } = useQuery({
    queryKey: ['movie-external-ids', movieId],
    queryFn: () => tmdbApi.getMovieExternalIds(movieId),
    enabled: !!movieId,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
  const { data: rtScore } = useRottenTomatoes(externalIds?.imdb_id);

  const initX = shouldReduceMotion ? 0 : slideFrom === 'left' ? -50 : 50;

  // Determine dimming: if hasVoted and other film is winning, dim this card
  const isDimmed = hasVoted && !isWinner && (hasVoted);

  return (
    <motion.div
      className="flex-1 flex flex-col items-center text-center w-full max-w-xs"
      initial={{ opacity: 0, x: initX }}
      animate={{ opacity: isDimmed ? 0.45 : 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* ── Poster frame ── */}
      <div className="group relative w-full max-w-[220px] mb-0">
        {/* Gold outer glow on hover */}
        <div
          className="absolute -inset-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'rgba(212,164,55,0.15)',
            filter: 'blur(12px)',
          }}
        />

        {/* Gold bevel frame */}
        <div
          className="relative aspect-[2/3] overflow-hidden transition-all duration-500 group-hover:scale-[1.03]"
          style={{
            border: '2px solid rgba(212,164,55,0.5)',
            boxShadow: `
              inset 0 0 0 1px rgba(212,164,55,0.18),
              0 20px 60px rgba(0,0,0,0.8),
              0 0 0 0 rgba(212,164,55,0)
            `,
            borderRadius: '3px',
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease, transform 0.5s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#D4A437';
            (e.currentTarget as HTMLElement).style.boxShadow =
              'inset 0 0 0 1px rgba(212,164,55,0.35), 0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(212,164,55,0.25)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,164,55,0.5)';
            (e.currentTarget as HTMLElement).style.boxShadow =
              'inset 0 0 0 1px rgba(212,164,55,0.18), 0 20px 60px rgba(0,0,0,0.8)';
          }}
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`${title} film poster`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-4 text-center"
              style={{ background: 'rgba(212,164,55,0.06)' }}
            >
              <span className="font-bebas text-lg text-[#D4A437]/60 tracking-wider">{title}</span>
            </div>
          )}

          {/* Winner crown overlay */}
          {hasVoted && isWinner && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                border: '2px solid #D4A437',
                borderRadius: '3px',
                boxShadow: 'inset 0 0 30px rgba(212,164,55,0.15)',
              }}
            >
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full"
                style={{
                  background: '#D4A437',
                  boxShadow: '0 0 20px rgba(212,164,55,0.7)',
                }}
              >
                <Crown className="w-4 h-4 text-black" aria-hidden="true" />
              </div>
            </motion.div>
          )}

          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ── Brass nameplate ── */}
      <div
        className="w-full max-w-[220px] px-3 py-3 mt-0"
        style={{
          background: 'linear-gradient(135deg, rgba(212,164,55,0.12) 0%, rgba(138,106,31,0.08) 100%)',
          borderLeft: '2px solid rgba(212,164,55,0.4)',
          borderRight: '2px solid rgba(212,164,55,0.4)',
          borderBottom: '2px solid rgba(212,164,55,0.4)',
          borderBottomLeftRadius: '3px',
          borderBottomRightRadius: '3px',
        }}
      >
        <h3
          className="font-bebas tracking-wide leading-tight text-[#F5F5F5]"
          style={{ fontSize: 'clamp(1rem, 3vw, 1.35rem)' }}
        >
          {title}
        </h3>

        {/* Score badges — TMDB instant, RT fades in */}
        <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
          {tmdbScore != null && (
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans font-bold text-xs"
              style={{
                background: 'rgba(212,164,55,0.12)',
                border: '1px solid rgba(212,164,55,0.35)',
                color: '#D4A437',
              }}
              title={`TMDB Community Score: ${tmdbScore.toFixed(1)}/10`}
            >
              <Star className="w-3 h-3" style={{ fill: '#D4A437' }} aria-hidden="true" />
              {tmdbScore.toFixed(1)}
            </div>
          )}

          {/* RT score fades in once OMDb responds */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: rtScore != null ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          >
            {rtScore != null && <RottenTomatoScore score={rtScore} size="sm" />}
          </motion.div>
        </div>
      </div>

      {/* ── Case file tagline ── */}
      <div
        className="w-full max-w-[220px] mt-2 px-3 py-2"
        style={{ borderLeft: '1px solid rgba(212,164,55,0.2)' }}
      >
        <p className="font-playfair italic text-xs leading-snug" style={{ color: 'rgba(245,245,245,0.5)' }}>
          {tagline || 'A cinematic heavyweight.'}
        </p>
      </div>

      {/* ── Vote button / hidden after vote ── */}
      <motion.div
        className="w-full max-w-[220px] mt-4"
        animate={{ opacity: hasVoted ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        style={{ pointerEvents: hasVoted ? 'none' : 'auto' }}
      >
        <button
          id={`vote-${side}`}
          onClick={onVote}
          disabled={isVoting || hasVoted}
          aria-label={`Cast your verdict for ${title}`}
          className="group relative w-full py-4 px-6 overflow-hidden transition-all duration-300 disabled:cursor-not-allowed"
          style={{
            background: isVoting ? '#7f1d1d' : '#B91C1C',
            border: '1px solid rgba(212,164,55,0.4)',
            color: '#F5F5F5',
          }}
          onMouseEnter={e => {
            if (!isVoting && !hasVoted) {
              (e.currentTarget as HTMLElement).style.background = '#9B1818';
              (e.currentTarget as HTMLElement).style.borderColor = '#D4A437';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = isVoting ? '#7f1d1d' : '#B91C1C';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,164,55,0.4)';
          }}
        >
          {/* Gold sweep shimmer on hover */}
          <div
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,164,55,0.18), transparent)' }}
          />
          <span className="relative z-10 font-bebas tracking-[0.2em] text-lg">
            {isVoting ? 'SEALING...' : 'CAST YOUR VERDICT'}
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default FilmExhibitCard;
