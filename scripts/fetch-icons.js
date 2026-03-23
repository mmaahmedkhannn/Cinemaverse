import axios from 'axios';

const API_KEY = "3aaeb90f47e09642571f54452078afc2"; // from .env
const BASE_URL = "https://api.themoviedb.org/3";

const ICONS = [
  "Robert Downey Jr.", "Keanu Reeves", "Margot Robbie", "Cillian Murphy", "Christian Bale",
  "Tom Cruise", "Leonardo DiCaprio", "Heath Ledger", "Scarlett Johansson", "Harrison Ford",
  "Ryan Reynolds", "Chris Hemsworth", "Johnny Depp", "Henry Cavill", "Anya Taylor-Joy",
  "Daniel Radcliffe", "Emilia Clarke", "Zendaya", "Pedro Pascal", "Tom Hardy",
  "Chris Evans", "Tom Hiddleston", "Elizabeth Olsen", "Samuel L. Jackson",
  "Jason Momoa", "Gal Gadot", "Hugh Jackman", "Patrick Stewart", "Ian McKellen", "Elijah Wood"
];

async function run() {
  const results = [];
  for (const name of ICONS) {
    const res = await axios.get(`${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(name)}`);
    if (res.data.results && res.data.results.length > 0) {
      const person = res.data.results[0];
      results.push({
        id: person.id,
        name: person.name,
        profile_path: person.profile_path
      });
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

run();
