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
      { id: 1771, phase: 'Phase 1' }, // Captain America: The First Avenger
      { id: 19995, phase: 'Phase 1' }, // Iron Man
      { id: 1726, phase: 'Phase 1' }, // Iron Man 2
      { id: 10138, phase: 'Phase 1' }, // Iron Man 2 (Actually 10138)
      { id: 100402, phase: 'Phase 2' }, // Winter Soldier
      { id: 24428, phase: 'Phase 1' }, // Avengers
      { id: 118340, phase: 'Phase 2' }, // Guardians 1
      { id: 99861, phase: 'Phase 2' }, // Age of Ultron
      { id: 271110, phase: 'Phase 3' }, // Civil War
      { id: 299536, phase: 'Phase 3' }, // Infinity War
      { id: 299534, phase: 'Phase 3' }, // Endgame
      { id: 85271, mediaType: 'tv', phase: 'Phase 4' }, // WandaVision
      { id: 84958, mediaType: 'tv', phase: 'Phase 4' }, // Loki
      { id: 88329, mediaType: 'tv', phase: 'Phase 4' }, // Hawkeye
      { id: 453395, phase: 'Phase 4' }, // Doctor Strange Multiverse
      { id: 505642, phase: 'Phase 4' }, // Wakanda Forever
      { id: 640146, phase: 'Phase 5' }, // Quantumania
      { id: 447365, phase: 'Phase 5' }, // Guardians 3
    ]
  },
  {
    id: 'dc',
    name: 'DC Extended Universe',
    description: 'Gods among men. The epic cinematic vision of DC Comics.',
    entries: [
      { id: 49521, phase: 'Dawn of Justice' }, // Man of Steel
      { id: 209112, phase: 'Dawn of Justice' }, // Batman v Superman
      { id: 297762, phase: 'Justice League Era' }, // Wonder Woman
      { id: 141052, phase: 'Justice League Era' }, // Justice League
      { id: 297802, phase: 'Expansion' }, // Aquaman
      { id: 287947, phase: 'Expansion' }, // Shazam
      { id: 799566, phase: 'Multiverse' }, // The Flash
      { id: 110492, mediaType: 'tv', phase: 'Multiverse' }, // Peacemaker
    ]
  },
  {
    id: 'starwars',
    name: 'Star Wars Saga',
    description: 'A long time ago in a galaxy far, far away...',
    entries: [
      { id: 1893, phase: 'Prequel Trilogy' }, // Phantom Menace
      { id: 1894, phase: 'Prequel Trilogy' }, // Attack of the Clones
      { id: 1895, phase: 'Prequel Trilogy' }, // Revenge of the Sith
      { id: 83866, mediaType: 'tv', phase: 'Age of Rebellion' }, // Andor
      { id: 11, phase: 'Original Trilogy' }, // A New Hope
      { id: 1891, phase: 'Original Trilogy' }, // Empire Strikes Back
      { id: 1892, phase: 'Original Trilogy' }, // Return of the Jedi
      { id: 82856, mediaType: 'tv', phase: 'New Republic Era' }, // Mandalorian
      { id: 140607, phase: 'Sequel Trilogy' }, // Force Awakens
      { id: 181808, phase: 'Sequel Trilogy' }, // Last Jedi
      { id: 181812, phase: 'Sequel Trilogy' }, // Rise of Skywalker
    ]
  },
  {
    id: 'harrypotter',
    name: 'Wizarding World',
    description: 'The magic lives on. Discover the cinematic universe of Harry Potter.',
    entries: [
      { id: 671 }, // Sorcerer's Stone
      { id: 672 }, // Chamber of Secrets
      { id: 673 }, // Prisoner of Azkaban
      { id: 674 }, // Goblet of Fire
      { id: 675 }, // Order of the Phoenix
      { id: 767 }, // Half-Blood Prince
      { id: 12444 }, // Deathly Hallows Part 1
      { id: 12445 }, // Deathly Hallows Part 2
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
