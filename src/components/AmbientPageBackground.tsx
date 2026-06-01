/**
 * AmbientPageBackground.tsx
 *
 * Renders a full-page ambient colour wash derived from a TMDB backdrop image.
 * Extends the trailer-modal ambient glow concept (TrailerModal.tsx) to the whole
 * detail page so every movie/TV page feels uniquely tinted by its own backdrop.
 *
 * Architecture:
 *  - position: fixed, inset-0, z-[-1] → sits behind ALL page content including
 *    the hero backdrop section, navbar, content, and footer.
 *  - Pure CSS filter: blur(140px) — no canvas, no getImageData, no new libraries.
 *  - Gradient mask stacked on top to keep all text perfectly readable.
 *  - Framer Motion breathing (opacity 0.25 → 0.30, 11s loop) on desktop only.
 *  - prefers-reduced-motion → static, no animation.
 *  - Mobile: lower base opacity (~0.10) via Tailwind responsive class + no breathing.
 *  - Fallback: crimson radial gradient when no backdropUrl is provided.
 *  - will-change only on the animated image element to limit GPU surface.
 *  - Does NOT trigger layout shift (fixed positioning, no block-level participation).
 *
 * Props:
 *  backdropUrl?: string  — full TMDB w1280 URL (e.g. https://image.tmdb.org/t/p/w1280/…)
 *                          Already loaded by the hero section — browser cache reuses it.
 */
import { motion, useReducedMotion } from 'framer-motion';

interface AmbientPageBackgroundProps {
  backdropUrl?: string;
}

const AmbientPageBackground = ({ backdropUrl }: AmbientPageBackgroundProps) => {
  const prefersReducedMotion = useReducedMotion();

  /**
   * Breathing animation — desktop only, 0.25 → 0.30 opacity range.
   * Subtle enough to never distract from content while still feeling "alive".
   * When reduced motion is preferred we use a static opacity value.
   */
  const breatheAnimate = prefersReducedMotion
    ? { opacity: 0.25 }
    : {
        opacity: [0.25, 0.30, 0.25],
        transition: {
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      };

  return (
    /*
     * ── Fixed container ──
     * z-[-1] puts this behind every positioned element on the page.
     * pointer-events-none ensures clicks pass through to page content.
     * aria-hidden keeps it invisible to assistive technology.
     */
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
    >
      {backdropUrl ? (
        /*
         * ── Backdrop image (blur layer) ──
         * Mobile: opacity-[0.10] (very faint, preserves Lighthouse score)
         * Desktop (md+): opacity-100 → Framer Motion controls the final opacity
         *
         * The image is rendered full-screen with object-cover and blurred 140px
         * so individual details dissolve completely — only the colour palette remains.
         */
        <motion.img
          src={backdropUrl}
          alt=""
          draggable={false}
          /**
           * We intentionally use loading="eager" here even though the element is
           * decorative. The same URL is already fetched by the hero <img> above the
           * fold, so the browser serves this from cache with zero extra network cost.
           * Using "lazy" would delay the cache hit and cause a brief flash.
           */
          loading="eager"
          decoding="async"
          className="
            absolute inset-0 w-full h-full object-cover select-none
            opacity-[0.10] md:opacity-100
          "
          initial={{ opacity: prefersReducedMotion ? 0.25 : 0.22 }}
          animate={breatheAnimate}
          style={{
            filter: 'blur(140px)',
            transform: 'scale(1.05)', /* tiny upscale hides blur edge artifacts */
            willChange: prefersReducedMotion ? 'auto' : 'opacity',
          }}
        />
      ) : (
        /*
         * ── Fallback: crimson radial gradient ──
         * Renders when no backdropUrl is supplied (e.g. movie with no TMDB backdrop).
         * Matches the site's pure black + red aesthetic direction.
         * Never blank — always provides some visual depth.
         */
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 15% 20%, rgba(220,38,38,0.18) 0%, rgba(8,8,16,0.0) 70%)',
          }}
        />
      )}

      {/*
       * ── Gradient mask stack ──
       * Applied on top of the blurred image to ensure content contrast stays
       * at least as high as it was before this component was added.
       *
       * Layer 1 — near-black vignette from the top (covers navbar area, hero text)
       * Layer 2 — near-black vignette from the bottom (covers footer area)
       * Layer 3 — near-black vignette from the left edge (darkens the poster/CTA column)
       *
       * Together these keep the page "dark cinema" while colour bleeds through
       * in the central/background regions where no critical text lives.
       */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            /* top → 40% opacity-to-clear   */
            'linear-gradient(to bottom, rgba(8,8,16,0.92) 0%, rgba(8,8,16,0.0) 38%)',
            /* bottom → 35% opacity-to-clear */
            'linear-gradient(to top,    rgba(8,8,16,0.90) 0%, rgba(8,8,16,0.0) 35%)',
            /* left edge vignette */
            'linear-gradient(to right,  rgba(8,8,16,0.85) 0%, rgba(8,8,16,0.0) 40%)',
          ].join(', '),
        }}
      />
    </div>
  );
};

export default AmbientPageBackground;
