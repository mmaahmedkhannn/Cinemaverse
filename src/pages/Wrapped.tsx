import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Clock, Star, Sparkles, Share2, ChevronRight, Lock, Award, Video, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRatings, getWatchlist } from '../lib/firestore';
import type { RatingItem, WatchlistItem } from '../lib/firestore';
import { getImageUrl, tmdbApi } from '../services/tmdb';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

const PERSONALITIES = [
  { type: 'The Cinephile', desc: 'You watch everything — wide taste, deep respect for the art form.', icon: '🎬', minMovies: 20 },
  { type: 'The Action Junkie', desc: 'Explosions, chases, and heroes — your heartbeat syncs to the bass drops.', icon: '💥', genres: [28] },
  { type: 'The Emotional Wreck', desc: 'You cry at endings. You cry at beginnings. You cry during credits.', icon: '😭', genres: [18, 10749] },
  { type: 'The Critic', desc: 'You rate harshly because you love deeply. Standards are everything.', icon: '🧐', condition: 'highRater' },
  { type: 'The Night Owl', desc: 'Horror, thrillers, mysteries — the darker, the better.', icon: '🦇', genres: [27, 53, 9648] },
  { type: 'The Adventurer', desc: 'Sci-fi galaxies, fantasy realms, adventure quests — you live for escapism.', icon: '🚀', genres: [878, 14, 12] },
  { type: 'The Comedy Lover', desc: 'Life\'s too short not to laugh. You find the funny in everything.', icon: '😂', genres: [35] },
];

const SLIDE_DURATION = 5000;

const Wrapped = () => {
  const { currentUser } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [movieDetails, setMovieDetails] = useState<any[]>([]);
  
  const summaryRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!summaryRef.current) return;
    try {
      const canvas = await html2canvas(summaryRef.current, { backgroundColor: '#000', scale: 2 });
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = 'cinemaverse-wrapped-2025.png';
      link.href = image;
      link.click();
    } catch (e) {
      console.error('Failed to generate image', e);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!currentUser) { setLoading(false); return; }
      try {
        const [r, w] = await Promise.all([getRatings(currentUser.uid), getWatchlist(currentUser.uid)]);
        setRatings(r);
        setWatchlist(w);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [currentUser]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (ratings.length === 0 && watchlist.length === 0) return;
      const allIds = Array.from(new Set([...ratings.map(r => r.movieId), ...watchlist.map(w => w.movieId)]));
      const topIds = allIds.slice(0, 20); // Limit to top 20 to avoid rate limits
      
      try {
        const details = await Promise.all(topIds.map(id => tmdbApi.getMovieDetails(id).catch(() => null)));
        setMovieDetails(details.filter(Boolean));
      } catch (e) {
        console.error(e);
      }
    };
    if (!loading) fetchDetails();
  }, [ratings, watchlist, loading]);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(prev => Math.min(prev + 1, slides.length - 1)); // wait! slides evaluated below. this is fine but fixed max length
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background-dark pt-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto px-4">
          <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="font-bebas text-5xl text-white mb-4">Sign In Required</h1>
          <p className="text-gray-400 font-sans mb-8">Sign in to see your personalized TheCinemaBase Wrapped experience!</p>
          <Link to="/" className="text-primary hover:text-white transition-colors font-sans">← Back to Home</Link>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalMovies = ratings.length + watchlist.length;
  const avgRuntime = 120; // approximate
  const totalMinutes = totalMovies * avgRuntime;
  const totalHours = Math.floor(totalMinutes / 60);
  const flightsToNY = Math.round(totalMinutes / 480); // ~8hrs per flight

  const highestRated = ratings.length > 0
    ? ratings.reduce((best, r) => r.rating > best.rating ? r : best, ratings[0])
    : null;

  // Determine personality
  const personality = totalMovies >= 20
    ? PERSONALITIES[0]
    : totalMovies >= 5
    ? PERSONALITIES[3]
    : PERSONALITIES[6];

  let topGenre = 'Unknown';
  let topDirector = 'Unknown';
  let topActor = 'Unknown';

  if (movieDetails.length > 0) {
    const genres: Record<string, number> = {};
    const directors: Record<string, number> = {};
    const actors: Record<string, number> = {};

    movieDetails.forEach(m => {
      m.genres?.forEach((g: any) => { genres[g.name] = (genres[g.name] || 0) + 1; });
      m.credits?.crew?.filter((c: any) => c.job === 'Director').forEach((d: any) => { directors[d.name] = (directors[d.name] || 0) + 1; });
      m.credits?.cast?.slice(0, 5).forEach((a: any) => { actors[a.name] = (actors[a.name] || 0) + 1; });
    });

    const getTop = (obj: Record<string, number>) => Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    topGenre = getTop(genres);
    topDirector = getTop(directors);
    topActor = getTop(actors);
  }

  const slideVariants = {
    enter: { opacity: 0, scale: 0.8, rotateY: 10 },
    center: { opacity: 1, scale: 1, rotateY: 0 },
    exit: { opacity: 0, scale: 0.8, rotateY: -10 },
  };

  const slides = [
    // Slide 0: Intro
    <motion.div key="intro" variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}>
        <Sparkles className="w-16 h-16 text-primary mb-6 mx-auto" />
      </motion.div>
      <h1 className="font-bebas text-6xl md:text-8xl text-white mb-4">Your TheCinemaBase<br /><span className="text-primary">2025 Wrapped</span></h1>
      <p className="text-gray-400 font-sans text-lg">Let's look back at your year in cinema</p>
    </motion.div>,

    // Slide 1: Total Movies
    <motion.div key="total" variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col items-center justify-center h-full text-center px-8">
      <Film className="w-12 h-12 text-primary mb-6" />
      <p className="text-gray-400 font-sans text-xl mb-4">You interacted with</p>
      <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="text-8xl md:text-9xl font-bebas text-white">
        {totalMovies}
      </motion.p>
      <p className="text-gray-400 font-sans text-xl">movies this year</p>
      {totalMovies === 0 && <p className="text-gray-500 font-sans text-sm mt-4">Start rating & adding movies to your watchlist to build your 2025 Wrapped!</p>}
    </motion.div>,

    // Slide 2: Top Rated
    <motion.div key="toprated" variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col items-center justify-center h-full text-center px-8">
      <Star className="w-12 h-12 text-yellow-400 mb-6" />
      <p className="text-gray-400 font-sans text-xl mb-6">Your highest rated movie</p>
      {highestRated ? (
        <>
          <div className="w-40 h-60 rounded-xl overflow-hidden bg-white/5 mb-4 mx-auto">
            {highestRated.poster_path && <img src={getImageUrl(highestRated.poster_path)} alt={highestRated.title} className="w-full h-full object-cover" />}
          </div>
          <h2 className="font-bebas text-4xl text-white">{highestRated.title}</h2>
          <p className="text-yellow-400 font-bebas text-2xl mt-2">★ {highestRated.rating}/10</p>
        </>
      ) : (
        <p className="text-gray-500 font-sans">Rate some movies to see your top pick!</p>
      )}
    </motion.div>,

    // Slide 3: Screen Time
    <motion.div key="time" variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col items-center justify-center h-full text-center px-8">
      <Clock className="w-12 h-12 text-blue-400 mb-6" />
      <p className="text-gray-400 font-sans text-xl mb-4">Estimated screen time</p>
      <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="text-7xl font-bebas text-white">
        {totalHours} <span className="text-3xl text-gray-400">hours</span>
      </motion.p>
      <p className="text-gray-500 font-sans text-sm mt-4">
        That's about {flightsToNY} flights from London to New York ✈️
      </p>
    </motion.div>,

    // Slide 4: Personality
    <motion.div key="personality" variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-7xl mb-6">
        {personality.icon}
      </motion.p>
      <p className="text-gray-400 font-sans text-xl mb-2">Your TheCinemaBase Personality</p>
      <h2 className="font-bebas text-5xl text-primary mb-4">{personality.type}</h2>
      <p className="text-gray-300 font-sans text-lg max-w-md">{personality.desc}</p>
    </motion.div>,

    // Slide 5: Top Genre
    <motion.div key="genre" variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col items-center justify-center h-full text-center px-8">
      <Award className="w-12 h-12 text-purple-400 mb-6" />
      <p className="text-gray-400 font-sans text-xl mb-4">You frequently escaped to</p>
      <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="text-7xl md:text-8xl font-bebas text-white">
        {topGenre}
      </motion.p>
      <p className="text-gray-400 font-sans text-xl mt-4">worlds this year.</p>
    </motion.div>,

    // Slide 6: Top Director
    <motion.div key="director" variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col items-center justify-center h-full text-center px-8">
      <Video className="w-12 h-12 text-green-400 mb-6" />
      <p className="text-gray-400 font-sans text-xl mb-4">Your visionary guide was</p>
      <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="text-6xl md:text-7xl font-bebas text-white">
        {topDirector}
      </motion.p>
      <p className="text-gray-400 font-sans text-xl mt-4">Your most watched director.</p>
    </motion.div>,

    // Slide 7: Top Actor
    <motion.div key="actor" variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col items-center justify-center h-full text-center px-8">
      <Users className="w-12 h-12 text-pink-400 mb-6" />
      <p className="text-gray-400 font-sans text-xl mb-4">You spent the most time watching</p>
      <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="text-6xl md:text-7xl font-bebas text-white">
        {topActor}
      </motion.p>
      <p className="text-gray-400 font-sans text-xl mt-4">Stealing every scene.</p>
    </motion.div>,

    // Slide 8: Summary Card
    <motion.div key="summary" variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col items-center justify-center h-full text-center px-8">
      <div ref={summaryRef} className="bg-[#080810] border-2 border-primary/20 rounded-2xl p-8 max-w-sm mx-auto shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
        
        <div className="relative z-10">
          <h2 className="font-bebas text-4xl text-white mb-1"><span className="text-primary">TheCinema</span>Base</h2>
          <p className="text-gray-400 font-sans text-xs font-bold tracking-widest mb-6">2025 WRAPPED</p>
          
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center"><span className="text-gray-400 text-sm font-sans uppercase tracking-wider">Movies</span><span className="text-white font-bebas text-2xl tracking-wider">{totalMovies}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400 text-sm font-sans uppercase tracking-wider">Screen Time</span><span className="text-white font-bebas text-2xl tracking-wider">{totalHours}h</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400 text-sm font-sans uppercase tracking-wider">Top Vibe</span><span className="text-purple-400 font-bebas text-2xl tracking-wider">{topGenre}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400 text-sm font-sans uppercase tracking-wider">Persona</span><span className="text-primary font-bebas text-2xl tracking-wider truncate ml-2 max-w-[150px]">{personality.type}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400 text-sm font-sans uppercase tracking-wider">MVP</span><span className="text-white font-bebas text-xl tracking-wider truncate ml-2">{topActor}</span></div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-white/10 text-center">
            <p className="text-[10px] text-gray-500 font-sans tracking-widest">THECINEMABASE.COM</p>
          </div>
        </div>
      </div>
      <button onClick={handleShare} className="mt-8 flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 py-3 px-6 rounded-full font-sans font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-xl">
        <Share2 className="w-4 h-4" /> Share Your Wrapped
      </button>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex gap-1 px-4 pt-2">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: i < slideIndex ? '100%' : i === slideIndex ? '100%' : '0%' }}
              transition={{ duration: i === slideIndex ? SLIDE_DURATION / 1000 : 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Slide Content */}
      <div className="flex-grow flex items-center justify-center min-h-screen" onClick={() => setSlideIndex(prev => Math.min(prev + 1, slides.length - 1))}>
        <AnimatePresence mode="wait">
          {slides[Math.min(slideIndex, slides.length - 1)]}
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setSlideIndex(i); }}
            className={`w-2 h-2 rounded-full transition-all ${i === slideIndex ? 'bg-primary w-6' : 'bg-white/20'}`}
          />
        ))}
      </div>

      {/* Skip nav */}
      <div className="fixed bottom-6 right-6">
        <button onClick={() => setSlideIndex(slides.length - 1)} className="text-gray-500 hover:text-white transition-colors text-xs font-sans flex items-center gap-1">
          Skip <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default Wrapped;
