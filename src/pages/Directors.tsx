import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Star, Film, Award, TrendingUp, Camera } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { generateSlug } from '../utils/slugify';

const FEATURED_DIRECTORS = [
  { id: 525, name: 'Christopher Nolan', tags: ['Non-linear Storytelling', 'Practical Effects', 'Time'], style: 'Mind-bending narratives with IMAX grandeur' },
  { id: 138, name: 'Quentin Tarantino', tags: ['Dialogue-Driven', 'Non-linear', 'Revenge'], style: 'Sharp dialogue meets explosive violence' },
  { id: 488, name: 'Steven Spielberg', tags: ['Adventure', 'Emotion', 'Visual Wonder'], style: 'Master of wonder and blockbuster spectacle' },
  { id: 1032, name: 'Martin Scorsese', tags: ['Crime', 'Character Study', 'New York'], style: 'Gritty character studies of morality' },
  { id: 137427, name: 'Denis Villeneuve', tags: ['Sci-Fi', 'Visual Poetry', 'Atmosphere'], style: 'Atmospheric sci-fi with stunning imagery' },
  { id: 7467, name: 'David Fincher', tags: ['Thriller', 'Dark', 'Meticulous'], style: 'Dark thrillers with obsessive precision' },
  { id: 578, name: 'Ridley Scott', tags: ['Epic', 'Sci-Fi', 'Historical'], style: 'Epic scope across sci-fi and history' },
  { id: 2710, name: 'James Cameron', tags: ['Spectacle', 'Technology', 'Box Office'], style: 'Technological pioneer of cinema' },
  { id: 240, name: 'Stanley Kubrick', tags: ['Perfectionism', 'Symmetry', 'Psychology'], style: 'Perfectionist visions of human darkness' },
  { id: 2636, name: 'Alfred Hitchcock', tags: ['Suspense', 'Voyeurism', 'Thriller'], style: 'The master of suspense' },
  { id: 1776, name: 'Francis Ford Coppola', tags: ['Family', 'Power', 'American Dream'], style: 'Grand American epics of power' },
  { id: 5655, name: 'Wes Anderson', tags: ['Symmetry', 'Whimsy', 'Color Palette'], style: 'Whimsical compositions and deadpan humor' },
];

const Directors = () => {
  const [filter, setFilter] = useState('all');

  // Fetch details for featured directors
  const { data: directorsData } = useQuery({
    queryKey: ['directors-featured'],
    queryFn: async () => {
      const results = await Promise.all(
        FEATURED_DIRECTORS.map(async (d) => {
          try {
            const data = await tmdbApi.getPersonDetails(d.id);
            return { ...d, data };
          } catch {
            return { ...d, data: null };
          }
        })
      );
      return results;
    },
    staleTime: 1000 * 60 * 30,
  });

  const directors = directorsData || FEATURED_DIRECTORS.map(d => ({ ...d, data: null }));

  // Compute avg rating for ranking
  const ranked = [...directors]
    .map(d => {
      const credits = d.data?.movie_credits?.crew?.filter((c: any) => c.job === 'Director' && c.vote_count > 50) || [];
      const avg = credits.length > 0
        ? credits.reduce((s: number, c: any) => s + (c.vote_average || 0), 0) / credits.length
        : 0;
      return { ...d, avgRating: Math.round(avg * 10) / 10, filmCount: credits.length };
    })
    .sort((a, b) => b.avgRating - a.avgRating);

  // "Director of the Month" — pick highest trending
  const directorOfMonth = ranked[0];

  const GENRE_TAGS = ['all', 'Sci-Fi', 'Thriller', 'Epic', 'Crime', 'Adventure', 'Suspense'];

  const filtered = filter === 'all'
    ? ranked
    : ranked.filter(d => d.tags.some(t => t.toLowerCase().includes(filter.toLowerCase())));

  return (
    <div className="min-h-screen bg-background-dark pt-20 pb-20">
      <Helmet>
        <title>Director Universe — CinemaDiscovery</title>
        <meta name="description" content="Explore the visionaries who shaped cinema. Their styles, their masterpieces, their legacy." />
        <link rel="canonical" href="https://cinemadiscovery.com/directors" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-bebas text-6xl md:text-8xl text-white tracking-wider mb-4">
            Director <span className="text-primary">Universe</span>
          </h1>
          <p className="text-gray-400 text-lg font-sans max-w-2xl mx-auto">
            Explore the visionaries who shaped cinema. Their styles, their masterpieces, their legacy.
          </p>
        </motion.div>

        {/* Director of the Month */}
        {directorOfMonth && directorOfMonth.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-gradient-to-r from-yellow-900/20 via-amber-900/10 to-transparent border border-yellow-500/20 rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bebas tracking-wider text-lg">DIRECTOR SPOTLIGHT</span>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                {directorOfMonth.data.profile_path ? (
                  <img src={getImageUrl(directorOfMonth.data.profile_path)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500"><Camera className="w-8 h-8" /></div>
                )}
              </div>
              <div className="text-center md:text-left flex-grow">
                <Link to={`/director/${directorOfMonth.id}/${generateSlug(directorOfMonth.name)}`} className="font-bebas text-3xl text-white hover:text-primary transition-colors">
                  {directorOfMonth.name}
                </Link>
                <p className="text-gray-400 font-sans text-sm mt-1">{directorOfMonth.style}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  {directorOfMonth.tags.map(t => (
                    <span key={t} className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/20">{t}</span>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bebas text-yellow-400">{directorOfMonth.avgRating}</p>
                <p className="text-xs text-gray-500">Avg CV Score</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Genre Filters */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {GENRE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm font-sans capitalize transition-all ${
                filter === tag ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Directors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((director, i) => (
            <motion.div
              key={director.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/director/${director.id}/${generateSlug(director.name)}`}>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 group">
                  {/* Director Photo + Backdrop */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900">
                    {director.data?.movie_credits?.crew?.[0]?.backdrop_path && (
                      <img
                        src={getImageUrl(director.data.movie_credits.crew[0].backdrop_path, 'w1280')}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-end gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 flex-shrink-0">
                        {director.data?.profile_path ? (
                          <img src={getImageUrl(director.data.profile_path)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500"><Camera className="w-6 h-6" /></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bebas text-xl text-white group-hover:text-primary transition-colors">{director.name}</h3>
                        <p className="text-xs text-gray-400 font-sans">{director.style}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {director.tags.map(t => (
                        <span key={t} className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-300">
                        <Film className="w-4 h-4" />
                        <span className="font-sans">{director.filmCount} films</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-sans font-bold text-white">{director.avgRating}</span>
                        <span className="text-gray-500 text-xs">avg</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-300">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-sans">#{i + 1}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Directors;
