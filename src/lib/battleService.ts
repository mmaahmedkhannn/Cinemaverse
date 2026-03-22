import { doc, setDoc, getDoc, getDocs, collection, increment, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { sanitizeInput } from './sanitize';
import { sendBattleResultsEmail } from './emailjs';

export interface Battle {
  id?: string;
  movie1Id: number;
  movie2Id: number;
  movie1Title: string;
  movie2Title: string;
  movie1Poster: string | null;
  movie2Poster: string | null;
  movie1Votes: number;
  movie2Votes: number;
  category: string;
  createdAt?: any;
  featured?: boolean;
}

// Predefined battles (no posters, relying on direct TMDB API fetches)
export const PRESET_BATTLES: Omit<Battle, 'movie1Votes' | 'movie2Votes' | 'movie1Poster' | 'movie2Poster'>[] = [
  { movie1Id: 238, movie2Id: 155, movie1Title: 'The Godfather', movie2Title: 'The Dark Knight', category: '🏆 Greatest of All Time' },
  { movie1Id: 27205, movie2Id: 157336, movie1Title: 'Inception', movie2Title: 'Interstellar', category: '🏆 Greatest of All Time' },
  { movie1Id: 680, movie2Id: 550, movie1Title: 'Pulp Fiction', movie2Title: 'Fight Club', category: '🏆 Greatest of All Time' },
  { movie1Id: 299534, movie2Id: 299536, movie1Title: 'Avengers: Endgame', movie2Title: 'Avengers: Infinity War', category: '🦸 Superhero' },
  { movie1Id: 278, movie2Id: 13, movie1Title: 'The Shawshank Redemption', movie2Title: 'Forrest Gump', category: '🏆 Greatest of All Time' },
  { movie1Id: 769, movie2Id: 111, movie1Title: 'Goodfellas', movie2Title: 'Scarface', category: '🏆 Greatest of All Time' },
  { movie1Id: 603, movie2Id: 335984, movie1Title: 'The Matrix', movie2Title: 'Blade Runner 2049', category: '🏆 Greatest of All Time' },
  { movie1Id: 475557, movie2Id: 155, movie1Title: 'Joker', movie2Title: 'The Dark Knight', category: '🏆 Greatest of All Time' },
  { movie1Id: 872585, movie2Id: 374720, movie1Title: 'Oppenheimer', movie2Title: 'Dunkirk', category: '🔥 New Releases' },
  { movie1Id: 6488, movie2Id: 275, movie1Title: 'No Country For Old Men', movie2Title: 'Fargo', category: '🏆 Greatest of All Time' },
  { "movie1Id": 11, "movie2Id": 1891, "movie1Title": "Star Wars", "movie2Title": "The Empire Strikes Back", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 120, "movie2Id": 121, "movie1Title": "The Lord of the Rings: The Fellowship of the Ring", "movie2Title": "The Lord of the Rings: The Two Towers", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 105, "movie2Id": 106, "movie1Title": "Back to the Future", "movie2Title": "Predator", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 671, "movie2Id": 672, "movie1Title": "Harry Potter and the Philosopher's Stone", "movie2Title": "Harry Potter and the Chamber of Secrets", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 280, "movie2Id": 218, "movie1Title": "Terminator 2: Judgment Day", "movie2Title": "The Terminator", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 101, "movie2Id": 807, "movie1Title": "Léon: The Professional", "movie2Title": "Se7en", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 109445, "movie2Id": 324857, "movie1Title": "Frozen", "movie2Title": "Spider-Man: Into the Spider-Verse", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 48311, "movie2Id": 315635, "movie1Title": "Parasite", "movie2Title": "Spider-Man: Homecoming", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 346698, "movie2Id": 447365, "movie1Title": "Barbie", "movie2Title": "Guardians of the Galaxy Vol. 3", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 920, "movie2Id": 39360, "movie1Title": "Cars", "movie2Title": "Westler: East of the Wall", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 272, "movie2Id": 268, "movie1Title": "Batman Begins", "movie2Title": "Batman", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 98, "movie2Id": 197, "movie1Title": "Gladiator", "movie2Title": "Braveheart", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 78, "movie2Id": 348, "movie1Title": "Blade Runner", "movie2Title": "Alien", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 14, "movie2Id": 274, "movie1Title": "American Beauty", "movie2Title": "The Silence of the Lambs", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 15, "movie2Id": 289, "movie1Title": "Citizen Kane", "movie2Title": "Casablanca", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 115, "movie2Id": 500, "movie1Title": "The Big Lebowski", "movie2Title": "Reservoir Dogs", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 118, "movie2Id": 12155, "movie1Title": "Charlie and the Chocolate Factory", "movie2Title": "Alice in Wonderland", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 68718, "movie2Id": 16869, "movie1Title": "Django Unchained", "movie2Title": "Inglourious Basterds", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 24428, "movie2Id": 1726, "movie1Title": "The Avengers", "movie2Title": "Iron Man", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 70160, "movie2Id": 101299, "movie1Title": "The Hunger Games", "movie2Title": "The Hunger Games: Catching Fire", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 14160, "movie2Id": 10193, "movie1Title": "Up", "movie2Title": "Toy Story 3", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 18785, "movie2Id": 8363, "movie1Title": "The Hangover", "movie2Title": "Superbad", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 7451, "movie2Id": 9799, "movie1Title": "xXx", "movie2Title": "The Fast and the Furious", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 22, "movie2Id": 58, "movie1Title": "Pirates of the Caribbean: The Curse of the Black Pearl", "movie2Title": "Pirates of the Caribbean: Dead Man's Chest", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 585, "movie2Id": 12, "movie1Title": "Monsters, Inc.", "movie2Title": "Finding Nemo", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 2501, "movie2Id": 2502, "movie1Title": "The Bourne Identity", "movie2Title": "The Bourne Supremacy", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 389, "movie2Id": 595, "movie1Title": "12 Angry Men", "movie2Title": "To Kill a Mockingbird", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 244786, "movie2Id": 44214, "movie1Title": "Whiplash", "movie2Title": "Black Swan", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 313369, "movie2Id": 332562, "movie1Title": "La La Land", "movie2Title": "A Star Is Born", "category": "🔥 Weekly Rotation" },
  { "movie1Id": 545611, "movie2Id": 438631, "movie1Title": "Everything Everywhere All at Once", "movie2Title": "Dune", "category": "🔥 Weekly Rotation" }
];

export const castVote = async (
  battleId: string,
  movieId: number,
  userId: string,
  movieSide: 'movie1' | 'movie2',
  preset?: any
) => {
  const safeBattleId = sanitizeInput(battleId);
  const safeUserId = sanitizeInput(userId);

  const battleRef = doc(db, 'battles', safeBattleId);
  if (preset) {
     const battleSnap = await getDoc(battleRef);
     if (!battleSnap.exists()) {
        await setDoc(battleRef, { ...preset, movie1Votes: 0, movie2Votes: 0, createdAt: serverTimestamp() });
     }
  }

  const voteRef = doc(db, 'battles', safeBattleId, 'votes', safeUserId);
  const existing = await getDoc(voteRef);
  if (existing.exists()) throw new Error('You have already voted in this battle');

  await setDoc(voteRef, { movieId, votedAt: serverTimestamp() });

  await updateDoc(battleRef, {
    [`${movieSide}Votes`]: increment(1),
  });
};

export const getUserVote = async (battleId: string, userId: string) => {
  const voteRef = doc(db, 'battles', sanitizeInput(battleId), 'votes', sanitizeInput(userId));
  const snap = await getDoc(voteRef);
  return snap.exists() ? snap.data() : null;
};

export const getBattle = async (battleId: string): Promise<Battle | null> => {
  const snap = await getDoc(doc(db, 'battles', battleId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Battle : null;
};

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Firebase Timeout at: ${label} (>${ms}ms)`)), ms))
  ]);
};

export const initializeBattle = async (battle: Omit<Battle, 'movie1Votes' | 'movie2Votes' | 'movie1Poster' | 'movie2Poster'>) => {
  const id = `${battle.movie1Id}_vs_${battle.movie2Id}`;
  const ref = doc(db, 'battles', id);
  const existing = await withTimeout(getDoc(ref), 5000, 'initializeBattle:getDoc');
  if (!existing.exists()) {
    await withTimeout(setDoc(ref, { ...battle, movie1Votes: 0, movie2Votes: 0, createdAt: serverTimestamp() }), 5000, 'initializeBattle:setDoc');
  }
  return id;
};

export const getWeeklyBattle = async (): Promise<{ battleId: string, endsAt: any }> => {
  const ref = doc(db, 'system', 'weeklyBattle');
  const snap = await withTimeout(getDoc(ref), 5000, 'getWeeklyBattle:getDoc(system/weeklyBattle)');
  
  if (!snap.exists()) {
    const preset = PRESET_BATTLES[0];
    const battleId = await initializeBattle(preset); // internally has timeouts
    const now = new Date();
    const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const state = {
      currentBattleId: battleId,
      currentPresetIndex: 0,
      startedAt: serverTimestamp(),
      endsAt: Timestamp.fromDate(endsAt)
    };
    await withTimeout(setDoc(ref, state), 5000, 'getWeeklyBattle:setDoc(system/weeklyBattle)');
    return { battleId, endsAt: state.endsAt };
  }

  const state = snap.data();
  const endsAtDate = state.endsAt.toDate();
  
  if (new Date() > endsAtDate) {
    // Battle Expired - Calculate winner and rotate
    const oldBattle = await getBattle(state.currentBattleId);
    if (oldBattle) {
      const total = oldBattle.movie1Votes + oldBattle.movie2Votes;
      const m1Pct = total > 0 ? Math.round((oldBattle.movie1Votes / total) * 100) : 50;
      const m2Pct = total > 0 ? 100 - m1Pct : 50;
      const winnerName = m1Pct > m2Pct ? oldBattle.movie1Title : oldBattle.movie2Title;
      const winnerPct = Math.max(m1Pct, m2Pct);
      const title = `${oldBattle.movie1Title} vs ${oldBattle.movie2Title}`;

      // Trigger Emails
      try {
        const usersSnap = await withTimeout(getDocs(collection(db, 'users')), 10000, 'getWeeklyBattle:getDocs(users)');
        const emails = usersSnap.docs.map(d => d.data().email).filter(Boolean);
        if (emails.length > 0) {
          sendBattleResultsEmail(emails, winnerName, winnerPct, title).catch(console.error);
        }
      } catch (e) {
        console.error("Failed fetching users for email", e);
      }
    }

    // Set new battle
    const nextIndex = (state.currentPresetIndex + 1) % PRESET_BATTLES.length;
    const nextPreset = PRESET_BATTLES[nextIndex];
    const newBattleId = await initializeBattle(nextPreset);
    
    const now = new Date();
    const newEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const newState = {
      currentBattleId: newBattleId,
      currentPresetIndex: nextIndex,
      startedAt: serverTimestamp(),
      endsAt: Timestamp.fromDate(newEndsAt)
    };
    await withTimeout(updateDoc(ref, newState), 5000, 'getWeeklyBattle:updateDoc(system/weeklyBattle)');
    return { battleId: newBattleId, endsAt: newState.endsAt };
  }

  return { battleId: state.currentBattleId, endsAt: state.endsAt };
};
