/**
 * TimeStep.tsx
 *
 * Step 3 — premium time selection with emoji icons and cinematic cards.
 */
import { motion } from 'framer-motion';
import type { TimeType } from '../../lib/moodEngine';

interface TimeStepProps {
  onSelect: (time: TimeType) => void;
  selected: TimeType | null;
}

const TIME_OPTIONS: {
  id: TimeType;
  label: string;
  description: string;
  emoji: string;
}[] = [
  { id: 'short', label: 'Under 90 minutes', description: 'Quick and punchy', emoji: '⚡' },
  { id: 'medium', label: '90 min to 2 hours', description: 'The sweet spot', emoji: '⏱️' },
  { id: 'long', label: '2 to 3 hours', description: 'Epic territory', emoji: '🎬' },
  { id: 'any', label: 'All night long', description: 'No time limit — bring it on', emoji: '🌙' },
];

const TimeStep = ({ onSelect, selected }: TimeStepProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 md:mb-12">
        <motion.h2
          className="font-bebas text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] text-white mb-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          How much time do you have?
        </motion.h2>
        <motion.p
          className="text-sm md:text-base font-sans"
          style={{ color: 'rgba(212, 164, 55, 0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          We'll match the runtime to your schedule
        </motion.p>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        {TIME_OPTIONS.map((option, i) => {
          const isSelected = selected === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() => onSelect(option.id)}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02, x: 8 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-4 sm:gap-5 rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060609]"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(185, 28, 28, 0.45) 0%, rgba(100, 20, 20, 0.35) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: isSelected
                  ? '1.5px solid rgba(212, 164, 55, 0.7)'
                  : '1px solid rgba(255, 255, 255, 0.07)',
                boxShadow: isSelected
                  ? '0 0 40px rgba(212, 164, 55, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 2px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
              aria-label={`${option.label}: ${option.description}`}
              aria-pressed={isSelected}
              id={`time-${option.id}`}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, rgba(212, 164, 55, 0.06) 0%, transparent 60%)',
                  border: '1px solid rgba(212, 164, 55, 0.2)',
                }}
              />

              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl relative z-10"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(212, 164, 55, 0.25) 0%, rgba(212, 164, 55, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected
                    ? '1px solid rgba(212, 164, 55, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                {option.emoji}
              </div>

              <div className="relative z-10">
                <span className="font-bebas text-lg sm:text-xl tracking-wider text-white block">
                  {option.label}
                </span>
                <span className="text-xs sm:text-sm font-sans" style={{ color: 'rgba(245, 245, 245, 0.45)' }}>
                  {option.description}
                </span>
              </div>

              <div
                className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 relative z-10"
                style={{ color: 'rgba(212, 164, 55, 0.6)' }}
              >
                →
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeStep;
