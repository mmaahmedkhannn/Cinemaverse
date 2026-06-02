import { useEffect, useRef, useState } from 'react';

interface NewsletterSignupProps {
  variant?: 'hero' | 'inline' | 'footer';
}

export function NewsletterSignup({ variant = 'hero' }: NewsletterSignupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const formId = import.meta.env.VITE_BEEHIIV_FORM_ID as string | undefined;

  // IntersectionObserver: delay script injection until section enters viewport
  // Saves initial bundle size / improves LCP for above-the-fold content
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' } // Start loading 200px before viewport
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  // Inject Beehiiv script only once visible and formId is available
  useEffect(() => {
    if (!isVisible || !containerRef.current || !formId) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://subscribe-forms.beehiiv.com/v3/loader.js';
    script.setAttribute('data-beehiiv-form', formId);

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [isVisible, formId]);

  // ── Fallback when env var is missing ─────────────────────────────────────
  const Fallback = () => (
    <p className="font-sans text-sm text-white/50 text-center py-4">
      Newsletter coming soon — check back on Friday.
    </p>
  );

  // ── Variant: hero (homepage) ──────────────────────────────────────────────
  if (variant === 'hero') {
    return (
      <section
        ref={sectionRef}
        aria-label="Newsletter signup"
        className="relative w-full py-20 md:py-28 overflow-hidden"
      >
        {/* Deep near-black base */}
        <div className="absolute inset-0 bg-[#080810]" />

        {/* Ambient crimson radial glow — same technique as TrailerModal ambient */}
        <div
          className="absolute inset-0 motion-safe:animate-[breathe_11s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(127,29,29,0.20) 0%, rgba(8,8,16,0.0) 70%), radial-gradient(ellipse 100% 100% at 50% 50%, #080810 60%, transparent 100%)',
          }}
        />

        {/* Subtle film grain via SVG noise — very low opacity */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />

        {/* Top / bottom accent lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />

        <div className="relative z-10 flex flex-col items-center px-4">
          {/* Amber-gold label */}
          <span
            className="font-bebas tracking-[0.2em] text-sm mb-4"
            style={{ color: '#D4A437' }}
          >
            THE WEEKLY REEL
          </span>

          {/* Beehiiv embed container */}
          <div className="w-full max-w-[520px]">
            {formId ? (
              <div ref={containerRef} className="w-full" />
            ) : (
              <Fallback />
            )}
          </div>

          {/* Sub-label */}
          <p className="mt-4 font-sans text-xs text-white/60 text-center">
            Join early. Be the first to read every Friday.
          </p>
        </div>
      </section>
    );
  }

  // ── Variant: inline (blog article end) ───────────────────────────────────
  if (variant === 'inline') {
    return (
      <section
        ref={sectionRef}
        aria-label="Newsletter signup"
        className="w-full py-12 md:py-16 border-y border-red-900/40 bg-[#080810]"
      >
        <div className="flex flex-col items-center px-4">
          {/* Amber-gold mini-label */}
          <span
            className="font-bebas tracking-[0.18em] text-xs mb-4 text-center"
            style={{ color: '#D4A437' }}
          >
            KEEP READING — JOIN THE NEWSLETTER
          </span>

          {/* Beehiiv embed container */}
          <div className="w-full max-w-[480px]">
            {formId ? (
              <div ref={containerRef} className="w-full" />
            ) : (
              <Fallback />
            )}
          </div>
        </div>
      </section>
    );
  }

  // ── Variant: footer (above existing footer) ───────────────────────────────
  return (
    <section
      ref={sectionRef}
      aria-label="Newsletter signup"
      className="w-full py-8 md:py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* White label */}
        <span className="font-bebas tracking-[0.18em] text-sm text-white mb-4">
          GET THE FRIDAY REEL
        </span>

        {/* Beehiiv embed container */}
        <div className="w-full max-w-[440px]">
          {formId ? (
            <div ref={containerRef} className="w-full" />
          ) : (
            <Fallback />
          )}
        </div>
      </div>
    </section>
  );
}

export default NewsletterSignup;
