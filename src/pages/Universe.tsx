import { useState, useMemo, useRef } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, PlayCircle, Star, Shuffle, Tv, Film, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { Link } from 'react-router-dom';
import { FRANCHISES } from '../data/franchises';
import { useAuth } from '../contexts/AuthContext';
import { getWatchlist } from '../lib/firestore';
import { Helmet } from 'react-helmet-async';

const Universe = () => {
  const [selectedFranchiseId, setSelectedFranchiseId] = useState(FRANCHISES[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };
  const [sortParam, setSortParam] = useState<'release' | 'chronological'>('chronological');
  const { currentUser } = useAuth();

  const selectedFranchise = FRANCHISES.find(f => f.id === selectedFranchiseId)!;

  // Fetch Watchlist for progress tracking
  const { data: watchlist } = useQuery({
    queryKey: ['watchlist', currentUser?.uid],
    queryFn: () => currentUser ? getWatchlist(currentUser.uid) : Promise.resolve([]),
    enabled: !!currentUser,
  });
  
  const watchlistSet = useMemo(() => new Set(watchlist?.map(w => w.movieId)), [watchlist]);

  // We fetch each entry individually because they are manually curated for exact sequences
  const mediaQueries = useQueries({
    queries: selectedFranchise.entries.map((entry) => ({
      queryKey: [entry.mediaType === 'tv' ? 'tv' : 'movie', entry.id],
      queryFn: () => entry.mediaType === 'tv' ? tmdbApi.getTvDetails(entry.id) : tmdbApi.getMovieDetails(entry.id),
      staleTime: 1000 * 60 * 60, // 1 hour
    }))
  });

  const isLoading = mediaQueries.some(q => q.isLoading);

  // Combine fetched TMDB data with our custom Phase/Order data
  const combinedMedia = useMemo(() => {
    if (isLoading) return [];
    
    const results = selectedFranchise.entries.map((fEntry, index) => {
      const tmdbData = mediaQueries[index].data;
      if (!tmdbData) return null;
      
      // Normalize TV vs Movie dates and titles
      const releaseDate = fEntry.mediaType === 'tv' ? tmdbData.first_air_date : tmdbData.release_date;
      const title = fEntry.title || (fEntry.mediaType === 'tv' ? tmdbData.name : tmdbData.title);
      
      // Estimate runtime for TV: runtime array [0] * chapters, or just take first episode runtime if present
      let runtime = 0;
      if (fEntry.mediaType === 'tv') {
         runtime = (tmdbData.episode_run_time?.[0] || 45) * (tmdbData.number_of_episodes || 1);
      } else {
         runtime = tmdbData.runtime || 0;
      }

      return {
        ...tmdbData,
        ...fEntry, // injects phase string, mediaType
        normalizedTitle: title,
        normalizedDate: releaseDate,
        normalizedRuntime: runtime,
        originalIndex: index // holds our curated chronological sort
      };
    }).filter(m => m !== null); // strip failures

    if (sortParam === 'release') {
       return [...results].sort((a, b) => {
         const dateA = new Date(a.normalizedDate || 0).getTime();
         const dateB = new Date(b.normalizedDate || 0).getTime();
         return dateA - dateB;
       });
    }
    
    // Sort chronological relies on the original array order
    return [...results].sort((a, b) => a.originalIndex - b.originalIndex);

  }, [selectedFranchise, mediaQueries, isLoading, sortParam]);

  // Group by Phase
  const groupedMedia = useMemo(() => {
    if (sortParam === 'release') {
       return { 'Release Order': combinedMedia }; // flat
    }
    
    const groups: Record<string, any[]> = {};
    let currentGroup = 'Main Sequence';
    
    combinedMedia.forEach(media => {
       if (media.phase) currentGroup = media.phase;
       if (!groups[currentGroup]) groups[currentGroup] = [];
       groups[currentGroup].push(media);
    });
    
    return groups;
  }, [combinedMedia, sortParam]);

  // Aggregate Stats
  const totalRuntimeMins = combinedMedia.reduce((acc, media) => acc + media.normalizedRuntime, 0);
  const totalRuntimeHours = Math.floor(totalRuntimeMins / 60);
  const totalMedia = combinedMedia.length;

  // Use the first valid backdrop from the franchise as the Hero Image
  const heroBackdrop = combinedMedia.find(m => m.backdrop_path)?.backdrop_path;

  return (
    <main className="min-h-screen bg-background-dark pb-20">
      <Helmet>
        <title>Cinematic Universes & Timelines — CinemaDiscovery</title>
        <meta name="description" content="Explore cinematic universes in perfect watch order. Track your progress across Marvel, DC, Star Wars, and more." />
        <link rel="canonical" href="https://cinemadiscovery.com/universe" />
        <meta property="og:title" content="Cinematic Universes & Timelines — CinemaDiscovery" />
        <meta property="og:description" content="Explore cinematic universes in perfect watch order. Track your progress across Marvel, DC, Star Wars, and more." />
        <meta property="og:url" content="https://cinemadiscovery.com/universe" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      {/* Edge-to-Edge Hero Section */}
      <div className="relative w-full min-h-[60vh] md:min-h-[70vh] flex flex-col justify-end -mt-20 z-0">
         {/* Dynamic Backdrop */}
         {heroBackdrop && (
           <div className="absolute inset-0 z-0">
             <img 
               src={getImageUrl(heroBackdrop, 'w1280')} 
               alt={selectedFranchise.name} 
               loading="eager"
               fetchPriority="high"
               decoding="async"
               className="w-full h-full object-cover opacity-60"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
             <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/60 to-transparent"></div>
           </div>
         )}
         
         <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-32 flex flex-col md:flex-row gap-8 justify-between items-end">
           <div className="w-full md:w-2/3">
             <h2 className="text-5xl md:text-7xl lg:text-8xl font-bebas text-white mb-4 tracking-wide drop-shadow-2xl">
               {selectedFranchise.name}
             </h2>
             <p className="text-gray-300 font-sans text-lg md:text-xl max-w-3xl text-shadow-sm mb-8 leading-relaxed">
               {selectedFranchise.description}
             </p>

              {/* Franchise Selector Tabs integrated in Hero */}
              <div className="relative flex items-center mb-4 max-w-full">
                
                {/* Scroll Left Button */}
                <button 
                  onClick={scrollLeft}
                  className="absolute left-0 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/80 backdrop-blur-xl rounded-full border border-white/20 text-white hover:text-primary hover:border-primary hover:shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.9)] hover:scale-110 -ml-2 lg:-ml-5"
                >
                   <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 -ml-1" />
                </button>
                
                {/* Scrollable Container with Edge Masks */}
                <div 
                  ref={scrollRef}
                  className="flex overflow-x-auto gap-3 no-scrollbar px-10 md:px-12 w-full snap-x scroll-smooth py-2"
                  style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
                >
                  {FRANCHISES.map(franchise => (
                    <button
                      key={franchise.id}
                      onClick={() => setSelectedFranchiseId(franchise.id)}
                      className={`snap-start whitespace-nowrap px-8 py-3.5 rounded-full font-sans font-bold text-base md:text-lg transition-all duration-300 flex-shrink-0 border backdrop-blur-md ${
                        selectedFranchiseId === franchise.id
                          ? 'bg-primary/90 text-white shadow-[0_0_25px_rgba(229,9,20,0.7)] border-primary scale-105'
                          : 'bg-black/40 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/40 hover:scale-105'
                      }`}
                    >
                      {franchise.name}
                    </button>
                  ))}
                </div>

                {/* Scroll Right Button */}
                <button 
                  onClick={scrollRight}
                  className="absolute right-0 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/80 backdrop-blur-xl rounded-full border border-white/20 text-white hover:text-primary hover:border-primary hover:shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.9)] hover:scale-110 -mr-2 lg:-mr-5"
                >
                   <ChevronRight className="w-6 h-6 md:w-7 md:h-7 -mr-1" />
                </button>
              </div>
           </div>

           {/* Stats & Controls */}
           <div className="flex flex-col items-end gap-6 w-full md:w-auto shrink-0">
             <div className="flex gap-4 md:gap-8 bg-black/60 backdrop-blur-xl px-8 py-5 rounded-3xl border border-white/10 shadow-2xl">
               <div className="text-center">
                 <div className="text-4xl font-bebas text-white drop-shadow-lg">{totalMedia}</div>
                 <div className="text-xs font-sans text-gray-400 uppercase tracking-widest leading-none mt-1">Titles</div>
               </div>
               <div className="w-px bg-white/20"></div>
               <div className="text-center">
                 <div className="text-4xl font-bebas text-white drop-shadow-lg">{totalRuntimeHours}</div>
                 <div className="text-xs font-sans text-gray-400 uppercase tracking-widest leading-none mt-1">Hours</div>
               </div>
             </div>

             {/* Sorting Toggle */}
             <div className="bg-black/60 backdrop-blur-xl p-1.5 rounded-full border border-white/10 flex items-center w-full md:w-auto shadow-2xl">
               <button 
                 onClick={() => setSortParam('chronological')}
                 className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-2.5 rounded-full text-sm font-sans font-bold transition-colors ${
                   sortParam === 'chronological' ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'text-gray-400 hover:text-white'
                 }`}
               >
                 <Clock className="w-4 h-4" /> Timeline
               </button>
               <button 
                 onClick={() => setSortParam('release')}
                 className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-2.5 rounded-full text-sm font-sans font-bold transition-colors ${
                   sortParam === 'release' ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'text-gray-400 hover:text-white'
                 }`}
               >
                 <Shuffle className="w-4 h-4" /> Release
               </button>
             </div>
           </div>
         </div>
      </div>

      {/* Main Container for Poster Grid */}
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-8">

        {isLoading ? (
          <div className="flex justify-center p-20">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-16 md:gap-24">
            {Object.entries(groupedMedia).map(([groupName, mediaInGroup]) => (
              <div key={groupName} className="relative">
                
                {/* Immersive Group Header */}
                {Object.keys(groupedMedia).length > 1 && (
                   <div className="sticky top-16 z-30 bg-background-dark/95 backdrop-blur-xl border-y border-white/5 py-4 px-2 -mx-2 mb-8 flex items-center gap-6 shadow-xl shadow-black/50">
                      <h3 className="text-3xl md:text-4xl font-bebas text-white tracking-widest uppercase drop-shadow-md">
                        {groupName}
                      </h3>
                      <div className="flex-grow h-px bg-gradient-to-r from-primary/60 via-primary/10 to-transparent"></div>
                   </div>
                )}

                {/* Poster Grid Engine */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
                  {mediaInGroup.map((media, index) => {
                    const globalIndex = combinedMedia.findIndex(m => m.id === media.id) + 1;
                    const routePrefix = media.mediaType === 'tv' ? 'tv' : 'movie';
                    const isWatched = watchlistSet.has(media.id);
                    
                    return (
                    <motion.div
                      key={media.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative group ${isWatched ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : ''} transition-all duration-500`}
                    >
                      <Link to={`/${routePrefix}/${media.id}`} className="block h-full relative cursor-pointer outline-none ring-offset-background-dark focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
                        
                        {/* Poster Container */}
                        <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden bg-[#111] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative transform transition-transform duration-500 group-hover:scale-[1.03] group-hover:border-white/30 group-hover:shadow-[0_0_30px_rgba(229,9,20,0.3)]">
                          
                          {/* Chronological Tracking Orb */}
                          <div className="absolute -top-1 -left-1 w-10 h-10 md:w-12 md:h-12 bg-background-dark/90 backdrop-blur-md rounded-br-2xl border-b border-r border-white/10 z-20 flex items-center justify-center shadow-lg">
                            <span className="font-bebas text-xl md:text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                              #{globalIndex}
                            </span>
                          </div>

                          {/* Media Type Badge */}
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md z-20 border border-white/10 group-hover:bg-primary/80 transition-colors">
                            {media.mediaType === 'tv' ? <Tv className="w-4 h-4 text-white"/> : <Film className="w-4 h-4 text-white"/>}
                          </div>

                          {/* Image */}
                          {media.poster_path ? (
                             <img
                               src={getImageUrl(media.poster_path, 'w500')}
                               alt={media.normalizedTitle}
                               loading="lazy"
                               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                             />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center p-4">
                                <span className="text-gray-500 text-center font-sans text-sm">{media.normalizedTitle || 'Unknown'}</span>
                             </div>
                          )}
                          
                          {/* Deep Overlay on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <PlayCircle className="w-12 h-12 text-white mx-auto mb-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300" />
                          </div>

                          {/* Watched Stamp */}
                          {isWatched && (
                            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm border-2 border-green-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Title Under Poster */}
                        <div className="mt-3 px-1">
                          <h4 className="text-white font-sans font-bold text-sm md:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {media.normalizedTitle}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-sans">
                            <span>{media.normalizedDate ? media.normalizedDate.substring(0, 4) : 'TBA'}</span>
                            {media.vote_average > 0 && (
                              <span className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-3 h-3 fill-yellow-500" /> {media.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                      </Link>
                    </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
};

export default Universe;
