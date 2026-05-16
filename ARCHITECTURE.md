# Architecture Overview

This document outlines the codebase structure and architectural decisions for CinemaDiscovery.

## Directory Structure

```text
src/
├── assets/       # Static assets (images, icons)
├── components/   # Reusable UI components
├── contexts/     # React context providers
├── data/         # Static data files
├── hooks/        # Custom React hooks
├── lib/          # Third-party service integrations
├── pages/        # Page-level components mapped to routes
├── services/     # Business logic & API service layer
├── store/        # State management
└── utils/        # Utility functions
```

## Core Directories

### `src/assets/`
Contains static assets such as images and icons used throughout the application.
- **Key files:** Custom graphical elements or SVGs used globally.
- **Connections:** Imported directly into components and pages as needed.

### `src/components/`
Houses reusable React components, logically subdivided into layout components (e.g., Navbar, Footer) and UI components (e.g., Buttons, Modals, specialized widgets).
- **Key files:** `layout/Navbar.tsx`, `layout/Footer.tsx`, `ui/AmazonAffiliateButton.tsx`, `SEO.tsx`
- **Connections:** These are the building blocks used by pages (`src/pages/`) to assemble the UI.

### `src/contexts/`
Contains React context providers used to pass state implicitly through the component tree without prop drilling.
- **Connections:** Typically wrap the application in `src/App.tsx` or `src/main.tsx` and are consumed by hooks or components.

### `src/data/`
Holds static data configuration files. This acts as a pseudo-database for content that doesn't need to live in Firestore, enabling fast read times and easy source control.
- **Key files:** `blogArticles.ts` (blog content), `franchises.ts` (franchise definitions and mappings).
- **Connections:** Used by pages to render list views and dynamic routes (like blog details or franchise timelines).

### `src/hooks/`
Custom React hooks that abstract complex component logic, stateful behaviors, or API data fetching patterns.
- **Key files:** `useRottenTomatoes.ts`
- **Connections:** Consumed directly inside components and pages to keep their logic clean.

### `src/lib/`
Configuration and initialization files for external third-party services and libraries.
- **Key files:** `firebase.ts` (Firebase auth/DB init), `emailjs.ts` (Email service), `firestore.ts` (Firestore helpers), `sanitize.ts` (Input sanitization).
- **Connections:** Imported by services or components to interact with external APIs securely.

### `src/pages/`
High-level React components that correspond to specific application routes.
- **Key files:** `Home.tsx`, `MovieDetail.tsx`, `TvShowDetail.tsx`, `Universe.tsx`
- **Connections:** Defined as routes in `src/App.tsx`. They compose elements from `src/components/` and fetch data using `src/services/` or `src/hooks/`.

### `src/services/`
The business logic and data fetching layer. Abstracts API calls from the UI components.
- **Key files:** `api.ts` (Generic API handlers), `tmdb.ts` (TMDB specific requests), `battleService.ts` (Logic for handling user voting battles).
- **Connections:** Called by pages and hooks to retrieve or mutate data.

### `src/store/`
Global state management setup, handling states that span across multiple disconnected components.
- **Connections:** Accessed via custom hooks within any component needing global state.

### `src/utils/`
Pure, stateless utility functions for data transformation, formatting, and general helper tasks.
- **Key files:** `slugify.ts` (Converts strings to URL-friendly slugs).
- **Connections:** Used broadly across components, services, and hooks.

## Key Root Files

- **`src/App.tsx`**: Defines application routing (React Router), layout structure, and global context providers.
- **`src/main.tsx`**: The React entry point. Responsible for rendering the app to the DOM, handling hydration (`hydrateRoot`) with a fallback (`createRoot`).
- **`vite.config.ts`**: The Vite build configuration file, defining build settings, chunking strategy, and plugins.
- **`public/.htaccess`**: Hostinger Apache server configuration. Handles security headers, trailing slash redirects, caching policies, and SPA routing logic.
- **`firestore.rules`**: Security rules for the Firebase Firestore database, determining who can read or write data.
- **`scripts/generate-sitemap.js`**: Node.js script run post-build to dynamically generate an XML sitemap based on static data and routes.
- **`scripts/prerender.js`**: Puppeteer-based script that spins up a headless browser to generate static HTML files for SEO indexing.

## Rendering Strategy

CinemaDiscovery employs a hybrid rendering model. While fundamentally a Single Page Application (SPA), it utilizes a Puppeteer-based static pre-rendering script (`scripts/prerender.js`) at build time. This script generates static HTML files for all defined routes (including dynamic ones like blog posts and franchise pages). These pre-rendered files are served to search engine crawlers (managed via `.htaccess`) to ensure maximum SEO indexability. On the client side, React takes over using `hydrateRoot` in `src/main.tsx` (falling back to `createRoot` if hydration fails or pre-rendered HTML is missing), delivering a seamless SPA experience after the initial page load.
