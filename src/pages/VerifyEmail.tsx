import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';

const VerifyEmail = () => {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Polling every 5 seconds
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentUser) {
      interval = setInterval(async () => {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          navigate('/', { replace: true });
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [currentUser, navigate]);

  // Cooldown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!currentUser || cooldown > 0) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await sendEmailVerification(currentUser);
      setMessage('Verification email resent! Please check your inbox.');
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  const manualCheck = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        navigate('/', { replace: true });
      } else {
        setError('Email not verified yet. Please check your inbox.');
      }
    } catch (err: any) {
      setError('Failed to refresh status.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 pt-20">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-bebas text-center text-white tracking-widest mb-2">
          Check your inbox!
        </h1>
        <p className="text-center text-gray-400 font-sans mb-8 leading-relaxed text-sm">
          We've sent a verification email to:
          <br />
          <span className="text-white font-medium block mt-1">{currentUser.email}</span>
        </p>

        {message && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center font-sans">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center font-sans">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || loading}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-sans font-medium py-3 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 border border-white/10"
          >
            {cooldown > 0 ? `Resend Email (${cooldown}s)` : 'Resend Email'}
            {!cooldown && <RefreshCw className="w-4 h-4 ml-1" />}
          </button>

          <button
            onClick={manualCheck}
            disabled={loading}
            className="w-full bg-primary hover:bg-red-700 text-white font-sans font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? 'Checking...' : "I've verified my email"}
            {!loading && <CheckCircle className="w-4 h-4 ml-1" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
