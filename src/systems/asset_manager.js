'use strict';

/**
 * AssetManager
 * Manages access to game assets defined in the manifest.
 */
export const AssetManager = {
  manifest: null,
  // The baseUrl is now empty because Vite will handle asset paths correctly.
  // We will load assets directly. For external URLs, they will be absolute.
  baseUrl: "",

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
   * Retrieves an asset path or object from the manifest using dot-notation.
   * @param {string} path - The dot-notation path to the asset (e.g., 'ui.hud.statsBars').
   * @returns {string|object|null} The path of the asset or null if not found.
   */
  get: function(path) {
    if (!this.manifest) {
      console.error('Asset manifest not loaded.');
      return null;
    }

    const parts = path.split('.');
    let current = this.manifest;

    for (let i = 0; i < parts.length; i++) {
      if (current && typeof current === 'object' && current[parts[i]] !== undefined) {
        current = current[parts[i]];
      } else {
        console.error('Asset not found at path:', path);
        return null;
      }
    }

    // For file paths, Vite requires a relative path from the root.
    // The `baseUrl` is no longer needed for local assets.
    // If the path is external (http/https), it will be returned as is.
    if (typeof current === 'string' && !current.startsWith('http')) {
      // Prepend src/ to make the path relative to the project root for Vite.
      return `/src/${current}`;
    }

    return current;
  }
};