/**
 * TrailerModal.tsx
 *
 * Reusable trailer modal with a cinematic ambient-glow layer behind the YouTube player.
 *
 * FIX (2026-06-01): Glow was invisible because:
 *  1. It was nested inside the aspect-video container which had overflow-hidden + was
 *     sized exactly to the player — clipping all the blur halo before it could bleed out.
 *  2. The outer wrapper had bg-black (100% opaque) which painted over everything behind it.
 *
 * Fix: glow is now a FREE-FLOATING sibling of the player container, absolutely
 * positioned and centered on the viewport, sized larger than the player so the
 * 100px blur radius bleeds visibly past every edge. The modal backdrop is now
 * bg-black/80 (not solid) so the glow can read through it.
 *
 * The glow is derived from the movie/TV backdrop image we already have — NOT from live
 * video pixels (impossible cross-origin). The backdrop is scaled up, heavily blurred
 * (CSS filter: blur), and rendered at opacity ~0.50 behind the iframe.
 *
 * Accessibility / Performance:
 *  - useReducedMotion: static glow, no breathing animation
 *  - Mobile (<md): glow opacity reduced to ~0.30 via wrapper class
 *  - will-change: opacity, transform on glow image only
 *  - Glow only mounts when modal is open (no idle GPU cost)
 *
 * Props:
 *  - iframeKey   YouTube video key (e.g. "dQw4w9WgXcQ")
 *  - onClose     Called when the backdrop or X button is clicked / Escape pressed
 *  - backdropUrl Optional TMDB backdrop URL (w1280). Falls back to crimson radial gradient.
 */
import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

interface TrailerModalProps {
  iframeKey: string;
  onClose: () => void;
  backdropUrl?: string;
}

export const TrailerModal = ({ iframeKey, onClose, backdropUrl }: TrailerModalProps) => {
  const prefersReducedMotion = useReducedMotion();

  // Keyboard close + body scroll-lock while modal is mounted
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  // Breathing animation — desktop only, disabled when reduced-motion preferred
  // Opacity range raised to 0.50 → 0.65 so glow is clearly visible
  const glowAnimate = prefersReducedMotion
    ? { opacity: 0.50, scale: 1.0 }
    : {
        opacity: [0.50, 0.65, 0.50],
        scale: [1.0, 1.04, 1.0],
        transition: {
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      };

  return (
    <AnimatePresence>
      {/*
       * ── Modal root ──
       * bg-black/80 (not solid bg-black) so the glow layer behind the player
       * can bleed softly through the dark overlay at the edges.
       * z-[100] for the whole modal stack.
       */}
      <motion.div
        key="trailer-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 md:p-8"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Trailer player"
      >
        {/*
         * ── AMBIENT GLOW LAYER ──
         * z-[101] — above the black bg, below the player (z-[103]) and close btn (z-[110])
         *
         * Positioned OUTSIDE the player container so overflow-hidden doesn't clip the blur.
         * Fixed-centered via left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2.
         * Sized LARGER than the player (min(110vw,1400px) × min(75vh,900px)) so the
         * blur(100px) radius bleeds ~150px past every player edge, creating the halo.
         *
         * Mobile: wrapper opacity-[0.30], desktop: opacity-100 → Framer Motion controls.
         */}
        <div
          aria-hidden="true"
          className="
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            z-[101] pointer-events-none
            opacity-[0.30] md:opacity-100
          "
          style={{
            width: 'min(110vw, 1400px)',
            height: 'min(75vh, 900px)',
          }}
        >
          {backdropUrl ? (
            <motion.img
              src={backdropUrl}
              alt=""
              draggable={false}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover select-none"
              initial={{ opacity: 0.50, scale: 1.0 }}
              animate={glowAnimate}
              style={{
                filter: 'blur(100px)',
                willChange: prefersReducedMotion ? 'auto' : 'opacity, transform',
              }}
            />
          ) : (
            /* Fallback: crimson → near-black radial gradient */
            <div
              className="w-full h-full"
              style={{
                opacity: 0.55,
                background:
                  'radial-gradient(ellipse at center, rgba(220,38,38,0.85) 0%, rgba(10,0,0,0.0) 65%)',
              }}
            />
          )}
        </div>

        {/*
         * ── Player container ──
         * z-[103] — above glow, below close button.
         * No overflow-hidden here — let the glow (which is now a sibling) bleed freely.
         */}
        <div
          className="relative w-full max-w-[900px] aspect-video z-[103]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Close Button ── z-[110] — always on top ── */}
          <button
            onClick={onClose}
            aria-label="Close trailer"
            className="absolute top-2 right-2 sm:-top-12 sm:-right-12 xl:-right-16 z-[110]
                       bg-black/70 hover:bg-black/90 rounded-full p-2
                       text-red-500 hover:text-red-400 transition-all
                       drop-shadow-[0_0_12px_rgba(239,68,68,1)]"
          >
            <X className="w-10 h-10 md:w-12 md:h-12" />
          </button>

          {/* ── YouTube iframe ── fills the player box ── */}
          <iframe
            src={`https://www.youtube.com/embed/${iframeKey}?autoplay=1`}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen={true}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
            title="Trailer"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrailerModal;
