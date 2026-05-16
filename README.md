# CinemaDiscovery

CinemaDiscovery is a comprehensive movie and TV discovery platform featuring editorial blog content, complete franchise timelines, and community polling features.

**Live URL:** [cinemadiscovery.com](https://cinemadiscovery.com)

## Tech Stack
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **Backend/Auth/DB:** Firebase
- **External APIs:** TMDB (The Movie Database), OMDb, Watchmode

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Movies Site"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env` and fill in the required keys.
   ```bash
   cp .env.example .env
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables
The application requires the following environment variables (see `.env.example` for details):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_TMDB_API_KEY`
- `VITE_TMDB_READ_TOKEN`
- `VITE_OMDB_API_KEY`
- `VITE_WATCHMODE_API_KEY`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

**Note:** Never commit actual API keys or secrets to the repository.

## Deploy Workflow Summary
Deployment is handled automatically via GitHub Actions and Hostinger auto-deploy. Pushing to the `main` branch triggers a build, and upon success, the static files are deployed. Post-deployment, ensure to flush the Hostinger CDN cache.

## Documentation
For more detailed information, please refer to the following documents:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Codebase structure and design patterns
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Common developer tasks and debugging scenarios
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment process and post-deploy checklist
