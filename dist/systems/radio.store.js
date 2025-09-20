// systems/radio.store.js
import { eventBus } from './eventBus.js';

const stations = new Map();
const tracks = new Map();

export function getStations() { return Array.from(stations.values()); }
export function getTrack(id) { return tracks.get(id); }

export function registerStation(stationData) {
  const id = stationData.name.toLowerCase().replace(/\s/g, '_');
  const newStation = Object.assign({ id: id, trackIds: [] }, stationData);
  stations.set(id, newStation);
  return newStation;
}
export function addTrack(trackData) {
  const id = 'track_' + (tracks.size + 1);
  const newTrack = Object.assign({ id: id, votes: 0 }, trackData);
  tracks.set(id, newTrack);
  if (trackData.stationId && stations.has(trackData.stationId)) {
    stations.get(trackData.stationId).trackIds.push(id);
  }
  eventBus.publish('radio.store.updated');
  return newTrack;
}

/** Seed fallback stations (used if DB stations are not loaded) */
const fallback = [
  { name: 'Lo-Fi Lounge',            genre: 'Lo-Fi',               moodTags: ['calm','melancholy'] },
  { name: 'Reggaeton Vibes',         genre: 'Reggaeton',           moodTags: ['party','energetic'] },
  { name: 'Dubstep Arena',           genre: 'Dubstep',             moodTags: ['aggressive','bass'] },
  { name: 'House Nation',            genre: 'House',               moodTags: ['dance','uplifting'] },
  { name: 'Metal Mayhem',            genre: 'Metal',               moodTags: ['heavy','angry'] },
  { name: 'Country Roads',           genre: 'Country',             moodTags: ['nostalgic','chill'] },
  { name: 'Hip-Hop Central',         genre: 'Hip-Hop',             moodTags: ['street','flow'] },
  { name: 'Trippy Frequencies',      genre: 'Psychedelic',         moodTags: ['weird','colorful'] },
  { name: 'Slushwave FM',            genre: 'Slushwave/Vaporwave', moodTags: ['dreamy','nostalgic'] },
  { name: 'Mix Vault',               genre: 'Mixes',               moodTags: ['varied','longform'] },
  { name: 'NCPD Public Broadcast',   genre: 'News',                moodTags: ['tense','informational'] },
  { name: 'Serenity Classical',      genre: 'Classical',           moodTags: ['calm','uplifting'] },
];

fallback.forEach(registerStation);