import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Film, Calendar, ArrowLeft, Camera, Award, TrendingUp, Users } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../services/tmdb';

const DIRECTOR_META: Record<number, { tags: string[]; signature: string }> = {
  525: { tags: ['Non-linear Storytelling', 'Practical Effects', 'Time Manipulation', 'IMAX'], signature: 'Rotating hallway fight (Inception), Docking scene (Interstellar)' },
  138: { tags: ['Dialogue-Driven', 'Non-linear', 'Revenge', 'Pop Culture References'], signature: 'Mexican standoff, Trunk shot, Long tracking dialogues' },
  488: { tags: ['Adventure', 'Emotion', 'Visual Wonder', 'Coming-of-Age'], signature: 'Spielberg Face — characters staring in awe at off-screen wonder' },
  1032: { tags: ['Crime', 'Character Study', 'New York', 'Catholic Guilt'], signature: "Freeze frame endings, Rolling Stones soundtrack, De Niro/DiCaprio partnership" },
  137427: { tags: ['Sci-Fi', 'Visual Poetry', 'Atmosphere', 'Slow Burn'], signature: 'Vast silhouette shots, minimal dialogue, immense scale' },
  7467: { tags: ['Thriller', 'Dark', 'Meticulous', 'Obsession'], signature: 'Green-tinted color grading, methodical camera movements' },
  578: { tags: ['Epic', 'Sci-Fi', 'Historical', 'World-Building'], signature: 'Sweeping crane shots, rain-soaked atmosphere' },
  2710: { tags: ['Spectacle', 'Technology', 'Box Office King'], signature: 'Underwater sequences, pushing VFX boundaries' },
  240: { tags: ['Perfectionism', 'Symmetry', 'One-Point Perspective'], signature: 'The Kubrick Stare — eyes-up, head-down menacing look' },
  2636: { tags: ['Suspense', 'Voyeurism', 'Blondes', 'MacGuffin'], signature: 'Dolly zoom (Vertigo shot), cameo appearances' },
  1776: { tags: ['Family', 'Power', 'American Dream', 'Opera'], signature: 'Parallel editing of violence and ceremony' },
  5655: { tags: ['Symmetry', 'Whimsy', 'Color Palette', 'Ensemble'], signature: 'Perfectly centered compositions, pastel color palettes' },
};

const DirectorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dirId = Number(id);

  const { data: person, isLoading } = useQuery({
    queryKey: ['person', dirId],
    queryFn: () => tmdbApi.getPersonDetails(dirId),
    enabled: !!dirId,
  });

  const directedFilms = person?.movie_credits?.crew
    ?.filter((c: any) => c.job === 'Director')
    ?.sort((a: any, b: any) => {
      const dateA = a.release_date || '0000';
      const dateB = b.release_date || '0000';
      return dateB.localeCompare(dateA); // Newest first
    }) || [];

  const top15Films = [...directedFilms].sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 15);

  const { data: moviesDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['director-movies', dirId],
    queryFn: async () => {
      return await Promise.all(top15Films.map((f: any) => tmdbApi.getMovieDetails(f.id).catch(() => null)));
    },
    enabled: top15Films.length > 0,
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bebas text-white mb-4">Director Not Found</h2>
        <Link to="/directors" className="text-primary hover:text-white transition-colors">Back to Directors</Link>
      </div>
    );
  }


  if (directedFilms.length === 0) {
    return (
      <div className="min-h-screen bg-background-dark pt-24 flex flex-col items-center text-center px-4">
        <h2 className="text-4xl font-bebas text-white mb-4">{person.name}</h2>
        <p className="text-gray-400 mb-8">This person has no credited films as a Director in our database.</p>
        <Link to="/directors" className="text-primary hover:text-white transition-colors">Back to Directors</Link>
      </div>
    );
  }

  const meta = DIRECTOR_META[dirId];


  const ratedFilms = directedFilms.filter((f: any) => f.vote_count > 20);
  const avgRating = ratedFilms.length > 0
    ? Math.round((ratedFilms.reduce((s: number, f: any) => s + (f.vote_average || 0), 0) / ratedFilms.length) * 10) / 10
    : 0;


  const firstFilmYear = directedFilms[directedFilms.length - 1]?.release_date?.substring(0, 4);
  const lastFilmYear = directedFilms[0]?.release_date?.substring(0, 4);

  // Best backdrop from their filmography
  const bestBackdrop = directedFilms.find((f: any) => f.backdrop_path)?.backdrop_path;



  let totalBoxOffice = 0;
  let mostUsedActor = 'Unknown';
    if (moviesDetails) {
    const validMovies = moviesDetails.filter(Boolean);
    totalBoxOffice = validMovies.reduce((sum, m) => sum + (m?.revenue || 0), 0);
    const actorCounts: Record<string, number> = {};
    validMovies.forEach(m => {
      m?.credits?.cast?.slice(0, 10).forEach((c: any) => {
        actorCounts[c.name] = (actorCounts[c.name] || 0) + 1;
      });
    });
    let maxCount = 0;
    Object.entries(actorCounts).forEach(([name, count]) => {
      if (count > maxCount) { maxCount = count; mostUsedActor = name; }
    });
    if (maxCount < 2) mostUsedActor = 'Diverse Cast';
  }

  if (loadingDetails) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-background-dark max-w-7xl mx-auto px-4">
         <div className="animate-pulse flex flex-col items-center">
            <div className="w-48 h-48 rounded-full bg-white/10 mb-8" />
            <div className="w-1/3 h-10 bg-white/10 rounded mb-4" />
            <div className="w-2/3 h-4 bg-white/10 rounded" />
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark pb-20">
      {/* Hero */}
      <div className="relative h-[50vh] md:h-[60vh] w-full">
        <div className="absolute inset-0">
          {bestBackdrop && (
            <img src={getImageUrl(bestBackdrop, 'original')} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/50 to-transparent" />
        <div className="absolute top-24 left-6 md:left-16 z-20">
          <Link to="/directors" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" /> Directors
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-[25vh]">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Photo */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 w-48 mx-auto md:mx-0">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-gray-900">
              {person.profile_path ? (
                <img src={getImageUrl(person.profile_path, 'w500')} alt={person.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500"><Camera className="w-12 h-12" /></div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex-grow text-center md:text-left">
            <h1 className="font-bebas text-5xl md:text-7xl text-white mb-2">{person.name}</h1>

            {meta && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                {meta.tags.map(t => (
                  <span key={t} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">{t}</span>
                ))}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 mb-6 justify-center md:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bebas text-white">{directedFilms.length}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Film className="w-3 h-3" /> Films Directed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bebas text-yellow-400">{avgRating}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Star className="w-3 h-3" /> Avg Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bebas text-white">
                  {firstFilmYear}–{(!lastFilmYear || Number(lastFilmYear) >= new Date().getFullYear()) ? 'Present' : lastFilmYear}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Career Span</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bebas text-white">{mostUsedActor}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> Most Used Actor</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bebas text-green-400">
                  {totalBoxOffice > 0 ? `$${(totalBoxOffice / 1000000000).toFixed(2)}B` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Box Office</p>
              </div>
            </div>

            {person.biography && (
              <p className="text-gray-300 font-sans text-sm leading-relaxed max-w-3xl line-clamp-4">
                {person.biography}
              </p>
            )}

            {meta?.signature && (
              <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg inline-block">
                <p className="text-xs text-yellow-400 font-bebas tracking-wider flex items-center gap-1"><Award className="w-3 h-3" /> SIGNATURE SHOT</p>
                <p className="text-sm text-gray-300 font-sans mt-1">{meta.signature}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Filmography */}
        <div className="mt-16">
          <h2 className="font-bebas text-3xl text-white mb-8 flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" /> Complete Filmography
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {directedFilms.map((film: any, i: number) => (
              <motion.div
                key={`${film.id}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/movie/${film.id}`} className="group block">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-2 relative">
                    {film.poster_path ? (
                      <img src={getImageUrl(film.poster_path)} alt={film.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600"><Film className="w-8 h-8" /></div>
                    )}
                    {film.vote_average > 0 && (
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-white font-bold">{film.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-sans text-white truncate group-hover:text-primary transition-colors">{film.title}</p>
                  <p className="text-xs text-gray-500">{film.release_date?.substring(0, 4)}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDetail;
