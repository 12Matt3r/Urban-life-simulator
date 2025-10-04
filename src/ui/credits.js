(function(global) {
  'use strict';

  const CreditsScreen = {
    config: null,

    /**
     * Initializes the CreditsScreen with configuration.
     * @param {object} config - The credits configuration object.
     */
    init: function(config) {
      this.config = config || {};
      console.log('Credits Screen module initialized.');
    },

    /**
     * Shows the credits screen overlay.
     */
    show: function() {
      if (!this.config || !this.config.roll) {
        console.error('Credits config not loaded or is invalid.');
        return;
      }

      const overlay = document.createElement('div');
      overlay.id = 'credits-overlay-container';
      overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; display:flex; align-items:center; justify-content:center; color:white; font-family:sans-serif;';

      let creditsHtml = '<div style="text-align:center; max-width:600px;">';
      creditsHtml += '<h1>' + (this.config.title || 'Credits') + '</h1>';

      this.config.roll.forEach(function(credit) {
        creditsHtml += '<p><strong style="color:#00ffa2;">' + credit.label + ':</strong> ' + credit.value + '</p>';
      });

      if (this.config.postCreditsCue) {
        creditsHtml += '<p style="margin-top: 30px; font-style:italic;">' + this.config.postCreditsCue + '</p>';
      }

      creditsHtml += '<button id="close-credits-btn" style="margin-top:20px; padding:10px 20px; background:var(--acc); color:var(--bg); border:none; border-radius:8px; cursor:pointer;">Continue</button>';
      creditsHtml += '</div>';

      overlay.innerHTML = creditsHtml;
      document.body.appendChild(overlay);

      document.getElementById('close-credits-btn').onclick = this.hide;
    },

    /**
     * Hides the credits screen overlay.
     */
    hide: function() {
      const overlay = document.getElementById('credits-overlay-container');
      if (overlay) {
        overlay.parentNode.removeChild(overlay);
      }
    }
  };

  global.UI = global.UI || {};
  global.UI.CreditsScreen = CreditsScreen;

})(window);