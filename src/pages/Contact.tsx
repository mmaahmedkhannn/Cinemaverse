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

      {/* Left side: Cinematic Rotating Movie Poster */}
      <div className="relative w-full md:w-1/2 h-48 md:h-full hidden md:block">
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
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-transparent to-transparent opacity-80" />
              
              {/* Optional: Add film grain SVG texture */}
              <div 
                className="absolute inset-0"
                style={{ 
                  backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')",
                  opacity: 0.15 
                }} 
              />
              
              <div className="absolute bottom-12 left-12 right-12 z-20">
                <p className="text-white text-3xl font-bebas italic leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  "{MOVIES[currentSlide].quote}"
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-primary font-bold tracking-widest uppercase text-sm font-sans">
                    {MOVIES[currentSlide].title}
                  </span>
                  <span className="text-gray-400 text-sm">— {MOVIES[currentSlide].year}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side: Contact Form (ID Card Style) */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-12 relative z-10 overflow-y-auto w-full md:w-1/2">
        <div className="max-w-lg w-full mx-auto">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center md:text-left pt-16 md:pt-0">
            <h1 className="font-bebas text-5xl md:text-7xl text-white tracking-wider mb-2">
              Direct <span className="text-primary">Transmission</span>
            </h1>
            <p className="text-gray-400 text-sm font-sans leading-relaxed">
              Initiate contact. Fill out your authorization creds below to transmit securely.
            </p>
          </motion.div>

          {/* ID Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="bg-[#0c0c16] border border-[#2a2a3f] rounded-2xl relative overflow-hidden shadow-2xl shadow-black/80"
          >
            {/* ID Card Header */}
            <div className="bg-[#151525] border-b border-[#2a2a3f] py-4 px-6 flex justify-between items-center relative overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                 <span className="font-bebas text-red-500 tracking-widest text-lg md:text-xl pt-1 leading-none drop-shadow-[0_0_5px_rgba(239,68,68,0.3)] border-b border-red-500/30">CLEARANCE: VISITOR</span>
               </div>
               <span className="text-[10px] md:text-xs text-gray-500 font-mono tracking-widest">EXP 01/06/2026</span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col sm:flex-row gap-8 relative">
              
              {/* Fake Photo ID section matching the ID card vibe */}
              <div className="hidden sm:flex flex-col items-center gap-3 w-1/3 shrink-0">
                <div className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-[#2a2a3f] bg-[#11111d] flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-red-500/10 to-transparent" />
                   <div className="w-16 h-16 rounded-full border border-[#2a2a3f] bg-[#0c0c16] flex items-center justify-center mb-2 z-10">
                      <Send className="w-6 h-6 text-gray-600 group-hover:text-red-500 transition-colors" />
                   </div>
                   <span className="text-[10px] text-gray-600 font-mono z-10 text-center px-2 tracking-widest uppercase">Awaiting<br/>Identification</span>
                </div>
                <div className="w-full h-10 border border-[#2a2a3f] rounded-md bg-[#11111d] overflow-hidden flex items-center justify-center relative group cursor-crosshair">
                   <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors mix-blend-screen" />
                   <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cpattern id='bar' width='6' height='100%25' patternUnits='userSpaceOnUse'%3E%3Crect width='1.5' height='100%25' fill='%233a3a4f'/%3E%3Crect x='3' width='0.5' height='100%25' fill='%233a3a4f' opacity='0.7'/%3E%3Crect x='4.5' width='1' height='100%25' fill='%233a3a4f' opacity='0.4'/%3E%3C/pattern%3E%3Crect width='100%25' height='100%25' fill='url(%23bar)'/%3E%3C/svg%3E" alt="Barcode" className="w-full h-[70%] opacity-50 px-2" />
                </div>
              </div>

              {/* Form Fields imitating ID text fields */}
              <div className="flex-1 space-y-7">
                
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[11px] font-mono tracking-wider uppercase">
                    [ERROR]: {error}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-[11px] font-mono tracking-wider uppercase">
                    [SUCCESS]: {successMsg}
                  </div>
                )}

                <div className="relative border-b border-[#2a2a3f] focus-within:border-red-500/70 transition-colors pb-1.5 group">
                  <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase block mb-2 group-focus-within:text-red-500/70 transition-colors">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full bg-transparent text-gray-200 focus:outline-none font-sans text-sm disabled:opacity-50"
                  />
                </div>
                
                <div className="relative border-b border-[#2a2a3f] focus-within:border-red-500/70 transition-colors pb-1.5 group">
                  <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase block mb-2 group-focus-within:text-red-500/70 transition-colors">Commlink Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full bg-transparent text-gray-200 focus:outline-none font-sans text-sm disabled:opacity-50"
                  />
                </div>

                <div className="relative border-b border-[#2a2a3f] focus-within:border-red-500/70 transition-colors pb-1.5 group">
                  <label className="text-[10px] text-gray-500 font-mono tracking-widest uppercase block mb-2 group-focus-within:text-red-500/70 transition-colors">Message Payload</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    required
                    rows={3}
                    className="w-full bg-transparent text-gray-200 focus:outline-none font-sans text-sm resize-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-transparent border border-red-500/50 hover:border-red-500 hover:bg-red-500/10 text-red-500 text-xs font-mono font-bold tracking-widest py-3 rounded transition-all flex flex-row items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-red-500/50 border-t-red-500 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      <span>INITIALIZE TRANSMISSION</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
