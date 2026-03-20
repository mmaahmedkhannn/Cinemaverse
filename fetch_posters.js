import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const tokens = process.env.VITE_TMDB_READ_TOKEN;

async function getM(query) {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${tokens}` }
    });
    const data = await res.json();
    return data.results[0];
}

const pairs = [
  ['The Godfather', 'The Dark Knight', '🏆 Greatest of All Time'],
  ['Inception', 'Interstellar', '🏆 Greatest of All Time'],
  ['Pulp Fiction', 'Fight Club', '🏆 Greatest of All Time'],
  ['Avengers: Endgame', 'Avengers: Infinity War', '🦸 Superhero'],
  ['The Shawshank Redemption', 'Forrest Gump', '🏆 Greatest of All Time'],
  ['Goodfellas', 'Scarface', '🏆 Greatest of All Time'],
  ['The Matrix', 'Blade Runner 2049', '🏆 Greatest of All Time'],
  ['Joker', 'The Dark Knight', '🏆 Greatest of All Time'],
  ['Oppenheimer', 'Dunkirk', '🔥 New Releases'],
  ['No Country For Old Men', 'Fargo', '🏆 Greatest of All Time']
];

async function run() {
  const result = [];
  for (let pair of pairs) {
    const m1 = await getM(pair[0]);
    const m2 = await getM(pair[1]);
    result.push({
      battleId: `battle_${m1.id}_${m2.id}`,
      category: pair[2],
      movie1Id: m1.id,
      movie1Title: m1.title,
      movie1Poster: m1.poster_path,
      movie1Votes: 100,
      movie2Id: m2.id,
      movie2Title: m2.title,
      movie2Poster: m2.poster_path,
      movie2Votes: 100,
      stats1: { release_date: m1.release_date, vote_average: m1.vote_average, popularity: m1.popularity },
      stats2: { release_date: m2.release_date, vote_average: m2.vote_average, popularity: m2.popularity }
    });
  }
  fs.writeFileSync('battles_data.json', JSON.stringify(result, null, 2));
}
run();
