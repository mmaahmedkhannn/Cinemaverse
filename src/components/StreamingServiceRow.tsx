/**
 * StreamingServiceRow.tsx
 *
 * Horizontal scrollable row of 7 streaming service circular logo buttons.
 * Displayed on the homepage between the hero section and the trending row.
 * On desktop: all 7 inline with spacing.
 * On mobile: horizontal scroll with snap-x.
 * Each button links to /streaming/[slug].
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STREAMING_SERVICES, getServiceLogoUrl } from '../data/streamingServices';

const StreamingServiceRow = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-bebas text-3xl md:text-4xl lg:text-5xl text-white tracking-wide">
          Browse by Streaming Service
        </h2>
        <Link
          to="/movies"
          className="text-sm md:text-base font-sans font-semibold text-gray-400 hover:text-white transition-colors hidden sm:block"
        >
          All Movies →
        </Link>
      </div>

      <div
        className="flex gap-5 sm:gap-6 md:gap-10 lg:gap-12 overflow-x-auto pb-4 snap-x snap-mandatory justify-start lg:justify-center w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {STREAMING_SERVICES.map((service, i) => {
          const isHovered = hoveredIndex === i;
          return (
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
                className="flex flex-col items-center gap-4 group"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Logo circle */}
                <div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-2 transition-all duration-300 ease-out"
                  style={{
                    background: '#0d0d15',
                    borderColor: isHovered ? service.color : 'rgba(255, 255, 255, 0.1)',
                    transform: isHovered ? 'translateY(-6px)' : 'none',
                    boxShadow: isHovered
                      ? `0 12px 35px ${service.color}50, 0 0 15px ${service.color}20`
                      : '0 4px 20px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <img
                    src={getServiceLogoUrl(service.logoPath)}
                    alt={service.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Hover brand glow overlay */}
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{
                      boxShadow: `inset 0 0 25px ${service.color}70`,
                    }}
                  />
                </div>

                {/* Service name */}
                <span
                  className="text-xs sm:text-sm md:text-base font-sans font-bold transition-colors duration-300 text-center whitespace-nowrap"
                  style={{
                    color: isHovered ? '#ffffff' : 'rgba(156, 163, 175, 1)',
                  }}
                >
                  {service.name}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default StreamingServiceRow;
