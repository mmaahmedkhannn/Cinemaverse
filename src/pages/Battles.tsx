/**
 * Battles.tsx — The Verdict Wall
 *
 * Premium awards-season redesign of the Weekly Featured Battle page.
 * Presents two films as gilded museum exhibits flanking an animated
 * Scales of Justice SVG. After voting, scales tip, percentage bars
 * count up, and a confirmation banner appears.
 *
 * DATA LAYER — ALL UNCHANGED:
 *   - battleService.ts (PRESET_BATTLES, castVote, getUserVote, getBattle,
 *     getWeeklyBattle, getGuestId) is untouched.
 *   - Firestore vote write/read logic is identical to the original.
 *   - 7-day rotation (getWeeklyBattle) is untouched.
 *   - EmailJS winner blast is not triggered here (handled by the service).
 *
 * Only the JSX / UI layer has changed.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Zap } from 'lucide-react';
import { getImageUrl } from '../services/tmdb';
import { useAuth } from '../contexts/AuthContext';
import {
  castVote,
  getUserVote,
  getBattle,
  getWeeklyBattle,
  getGuestId,
} from '../lib/battleService';
import type { Battle } from '../lib/battleService';
import SEO from '../components/SEO';
import ScalesOfJustice from '../components/battles/ScalesOfJustice';
import FilmExhibitCard from '../components/battles/FilmExhibitCard';
import VerdictReveal from '../components/battles/VerdictReveal';
import additionalBattles from '../lib/additional_battles.json';

// Inline taglines for PRESET_BATTLES entries not in additional_battles.json
const INLINE_TAGLINES: Record<string, { m1: string; m2: string }> = {
  '238_vs_155': {
    m1: "Coppola's operatic portrait of power, family, and moral rot",
    m2: "Nolan's Gotham epic — chaos elevated to philosophy",
  },
  '27205_vs_157336': {
    m1: "Nolan plants a question inside a dream inside a dream",
    m2: "Nolan sends Cooper across the stars to save his daughter",
  },
  '680_vs_550': {
    m1: "Tarantino's mosaic of violence, wit, and second chances",
    m2: "Fincher's anarchic meditation on masculinity and consumerism",
  },
  '299534_vs_299536': {
    m1: "The 10-year MCU arc pays off in five heartbreaking hours",
    m2: "Half the universe snapped away — the gut-punch of an era",
  },
  '278_vs_13': {
    m1: "Hope persists behind Shawshank's grey walls",
    m2: "A box of chocolates and a life of accidental history",
  },
  '769_vs_111': {
    m1: "Scorsese's Mafia symphony — violence as lifestyle",
    m2: "De Palma's operatic rise and fall of a Cuban exile",
  },
  '603_vs_335984': {
    m1: "Wachowski's red pill — identity, reality, and revolution",
    m2: "Villeneuve's visual requiem for a dying dystopia",
  },
  '475557_vs_155': {
    m1: "Phoenix dissolves into Gotham's rot — a one-man horror show",
    m2: "Nolan's Gotham epic — chaos elevated to philosophy",
  },
  '872585_vs_374720': {
    m1: "Nolan detonates the 20th century in 180 minutes of IMAX",
    m2: "Nolan strips war to its rawest, most terrifying essence",
  },
  '6488_vs_275': {
    m1: "The Coens' bleak West Texas moral reckoning",
    m2: "The Coens' Minnesota noir — dark comedy in the frozen plains",
  },
};

/** Look up editorial taglines for a battle by movie IDs */
const getTaglines = (
  movie1Id: number,
  movie2Id: number
): { movie1Tagline: string; movie2Tagline: string } => {
  // Try additional_battles.json first
  const found = (additionalBattles as any[]).find(
    (b) => b.movie1Id === movie1Id && b.movie2Id === movie2Id
  );
  if (found?.movie1Tagline) {
    return { movie1Tagline: found.movie1Tagline, movie2Tagline: found.movie2Tagline };
  }
  // Fallback to inline GOAT battle taglines
  const key = `${movie1Id}_vs_${movie2Id}`;
  const inline = INLINE_TAGLINES[key];
  if (inline) {
    return { movie1Tagline: inline.m1, movie2Tagline: inline.m2 };
  }
  return { movie1Tagline: '', movie2Tagline: '' };
};

// ─────────────────────────────────────────────────────────
//  Extended battle state type (adds TMDB movie detail fields)
// ─────────────────────────────────────────────────────────
type ExtendedBattle = Battle & {
  userVote: any;
  movie1VoteAverage: number | null;
  movie2VoteAverage: number | null;
  movie1Year: string | null;
  movie2Year: string | null;
  movie1Director: string | null;
  movie2Director: string | null;
};

const Battles = () => {
  const [battle, setBattle] = useState<ExtendedBattle | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const loadBattle = async () => {
      try {
        setLoading(true);
        const weekly = getWeeklyBattle();

        const b = await getBattle(weekly.battleId);
        if (!b) {
          setLoading(false);
          return;
        }

        const odv = currentUser?.uid || getGuestId();

        // Fetch TMDB details + user vote in parallel (same as original)
        const [m1, m2, userVote] = await Promise.all([
          import('../services/tmdb').then(({ tmdbApi }) =>
            tmdbApi.getMovieDetails(b.movie1Id).catch(() => null)
          ),
          import('../services/tmdb').then(({ tmdbApi }) =>
            tmdbApi.getMovieDetails(b.movie2Id).catch(() => null)
          ),
          getUserVote(weekly.battleId, odv).catch(() => null),
        ]);

        setBattle({
          ...b,
          movie1Poster: m1?.poster_path || null,
          movie2Poster: m2?.poster_path || null,
          movie1VoteAverage: m1?.vote_average ?? null,
          movie2VoteAverage: m2?.vote_average ?? null,
          movie1Year: m1?.release_date?.substring(0, 4) ?? null,
          movie2Year: m2?.release_date?.substring(0, 4) ?? null,
          movie1Director:
            m1?.credits?.crew?.find((c: any) => c.job === 'Director')?.name ?? null,
          movie2Director:
            m2?.credits?.crew?.find((c: any) => c.job === 'Director')?.name ?? null,
          userVote,
        });

        // Countdown timer (same logic as original)
        const updateTimer = () => {
          const now = new Date();
          const end = weekly.endsAt;
          const diff = end.getTime() - now.getTime();

          if (diff <= 0) {
            setTimeLeft('Battle Ended');
            return;
          }

          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        updateTimer();
        interval = setInterval(updateTimer, 1000);
      } catch (err: any) {
        console.error('Battles loading error:', err);
        setError(err.message || 'Failed to load battle');
      } finally {
        setLoading(false);
      }
    };

    loadBattle();
    return () => clearInterval(interval);
  }, [currentUser]);

  // ── Vote handler (identical logic to original) ──────────────────────────
  const handleVote = async (movieId: number, side: 'movie1' | 'movie2') => {
    if (!battle || !battle.id || isVoting) return;

    setIsVoting(true);
    try {
      const odv = currentUser?.uid || getGuestId();
      await castVote(battle.id, movieId, odv, side);
      const updated = await getBattle(battle.id);
      const userVote = await getUserVote(battle.id, odv);
      // Preserve poster paths and extra TMDB fields (not stored in Firestore)
      setBattle((prev) =>
        prev
          ? {
              ...prev,
              ...updated!,
              movie1Poster: prev.movie1Poster,
              movie2Poster: prev.movie2Poster,
              movie1VoteAverage: prev.movie1VoteAverage,
              movie2VoteAverage: prev.movie2VoteAverage,
              movie1Year: prev.movie1Year,
              movie2Year: prev.movie2Year,
              movie1Director: prev.movie1Director,
              movie2Director: prev.movie2Director,
              userVote,
            }
          : null
      );
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsVoting(false);
    }
  };

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="min-h-screen pt-20 flex flex-col justify-center items-center text-center px-4"
        style={{ background: '#0a0a0f' }}
      >
        <Zap className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bebas text-white mb-2">Battle Loading Failed</h2>
        <p className="text-gray-400 font-sans">{error}</p>
        <p className="text-gray-500 font-sans text-sm mt-4">
          Make sure you have deployed your Firestore Security Rules.
        </p>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-center"
        style={{ background: '#0a0a0f' }}
      >
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-6"
          style={{ borderColor: '#D4A437', borderTopColor: 'transparent' }}
        />
        <p className="font-sans text-sm" style={{ color: 'rgba(245,245,245,0.4)' }}>
          Preparing the jury…
        </p>
      </div>
    );
  }

  // ── No battle state ────────────────────────────────────────────────────
  if (!battle) {
    return (
      <div
        className="min-h-screen pt-20 flex flex-col justify-center items-center text-center px-4"
        style={{ background: '#0a0a0f' }}
      >
        <h2
          className="text-4xl font-bebas tracking-widest px-8 py-4 rounded-xl uppercase"
          style={{
            color: '#F5F5F5',
            border: '1px solid rgba(212,164,55,0.3)',
            background: 'rgba(212,164,55,0.05)',
          }}
        >
          No Active Battle
        </h2>
        <p className="mt-2 font-sans px-4 py-2" style={{ color: 'rgba(245,245,245,0.4)' }}>
          The jury chamber is empty. Check back later.
        </p>
      </div>
    );
  }

  // ── Computed vote values ───────────────────────────────────────────────
  const total = (battle.movie1Votes || 0) + (battle.movie2Votes || 0);
  const pct1 = total > 0 ? Math.round(((battle.movie1Votes || 0) / total) * 100) : 50;
  const pct2 = total > 0 ? 100 - pct1 : 50;
  const hasVoted = !!battle.userVote;
  const winner: 'movie1' | 'movie2' | null =
    pct1 > pct2 ? 'movie1' : pct2 > pct1 ? 'movie2' : null;

  // Derive which movie the user voted for from userVote.movieId
  const votedFor: 'movie1' | 'movie2' | null = battle.userVote
    ? battle.userVote.movieId === battle.movie1Id
      ? 'movie1'
      : 'movie2'
    : null;

  // Scales tilt direction
  const scalesTilt: 'left' | 'right' | 'balanced' = hasVoted
    ? winner === 'movie1'
      ? 'left'
      : winner === 'movie2'
      ? 'right'
      : 'balanced'
    : 'balanced';

  // Taglines
  const { movie1Tagline, movie2Tagline } = getTaglines(battle.movie1Id, battle.movie2Id);

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen pt-20 pb-24 flex flex-col relative overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      <SEO
        title="The Verdict Wall | Weekly Movie Battle | CinemaDiscovery"
        description="Two films. One winner. Cast your verdict in this week's cinematic showdown and see how the community rules."
        url="https://cinemadiscovery.com/battles"
      />

      {/* ── Background layers ───────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Crimson radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(127,29,29,0.18) 0%, rgba(10,10,15,0) 70%)',
          }}
        />
        {/* Gold radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 70%, rgba(212,164,55,0.05) 0%, rgba(10,10,15,0) 70%)',
          }}
        />
        {/* Subtle noise texture via repeating SVG pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.025]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <section className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Section header ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-5">
            <span
              className="font-bebas tracking-[0.3em] text-sm px-5 py-2 rounded-sm"
              style={{
                color: '#D4A437',
                border: '1px solid rgba(212,164,55,0.4)',
                background: 'rgba(212,164,55,0.06)',
                letterSpacing: '0.3em',
              }}
            >
              ⚖ THE VERDICT WALL ⚖
            </span>
          </div>

          {/* Category pill */}
          {battle.category && (
            <div className="flex justify-center mb-3">
              <span
                className="font-sans text-xs px-3 py-1 rounded-full"
                style={{
                  color: 'rgba(245,245,245,0.5)',
                  border: '1px solid rgba(245,245,245,0.1)',
                  background: 'rgba(245,245,245,0.04)',
                }}
              >
                {battle.category}
              </span>
            </div>
          )}

          <h1 className="font-bebas text-4xl md:text-7xl text-white mt-2 tracking-tight leading-tight">
            Two Films.{' '}
            <span style={{ color: '#B91C1C' }}>One Winner.</span>
          </h1>
          <p className="font-playfair italic text-lg mt-3" style={{ color: 'rgba(245,245,245,0.5)' }}>
            Cast your verdict. Seal their legacy.
          </p>

          {/* Countdown timer */}
          {timeLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 mt-5 px-5 py-2 rounded-sm font-bebas tracking-widest text-sm"
              style={{
                color: '#D4A437',
                border: '1px solid rgba(212,164,55,0.25)',
                background: 'rgba(212,164,55,0.06)',
              }}
            >
              <Clock className="w-4 h-4" aria-hidden="true" />
              VERDICT CLOSES IN: {timeLeft}
            </motion.div>
          )}
        </motion.div>

        {/* ── Horizontal gold rule ─────────────────────────────────────── */}
        <div
          className="w-full h-px mb-10"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(212,164,55,0.4) 30%, rgba(212,164,55,0.4) 70%, transparent)',
          }}
          aria-hidden="true"
        />

        {/* ── Main battle stage ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-6">

          {/* Film 1 exhibit */}
          <FilmExhibitCard
            movieId={battle.movie1Id}
            title={battle.movie1Title}
            posterUrl={getImageUrl(battle.movie1Poster, 'w500')}
            tagline={movie1Tagline}
            isWinner={winner === 'movie1'}
            hasVoted={hasVoted}
            isVoting={isVoting}
            side="movie1"
            tmdbScore={battle.movie1VoteAverage}
            slideFrom="left"
            onVote={() => handleVote(battle.movie1Id, 'movie1')}
          />

          {/* Scales of Justice + post-vote reveal (center) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-shrink-0 flex flex-col items-center justify-start w-full md:w-auto"
          >
            {/* VS label before vote */}
            {!hasVoted && (
              <span
                className="font-bebas text-4xl md:text-5xl tracking-[0.25em] mb-2"
                style={{ color: 'rgba(212,164,55,0.35)' }}
                aria-hidden="true"
              >
                VS
              </span>
            )}

            <ScalesOfJustice tilt={scalesTilt} />

            {/* Post-vote reveal sits beneath scales on desktop, full-width */}
            {hasVoted && (
              <div className="w-full mt-4 md:min-w-[240px] md:max-w-[280px]">
                <VerdictReveal
                  movie1Title={battle.movie1Title}
                  movie2Title={battle.movie2Title}
                  pct1={pct1}
                  pct2={pct2}
                  totalVotes={total}
                  votedFor={votedFor}
                  winner={winner}
                />
              </div>
            )}
          </motion.div>

          {/* Film 2 exhibit */}
          <FilmExhibitCard
            movieId={battle.movie2Id}
            title={battle.movie2Title}
            posterUrl={getImageUrl(battle.movie2Poster, 'w500')}
            tagline={movie2Tagline}
            isWinner={winner === 'movie2'}
            hasVoted={hasVoted}
            isVoting={isVoting}
            side="movie2"
            tmdbScore={battle.movie2VoteAverage}
            slideFrom="right"
            onVote={() => handleVote(battle.movie2Id, 'movie2')}
          />
        </div>

        {/* ── Bottom horizontal rule + CTA ──────────────────────────────── */}
        <div className="mt-14">
          <div
            className="w-full h-px mb-8"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(212,164,55,0.25) 30%, rgba(212,164,55,0.25) 70%, transparent)',
            }}
            aria-hidden="true"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-playfair italic text-sm" style={{ color: 'rgba(245,245,245,0.35)' }}>
              The jury speaks. The verdict stands.
            </p>

            <Link
              to="/battles"
              className="group inline-flex items-center gap-2 font-bebas tracking-[0.15em] text-sm transition-all duration-300"
              style={{ color: 'rgba(212,164,55,0.6)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#D4A437';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(212,164,55,0.6)';
              }}
            >
              SEE ALL BATTLES &amp; LEADERBOARD
              <ChevronRight
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Battles;
