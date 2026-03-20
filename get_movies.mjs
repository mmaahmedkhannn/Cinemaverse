import fs from 'fs';

const API_KEY = '68ed11cee61f2053afa2d112245c0951'; // User provided this key earlier

const searches = [
  ['Star Wars A New Hope', 'The Empire Strikes Back'],
  ['The Fellowship of the Ring', 'The Two Towers'],
  ['Back to the Future', 'Predator'],
  ['Harry Potter and the Philosophers Stone', 'Harry Potter and the Chamber of Secrets'],
  ['Terminator 2 Judgment Day', 'The Terminator'],
  ['Leon The Professional', 'Se7en'],
  ['Frozen', 'Spider-Man Into the Spider-Verse'],
  ['Parasite', 'Spider-Man Homecoming'],
  ['Barbie', 'Guardians of the Galaxy Vol 3'],
  ['Cars', 'WALL E'],
  ['Batman Begins', 'Batman'],
  ['Gladiator', 'Braveheart'],
  ['Blade Runner', 'Alien'],
  ['American Beauty', 'The Silence of the Lambs'],
  ['Citizen Kane', 'Casablanca'],
  ['The Big Lebowski', 'Reservoir Dogs'],
  ['Charlie and the Chocolate Factory', 'Alice in Wonderland'],
  ['Django Unchained', 'Inglourious Basterds'],
  ['The Avengers', 'Iron Man'],
  ['The Hunger Games', 'The Hunger Games Catching Fire'],
  ['Up', 'Toy Story 3'],
  ['The Hangover', 'Superbad'],
  ['xXx', 'The Fast and the Furious'],
  ['Pirates of the Caribbean The Curse of the Black Pearl', 'Pirates of the Caribbean Dead Mans Chest'],
  ['Monsters Inc', 'Finding Nemo'],
  ['The Bourne Identity', 'The Bourne Supremacy'],
  ['12 Angry Men', 'To Kill a Mockingbird'],
  ['Whiplash', 'Black Swan'],
  ['La La Land', 'A Star Is Born'],
  ['Everything Everywhere All at Once', 'Dune']
];

async function run() {
  const results = [];
  for (const [m1, m2] of searches) {
    const res1 = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(m1)}`).then(r => r.json());
    const res2 = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(m2)}`).then(r => r.json());
    
    if (res1.results?.[0] && res2.results?.[0]) {
      results.push({
        movie1Id: res1.results[0].id,
        movie2Id: res2.results[0].id,
        movie1Title: res1.results[0].title,
        movie2Title: res2.results[0].title,
        category: '🔥 Weekly Rotation'
      });
    }
  }
  fs.writeFileSync('C:/Users/Jin Sakai/Desktop/Movies Site/src/lib/additional_battles.json', JSON.stringify(results, null, 2));
  console.log('Saved ' + results.length + ' additional battles');
}

run();
