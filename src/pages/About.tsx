import { motion } from 'framer-motion';
import { Film, Users, Sparkles, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background-dark pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-bebas text-6xl md:text-8xl text-white tracking-wider mb-4">
            About <span className="text-primary">TheCinemaBase</span>
          </h1>
          <p className="text-gray-400 text-lg font-sans max-w-2xl mx-auto">
            The universe of cinema, at your fingertips.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="font-bebas text-3xl text-white mb-4 flex items-center gap-3">
              <Film className="w-7 h-7 text-primary" /> Our Mission
            </h2>
            <p className="text-gray-300 font-sans leading-relaxed">
              TheCinemaBase was built for movie lovers, by movie lovers. We believe that discovering your next
              favorite film should feel as exciting as watching one. Our platform brings together over 500,000+
              movies and TV shows, real-time ratings powered by TMDB, and a community of passionate cinephiles —
              all wrapped in a cinematic experience that feels premium from the first click.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <Users className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bebas text-2xl text-white mb-2">Community First</h3>
              <p className="text-gray-400 font-sans text-sm leading-relaxed">
                From Movie Battles to personal Watchlists, every feature is designed to bring
                the community together and spark conversations about the films we love.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <Sparkles className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bebas text-2xl text-white mb-2">CV Scores</h3>
              <p className="text-gray-400 font-sans text-sm leading-relaxed">
                Our proprietary CV Score system combines audience ratings, critic consensus,
                and popularity metrics to give you the most accurate score on earth.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="font-bebas text-3xl text-white mb-4 flex items-center gap-3">
              <Heart className="w-7 h-7 text-primary fill-primary" /> What We Offer
            </h2>
            <ul className="text-gray-300 font-sans space-y-3">
              <li className="flex items-start gap-3"><span className="text-primary mt-1">🎬</span> 500,000+ Movies & TV Shows with full details, trailers, and cast info</li>
              <li className="flex items-start gap-3"><span className="text-primary mt-1">⭐</span> CV Scores — the most accurate rating system powered by TMDB</li>
              <li className="flex items-start gap-3"><span className="text-primary mt-1">⚔️</span> Movie Battles — vote and settle the greatest debates in cinema</li>
              <li className="flex items-start gap-3"><span className="text-primary mt-1">📋</span> Personal Watchlists to track what you want to see next</li>
              <li className="flex items-start gap-3"><span className="text-primary mt-1">🎁</span> TheCinemaBase Wrapped — your yearly cinema recap</li>
              <li className="flex items-start gap-3"><span className="text-primary mt-1">🏆</span> Top 100 — the definitive ranking decided by the community</li>
            </ul>
          </div>

          <div className="text-center text-gray-500 font-sans text-sm">
            <p>&copy; {new Date().getFullYear()} TheCinemaBase. All data provided by TMDB.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
