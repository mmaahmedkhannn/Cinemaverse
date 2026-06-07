/**
 * VerdictReveal.tsx
 *
 * Post-vote reveal panel for the Verdict Wall.
 * Displays animated percentage bars, count-up numbers, total vote tally,
 * a confirmation banner, and an optional "Share Verdict" tweet button.
 *
 * All animations are staggered and respect `prefers-reduced-motion`.
 * Vote percentages are announced via an `aria-live="polite"` region.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface VerdictRevealProps {
  movie1Title: string;
  movie2Title: string;
  pct1: number;
  pct2: number;
  totalVotes: number;
  votedFor: 'movie1' | 'movie2' | null;
  winner: 'movie1' | 'movie2' | null;
}

/** Animates a number from 0 to target over `durationMs` */
const useCountUp = (target: number, durationMs: number, enabled: boolean) => {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    setValue(0);
    startTime.current = null;

    const tick = (now: number) => {
      if (startTime.current === null) startTime.current = now;
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / durationMs, 1);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs, enabled]);

  return value;
};

const VerdictReveal = ({
  movie1Title,
  movie2Title,
  pct1,
  pct2,
  totalVotes,
  votedFor,
  winner,
}: VerdictRevealProps) => {
  const shouldReduceMotion = useReducedMotion();

  const count1 = useCountUp(pct1, 1200, !shouldReduceMotion);
  const count2 = useCountUp(pct2, 1200, !shouldReduceMotion);

  const votedForTitle = votedFor === 'movie1' ? movie1Title : votedFor === 'movie2' ? movie2Title : null;

  const tweetText = encodeURIComponent(
    winner === 'movie1'
      ? `"${movie1Title}" is leading over "${movie2Title}" on #CinemaDiscovery! Vote now → https://cinemadiscovery.com/battles`
      : winner === 'movie2'
      ? `"${movie2Title}" is leading over "${movie1Title}" on #CinemaDiscovery! Vote now → https://cinemadiscovery.com/battles`
      : `"${movie1Title}" vs "${movie2Title}" — it's a dead heat on #CinemaDiscovery! Cast your verdict → https://cinemadiscovery.com/battles`
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <motion.div
      className="w-full mt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* ── Film 1 bar ── */}
      <motion.div className="mb-5" variants={itemVariants}>
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="font-sans text-sm text-[#F5F5F5]/70 truncate max-w-[60%]"
            title={movie1Title}
          >
            {movie1Title}
          </span>
          <span
            className="font-bebas text-xl tracking-wide"
            style={{ color: winner === 'movie1' ? '#D4A437' : 'rgba(245,245,245,0.5)' }}
          >
            {shouldReduceMotion ? pct1 : count1}%
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                winner === 'movie1'
                  ? 'linear-gradient(90deg, #8a6a1f, #D4A437, #f0c060)'
                  : 'linear-gradient(90deg, #3f3f46, #52525b)',
              boxShadow: winner === 'movie1' ? '0 0 14px rgba(212,164,55,0.5)' : 'none',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${pct1}%` }}
            transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      </motion.div>

      {/* ── Film 2 bar ── */}
      <motion.div className="mb-6" variants={itemVariants}>
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="font-sans text-sm text-[#F5F5F5]/70 truncate max-w-[60%]"
            title={movie2Title}
          >
            {movie2Title}
          </span>
          <span
            className="font-bebas text-xl tracking-wide"
            style={{ color: winner === 'movie2' ? '#D4A437' : 'rgba(245,245,245,0.5)' }}
          >
            {shouldReduceMotion ? pct2 : count2}%
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                winner === 'movie2'
                  ? 'linear-gradient(90deg, #8a6a1f, #D4A437, #f0c060)'
                  : 'linear-gradient(90deg, #3f3f46, #52525b)',
              boxShadow: winner === 'movie2' ? '0 0 14px rgba(212,164,55,0.5)' : 'none',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${pct2}%` }}
            transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: 'easeOut', delay: 0.4 }}
          />
        </div>
      </motion.div>

      {/* ── Total verdicts ── */}
      <motion.p
        className="font-sans text-center text-sm text-[#F5F5F5]/40 mb-5 tracking-wide"
        variants={itemVariants}
      >
        <span className="text-[#D4A437] font-semibold">{totalVotes.toLocaleString()}</span>{' '}
        verdict{totalVotes !== 1 ? 's' : ''} cast
      </motion.p>

      {/* ── Confirmation banner ── */}
      {votedForTitle && (
        <motion.div
          className="text-center mb-5 px-4 py-3 border border-[#D4A437]/25 rounded-sm"
          style={{ background: 'rgba(212,164,55,0.06)' }}
          variants={itemVariants}
        >
          <p className="font-playfair italic text-[#D4A437] text-base leading-snug">
            ⚖ Your verdict has been sealed.
          </p>
          <p className="font-sans text-[#F5F5F5]/50 text-xs mt-1">
            You voted for <span className="text-[#F5F5F5]/80 font-semibold">{votedForTitle}</span>
          </p>
        </motion.div>
      )}

      {/* ── Share verdict ── */}
      <motion.div className="flex justify-center" variants={itemVariants}>
        <a
          href={`https://twitter.com/intent/tweet?text=${tweetText}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share your verdict on X (Twitter)"
          className="inline-flex items-center gap-2 font-bebas tracking-[0.15em] text-sm px-5 py-2.5 rounded-sm transition-all duration-300"
          style={{
            border: '1px solid rgba(212,164,55,0.35)',
            color: '#D4A437',
            background: 'transparent',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(212,164,55,0.1)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,164,55,0.7)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,164,55,0.35)';
          }}
        >
          {/* X / Twitter icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          SHARE VERDICT
        </a>
      </motion.div>
    </motion.div>
  );
};

export default VerdictReveal;
