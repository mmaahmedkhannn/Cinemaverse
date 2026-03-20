import { useState, useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, PlayCircle, Star, Shuffle, Tv, Film, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { Link } from 'react-router-dom';
import { FRANCHISES } from '../data/franchises';
import { useAuth } from '../contexts/AuthContext';
import { getWatchlist } from '../lib/firestore';

import { useRef } from 'react';

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
  const watchedCount = combinedMedia.filter(m => watchlistSet.has(m.id)).length;
  const progressPercent = totalMedia > 0 ? (watchedCount / totalMedia) * 100 : 0;

  // Use the first valid backdrop from the franchise as the Hero Image
  const heroBackdrop = combinedMedia.find(m => m.backdrop_path)?.backdrop_path;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* Franchise Selector Tabs */}
      {/* Franchise Selector Tabs */}
      <div className="relative flex items-center mb-8">
        <button 
          onClick={scrollLeft}
          className="absolute left-0 z-10 h-full px-4 bg-gradient-to-r from-background-dark via-background-dark/90 to-transparent text-white hover:text-primary transition-colors flex items-center justify-center"
        >
           <ChevronLeft className="w-12 h-12 drop-shadow-lg" />
        </button>
        
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 no-scrollbar px-16 w-full snap-x scroll-smooth"
        >
          {FRANCHISES.map(franchise => (
            <button
              key={franchise.id}
              onClick={() => {
                setSelectedFranchiseId(franchise.id);
              }}
              className={`snap-start whitespace-nowrap px-6 py-3 rounded-full font-sans font-bold text-sm transition-all duration-300 flex-shrink-0 border ${
                selectedFranchiseId === franchise.id
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.5)] border-primary'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {franchise.name}
            </button>
          ))}
        </div>

        <button 
          onClick={scrollRight}
          className="absolute right-0 z-10 h-full px-4 bg-gradient-to-l from-background-dark via-background-dark/90 to-transparent text-white hover:text-primary transition-colors flex items-center justify-center"
        >
           <ChevronRight className="w-12 h-12 drop-shadow-lg" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative bg-[#0f0f16] border border-white/10 rounded-3xl overflow-hidden mb-12 min-h-[300px] flex flex-col justify-end">
         {/* Dynamic Backdrop */}
         {heroBackdrop && (
           <div className="absolute inset-0 z-0">
             <img 
               src={getImageUrl(heroBackdrop, 'original')} 
               alt={selectedFranchise.name} 
               className="w-full h-full object-cover opacity-40 blur-[2px]"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f16] via-[#0f0f16]/80 to-transparent"></div>
           </div>
         )}
         
         <div className="relative z-10 p-6 md:p-10 w-full flex flex-col md:flex-row gap-8 justify-between items-end">
           <div className="w-full md:w-1/2">
             <h2 className="text-4xl md:text-6xl font-bebas text-white mb-3 tracking-wide drop-shadow-lg">
               {selectedFranchise.name}
             </h2>
             <p className="text-gray-300 font-sans text-lg max-w-2xl text-shadow-sm mb-6">
               {selectedFranchise.description}
             </p>

             {/* Progress Bar (if logged in) */}
             {currentUser && totalMedia > 0 && (
               <div className="w-full max-w-md bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                 <div className="flex justify-between text-sm font-sans mb-2 font-bold">
                   <span className="text-gray-300 flex items-center gap-2">
                     <CheckCircle className="w-4 h-4 text-green-500" /> Universe Progress
                   </span>
                   <span className="text-white">{watchedCount} / {totalMedia} Watched</span>
                 </div>
                 <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progressPercent}%` }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="h-full bg-gradient-to-r from-primary to-red-400 rounded-full"
                   />
                 </div>
               </div>
             )}
           </div>

           {/* Stats & Controls */}
           <div className="flex flex-col items-end gap-6 w-full md:w-auto">
             <div className="flex gap-4 md:gap-8 bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
               <div className="text-center">
                 <div className="text-3xl font-bebas text-white">{totalMedia}</div>
                 <div className="text-xs font-sans text-gray-400 uppercase tracking-widest leading-none">Titles</div>
               </div>
               <div className="w-px bg-white/10"></div>
               <div className="text-center">
                 <div className="text-3xl font-bebas text-white">{totalRuntimeHours}</div>
                 <div className="text-xs font-sans text-gray-400 uppercase tracking-widest leading-none">Hours</div>
               </div>
             </div>

             {/* Sorting Toggle */}
             <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10 flex items-center w-full md:w-auto">
               <button 
                 onClick={() => setSortParam('chronological')}
                 className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-5 py-2.5 rounded-full text-sm font-sans font-bold transition-colors ${
                   sortParam === 'chronological' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                 }`}
               >
                 <Clock className="w-4 h-4" /> Timeline
               </button>
               <button 
                 onClick={() => setSortParam('release')}
                 className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-5 py-2.5 rounded-full text-sm font-sans font-bold transition-colors ${
                   sortParam === 'release' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                 }`}
               >
                 <Shuffle className="w-4 h-4" /> Release
               </button>
             </div>
           </div>
         </div>
      </div>

      {/* Media Timeline */}
      <div className="relative">

        {isLoading ? (
          <div className="flex justify-center p-20">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-14">
            {Object.entries(groupedMedia).map(([groupName, mediaInGroup], groupIndex) => (
              <div key={groupName} className="relative">
                
                {/* Visual Phase Separator */}
                {Object.keys(groupedMedia).length > 1 && (
                   <div className="flex items-center gap-4 mb-8 md:ml-2">
                      <div className="w-24 h-px bg-primary hidden md:block opacity-50"></div>
                      <h3 className="text-2xl font-bebas text-secondary tracking-widest uppercase drop-shadow-md">{groupName}</h3>
                      <div className="flex-grow h-px bg-gradient-to-r from-secondary/50 to-transparent"></div>
                   </div>
                )}

                <div className="flex flex-col gap-6">
                  {mediaInGroup.map((media, index) => {
                    const isFirstMedia = groupIndex === 0 && index === 0;
                    const routePrefix = media.mediaType === 'tv' ? 'tv' : 'movie';
                    const isWatched = watchlistSet.has(media.id);
                    
                    return (
                    <motion.div
                      key={media.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative transition-opacity ${isWatched ? 'opacity-60 hover:opacity-100' : 'opacity-100'}`}
                    >

                      <Link to={`/${routePrefix}/${media.id}`} className="block">
                        <div className={`border rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col sm:flex-row ${
                          isWatched ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-[#111] border-white/10 hover:border-white/30 hover:bg-[#16161f]'
                        }`}>
                          
                          {/* Poster */}
                          <div className="relative w-full sm:w-48 aspect-[2/3] sm:aspect-auto sm:h-[280px] flex-shrink-0 bg-black">
                            {media.poster_path ? (
                               <img
                                 src={getImageUrl(media.poster_path, 'w500')}
                                 alt={media.normalizedTitle}
                                 className={`w-full h-full object-cover transition-transform duration-500 ${isWatched ? 'grayscale-[30%]' : 'group-hover:scale-105'}`}
                               />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center p-4">
                                  <span className="text-gray-500 text-center font-sans text-sm">{media.normalizedTitle || 'Unknown'}</span>
                               </div>
                            )}
                            
                            {/* Type Badge */}
                            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded shadow border border-white/10 flex items-center gap-1">
                               {media.mediaType === 'tv' ? <Tv className="w-3 h-3 text-secondary"/> : <Film className="w-3 h-3 text-gray-300"/>}
                            </div>

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                               <PlayCircle className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" />
                            </div>
                          </div>

                          {/* Details */}
                          <div className="p-6 md:p-8 flex flex-col justify-center flex-grow">
                             <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h4 className="text-2xl font-bebas text-white group-hover:text-primary transition-colors">
                                  {media.normalizedTitle}
                                </h4>
                                {isFirstMedia && sortParam === 'chronological' && (
                                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded font-sans uppercase tracking-wider border border-green-500/30">
                                    Start Here
                                  </span>
                                )}
                                {isWatched && (
                                  <span className="bg-white/10 text-gray-400 text-xs font-bold px-2 py-1 rounded font-sans uppercase flex items-center gap-1 border border-white/10">
                                    <CheckCircle className="w-3 h-3" /> Watched
                                  </span>
                                )}
                             </div>
                             
                             <div className="flex items-center gap-4 text-sm font-sans text-gray-400 mb-4">
                                <span className="text-white font-medium">{media.normalizedDate ? media.normalizedDate.substring(0, 4) : 'TBA'}</span>
                                {media.normalizedRuntime > 0 && (
                                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {media.mediaType === 'tv' && 'Avg. '}{media.normalizedRuntime} min</span>
                                )}
                                {media.vote_average > 0 && (
                                  <span className="flex items-center gap-1.5 text-secondary"><Star className="w-3.5 h-3.5 fill-secondary" /> {media.vote_average.toFixed(1)}</span>
                                )}
                             </div>

                             <p className="text-gray-500 font-sans text-sm line-clamp-3 md:line-clamp-4 leading-relaxed mb-6">
                               {media.overview}
                             </p>

                             <div className="mt-auto">
                                <span className="inline-block text-xs font-bold text-white uppercase tracking-widest border-b border-primary pb-1 group-hover:border-white transition-colors">
                                   Explore {media.mediaType === 'tv' ? 'Series' : 'Movie'}
                                </span>
                             </div>
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

    </div>
  );
};

export default Universe;
