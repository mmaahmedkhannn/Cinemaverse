import axios from 'axios';
import fs from 'fs';

const chars = [
  // Stranger Things
  { wiki: 'strangerthings.fandom.com', name: 'Eleven', category: 'Stranger Things' },
  { wiki: 'strangerthings.fandom.com', name: 'Mike_Wheeler', category: 'Stranger Things' },
  { wiki: 'strangerthings.fandom.com', name: 'Dustin_Henderson', category: 'Stranger Things' },
  { wiki: 'strangerthings.fandom.com', name: 'Lucas_Sinclair', category: 'Stranger Things' },
  { wiki: 'strangerthings.fandom.com', name: 'Will_Byers', category: 'Stranger Things' },
  { wiki: 'strangerthings.fandom.com', name: 'Max_Mayfield', category: 'Stranger Things' },
  // Money Heist (es.moneyheist.fandom.com ?) - English is moneyheist.fandom.com
  { wiki: 'moneyheist.fandom.com', name: 'Sergio_Marquina', category: 'Money Heist' },
  { wiki: 'moneyheist.fandom.com', name: 'Silene_Oliveira', category: 'Money Heist' },
  { wiki: 'moneyheist.fandom.com', name: 'Andrés_de_Fonollosa', category: 'Money Heist' },
  { wiki: 'moneyheist.fandom.com', name: 'Ágata_Jiménez', category: 'Money Heist' },
  // Marvel
  { wiki: 'marvelcinematicuniverse.fandom.com', name: 'Tony_Stark', category: 'Marvel' },
  { wiki: 'marvelcinematicuniverse.fandom.com', name: 'Steve_Rogers', category: 'Marvel' },
  { wiki: 'marvelcinematicuniverse.fandom.com', name: 'Thor_Odinson', category: 'Marvel' },
  { wiki: 'marvelcinematicuniverse.fandom.com', name: 'Natasha_Romanoff', category: 'Marvel' },
  { wiki: 'marvelcinematicuniverse.fandom.com', name: 'Peter_Parker', category: 'Marvel' },
  // DC
  { wiki: 'dcextendeduniverse.fandom.com', name: 'Bruce_Wayne_(DC_Extended_Universe)', category: 'DC' },
  { wiki: 'dcextendeduniverse.fandom.com', name: 'Kal-El_(DC_Extended_Universe)', category: 'DC' },
  { wiki: 'dcextendeduniverse.fandom.com', name: 'Harley_Quinn_(DC_Extended_Universe)', category: 'DC' },
  { wiki: 'dcextendeduniverse.fandom.com', name: 'Diana_of_Themyscira_(DC_Extended_Universe)', category: 'DC' },
  // Star Wars
  { wiki: 'starwars.fandom.com', name: 'Anakin_Skywalker', category: 'Star Wars' },
  { wiki: 'starwars.fandom.com', name: 'Luke_Skywalker', category: 'Star Wars' },
  { wiki: 'starwars.fandom.com', name: 'Obi-Wan_Kenobi', category: 'Star Wars' },
  { wiki: 'starwars.fandom.com', name: 'Din_Djarin', category: 'Star Wars' },
  { wiki: 'starwars.fandom.com', name: 'Grogu', category: 'Star Wars' }
];

async function run() {
  const result = {};

  for (const c of chars) {
    try {
      const url = `https://${c.wiki}/api.php?action=query&titles=${encodeURIComponent(c.name)}&prop=pageimages&format=json&pithumbsize=600`;
      const res = await axios.get(url);
      const pages = res.data.query.pages;
      const firstPage = Object.values(pages)[0];
      
      if (firstPage.thumbnail) {
        if (!result[c.category]) result[c.category] = [];
        result[c.category].push({
          id: c.name,
          name: c.name.replace(/_/g, ' ').split(' (')[0],
          path: firstPage.thumbnail.source
        });
      } else {
        console.error(`No image found for ${c.name}`);
      }
    } catch (e) {
      console.error(`Failed ${c.name}`);
    }
  }
  
  const finalArray = Object.keys(result).map(key => ({
    category: key,
    avatars: result[key]
  }));
  
  fs.writeFileSync('fandom_avatars.json', JSON.stringify(finalArray, null, 2));
  console.log("Written to fandom_avatars.json");
}

run();
