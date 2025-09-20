import { eventBus } from './eventBus.js';

const stations = new Map();
const tracks = new Map();

export function getStations(){ return Array.from(stations.values()); }
export function getTrack(id){ return tracks.get(id); }

export function registerStation(data){
  const id = (data.name||`Station ${stations.size+1}`).toLowerCase().replace(/[^a-z0-9]+/g,'_');
  const st = { id, name: data.name, moods: data.moods||data.moodTags||[], trackIds: [] };
  stations.set(id, st);
  eventBus.publish('radio.store.updated', { kind:'station', station: st });
  return st;
}

export function addTrack(data){
  const id = `track_${tracks.size+1}`;
  const t = { id, votes: 0, ...data };
  tracks.set(id, t);
  if (t.stationId && stations.has(t.stationId)) stations.get(t.stationId).trackIds.push(id);
  eventBus.publish('radio.store.updated', { kind:'track', track: t });
  return t;
}

// Defaults
registerStation({ name:'Vantage Lo-Fi', moods:['lofi','calm','melancholy'] });
registerStation({ name:'Heatwave', moods:['trap','aggressive','tense'] });
registerStation({ name:'Resonance', moods:['ambient','calm','dystopian'] });
registerStation({ name:'City Broadcast', moods:['news','tense','informational'] });
registerStation({ name:'Serenity', moods:['classical','calm','uplifting'] });