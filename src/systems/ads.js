// src/systems/ads.js
export function createAds({ provider } = {}) {
  function init() { /* wire provider if/when needed */ }
  function show(slot) { /* provider?.show(slot) */ }
  function hide(slot) { /* provider?.hide(slot) */ }
  return { init, show, hide };
}