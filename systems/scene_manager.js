(function(global) {
  'use strict';

  const SceneManager = {
    gameContainer: null,
    overlayContainer: null,
    assetManager: null,

    /**
     * Initializes the SceneManager.
     * @param {object} config - Configuration object.
     * @param {HTMLElement} config.gameContainer - The main container for game scenes.
     * @param {HTMLElement} config.overlayContainer - The container for UI overlays.
     * @param {object} config.assetManager - The initialized AssetManager instance.
     */
    init: function(config) {
      this.gameContainer = config.gameContainer;
      this.overlayContainer = config.overlayContainer;
      this.assetManager = config.assetManager;

      if (!this.gameContainer || !this.overlayContainer || !this.assetManager) {
        console.error('SceneManager init failed: Missing required configuration.');
        return;
      }

      console.log('SceneManager initialized.');
    },

    /**
     * Sets the background of the main game container.
     * @param {string} assetPath - The dot-notation path to the background asset.
     */
    setBackground: function(assetPath) {
      if (!this.gameContainer || !this.assetManager) return;

      const imageUrl = this.assetManager.get(assetPath);
      if (imageUrl && typeof imageUrl === 'string') {
        this.gameContainer.style.backgroundImage = 'url("' + imageUrl + '")';
        this.gameContainer.style.backgroundSize = 'cover';
        this.gameContainer.style.backgroundPosition = 'center';
      } else {
        console.error('Failed to set background, asset not found or invalid:', assetPath);
      }
    },

    /**
     * Shows a UI overlay.
     * @param {string} assetPath - The dot-notation path to the overlay asset.
     * @param {string} [id] - An optional ID for the overlay element.
     */
    showOverlay: function(assetPath, id) {
      if (!this.overlayContainer || !this.assetManager) return;

      const imageUrl = this.assetManager.get(assetPath);
      if (imageUrl && typeof imageUrl === 'string') {
        const overlay = document.createElement('div');
        if (id) {
          overlay.id = id;
        }
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundImage = 'url("' + imageUrl + '")';
        overlay.style.backgroundSize = 'contain';
        overlay.style.backgroundRepeat = 'no-repeat';
        overlay.style.backgroundPosition = 'center';
        overlay.style.zIndex = '100';
        this.overlayContainer.appendChild(overlay);
        return overlay;
      } else {
        console.error('Failed to show overlay, asset not found or invalid:', assetPath);
        return null;
      }
    },

    /**
     * Hides an overlay by its element or ID.
     * @param {string|HTMLElement} identifier - The ID or the HTML element of the overlay to hide.
     */
    hideOverlay: function(identifier) {
      if (!this.overlayContainer) return;
      let overlay = (typeof identifier === 'string') ? document.getElementById(identifier) : identifier;

      if (overlay && overlay.parentNode === this.overlayContainer) {
        this.overlayContainer.removeChild(overlay);
      }
    }
  };

  global.SceneManager = SceneManager;

})(window);