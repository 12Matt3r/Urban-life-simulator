(function(global) {
  'use strict';

  const NarrativeDisplay = {
    container: null,
    eventBus: null,

    init: function(config) {
      this.container = config.container;
      this.eventBus = config.eventBus;

      if (!this.container || !this.eventBus) {
        console.error('NarrativeDisplay init failed: Missing required configuration.');
        return;
      }

      this.eventBus.subscribe('narrative:log', this.handleLog.bind(this));
      this.applyStyles();
      console.log('NarrativeDisplay initialized.');
    },

    applyStyles: function() {
        this.container.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            max-width: 800px;
            padding: 15px 20px;
            background-color: rgba(0, 0, 0, 0.75);
            border-top: 1px solid var(--acc);
            color: var(--ink);
            text-align: center;
            z-index: 100;
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(0, 255, 162, 0.2);
            pointer-events: none;
        `;
    },

    handleLog: function(data) {
      if (!this.container || !data || !data.message) return;

      // Clear previous message
      this.container.innerHTML = '';

      const messageEl = document.createElement('p');
      messageEl.className = 'narrative-text-p'; // Use a class for easier selection
      messageEl.style.margin = '0';
      messageEl.style.fontSize = '16px';
      messageEl.style.lineHeight = '1.6';
      messageEl.textContent = data.message;

      this.container.appendChild(messageEl);
    }
  };

  global.UI = global.UI || {};
  global.UI.NarrativeDisplay = NarrativeDisplay;

})(window);