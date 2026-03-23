import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://image.tmdb.org https://www.google.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.themoviedb.org https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com; frame-src 'self' https://www.youtube.com https://cinemaverse-35811.firebaseapp.com;",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
    }
  },
  build: {
    sourcemap: false,
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
