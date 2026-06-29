/**
 * moods.ts
 *
 * Defines the 15 mood options for the Mood Discovery Engine.
 * Each mood maps to specific TMDB Discover API parameters that will be
 * combined with audience, time, and era filters by moodEngine.ts.
 *
 * Genre IDs:
 *  16=Animation, 18=Drama, 27=Horror, 28=Action, 35=Comedy, 36=History
 *  53=Thriller, 80=Crime, 99=Documentary, 878=Sci-Fi, 9648=Mystery
 *  10402=Music, 10749=Romance, 10751=Family, 10752=War, 10770=TV Movie
 *
 * Keyword IDs (all verified live against TMDB API — June 2026):
 *  1647=sadness, 6203=loss, 9872=grief, 34265=heartbreak, 156924=tearjerker
 *  5565=biography, 9672=based on true story, 281585=inspirational, 340731=overcoming obstacles
 *  362567=mind-bending, 326438=twist ending, 12565=psychological thriller, 272553=psychological
 *  818=based on novel or book
 *
 * NOTE on keyword syntax:
 *  Comma (,) = AND — all keywords must be present on the same film (very restrictive)
 *  Pipe (|)   = OR  — any one keyword match is sufficient (used here for broader results)
 */

export interface MoodDefinition {
  id: string;
  label: string;
  emoji: string;
  description: string;
  tmdbParams: Record<string, string | number>;
}

export const MOODS: MoodDefinition[] = [
  {
    id: 'scared',
    label: 'I want to be scared',
    emoji: '😱',
    description: 'Horror, thrillers, things that go bump',
    tmdbParams: {
      with_genres: '27',
      without_genres: '16,10751',
      'vote_average.gte': 7.0,
      'vote_count.gte': 1000,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'laugh',
    label: 'I want to laugh',
    emoji: '😂',
    description: 'Comedies that genuinely deliver',
    tmdbParams: {
      with_genres: '35',
      without_genres: '16,10751,10770',
      'vote_average.gte': 7.2,
      'vote_count.gte': 3000,
      sort_by: 'popularity.desc',
    },
  },
  {
    id: 'cry',
    label: 'I need a good cry',
    emoji: '😢',
    description: 'Emotional dramas that hit deep',
    tmdbParams: {
      with_genres: '18',
      with_keywords: '1647|6203|34265|9872|156924',
      without_genres: '16,10751,27',
      'vote_average.gte': 7.0,
      'vote_count.gte': 300,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'breakup',
    label: 'I just broke up',
    emoji: '💔',
    description: 'Heartbreak films that help you process',
    tmdbParams: {
      with_genres: '18|10749',
      with_keywords: '34265|1647|6203|9872',
      without_genres: '27,16,10751',
      'vote_average.gte': 6.5,
      'vote_count.gte': 200,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'inspired',
    label: 'I want to feel inspired',
    emoji: '✨',
    description: 'Biopics and motivational stories',
    tmdbParams: {
      with_genres: '18|36',
      with_keywords: '5565|9672|281585|340731',
      without_genres: '10749,16,10751,27',
      'vote_average.gte': 7.2,
      'vote_count.gte': 1000,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'mindbender',
    label: 'I want a mind-bender',
    emoji: '🧠',
    description: 'Psychological puzzles and sci-fi twists',
    tmdbParams: {
      with_genres: '878|53|9648',
      with_keywords: '362567|326438|12565',
      without_genres: '16,10751',
      'vote_average.gte': 7.0,
      'vote_count.gte': 500,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'background',
    label: 'Background watch',
    emoji: '☕',
    description: 'Easy, low-attention viewing',
    tmdbParams: {
      with_genres: '35|10749|16',
      without_genres: '27,53,80,18,10752',
      'vote_average.gte': 6.5,
      'vote_count.gte': 500,
      'runtime.lte': 110,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'datenight',
    label: 'Date night',
    emoji: '💕',
    description: 'Perfect couple-friendly picks',
    tmdbParams: {
      with_genres: '10749',
      without_genres: '27,80,16,10751,28',
      'vote_average.gte': 7.0,
      'vote_count.gte': 2000,
      sort_by: 'popularity.desc',
    },
  },
  {
    id: 'surprise',
    label: "I'm bored, surprise me",
    emoji: '🎲',
    description: 'Eclectic hidden gems',
    tmdbParams: {
      without_genres: '99,16,10751',
      'vote_average.gte': 7.5,
      'vote_count.gte': 1000,
      'vote_count.lte': 50000,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'comfort',
    label: 'I want comfort',
    emoji: '🫂',
    description: 'Feel-good rewatches',
    tmdbParams: {
      with_genres: '10751|35',
      without_genres: '27,53,80,16',
      'vote_average.gte': 7.0,
      'vote_count.gte': 500,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'escape',
    label: 'I want to escape reality',
    emoji: '🌌',
    description: 'Fantasy and otherworldly adventures',
    tmdbParams: {
      with_genres: '14|12|878',
      without_genres: '16,10751',
      'vote_average.gte': 7.5,
      'vote_count.gte': 2000,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'adrenaline',
    label: 'I need adrenaline',
    emoji: '⚡',
    description: 'Action-packed, edge-of-seat thrillers',
    tmdbParams: {
      with_genres: '28|53',
      without_genres: '16,10751,10749',
      'vote_average.gte': 7.0,
      'vote_count.gte': 1500,
      sort_by: 'popularity.desc',
    },
  },
  {
    id: 'deep',
    label: 'I want something deep',
    emoji: '🎭',
    description: 'Films that change how you see the world',
    tmdbParams: {
      with_genres: '18|80|9648',
      with_keywords: '818|340731|272553',
      without_genres: '16,10751,10749',
      'vote_average.gte': 8.0,
      'vote_count.gte': 2000,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'nostalgia',
    label: 'I want nostalgia',
    emoji: '📼',
    description: 'Films that take you back',
    tmdbParams: {
      without_genres: '99,16,10751',
      'primary_release_date.gte': '1980-01-01',
      'primary_release_date.lte': '2005-12-31',
      'vote_average.gte': 7.5,
      'vote_count.gte': 1000,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'hidden-gem',
    label: 'I want a hidden gem',
    emoji: '💎',
    description: 'Underrated brilliance',
    tmdbParams: {
      without_genres: '99,16,10751',
      'vote_average.gte': 7.5,
      'vote_count.gte': 500,
      'vote_count.lte': 5000,
      sort_by: 'vote_average.desc',
    },
  },
];
