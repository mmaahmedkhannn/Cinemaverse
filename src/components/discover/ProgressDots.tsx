/**
 * ProgressDots.tsx
 *
 * Premium 3-dot progress indicator with gold/crimson states,
 * connecting lines, and pulse animation on active dot.
 */
import { motion, useReducedMotion } from 'framer-motion';

interface ProgressDotsProps {
  currentStep: number;
  totalSteps?: number;
}

const ProgressDots = ({ currentStep, totalSteps = 3 }: ProgressDotsProps) => {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className="flex items-center justify-center gap-0"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const isLast = i === totalSteps - 1;

        return (
          <div key={i} className="flex items-center">
            {/* Dot */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={false}
              animate={{ scale: isActive ? 1 : 1 }}
            >
              {/* Pulse ring for active */}
              {isActive && !prefersReduced && (
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 28,
                    height: 28,
                    border: '1.5px solid rgba(212, 164, 55, 0.4)',
                  }}
                  animate={{
                    scale: [1, 1.8],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              )}

              {/* Dot itself */}
              <motion.div
                animate={{
                  scale: isActive ? 1.4 : 1,
                  backgroundColor: isCompleted
                    ? '#D4A437'
                    : isActive
                      ? '#D4A437'
                      : 'rgba(255, 255, 255, 0.15)',
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative z-10 rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  boxShadow: isCompleted || isActive
                    ? '0 0 12px rgba(212, 164, 55, 0.5)'
                    : 'none',
                }}
              />
            </motion.div>

            {/* Connecting line */}
            {!isLast && (
              <div className="relative mx-1.5" style={{ width: 32, height: 2 }}>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  animate={{
                    width: isCompleted ? '100%' : '0%',
                    backgroundColor: '#D4A437',
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressDots;
