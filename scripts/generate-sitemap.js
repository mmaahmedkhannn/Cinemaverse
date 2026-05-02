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
const DEFAULT_URL = 'https://cinemadiscovery.com';

function createStaticHtml(template, { title, description, url, image, type = 'website' }) {
  let html = template;
  html = html.replace(`<title>${DEFAULT_TITLE}</title>`, `<title>${title}</title>`);
  
  // Replace meta descriptions
  html = html.replace(new RegExp(`content="${DEFAULT_DESC}"`, 'g'), `content="${(description || '').replace(/"/g, '&quot;')}"`);
  
  // Replace canonical and og:url
  html = html.replace(new RegExp(`href="${DEFAULT_URL}"`, 'g'), `href="${url}"`);
  html = html.replace(new RegExp(`content="${DEFAULT_URL}"`, 'g'), `content="${url}"`);
  
  // Replace og:title and twitter:title
  html = html.replace(new RegExp(`content="${DEFAULT_TITLE}"`, 'g'), `content="${title}"`);

  // Replace type
  html = html.replace(`content="website"`, `content="${type}"`);

  if (image) {
    html = html.replace(new RegExp(`content="https://cinemadiscovery.com/og-image.jpg"`, 'g'), `content="${image}"`);
  }

  return html;
}

function writeHtmlFile(destPath, urlPath, htmlContent) {
  const filePath = path.join(destPath, `${urlPath}.html`);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, htmlContent);
}

// Very basic regex parser to extract blog info without tsc
function getBlogArticles() {
  const fileContent = fs.readFileSync(path.resolve(__dirname, '../src/data/blogArticles.ts'), 'utf-8');
  const articles = [];
  const regex = /slug:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"][\s\S]*?metaDescription:\s*['"]([^'"]+)['"][\s\S]*?heroImage:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    articles.push({
      slug: match[1],
      title: match[2],
      metaDescription: match[3],
      heroImage: match[4]
    });
  }
  return articles;
}

async function run() {
  console.log('Generating dynamic sitemap.xml and pre-rendered SEO shells...');
  try {
    const distPath = path.resolve(__dirname, '../dist');
    let templateHtml = '';
    // Only attempt to read template if it exists (e.g. after vite build)
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
      templateHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
    }

    const blogArticles = getBlogArticles();

    const pages = [
      { url: '/', title: DEFAULT_TITLE, desc: DEFAULT_DESC },
      { url: '/movies', title: 'Movies | CinemaDiscovery', desc: 'Browse the ultimate directory of movies. Filter by genre, rating, and decade.' },
      { url: '/tv', title: 'TV Shows | CinemaDiscovery', desc: 'Discover amazing TV shows. From ongoing series to completed masterpieces.' },
      { url: '/universe', title: 'Cinematic Universes | CinemaDiscovery', desc: 'Explore timelines of cinematic universes like MCU, DC, and Star Wars.' },
      { url: '/timeline', title: 'Cinematic Timeline | CinemaDiscovery', desc: 'Travel through the history of cinema decade by decade.' },
      { url: '/directors', title: 'Directors | CinemaDiscovery', desc: 'Explore the filmographies of the greatest directors in history.' },
      { url: '/battles', title: 'Weekly Battles | CinemaDiscovery', desc: 'Vote in weekly cinematic battles and see which movies and characters come out on top.' },
      { url: '/top100', title: 'Top 100 Movies | CinemaDiscovery', desc: 'The definitive top 100 greatest movies of all time, ranked.' },
      { url: '/about', title: 'About Us | CinemaDiscovery', desc: 'Learn more about CinemaDiscovery and our mission.' },
      { url: '/contact', title: 'Contact | CinemaDiscovery', desc: 'Get in touch with the CinemaDiscovery team.' },
      { url: '/privacy', title: 'Privacy Policy | CinemaDiscovery', desc: 'CinemaDiscovery Privacy Policy.' },
      { url: '/terms', title: 'Terms of Service | CinemaDiscovery', desc: 'CinemaDiscovery Terms of Service.' },
      { url: '/blog', title: 'Blog | CinemaDiscovery', desc: 'Read expert film analysis, curated movie lists, and streaming guides.' },
      { url: '/auth', title: 'Sign In | CinemaDiscovery', desc: 'Join CinemaDiscovery to track your watchlist and rate movies.' },
      { url: '/blog/best-christopher-nolan-movies-for-beginners', title: 'The Best Christopher Nolan Movies to Watch If You Have Never Seen His Work | CinemaDiscovery', desc: 'Never seen a Nolan film before? Start here. We break down exactly which Christopher Nolan movies to watch first and why the order matters more than you think.' },
    ];

    blogArticles.forEach(article => {
      pages.push({
        url: `/blog/${article.slug}`,
        title: `${article.title} | CinemaDiscovery`,
        desc: article.metaDescription,
        image: article.heroImage,
        type: 'article'
      });
    });

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    console.log('Fetching TMDB popular resources...');

    // Fetch movies (Top 5 pages)
    for (let page = 1; page <= 5; page++) {
      const { data } = await tmdbClient.get('/movie/popular', { params: { page } });
      data.results.forEach(m => {
        pages.push({
          url: `/movie/${m.id}/${generateSlug(m.title)}`,
          title: `${m.title} | CinemaDiscovery`,
          desc: m.overview || DEFAULT_DESC,
          image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null
        });
      });
      await delay(200); // Prevent 429 Rate Limits
    }

    // Fetch TV (Top 5 pages)
    for (let page = 1; page <= 5; page++) {
      const { data } = await tmdbClient.get('/tv/popular', { params: { page } });
      data.results.forEach(t => {
        pages.push({
          url: `/tv/${t.id}/${generateSlug(t.name)}`,
          title: `${t.name} (TV Series) | CinemaDiscovery`,
          desc: t.overview || DEFAULT_DESC,
          image: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : null
        });
      });
      await delay(200);
    }

    // Fetch Directors (Top 5 pages of people to naturally extract directing popularity)
    for (let page = 1; page <= 5; page++) {
      const { data } = await tmdbClient.get('/person/popular', { params: { page } });
      const directors = data.results.filter(p => p.known_for_department === 'Directing');
      directors.forEach(d => {
        pages.push({
          url: `/director/${d.id}/${generateSlug(d.name)}`,
          title: `${d.name} | Director Profile | CinemaDiscovery`,
          desc: `Explore the filmography and movies directed by ${d.name} on CinemaDiscovery.`,
          image: d.profile_path ? `https://image.tmdb.org/t/p/w500${d.profile_path}` : null
        });
      });
      await delay(200);
    }

    // Deduplicate pages by URL to prevent duplicate sitemap entries
    const seenUrls = new Set();
    const uniquePages = pages.filter(p => {
      if (seenUrls.has(p.url)) return false;
      seenUrls.add(p.url);
      return true;
    });

    // 1. Generate Sitemap XML
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

    // 2. Generate Pre-rendered SEO HTML shells for Apache Rewrites
    if (templateHtml) {
      let prerenderCount = 0;
      uniquePages.forEach(p => {
        if (p.url === '/') return; // Already exists as index.html
        const pageHtml = createStaticHtml(templateHtml, {
          title: p.title,
          description: p.desc,
          url: `${DOMAIN}${p.url}`,
          image: p.image,
          type: p.type
        });
        writeHtmlFile(distPath, p.url, pageHtml);
        prerenderCount++;
      });
      console.log(`Successfully generated ${prerenderCount} static HTML SEO files in dist/`);
    } else {
      console.log('Skipped HTML pre-rendering because dist/index.html was not found (run vite build first).');
    }

  } catch (err) {
    console.error('Error generating sitemap and static HTML:', err.message);
    if (err.response) {
      console.error('TMDB API Error:', err.response.status, err.response.data);
    }
    console.log('Skipping dynamic URLs due to API failure. Build will continue.');
    // Exit with 0 so npm run build doesn't crash on standard API rate limits or auth errors across environments
    process.exit(0);
  }
}

run();

