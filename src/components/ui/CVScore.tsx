import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Users, TrendingUp } from 'lucide-react';

interface CVScoreProps {
  voteAverage: number;
  voteCount: number;
  popularity: number;
  compact?: boolean;
}

const getTier = (score: number) => {
  if (score >= 9) return { label: 'LEGENDARY', color: '#FFD700', glow: 'rgba(255, 215, 0, 0.4)', ring: '#FFD700' };
  if (score >= 8) return { label: 'EXCELLENT', color: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)', ring: '#22c55e' };
  if (score >= 7) return { label: 'GREAT', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', ring: '#3b82f6' };
  return { label: '', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.2)', ring: '#94a3b8' };
};

const formatPopularity = (p: number) => {
  if (p >= 1000) return `${(p / 1000).toFixed(1)}K`;
  return p.toFixed(0);
};

const CVScore = ({ voteAverage, voteCount, popularity, compact }: CVScoreProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const score = Math.round(voteAverage * 10) / 10;
  const tier = getTier(score);
  const pct = (score / 10) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="relative w-10 h-10 flex items-center justify-center rounded-full"
          style={{ boxShadow: `0 0 12px ${tier.glow}` }}
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="2.5" />
            <motion.circle
              cx="20" cy="20" r="17" fill="none" stroke={tier.ring} strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 17}
              initial={{ strokeDashoffset: 2 * Math.PI * 17 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 17) - (pct / 100) * (2 * Math.PI * 17) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <span className="text-xs font-bold" style={{ color: tier.color }}>{score}</span>
        </div>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">CV</span>
      </div>
    );
  }

  return (
    <div
      className="relative inline-flex flex-col items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main Score Circle */}
      <div
        className="relative w-32 h-32 flex items-center justify-center"
        style={{ filter: `drop-shadow(0 0 20px ${tier.glow})` }}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="5" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none" stroke={tier.ring} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="flex flex-col items-center z-10">
          <motion.span
            className="text-4xl font-bebas tracking-wide"
            style={{ color: tier.color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-gray-400 -mt-1">/ 10</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm font-bebas tracking-widest" style={{ color: tier.color }}>
          CV SCORE {tier.label && `· ${tier.label}`} — Powered by TMDB
        </p>
        <p className="text-xs text-gray-400 font-sans italic mt-1 font-semibold">
          "The most accurate score on earth"
        </p>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-3 z-50 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl"
        >
          <h4 className="text-xs font-bebas tracking-wider text-white mb-3">SCORE BREAKDOWN</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-300">TMDB Rating</span>
              </div>
              <span className="text-sm font-bold text-white">{score} / 10</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: tier.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-300">Vote Count</span>
              </div>
              <span className="text-sm font-bold text-white">{voteCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-300">Popularity</span>
              </div>
              <span className="text-sm font-bold text-white">{formatPopularity(popularity)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-[10px] text-gray-500 text-center">
              Based on {voteCount.toLocaleString()} community votes on TMDB
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CVScore;
