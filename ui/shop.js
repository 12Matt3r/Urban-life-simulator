(function(global) {
  'use strict';

  const Shop = {
    gameManager: null,
    gameAudio: null,
    container: null,

    /**
     * Initializes the Shop module.
     * @param {object} config - Configuration object.
     * @param {object} config.gameManager - The main GameManager instance.
     * @param {object} config.gameAudio - The main GameAudio instance.
     */
    init: function(config) {
      this.gameManager = config.gameManager;
      this.gameAudio = config.gameAudio;
      console.log('Shop module initialized.');
    },

    /**
     * Shows the shop overlay.
     */
    show: function() {
      if (this.container) {
        this.hide(); // Ensure only one shop is open
      }

      this.container = document.createElement('div');
      this.container.id = 'shop-overlay-container';
      this.container.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:5000; display:flex; align-items:center; justify-content:center;';

      const shopHtml = `
        <div style="background:var(--panel); padding:20px; border-radius:12px; border:1px solid var(--line); text-align:center;">
          <h2>Corner Store</h2>
          <p>A dusty little shop. Smells like synth-jerky.</p>
          <button id="buy-water-btn" class="uls-dev-btn">Buy Water ($5)</button>
          <button id="close-shop-btn" class="uls-dev-btn" style="margin-left:10px;">Leave</button>
        </div>
      `;

      this.container.innerHTML = shopHtml;
      document.body.appendChild(this.container);

      document.getElementById('buy-water-btn').onclick = this.buyWater.bind(this);
      document.getElementById('close-shop-btn').onclick = this.hide.bind(this);
    },

    /**
     * Hides the shop overlay.
     */
    hide: function() {
      if (this.container) {
        this.container.parentNode.removeChild(this.container);
        this.container = null;
      }
    },

    /**
     * Logic for buying a water bottle.
     */
    buyWater: function() {
      if (!this.gameManager || !this.gameAudio) return;

      const playerMoney = this.gameManager.player.money;
      const itemCost = 5;

      if (playerMoney >= itemCost) {
        this.gameManager.modifyStat('money', -itemCost);
        this.gameManager.addItem({ id: 'water_bottle', name: 'Bottled Water' });

        // We'll need to add a 'cash' sound to the manifest later.
        // For now, we can use an existing sound as a placeholder.
        this.gameAudio.playSfx('ui_confirm');
        console.log('[Shop] Player bought water.');
        alert('You bought a bottle of water.');
      } else {
        this.gameAudio.playSfx('ui_error');
        console.log('[Shop] Not enough money to buy water.');
        alert("You don't have enough money.");
      }
    }
  };

  global.UI = global.UI || {};
  global.UI.Shop = Shop;

})(window);