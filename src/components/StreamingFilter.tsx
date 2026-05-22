/**
 * StreamingFilter.tsx
 *
 * Horizontal scrollable chip row for filtering Movies and TV Shows pages
 * by streaming service. "All" chip resets the filter. Active chip shows
 * red highlight. Passes with_watch_providers + watch_region to the parent
 * page's query params.
 */
import { STREAMING_SERVICES, getServiceLogoUrl } from '../data/streamingServices';

interface StreamingFilterProps {
  activeProviderId: number | null;
  onSelect: (providerId: number | null) => void;
}

const StreamingFilter = ({ activeProviderId, onSelect }: StreamingFilterProps) => {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-sans text-gray-500 uppercase tracking-wider font-bold mb-3">
        Streaming Service
      </h3>
      <div
        className="flex gap-2 overflow-x-auto pb-1 snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* "All" chip */}
        <button
          id="streaming-filter-all"
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 snap-start px-4 py-2 rounded-full font-sans text-sm font-semibold transition-all duration-300 min-h-[44px] min-w-[44px] ${
            activeProviderId === null
              ? 'bg-primary text-white shadow-lg shadow-primary/30 border border-primary'
              : 'bg-transparent text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
          }`}
        >
          All
        </button>

        {/* Service chips */}
        {STREAMING_SERVICES.map((service) => {
          const isActive = activeProviderId === service.id;
          return (
            <button
              key={service.slug}
              id={`streaming-filter-${service.slug}`}
              onClick={() => onSelect(isActive ? null : service.id)}
              aria-pressed={isActive}
              className={`flex-shrink-0 snap-start flex items-center gap-2 px-3 py-2 rounded-full font-sans text-sm font-semibold transition-all duration-300 min-h-[44px] border ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 border-primary'
                  : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              <img
                src={getServiceLogoUrl(service.logoPath)}
                alt=""
                aria-hidden="true"
                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
              />
              <span className="whitespace-nowrap">{service.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StreamingFilter;
