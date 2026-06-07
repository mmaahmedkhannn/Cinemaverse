/**
 * ScalesOfJustice.tsx
 *
 * Animated SVG scales-of-justice for the Verdict Wall battle stage.
 * Beam tilts left (-8deg) when movie1 leads, right (+8deg) when movie2 leads,
 * and stays balanced (0deg) before any vote is cast.
 *
 * Respects `prefers-reduced-motion` — tilt and bob animations are disabled,
 * only opacity transitions remain.
 */
import { motion, useReducedMotion } from 'framer-motion';

interface ScalesOfJusticeProps {
  /** Direction the scales should tip, or 'balanced' before voting */
  tilt: 'left' | 'right' | 'balanced';
}

const GOLD = '#D4A437';
const GOLD_DARK = '#8a6a1f';

const ScalesOfJustice = ({ tilt }: ScalesOfJusticeProps) => {
  const shouldReduceMotion = useReducedMotion();

  const beamRotation =
    tilt === 'left' ? -10 : tilt === 'right' ? 10 : 0;

  const leftPanY =
    tilt === 'left' ? 10 : tilt === 'right' ? -10 : 0;

  const rightPanY =
    tilt === 'right' ? 10 : tilt === 'left' ? -10 : 0;

  const beamTransition = {
    duration: shouldReduceMotion ? 0 : 0.8,
    ease: 'easeOut' as const,
  };

  const panTransition = {
    duration: shouldReduceMotion ? 0 : 0.8,
    ease: 'easeOut' as const,
  };

  return (
    <motion.div
      className="flex items-center justify-center select-none"
      // Gentle constant bob — only on non-reduced-motion
      animate={
        shouldReduceMotion
          ? {}
          : { y: [0, -4, 0] }
      }
      transition={
        shouldReduceMotion
          ? {}
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 160"
        width="100"
        height="133"
        role="img"
        aria-label="Scales of Justice — vote tally indicator"
        style={{
          filter: `drop-shadow(0 0 12px ${GOLD}60)`,
          overflow: 'visible',
        }}
      >
        {/* Central pole */}
        <line
          x1="60" y1="10"
          x2="60" y2="145"
          stroke={GOLD}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Finial / top ornament */}
        <circle cx="60" cy="10" r="4" fill={GOLD} />

        {/* Pivot point */}
        <circle cx="60" cy="38" r="3.5" fill={GOLD} />

        {/* ——— Beam (rotates around pivot) ——— */}
        <motion.g
          style={{ transformOrigin: '60px 38px' }}
          animate={{ rotate: beamRotation }}
          transition={beamTransition}
        >
          {/* Beam rod */}
          <line
            x1="8" y1="38"
            x2="112" y2="38"
            stroke={GOLD}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* ——— Left pan group ——— */}
          <motion.g
            animate={{ y: leftPanY }}
            transition={panTransition}
          >
            {/* Left chain */}
            <line x1="18" y1="38" x2="18" y2="70" stroke={GOLD_DARK} strokeWidth="1.2" strokeDasharray="3 2" />
            {/* Left pan */}
            <ellipse cx="18" cy="76" rx="16" ry="5" fill="none" stroke={GOLD} strokeWidth="1.8" />
            {/* Left pan bottom curve */}
            <path d="M2 76 Q18 92 34 76" fill="rgba(212,164,55,0.15)" stroke={GOLD} strokeWidth="1.5" />
          </motion.g>

          {/* ——— Right pan group ——— */}
          <motion.g
            animate={{ y: rightPanY }}
            transition={panTransition}
          >
            {/* Right chain */}
            <line x1="102" y1="38" x2="102" y2="70" stroke={GOLD_DARK} strokeWidth="1.2" strokeDasharray="3 2" />
            {/* Right pan */}
            <ellipse cx="102" cy="76" rx="16" ry="5" fill="none" stroke={GOLD} strokeWidth="1.8" />
            {/* Right pan bottom curve */}
            <path d="M86 76 Q102 92 118 76" fill="rgba(212,164,55,0.15)" stroke={GOLD} strokeWidth="1.5" />
          </motion.g>
        </motion.g>

        {/* Base */}
        <rect x="46" y="143" width="28" height="5" rx="2.5" fill={GOLD} />
        {/* Base foot */}
        <rect x="40" y="148" width="40" height="4" rx="2" fill={GOLD_DARK} opacity="0.8" />
      </svg>
    </motion.div>
  );
};

export default ScalesOfJustice;
