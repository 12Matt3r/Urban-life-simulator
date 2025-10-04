'use strict';

// Import the modules we have already refactored
import { AssetManager } from './systems/asset_manager.js';
import { GameManager } from './systems/game.js';

// --- TEMPORARY MIGRATION STEP ---
// The files below are not yet ES modules. Importing them ensures they execute
// and attach themselves to the global `window` object, allowing the game
to
// function during the refactoring process.
import './systems/audio.js';
import './systems/scene_manager.js';
import './systems/narrative.js';
import './systems/ads.js';
import './ui/radio.js';
import './ui/credits.js';
import './ui/hud.js';
import './ui/shop.js';
// --- END TEMPORARY MIGRATION STEP ---

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
  // Initialize refactored modules via direct import
  AssetManager.init(registry);
  GameManager.init({ eventBus });

  // Initialize legacy modules from the global scope (for now)
  window.GameAudio.init({ assetManager: AssetManager });
  window.SceneManager.init({
    gameContainer: document.getElementById('game-container'),
    overlayContainer: document.getElementById('overlay-container'),
    assetManager: AssetManager
  });
  window.NarrativeManager.init({
    gameManager: GameManager,
    sceneManager: window.SceneManager,
    eventBus: eventBus
  });
  window.AdsManager.init(registry.ads);
  window.UI.PlayerHUD.init({
    container: document.getElementById('hud-container'),
    assetManager: AssetManager,
    eventBus: eventBus
  });
  window.UI.Shop.init({
    gameManager: GameManager,
    gameAudio: window.GameAudio
  });
  window.UI.CreditsScreen.init(registry.credits);

  const radioContainer = document.getElementById('radio-container');
  if (radioContainer) {
    window.UI.Radio.mount(radioContainer);
    if (window.ULSRadio) {
      window.ULSRadio.init();
    }
  }

  // --- TEMPORARY: Expose objects to window for the Dev Harness ---
  window.eventBus = eventBus;
  window.NarrativeManager = window.NarrativeManager;
  window.SceneManager = window.SceneManager;
  window.GameManager = GameManager;
  window.GameAudio = window.GameAudio;
  window.UI = window.UI;
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