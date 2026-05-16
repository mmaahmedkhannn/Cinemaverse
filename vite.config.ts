/**
 * vite.config.ts
 *
 * Vite build configuration for CinemaDiscovery. Key decisions:
 * - Terser minification with console.log stripping in production
 * - Manual chunk splitting (vendor, framer-motion, firebase, axios) to improve
 *   initial page load by keeping the main bundle small
 * - TailwindCSS v4 via the official @tailwindcss/vite plugin
 * - Source maps disabled in production for security and bundle size
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {},
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: ['log', 'info', 'debug'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          framer: ['framer-motion'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          tmdb: ['axios']
        }
      }
    }
  }
})
