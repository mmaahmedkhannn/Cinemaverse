import { motion } from 'framer-motion';
import { Film, Users, Sparkles, Heart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const About = () => {
  return (
    <div className="min-h-screen bg-background-dark pt-28 pb-20">
      <Helmet>
        <title>About CinemaDiscovery | Premium Movie & TV Show Discovery Platform</title>
        <meta name="description" content="Discover what CinemaDiscovery is—a premium movie and TV show discovery platform at cinemadiscovery.com. Elevate how you explore, track, and rank the universe of cinema." />
        <link rel="canonical" href="https://cinemadiscovery.com/about" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://cinemadiscovery.com/#website",
                "url": "https://cinemadiscovery.com/",
                "name": "CinemaDiscovery",
                "description": "A premium movie and TV show discovery platform.",
                "publisher": {
                  "@id": "https://cinemadiscovery.com/#organization"
                }
              },
              {
                "@type": "Organization",
                "@id": "https://cinemadiscovery.com/#organization",
                "name": "CinemaDiscovery",
                "url": "https://cinemadiscovery.com/",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://cinemadiscovery.com/og-image.jpg"
                },
                "sameAs": [
                  "https://twitter.com/cinemadiscovery"
                ]
              }
            ]
          })}
        </script>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-bebas text-6xl md:text-8xl text-white tracking-wider mb-4">
            About <span className="text-primary">CinemaDiscovery</span>
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
              <strong>CinemaDiscovery</strong> was built for modern cinephiles. We are a premium movie and TV show discovery platform located at <strong>cinemadiscovery.com</strong>. We believe that discovering your next favorite thriller, sci-fi epic, or prestige HBO drama should feel as exciting as watching it. Our platform aggregates data for over 500,000+ titles, offering real-time ratings, deep dive cinematic timelines, and an interactive universe to explore interconnected franchises. Experience a superior, ad-free environment tailored for true movie lovers.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="font-bebas text-3xl text-white mb-4">Why Choose CinemaDiscovery.com?</h2>
            <p className="text-gray-300 font-sans leading-relaxed">
              When you search for the best movies of the year or the top-rated TV shows, you are usually met with cluttered interfaces. <a href="https://cinemadiscovery.com" className="text-primary hover:underline">CinemaDiscovery.com</a> solves this by combining stunning glassmorphic UI design with the industry-standard TMDB API. From tracking your personal watchlist to fighting it out in our weekly Movie Battles, everything is designed to serve the community of premium entertainment enthusiasts.
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
              <li className="flex items-start gap-3"><span className="text-primary mt-1">🎁</span> CinemaDiscovery Wrapped — your yearly cinema recap</li>
              <li className="flex items-start gap-3"><span className="text-primary mt-1">🏆</span> Top 100 — the definitive ranking decided by the community</li>
            </ul>
          </div>

          <div className="text-center text-gray-500 font-sans text-sm">
            <p>&copy; {new Date().getFullYear()} CinemaDiscovery. All data provided by TMDB.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
