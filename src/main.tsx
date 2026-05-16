/**
 * main.tsx
 *
 * Application entry point. Bootstraps React and handles SEO context via HelmetProvider.
 * Implements a hybrid rendering strategy: hydrates pre-rendered static HTML if present,
 * or falls back to standard client-side rendering (createRoot) if not.
 */
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HelmetProvider } from 'react-helmet-async'

const rootElement = document.getElementById('root')!;
const app = (
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);

// Hydration fallback: If prerender.js generated static HTML (hasChildNodes), hydrate it
// to preserve SEO and avoid flashing. Otherwise, fall back to standard SPA rendering.
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
