/**
 * AmazonAffiliateButton.tsx
 *
 * Renders a stylized CTA button linking out to an Amazon Prime Video search for the given title.
 * Automatically appends the platform's Amazon Associates affiliate tag to generate revenue.
 * Note: Uses rel="sponsored" to comply with FTC and search engine guidelines.
 */
export const AmazonAffiliateButton = ({ title, year }: { title: string, year?: string }) => {
  const encodedTitle = encodeURIComponent(`${title} ${year || ''}`.trim());
  const amazonUrl = `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video&tag=cinemadiscove-20`;

  return (
    <a
      href={amazonUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex items-center justify-center gap-2 bg-[#0a0a0a]/80 hover:bg-[#1a1a1a] border border-primary/50 hover:border-primary shadow-[0_0_15px_rgba(239,68,68,0.2)] text-white text-sm font-bold font-sans py-2.5 px-5 rounded-2xl transition-all duration-300 group hover:-translate-y-1 w-full md:w-auto"
    >
      <span className="flex flex-col text-left">
        <span className="text-white text-sm font-bold font-sans">Amazon</span>
        <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Buy or Rent</span>
      </span>
      <span className="text-gray-400 group-hover:text-white transition-colors ml-1 font-bold text-lg">→</span>
    </a>
  );
};
