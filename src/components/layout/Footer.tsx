import { Link, useLocation } from 'react-router-dom';
import { Mail } from 'lucide-react';


const Footer = () => {
  const location = useLocation();
  if (location.pathname === '/auth') return null;

  return (
    <footer className="bg-background-dark border-t border-gray-800 mt-auto">

      <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <Link to="/" className="font-bebas text-3xl text-primary tracking-wider">
              CinemaDiscovery
            </Link>
            <p className="text-gray-400 mt-2 font-sans text-sm">
              Discover movies in cinematic luxury.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-4 items-center text-sm text-gray-400">
            <Link to="/about" className="hover:text-secondary transition-colors">About Us</Link>
            <Link to="/blog" className="hover:text-secondary transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-secondary transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
            <a href="mailto:support@cinemadiscovery.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4 text-primary" />
              support@cinemadiscovery.com
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} CinemaDiscovery. All rights reserved.
        </div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
