/**
 * MoodStep.tsx
 *
 * Step 1 — premium mood grid. Large emoji, glassmorphism cards with
 * animated gradient borders, inner glow on hover, gold accents,
 * and cinematic selection state.
 */
import { motion } from 'framer-motion';
import { MOODS } from '../../data/moods';
import { 
  Ghost, Smile, Droplets, HeartCrack, 
  Sparkles, Brain, Coffee, Heart, 
  Dices, Sun, Rocket, Zap, 
  Eye, Video, Gem 
} from 'lucide-react';

const MOOD_ICONS: Record<string, any> = {
  'scared': Ghost,
  'laugh': Smile,
  'cry': Droplets,
  'breakup': HeartCrack,
  'inspired': Sparkles,
  'mindbender': Brain,
  'background': Coffee,
  'datenight': Heart,
  'surprise': Dices,
  'comfort': Sun,
  'escape': Rocket,
  'adrenaline': Zap,
  'deep': Eye,
  'nostalgia': Video,
  'hidden-gem': Gem,
};

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4" style={{ perspective: '1000px' }}>
        {MOODS.map((mood, i) => {
          const isSelected = selected === mood.id;
          const Icon = MOOD_ICONS[mood.id] || Sparkles;

          return (
            <motion.button
              key={mood.id}
              onClick={() => onSelect(mood.id)}
              initial={{ opacity: 0, y: 30, rotateX: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              className="group relative rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060609]"
              style={{
                background: isSelected
                  ? 'linear-gradient(145deg, rgba(185, 28, 28, 0.5) 0%, rgba(100, 20, 20, 0.4) 100%)'
                  : 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                border: isSelected
                  ? '1.5px solid rgba(212, 164, 55, 0.8)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: isSelected
                  ? '0 0 40px rgba(212, 164, 55, 0.2), 0 0 80px rgba(185, 28, 28, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                transformStyle: 'preserve-3d',
              }}
              aria-label={`${mood.label}: ${mood.description}`}
              aria-pressed={isSelected}
              id={`mood-${mood.id}`}
            >
              {/* Animated Background Hover Glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 0%, rgba(212, 164, 55, 0.15) 0%, transparent 70%)',
                }}
                variants={{
                  hover: { opacity: 1, scale: 1.1 },
                  rest: { opacity: 0, scale: 1 }
                }}
                initial="rest"
                transition={{ duration: 0.4 }}
              />

              {/* Selected gold ring pulse */}
              {isSelected && (
                <motion.div
                  className="absolute -inset-[2px] rounded-2xl pointer-events-none"
                  style={{ border: '2px solid rgba(212, 164, 55, 0.5)' }}
                  animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.02, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Icon — floating animation */}
              <motion.div 
                className="w-12 h-12 mb-4 relative z-10 rounded-xl flex items-center justify-center"
                style={{
                  background: isSelected ? 'linear-gradient(135deg, rgba(212, 164, 55, 0.3), rgba(212, 164, 55, 0.1))' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                  border: isSelected ? '1px solid rgba(212, 164, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? '0 0 20px rgba(212, 164, 55, 0.2)' : 'none',
                }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3 + Math.random(), repeat: Infinity, ease: 'easeInOut', delay: Math.random() }}
                variants={{
                  hover: { scale: 1.15, rotate: [-5, 5, 0], y: -5 }
                }}
              >
                <Icon 
                  className="w-6 h-6 transition-colors duration-300" 
                  style={{ color: isSelected ? '#D4A437' : '#F5F5F5' }} 
                />
              </motion.div>

              {/* Label */}
              <motion.span 
                className="font-bebas text-base sm:text-lg tracking-wider text-white block mb-1 leading-tight relative z-10"
                variants={{
                  hover: { color: '#D4A437', x: 2 }
                }}
                transition={{ duration: 0.3 }}
              >
                {mood.label}
              </motion.span>

              {/* Description */}
              <motion.span
                className="text-[10px] sm:text-xs leading-snug block relative z-10"
                style={{ color: 'rgba(245, 245, 245, 0.5)' }}
                variants={{
                  hover: { opacity: 0.9, x: 2 }
                }}
                transition={{ duration: 0.3 }}
              >
                {mood.description}
              </motion.span>

              {/* Bottom animated gold line */}
              <motion.div
                className="absolute bottom-0 left-0 h-[2px]"
                style={{
                  background: 'linear-gradient(90deg, #D4A437, #F5F5F5)',
                }}
                variants={{
                  hover: { width: '100%', opacity: 0.8 },
                  rest: { width: '0%', opacity: 0 }
                }}
                initial="rest"
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodStep;
