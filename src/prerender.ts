import { blogArticles } from './data/blogArticles';
import { FRANCHISES } from './data/franchises';

const staticRoutes = [
  '/',
  '/movies',
  '/tv',
  '/universe',
  '/timeline',
  '/directors',
  '/top100',
  '/battles',
  '/blog',
  '/about',
  '/contact',
  '/auth',
  '/privacy',
  '/terms'
];

const blogRoutes = blogArticles.map(article => `/blog/${article.slug}`);

const franchiseRoutes: string[] = [];

// Phase 1: MCU, DCEU, Star Wars, Wizarding World (Harry Potter)
const targetFranchises = ['mcu', 'dc', 'starwars', 'harrypotter'];
FRANCHISES.forEach(franchise => {
  if (targetFranchises.includes(franchise.id)) {
    franchise.entries.forEach(entry => {
      if (entry.mediaType === 'tv') {
        franchiseRoutes.push(`/tv/${entry.id}`);
      } else {
        franchiseRoutes.push(`/movie/${entry.id}`);
      }
    });
  }
});

// Remove duplicates if any
const uniqueRoutes = [...new Set([...staticRoutes, ...blogRoutes, ...franchiseRoutes])];

export default uniqueRoutes;
