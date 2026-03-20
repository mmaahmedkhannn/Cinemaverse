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

export const addToWatchlist = async (userId: string, item: WatchlistItem) => {
  const sanitizedItem = { ...item, title: sanitizeInput(item.title) };
  const docRef = doc(db, 'users', userId, 'watchlist', item.movieId.toString());
  await setDoc(docRef, sanitizedItem);
};

export const removeFromWatchlist = async (userId: string, movieId: number) => {
  const docRef = doc(db, 'users', userId, 'watchlist', movieId.toString());
  await deleteDoc(docRef);
};

export const getWatchlist = async (userId: string): Promise<WatchlistItem[]> => {
  const q = query(collection(db, 'users', userId, 'watchlist'), orderBy('addedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as WatchlistItem);
};

export const rateMedia = async (userId: string, item: RatingItem) => {
  const sanitizedItem = { ...item, title: sanitizeInput(item.title) };
  const docRef = doc(db, 'users', userId, 'ratings', item.movieId.toString());
  await setDoc(docRef, sanitizedItem);
};

export const removeRating = async (userId: string, movieId: number) => {
  const docRef = doc(db, 'users', userId, 'ratings', movieId.toString());
  await deleteDoc(docRef);
};

export const getRatings = async (userId: string): Promise<RatingItem[]> => {
  const q = query(collection(db, 'users', userId, 'ratings'), orderBy('addedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as RatingItem);
};
