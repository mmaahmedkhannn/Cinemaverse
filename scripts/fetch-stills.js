import axios from 'axios';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const token = env.split('\n').find(l => l.startsWith('VITE_TMDB_READ_TOKEN=')).split('=')[1].replace(/"/g, '').trim();
const BASE = 'https://api.themoviedb.org/3';
const headers = { Authorization: `Bearer ${token}` };

// Define characters with their actor's TMDB person ID and the movie/show media ID
const CHARACTERS = [
  // Money Heist (TV: 71446)
  { personId: 1340020, charName: 'The Professor', mediaId: 71446, mediaType: 'tv' },
  { personId: 1042728, charName: 'Tokyo', mediaId: 71446, mediaType: 'tv' },
  { personId: 1109836, charName: 'Berlin', mediaId: 71446, mediaType: 'tv' },
  { personId: 1283843, charName: 'Nairobi', mediaId: 71446, mediaType: 'tv' },
  { personId: 1428896, charName: 'Rio', mediaId: 71446, mediaType: 'tv' },
  { personId: 1972706, charName: 'Denver', mediaId: 71446, mediaType: 'tv' },
  { personId: 1338531, charName: 'Moscow', mediaId: 71446, mediaType: 'tv' },
  { personId: 54882, charName: 'Lisbon', mediaId: 71446, mediaType: 'tv' },
  { personId: 2025888, charName: 'Palermo', mediaId: 71446, mediaType: 'tv' },

  // Stranger Things (TV: 66732)
  { personId: 1356210, charName: 'Eleven', mediaId: 66732, mediaType: 'tv' },
  { personId: 1442069, charName: 'Mike', mediaId: 66732, mediaType: 'tv' },
  { personId: 1653291, charName: 'Dustin', mediaId: 66732, mediaType: 'tv' },
  { personId: 1474123, charName: 'Lucas', mediaId: 66732, mediaType: 'tv' },
  { personId: 1393177, charName: 'Will', mediaId: 66732, mediaType: 'tv' },
  { personId: 1590797, charName: 'Max', mediaId: 66732, mediaType: 'tv' },
  { personId: 1253360, charName: 'Steve', mediaId: 66732, mediaType: 'tv' },
  { personId: 18082, charName: 'Hopper', mediaId: 66732, mediaType: 'tv' },
  { personId: 6886, charName: 'Joyce', mediaId: 66732, mediaType: 'tv' },

  // MCU characters
  { personId: 3223, charName: 'Iron Man', mediaId: 299536, mediaType: 'movie' },
  { personId: 1136406, charName: 'Spider-Man', mediaId: 315635, mediaType: 'movie' },
  { personId: 74568, charName: 'Thor', mediaId: 299536, mediaType: 'movie' },
  { personId: 16828, charName: 'Captain America', mediaId: 299536, mediaType: 'movie' },
  { personId: 1245, charName: 'Black Widow', mediaId: 299536, mediaType: 'movie' },
  { personId: 103, charName: 'Hulk', mediaId: 299536, mediaType: 'movie' },
  { personId: 10859, charName: 'Deadpool', mediaId: 533535, mediaType: 'movie' },
  { personId: 172069, charName: 'Black Panther', mediaId: 284054, mediaType: 'movie' },

  // DC
  { personId: 3894, charName: 'Batman', mediaId: 155, mediaType: 'movie' },
  { personId: 1810, charName: 'Joker', mediaId: 155, mediaType: 'movie' },
  { personId: 234352, charName: 'Harley Quinn', mediaId: 436969, mediaType: 'movie' },
  { personId: 73968, charName: 'Superman', mediaId: 209764, mediaType: 'movie' },
  { personId: 90633, charName: 'Wonder Woman', mediaId: 297762, mediaType: 'movie' },
  { personId: 132157, charName: 'The Flash', mediaId: 298618, mediaType: 'movie' },

  // Star Wars
  { personId: 2, charName: 'Luke Skywalker', mediaId: 11, mediaType: 'movie' },
  { personId: 24342, charName: 'Darth Vader', mediaId: 11, mediaType: 'movie' },
  { personId: 3, charName: 'Han Solo', mediaId: 11, mediaType: 'movie' },
  { personId: 7908, charName: 'Yoda', mediaId: 1891, mediaType: 'movie' },
  { personId: 1315036, charName: 'Rey', mediaId: 140607, mediaType: 'movie' },
  { personId: 1023139, charName: 'Kylo Ren', mediaId: 140607, mediaType: 'movie' },

  // Breaking Bad (TV: 1396)
  { personId: 17419, charName: 'Walter White', mediaId: 1396, mediaType: 'tv' },
  { personId: 84497, charName: 'Jesse Pinkman', mediaId: 1396, mediaType: 'tv' },
  { personId: 59410, charName: 'Saul Goodman', mediaId: 1396, mediaType: 'tv' },

  // Game of Thrones (TV: 1399)
  { personId: 239019, charName: 'Jon Snow', mediaId: 1399, mediaType: 'tv' },
  { personId: 1223786, charName: 'Daenerys', mediaId: 1399, mediaType: 'tv' },
  { personId: 22970, charName: 'Tyrion', mediaId: 1399, mediaType: 'tv' },
  { personId: 1181313, charName: 'Arya', mediaId: 1399, mediaType: 'tv' },

  // One Piece (TV: 111110)
  { personId: 2177750, charName: 'Luffy', mediaId: 111110, mediaType: 'tv' },
  { personId: 1566805, charName: 'Zoro', mediaId: 111110, mediaType: 'tv' },
  { personId: 1568101, charName: 'Nami', mediaId: 111110, mediaType: 'tv' },
  { personId: 2355316, charName: 'Usopp', mediaId: 111110, mediaType: 'tv' },
  { personId: 2498631, charName: 'Sanji', mediaId: 111110, mediaType: 'tv' },

  // Lucifer (TV: 63174)
  { personId: 192944, charName: 'Lucifer', mediaId: 63174, mediaType: 'tv' },
  { personId: 37014, charName: 'Chloe', mediaId: 63174, mediaType: 'tv' },
  { personId: 515875, charName: 'Maze', mediaId: 63174, mediaType: 'tv' },
  { personId: 21356, charName: 'Amenadiel', mediaId: 63174, mediaType: 'tv' },
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const results = [];

  for (const char of CHARACTERS) {
    try {
      // Fetch tagged images
      const url = `${BASE}/person/${char.personId}/tagged_images?page=1`;
      const res = await axios.get(url, { headers });
      const allImages = res.data.results || [];

      // Filter: from the right movie/show, NOT profile type
      const fromShow = allImages.filter(img =>
        img.media?.id === char.mediaId &&
        img.image_type !== 'profile'
      );

      // Sort by vote_count (most popular first)
      fromShow.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

      // Also get ANY still/backdrop from the show (even if fewer votes)
      const anyFromShow = allImages.filter(img =>
        img.media?.id === char.mediaId
      );
      anyFromShow.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

      const best = fromShow[0] || anyFromShow[0];

      if (best) {
        results.push({
          charName: char.charName,
          path: `https://image.tmdb.org/t/p/w500${best.file_path}`,
          type: best.image_type,
          aspect: best.aspect_ratio,
          votes: best.vote_count,
        });
        console.log(`✓ ${char.charName}: ${best.image_type} (${best.vote_count} votes) ${best.file_path}`);
      } else {
        // Fallback: get any tagged image at all for this actor
        const fallback = allImages.filter(i => i.image_type !== 'profile').sort((a,b) => (b.vote_count||0)-(a.vote_count||0))[0];
        if (fallback) {
          results.push({
            charName: char.charName,
            path: `https://image.tmdb.org/t/p/w500${fallback.file_path}`,
            type: fallback.image_type + ' (fallback)',
            aspect: fallback.aspect_ratio,
            votes: fallback.vote_count,
          });
          console.log(`~ ${char.charName}: ${fallback.image_type} FALLBACK ${fallback.file_path}`);
        } else {
          results.push({ charName: char.charName, path: 'NONE', type: 'NONE' });
          console.log(`✗ ${char.charName}: NO IMAGES FOUND`);
        }
      }

      await sleep(100); // Rate limiting
    } catch (e) {
      console.error(`ERR ${char.charName}: ${e.message}`);
      results.push({ charName: char.charName, path: 'ERROR', type: 'error' });
    }
  }

  console.log('\n\n=== RESULTS JSON ===');
  console.log(JSON.stringify(results, null, 2));
}

run();
