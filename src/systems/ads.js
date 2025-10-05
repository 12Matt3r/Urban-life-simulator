'use strict';

import { GameAudio } from './audio.js';
import { SceneManager } from './scene_manager.js';

/**
 * AdsManager
 * A stub system for managing in-game advertisements.
 */
export const AdsManager = {
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
  },

  /**
   * Placeholder function to trigger a radio ad.
   */
  triggerRadioAd: function() {
    if (!this.config.radio || !this.config.radio.enabled) return;

    console.log('Attempting to play radio ad...');
    if (GameAudio && this.config.radio.placeholder) {
      const adSfxId = 'ad_radio_placeholder';
      if (!GameAudio.sfx.has(adSfxId)) {
          const adAssetPath = this.config.radio.placeholder;
          // Note: The original asset path needs to be updated for Vite
          // For now, we assume it's a full URL or will be handled by AssetManager
          GameAudio.sfx.set(adSfxId, { id: adSfxId, path: adAssetPath, loop: false, gain: 1.0 });
      }

      console.log('Ducking radio volume for ad...');
      GameAudio.playSfx(adSfxId);
    }
  },

  /**
   * Placeholder function to display a TV ad.
   */
  triggerTvAd: function() {
    if (!this.config.tv || !this.config.tv.enabled) return;

    console.log('Attempting to display TV ad...');
    if (SceneManager && this.config.tv.placeholderImage) {
       SceneManager.showOverlay(this.config.tv.placeholderImage, 'tv-ad-overlay');
    }
  }
};