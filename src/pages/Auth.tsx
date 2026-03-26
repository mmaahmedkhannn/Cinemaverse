import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { sendWelcomeEmail } from '../lib/emailjs';
import { sanitizeInput } from '../lib/sanitize';

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
  
  const { loginWithEmail, registerWithEmail, loginWithGoogle, currentUser, globalError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (globalError) {
      setError(globalError);
    }
  }, [globalError]);

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
      const cleanEmail = sanitizeInput(email);
      if (isSignIn) {
        await loginWithEmail(cleanEmail, password);
        // After login, check if password user is verified
        if (auth.currentUser && !auth.currentUser.emailVerified) {
          navigate('/verify-email', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        await registerWithEmail(cleanEmail, password);
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
          // Fire and forget the welcome email without blocking
          sendWelcomeEmail(cleanEmail).catch(console.error);
        }
        setSuccessMsg(`Verification email sent to ${cleanEmail}! Please check your inbox.`);
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
      if (msg.includes('auth/internal-error')) msg = 'Server error occurred. Please try again.';
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
      if (msg.includes('auth/internal-error')) msg = 'Server error occurred during sign in.';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080810] overflow-hidden">
      {/* Top Left Logo Brand */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-[60]">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="CinemaDiscovery Theme Logo" className="w-10 h-10" />
          <span className="hidden md:block font-bebas text-2xl text-white tracking-wider drop-shadow-lg">
            CinemaDiscovery
          </span>
        </Link>
      </div>

      {/* Background: Full-Screen Cinematic Rotating Movie Poster */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {backdrops && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {backdrops[currentSlide] && (
                <img
                  src={getImageUrl(backdrops[currentSlide], 'w1280')}
                  alt={MOVIES[currentSlide].title}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Overlays for depth + text readability */}
              <div className="absolute inset-0 bg-black/60 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-transparent to-transparent opacity-90" />
              
              {/* Film grain SVG texture */}
              <div 
                className="absolute inset-0"
                style={{ 
                  backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')",
                  opacity: 0.15 
                }} 
              />
              
              {/* Bottom Quote Center Aligned and Bigger */}
              <div className="absolute bottom-8 md:bottom-12 left-0 right-0 z-20 flex flex-col items-center justify-end px-6 pointer-events-none text-center">
                <p className="text-white text-4xl md:text-5xl lg:text-5xl font-bebas italic leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,1)] tracking-wide max-w-4xl mx-auto">
                  "{MOVIES[currentSlide].quote}"
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="text-primary font-bold tracking-widest uppercase text-sm md:text-base font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
                    {MOVIES[currentSlide].title}
                  </span>
                  <span className="text-gray-300 text-sm md:text-base drop-shadow-[0_2px_10px_rgba(0,0,0,1)] font-light tracking-widest">— {MOVIES[currentSlide].year}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Centered Auth Form */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 mb-24 md:mb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-[#0c0c16]/50 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="font-bebas text-5xl text-primary tracking-widest mb-2 drop-shadow-md">CINEMADISCOVERY</h1>
            <p className="text-gray-300 font-sans text-sm drop-shadow-sm">Enter the universe of cinema.</p>
          </div>

          {/* Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8 border border-white/5">
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
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center">
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-sans"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-sans"
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
              className="w-full bg-primary hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] tracking-wide uppercase text-sm mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 mx-auto border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : isSignIn ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-sm font-sans">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-6 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-sans font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
