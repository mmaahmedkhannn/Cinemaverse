# CinemaDiscovery — Development Notes

> **Last Updated:** April 3, 2026
> **Owner:** Ahmed Khan
> **Live URL:** [cinemadiscovery.com](https://cinemadiscovery.com)
> **Repo:** [github.com/mmaahmedkhannn/Cinemaverse](https://github.com/mmaahmedkhannn/Cinemaverse)

---

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend:** React 18 + TypeScript (strict mode)
- **Build Tool:** Vite 7.x — base set to `/`
- **Styling:** Tailwind CSS v4 — pure black & red Netflix-style dark aesthetic
- **Routing:** React Router v7 with `React.lazy` + `Suspense` for code splitting
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Data Fetching:** TanStack React Query (all API calls go through this)
- **Auth:** Firebase Authentication — Email/Password + Google Sign-in
- **Database:** Cloud Firestore (project: `cinemaverse-35811`)
- **API — Movies/TV:** TMDB API
- **API — Rotten Tomatoes:** OMDb API
- **Email Service:** EmailJS (contact form, welcome emails, battle result emails)
- **SEO:** `react-helmet-async` + JSON-LD schema on all key pages
- **Affiliate:** Amazon Associates (tag: `cinemadiscove-20`)

### Deployment Flow
- **Hostinger** auto-deploys from GitHub `main` branch
- Hostinger pulls the repo, runs `npm run build`, and serves the `dist/` folder
- The GitHub Actions `deploy.yml` is a **CI validation step only** — it builds & checks but does NOT deploy
- **All environment variables must be set in TWO places:**
  1. **GitHub Secrets** (for CI validation in GitHub Actions)
  2. **Hostinger Environment Variables** (for the actual production build)
- Node version: 20.x (required for Tailwind v4)

### SPA Routing
- `public/.htaccess` handles Apache SPA routing on Hostinger — **never modify or remove**

---

## 🔑 Environment Variables

There are **13 environment variables** in use. All values are in `.env` locally (gitignored) and must exist in both GitHub Secrets AND Hostinger:

| Variable | Purpose |
|---|---|
| `VITE_TMDB_API_KEY` | TMDB API key for movie/TV data |
| `VITE_TMDB_READ_TOKEN` | TMDB read access bearer token |
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID (`cinemaverse-35811`) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_OMDB_API_KEY` | OMDb API key (for Rotten Tomatoes scores) |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID (starts with `service_`) |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID (starts with `template_`) |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `VITE_BEEHIIV_FORM_ID` | Beehiiv newsletter embed form ID (`1cbfbd90-bc11-4531-925c-3797f82ab877`) |

> ⚠️ **IMPORTANT:** Since Vite bakes `import.meta.env.VITE_*` values at **build time**, any new env var MUST be present in the Hostinger build environment for it to work on the live site. GitHub Secrets alone will NOT make it to production — Hostinger does its own build.

---

## 📁 File Structure

```
src/
├── assets/          # Static assets (images, etc.)
├── components/      # Reusable UI components
│   └── ui/          # Base UI components (ImageWithSkeleton, etc.)
├── contexts/        # React context providers (AuthContext)
├── data/            # Static data files (blogArticles.ts)
├── hooks/           # Custom React hooks
├── lib/             # Service files
│   ├── battleService.ts    # Weekly battles logic
│   ├── emailjs.ts          # EmailJS (welcome emails, battle results, contact)
│   ├── firebase.ts         # Firebase config & initialization
│   ├── firestore.ts        # Firestore CRUD operations
│   ├── sanitize.ts         # User-generated content sanitization
│   └── additional_battles.json  # Battle data
├── pages/           # All page components
├── services/        # API service files (tmdb.ts)
├── store/           # State management
└── utils/           # Utility functions (slugify.ts)
```

---

## 🎬 Features — Live & Working

### Core Pages
- **Homepage** — Trending hero carousel (auto-rotate), trending movies scroller, weekly battle section, hidden gems grid
- **Movies** — Infinite scroll, filters (year, genre, sort), filters persist in URL
- **TV Shows** — Infinite scroll, filters (year, genre, sort), filters persist in URL
- **Movie/TV Detail** — Full details, Where to Watch (Amazon affiliate links), Rotten Tomatoes scores via OMDb, trailers
- **Directors** — Infinite scroll sorted by TMDB popularity, spotlight section
- **Director Detail** — Full filmography, bio

### Special Features
- **Universe Page** — Franchise timelines: MCU, DC, Star Wars, Harry Potter
- **Cinematic Timeline** — Horizontal scroll 1900s–2020s with decade gradients and frosted glass year modal
- **Weekly Battles** — 7-day voting cycle, auto-winner, EmailJS blast to users, auto-starts next battle
- **Top 100 Page** — Community-voted top movies
- **CinemaDiscovery Wrapped** — End-of-year viewing stats (Spotify Wrapped-style)
- **Blog** — 10 SEO-optimized articles with hero images, author bylines

### User Features
- **Auth** — Email/Password + Google Sign-in, cinematic movie slideshow background
- **Profile** — Watchlists, ratings, Netflix-style character avatar selector (Money Heist, Stranger Things, MCU, DC, Star Wars, Breaking Bad, GoT, One Piece, Lucifer)
- **Verify Email** — Email verification flow

### Utility Pages
- **Contact** — Contact form via EmailJS, cinematic movie slideshow background
- **About** — Organization schema for SEO
- **Blog** — Individual blog posts with rich formatting
- **Privacy Policy & Terms** — Legal pages

---

## 💰 Monetization

- **Amazon Associates** — Tag: `cinemadiscove-20`
- The `getProviderLink()` function in `MovieDetail.tsx` generates Amazon links for any provider whose name contains "amazon" (case-insensitive)
- Link format: `https://www.amazon.com/s?k=[MovieTitle]&i=instant-video&tag=cinemadiscove-20`
- **Never remove or modify** this logic without explicit instruction

---

## 🔧 Recent Changes Log

### June 8, 2026
- **Verdict Wall — Battles Page Redesign** — Fully redesigned `src/pages/Battles.tsx` into a premium awards-season "Verdict Wall" concept. Created three new components: `src/components/battles/ScalesOfJustice.tsx` (inline SVG scales with Framer Motion beam tilt ±10° driven by vote leader), `src/components/battles/FilmExhibitCard.tsx` (gold-framed museum exhibit poster card with brass nameplate, TMDB score badge rendered instantly, RT score fading in from a background OMDb fetch via existing `useRottenTomatoes` hook), and `src/components/battles/VerdictReveal.tsx` (post-vote percentage bars with plain-JS count-up animation, staggered Framer Motion entrance, aria-live region, Twitter/X share button). Added `movie1Tagline`/`movie2Tagline` editorial hook fields to all 30 entries in `src/lib/additional_battles.json`. Added `--color-gold` (#D4A437), `--color-gold-muted`, `--color-verdict-bg`, `--color-crimson` (#B91C1C) tokens to `src/index.css` `@theme` block. ALL existing Firestore vote logic, PRESET_BATTLES fallback, 7-day rotation (`getWeeklyBattle`), poster-flicker fix (`setBattle` callback pattern), and EmailJS winner blast remain completely unchanged. OMDb/RT calls use React Query with 1-hour `staleTime` (existing hook already set to 24h — kept as-is). All animations respect `prefers-reduced-motion` via Framer Motion's `useReducedMotion`. Touch targets ≥44px. WCAG AA gold-on-near-black contrast maintained. Build passed with zero TypeScript errors (2363 modules). Sitemap regenerated (435 URLs). Commit: `cdb714e`.

### June 2, 2026
- **Beehiiv Newsletter Signup Integration** — Created `src/components/NewsletterSignup.tsx` with three variants (`hero`, `inline`, `footer`). Uses `IntersectionObserver` to delay Beehiiv v3 script injection until the section enters the viewport (+200px rootMargin) — improves LCP by not loading the script at page start. `useReducedMotion` is respected (ambient glow animation only on `motion-safe`). If `VITE_BEEHIIV_FORM_ID` env var is absent, renders a polite "Newsletter coming soon" fallback instead of a broken empty box. No hardcoded form IDs — reads exclusively from `import.meta.env.VITE_BEEHIIV_FORM_ID`. Placed in three locations: (1) `src/pages/Home.tsx` — `hero` variant after the Hidden Gems section; (2) `src/pages/BlogPost.tsx` — `inline` variant between article body and Related Articles; (3) `src/components/layout/Footer.tsx` — `footer` variant as first element inside `<footer>`, above all existing links and copyright. CSP updated in `public/.htaccess`: added `https://subscribe-forms.beehiiv.com` to `script-src`, `frame-src`, `connect-src`, and `style-src`; added `https://api.beehiiv.com` to `connect-src`. All existing CSP allowlist entries preserved. Attribution script (`attribution.js`) added to `index.html` right before `</body>` (async, non-blocking) for UTM source tracking. `VITE_BEEHIIV_FORM_ID` added to `.env`, `.env.example` (with documentation comment), and DEVELOPMENT_NOTES env var table. **Ahmed must add `VITE_BEEHIIV_FORM_ID=1cbfbd90-bc11-4531-925c-3797f82ab877` in Hostinger Environment Variables** — GitHub Secrets alone will NOT reach production. Build passed with zero TypeScript errors (2360 modules). Sitemap regenerated (409 URLs).

### June 1, 2026
- **Ambient Page Background (MovieDetail + TvShowDetail)** — Created new reusable `src/components/AmbientPageBackground.tsx` component. Renders a `position: fixed`, `inset-0`, `z-index: -1` layer that sits behind ALL page content (hero backdrop, navbar, content sections, footer). The backdrop image is rendered full-screen with `object-cover`, heavily blurred (`filter: blur(140px)`), so only the colour palette of the movie/TV show bleeds through — giving each detail page a unique chromatic feel. Stacked CSS gradient masks (top, bottom, left-edge vignettes) preserve text contrast at all viewport positions. Framer Motion breathing animation (opacity 0.25→0.30, 11s loop) on desktop only; `useReducedMotion` disables it when OS prefers reduced motion. Mobile: Tailwind `opacity-[0.10] md:opacity-100` responsive class keeps tint very faint on small screens. Fallback: crimson radial gradient when no `backdropUrl` is provided — never blank. Reuses the already-loaded `w1280` backdrop URL from the hero section (browser cache, zero extra network requests). `will-change: opacity` only on the animated image element. No new libraries, no CSP changes, no canvas/getImageData. Wired into `src/pages/MovieDetail.tsx` and `src/pages/TvShowDetail.tsx` as the first child of the page root — zero layout changes to any existing hero, poster, CTA, where-to-watch, or content sections. Build passed with zero TypeScript errors (2359 modules).

### May 31, 2026
- **Fix: Ambient Glow Visibility Bug** — Glow was completely invisible due to three compounding bugs: (1) The glow `<div>` was nested inside the `aspect-video` player container which had `overflow-hidden` — this clipped the entire `blur(100px)` halo before it could bleed past the edges. (2) The modal root had `bg-black` (solid, 100% opaque) which painted over the viewport before the glow element could show. (3) Opacity was too low (0.32) to read against a dark background. Fix in `src/components/ui/TrailerModal.tsx`: lifted glow to a `fixed` free-floating sibling of the player container (no longer inside it), sized `min(110vw,1400px) × min(75vh,900px)` so blur bleeds ~150px past all player edges, changed modal backdrop to `bg-black/80` (semi-transparent) so glow reads through, raised opacity floor to 0.50–0.65. Z-index stack: modal root z-[100], glow z-[101], player container z-[103], close button z-[110] — all unchanged structurally. Build passed with zero TypeScript errors. Commit: `b0b948b`.

- **Ambient Glow Behind Trailer Modal** — Created new shared `src/components/ui/TrailerModal.tsx` component. Renders a cinematic ambient-glow layer (TMDB w1280 backdrop image, `blur(92px)`, low opacity) behind the YouTube iframe, mimicking YouTube ambient mode. Framer Motion breathing animation (7s loop, opacity 0.32–0.42, scale 1.1–1.13). `useReducedMotion` disables animation when OS prefers reduced motion. Mobile wrapper (`opacity-60 md:opacity-100`) halves glow strength on small screens to protect Lighthouse score. Crimson→black radial gradient fallback when no backdrop URL is available. Glow layer is `z-[101]`; iframe is `z-[103]`; close button is `z-[110]` — close button and all controls are completely untouched. Both `MovieDetail.tsx` and `TvShowDetail.tsx` now use `<TrailerModal>` instead of their former inline modals; each passes `backdropUrl` as the existing TMDB `w1280` backdrop path. No new npm dependencies. No CSP/htaccess changes. Build passed with zero TypeScript errors (2358 modules). Commit: `f62ab52`.

- **Blog Article #15 Published** — Added "Most Anticipated Movies of 2026 | The Ones Worth Getting Excited About" as the new top article in `src/data/blogArticles.ts`. Slug: `most-anticipated-movies-of-2026-worth-getting-excited-about`. Covers The Mandalorian and Grogu, Backrooms, The Death of Robin Hood, Supergirl: Woman of Tomorrow, The Odyssey, Spider-Man: Brand New Day, Digger, The Hunger Games: Sunrise on the Reaping, Avengers: Doomsday, and Dune: Part Three. OG/hero image: `https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg` (Dune: Part Two TMDB backdrop). Internal links added for 4 confirmed TMDB IDs: Mandalorian & Grogu (1228710), Spider-Man: Brand New Day (969681), Supergirl: Woman of Tomorrow (1081003), Avengers: Doomsday (1003596). Remaining films left as plain text (IDs unconfirmed). Build passed with zero TypeScript errors. Sitemap updated (437 URLs total, +1 blog route). Prerendered HTML shell at `dist/blog/most-anticipated-movies-of-2026-worth-getting-excited-about/index.html` confirmed with correct title, OG tags, and BlogPosting JSON-LD schema. Commit: `f5a7bb0`.

### May 29, 2026
- **Fix /universe Connection Reset Error** — Resolved an issue where `/universe` and `/universe/` routes returned `ERR_CONNECTION_RESET` in production. Added `DirectorySlash Off` to `public/.htaccess` inside `<IfModule mod_dir.c>` to prevent Apache/LiteSpeed from trying to redirect `/universe` to `/universe/` while `.htaccess` trailing slash rule redirects `/universe/` back to `/universe` (which formed an infinite redirect loop). Build passed successfully with zero TypeScript errors, and sitemap/shells generated correctly.

### May 22, 2026
- **Enhanced Homepage Streaming Service Row** — Increased the size of circular logo buttons and typography in `src/components/StreamingServiceRow.tsx`. Centered the row on larger viewports where items fit, and introduced premium, dynamic glowing hover effects that transition using each service's official brand accent color.
- **Streaming Service Filter Chips Removed from Listing Pages** — Removed `StreamingFilter` component, import statements, and provider filter logic from `src/pages/Movies.tsx` and `src/pages/TvShows.tsx`. Homepage `StreamingServiceRow` and dedicated `/streaming/[slug]` pages remain fully operational. Cleaned up unused `src/components/StreamingFilter.tsx` component. Build passed successfully with zero TypeScript errors, and sitemap/shells generated correctly.
- **Blog Article #14 Published** — Added "Best TV Shows of All Time | The Only List You Actually Need" as the new top article in `src/data/blogArticles.ts`. Slug: `best-tv-shows-of-all-time-the-only-list-you-actually-need`. Covers Breaking Bad, The Wire, The Sopranos, Game of Thrones, Succession, The Bear, Severance, Chernobyl, Band of Brothers, and Black Mirror. OG/hero image: `https://image.tmdb.org/t/p/w1280/n5ihHcyzL8RWtPmKbvNRMyMzWXY.jpg` (Breaking Bad TMDB backdrop). Build passed with zero TypeScript errors. Sitemap updated (424 URLs total). Prerendered HTML shell at `dist/blog/best-tv-shows-of-all-time-the-only-list-you-actually-need/index.html` confirmed with correct title, OG tags, and BlogPosting JSON-LD schema. Commit: `923b04b`.

### May 21, 2026
- **`.htaccess` Infinite Rewrite Loop Fix** — Production was returning HTTP 500 on `/top-100`, `/universe`, `/movies`, `/tv-shows`, and other prerendered routes. Root cause: the SPA routing rewrite rule lacked a `!-f` filesystem guard and was missing `html` from its excluded-extension list. After rewriting `/top-100` → `/top-100/index.html`, LiteSpeed re-ran the ruleset; the new URI still passed all three conditions (not in extension list, no trailing slash, not exactly `/index.html`), triggering another rewrite → infinite loop → 500. Fix: added `RewriteCond %{REQUEST_FILENAME} !-f` and `!-d` guards before the prerender rule, added `html` to excluded extensions, added an explicit rule to serve real directories via their `index.html`, and added a `!-f` guard on the final SPA fallback. All security headers (HSTS, CSP, X-Frame-Options, etc.), bad-bot blocking, LiteSpeed cache directive, and Alt-Svc suppression remain untouched. Commit: `04f28fb`.

### April 3, 2026
- **EmailJS Contact Form Fix** — Added `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` to Hostinger environment variables. Previously only in GitHub Secrets, which doesn't reach production because Hostinger does its own build.
- **Battle Vote Image Flicker Fix** — Fixed homepage battle section where movie poster images would disappear for a few seconds after voting. Root cause: `handleBattleVote()` was replacing entire state with Firestore data (which doesn't store TMDB poster paths). Fix: use the `setState(prev => ...)` callback to preserve existing poster data while updating vote counts.

### April 2, 2026
- **Contact Form EmailJS Migration** — Migrated EmailJS configuration from hardcoded values to environment variables (`import.meta.env.VITE_EMAILJS_*`)
- **Top 100 Movies Loading Fix**

### April 1, 2026
- **Blog Hero Image Fixes** — Fixed broken hero images for last 3 blog articles, resolved duplicate thumbnail issues

### March 31, 2026
- **SEO Enhancement** — Comprehensive SEO improvements across all pages

### March 30, 2026
- **Rotten Tomatoes Integration** — Added OMDb API integration for RT scores on MovieDetail and TVShowDetail pages
- **Filter Persistence** — Movies and TV Shows pages now persist filter states (year, genre, sort) in URL, so navigating back restores context

### March 26–30, 2026
- **Performance Optimization** — Skeleton loading for image grids, hero image optimization, server-side caching
- **Blog Enhancements** — Updated publishing dates, fixed bullet rendering, added author bylines, keyword-rich alt text

---

## 🛡️ Security Rules

### Environment Variables
- **NEVER** hardcode any API key, secret, or credential in code
- **NEVER** log or expose env variable values
- Access only through `import.meta.env.VARIABLE_NAME`
- `.env` is gitignored — never remove from `.gitignore`

### Firestore Rules
- `system` collection: read by everyone, write by authenticated users
- `users` collection: nested ratings/watchlist, user-scoped access
- `battles` collection: secure vote increment with nested votes
- `top100votes` collection: nested votes
- **Never weaken** these rules

### User Content
- All user-generated content passes through `src/lib/sanitize.ts` before rendering

---

## ✅ Pre-Push Checklist

1. `npm run build` passes locally
2. Zero TypeScript errors
3. Zero build errors
4. No existing features broken
5. No API keys/secrets in the diff
6. Push to `main` branch → Hostinger auto-deploys

---

## 📝 Notes for New Sessions

- The site targets **90+ Lighthouse mobile score**
- Image sizes: `w500` for posters, `w1280` for backdrops (TMDB)
- React Query `staleTime` must be set appropriately — never fetch unnecessarily
- `React.lazy` + `Suspense` for heavy modal components
- No `console.log` in production code
- No `any` types or `ts-ignore` unless unavoidable and explained
- All pages must have `react-helmet-async` with title, description, canonical, OG tags, Twitter Card, and JSON-LD where applicable
