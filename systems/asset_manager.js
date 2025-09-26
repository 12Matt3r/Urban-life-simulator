(function(global) {
  'use strict';

  const AssetManager = {
    manifest: null,
    baseUrl: "https://file.garden/aNQEj1MKyWDQ8eyI/",

    /**
     * Initializes the AssetManager with the asset manifest.
     * @param {object} manifest - The asset manifest object.
     */
    init: function(manifest) {
      this.manifest = manifest;
      if (this.manifest && this.manifest.version) {
        console.log('AssetManager initialized with manifest version:', this.manifest.version);
      } else {
        console.error('AssetManager initialized with invalid or missing manifest.');
      }
    },

    /**
     * Retrieves the full URL for an asset using a dot-notation path.
     * @param {string} path - The dot-notation path to the asset (e.g., 'ui.hud.stats_bars').
     * @returns {string|null} The full URL of the asset or null if not found.
     */
    get: function(path) {
      if (!this.manifest || !this.manifest.assets) {
        console.error('AssetManager not initialized or manifest has no assets. Call init() with a manifest first.');
        return null;
      }

      var parts = path.split('.');
      var current = this.manifest.assets;

      for (var i = 0; i < parts.length; i++) {
        if (current && typeof current === 'object' && current[parts[i]] !== undefined) {
          current = current[parts[i]];
        } else {
          console.error('Asset not found at path:', path);
          return null;
        }
      }

      if (typeof current === 'string') {
        // The paths in the manifest are relative, prepend the base URL
        return this.baseUrl + current;
      } else {
        console.error('Path does not resolve to a valid asset URL string:', path);
        return null;
      }
    }
  };

  global.AssetManager = AssetManager;

})(window);