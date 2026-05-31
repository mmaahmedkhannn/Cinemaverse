/**
 * TrailerModal.tsx
 *
 * Reusable trailer modal with a cinematic ambient-glow layer behind the YouTube player.
 *
 * The glow is derived from the movie/TV backdrop image we already have — NOT from live
 * video pixels (impossible cross-origin). The backdrop is scaled up, heavily blurred
 * (CSS filter: blur), and rendered at low opacity behind the iframe, mimicking
 * YouTube ambient mode.
 *
 * Accessibility / Performance:
 *  - useReducedMotion: static glow, no animation when reduced motion is preferred
 *  - Mobile (<md): wrapper opacity halved via Tailwind to protect Lighthouse mobile score
 *  - will-change applied only to the glow image; GPU-friendly blur layer
 *  - Glow only mounts when modal is open (no idle GPU cost)
 *
 * Props:
 *  - iframeKey   YouTube video key (e.g. "dQw4w9WgXcQ")
 *  - onClose     Called when the backdrop or X button is clicked / Escape pressed
 *  - backdropUrl Optional TMDB backdrop URL (w1280). Falls back to crimson gradient.
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
  // Framer Motion hook: true when OS/browser has prefers-reduced-motion: reduce
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

  // Breathing animation config — gentle opacity + scale pulse, ~7 s loop
  // Disabled when reduced-motion is preferred
  const glowAnimate = prefersReducedMotion
    ? { opacity: 0.32, scale: 1.1 }
    : {
        opacity: [0.32, 0.42, 0.32],
        scale: [1.1, 1.13, 1.1],
        transition: {
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      };

  return (
    <AnimatePresence>
      {/* ── Full-screen backdrop — click to close ── */}
      <motion.div
        key="trailer-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4 md:p-8"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Trailer player"
      >
        {/* ── Player container — stop propagation so clicking video doesn't close ── */}
        <div
          className="relative w-full max-w-[900px] aspect-video"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Ambient Glow Layer ── z-[101] — below iframe (z-[103]) and close btn (z-[110]) ──
           *
           * The outer wrapper uses Tailwind responsive opacity to reduce the glow on mobile
           * (opacity-50 = half) without fighting Framer Motion's animated opacity on the image.
           * On desktop (md+) the wrapper is opacity-100 and Framer Motion controls image opacity.
           *
           * overflow-hidden + rounded-sm keeps the blurred halo clipped to the player area.
           */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[101] overflow-hidden rounded-sm pointer-events-none
                       opacity-60 md:opacity-100"
          >
            {backdropUrl ? (
              <motion.img
                src={backdropUrl}
                alt=""
                draggable={false}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover select-none"
                initial={{ opacity: 0.32, scale: 1.1 }}
                animate={glowAnimate}
                style={{
                  filter: 'blur(92px)',
                  // will-change hints the browser to promote this layer to its own
                  // composite layer, keeping blur animation GPU-only
                  willChange: prefersReducedMotion ? 'auto' : 'opacity, transform',
                }}
              />
            ) : (
              /* Fallback: crimson → near-black radial gradient when no backdrop is available */
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  opacity: 0.35,
                  background:
                    'radial-gradient(ellipse at center, rgba(220,38,38,0.75) 0%, rgba(10,0,0,0.0) 70%)',
                }}
              />
            )}
          </div>

          {/* ── Close Button ── z-[110] — always visible on top ── */}
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

          {/* ── YouTube iframe ── z-[103] — above glow, below close button ── */}
          <iframe
            src={`https://www.youtube.com/embed/${iframeKey}?autoplay=1`}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen={true}
            className="absolute inset-0 w-full h-full z-[103]"
            style={{ border: 'none' }}
            title="Trailer"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrailerModal;
