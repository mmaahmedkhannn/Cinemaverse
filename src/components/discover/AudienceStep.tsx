/**
 * AudienceStep.tsx
 *
 * Step 2 — premium audience selection with large icon cards,
 * gradient borders, and cinematic hover effects.
 */
import { motion } from 'framer-motion';
import { User, Heart, Users, Home } from 'lucide-react';
import type { AudienceType } from '../../lib/moodEngine';

interface AudienceStepProps {
  onSelect: (audience: AudienceType) => void;
  selected: AudienceType | null;
}

const AUDIENCE_OPTIONS: {
  id: AudienceType;
  label: string;
  description: string;
  icon: typeof User;
}[] = [
  { id: 'solo', label: 'Solo', description: 'Just me, myself, and I', icon: User },
  { id: 'couple', label: 'With a partner', description: 'Cozy night for two', icon: Heart },
  { id: 'group', label: 'With friends', description: 'The more the merrier', icon: Users },
  { id: 'family', label: 'With family', description: 'Something everyone can enjoy', icon: Home },
];

const AudienceStep = ({ onSelect, selected }: AudienceStepProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 md:mb-12">
        <motion.h2
          className="font-bebas text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] text-white mb-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Who's watching?
        </motion.h2>
        <motion.p
          className="text-sm md:text-base font-sans"
          style={{ color: 'rgba(212, 164, 55, 0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          This helps us tailor the vibe
        </motion.p>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4" style={{ perspective: '1000px' }}>
        {AUDIENCE_OPTIONS.map((option, i) => {
          const isSelected = selected === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() => onSelect(option.id)}
              initial={{ opacity: 0, x: -40, rotateX: -15, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, rotateX: 0, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover="hover"
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
                  : '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                transformStyle: 'preserve-3d',
              }}
              aria-label={`${option.label}: ${option.description}`}
              aria-pressed={isSelected}
              id={`audience-${option.id}`}
            >
              {/* Animated Background Hover Glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, rgba(212, 164, 55, 0.1) 0%, transparent 60%)',
                }}
                variants={{
                  hover: { opacity: 1, scale: 1.05 },
                  rest: { opacity: 0, scale: 1 }
                }}
                initial="rest"
                transition={{ duration: 0.4 }}
              />

              {/* Icon container with float animation */}
              <motion.div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(212, 164, 55, 0.3) 0%, rgba(212, 164, 55, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: isSelected
                    ? '1px solid rgba(212, 164, 55, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? '0 0 20px rgba(212, 164, 55, 0.2)' : 'none',
                }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3 + Math.random(), repeat: Infinity, ease: 'easeInOut', delay: Math.random() }}
                variants={{
                  hover: { scale: 1.1, rotate: [-5, 5, 0] }
                }}
              >
                <option.icon 
                  className="w-6 h-6 transition-colors duration-300" 
                  style={{ color: isSelected ? '#D4A437' : '#F5F5F5' }} 
                />
              </motion.div>

              {/* Text */}
              <div className="relative z-10">
                <motion.span 
                  className="font-bebas text-lg sm:text-xl tracking-wider text-white block"
                  variants={{
                    hover: { color: '#D4A437', x: 4 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {option.label}
                </motion.span>
                <motion.span 
                  className="text-xs sm:text-sm font-sans block" 
                  style={{ color: 'rgba(245, 245, 245, 0.5)' }}
                  variants={{
                    hover: { opacity: 0.9, x: 4 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {option.description}
                </motion.span>
              </div>

              {/* Right arrow hint animated */}
              <motion.div
                className="ml-auto relative z-10"
                style={{ color: 'rgba(212, 164, 55, 0.8)' }}
                variants={{
                  hover: { opacity: 1, x: 0, scale: 1.2 },
                  rest: { opacity: 0, x: -10, scale: 1 }
                }}
                initial="rest"
                transition={{ duration: 0.3 }}
              >
                →
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default AudienceStep;
