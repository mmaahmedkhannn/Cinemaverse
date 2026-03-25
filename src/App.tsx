import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { EmailVerificationGuard } from './components/auth/EmailVerificationGuard';

const Home = lazy(() => import('./pages/Home'));
const Movies = lazy(() => import('./pages/Movies'));
const TvShows = lazy(() => import('./pages/TvShows'));
const Universe = lazy(() => import('./pages/Universe'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const TvShowDetail = lazy(() => import('./pages/TvShowDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Directors = lazy(() => import('./pages/Directors'));
const DirectorDetail = lazy(() => import('./pages/DirectorDetail'));
const Battles = lazy(() => import('./pages/Battles'));
const Wrapped = lazy(() => import('./pages/Wrapped'));
const Top100 = lazy(() => import('./pages/Top100'));
const Auth = lazy(() => import('./pages/Auth'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background-dark text-white font-sans flex flex-col">
            <Navbar />
          <main className="flex-grow">
            <EmailVerificationGuard>
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/tv" element={<TvShows />} />
                  <Route path="/universe" element={<Universe />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  <Route path="/movie/:id/:slug" element={<MovieDetail />} />
                  <Route path="/tv/:id" element={<TvShowDetail />} />
                  <Route path="/tv/:id/:slug" element={<TvShowDetail />} />
                  <Route path="/timeline" element={<Timeline />} />
                  <Route path="/directors" element={<Directors />} />
                  <Route path="/director/:id" element={<DirectorDetail />} />
                  <Route path="/director/:id/:slug" element={<DirectorDetail />} />
                  <Route path="/battles" element={<Battles />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/wrapped" element={<Wrapped />} />
                  </Route>
                  <Route path="/top100" element={<Top100 />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                </Routes>
              </Suspense>
            </EmailVerificationGuard>
          </main>
          <Footer />
        </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
