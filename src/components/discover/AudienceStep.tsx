/**
 * AudienceStep.tsx
 *
 * Step 2 — "Are you watching alone or with someone?"
 * Four option cards with icons, labels, and sub-descriptions.
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
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-8 md:mb-10">
        <h2 className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-wide text-white mb-2">
          Who's watching?
        </h2>
        <p className="text-sm md:text-base" style={{ color: 'rgba(245, 245, 245, 0.6)' }}>
          This helps us tailor the vibe
        </p>
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        {AUDIENCE_OPTIONS.map((option, i) => {
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
              id={`audience-${option.id}`}
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

export default AudienceStep;
