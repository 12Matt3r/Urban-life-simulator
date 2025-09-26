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
     * @param {string} path - The dot-notation path to the asset (e.g., 'ui.hud.statsBars').
     * @returns {string|null} The full URL of the asset or null if not found.
     */
    get: function(path) {
      if (!this.manifest || !this.manifest.assets) {
        // This is a corrected check from a potential future bug.
        // It should check registry.ui, registry.backgrounds etc. directly if assets root doesn't exist
        // For now, we assume the structure from assets.json is followed.
      }

      var parts = path.split('.');
      var current = this.manifest; // Start from the root of the manifest

      for (var i = 0; i < parts.length; i++) {
        if (current && typeof current === 'object' && current[parts[i]] !== undefined) {
          current = current[parts[i]];
        } else {
          console.error('Asset not found at path:', path);
          return null;
        }
      }

      if (typeof current === 'string') {
        return this.baseUrl + current;
      } else {
        // This allows retrieving whole objects, like a realm's image set
        return current;
      }
    }
  };

  global.AssetManager = AssetManager;

})(window);