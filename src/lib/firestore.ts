/**
 * firestore.ts
 *
 * Provides typed helper functions for interacting with Firebase Firestore.
 * Handles user-specific data like watchlists and ratings.
 *
 * Key dependencies: firebase/firestore
 * Note: Input is sanitized before writing to the database to prevent injection.
 */
import { doc, setDoc, deleteDoc, getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { sanitizeInput } from './sanitize';

export interface WatchlistItem {
  movieId: number;
  title: string;
  poster_path: string | null;
  addedAt: number;
  mediaType: 'movie' | 'tv';
}

export interface RatingItem extends WatchlistItem {
  rating: number;
}

/**
 * Adds a movie or TV show to the user's personal watchlist.
 * 
 * @param userId - The Firebase authentication UID of the user
 * @param item - The media item to add (WatchlistItem)
 * @returns A promise that resolves when the write is complete
 */
export const addToWatchlist = async (userId: string, item: WatchlistItem) => {
  const sanitizedItem = { ...item, title: sanitizeInput(item.title) };
  const docRef = doc(db, 'users', userId, 'watchlist', item.movieId.toString());
  await setDoc(docRef, sanitizedItem);
};

/**
 * Removes a previously added item from the user's watchlist.
 * 
 * @param userId - The Firebase authentication UID of the user
 * @param movieId - The TMDB ID of the media to remove
 * @returns A promise that resolves when the deletion is complete
 */
export const removeFromWatchlist = async (userId: string, movieId: number) => {
  const docRef = doc(db, 'users', userId, 'watchlist', movieId.toString());
  await deleteDoc(docRef);
};

/**
 * Retrieves the user's entire watchlist, ordered by newest additions first.
 * 
 * @param userId - The Firebase authentication UID of the user
 * @returns A promise resolving to an array of WatchlistItem objects
 */
export const getWatchlist = async (userId: string): Promise<WatchlistItem[]> => {
  const q = query(collection(db, 'users', userId, 'watchlist'), orderBy('addedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as WatchlistItem);
};

/**
 * Saves or updates a user's rating for a specific movie or TV show.
 * 
 * @param userId - The Firebase authentication UID of the user
 * @param item - The media item including the numerical rating
 * @returns A promise that resolves when the write is complete
 */
export const rateMedia = async (userId: string, item: RatingItem) => {
  const sanitizedItem = { ...item, title: sanitizeInput(item.title) };
  const docRef = doc(db, 'users', userId, 'ratings', item.movieId.toString());
  await setDoc(docRef, sanitizedItem);
};

/**
 * Removes a user's rating for a specific media item.
 * 
 * @param userId - The Firebase authentication UID of the user
 * @param movieId - The TMDB ID of the rated media
 * @returns A promise that resolves when the deletion is complete
 */
export const removeRating = async (userId: string, movieId: number) => {
  const docRef = doc(db, 'users', userId, 'ratings', movieId.toString());
  await deleteDoc(docRef);
};

/**
 * Retrieves all media ratings submitted by the user, ordered by newest first.
 * 
 * @param userId - The Firebase authentication UID of the user
 * @returns A promise resolving to an array of RatingItem objects
 */
export const getRatings = async (userId: string): Promise<RatingItem[]> => {
  const q = query(collection(db, 'users', userId, 'ratings'), orderBy('addedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as RatingItem);
};
