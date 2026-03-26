import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { sendContactEmail } from '../lib/emailjs';

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

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

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
      const sent = await sendContactEmail(name, email, message);
      if (sent) {
        setSuccessMsg("Message sent successfully! We'll be in touch soon.");
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setError('Failed to send message. Please try again later.');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
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
              
              {/* Bottom Quote */}
              <div className="absolute bottom-8 md:bottom-12 left-6 md:left-12 right-6 md:right-12 z-20 text-center md:text-left">
                <p className="text-white text-2xl md:text-4xl font-bebas italic leading-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
                  "{MOVIES[currentSlide].quote}"
                </p>
                <div className="mt-3 flex items-center justify-center md:justify-start gap-3">
                  <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm font-sans drop-shadow-lg">
                    {MOVIES[currentSlide].title}
                  </span>
                  <span className="text-gray-300 text-xs md:text-sm drop-shadow-lg">— {MOVIES[currentSlide].year}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Centered Contact Form */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-[#0c0c16]/50 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl"
        >
          <div className="mb-10 text-center">
            <h1 className="font-bebas text-5xl md:text-6xl text-white tracking-wider mb-2 drop-shadow-md">
              Get In <span className="text-primary">Touch</span>
            </h1>
            <p className="text-gray-300 text-sm font-sans leading-relaxed">
              Have questions, feedback, or just want to talk movies? We'd love to hear from you. Securely send us a message below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-sans tracking-wide">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center font-sans tracking-wide">
                {successMsg}
              </div>
            )}

            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                disabled={loading}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-sans disabled:opacity-50"
              />
            </div>
            
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                disabled={loading}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-sans disabled:opacity-50"
              />
            </div>

            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your Message..."
                disabled={loading}
                required
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-sans resize-none disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-red-700 text-white font-sans font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] flex flex-row items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  <span className="tracking-wide uppercase text-sm">Send Message</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
