import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Film, Tv, User as UserIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tmdbApi, getImageUrl } from '../../services/tmdb';
import { generateSlug } from '../../utils/slugify';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setDebouncedQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => tmdbApi.searchMulti(debouncedQuery),
    enabled: debouncedQuery.length > 1,
  });

  const handleResultClick = (mediaType: string, id: number, nameTitle: string) => {
    onClose();
    if (mediaType === 'movie') {
      navigate(`/movie/${id}/${generateSlug(nameTitle)}`);
    } else if (mediaType === 'tv') {
      // For now, TV detail might not exist, but we still navigate if it does
      navigate(`/tv/${id}/${generateSlug(nameTitle)}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background-dark/95 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-6 py-4 border-b border-white/10 bg-[#080810]">
              <Search className="w-6 h-6 text-gray-400 mr-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, TV shows, people..."
                className="flex-grow bg-transparent text-xl text-white focus:outline-none font-sans"
              />
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
              {isLoading && debouncedQuery.length > 1 ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : results && results.length > 0 ? (
                <div className="space-y-2">
                  {results.slice(0, 10).map((result: any) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result.media_type, result.id, result.title || result.name)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <div className="w-12 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-800">
                        {result.poster_path || result.profile_path ? (
                          <img
                            src={getImageUrl(result.poster_path || result.profile_path, 'w500')}
                            alt={result.title || result.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            {result.media_type === 'movie' ? <Film className="w-5 h-5" /> : 
                             result.media_type === 'tv' ? <Tv className="w-5 h-5" /> : 
                             <UserIcon className="w-5 h-5" />}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <h4 className="text-white font-medium text-lg group-hover:text-primary transition-colors">
                          {result.title || result.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="capitalize">{result.media_type}</span>
                          {/* Optional: Add year or known_for string if helpful */}
                          <span className="text-gray-600">•</span>
                          {result.media_type === 'movie' ? (
                            <span>{result.release_date?.substring(0, 4) || 'Unknown'}</span>
                          ) : result.media_type === 'tv' ? (
                            <span>{result.first_air_date?.substring(0, 4) || 'Unknown'}</span>
                          ) : (
                            <span className="truncate max-w-[200px]">{result.known_for_department}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : debouncedQuery.length > 1 ? (
                <div className="text-center py-10 text-gray-400">
                  No results found for "{debouncedQuery}"
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Start typing to search the TMDB database...
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
