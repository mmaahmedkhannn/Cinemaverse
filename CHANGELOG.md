# Changelog

All notable changes to CinemaDiscovery will be documented in this file.

## [Unreleased]

## [2026-05-16] - Mobile UX & SEO Overhaul

### Added
- Pre-rendering at build time for all static and franchise routes (108 pages)
- Mobile UX overhaul: 14 fixes covering iOS input zoom, dynamic viewport height, touch targets, scroll snap, typography
- Amazon Associates affiliate button on every movie/TV detail page
- Trailing-slash 301 redirect for SPA routing
- Complete MCU, DC, Star Wars, Wizarding World franchise data (+32 entries)
- YouTube CSP allowlist for trailer modal
- Full security overhaul: A-grade headers (HSTS, CSP, X-Frame-Options, etc.)
- Hardened Firestore rules with helper functions

### Fixed
- 403 errors on URLs with trailing slashes
- MCU timeline mapping (Iron Man was pointing to Avatar's TMDB ID)
- Trailer modal close button escaping viewport on mobile
- Authentication page logo duplication and missing background on mobile

### Changed
- Migrated rendering to hydration model (`hydrateRoot` with `createRoot` fallback)
- Tightened mobile grid density and spacing
- Reduced static page vertical padding on mobile
