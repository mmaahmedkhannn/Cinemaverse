import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Film } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { tmdbApi, getImageUrl } from '../../services/tmdb';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backdrops, setBackdrops] = useState<{ path: string; title: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();

  // Fetch trending movie backdrops when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const fetchBackdrops = async () => {
      try {
        const results = await tmdbApi.getTrendingMovies();
        const items = results
          .filter((m: any) => m.backdrop_path)
          .slice(0, 10)
          .map((m: any) => ({
            path: m.backdrop_path,
            title: m.title || m.name || '',
          }));
        setBackdrops(items);
      } catch {
        // Silently fail — modal still works without backdrops
      }
    };
    fetchBackdrops();
  }, [isOpen]);

  // Auto-rotate backdrops every 5 seconds
  useEffect(() => {
    if (backdrops.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backdrops.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backdrops.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onClose();
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
      setLoading(true);
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      // If the user closed the popup prematurely, we don't necessarily want to yell at them
      let msg = err.message || 'Failed to sign in with Google';
      if (msg.includes('auth/popup-closed-by-user')) msg = 'Google sign in was cancelled.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentBackdrop = backdrops[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center min-h-screen">

          {/* ── Live Rotating Movie Backdrops ── */}
          <div className="absolute inset-0 bg-black overflow-hidden z-0">
            <AnimatePresence mode="sync">
              {currentBackdrop && (
                <motion.img
                  key={currentBackdrop.path}
                  src={getImageUrl(currentBackdrop.path, 'original')}
                  alt=""
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </AnimatePresence>

            {/* Gradient overlays for depth & readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
            <div className="absolute inset-0 bg-black/30" />

            {/* Click-to-close backdrop */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* ── Now Showing label ── */}
            {currentBackdrop && (
              <div className="absolute bottom-6 left-6 z-10 pointer-events-none select-none flex items-center gap-2">
                <Film className="w-4 h-4 text-primary" />
                <p className="font-sans text-white/40 text-xs tracking-wider uppercase">
                  Now Showing: <span className="text-white/60 font-semibold">{currentBackdrop.title}</span>
                </p>
              </div>
            )}

            {/* ── Backdrop indicator dots ── */}
            {backdrops.length > 1 && (
              <div className="absolute bottom-6 right-6 z-10 flex gap-1.5 pointer-events-none">
                {backdrops.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                      i === currentIndex ? 'bg-primary w-4' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Auth Form Card (Glassmorphism) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-20 w-full max-w-md mx-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-30"
            >
              <X className="w-5 h-5" />
            </button>

            {/* CinemaDiscovery Branding */}
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bebas text-primary tracking-wider mb-1">
                CinemaDiscovery
              </h2>
              <p className="text-gray-400 font-sans text-sm">
                {isLogin ? 'Sign in to your account' : 'Create a new account'}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-4 font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-sans text-gray-400 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-sans"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-sans text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-sans"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-red-700 text-white font-sans font-bold py-3 rounded-lg transition-all disabled:opacity-50 shadow-lg hover:shadow-primary/30"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-black/60 text-gray-500 font-sans">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-100 font-sans font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </div>

            <p className="mt-8 text-center text-sm font-sans text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-white transition-colors font-semibold"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
