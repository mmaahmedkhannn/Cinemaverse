import axios from 'axios';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const tokenMatch = env.split('\n').find(l => l.startsWith('VITE_TMDB_READ_TOKEN='));
const token = tokenMatch ? tokenMatch.split('=')[1].replace(/"/g, '').trim() : '';
const BASE = 'https://api.themoviedb.org/3';
const headers = { Authorization: `Bearer ${token}` };

// TMDB IDs: TV shows use /tv/{id}/credits, movies use /movie/{id}/credits
const FRANCHISES = [
  {
    category: 'Money Heist',
    type: 'tv', id: 71446,
    characters: ['Sergio Marquina', 'Tokio', 'Berlín', 'Nairobi', 'Río', 'Denver', 'Moscú', 'Raquel Murillo', 'Palermo',
                 'The Professor', 'Tokyo', 'Berlin', 'Rio', 'Moscow', 'Lisbon']
  },
  {
    category: 'Stranger Things',
    type: 'tv', id: 66732,
    characters: ['Eleven', 'Mike Wheeler', 'Dustin Henderson', 'Lucas Sinclair', 'Will Byers', 'Max Mayfield', 'Steve Harrington', 'Jim Hopper', 'Joyce Byers']
  },
  {
    category: 'Marvel Cinematic Universe',
    type: 'multi',
    sources: [
      { type: 'movie', id: 1726, chars: ['Tony Stark / Iron Man'] },         // Iron Man
      { type: 'movie', id: 557, chars: ['Peter Parker / Spider-Man', 'Spider-Man / Peter Parker'] }, // Spider-Man
      { type: 'movie', id: 299536, chars: ['Thor', 'Steve Rogers / Captain America', 'Natasha Romanoff / Black Widow', 'Bruce Banner / Hulk'] }, // Infinity War
      { type: 'movie', id: 533535, chars: ['Wade Wilson / Deadpool', 'Deadpool / Wade Wilson'] }, // Deadpool & Wolverine
      { type: 'movie', id: 284054, chars: ["T'Challa / Black Panther"] },     // Black Panther
    ]
  },
  {
    category: 'DC Universe',
    type: 'multi',
    sources: [
      { type: 'movie', id: 155, chars: ['Bruce Wayne / Batman', 'Batman / Bruce Wayne', 'Joker'] },  // Dark Knight
      { type: 'movie', id: 436969, chars: ['Harleen Quinzel / Harley Quinn', 'Harley Quinn'] },       // BoP
      { type: 'movie', id: 209764, chars: ['Kal-El / Clark Kent / Superman', 'Clark Kent / Superman'] }, // Man of Steel (Henry Cavill)
      { type: 'movie', id: 297762, chars: ['Diana Prince / Wonder Woman', 'Diana'] },                 // Wonder Woman
      { type: 'movie', id: 298618, chars: ['Barry Allen / The Flash', 'The Flash'] },                 // The Flash
    ]
  },
  {
    category: 'Star Wars',
    type: 'multi',
    sources: [
      { type: 'movie', id: 11, chars: ['Luke Skywalker', 'Darth Vader', 'Han Solo'] },   // A New Hope
      { type: 'movie', id: 1891, chars: ['Yoda'] },                                        // Empire Strikes Back
      { type: 'movie', id: 140607, chars: ['Rey', 'Kylo Ren'] },                           // Force Awakens
    ]
  },
  {
    category: 'Breaking Bad',
    type: 'tv', id: 1396,
    characters: ['Walter White', 'Jesse Pinkman', 'Saul Goodman']
  },
  {
    category: 'Game of Thrones',
    type: 'tv', id: 1399,
    characters: ['Jon Snow', 'Daenerys Targaryen', 'Tyrion Lannister', 'Arya Stark']
  },
  {
    category: 'One Piece',
    type: 'tv', id: 111110,
    characters: ['Monkey D. Luffy', 'Roronoa Zoro', 'Nami', 'Usopp', 'Sanji']
  },
  {
    category: 'Lucifer',
    type: 'tv', id: 63174,
    characters: ['Lucifer Morningstar', 'Chloe Decker', 'Mazikeen', 'Amenadiel']
  }
];

function matchChar(castChar, wantedList) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const cn = norm(castChar);
  for (const w of wantedList) {
    if (cn.includes(norm(w)) || norm(w).includes(cn)) return w;
  }
  return null;
}

// Deduplicate by keeping only the first match per display name
function dedup(arr) {
  const seen = new Set();
  return arr.filter(a => {
    const k = a.name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function fetchCredits(type, id) {
  const url = type === 'tv'
    ? `${BASE}/tv/${id}/aggregate_credits`
    : `${BASE}/movie/${id}/credits`;
  const res = await axios.get(url, { headers });
  return res.data.cast || [];
}

// Give characters friendly display names
function displayName(matched) {
  const map = {
    'Sergio Marquina': 'The Professor',
    'Tokio': 'Tokyo',
    'Berlín': 'Berlin',
    'Río': 'Rio',
    'Moscú': 'Moscow',
    'Raquel Murillo': 'Lisbon',
    'Tony Stark / Iron Man': 'Iron Man',
    'Peter Parker / Spider-Man': 'Spider-Man',
    'Spider-Man / Peter Parker': 'Spider-Man',
    'Steve Rogers / Captain America': 'Captain America',
    'Natasha Romanoff / Black Widow': 'Black Widow',
    'Bruce Banner / Hulk': 'Hulk',
    'Wade Wilson / Deadpool': 'Deadpool',
    'Deadpool / Wade Wilson': 'Deadpool',
    "T'Challa / Black Panther": 'Black Panther',
    'Bruce Wayne / Batman': 'Batman',
    'Batman / Bruce Wayne': 'Batman',
    'Harleen Quinzel / Harley Quinn': 'Harley Quinn',
    'Kal-El / Clark Kent / Superman': 'Superman',
    'Clark Kent / Superman': 'Superman',
    'Diana Prince / Wonder Woman': 'Wonder Woman',
    'Barry Allen / The Flash': 'The Flash',
    'Monkey D. Luffy': 'Luffy',
    'Roronoa Zoro': 'Zoro',
    'Lucifer Morningstar': 'Lucifer',
    'Chloe Decker': 'Chloe',
    'Mazikeen': 'Maze',
    'Daenerys Targaryen': 'Daenerys',
    'Tyrion Lannister': 'Tyrion',
    'Arya Stark': 'Arya',
  };
  return map[matched] || matched;
}

async function run() {
  const result = [];

  for (const f of FRANCHISES) {
    console.log(`Fetching: ${f.category}...`);
    const avatars = [];

    if (f.type === 'multi') {
      for (const src of f.sources) {
        try {
          const cast = await fetchCredits(src.type, src.id);
          for (const member of cast) {
            const charName = member.character || (member.roles && member.roles[0]?.character);
            if (!charName || !member.profile_path) continue;
            const matched = matchChar(charName, src.chars);
            if (matched) {
              avatars.push({
                id: `${f.category.replace(/\s/g,'')}_${member.id}`,
                name: displayName(matched),
                character: charName,
                actor: member.name || member.original_name,
                path: `https://image.tmdb.org/t/p/w500${member.profile_path}`
              });
            }
          }
        } catch (e) {
          console.error(`  Failed source ${src.type}/${src.id}: ${e.message}`);
        }
      }
    } else {
      try {
        const cast = await fetchCredits(f.type, f.id);
        for (const member of cast) {
          const charName = member.character || (member.roles && member.roles[0]?.character);
          if (!charName || !member.profile_path) continue;
          const matched = matchChar(charName, f.characters);
          if (matched) {
            avatars.push({
              id: `${f.category.replace(/\s/g,'')}_${member.id}`,
              name: displayName(matched),
              character: charName,
              actor: member.name || member.original_name,
              path: `https://image.tmdb.org/t/p/w500${member.profile_path}`
            });
          }
        }
      } catch (e) {
        console.error(`  Failed ${f.type}/${f.id}: ${e.message}`);
      }
    }

    result.push({ category: f.category, avatars: dedup(avatars) });
    console.log(`  → Found ${dedup(avatars).length} characters`);
  }

  console.log('\n=== FINAL OUTPUT ===\n');
  console.log(JSON.stringify(result, null, 2));
}

run();
