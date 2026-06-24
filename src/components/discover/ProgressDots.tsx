/**
 * ProgressDots.tsx
 *
 * Renders 4 small dots at the top of the quiz indicating the user's progress.
 * Completed steps = gold, active step = crimson pulse, upcoming = muted.
 */
import { motion, useReducedMotion } from 'framer-motion';

interface ProgressDotsProps {
  currentStep: number; // 0-indexed (0 = mood, 1 = audience, 2 = time, 3 = era)
  totalSteps?: number;
}

const ProgressDots = ({ currentStep, totalSteps = 4 }: ProgressDotsProps) => {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className="flex items-center justify-center gap-3"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;

        return (
          <motion.div
            key={i}
            className="relative"
            initial={false}
            animate={{
              scale: isActive ? 1.3 : 1,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Pulse ring for active dot */}
            {isActive && !prefersReduced && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: '#B91C1C' }}
                animate={{
                  scale: [1, 2.2, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            <div
              className="w-2.5 h-2.5 rounded-full relative z-10 transition-colors duration-300"
              style={{
                backgroundColor: isCompleted
                  ? '#D4A437'
                  : isActive
                    ? '#B91C1C'
                    : 'rgba(245, 245, 245, 0.2)',
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProgressDots;
