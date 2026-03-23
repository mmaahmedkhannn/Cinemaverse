import axios from 'axios';

import fs from 'fs';
const env = fs.readFileSync('.env', 'utf-8');
const tokenMatch = env.split('\n').find(l => l.startsWith('VITE_TMDB_READ_TOKEN='));
const token = tokenMatch ? tokenMatch.split('=')[1].replace(/"/g, '').trim() : '';
const BASE_URL = "https://api.themoviedb.org/3";

const GROUPS = [
  { category: "Stranger Things", actors: ["Millie Bobby Brown", "Finn Wolfhard", "Gaten Matarazzo", "Caleb McLaughlin", "Noah Schnapp", "Sadie Sink"] },
  { category: "Money Heist", actors: ["Úrsula Corberó", "Álvaro Morte", "Pedro Alonso", "Alba Flores", "Miguel Herrán", "Jaime Lorente"] },
  { category: "One Piece", actors: ["Iñaki Godoy", "Mackenyu", "Emily Rudd", "Jacob Romero Gibson", "Taz Skylar"] },
  { category: "Marvel Universe", actors: ["Robert Downey Jr.", "Chris Evans", "Chris Hemsworth", "Scarlett Johansson", "Tom Hiddleston", "Tom Holland"] },
  { category: "DC Universe", actors: ["Christian Bale", "Heath Ledger", "Henry Cavill", "Margot Robbie", "Jason Momoa", "Gal Gadot"] },
  { category: "Iconic Cinema", actors: ["Keanu Reeves", "Cillian Murphy", "Johnny Depp", "Leonardo DiCaprio", "Harrison Ford", "Tom Cruise"] }
];

async function run() {
  const result = [];
  for (const group of GROUPS) {
    const groupData = { category: group.category, avatars: [] };
    for (const name of group.actors) {
      try {
         const res = await axios.get(`${BASE_URL}/search/person?query=${encodeURIComponent(name)}`, {
           headers: { Authorization: `Bearer ${token}` }
         });
         if (res.data.results && res.data.results.length > 0) {
           const person = res.data.results[0];
           groupData.avatars.push({
             id: person.id.toString(),
             name: person.name,
             path: person.profile_path
           });
         }
      } catch (e) {
         console.error("Failed for", name);
      }
    }
    result.push(groupData);
  }
  console.log(JSON.stringify(result, null, 2));
}

run();
