(function(global) {
  'use strict';

  const AdsManager = {
    config: {},

    /**
     * Initializes the AdsManager with configuration from the asset loader.
     * @param {object} config - The ads configuration object.
     */
    init: function(config) {
      this.config = config || {};
      if (this.config.radio && this.config.radio.enabled) {
        console.log('Radio Ads system stub initialized.');
      }
      if (this.config.tv && this.config.tv.enabled) {
        console.log('TV Ads system stub initialized.');
      }
    },

    /**
     * Placeholder function to trigger a radio ad.
     */
    triggerRadioAd: function() {
      if (!this.config.radio || !this.config.radio.enabled) return;

      console.log('Attempting to play radio ad...');
      if (global.GameAudio && this.config.radio.placeholder) {
        const adSfxId = 'ad_radio_placeholder';
        if (!global.GameAudio.sfx.has(adSfxId)) {
            const adAssetPath = this.config.radio.placeholder;
            global.GameAudio.sfx.set(adSfxId, { id: adSfxId, path: adAssetPath, loop: false, gain: 1.0 });
        }

        console.log('Ducking radio volume for ad...');
        global.GameAudio.playSfx(adSfxId);
      }
    },

    /**
     * Placeholder function to display a TV ad.
     */
    triggerTvAd: function() {
      if (!this.config.tv || !this.config.tv.enabled) return;

      console.log('Attempting to display TV ad...');
      if (global.SceneManager && this.config.tv.placeholderImage) {
         global.SceneManager.showOverlay(this.config.tv.placeholderImage, 'tv-ad-overlay');
      }
    }
  };

  global.AdsManager = AdsManager;

})(window);