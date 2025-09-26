(function(global) {
  'use strict';

  const PlayerHUD = {
    container: null,
    assetManager: null,
    eventBus: null,
    stats: {},

    /**
     * Initializes the Player HUD.
     * @param {object} config - Configuration object.
     * @param {HTMLElement} config.container - The container element for the HUD.
     * @param {object} config.assetManager - The initialized AssetManager instance.
     * @param {object} config.eventBus - The global event bus.
     */
    init: function(config) {
      this.container = config.container;
      this.assetManager = config.assetManager;
      this.eventBus = config.eventBus;

      if (!this.container || !this.assetManager || !this.eventBus) {
        console.error('PlayerHUD init failed: Missing required configuration.');
        return;
      }

      this.eventBus.subscribe('stats:updated', this.update.bind(this));
      this.render();
      console.log('PlayerHUD initialized.');
    },

    /**
     * Renders the initial structure of the HUD.
     */
    render: function() {
      const hudImageUrl = this.assetManager.get('ui.hud.statsBars');
      if (!hudImageUrl) {
        console.error('HUD background asset not found.');
        return;
      }

      this.container.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        width: 250px;
        height: 150px;
        background-image: url('${hudImageUrl}');
        background-size: contain;
        background-repeat: no-repeat;
        z-index: 200;
        color: white;
        font-family: sans-serif;
        padding: 10px;
      `;

      this.container.innerHTML = `
        <div id="hud-stats-container" style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px;">
            <div id="hud-health">Health: --</div>
            <div id="hud-sanity">Sanity: --</div>
            <div id="hud-money">Money: $--</div>
            <div id="hud-heat">Heat: --</div>
        </div>
      `;
    },

    /**
     * Updates the HUD with new stats.
     * @param {object} newStats - The new player stats object.
     */
    update: function(newStats) {
      this.stats = newStats;

      const healthEl = document.getElementById('hud-health');
      const sanityEl = document.getElementById('hud-sanity');
      const moneyEl = document.getElementById('hud-money');
      const heatEl = document.getElementById('hud-heat');

      if (healthEl) healthEl.textContent = `Health: ${this.stats.health}%`;
      if (sanityEl) sanityEl.textContent = `Sanity: ${this.stats.sanity}%`;
      if (moneyEl) moneyEl.textContent = `Money: $${this.stats.money}`;
      if (heatEl) heatEl.textContent = `Heat: ${'★'.repeat(this.stats.heat)}${'☆'.repeat(5 - this.stats.heat)}`;
    }
  };

  global.UI = global.UI || {};
  global.UI.PlayerHUD = PlayerHUD;

})(window);