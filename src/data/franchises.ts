/**
 * franchises.ts
 *
 * Static mapping of cinematic franchises and their chronologies. Maps internal definitions
 * to actual TMDB IDs to allow dynamic fetching on the Timeline/Universe pages without
 * needing a dedicated backend collection.
 */
export interface FranchiseEntry {
  id: number;
  mediaType?: 'movie' | 'tv'; // defaults to 'movie'
  title?: string; // Optional custom title override
  phase?: string; // Optional separators (e.g. "Phase 1")
}

export interface Franchise {
  id: string;
  name: string;
  description: string;
  entries: FranchiseEntry[];
}

export const FRANCHISES: Franchise[] = [
  {
    id: 'mcu',
    name: 'Marvel Cinematic Universe',
    description: "The monumental interconnected saga of Earth's mightiest heroes.",
    entries: [
      // Phase 1 (2008–2012)
      { id: 1726, phase: 'Phase 1' }, // Iron Man (2008)
      { id: 1724, phase: 'Phase 1' }, // The Incredible Hulk (2008)
      { id: 10138, phase: 'Phase 1' }, // Iron Man 2 (2010)
      { id: 10195, phase: 'Phase 1' }, // Thor (2011)
      { id: 1771, phase: 'Phase 1' }, // Captain America: The First Avenger (2011)
      { id: 24428, phase: 'Phase 1' }, // The Avengers (2012)
      // Phase 2 (2013–2015)
      { id: 68721, phase: 'Phase 2' }, // Iron Man 3 (2013)
      { id: 76338, phase: 'Phase 2' }, // Thor: The Dark World (2013)
      { id: 100402, phase: 'Phase 2' }, // Captain America: The Winter Soldier (2014)
      { id: 118340, phase: 'Phase 2' }, // Guardians of the Galaxy (2014)
      { id: 99861, phase: 'Phase 2' }, // Avengers: Age of Ultron (2015)
      { id: 102899, phase: 'Phase 2' }, // Ant-Man (2015)
      // Phase 3 (2016–2019)
      { id: 271110, phase: 'Phase 3' }, // Captain America: Civil War (2016)
      { id: 284052, phase: 'Phase 3' }, // Doctor Strange (2016)
      { id: 283995, phase: 'Phase 3' }, // Guardians of the Galaxy Vol. 2 (2017)
      { id: 315635, phase: 'Phase 3' }, // Spider-Man: Homecoming (2017)
      { id: 284053, phase: 'Phase 3' }, // Thor: Ragnarok (2017)
      { id: 284054, phase: 'Phase 3' }, // Black Panther (2018)
      { id: 299536, phase: 'Phase 3' }, // Avengers: Infinity War (2018)
      { id: 363088, phase: 'Phase 3' }, // Ant-Man and the Wasp (2018)
      { id: 299537, phase: 'Phase 3' }, // Captain Marvel (2019)
      { id: 299534, phase: 'Phase 3' }, // Avengers: Endgame (2019)
      { id: 429617, phase: 'Phase 3' }, // Spider-Man: Far From Home (2019)
      // Phase 4 (2021–2022)
      { id: 85271, mediaType: 'tv', phase: 'Phase 4' }, // WandaVision (2021)
      { id: 497698, phase: 'Phase 4' }, // Black Widow (2021)
      { id: 566525, phase: 'Phase 4' }, // Shang-Chi and the Legend of the Ten Rings (2021)
      { id: 524434, phase: 'Phase 4' }, // Eternals (2021)
      { id: 84958, mediaType: 'tv', phase: 'Phase 4' }, // Loki (2021)
      { id: 88329, mediaType: 'tv', phase: 'Phase 4' }, // Hawkeye (2021)
      { id: 634649, phase: 'Phase 4' }, // Spider-Man: No Way Home (2021)
      { id: 453395, phase: 'Phase 4' }, // Doctor Strange in the Multiverse of Madness (2022)
      { id: 616037, phase: 'Phase 4' }, // Thor: Love and Thunder (2022)
      { id: 505642, phase: 'Phase 4' }, // Black Panther: Wakanda Forever (2022)
      // Phase 5 (2023–2025)
      { id: 640146, phase: 'Phase 5' }, // Ant-Man and the Wasp: Quantumania (2023)
      { id: 447365, phase: 'Phase 5' }, // Guardians of the Galaxy Vol. 3 (2023)
      { id: 609681, phase: 'Phase 5' }, // The Marvels (2023)
      { id: 533535, phase: 'Phase 5' }, // Deadpool & Wolverine (2024)
      { id: 822119, phase: 'Phase 5' }, // Captain America: Brave New World (2025)
      { id: 986056, phase: 'Phase 5' }, // Thunderbolts* (2025)
      { id: 617126, phase: 'Phase 5' }, // The Fantastic Four: First Steps (2025)
    ]
  },
  {
    id: 'dc',
    name: 'DC Extended Universe',
    description: 'Gods among men. The epic cinematic vision of DC Comics.',
    entries: [
      // Dawn of Justice (2013–2016)
      { id: 49521, phase: 'Dawn of Justice' }, // Man of Steel (2013)
      { id: 209112, phase: 'Dawn of Justice' }, // Batman v Superman: Dawn of Justice (2016)
      { id: 297761, phase: 'Dawn of Justice' }, // Suicide Squad (2016)
      // Justice League Era (2017–2018)
      { id: 297762, phase: 'Justice League Era' }, // Wonder Woman (2017)
      { id: 141052, phase: 'Justice League Era' }, // Justice League (2017)
      { id: 297802, phase: 'Justice League Era' }, // Aquaman (2018)
      // Expansion (2019–2021)
      { id: 287947, phase: 'Expansion' }, // Shazam! (2019)
      { id: 495764, phase: 'Expansion' }, // Birds of Prey (2020)
      { id: 464052, phase: 'Expansion' }, // Wonder Woman 1984 (2020)
      { id: 436969, phase: 'Expansion' }, // The Suicide Squad (2021)
      { id: 110492, mediaType: 'tv', phase: 'Expansion' }, // Peacemaker (2022)
      // Multiverse (2022–2023)
      { id: 436270, phase: 'Multiverse' }, // Black Adam (2022)
      { id: 594767, phase: 'Multiverse' }, // Shazam! Fury of the Gods (2023)
      { id: 799566, phase: 'Multiverse' }, // The Flash (2023)
      { id: 565770, phase: 'Multiverse' }, // Blue Beetle (2023)
      { id: 572802, phase: 'Multiverse' }, // Aquaman and the Lost Kingdom (2023)
      // DCU — Chapter 1 (2025+)
      { id: 1061474, phase: 'DCU' }, // Superman (2025)
    ]
  },
  {
    id: 'starwars',
    name: 'Star Wars Saga',
    description: 'A long time ago in a galaxy far, far away...',
    entries: [
      // Prequel Trilogy (1999–2005)
      { id: 1893, phase: 'Prequel Trilogy' }, // Episode I — The Phantom Menace (1999)
      { id: 1894, phase: 'Prequel Trilogy' }, // Episode II — Attack of the Clones (2002)
      { id: 1895, phase: 'Prequel Trilogy' }, // Episode III — Revenge of the Sith (2005)
      // Original Trilogy (1977–1983)
      { id: 11, phase: 'Original Trilogy' }, // Episode IV — A New Hope (1977)
      { id: 1891, phase: 'Original Trilogy' }, // Episode V — The Empire Strikes Back (1980)
      { id: 1892, phase: 'Original Trilogy' }, // Episode VI — Return of the Jedi (1983)
      // Anthology Films
      { id: 330459, phase: 'Anthology' }, // Rogue One: A Star Wars Story (2016)
      { id: 348350, phase: 'Anthology' }, // Solo: A Star Wars Story (2018)
      // Sequel Trilogy (2015–2019)
      { id: 140607, phase: 'Sequel Trilogy' }, // Episode VII — The Force Awakens (2015)
      { id: 181808, phase: 'Sequel Trilogy' }, // Episode VIII — The Last Jedi (2017)
      { id: 181812, phase: 'Sequel Trilogy' }, // Episode IX — The Rise of Skywalker (2019)
      // TV Series
      { id: 82856, mediaType: 'tv', phase: 'New Republic Era' }, // The Mandalorian (2019–2023)
      { id: 83866, mediaType: 'tv', phase: 'Age of Rebellion' }, // Andor (2022–2025)
    ]
  },
  {
    id: 'harrypotter',
    name: 'Wizarding World',
    description: 'The magic lives on. Discover the cinematic universe of Harry Potter.',
    entries: [
      // Harry Potter (2001–2011)
      { id: 671, phase: 'Harry Potter' }, // Harry Potter and the Philosopher's Stone (2001)
      { id: 672, phase: 'Harry Potter' }, // Harry Potter and the Chamber of Secrets (2002)
      { id: 673, phase: 'Harry Potter' }, // Harry Potter and the Prisoner of Azkaban (2004)
      { id: 674, phase: 'Harry Potter' }, // Harry Potter and the Goblet of Fire (2005)
      { id: 675, phase: 'Harry Potter' }, // Harry Potter and the Order of the Phoenix (2007)
      { id: 767, phase: 'Harry Potter' }, // Harry Potter and the Half-Blood Prince (2009)
      { id: 12444, phase: 'Harry Potter' }, // Harry Potter and the Deathly Hallows — Part 1 (2010)
      { id: 12445, phase: 'Harry Potter' }, // Harry Potter and the Deathly Hallows — Part 2 (2011)
      // Fantastic Beasts (2016–2022)
      { id: 259316, phase: 'Fantastic Beasts' }, // Fantastic Beasts and Where to Find Them (2016)
      { id: 338952, phase: 'Fantastic Beasts' }, // Fantastic Beasts: The Crimes of Grindelwald (2018)
      { id: 338953, phase: 'Fantastic Beasts' }, // Fantastic Beasts: The Secrets of Dumbledore (2022)
    ]
  },
  {
    id: 'lotr',
    name: 'Middle-earth',
    description: "One ring to rule them all. Peter Jackson's masterwork.",
    entries: [
      { id: 120, phase: 'The Lord of the Rings' }, // Fellowship
      { id: 121, phase: 'The Lord of the Rings' }, // Two Towers
      { id: 122, phase: 'The Lord of the Rings' }, // Return of the King
      { id: 49051, phase: 'The Hobbit' }, // Unexpected Journey
      { id: 57158, phase: 'The Hobbit' }, // Desolation of Smaug
      { id: 122917, phase: 'The Hobbit' }, // Battle of the Five Armies
    ]
  },
  {
    id: 'johnwick',
    name: 'John Wick',
    description: "Yeah, I'm thinking I'm back. The modern standard of action.",
    entries: [
      { id: 245891 }, // JW1
      { id: 324552 }, // JW2
      { id: 458156 }, // JW3
      { id: 603692 }, // JW4
    ]
  },
  {
    id: 'fast',
    name: 'Fast & Furious',
    description: "It's not about cars. It's about family.",
    entries: [
      { id: 9799 }, // TFATF
      { id: 584 }, // 2 Fast
      { id: 9615 }, // Tokyo Drift
      { id: 13804 }, // Fast & Furious (4)
      { id: 51497 }, // Fast Five
      { id: 82992 }, // Fast & Furious 6
      { id: 168259 }, // Furious 7
      { id: 337339 }, // Fate of the Furious
      { id: 385128 }, // F9
      { id: 385687 }, // Fast X
    ]
  },
  {
    id: 'missionimpossible',
    name: 'Mission: Impossible',
    description: 'Your mission, should you choose to accept it...',
    entries: [
      { id: 954 }, // M:I
      { id: 955 }, // M:I-2
      { id: 956 }, // M:I III
      { id: 56292 }, // Ghost Protocol
      { id: 177677 }, // Rogue Nation
      { id: 353081 }, // Fallout
      { id: 575264 }, // Dead Reckoning
    ]
  },
  {
    id: 'jurassic',
    name: 'Jurassic Park',
    description: 'Life finds a way. The cinematic dinosaur revolution.',
    entries: [
      { id: 329, phase: 'Jurassic Park' }, // JP
      { id: 330, phase: 'Jurassic Park' }, // Lost World
      { id: 331, phase: 'Jurassic Park' }, // JP3
      { id: 135397, phase: 'Jurassic World' }, // Jurassic World
      { id: 351286, phase: 'Jurassic World' }, // Fallen Kingdom
      { id: 507086, phase: 'Jurassic World' }, // Dominion
    ]
  },
  {
    id: 'avatar',
    name: 'Avatar',
    description: "Return to Pandora. James Cameron's visual masterpiece.",
    entries: [
      { id: 19995 }, // Avatar
      { id: 76600 }, // Way of Water
    ]
  },
  {
    id: 'alien',
    name: 'Alien',
    description: 'In space no one can hear you scream.',
    entries: [
      { id: 61979, phase: 'Prequels' }, // Prometheus
      { id: 126889, phase: 'Prequels' }, // Covenant
      { id: 348, phase: 'Originals' }, // Alien
      { id: 679, phase: 'Originals' }, // Aliens
      { id: 8077, phase: 'Originals' }, // Alien 3
      { id: 8078, phase: 'Originals' }, // Resurrection
      { id: 945961, phase: 'Romulus' }, // Alien Romulus
    ]
  },
  {
    id: 'indianajones',
    name: 'Indiana Jones',
    description: 'The greatest adventurer of all time.',
    entries: [
      { id: 87 }, // Temple of Doom (prequel)
      { id: 85 }, // Raiders
      { id: 89 }, // Last Crusade
      { id: 217 }, // Crystal Skull
      { id: 335977 }, // Dial of Destiny
    ]
  },
  {
    id: 'monsterverse',
    name: 'MonsterVerse',
    description: 'Let them fight. The dawn of the titans.',
    entries: [
      { id: 290098, phase: 'Origins' }, // Kong: Skull Island
      { id: 124905, phase: 'Rise of the King' }, // Godzilla 2014
      { id: 373571, phase: 'Rise of the King' }, // Godzilla King of Monsters
      { id: 399566, phase: 'The Titans Clash' }, // GvK
      { id: 823464, phase: 'The Titans Clash' }, // GxK
    ]
  },
  // ── Standalone Series Timelines ──
  {
    id: 'breakingbad',
    name: 'Breaking Bad Universe',
    description: 'Say my name. The complete Heisenberg saga — from Saul to Walter to Jesse.',
    entries: [
      { id: 60059, mediaType: 'tv', title: 'Better Call Saul', phase: 'Prequel' }, // Better Call Saul
      { id: 1396, mediaType: 'tv', title: 'Breaking Bad', phase: 'Main Series' }, // Breaking Bad
      { id: 559969, mediaType: 'movie', title: 'El Camino: A Breaking Bad Movie', phase: 'Sequel' }, // El Camino
    ]
  },
  {
    id: 'walkingdead',
    name: 'The Walking Dead Universe',
    description: "Don't look back. The complete zombie apocalypse saga.",
    entries: [
      { id: 1402, mediaType: 'tv', title: 'The Walking Dead', phase: 'Main Series' }, // TWD
      { id: 62286, mediaType: 'tv', title: 'Fear the Walking Dead', phase: 'Spinoff' }, // FTWD
      { id: 94305, mediaType: 'tv', title: 'The Walking Dead: World Beyond', phase: 'Spinoff' }, // World Beyond
      { id: 131929, mediaType: 'tv', title: 'Tales of the Walking Dead', phase: 'Anthology' }, // Tales
      { id: 203601, mediaType: 'tv', title: 'The Walking Dead: Dead City', phase: 'Legacy' }, // Dead City
      { id: 194583, mediaType: 'tv', title: 'The Walking Dead: Daryl Dixon', phase: 'Legacy' }, // Daryl Dixon
      { id: 206586, mediaType: 'tv', title: 'The Ones Who Live', phase: 'Legacy' }, // Rick & Michonne
    ]
  },
  {
    id: 'gameofthrones',
    name: 'Game of Thrones Universe',
    description: 'When you play the game of thrones, you win or you die.',
    entries: [
      { id: 1399, mediaType: 'tv', title: 'Game of Thrones', phase: 'Original Series' }, // GoT
      { id: 94997, mediaType: 'tv', title: 'House of the Dragon', phase: 'Prequel' }, // HotD
    ]
  },
  {
    id: 'yellowstone',
    name: 'Yellowstone Universe',
    description: "It's the one thing we have that's worth fighting for. The Dutton saga.",
    entries: [
      { id: 130542, mediaType: 'tv', title: '1883', phase: 'Origins' }, // 1883
      { id: 157066, mediaType: 'tv', title: '1923', phase: 'Origins' }, // 1923
      { id: 73586, mediaType: 'tv', title: 'Yellowstone', phase: 'Modern Era' }, // Yellowstone
    ]
  }
];
