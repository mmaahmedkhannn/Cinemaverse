/**
 * streamingServices.ts
 *
 * Canonical list of supported streaming services with TMDB provider IDs,
 * slugs, display names, and verified logo paths.
 *
 * Provider IDs verified from TMDB /watch/providers/movie?watch_region=US (2026-05-22).
 * NOTE: Paramount+ uses ID 2303 ("Paramount Plus Premium") — the originally specified
 * ID 531 does not exist in TMDB's provider database.
 */

export interface StreamingService {
  id: number;       // TMDB watch provider ID
  slug: string;     // URL slug used in /streaming/:slug
  name: string;     // Display name
  logoPath: string; // TMDB logo path (use with https://image.tmdb.org/t/p/original)
  color: string;    // Brand accent color for UI
  description: string; // SEO paragraph for the service page
  metaDescription: string;
}

export const STREAMING_SERVICES: StreamingService[] = [
  {
    id: 8,
    slug: 'netflix',
    name: 'Netflix',
    logoPath: '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg',
    color: '#E50914',
    description: 'Netflix is home to some of the most acclaimed original series, films, and documentaries on the planet. From gripping dramas to blockbuster action, discover the best of what Netflix has to offer across every genre.',
    metaDescription: 'Discover the best movies and TV shows on Netflix right now. Top-rated films, must-watch series, and hidden gems all in one place.',
  },
  {
    id: 1899,
    slug: 'max',
    name: 'Max',
    logoPath: '/jbe4gVSfRlbPTdESXhEKpornsfu.jpg',
    color: '#0027E4',
    description: 'Max (formerly HBO Max) combines the legendary HBO library with Warner Bros. blockbusters, DC films, and Max Originals. Explore prestige television and cinematic storytelling at its finest.',
    metaDescription: 'Stream the best movies and TV shows on Max (HBO Max). Award-winning HBO originals, Warner Bros. films, and exclusive Max content.',
  },
  {
    id: 337,
    slug: 'disney-plus',
    name: 'Disney+',
    logoPath: '/97yvRBw1GzX7fXprcF80er19ot.jpg',
    color: '#113CCF',
    description: 'Disney+ brings together the entire Disney universe — from Marvel and Star Wars to Pixar and National Geographic. The ultimate family streaming destination with iconic franchises and must-see originals.',
    metaDescription: 'Find the best movies and TV shows on Disney+. Marvel, Star Wars, Pixar, Disney classics, and exclusive Disney+ Originals.',
  },
  {
    id: 9,
    slug: 'prime-video',
    name: 'Prime Video',
    logoPath: '/pvske1MyAoymrs5bguRfVqYiM9a.jpg',
    color: '#00A8E1',
    description: 'Amazon Prime Video delivers award-winning originals, Hollywood blockbusters, and acclaimed international series. From The Boys to Lord of the Rings: The Rings of Power, Prime Video is home to bold storytelling.',
    metaDescription: 'Browse the best movies and TV shows on Amazon Prime Video. Award-winning originals, blockbuster films, and international hits.',
  },
  {
    id: 15,
    slug: 'hulu',
    name: 'Hulu',
    logoPath: '/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg',
    color: '#1CE783',
    description: 'Hulu offers the best of current-season TV, acclaimed originals like The Handmaid\'s Tale, and an extensive movie library. Stream live sports, news, and entertainment all in one place.',
    metaDescription: 'Discover the best movies and TV shows on Hulu. Current-season hits, Hulu Originals, and a massive on-demand library.',
  },
  {
    id: 350,
    slug: 'apple-tv-plus',
    name: 'Apple TV+',
    logoPath: '/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg',
    color: '#555555',
    description: 'Apple TV+ is known for its premium original content — from Ted Lasso and Severance to The Morning Show and Foundation. Every title is an Apple Original, crafted with cinematic quality and ambition.',
    metaDescription: 'Stream the best Apple TV+ Originals. Ted Lasso, Severance, The Morning Show, and more — exclusively on Apple TV+.',
  },
  {
    id: 2303,
    slug: 'paramount-plus',
    name: 'Paramount+',
    logoPath: '/fts6X10Jn4QT0X6ac3udKEn2tJA.jpg',
    color: '#0064FF',
    description: 'Paramount+ is home to live sports, breaking news, and a deep library of hit shows and films from CBS, Nickelodeon, MTV, BET, and Paramount Pictures. Stream Star Trek, Yellowstone, and much more.',
    metaDescription: 'Find the best movies and TV shows on Paramount+. Yellowstone, Star Trek, CBS hits, and Paramount+ Originals.',
  },
];

export const SERVICES_BY_SLUG = Object.fromEntries(
  STREAMING_SERVICES.map(s => [s.slug, s])
) as Record<string, StreamingService>;

export const getServiceLogoUrl = (logoPath: string) =>
  `https://image.tmdb.org/t/p/original${logoPath}`;
