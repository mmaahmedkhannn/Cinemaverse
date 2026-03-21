import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background-dark pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-bebas text-6xl md:text-8xl text-white tracking-wider mb-4">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-gray-400 text-sm font-sans">Last updated: March 2026</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-8">
          {[
            {
              title: "1. Acceptance of Terms",
              content: "By accessing and using CinemaDiscovery, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform."
            },
            {
              title: "2. User Accounts",
              content: "You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 13 years of age to create an account."
            },
            {
              title: "3. Acceptable Use",
              content: "You agree not to misuse CinemaDiscovery services. This includes not attempting to access other users' accounts, not manipulating voting systems (Movie Battles, Top 100), not scraping or harvesting data from the platform, and not using the service for any unlawful purpose."
            },
            {
              title: "4. Content & Data",
              content: "Movie and TV show data displayed on CinemaDiscovery is sourced from The Movie Database (TMDB) API. CinemaDiscovery does not claim ownership of this data. User-generated content (watchlists, ratings, votes) remains the property of the respective users."
            },
            {
              title: "5. CV Scores",
              content: "CV Scores are calculated using a proprietary algorithm that combines multiple data points from TMDB. These scores are provided for entertainment and informational purposes only and should not be considered definitive critical assessments."
            },
            {
              title: "6. Movie Battles & Voting",
              content: "Participation in Movie Battles and Top 100 voting is voluntary. Each user is limited to one vote per battle. Vote manipulation through multiple accounts or automated systems is strictly prohibited and may result in account suspension."
            },
            {
              title: "7. Intellectual Property",
              content: "The CinemaDiscovery brand, logo, design, and proprietary features (CV Scores, CinemaDiscovery Wrapped) are the intellectual property of CinemaDiscovery. Movie posters, images, and metadata are the property of their respective studios and are used under TMDB's API terms."
            },
            {
              title: "8. Service Availability",
              content: "CinemaDiscovery is provided on an 'as-is' basis. We do not guarantee uninterrupted access to the platform. We reserve the right to modify, suspend, or discontinue any part of the service at any time without prior notice."
            },
            {
              title: "9. Limitation of Liability",
              content: "CinemaDiscovery shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you have paid to CinemaDiscovery (if any) in the 12 months preceding the claim."
            },
            {
              title: "10. Changes to Terms",
              content: "We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of CinemaDiscovery after any changes constitutes acceptance of the new terms."
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

export default Terms;
