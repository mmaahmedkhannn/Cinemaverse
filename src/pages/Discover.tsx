/**
 * Discover.tsx
 *
 * Flagship Mood Discovery Engine page. Orchestrates a 4-step quiz
 * (mood → audience → time → era) with Spotify-Wrapped-style transitions,
 * then queries TMDB and shows 10 curated film recommendations.
 *
 * Layout: full-screen fixed takeover during quiz, scrollable results after.
 * Background: cinematic dark base with crimson/gold radial gradients.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import SEO from '../components/SEO';
import ProgressDots from '../components/discover/ProgressDots';
import MoodStep from '../components/discover/MoodStep';
import AudienceStep from '../components/discover/AudienceStep';
import TimeStep from '../components/discover/TimeStep';
import EraStep from '../components/discover/EraStep';
import MoodResults from '../components/discover/MoodResults';
import { useMoodDiscovery } from '../hooks/useMoodDiscovery';
import type { QuizAnswers, AudienceType, TimeType, EraType } from '../lib/moodEngine';

/* ─── GA4 helper (typed for strict mode) ──────────────────────────────── */
function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      'event',
      eventName,
      params,
    );
  }
}

/* ─── Step transition variants (Spotify Wrapped style) ────────────────── */
const stepVariants = {
  enter: { opacity: 0, y: 25 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -25 },
};

/* ─── Background gradient hues per step ───────────────────────────────── */
const STEP_HUES = [
  'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(127, 29, 29, 0.18) 0%, transparent 70%)',
  'radial-gradient(ellipse 80% 50% at 40% 60%, rgba(120, 40, 80, 0.15) 0%, transparent 70%)',
  'radial-gradient(ellipse 80% 50% at 60% 40%, rgba(30, 64, 120, 0.12) 0%, transparent 70%)',
  'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(212, 164, 55, 0.10) 0%, transparent 70%)',
];

/* ─── JSON-LD Schema ──────────────────────────────────────────────────── */
const DISCOVER_SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CinemaDiscovery Mood Engine',
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'All',
  description: 'Mood-based movie discovery engine',
  url: 'https://cinemadiscovery.com/discover',
});

type QuizStep = 'mood' | 'audience' | 'time' | 'era';
const STEP_ORDER: QuizStep[] = ['mood', 'audience', 'time', 'era'];

const Discover = () => {
  const prefersReduced = useReducedMotion();

  /* ── Quiz state ─────────────────────────────────────────────────────── */
  const [currentStep, setCurrentStep] = useState(0); // 0–3 = quiz, 4 = results
  const [moodId, setMoodId] = useState<string | null>(null);
  const [audience, setAudience] = useState<AudienceType | null>(null);
  const [time, setTime] = useState<TimeType | null>(null);
  const [era, setEra] = useState<EraType | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);

  // Build quiz answers object (null until all selected)
  const quizAnswers: QuizAnswers | null =
    moodId && audience && time && era
      ? { moodId, audience, time, era }
      : null;

  const { data: results, refetch, isFetching, isError } = useMoodDiscovery(quizAnswers);

  /* ── GA4: track page visit ──────────────────────────────────────────── */
  useEffect(() => {
    trackEvent('mood_quiz_started');
  }, []);

  /* ── Step advancement helpers ───────────────────────────────────────── */
  const advanceStep = useCallback((stepName: string, answer: string) => {
    trackEvent('mood_quiz_step_completed', { step: currentStep + 1, step_name: stepName, answer });

    if (currentStep < 3) {
      setCurrentStep((s) => s + 1);
    } else {
      // Final step completed — trigger TMDB fetch
      setQuizComplete(true);
    }
  }, [currentStep]);

  const handleMoodSelect = useCallback((id: string) => {
    setMoodId(id);
    // Small delay so user sees selection state before transition
    setTimeout(() => advanceStep('mood', id), 300);
  }, [advanceStep]);

  const handleAudienceSelect = useCallback((val: AudienceType) => {
    setAudience(val);
    setTimeout(() => advanceStep('audience', val), 300);
  }, [advanceStep]);

  const handleTimeSelect = useCallback((val: TimeType) => {
    setTime(val);
    setTimeout(() => advanceStep('time', val), 300);
  }, [advanceStep]);

  const handleEraSelect = useCallback((val: EraType) => {
    setEra(val);
    setTimeout(() => advanceStep('era', val), 300);
  }, [advanceStep]);

  /* ── Trigger TMDB fetch when quiz completes ─────────────────────────── */
  useEffect(() => {
    if (quizComplete && quizAnswers) {
      trackEvent('mood_quiz_finished', { ...quizAnswers });
      refetch();
      setCurrentStep(4); // Move to results view
    }
  }, [quizComplete, quizAnswers, refetch]);

  /* ── Restart quiz ───────────────────────────────────────────────────── */
  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setMoodId(null);
    setAudience(null);
    setTime(null);
    setEra(null);
    setQuizComplete(false);
    trackEvent('mood_quiz_started');
  }, []);

  /* ── Show results once loaded ───────────────────────────────────────── */
  const showResults = currentStep === 4 && results && results.length > 0;
  const showLoading = currentStep === 4 && (isFetching || (!results && !isError));
  const showQuiz = currentStep < 4;

  return (
    <>
      <SEO
        title="Discover Movies by Mood | CinemaDiscovery"
        description="Tell us how you feel — we'll find the perfect movie. From heartbreak to horror, mind-benders to comfort watches. Personalized film discovery for any mood."
        url="https://cinemadiscovery.com/discover"
        keywords="movie recommendations, mood-based movies, movie quiz, discover movies, film recommendations, what to watch, movie finder"
        schema={DISCOVER_SCHEMA}
      />

      {/* ── Cinematic background (persists across all steps) ─────────── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -1, background: '#0a0a0f' }}
      >
        {/* Crimson/gold radial glow — hue shifts per step */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: showQuiz
              ? STEP_HUES[currentStep] || STEP_HUES[0]
              : 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(212, 164, 55, 0.08) 0%, transparent 70%)',
          }}
          transition={prefersReduced ? { duration: 0 } : { duration: 1.2, ease: 'easeInOut' }}
        />
        {/* Film grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />
        {/* Gold accent glow top-right */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px]"
          style={{
            background: 'radial-gradient(circle at top right, rgba(212, 164, 55, 0.04) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* ── Quiz container (full-screen takeover) ─────────────────────── */}
      {showQuiz && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-y-auto"
          role="region"
          aria-label="Movie mood quiz"
        >
          {/* Progress dots */}
          <div className="absolute top-6 md:top-8 left-0 right-0 z-10">
            <ProgressDots currentStep={currentStep} />
          </div>

          {/* Step content with AnimatePresence transitions */}
          <div className="w-full flex-1 flex items-center justify-center py-20 md:py-24" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={STEP_ORDER[currentStep]}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={
                  prefersReduced
                    ? { duration: 0.1 }
                    : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                }
                className="w-full"
              >
                {currentStep === 0 && (
                  <MoodStep onSelect={handleMoodSelect} selected={moodId} />
                )}
                {currentStep === 1 && (
                  <AudienceStep onSelect={handleAudienceSelect} selected={audience} />
                )}
                {currentStep === 2 && (
                  <TimeStep onSelect={handleTimeSelect} selected={time} />
                )}
                {currentStep === 3 && (
                  <EraStep onSelect={handleEraSelect} selected={era} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Loading state ─────────────────────────────────────────────── */}
      {showLoading && (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
          <motion.div
            className="w-12 h-12 rounded-full border-4 border-t-transparent"
            style={{ borderColor: '#D4A437', borderTopColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="font-bebas text-xl tracking-wide" style={{ color: 'rgba(245, 245, 245, 0.6)' }}>
            Curating your perfect picks...
          </p>
        </div>
      )}

      {/* ── Error state ───────────────────────────────────────────────── */}
      {isError && currentStep === 4 && (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
          <p className="font-bebas text-2xl text-white">Something went wrong</p>
          <p className="text-sm" style={{ color: 'rgba(245, 245, 245, 0.5)' }}>
            We couldn't fetch your recommendations. Please try again.
          </p>
          <button
            onClick={handleRestart}
            className="px-6 py-3 rounded-xl font-bebas text-lg tracking-wide cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437]"
            style={{
              background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.5) 0%, rgba(127, 29, 29, 0.4) 100%)',
              border: '1px solid rgba(185, 28, 28, 0.5)',
              color: '#F5F5F5',
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      {showResults && (
        <MoodResults results={results} onRestart={handleRestart} />
      )}
    </>
  );
};

export default Discover;
