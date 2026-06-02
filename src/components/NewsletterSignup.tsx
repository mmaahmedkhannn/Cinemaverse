import { useEffect, useRef, useState } from 'react';

interface NewsletterSignupProps {
  variant?: 'hero' | 'inline' | 'footer';
}

export function NewsletterSignup({ variant = 'hero' }: NewsletterSignupProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const formId = import.meta.env.VITE_BEEHIIV_FORM_ID as string | undefined;

  // Build embed URL with UTM referrer (same as Beehiiv's own loader does)
  const embedUrl = formId
    ? `https://embeds.beehiiv.com/${formId}?referrer=${encodeURIComponent(window.location.href)}`
    : null;

  // IntersectionObserver: delay iframe src assignment until section enters viewport.
  // The iframe src is only set once isVisible === true, so the network request
  // doesn't fire until the section is close to the viewport (improves LCP).
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
      { rootMargin: '200px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Implement the Beehiiv parent-side postMessage protocol so the iframe
  // auto-sizes correctly (same as loader.js does internally):
  //   1. iframe sends  beehiiv:child-loaded  → we reply beehiiv:parent-loaded
  //   2. iframe sends  beehiiv:styles        → we set the iframe height
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!iframeRef.current) return;
      if (e.source !== iframeRef.current.contentWindow) return;

      const msg = e.data as { type?: string; payload?: { height?: string; width?: string } };

      if (msg?.type === 'beehiiv:child-loaded') {
        // Expand to full-width so the iframe can measure itself, then tell it we're ready
        iframeRef.current.style.height = '2000px';
        iframeRef.current.style.width = '100%';
        iframeRef.current.contentWindow?.postMessage({ type: 'beehiiv:parent-loaded' }, '*');
      } else if (msg?.type === 'beehiiv:styles' && msg?.payload?.height) {
        iframeRef.current.style.height = msg.payload.height;
        if (msg.payload.width) iframeRef.current.style.width = msg.payload.width;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ── Fallback when env var is missing ────────────────────────────────────
  const Fallback = () => (
    <p className="font-sans text-sm text-white/50 text-center py-4">
      Newsletter coming soon — check back on Friday.
    </p>
  );

  // ── Shared iframe element (src only set once in viewport) ────────────────
  const BeehiivIframe = () =>
    formId && embedUrl ? (
      <iframe
        ref={iframeRef}
        src={isVisible ? embedUrl : undefined}
        width="100%"
        height="52"
        frameBorder="0"
        scrolling="no"
        title="Newsletter signup — CinemaDiscovery Weekly Reel"
        style={{ border: 'none', display: 'block', overflow: 'hidden' }}
        data-test-id="beehiiv-embed"
      />
    ) : (
      <Fallback />
    );

  // ── Variant: hero (homepage) ─────────────────────────────────────────────
  if (variant === 'hero') {
    return (
      <section
        ref={sectionRef}
        aria-label="Newsletter signup"
        className="relative w-full py-20 md:py-28 overflow-hidden"
      >
        {/* Deep near-black base */}
        <div className="absolute inset-0 bg-[#080810]" />

        {/* Ambient crimson radial glow */}
        <div
          className="absolute inset-0 motion-safe:animate-[breathe_11s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(127,29,29,0.20) 0%, rgba(8,8,16,0.0) 70%), radial-gradient(ellipse 100% 100% at 50% 50%, #080810 60%, transparent 100%)',
          }}
        />

        {/* Subtle film grain */}
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
          <span
            className="font-bebas tracking-[0.2em] text-sm mb-6"
            style={{ color: '#D4A437' }}
          >
            THE WEEKLY REEL
          </span>

          <div className="w-full max-w-[520px]">
            <BeehiivIframe />
          </div>

          <p className="mt-4 font-sans text-xs text-white/60 text-center">
            Join early. Be the first to read every Friday.
          </p>
        </div>
      </section>
    );
  }

  // ── Variant: inline (blog article end) ──────────────────────────────────
  if (variant === 'inline') {
    return (
      <section
        ref={sectionRef}
        aria-label="Newsletter signup"
        className="w-full py-12 md:py-16 border-y border-red-900/40 bg-[#080810]"
      >
        <div className="flex flex-col items-center px-4">
          <span
            className="font-bebas tracking-[0.18em] text-xs mb-6 text-center"
            style={{ color: '#D4A437' }}
          >
            KEEP READING — JOIN THE NEWSLETTER
          </span>

          <div className="w-full max-w-[480px]">
            <BeehiivIframe />
          </div>
        </div>
      </section>
    );
  }

  // ── Variant: footer ──────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      aria-label="Newsletter signup"
      className="w-full py-8 md:py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <span className="font-bebas tracking-[0.18em] text-sm text-white mb-6">
          GET THE FRIDAY REEL
        </span>

        <div className="w-full max-w-[440px]">
          <BeehiivIframe />
        </div>
      </div>
    </section>
  );
}

export default NewsletterSignup;
