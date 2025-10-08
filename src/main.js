// src/main.js
import { createAssetManager } from './systems/asset_manager.js';
import { createAudio } from './systems/audio.js';
import { createSceneManager } from './systems/scene_manager.js';
import { createNarrative } from './systems/narrative.js';
import { createGameManager } from './systems/game.js';
import { createHUD } from './ui/hud.js';
import { createRadio } from './ui/radio.js';
import { createShop } from './ui/shop.js';
import { createCredits } from './ui/credits.js';

const trace = new URLSearchParams(location.search).get('trace') === '1';

function createBus() {
  const map = new Map();
  return {
    on: (type, fn) => {
      const handlers = map.get(type) || new Set();
      handlers.add(fn);
      map.set(type, handlers);
      return () => map.get(type)?.delete(fn);
    },
    emit: (type, payload) => {
      map.get(type)?.forEach(fn => {
        try { fn(payload); } catch (e) { console.error(e); }
      });
    },
    clear: () => map.clear(),
  };
}

async function main() {
  // 1. Create the core event bus and asset manager
  const bus = createBus();
  const assetManager = await createAssetManager('/src/assets.json');
  const assets = assetManager.getRawManifest();

  // 2. Initialize core systems
  const audio = createAudio({ volume: 0.8 });
  const sceneManager = createSceneManager();
  sceneManager.add('menu', () => ({ enter(){ bus.emit('game:scene_change', 'menu'); }, update(){}, render(){} }));
  sceneManager.add('game', () => ({ enter(){ bus.emit('game:scene_change', 'game'); }, update(){}, render(){} }));

  const iframe = document.getElementById('narrative-engine-iframe');
  const narrative = createNarrative({ target: iframe?.contentWindow, bus, trace });
  narrative.attach();
  narrative.init({ userId: 'ANON' });

  // 3. Create the central game manager
  const gameManager = createGameManager({ bus, sceneManager, narrative });

  // 4. Initialize UI Components with all dependencies
  const ui = {
    hud: createHUD(document.body, { bus, assetManager, initialStats: gameManager.getPlayerState() }),
    shop: createShop(document.body, { gameManager, gameAudio: audio }),
    credits: createCredits(document.body, assets.credits),
    radio: createRadio(document.getElementById('radio-container'), (assets.audio.stations || []).reduce((acc, s) => {
      acc[s.id] = { ...s, tracks: s.urls.map(url => ({ url, title: new URL(url).pathname.split('/').pop() })) };
      return acc;
    }, {})),
  };

  // 5. Wire up global event listeners
  bus.on('audio:resume', () => audio.resume());
  window.addEventListener('pointerdown', () => bus.emit('audio:resume'), { once: true });
  window.addEventListener('keydown', () => bus.emit('audio:resume'), { once: true });

  // 6. Start the game
  gameManager.start();
  sceneManager.go('menu');

  // 7. Start the main game loop
  let last = performance.now();
  function loop(ts) {
    const dt = (ts - last) / 1000;
    last = ts;
    gameManager.tick(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // 8. Expose for debugging
  if (!import.meta.env || import.meta.env.MODE !== 'production') {
    window.__app = { bus, assetManager, audio, sceneManager, narrative, ui, gameManager };
  }

  bus.emit('app:ready');
  console.log('Application initialized successfully.');
}

main().catch((e) => console.error('Fatal boot error:', e));