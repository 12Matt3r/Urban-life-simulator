'use strict';

// Import all the game systems and UI components as ES6 modules.
import { AssetManager } from './systems/asset_manager.js';
import { GameManager } from './systems/game.js';
import { GameAudio } from './systems/audio.js';
import { SceneManager } from './systems/scene_manager.js';
import { NarrativeManager } from './systems/narrative.js';
import { AdsManager } from './systems/ads.js';
import { CreditsScreen } from './ui/credits.js';
import { PlayerHUD } from './ui/hud.js';
import { ULSRadio } from './ui/radio.js';
import { Shop } from './ui/shop.js';

// The event bus is a singleton that facilitates communication between systems.
const eventBus = {
  subs: {},
  subscribe: function(topic, fn) { (this.subs[topic] = this.subs[topic] || []).push(fn); },
  publish: function(topic, data) { (this.subs[topic] || []).forEach(fn => fn(data)); }
};

/**
 * Initializes all game systems in the correct order.
 * @param {object} registry - The loaded asset manifest from assets.json.
 */
function initializeAllSystems(registry) {
  // Initialize all managers with their dependencies.
  AssetManager.init(registry);
  GameManager.init({ eventBus });
  GameAudio.init({ assetManager: AssetManager });
  SceneManager.init({
    gameContainer: document.getElementById('game-container'),
    overlayContainer: document.getElementById('overlay-container'),
    assetManager: AssetManager
  });
  NarrativeManager.init({
    gameManager: GameManager,
    sceneManager: SceneManager,
    eventBus: eventBus
  });
  AdsManager.init(registry.ads);

  // Initialize all UI components.
  PlayerHUD.init({
    container: document.getElementById('hud-container'),
    assetManager: AssetManager,
    eventBus: eventBus
  });
  Shop.init({
    gameManager: GameManager,
    gameAudio: GameAudio
  });
  CreditsScreen.init(registry.credits);

  // Mount and initialize the radio.
  const radioContainer = document.getElementById('radio-container');
  if (radioContainer) {
    ULSRadio.mount(radioContainer);
    // Pass the station data from the asset registry to the radio's init function.
    const radioStations = registry.audio.stations.reduce((acc, station) => {
        acc[station.id] = station;
        return acc;
    }, {});
    ULSRadio.init({ stations: radioStations });
  }

  // --- TEMPORARY: Expose objects to window for the Dev Harness ---
  // This allows the existing dev harness to continue functioning during the migration.
  window.eventBus = eventBus;
  window.NarrativeManager = NarrativeManager;
  window.SceneManager = SceneManager;
  window.GameManager = GameManager;
  window.GameAudio = GameAudio;
  // Reconstruct the UI object for the dev harness
  window.UI = {
    PlayerHUD,
    Shop,
    CreditsScreen,
    Radio: ULSRadio
  };
  // --- END TEMPORARY ---

  console.log('All systems initialized.');
  eventBus.publish('game:ready');
}

/**
 * Fetches the asset registry and starts the game initialization process.
 */
export async function initGame() {
  try {
    const response = await fetch('/src/assets.json'); // Vite serves from the project root
    if (!response.ok) {
      throw new Error(`Failed to fetch asset registry: ${response.statusText}`);
    }
    const registry = await response.json();
    console.log('Asset registry loaded, version:', registry.version);

    initializeAllSystems(registry);
  } catch (error) {
    console.error('Could not load or parse asset registry:', error);
    document.body.innerHTML = '<div style="color:red; text-align:center; padding-top:50px;"><h1>Error</h1><p>Failed to load critical game assets. Please check the console.</p></div>';
  }
}