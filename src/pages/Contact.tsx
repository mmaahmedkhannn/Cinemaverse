import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { sendContactEmail } from '../lib/emailjs';
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
  { id: 11, title: 'Star Wars', year: '1977', quote: "May the Force be with you." },
  { id: 630, title: 'The Wizard of Oz', year: '1939', quote: "There's no place like home." },
  { id: 597, title: 'Titanic', year: '1997', quote: "I'm the king of the world!" },
  { id: 207, title: 'Dead Poets Society', year: '1989', quote: "Carpe diem. Seize the day, boys." },
  { id: 880, title: 'A Few Good Men', year: '1992', quote: "You can't handle the truth!" },
  { id: 218, title: 'The Terminator', year: '1984', quote: "I'll be back." },
  { id: 578, title: 'Jaws', year: '1975', quote: "You're gonna need a bigger boat." },
  { id: 289, title: 'Casablanca', year: '1942', quote: "Here's looking at you, kid." },
  { id: 121, title: 'The Two Towers', year: '2002', quote: "My precious." },
  { id: 568, title: 'Apollo 13', year: '1995', quote: "Houston, we have a problem." },
  { id: 862, title: 'Toy Story', year: '1995', quote: "To infinity and beyond!" },
  { id: 118, title: 'E.T.', year: '1982', quote: "E.T. phone home." },
  { id: 103, title: 'Taxi Driver', year: '1976', quote: "You talking to me?" },
  { id: 745, title: 'The Sixth Sense', year: '1999', quote: "I see dead people." },
  { id: 744, title: 'Top Gun', year: '1986', quote: "I feel the need - the need for speed!" },
  { id: 240, title: 'The Godfather Part II', year: '1974', quote: "Keep your friends close, but your enemies closer." },
  { id: 1891, title: 'The Empire Strikes Back', year: '1980', quote: "No. I am your father." },
  { id: 12, title: 'Finding Nemo', year: '2003', quote: "Just keep swimming." },
  { id: 13, title: 'Forrest Gump', year: '1994', quote: "Life is like a box of chocolates. You never know what you're gonna get." },
  { id: 603, title: 'The Matrix', year: '1999', quote: "There is no spoon." },
  { id: 496243, title: 'Parasite', year: '2019', quote: "You know what kind of plan never fails? No plan." },
  { id: 129, title: 'Spirited Away', year: '2001', quote: "Once you've met someone you never really forget them." },
  { id: 670, title: 'Oldboy', year: '2003', quote: "Laugh and the world laughs with you. Weep and you weep alone." },
  { id: 194, title: 'Amélie', year: '2001', quote: "Times are hard for dreamers." },
  { id: 346, title: 'Seven Samurai', year: '1954', quote: "What's the use of worrying about your beard when your head's about to be taken?" },
  { id: 598, title: 'City of God', year: '2002', quote: "If you run, the beast catches you; if you stay, the beast eats you." },
  { id: 1422, title: "Pan's Labyrinth", year: '2006', quote: "You're getting older, and you'll see that life isn't like your fairy tales." },
  { id: 236, title: 'Life is Beautiful', year: '1997', quote: "This is my story. This is the sacrifice my father made." },
  { id: 146, title: 'Crouching Tiger, Hidden Dragon', year: '2000', quote: "A sword by itself rules nothing. It only comes alive in skillful hands." },
  { id: 11216, title: 'Cinema Paradiso', year: '1988', quote: "Life isn't like in the movies. Life is much harder." },
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

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setError('Contact service is not configured properly.');
      setLoading(false);
      return;
    }

    try {
      const sanitizedName = sanitizeInput(name);
      const sanitizedMessage = sanitizeInput(message);
      const sent = await sendContactEmail(sanitizedName, email, sanitizedMessage, serviceId, templateId, publicKey);
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

      {/* Centered Contact Form */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 sm:px-6 mb-24 md:mb-32">
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
            <p className="text-gray-300 text-sm font-sans leading-relaxed mb-4">
              Have a question, spotted a bug, or want to suggest a feature? Send us a message and we’ll get back to you soon.
            </p>
            <p className="text-gray-400 text-sm font-sans">
              Or email us directly: <a href="mailto:support@cinemadiscovery.com" className="text-white hover:text-primary transition-colors underline decoration-white/30 hover:decoration-primary">support@cinemadiscovery.com</a>
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
