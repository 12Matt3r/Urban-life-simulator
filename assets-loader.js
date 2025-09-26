(function(global) {
  'use strict';

  // Helper function to create a clean title from a URL
  function createTitleFromUrl(url) {
    try {
      var filename = url.substring(url.lastIndexOf('/') + 1);
      filename = decodeURIComponent(filename.replace(/\+/g, ' '));
      var title = filename.substring(0, filename.lastIndexOf('.'));
      title = title.replace(/_/g, ' ').replace(/%20/g, ' ').replace(/-/g, ' ').trim();
      return title.split(' ').map(function(word) {
        return word.charAt(0).toUpperCase() + word.substring(1);
      }).join(' ');
    } catch (e) {
      return "Untitled";
    }
  }

  function createTracks(urls) {
    return urls.map(function(url) {
      return { title: createTitleFromUrl(url), url: url };
    });
  }

  async function loadAssetsRegistry(url) {
    url = url || 'assets.json';
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch asset registry: ' + response.statusText);
      }
      const registry = await response.json();
      console.log('Asset registry loaded, version:', registry.version);

      initializeSystems(registry);
      return registry;
    } catch (error) {
      console.error('Could not load or parse asset registry:', error);
      return null;
    }
  }

  function initializeSystems(registry) {
    // 1. Initialize AssetManager
    if (global.AssetManager) {
      global.AssetManager.init(registry);
    }

    // 2. Initialize SceneManager
    if (global.SceneManager) {
      global.SceneManager.init({
        gameContainer: document.getElementById('game-container'),
        overlayContainer: document.getElementById('overlay-container'),
        assetManager: global.AssetManager
      });
    }

    // 3. Prepare and Load Radio Station Data
    if (registry.audio && registry.audio.stations) {
      const stationsObject = {};
      registry.audio.stations.forEach(function(station) {
        stationsObject[station.id] = {
          id: station.id,
          name: station.name,
          shuffle: !!station.shuffle,
          gain: station.gain || 1.0,
          tracks: createTracks(station.urls)
        };
      });
      global.RADIO_STATIONS = stationsObject;
      console.log('Radio station data prepared for radio module.');
    }

    // 4. Register SFX with GameAudio
    if (global.GameAudio && registry.audio && registry.audio.sfx) {
      Object.keys(registry.audio.sfx).forEach(function(key) {
        const path = registry.audio.sfx[key];
        // Note: The GameAudio manager will prepend the base URL
        global.GameAudio.sfx.set(key, { id: key, path: path, loop: false, gain: 1.0 });
      });
      console.log('SFX registered with GameAudio.');
    }

    // 5. Load Ads and Credits Configs
    global.AdsConfig = registry.ads || {};
    global.CreditsConfig = registry.credits || {};
    global.RoutingConfig = registry.routing || {};
    console.log('Ads, Credits, and Routing configurations loaded.');
  }

  global.loadAssets = loadAssetsRegistry;

})(window);