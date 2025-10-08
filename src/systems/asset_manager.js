'use strict';

/**
 * Creates an AssetManager instance.
 * This is an async factory because it fetches the asset manifest upon creation.
 * @param {string} manifestPath - The path to the assets.json manifest file.
 * @returns {Promise<object>} A promise that resolves to the AssetManager instance.
 */
export async function createAssetManager(manifestPath) {
  let manifest = null;

  try {
    const response = await fetch(manifestPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch asset manifest: ${response.statusText}`);
    }
    manifest = await response.json();
    console.log('AssetManager initialized with manifest version:', manifest.version);
  } catch (error) {
    console.error('AssetManager initialization failed:', error);
    // Return a non-functional manager that logs errors on every get attempt.
    return {
      get: () => {
        console.error('AssetManager failed to load manifest. Cannot get assets.');
        return null;
      },
      getRawManifest: () => ({}),
    };
  }

  /**
   * Retrieves an asset path or object from the manifest using dot-notation.
   * @param {string} path - The dot-notation path to the asset (e.g., 'ui.hud.statsBars').
   * @returns {string|object|null} The path of the asset or null if not found.
   */
  function get(path) {
    const parts = path.split('.');
    let current = manifest;

    for (let i = 0; i < parts.length; i++) {
      if (current && typeof current === 'object' && current[parts[i]] !== undefined) {
        current = current[parts[i]];
      } else {
        console.error('Asset not found at path:', path);
        return null;
      }
    }

    // Vite handles paths from the project root. The paths in assets.json are relative to 'src'.
    // Prepending '/src/' is correct for Vite's dev server to find assets inside the src folder.
    if (typeof current === 'string' && !current.startsWith('http')) {
      return `/src/${current}`;
    }

    return current;
  }

  return {
    get,
    // Expose the raw manifest for systems that need to iterate over asset lists (e.g., radio stations).
    getRawManifest: () => manifest,
  };
}