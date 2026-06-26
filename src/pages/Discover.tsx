/**
 * Discover.tsx
 *
 * Flagship Mood Discovery Engine page. Full-screen takeover quiz with
 * Spotify-Wrapped-style transitions, cinematic backgrounds, and dramatic
 * visual effects. Queries TMDB and shows 10 curated film picks.
 *
 * The quiz runs at z-[60] — above the navbar — for a true immersive takeover.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import ProgressDots from '../components/discover/ProgressDots';
import MoodStep from '../components/discover/MoodStep';
import AudienceStep from '../components/discover/AudienceStep';
import TimeStep from '../components/discover/TimeStep';
import EraStep from '../components/discover/EraStep';
import MoodResults from '../components/discover/MoodResults';
import { useMoodDiscovery } from '../hooks/useMoodDiscovery';
import { getImageUrl } from '../services/tmdb';
import type { QuizAnswers, AudienceType, TimeType, EraType } from '../lib/moodEngine';

/* ─── GA4 helper ──────────────────────────────────────────────────────── */
function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      'event',
      eventName,
      params,
    );
  }
}

/* ─── Step transition variants ────────────────────────────────────────── */
const stepVariants = {
  enter: { opacity: 0, y: 40, scale: 0.97 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -40, scale: 0.97 },
};

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

  /* ── State ──────────────────────────────────────────────────────────── */
  const [showIntro, setShowIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [moodId, setMoodId] = useState<string | null>(null);
  const [audience, setAudience] = useState<AudienceType | null>(null);
  const [time, setTime] = useState<TimeType | null>(null);
  const [era, setEra] = useState<EraType | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [page, setPage] = useState(1);

  const quizAnswers: QuizAnswers | null =
    moodId && audience && time && era
      ? { moodId, audience, time, era }
      : null;

  const { data: results, isFetching, isError, refetch } = useMoodDiscovery(quizAnswers, page);

  /* ── GA4 ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    trackEvent('mood_quiz_started');
  }, []);

  /* ── Preload first 6 poster images when results arrive ─────────────── */
  useEffect(() => {
    if (!results) return;
    const links: HTMLLinkElement[] = [];
    results.slice(0, 6).forEach((film) => {
      if (film.poster_path) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = getImageUrl(film.poster_path, 'w500');
        document.head.appendChild(link);
        links.push(link);
      }
    });
    return () => {
      links.forEach((link) => {
        if (document.head.contains(link)) document.head.removeChild(link);
      });
    };
  }, [results]);

  /* ── Intro timer ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (prefersReduced) {
      setShowIntro(false);
      return;
    }
    const t = setTimeout(() => setShowIntro(false), 3200);
    return () => clearTimeout(t);
  }, [prefersReduced]);

  /* ── Step advancement ───────────────────────────────────────────────── */
  const advanceStep = useCallback((stepName: string, answer: string) => {
    trackEvent('mood_quiz_step_completed', { step: currentStep + 1, step_name: stepName, answer });
    if (currentStep < 3) {
      setCurrentStep((s) => s + 1);
    } else {
      setQuizComplete(true);
    }
  }, [currentStep]);

  const handleMoodSelect = useCallback((id: string) => {
    setMoodId(id);
    setTimeout(() => advanceStep('mood', id), 400);
  }, [advanceStep]);

  const handleAudienceSelect = useCallback((val: AudienceType) => {
    setAudience(val);
    setTimeout(() => advanceStep('audience', val), 400);
  }, [advanceStep]);

  const handleTimeSelect = useCallback((val: TimeType) => {
    setTime(val);
    setTimeout(() => advanceStep('time', val), 400);
  }, [advanceStep]);

  const handleEraSelect = useCallback((val: EraType) => {
    setEra(val);
    setTimeout(() => advanceStep('era', val), 400);
  }, [advanceStep]);

  /* ── Trigger fetch ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (quizComplete && quizAnswers) {
      trackEvent('mood_quiz_finished', { ...quizAnswers });
      console.log('Quiz complete, triggering fetch', quizAnswers);
      setCurrentStep(4);
    }
  }, [quizComplete, quizAnswers]);

  /* ── Fresh picks (same quiz answers, next TMDB page) ───────────────── */
  const handleFreshPicks = useCallback(() => {
    setPage((p) => p + 1);
    trackEvent('mood_fresh_picks_requested');
  }, []);

  /* ── Restart ────────────────────────────────────────────────────────── */
  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setMoodId(null);
    setAudience(null);
    setTime(null);
    setEra(null);
    setQuizComplete(false);
    setShowIntro(false);
    setPage(1);
    trackEvent('mood_quiz_started');
  }, []);

  const showResults = currentStep === 4 && results && results.length > 0;
  const showLoading = currentStep === 4 && (isFetching || (!results && !isError));
  const showQuiz = currentStep < 4 && !showIntro;

  return (
    <>
      <SEO
        title="Discover Movies by Mood | CinemaDiscovery"
        description="Tell us how you feel — we'll find the perfect movie. From heartbreak to horror, mind-benders to comfort watches. Personalized film discovery for any mood."
        url="https://cinemadiscovery.com/discover"
        keywords="movie recommendations, mood-based movies, movie quiz, discover movies, film recommendations, what to watch, movie finder"
        schema={DISCOVER_SCHEMA}
      />

      {/* ════════════════════════════════════════════════════════════════
          FULL-SCREEN OVERLAY — z-[60] above navbar (z-50)
          Covers the entire viewport during intro + quiz steps
         ════════════════════════════════════════════════════════════════ */}
      {(showIntro || showQuiz || showLoading || (isError && currentStep === 4)) && (
        <div
          className="fixed inset-0 overflow-hidden"
          style={{ zIndex: 60 }}
        >
          {/* ── Cinematic Background Layer ─────────────────────────────── */}
          <div className="absolute inset-0" aria-hidden="true">
            {/* Base */}
            <div className="absolute inset-0" style={{ background: '#060609' }} />

            {/* Large crimson glow — top-left */}
            <motion.div
              className="absolute w-[900px] h-[900px] -top-[200px] -left-[200px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(185, 28, 28, 0.25) 0%, rgba(185, 28, 28, 0.08) 40%, transparent 70%)',
                filter: 'blur(80px)',
              }}
              animate={prefersReduced ? {} : {
                scale: [1, 1.1, 1],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Gold glow — bottom-right */}
            <motion.div
              className="absolute w-[700px] h-[700px] -bottom-[150px] -right-[150px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(212, 164, 55, 0.15) 0%, rgba(212, 164, 55, 0.05) 40%, transparent 70%)',
                filter: 'blur(80px)',
              }}
              animate={prefersReduced ? {} : {
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />

            {/* Center purple accent */}
            <div
              className="absolute w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(100, 40, 120, 0.08) 0%, transparent 60%)',
                filter: 'blur(60px)',
              }}
            />

            {/* Film grain texture */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                backgroundSize: '256px 256px',
              }}
            />

            {/* Vignette */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(6, 6, 9, 0.7) 100%)',
              }}
            />
          </div>

          {/* ── INTRO SCREEN ──────────────────────────────────────────── */}
          <AnimatePresence>
            {showIntro && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center px-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Glowing orb behind text */}
                <motion.div
                  className="absolute w-[400px] h-[400px] rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(212, 164, 55, 0.15) 0%, transparent 60%)',
                    filter: 'blur(60px)',
                  }}
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, ease: 'easeInOut' }}
                />

                {/* Emoji burst */}
                <motion.div
                  className="text-5xl md:text-7xl mb-6"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                >
                  🎬
                </motion.div>

                {/* Title */}
                <motion.h1
                  className="font-bebas text-4xl md:text-6xl lg:text-7xl tracking-[0.15em] text-center relative"
                  style={{
                    background: 'linear-gradient(135deg, #F5F5F5 0%, #D4A437 50%, #F5F5F5 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    opacity: { duration: 0.8, delay: 0.5 },
                    y: { duration: 0.8, delay: 0.5 },
                    backgroundPosition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                  }}
                >
                  Mood Discovery Engine
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  className="text-sm md:text-lg mt-4 text-center max-w-md font-sans"
                  style={{ color: 'rgba(245, 245, 245, 0.5)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                >
                  Tell us how you feel — we'll find your perfect film
                </motion.p>

                {/* Gold line */}
                <motion.div
                  className="mt-8 h-[1px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, #D4A437, transparent)' }}
                  initial={{ width: 0 }}
                  animate={{ width: 200 }}
                  transition={{ delay: 1.5, duration: 1.2, ease: 'easeInOut' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── QUIZ STEPS ────────────────────────────────────────────── */}
          {showQuiz && (
            <div
              className="absolute inset-0 flex flex-col"
              role="region"
              aria-label="Movie mood quiz"
            >
              {/* Progress dots — top */}
              <div className="flex-shrink-0 pt-8 md:pt-10 pb-4">
                <ProgressDots currentStep={currentStep} />
              </div>

              {/* Step content */}
              <div className="flex-1 flex items-center justify-center overflow-y-auto py-4" aria-live="polite">
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
                        : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
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

              {/* Bottom fade */}
              <div
                className="flex-shrink-0 h-16 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(6,6,9,0.8), transparent)' }}
              />
            </div>
          )}

          {/* ── LOADING STATE ─────────────────────────────────────────── */}
          {showLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-4">
              {/* Pulsing orb */}
              {/* Pulsing orb */}
              <motion.div
                className="relative flex items-center justify-center mt-12 mb-4"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 164, 55, 0.15), rgba(185, 28, 28, 0.15))',
                    border: '1px solid rgba(212, 164, 55, 0.4)',
                    boxShadow: '0 0 40px rgba(212, 164, 55, 0.15)'
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-8 h-8" style={{ color: '#D4A437' }} />
                  </motion.div>
                </div>
                {/* Outer rings */}
                <motion.div
                  className="absolute -inset-4 rounded-full border"
                  style={{ borderColor: 'rgba(212, 164, 55, 0.3)' }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute -inset-8 rounded-full border"
                  style={{ borderColor: 'rgba(212, 164, 55, 0.1)' }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                />
              </motion.div>

              <div className="text-center">
                <p
                  className="font-bebas text-2xl md:text-3xl tracking-wider"
                  style={{ color: '#D4A437' }}
                >
                  Curating your perfect picks...
                </p>
                <p className="text-xs mt-2 font-sans" style={{ color: 'rgba(245, 245, 245, 0.4)' }}>
                  Analyzing thousands of films
                </p>
              </div>
            </div>
          )}

          {/* ── ERROR STATE ───────────────────────────────────────────── */}
          {isError && currentStep === 4 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center">
              {/* Glow orb */}
              <div
                className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(185, 28, 28, 0.12) 0%, transparent 70%)',
                  filter: 'blur(60px)',
                }}
              />
              <motion.span
                className="text-5xl relative z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              >😔</motion.span>
              <motion.p
                className="font-bebas text-3xl md:text-4xl tracking-wider relative z-10"
                style={{ color: '#F5F5F5' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                Something went wrong while curating your picks.
              </motion.p>
              <motion.p
                className="text-sm font-sans max-w-sm relative z-10"
                style={{ color: 'rgba(245, 245, 245, 0.5)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                We couldn't reach the film database. Check your connection and try again.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row items-center gap-3 relative z-10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <button
                  onClick={() => refetch()}
                  className="group flex items-center gap-2 px-8 py-3.5 rounded-xl font-bebas text-lg tracking-wider cursor-pointer transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.6) 0%, rgba(127, 29, 29, 0.5) 100%)',
                    border: '1px solid rgba(212, 164, 55, 0.35)',
                    color: '#F5F5F5',
                    boxShadow: '0 4px 20px rgba(185, 28, 28, 0.25)',
                  }}
                >
                  <RotateCcw className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-180" />
                  Try Again
                </button>
                <Link
                  to="/movies"
                  className="group flex items-center gap-2 px-8 py-3.5 rounded-xl font-bebas text-lg tracking-wider transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A437]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(212, 164, 55, 0.15)',
                    color: 'rgba(245, 245, 245, 0.6)',
                  }}
                >
                  Browse all movies
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          RESULTS — scrollable, below navbar
         ════════════════════════════════════════════════════════════════ */}

      {/* Cinematic background for results */}
      {showResults && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }} aria-hidden="true">
          <div className="absolute inset-0" style={{ background: '#060609' }} />
          <div
            className="absolute w-[800px] h-[800px] -top-[200px] left-1/2 -translate-x-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(212, 164, 55, 0.1) 0%, transparent 60%)',
              filter: 'blur(80px)',
            }}
          />
        </div>
      )}

      {showResults && (
        <MoodResults
          results={results}
          onRestart={handleRestart}
          onFreshPicks={handleFreshPicks}
          isFetching={isFetching}
        />
      )}
    </>
  );
};

export default Discover;
