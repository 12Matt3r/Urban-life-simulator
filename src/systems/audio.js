/**
 * @file src/systems/audio.js
 * @description Manages the game's sound effects.
 */
import { ULS_CONFIG } from '../config.js';

class AudioManager {
  constructor() {
    this.dingEl = document.getElementById('sfx-ding');
    this.buzzEl = document.getElementById('sfx-buzz');
    this.loadSfx();
  }

  loadSfx() {
    if (ULS_CONFIG.SFX_DING) {
      this.dingEl.src = ULS_CONFIG.SFX_DING;
    }
    if (ULS_CONFIG.SFX_BUZZ) {
      this.buzzEl.src = ULS_CONFIG.SFX_BUZZ;
    }
  }

  playDing() {
    if (this.dingEl.src) {
      this.dingEl.play();
    }
  }

  playBuzz() {
    if (this.buzzEl.src) {
      this.buzzEl.play();
    }
  }
}

export const audioManager = new AudioManager();

// Expose to window for legacy access if needed, e.g., from inline event handlers
window.playDing = () => audioManager.playDing();
window.playBuzz = () => audioManager.playBuzz();
