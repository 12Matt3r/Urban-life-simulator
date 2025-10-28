/**
 * @file src/systems/Radio.js
 * @description Manages the radio iframe communication.
 */
import { ULS_CONFIG } from '../config.js';

class RadioManager {
  constructor() {
    this.iframe = null;
    this.init();
  }

  init() {
    // The IframeManager now handles the creation of the radio iframe,
    // so we just need to ensure we can communicate with it.
    // We'll use the iframeManager to get a reference to the radio iframe if needed,
    // but for now, we'll just send messages.
  }

  post(action, payload) {
    const radioIframe = document.getElementById('uls-radio-iframe');
    if (radioIframe && radioIframe.contentWindow) {
      radioIframe.contentWindow.postMessage({
        target: 'uls-radio',
        cmd: action,
        payload: payload,
      }, new URL(ULS_CONFIG.RADIO_IFRAME_URL).origin);
    }
  }

  // --- Public API ---
  play() {
    this.post('play');
  }

  pause() {
    this.post('pause');
  }

  next() {
    this.post('next');
  }

  prev() {
    this.post('prev');
  }

  shuffle() {
    this.post('shuffle');
  }
}

export const radioManager = new RadioManager();

// Expose to window for easy access
window.radioCmd = (cmd, payload) => radioManager.post(cmd, payload);
