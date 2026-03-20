import { motion } from 'framer-motion';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background-dark pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-bebas text-6xl md:text-8xl text-white tracking-wider mb-4">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-gray-400 text-sm font-sans">Last updated: March 2026</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-8">
          {[
            {
              title: "1. Information We Collect",
              content: "When you create an account on CinemaVerse, we collect your email address and display name. If you sign in with Google, we receive your Google profile information (name, email, and profile picture). We also store your watchlist selections, movie ratings, and battle votes."
            },
            {
              title: "2. How We Use Your Information",
              content: "Your information is used to provide and personalize the CinemaVerse experience, including your personal watchlist, ratings, CinemaVerse Wrapped statistics, and Movie Battle participation. We do not sell your personal data to third parties."
            },
            {
              title: "3. Data Storage",
              content: "Your data is securely stored using Google Firebase (Firestore and Authentication). Firebase complies with industry-standard security practices and data protection regulations. All data is encrypted in transit and at rest."
            },
            {
              title: "4. Third-Party Services",
              content: "CinemaVerse uses The Movie Database (TMDB) API for movie and TV show data, Google Firebase for authentication and data storage, and EmailJS for transactional emails. Each of these services has their own privacy policies."
            },
            {
              title: "5. Cookies",
              content: "We use essential cookies and local storage for authentication sessions. We do not use advertising cookies or third-party tracking cookies."
            },
            {
              title: "6. Your Rights",
              content: "You have the right to access, modify, or delete your personal data at any time. You can delete your account by contacting us at support@cinemaverse.com. Upon account deletion, all associated data (watchlists, ratings, votes) will be permanently removed."
            },
            {
              title: "7. Changes to This Policy",
              content: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. Continued use of CinemaVerse after changes constitutes acceptance of the updated policy."
            },
            {
              title: "8. Contact Us",
              content: "If you have any questions about this Privacy Policy, please contact us at support@cinemaverse.com."
            }
          ].map((section, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-bebas text-2xl text-white mb-3">{section.title}</h2>
              <p className="text-gray-300 font-sans text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
