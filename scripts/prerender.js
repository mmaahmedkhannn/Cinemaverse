import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Read static routes
const staticRoutes = [
  '/', '/movies', '/tv', '/universe', '/timeline', 
  '/directors', '/top100', '/battles', '/blog', 
  '/about', '/contact', '/auth', '/privacy', '/terms'
];

// Read blog slugs
const blogContent = fs.readFileSync(path.resolve(__dirname, '../src/data/blogArticles.ts'), 'utf-8');
const blogRoutes = [];
const blogRegex = /slug:\s*['"]([^'"]+)['"]/g;
let match;
while ((match = blogRegex.exec(blogContent)) !== null) {
  blogRoutes.push(`/blog/${match[1]}`);
}

// Read franchises
const franchiseContent = fs.readFileSync(path.resolve(__dirname, '../src/data/franchises.ts'), 'utf-8');
const franchiseRoutes = [];
const targetFranchises = ['mcu', 'dc', 'starwars', 'harrypotter'];

targetFranchises.forEach(fId => {
  const startIdx = franchiseContent.indexOf(`id: '${fId}'`);
  if (startIdx === -1) return;
  const nextFranchiseIdx = franchiseContent.indexOf(`id: '`, startIdx + 10);
  const block = nextFranchiseIdx === -1 ? franchiseContent.slice(startIdx) : franchiseContent.slice(startIdx, nextFranchiseIdx);
  
  const entryRegex = /\{\s*id:\s*(\d+)[^}]*\}/g;
  let entryMatch;
  while ((entryMatch = entryRegex.exec(block)) !== null) {
    const id = entryMatch[1];
    const isTv = entryMatch[0].includes(`mediaType: 'tv'`);
    franchiseRoutes.push(isTv ? `/tv/${id}` : `/movie/${id}`);
  }
});

const routes = [...new Set([...staticRoutes, ...blogRoutes, ...franchiseRoutes])];
console.log(`Found ${routes.length} routes to prerender.`);

const PORT = 4173;
const app = express();
app.use(express.static(distPath));
app.use((req, res) => res.sendFile(path.join(distPath, 'index.html')));

const server = app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const concurrency = 10;
  for (let i = 0; i < routes.length; i += concurrency) {
    const chunk = routes.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (route) => {
      const page = await browser.newPage();
      // Block images/media to speed up rendering
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (req.resourceType() === 'image' || req.resourceType() === 'media' || req.resourceType() === 'font') {
          req.abort();
        } else {
          req.continue();
        }
      });
      try {
        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
        
        await page.waitForFunction(() => {
          const root = document.getElementById('root');
          return root && root.hasChildNodes();
        }, { timeout: 10000 }).catch(() => {});
        
        await new Promise(r => setTimeout(r, 500));

        let html = await page.content();
        
        const filePath = path.join(distPath, route === '/' ? 'index.html' : `${route}/index.html`);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, html);
        console.log(`Prerendered ${route}`);
      } catch (err) {
        console.error(`Failed to prerender ${route}:`, err.message);
      } finally {
        await page.close();
      }
    }));
  }
  
  await browser.close();
  server.close();
  console.log('Prerendering complete!');
});
