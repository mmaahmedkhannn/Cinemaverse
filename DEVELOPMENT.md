# Development Guide

This guide covers common developer tasks and procedures for working on the CinemaDiscovery codebase.

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Movies Site"
   ```

2. **Environment Configuration:**
   Ensure you have Node.js 20 installed.
   Copy the example environment file and fill in the required API keys.
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   This starts the Vite dev server with Hot Module Replacement (HMR).

## Adding a New Blog Article

Blog articles are managed statically in `src/data/blogArticles.ts`.

1. **Edit Data File:**
   Open `src/data/blogArticles.ts` and append a new article object to the array.
2. **Required Fields:**
   Ensure the object contains `id`, `slug`, `title`, `metaDescription`, `excerpt`, `date`, `readTime`, `category`, and `content` (Markdown/HTML string).
3. **Routing:**
   The application routing will automatically pick up the new slug and generate the corresponding `/blog/:slug` page.
4. **Sitemap Update:**
   The post-build script automatically reads this file to update the sitemap. No manual sitemap generation is needed.

## Adding a New Page

1. **Create Component:**
   Create a new `.tsx` file in `src/pages/` (e.g., `src/pages/About.tsx`).
2. **Add Route:**
   Open `src/App.tsx` and import your new component. Add a `<Route>` element inside the main `<Routes>` block.
3. **Update Navigation:**
   If the page should be globally accessible, add a link in `src/components/layout/Navbar.tsx` or `Footer.tsx`.
4. **Update Pre-rendering & Sitemap:**
   Add the new route path to the `staticRoutes` array in `scripts/generate-sitemap.js` and `scripts/prerender.js`.

## Adding a New Movie/Show to a Franchise

Franchise timelines are managed in `src/data/franchises.ts`.

1. **Verify TMDB ID:**
   Use the TMDB API or website to find the correct ID for the movie or TV show.
2. **Edit Data File:**
   Open `src/data/franchises.ts`. Locate the appropriate franchise array (e.g., `mcuMovies`).
3. **Add Entry:**
   Add an object with `{ id: <TMDB_ID>, type: 'movie' | 'tv' }` in the correct chronological order.

## Building for Production

1. **Run Build Command:**
   ```bash
   npm run build
   ```
2. **Output:**
   The build process will compile TypeScript, bundle assets via Vite, and output the optimized application to the `dist/` directory. The `postbuild` script will then run to generate `sitemap.xml` and pre-render static HTML files.

## Testing Prerendering

To verify that static HTML files are generated correctly:
1. Run `npm run build`.
2. Check the `dist/` folder. You should see `.html` files corresponding to your routes (e.g., `dist/movie/123.html`).
3. Serve the `dist/` folder locally using a static server (e.g., `npx serve dist`) to verify behavior.

## Common Debugging Scenarios

- **"Site shows 403 on URL with trailing slash"**
  → Flush the Hostinger CDN cache. Verify the `.htaccess` SPA routing and trailing slash removal rules are correct.
  
- **"Blog article not appearing on site"**
  → Confirm the entry exists and is well-formed in `src/data/blogArticles.ts`. Check that the slug matches the sitemap. Run a production build to trigger the prerender script.
  
- **"Mobile UX looks wrong after deploy"**
  → Flush the Hostinger CDN cache. Confirm that "Development Mode" is OFF in the CDN panel to ensure CSS changes propagate.
  
- **"Google not indexing new pages"**
  → Resubmit the `sitemap.xml` in Google Search Console. Manually request indexing via the URL Inspection tool for priority pages.
