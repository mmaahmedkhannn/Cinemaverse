import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, UserPlus, LogIn } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const AuthModal = ({ isOpen, onClose, message = "Please sign in to continue." }: AuthModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-[#0c0c16]/90 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Cinematic background accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-primary to-red-900" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />
            
            <button 
              onClick={onClose}
              className="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mt-2 mb-8">
              <h2 className="font-bebas text-4xl text-white tracking-widest mb-3">Sign In Required</h2>
              <p className="text-gray-300 font-sans text-base leading-relaxed max-w-sm mx-auto">
                {message}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/auth"
                onClick={onClose}
                className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 group uppercase tracking-wide text-sm"
              >
                <LogIn className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                Sign In
              </Link>
              
              <Link
                to="/auth"
                onClick={onClose}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group uppercase tracking-wide text-sm"
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Create Account
              </Link>
            </div>
            
            <button 
              onClick={onClose}
              className="mt-6 w-full text-center text-gray-500 hover:text-gray-300 text-xs font-sans transition-colors uppercase tracking-widest"
            >
              Maybe Later
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
