/**
 * MoodStep.tsx
 *
 * Step 1 of the Mood Discovery quiz — a responsive grid of 15 mood cards.
 * Glassmorphism cards with emoji, label, and description.
 * Hover: scale 1.05, gold border. Selected: crimson gradient with gold ring.
 */
import { motion } from 'framer-motion';
import { MOODS } from '../../data/moods';

interface MoodStepProps {
  onSelect: (moodId: string) => void;
  selected: string | null;
}

const MoodStep = ({ onSelect, selected }: MoodStepProps) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="text-center mb-8 md:mb-10">
        <h2 className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-wide text-white mb-2">
          What's your mood?
        </h2>
        <p className="text-sm md:text-base" style={{ color: 'rgba(245, 245, 245, 0.6)' }}>
          Pick the one that resonates most right now
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {MOODS.map((mood, i) => {
          const isSelected = selected === mood.id;

          return (
            <motion.button
              key={mood.id}
              onClick={() => onSelect(mood.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4, ease: 'easeOut' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="relative group rounded-2xl p-4 md:p-5 text-left transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(185, 28, 28, 0.4) 0%, rgba(127, 29, 29, 0.3) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isSelected
                  ? '2px solid rgba(212, 164, 55, 0.8)'
                  : '1px solid rgba(212, 164, 55, 0.15)',
                boxShadow: isSelected
                  ? '0 0 30px rgba(212, 164, 55, 0.15), inset 0 0 30px rgba(185, 28, 28, 0.1)'
                  : 'none',
              }}
              aria-label={`${mood.label}: ${mood.description}`}
              aria-pressed={isSelected}
              id={`mood-${mood.id}`}
            >
              {/* Gold corner accent on hover */}
              <div
                className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle at top right, rgba(212, 164, 55, 0.2) 0%, transparent 70%)',
                  borderRadius: '0 16px 0 0',
                }}
              />

              <span className="text-2xl md:text-3xl block mb-2">{mood.emoji}</span>
              <span className="font-bebas text-base md:text-lg tracking-wide text-white block mb-1 leading-tight">
                {mood.label}
              </span>
              <span
                className="text-xs leading-snug block"
                style={{ color: 'rgba(245, 245, 245, 0.5)' }}
              >
                {mood.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodStep;
