'use strict';

/**
 * CreditsScreen
 * A simple UI module to display game credits.
 */
export const CreditsScreen = {
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
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.9); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      color: white; font-family: sans-serif;
    `;

    const creditsHtml = `
      <div style="text-align:center; max-width:600px;">
        <h1>${this.config.title || 'Credits'}</h1>
        ${this.config.roll.map(credit => `
          <p><strong style="color:#00ffa2;">${credit.label}:</strong> ${credit.value}</p>
        `).join('')}
        ${this.config.postCreditsCue ? `<p style="margin-top: 30px; font-style:italic;">${this.config.postCreditsCue}</p>` : ''}
        <button id="close-credits-btn" style="margin-top:20px; padding:10px 20px; background:var(--acc); color:var(--bg); border:none; border-radius:8px; cursor:pointer;">Continue</button>
      </div>
    `;

    overlay.innerHTML = creditsHtml;
    document.body.appendChild(overlay);

    // Use an arrow function to preserve the `this` context for the hide method.
    document.getElementById('close-credits-btn').onclick = () => this.hide();
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