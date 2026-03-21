import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-background-dark border-t border-gray-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="font-bebas text-3xl text-primary tracking-wider">
              CinemaDiscovery
            </Link>
            <p className="text-gray-400 mt-2 font-sans text-sm">
              Discover movies in cinematic luxury.
            </p>
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link to="/about" className="hover:text-secondary transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-secondary transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} CinemaDiscovery. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
