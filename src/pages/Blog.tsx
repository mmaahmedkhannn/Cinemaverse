import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogArticles } from '../data/blogArticles';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const Blog = () => {
  return (
    <main className="min-h-screen bg-black pt-24 pb-20">
      <Helmet>
        <title>Blog — CinemaDiscovery</title>
        <meta name="description" content="Read expert film analysis, curated movie lists, streaming guides, and director deep-dives on the CinemaDiscovery blog." />
        <link rel="canonical" href="https://cinemadiscovery.com/blog" />
        <meta property="og:title" content="Blog — CinemaDiscovery" />
        <meta property="og:description" content="Expert film analysis, curated movie lists, and streaming guides." />
        <meta property="og:url" content="https://cinemadiscovery.com/blog" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-primary font-sans text-sm font-semibold tracking-widest uppercase">CinemaDiscovery Blog</span>
          </div>
          <h1 className="font-bebas text-5xl md:text-7xl text-white tracking-wide mb-4">
            Stories About Cinema
          </h1>
          <p className="text-gray-400 font-sans text-lg max-w-2xl mx-auto">
            Expert analysis, curated rankings, and deep dives into the world of film and television.
          </p>
        </div>

        {/* Featured Article (first one) */}
        <Link to={`/blog/${blogArticles[0].slug}`} className="group block mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500"
          >
            <div className="aspect-[21/9] relative">
              <img
                src={blogArticles[0].heroImage}
                alt={blogArticles[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <span className="inline-block bg-primary/90 text-white text-xs font-sans font-bold px-3 py-1 rounded-full mb-4">
                  {blogArticles[0].category}
                </span>
                <h2 className="font-bebas text-3xl md:text-5xl text-white mb-3 group-hover:text-primary transition-colors">
                  {blogArticles[0].title}
                </h2>
                <p className="text-gray-300 font-sans text-sm md:text-base max-w-2xl mb-4 line-clamp-2">
                  {blogArticles[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-gray-400 text-xs font-sans">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(blogArticles[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {blogArticles[0].readTime}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogArticles.slice(1).map((article, i) => (
            <Link to={`/blog/${article.slug}`} key={article.slug} className="group">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/[0.05] transition-all duration-400"
              >
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src={article.heroImage}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md text-white text-[10px] font-sans font-bold px-2.5 py-1 rounded-full border border-white/20">
                    {article.category}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="font-bebas text-2xl text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-400 font-sans text-sm mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-500 text-xs font-sans">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                    </div>
                    <span className="text-primary text-xs font-sans font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Blog;
