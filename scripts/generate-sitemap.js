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

async function run() {
  console.log('Generating dynamic sitemap.xml...');
  try {
    // Blog article slugs (must match src/data/blogArticles.ts)
    const blogSlugs = [
      'best-movies-of-2025',
      'top-10-directors-of-all-time',
      'best-tv-shows-to-watch-right-now',
      'movies-like-inception',
      'christopher-nolan-movies-ranked',
      'best-thriller-movies-of-all-time',
      'most-underrated-movies-on-netflix',
      'best-sci-fi-movies-2024',
      'top-rated-hbo-shows',
      'movies-with-best-cinematography',
    ];

    const urls = [
      '/', '/movies', '/tv', '/universe', '/timeline', '/directors', '/battles', '/top100',
      '/about', '/contact', '/privacy', '/terms', '/blog', '/auth',
      ...blogSlugs.map(slug => `/blog/${slug}`),
    ];

    console.log('Fetching TMDB popular resources...');

    // Fetch movies (Top 5 pages)
    for (let page = 1; page <= 5; page++) {
      const { data } = await tmdbClient.get('/movie/popular', { params: { page } });
      data.results.forEach(m => urls.push(`/movie/${m.id}/${generateSlug(m.title)}`));
    }

    // Fetch TV (Top 5 pages)
    for (let page = 1; page <= 5; page++) {
      const { data } = await tmdbClient.get('/tv/popular', { params: { page } });
      data.results.forEach(t => urls.push(`/tv/${t.id}/${generateSlug(t.name)}`));
    }

    // Fetch Directors (Top 5 pages of people to naturally extract directing popularity)
    for (let page = 1; page <= 5; page++) {
      const { data } = await tmdbClient.get('/person/popular', { params: { page } });
      const directors = data.results.filter(p => p.known_for_department === 'Directing');
      directors.forEach(d => urls.push(`/director/${d.id}/${generateSlug(d.name)}`));
    }

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${DOMAIN}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${url === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === '/' ? '1.0' : url.startsWith('/blog/') ? '0.7' : url.includes('/movie/') ? '0.8' : (url.includes('/tv/') || url.includes('/director/')) ? '0.7' : '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;

    const destPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(destPath, sitemapContent);
    console.log(`Successfully generated sitemap with ${urls.length} URLs at public/sitemap.xml`);
  } catch (err) {
    console.error('Error generating sitemap:', err.message);
  }
}

run();
