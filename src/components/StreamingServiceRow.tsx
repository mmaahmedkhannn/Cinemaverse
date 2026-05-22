/**
 * StreamingServiceRow.tsx
 *
 * Horizontal scrollable row of 7 streaming service circular logo buttons.
 * Displayed on the homepage between the hero section and the trending row.
 * On desktop: all 7 inline with spacing.
 * On mobile: horizontal scroll with snap-x.
 * Each button links to /streaming/[slug].
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STREAMING_SERVICES, getServiceLogoUrl } from '../data/streamingServices';

const StreamingServiceRow = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bebas text-3xl md:text-4xl text-white tracking-wide">
          Browse by Streaming Service
        </h2>
        <Link
          to="/movies"
          className="text-sm font-sans text-gray-400 hover:text-white transition-colors hidden sm:block"
        >
          All Movies →
        </Link>
      </div>

      <div
        className="flex gap-4 md:gap-6 overflow-x-auto pb-3 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {STREAMING_SERVICES.map((service, i) => (
          <motion.div
            key={service.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="flex-shrink-0 snap-start"
          >
            <Link
              to={`/streaming/${service.slug}`}
              id={`streaming-btn-${service.slug}`}
              aria-label={`Browse ${service.name} content`}
              className="flex flex-col items-center gap-3 group"
            >
              {/* Logo circle */}
              <div
                className="relative w-[72px] h-[72px] md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.7)] group-hover:-translate-y-1"
                style={{ background: '#111' }}
              >
                <img
                  src={getServiceLogoUrl(service.logoPath)}
                  alt={service.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Hover glow ring */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `inset 0 0 20px ${service.color}40` }}
                />
              </div>

              {/* Service name */}
              <span className="text-xs md:text-sm font-sans font-semibold text-gray-400 group-hover:text-white transition-colors duration-300 text-center whitespace-nowrap">
                {service.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StreamingServiceRow;
