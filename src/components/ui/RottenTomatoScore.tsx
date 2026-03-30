interface RottenTomatoScoreProps {
  score: number | null | undefined;
  size?: 'sm' | 'lg';
}

const RottenTomatoScore = ({ score, size = 'sm' }: RottenTomatoScoreProps) => {
  if (score == null) return null;

  const isFresh = score >= 60;
  const sizeClasses = size === 'lg'
    ? 'px-3.5 py-2 text-base gap-2'
    : 'px-2 py-1 text-xs gap-1.5';

  return (
    <div
      className={`inline-flex items-center font-sans font-bold rounded-full border backdrop-blur-md transition-all ${sizeClasses} ${
        isFresh
          ? 'bg-red-500/15 border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
          : 'bg-white/5 border-white/15 text-gray-400'
      }`}
      title={`Rotten Tomatoes: ${score}%`}
    >
      <span className={size === 'lg' ? 'text-lg' : 'text-sm'}>{isFresh ? '🍅' : '🥔'}</span>
      <span>{score}%</span>
    </div>
  );
};

export default RottenTomatoScore;
