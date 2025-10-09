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
import { createCharacterCreationScreen } from './ui/character_creation.js';

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
  const bus = createBus();
  const assetManager = await createAssetManager('/src/assets.json');
  const audio = createAudio({ volume: 0.8 });

  // Show character creation screen first
  const charCreationScreen = createCharacterCreationScreen(document.body, { bus });
  charCreationScreen.show();

  bus.on('character:created', (playerData) => {
    // Character has been created, now initialize and start the main game
    initializeGame(playerData);
  });

  // Expose the initializer for debugging purposes
  window.__app_init_game = initializeGame;

  async function initializeGame(playerData) {
    const assets = assetManager.getRawManifest();

    // Initialize core systems
    const sceneManager = createSceneManager();
    sceneManager.add('menu', () => ({ enter(){ bus.emit('game:scene_change', 'menu'); }, update(){}, render(){} }));
    sceneManager.add('game', () => ({ enter(){ bus.emit('game:scene_change', 'game'); }, update(){}, render(){} }));

    const iframe = document.getElementById('narrative-engine-iframe');
    const narrative = createNarrative({ target: iframe?.contentWindow, bus, trace });

    // Create the central game manager
    const gameManager = createGameManager({ bus, sceneManager, narrative, initialPlayerState: playerData });

    // Initialize UI Components
    const ui = {
      hud: createHUD(document.body, { bus, assetManager, initialStats: gameManager.getPlayerState() }),
      shop: createShop(document.body, { gameManager, gameAudio: audio }),
      credits: createCredits(document.body, assets.credits),
      radio: createRadio(document.getElementById('radio-container'), (assets.audio.stations || []).reduce((acc, s) => {
        acc[s.id] = { ...s, tracks: s.urls.map(url => ({ url, title: new URL(url).pathname.split('/').pop() })) };
        return acc;
      }, {})),
      charCreation: charCreationScreen, // Keep a reference
    };

    // Wire up global event listeners
    bus.on('audio:resume', () => audio.resume());
    window.addEventListener('pointerdown', () => bus.emit('audio:resume'), { once: true });
    window.addEventListener('keydown', () => bus.emit('audio:resume'), { once: true });

    // Start the game
    gameManager.start();

    // Attach the narrative listener, which will kick off the handshake
    narrative.attach();

    sceneManager.go('menu');

    // Start the main game loop
    let last = performance.now();
    function loop(ts) {
      const dt = (ts - last) / 1000;
      last = ts;
      gameManager.tick(dt);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Expose for debugging
    if (!import.meta.env || import.meta.env.MODE !== 'production') {
      window.__app = { bus, assetManager, audio, sceneManager, narrative, ui, gameManager };
    }

    bus.emit('app:ready');
    console.log('Application initialized successfully.');
  }
}

main().catch((e) => console.error('Fatal boot error:', e));