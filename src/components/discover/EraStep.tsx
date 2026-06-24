/**
 * EraStep.tsx
 *
 * Step 4 — "When were you in the mood for?"
 * Five era options with decade badges.
 */
import { motion } from 'framer-motion';
import { Sparkles, Clapperboard, Film, Archive, Shuffle } from 'lucide-react';
import type { EraType } from '../../lib/moodEngine';

interface EraStepProps {
  onSelect: (era: EraType) => void;
  selected: EraType | null;
}

const ERA_OPTIONS: {
  id: EraType;
  label: string;
  description: string;
  icon: typeof Sparkles;
}[] = [
  { id: 'latest', label: 'Latest releases', description: 'Fresh from the last 3 years', icon: Sparkles },
  { id: '2010s', label: '2010s', description: 'The streaming decade', icon: Clapperboard },
  { id: '2000s', label: '2000s', description: 'Y2K era gems', icon: Film },
  { id: 'classic', label: 'Classics', description: 'The golden age (pre-2000)', icon: Archive },
  { id: 'any', label: 'Anytime', description: 'Surprise me from any era', icon: Shuffle },
];

const EraStep = ({ onSelect, selected }: EraStepProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-8 md:mb-10">
        <h2 className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-wide text-white mb-2">
          What era are you in the mood for?
        </h2>
        <p className="text-sm md:text-base" style={{ color: 'rgba(245, 245, 245, 0.6)' }}>
          Every decade has its masterpieces
        </p>
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        {ERA_OPTIONS.map((option, i) => {
          const isSelected = selected === option.id;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.id}
              onClick={() => onSelect(option.id)}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 md:gap-5 rounded-2xl p-4 md:p-5 text-left transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
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
              aria-label={`${option.label}: ${option.description}`}
              aria-pressed={isSelected}
              id={`era-${option.id}`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                style={{
                  background: isSelected
                    ? 'rgba(212, 164, 55, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <Icon
                  className="w-5 h-5 transition-colors duration-300"
                  style={{ color: isSelected ? '#D4A437' : 'rgba(245, 245, 245, 0.7)' }}
                />
              </div>
              <div>
                <span className="font-bebas text-lg md:text-xl tracking-wide text-white block">
                  {option.label}
                </span>
                <span className="text-xs md:text-sm" style={{ color: 'rgba(245, 245, 245, 0.5)' }}>
                  {option.description}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default EraStep;
