import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { sendWelcomeEmail } from '../lib/emailjs';

const MOVIES = [
  { id: 238, title: 'The Godfather', year: '1972', quote: "I'm gonna make him an offer he can't refuse." },
  { id: 155, title: 'The Dark Knight', year: '2008', quote: "Why so serious?" },
  { id: 27205, title: 'Inception', year: '2010', quote: "You mustn't be afraid to dream a little bigger." },
  { id: 157336, title: 'Interstellar', year: '2014', quote: "Love is the one thing that transcends time." },
  { id: 680, title: 'Pulp Fiction', year: '1994', quote: "Say what again. I dare you." },
  { id: 550, title: 'Fight Club', year: '1999', quote: "The first rule of Fight Club..." },
  { id: 424, title: "Schindler's List", year: '1993', quote: "Whoever saves one life saves the world." },
  { id: 278, title: 'The Shawshank Redemption', year: '1994', quote: "Get busy living or get busy dying." },
  { id: 769, title: 'Goodfellas', year: '1990', quote: "As far back as I can remember, I always wanted to be a gangster." },
  { id: 6977, title: 'No Country For Old Men', year: '2007', quote: "What's the most you ever lost on a coin toss?" },
  { id: 274, title: 'The Silence of the Lambs', year: '1991', quote: "A census taker once tried to test me. I ate his liver with some fava beans and a nice Chianti." },
  { id: 28, title: 'Apocalypse Now', year: '1979', quote: "I love the smell of napalm in the morning." },
];

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { loginWithEmail, registerWithEmail, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  // Fetch all backdrops
  const { data: backdrops } = useQuery({
    queryKey: ['auth-backdrops'],
    queryFn: async () => {
      const results = await Promise.all(
        MOVIES.map(async (m) => {
          try {
            const data = await tmdbApi.getMovieDetails(m.id);
            return data.backdrop_path;
          } catch {
            return null;
          }
        })
      );
      return results;
    },
    staleTime: Infinity,
  });

  // Slideshow interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % MOVIES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (isSignIn) {
        await loginWithEmail(email, password);
        // After login, check if password user is verified
        if (auth.currentUser && !auth.currentUser.emailVerified) {
          navigate('/verify-email', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        await registerWithEmail(email, password);
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
          // Fire and forget the welcome email without blocking
          sendWelcomeEmail(email).catch(console.error);
        }
        setSuccessMsg(`Verification email sent to ${email}! Please check your inbox.`);
        navigate('/verify-email', { replace: true });
      }
    } catch (err: any) {
      let msg = err.message || 'Failed to authenticate';
      if (msg.includes('auth/invalid-credential')) msg = 'Invalid email or password.';
      if (msg.includes('auth/user-not-found')) msg = 'No account found with this email.';
      if (msg.includes('auth/wrong-password')) msg = 'Incorrect password.';
      if (msg.includes('auth/email-already-in-use')) msg = 'This email is already registered. Try signing in.';
      if (msg.includes('auth/weak-password')) msg = 'Password should be at least 6 characters.';
      if (msg.includes('auth/invalid-email')) msg = 'Invalid email address format.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/', { replace: true });
    } catch (err: any) {
      let msg = err.message || 'Failed to sign in with Google';
      if (msg.includes('auth/popup-closed-by-user')) msg = 'Google sign in was cancelled.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset password.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg(`Reset link sent to ${email}!`);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Email not found.');
      } else {
        setError(err.message || 'Failed to send reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-[#080810] overflow-hidden">
      {/* Top Left Logo Brand */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-[60]">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="CinemaDiscovery Theme Logo" className="w-10 h-10" />
          <span className="hidden md:block font-bebas text-2xl text-white tracking-wider drop-shadow-lg">
            CinemaDiscovery
          </span>
        </Link>
      </div>

      {/* Left side: Slideshow Background */}
      <div className="absolute inset-0 md:relative md:w-[60%] h-full">
        {backdrops && (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.05 }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 1, ease: 'easeInOut' },
                scale: { duration: 5, ease: 'linear' } 
              }}
              className="absolute inset-0"
            >
              {backdrops[currentSlide] && (
                <img
                  src={getImageUrl(backdrops[currentSlide], 'original')}
                  alt={MOVIES[currentSlide].title}
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/65" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />
        <div className="hidden md:block absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-[#080810]" />

        {/* Content Overlays */}
        <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.p
              key={`quote-${currentSlide}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1 }}
              className="text-white font-playfair italic text-3xl md:text-5xl max-w-2xl leading-snug drop-shadow-xl"
            >
              "{MOVIES[currentSlide].quote}"
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-16 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.p
              key={`title-${currentSlide}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="text-white/80 font-sans text-sm tracking-wider uppercase"
            >
              {MOVIES[currentSlide].title} — {MOVIES[currentSlide].year}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="relative w-full md:w-[40%] h-full flex items-center justify-center p-6 bg-transparent md:bg-[#080810] overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md bg-black/40 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-8 rounded-3xl border border-white/10 md:border-none shadow-2xl md:shadow-none"
        >
          <div className="text-center mb-8">
            <h1 className="font-bebas text-5xl text-primary tracking-widest mb-2">CINEMADISCOVERY</h1>
            <p className="text-gray-400 font-sans text-sm">Enter the universe of cinema.</p>
          </div>

          {/* Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                isSignIn ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                !isSignIn ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            {isSignIn && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-gray-400 hover:text-white text-xs font-sans transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignIn ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-6 w-full bg-white hover:bg-gray-100 text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
