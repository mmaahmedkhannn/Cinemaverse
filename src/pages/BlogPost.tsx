import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogArticles } from '../data/blogArticles';
import { Calendar, Clock, ArrowLeft, BookOpen, UserPen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

/* ── Minimal Markdown-ish renderer ─────────────────────────── */
function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="font-bebas text-3xl md:text-4xl text-white mt-12 mb-4 tracking-wide">
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="font-bebas text-2xl text-white/90 mt-8 mb-3 tracking-wide">
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // Table
    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter(l => !l.match(/^\|[\s-|]+\|$/));
      if (rows.length > 0) {
        const headerCells = rows[0].split('|').filter(Boolean).map(c => c.trim());
        const bodyRows = rows.slice(1);
        elements.push(
          <div key={`table-${i}`} className="my-6 overflow-x-auto">
            <table className="w-full text-sm font-sans border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  {headerCells.map((c, ci) => (
                    <th key={ci} className="text-left py-3 px-4 text-gray-400 font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => {
                  const cells = row.split('|').filter(Boolean).map(c => c.trim());
                  return (
                    <tr key={ri} className="border-b border-white/5">
                      {cells.map((c, ci) => (
                        <td key={ci} className="py-3 px-4 text-gray-300">{renderInline(c)}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Unordered list
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-4 pl-6 space-y-2 list-disc marker:text-primary">
          {items.map((item, idx) => (
            <li key={idx} className="text-gray-300 font-sans text-base leading-relaxed pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-gray-300 font-sans text-base leading-relaxed my-4">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

/* Inline formatting: **bold**, *italic*, [text](url) */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold**, *italic*, and [text](url)
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      // Bold
      parts.push(<strong key={match.index} className="text-white font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      // Italic
      parts.push(<em key={match.index} className="italic text-gray-200">{match[4]}</em>);
    } else if (match[5]) {
      // Link
      const linkText = match[6];
      const url = match[7];
      if (url.startsWith('/')) {
        parts.push(<Link key={match.index} to={url} className="text-primary hover:underline">{linkText}</Link>);
      } else {
        parts.push(<a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{linkText}</a>);
      }
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

/* ──────────────────────────────────────────────────────────── */

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = blogArticles.find(a => a.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) return <Navigate to="/blog" replace />;

  const otherArticles = blogArticles.filter(a => a.slug !== slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-black">
      <Helmet>
        <title>{article.title} — CinemaDiscovery</title>
        <meta name="description" content={article.metaDescription} />
        <link rel="canonical" href={`https://cinemadiscovery.com/blog/${article.slug}`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:url" content={`https://cinemadiscovery.com/blog/${article.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={article.heroImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.metaDescription} />
        <meta name="twitter:image" content={article.heroImage} />
      </Helmet>

      {/* Hero Image */}
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        <img
          src={article.heroImage}
          alt={`${article.title} — ${article.category} article on CinemaDiscovery`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

        {/* Back button */}
        <div className="absolute top-24 left-4 sm:left-8">
          <Link to="/blog" className="flex items-center gap-2 text-white/70 hover:text-white font-sans text-sm transition-colors bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <ArrowLeft className="w-4 h-4" /> All Articles
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block bg-primary/90 text-white text-xs font-sans font-bold px-3 py-1 rounded-full mb-4">
              {article.category}
            </span>
            <h1 className="font-bebas text-4xl md:text-6xl text-white tracking-wide mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm font-sans mb-3">
              <UserPen className="w-4 h-4 text-primary" />
              <span className="font-semibold">By CinemaDiscovery Editorial Team</span>
            </div>
            <div className="flex items-center gap-4 text-gray-300 text-sm font-sans">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {article.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-4 sm:px-8 py-12"
      >
        {renderContent(article.content)}
      </motion.article>

      {/* Related Articles */}
      {otherArticles.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-20">
          <div className="border-t border-white/10 pt-12">
            <div className="flex items-center gap-2 mb-8">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-bebas text-2xl text-white tracking-wide">More Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherArticles.map(a => (
                <Link to={`/blog/${a.slug}`} key={a.slug} className="group">
                  <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3">
                    <img src={a.heroImage} alt={`${a.title} — ${a.category} article on CinemaDiscovery`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-bebas text-lg text-white group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
                  <p className="text-gray-500 text-xs font-sans mt-1">{a.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default BlogPost;
