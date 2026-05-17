/**
 * generate-sitemap.js
 *
 * Build-time script that generates:
 * 1. A dynamic sitemap.xml in `public/` with all discoverable routes
 * 2. Pre-rendered HTML shells in `dist/` for every route — each shell contains
 *    page-specific <title>, meta tags, Open Graph, Twitter Card, and JSON-LD
 *    structured data so that search engine crawlers see real content without
 *    needing to execute JavaScript.
 *
 * This is the sole prerendering mechanism. It works on any build server
 * (including Hostinger) without requiring Puppeteer or headless Chrome.
 *
 * Run as: `node scripts/generate-sitemap.js` (called automatically during `npm run build`)
 * Note: Exits with code 0 on API failure so the build pipeline doesn't break.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TMDB_READ_TOKEN = process.env.VITE_TMDB_READ_TOKEN;
const DOMAIN = 'https://cinemadiscovery.com';

const generateSlug = (text) => (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const tmdbClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${TMDB_READ_TOKEN}`,
  },
});

const DEFAULT_TITLE = 'CinemaDiscovery | The Ultimate Movie & TV Database';
const DEFAULT_DESC = 'Discover every movie and TV show ever made. Ratings, trailers, streaming availability, cast lists, and more.';

// ─── JSON-LD Schema Generators ───────────────────────────────────────────────

function websiteSchema() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CinemaDiscovery',
    url: DOMAIN,
    description: 'The Ultimate Movie & TV Database',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${DOMAIN}/search?q={query}`,
      'query-input': 'required name=query',
    },
  });
}

function blogPostingSchema(article) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.metaDescription,
    image: article.heroImage,
    datePublished: article.publishDate || article.date,
    dateModified: article.publishDate || article.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${DOMAIN}/blog/${article.slug}`,
    },
    author: {
      '@type': 'Person',
      name: article.author || 'Ahmed Khan',
      url: `${DOMAIN}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CinemaDiscovery',
      logo: {
        '@type': 'ImageObject',
        url: `${DOMAIN}/logo.png`,
      },
    },
    articleSection: article.category || 'Movies',
    keywords: article.keywords || '',
  });
}

function movieSchema(movie) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.overview || '',
    url: `${DOMAIN}/movie/${movie.id}`,
    datePublished: movie.release_date || '',
  };
  if (movie.poster_path) {
    schema.image = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  }
  if (movie.vote_average && movie.vote_count) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: movie.vote_average.toFixed(1),
      bestRating: '10',
      ratingCount: movie.vote_count,
    };
  }
  return JSON.stringify(schema);
}

function tvSeriesSchema(show) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: show.name,
    description: show.overview || '',
    url: `${DOMAIN}/tv/${show.id}`,
    datePublished: show.first_air_date || '',
  };
  if (show.poster_path) {
    schema.image = `https://image.tmdb.org/t/p/w500${show.poster_path}`;
  }
  if (show.vote_average && show.vote_count) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: show.vote_average.toFixed(1),
      bestRating: '10',
      ratingCount: show.vote_count,
    };
  }
  return JSON.stringify(schema);
}

function directorSchema(director) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: director.name,
    jobTitle: 'Film Director',
    url: `${DOMAIN}/director/${director.id}/${generateSlug(director.name)}`,
    description: `Explore the filmography and movies directed by ${director.name} on CinemaDiscovery.`,
  };
  if (director.profile_path) {
    schema.image = `https://image.tmdb.org/t/p/w500${director.profile_path}`;
  }
  return JSON.stringify(schema);
}

function collectionPageSchema(name, description, url) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'CinemaDiscovery',
      url: DOMAIN,
    },
  });
}

function itemListSchema(name, description, url) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url,
    numberOfItems: 100,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
  });
}

// ─── HTML Shell Generator ────────────────────────────────────────────────────

/**
 * Takes the dist/index.html template and replaces default meta tags with
 * page-specific values. Also injects a JSON-LD <script> block before </head>.
 * The React app still hydrates normally on top of this shell.
 */
function createStaticHtml(template, { title, description, url, image, type = 'website', schema }) {
  let html = template;

  // Replace <title> content
  html = html.replace(
    `<title>${DEFAULT_TITLE}</title>`,
    `<title>${escapeHtml(title)}</title>`
  );

  // Replace meta descriptions (both name="description" and OG/Twitter)
  html = html.replace(
    new RegExp(`content="${escapeRegex(DEFAULT_DESC)}"`, 'g'),
    `content="${escapeAttr(description)}"`
  );

  // Replace canonical and og:url
  html = html.replace(
    new RegExp(`href="${escapeRegex(DOMAIN)}"`, 'g'),
    `href="${url}"`
  );
  html = html.replace(
    new RegExp(`content="${escapeRegex(DOMAIN)}"`, 'g'),
    `content="${url}"`
  );

  // Replace og:title and twitter:title
  html = html.replace(
    new RegExp(`content="${escapeRegex(DEFAULT_TITLE)}"`, 'g'),
    `content="${escapeAttr(title)}"`
  );

  // Replace og:type
  if (type !== 'website') {
    html = html.replace('content="website"', `content="${type}"`);
  }

  // Replace og:image and twitter:image
  if (image) {
    html = html.replace(
      new RegExp(`content="${escapeRegex(`${DOMAIN}/og-image.jpg`)}"`, 'g'),
      `content="${image}"`
    );
  }

  // Inject page-specific JSON-LD schema before </head>
  // (keeps the existing WebSite schema from index.html intact)
  if (schema) {
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">${schema}</script>\n  </head>`
    );
  }

  return html;
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function writeHtmlShell(distPath, routePath, htmlContent) {
  const filePath = routePath === '/'
    ? path.join(distPath, 'index.html')
    : path.join(distPath, `${routePath}/index.html`);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, htmlContent);
}

// ─── Blog article parser ─────────────────────────────────────────────────────

function getBlogArticles() {
  const fileContent = fs.readFileSync(path.resolve(__dirname, '../src/data/blogArticles.ts'), 'utf-8');
  const articles = [];
  // Match each article object block
  const articleRegex = /\{[\s\S]*?slug:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"][\s\S]*?metaDescription:\s*['"]([^'"]+)['"][\s\S]*?heroImage:\s*['"]([^'"]+)['"][\s\S]*?\}/g;
  let match;
  while ((match = articleRegex.exec(fileContent)) !== null) {
    const block = match[0];
    const article = {
      slug: match[1],
      title: match[2],
      metaDescription: match[3],
      heroImage: match[4],
    };
    // Extract optional fields
    const dateMatch = block.match(/publishDate:\s*['"]([^'"]+)['"]/);
    article.publishDate = dateMatch ? dateMatch[1] : null;
    const dateMatch2 = block.match(/(?<!publish)date:\s*['"]([^'"]+)['"]/);
    article.date = dateMatch2 ? dateMatch2[1] : '';
    const authorMatch = block.match(/author:\s*['"]([^'"]+)['"]/);
    article.author = authorMatch ? authorMatch[1] : 'Ahmed Khan';
    const categoryMatch = block.match(/category:\s*['"]([^'"]+)['"]/);
    article.category = categoryMatch ? categoryMatch[1] : 'Movies';
    const keywordsMatch = block.match(/keywords:\s*['"]([^'"]+)['"]/);
    article.keywords = keywordsMatch ? keywordsMatch[1] : '';
    articles.push(article);
  }
  return articles;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  console.log('Generating dynamic sitemap.xml and pre-rendered HTML shells...');
  try {
    const distPath = path.resolve(__dirname, '../dist');
    let templateHtml = '';
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
      templateHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
    }

    const blogArticles = getBlogArticles();

    // ─── Define all pages for sitemap + shell generation ───────────────
    const pages = [
      {
        url: '/',
        title: DEFAULT_TITLE,
        desc: DEFAULT_DESC,
        schema: websiteSchema(),
      },
      {
        url: '/movies',
        title: 'Movies | CinemaDiscovery',
        desc: 'Browse the ultimate directory of movies. Filter by genre, rating, and decade.',
        schema: collectionPageSchema('Movies', 'Browse the ultimate directory of movies.', `${DOMAIN}/movies`),
      },
      {
        url: '/tv',
        title: 'TV Shows | CinemaDiscovery',
        desc: 'Discover amazing TV shows. From ongoing series to completed masterpieces.',
        schema: collectionPageSchema('TV Shows', 'Discover amazing TV shows.', `${DOMAIN}/tv`),
      },
      {
        url: '/universe',
        title: 'Cinematic Universes | CinemaDiscovery',
        desc: 'Explore timelines of cinematic universes like MCU, DC, and Star Wars.',
        schema: collectionPageSchema('Cinematic Universes', 'Explore timelines of cinematic universes like MCU, DC, and Star Wars.', `${DOMAIN}/universe`),
      },
      {
        url: '/timeline',
        title: 'Cinematic Timeline | CinemaDiscovery',
        desc: 'Travel through the history of cinema decade by decade.',
        schema: collectionPageSchema('Cinematic Timeline', 'Travel through the history of cinema decade by decade.', `${DOMAIN}/timeline`),
      },
      {
        url: '/directors',
        title: 'Directors | CinemaDiscovery',
        desc: 'Explore the filmographies of the greatest directors in history.',
        schema: collectionPageSchema('Directors', 'Explore the filmographies of the greatest directors in history.', `${DOMAIN}/directors`),
      },
      {
        url: '/battles',
        title: 'Weekly Battles | CinemaDiscovery',
        desc: 'Vote in weekly cinematic battles and see which movies and characters come out on top.',
      },
      {
        url: '/top100',
        title: 'Top 100 Movies | CinemaDiscovery',
        desc: 'The definitive top 100 greatest movies of all time, ranked.',
        schema: itemListSchema('Top 100 Movies', 'The definitive top 100 greatest movies of all time, ranked.', `${DOMAIN}/top100`),
      },
      {
        url: '/about',
        title: 'About Us | CinemaDiscovery',
        desc: 'Learn more about CinemaDiscovery and our mission.',
      },
      {
        url: '/contact',
        title: 'Contact | CinemaDiscovery',
        desc: 'Get in touch with the CinemaDiscovery team.',
      },
      {
        url: '/privacy',
        title: 'Privacy Policy | CinemaDiscovery',
        desc: 'CinemaDiscovery Privacy Policy.',
      },
      {
        url: '/terms',
        title: 'Terms of Service | CinemaDiscovery',
        desc: 'CinemaDiscovery Terms of Service.',
      },
      {
        url: '/blog',
        title: 'Blog | CinemaDiscovery',
        desc: 'Read expert film analysis, curated movie lists, and streaming guides.',
        schema: collectionPageSchema('Blog', 'Read expert film analysis, curated movie lists, and streaming guides.', `${DOMAIN}/blog`),
      },
      {
        url: '/auth',
        title: 'Sign In | CinemaDiscovery',
        desc: 'Join CinemaDiscovery to track your watchlist and rate movies.',
      },
    ];

    // Blog article pages with BlogPosting schema
    blogArticles.forEach(article => {
      pages.push({
        url: `/blog/${article.slug}`,
        title: `${article.title} | CinemaDiscovery`,
        desc: article.metaDescription,
        image: article.heroImage,
        type: 'article',
        schema: blogPostingSchema(article),
      });
    });

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    console.log('Fetching TMDB popular resources...');

    // ─── Movie pages (Top 5 pages of popular) ─────────────────────────
    const movieData = [];
    for (let page = 1; page <= 5; page++) {
      const { data } = await tmdbClient.get('/movie/popular', { params: { page } });
      data.results.forEach(m => {
        movieData.push(m);
        pages.push({
          url: `/movie/${m.id}/${generateSlug(m.title)}`,
          title: `${m.title} | CinemaDiscovery`,
          desc: m.overview || DEFAULT_DESC,
          image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          type: 'video.movie',
          schema: movieSchema(m),
        });
        // Also create shell at /movie/{id} (without slug) for internal links
        pages.push({
          url: `/movie/${m.id}`,
          title: `${m.title} | CinemaDiscovery`,
          desc: m.overview || DEFAULT_DESC,
          image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          type: 'video.movie',
          schema: movieSchema(m),
        });
      });
      await delay(200);
    }

    // ─── TV pages (Top 5 pages of popular) ────────────────────────────
    for (let page = 1; page <= 5; page++) {
      const { data } = await tmdbClient.get('/tv/popular', { params: { page } });
      data.results.forEach(t => {
        pages.push({
          url: `/tv/${t.id}/${generateSlug(t.name)}`,
          title: `${t.name} (TV Series) | CinemaDiscovery`,
          desc: t.overview || DEFAULT_DESC,
          image: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : null,
          type: 'video.tv_show',
          schema: tvSeriesSchema(t),
        });
        // Also /tv/{id} without slug
        pages.push({
          url: `/tv/${t.id}`,
          title: `${t.name} (TV Series) | CinemaDiscovery`,
          desc: t.overview || DEFAULT_DESC,
          image: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : null,
          type: 'video.tv_show',
          schema: tvSeriesSchema(t),
        });
      });
      await delay(200);
    }

    // ─── Director pages (Top 5 pages of popular people) ───────────────
    for (let page = 1; page <= 5; page++) {
      const { data } = await tmdbClient.get('/person/popular', { params: { page } });
      const directors = data.results.filter(p => p.known_for_department === 'Directing');
      directors.forEach(d => {
        pages.push({
          url: `/director/${d.id}/${generateSlug(d.name)}`,
          title: `${d.name} | Director Profile | CinemaDiscovery`,
          desc: `Explore the filmography and movies directed by ${d.name} on CinemaDiscovery.`,
          image: d.profile_path ? `https://image.tmdb.org/t/p/w500${d.profile_path}` : null,
          schema: directorSchema(d),
        });
      });
      await delay(200);
    }

    // ─── Deduplicate by URL ───────────────────────────────────────────
    const seenUrls = new Set();
    const uniquePages = pages.filter(p => {
      if (seenUrls.has(p.url)) return false;
      seenUrls.add(p.url);
      return true;
    });

    // ─── 1. Generate Sitemap XML ──────────────────────────────────────
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniquePages.map(p => `  <url>
    <loc>${DOMAIN}${p.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${p.url === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${p.url === '/' ? '1.0' : p.url.startsWith('/blog/') ? '0.7' : p.url.includes('/movie/') ? '0.8' : (p.url.includes('/tv/') || p.url.includes('/director/')) ? '0.7' : '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;

    const destSitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(destSitemapPath, sitemapContent);
    console.log(`Successfully generated sitemap with ${uniquePages.length} URLs at public/sitemap.xml`);

    // ─── 2. Generate Pre-rendered HTML Shells ─────────────────────────
    if (!templateHtml) {
      console.log('WARNING: dist/index.html not found — skipping HTML shell generation.');
      console.log('This is expected if running before vite build.');
    } else {
      let shellCount = 0;
      for (const page of uniquePages) {
        try {
          const html = createStaticHtml(templateHtml, {
            title: page.title,
            description: page.desc,
            url: `${DOMAIN}${page.url}`,
            image: page.image,
            type: page.type || 'website',
            schema: page.schema,
          });
          writeHtmlShell(distPath, page.url, html);
          shellCount++;
        } catch (err) {
          console.error(`Failed to generate shell for ${page.url}:`, err.message);
        }
      }
      console.log(`Successfully generated ${shellCount} HTML shells in dist/`);
    }

  } catch (err) {
    console.error('Error generating sitemap and static HTML:', err.message);
    if (err.response) {
      console.error('TMDB API Error:', err.response.status, err.response.data);
    }
    console.log('Skipping dynamic URLs due to API failure. Build will continue.');
    // Exit with 0 so npm run build doesn't crash on standard API rate limits or auth errors
    process.exit(0);
  }
}

run();
