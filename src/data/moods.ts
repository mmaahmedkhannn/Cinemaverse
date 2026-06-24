/**
 * moods.ts
 *
 * Defines the 15 mood options for the Mood Discovery Engine.
 * Each mood maps to specific TMDB Discover API parameters that will be
 * combined with audience, time, and era filters by moodEngine.ts.
 *
 * Keyword IDs reference:
 *  5565 = sadness, 9663 = loss, 6149 = love, 209714 = tragedy
 *  161091 = heartbreak, 9714 = breakup
 *  5557 = biography, 9882 = based on true story, 2243 = sports, 818 = based on novel
 *  9748 = twist ending, 10683 = mind-bending
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
      with_genres: '27,53',
      'vote_average.gte': 6.5,
      'vote_count.gte': 500,
      sort_by: 'popularity.desc',
    },
  },
  {
    id: 'laugh',
    label: 'I want to laugh',
    emoji: '😂',
    description: 'Comedies that genuinely deliver',
    tmdbParams: {
      with_genres: '35',
      'vote_average.gte': 6.8,
      'vote_count.gte': 800,
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
      with_keywords: '5565,9663,6149,209714',
      'vote_average.gte': 7.0,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'breakup',
    label: 'I just broke up',
    emoji: '💔',
    description: 'Heartbreak films that help you process',
    tmdbParams: {
      with_genres: '18,10749',
      with_keywords: '6149,161091,9714',
      without_genres: '27',
      'vote_average.gte': 7.0,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'inspired',
    label: 'I want to feel inspired',
    emoji: '✨',
    description: 'Biopics and motivational stories',
    tmdbParams: {
      with_genres: '18',
      with_keywords: '5557,9882,2243,818',
      'vote_average.gte': 7.2,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'mindbender',
    label: 'I want a mind-bender',
    emoji: '🧠',
    description: 'Psychological puzzles and sci-fi twists',
    tmdbParams: {
      with_genres: '878,53',
      with_keywords: '9748,10683,9882',
      'vote_average.gte': 7.0,
      sort_by: 'popularity.desc',
    },
  },
  {
    id: 'background',
    label: 'Background watch',
    emoji: '☕',
    description: 'Easy, low-attention viewing',
    tmdbParams: {
      with_genres: '35,10749,16',
      'vote_average.gte': 6.0,
      'runtime.lte': 110,
      sort_by: 'popularity.desc',
    },
  },
  {
    id: 'datenight',
    label: 'Date night',
    emoji: '💕',
    description: 'Perfect couple-friendly picks',
    tmdbParams: {
      with_genres: '10749,35,18',
      without_genres: '27,80',
      'vote_average.gte': 7.0,
      sort_by: 'popularity.desc',
    },
  },
  {
    id: 'surprise',
    label: "I'm bored, surprise me",
    emoji: '🎲',
    description: 'Eclectic hidden gems',
    tmdbParams: {
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
      with_genres: '10751,35,16',
      without_genres: '27,53,80',
      'vote_average.gte': 7.0,
      sort_by: 'popularity.desc',
    },
  },
  {
    id: 'escape',
    label: 'I want to escape reality',
    emoji: '🌌',
    description: 'Fantasy and otherworldly adventures',
    tmdbParams: {
      with_genres: '14,12,878',
      'vote_average.gte': 7.0,
      sort_by: 'popularity.desc',
    },
  },
  {
    id: 'adrenaline',
    label: 'I need adrenaline',
    emoji: '⚡',
    description: 'Action-packed, edge-of-seat thrillers',
    tmdbParams: {
      with_genres: '28,53',
      'vote_average.gte': 7.0,
      sort_by: 'popularity.desc',
    },
  },
  {
    id: 'deep',
    label: 'I want something deep',
    emoji: '🎭',
    description: 'Films that change how you see the world',
    tmdbParams: {
      with_genres: '18',
      with_keywords: '9882,818',
      'vote_average.gte': 7.8,
      'vote_count.gte': 500,
      sort_by: 'vote_average.desc',
    },
  },
  {
    id: 'nostalgia',
    label: 'I want nostalgia',
    emoji: '📼',
    description: 'Films that take you back',
    tmdbParams: {
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
      'vote_average.gte': 7.5,
      'vote_count.gte': 500,
      'vote_count.lte': 5000,
      sort_by: 'vote_average.desc',
    },
  },
];
