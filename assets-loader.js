(function(global) {
  'use strict';

  async function loadAssetsRegistry(url) {
    url = url || 'assets.json';
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch asset registry: ' + response.statusText);
      }
      const registry = await response.json();
      console.log('Asset registry loaded, version:', registry.version);

      initializeAllSystems(registry);
      return registry;
    } catch (error) {
      console.error('Could not load or parse asset registry:', error);
      document.body.innerHTML = '<div style="color:red; text-align:center; padding-top:50px;"><h1>Error</h1><p>Failed to load critical game assets. Please check the console.</p></div>';
      return null;
    }
  }

  function initializeAllSystems(registry) {
    // 1. Create a global event bus
    const eventBus = {
      subs: {},
      subscribe: function(topic, fn) { (this.subs[topic] = this.subs[topic] || []).push(fn); },
      publish: function(topic, data) { (this.subs[topic] || []).forEach(fn => fn(data)); }
    };
    global.eventBus = eventBus;

    // 2. Initialize Managers that don't depend on others first
    global.AssetManager.init(registry);
    global.GameAudio.init({ assetManager: global.AssetManager });
    global.GameManager.init({ eventBus: global.eventBus });

    // 3. Initialize Managers that depend on others
    global.SceneManager.init({
      gameContainer: document.getElementById('game-container'),
      overlayContainer: document.getElementById('overlay-container'),
      assetManager: global.AssetManager
    });
    global.NarrativeManager.init({
      gameManager: global.GameManager,
      sceneManager: global.SceneManager,
      eventBus: global.eventBus
    });
    global.AdsManager.init(registry.ads);

    // 4. Initialize UI Components
    global.UI.PlayerHUD.init({
      container: document.getElementById('hud-container'),
      assetManager: global.AssetManager,
      eventBus: global.eventBus
    });
    global.UI.Shop.init({
      gameManager: global.GameManager,
      gameAudio: global.GameAudio
    });
    global.UI.CreditsScreen.init(registry.credits);
    global.UI.NarrativeDisplay.init({
      container: document.getElementById('narrative-container'),
      eventBus: global.eventBus
    });

    // Populate radio stations from the registry
    if (registry.audio && registry.audio.stations) {
      const stationsById = {};
      for (const st of registry.audio.stations) {
        stationsById[st.id] = st;
      }
      global.RADIO_STATIONS = stationsById;
      console.log('Radio stations initialized.');
    }

    // The radio has its own data source now, but we'll mount it here
    const radioContainer = document.getElementById('radio-container');
    if (radioContainer) {
      // The radio UI is created first
      global.UI.Radio.mount(radioContainer);
      // Then its logic is initialized, which now reads from global.RADIO_STATIONS
      if (global.UI.Radio) {
        global.UI.Radio.init();
      }
    }

    console.log('All systems initialized.');
    global.eventBus.publish('game:ready');

    // Auto-start the tutorial, as per fix instructions.
    global.NarrativeManager.startSequence('tutorial');
  }

  // Expose the loader to the global scope
  global.loadAssets = loadAssetsRegistry;

})(window);