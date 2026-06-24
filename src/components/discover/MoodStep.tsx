/**
 * MoodStep.tsx
 *
 * Step 1 — premium mood grid. Large emoji, glassmorphism cards with
 * animated gradient borders, inner glow on hover, gold accents,
 * and cinematic selection state.
 */
import { motion } from 'framer-motion';
import { MOODS } from '../../data/moods';

interface MoodStepProps {
  onSelect: (moodId: string) => void;
  selected: string | null;
}

const MoodStep = ({ onSelect, selected }: MoodStepProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <motion.h2
          className="font-bebas text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] text-white mb-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          What's your mood?
        </motion.h2>
        <motion.p
          className="text-sm md:text-base font-sans"
          style={{ color: 'rgba(212, 164, 55, 0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Pick the one that resonates most right now
        </motion.p>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {MOODS.map((mood, i) => {
          const isSelected = selected === mood.id;

          return (
            <motion.button
              key={mood.id}
              onClick={() => onSelect(mood.id)}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.035, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.96 }}
              className="group relative rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060609]"
              style={{
                background: isSelected
                  ? 'linear-gradient(145deg, rgba(185, 28, 28, 0.5) 0%, rgba(100, 20, 20, 0.4) 100%)'
                  : 'linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: isSelected
                  ? '1.5px solid rgba(212, 164, 55, 0.8)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isSelected
                  ? '0 0 40px rgba(212, 164, 55, 0.2), 0 0 80px rgba(185, 28, 28, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 2px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
              aria-label={`${mood.label}: ${mood.description}`}
              aria-pressed={isSelected}
              id={`mood-${mood.id}`}
            >
              {/* Hover glow overlay */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(212, 164, 55, 0.1) 0%, transparent 60%)',
                }}
              />

              {/* Hover border glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  border: '1px solid rgba(212, 164, 55, 0.35)',
                }}
              />

              {/* Selected gold ring pulse */}
              {isSelected && (
                <motion.div
                  className="absolute -inset-[2px] rounded-2xl pointer-events-none"
                  style={{ border: '2px solid rgba(212, 164, 55, 0.4)' }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Emoji — big and prominent */}
              <span className="text-3xl sm:text-4xl block mb-3 relative z-10 drop-shadow-lg">
                {mood.emoji}
              </span>

              {/* Label */}
              <span className="font-bebas text-sm sm:text-base tracking-wider text-white block mb-1 leading-tight relative z-10">
                {mood.label}
              </span>

              {/* Description */}
              <span
                className="text-[10px] sm:text-xs leading-snug block relative z-10"
                style={{ color: 'rgba(245, 245, 245, 0.45)' }}
              >
                {mood.description}
              </span>

              {/* Bottom gold accent line on hover */}
              <div
                className="absolute bottom-0 left-[10%] right-[10%] h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(212, 164, 55, 0.5), transparent)',
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodStep;
