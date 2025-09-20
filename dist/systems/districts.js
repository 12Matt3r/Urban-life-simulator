// systems/districts.js
import { createRNG } from './rng.js';

const DEFAULTS = [
  'Greyline District', 'Hearthside', 'Glass Wharf', 'Old Freight', 'High Court',
  'South Loop', 'Railyard Flats', 'Canal Row', 'North Pier', 'Verdant Steps'
];

export function listDistricts() {
  return DEFAULTS.slice();
}

export function isValidDistrict(name) {
  return typeof name === 'string' && name.trim().length > 0;
}

/**
 * Suggest a next district based on role tags and current one.
 * Very simple heuristic: bias nightlife → wharf/loop, law → high court, art/music → glass wharf, etc.
 */
export function suggestNextDistrict(current, roleTags = [], seed = Date.now()) {
  const rng = createRNG(seed);
  const tags = new Set(roleTags.map(s => String(s).toLowerCase()));
  let pool = DEFAULTS.filter(d => d !== current);

  const boost = [];
  if (hasAny(tags, ['dj','nightlife','promoter','club','gig'])) boost.push('Glass Wharf', 'South Loop', 'North Pier');
  if (hasAny(tags, ['law','lawyer','court','defender']))       boost.push('High Court');
  if (hasAny(tags, ['gang','crew','hustle','smuggler']))       boost.push('Old Freight', 'Railyard Flats');
  if (hasAny(tags, ['chef','food','stall']))                   boost.push('Canal Row');
  if (hasAny(tags, ['skate','bmx','street']))                  boost.push('Greyline District', 'Verdant Steps');

  if (boost.length) pool = uniq(pool.concat(boost).concat(boost)); // duplicate boosts for weight
  return rng.pick(pool.length ? pool : DEFAULTS);
}

function hasAny(tags, list) {
  return list.some(x => tags.has(x));
}
function uniq(arr){ return Array.from(new Set(arr)); }