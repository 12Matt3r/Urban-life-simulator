import { eventBus } from './eventBus.js';

const cache = new Map();

async function generate(payload={}){
  const key = JSON.stringify(payload);
  if (cache.has(key)) return cache.get(key);
  const text = encodeURIComponent(
    [payload.ambience, payload.locale, payload.characterPose, payload.attire, payload.prop]
    .filter(Boolean).join(' ')
  ) || 'Urban+Life+Sim';
  const url = `https://placehold.co/600x400/2a2a3e/e0e0e0?text=${text}`;
  await new Promise(r=>setTimeout(r,200));
  cache.set(key, url);
  return url;
}

eventBus.subscribe('image.request', async (payload)=>{
  const url = await generate(payload||{});
  eventBus.publish('image.generated', url);
});