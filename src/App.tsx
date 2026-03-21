import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TvShows from './pages/TvShows';
import Universe from './pages/Universe';
import MovieDetail from './pages/MovieDetail';
import TvShowDetail from './pages/TvShowDetail';
import Profile from './pages/Profile';
import Timeline from './pages/Timeline';
import Directors from './pages/Directors';
import DirectorDetail from './pages/DirectorDetail';
import Battles from './pages/Battles';
import Wrapped from './pages/Wrapped';
import Top100 from './pages/Top100';
import Auth from './pages/Auth';
import Contact from './pages/Contact';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import VerifyEmail from './pages/VerifyEmail';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { EmailVerificationGuard } from './components/auth/EmailVerificationGuard';

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
              </Routes>
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
