/**
 * @file src/core/IframeManager.js
 * @description Secure WebSim module loader with message routing.
 */
import { ULS_CONFIG } from '../config.js';
import { security } from '../utils/security.js';

class IframeManager {
  constructor() {
    this.iframes = new Map();
    this.readyStates = new Map();
    this.waitQueues = new Map();
    window.addEventListener('message', (e) => this.onMessage(e));
  }

  onMessage(e) {
    if (!security.isValidOrigin(e.origin)) {
      console.warn('Invalid message origin:', e.origin);
      return;
    }
    const data = e.data;
    if (!data) return;

    if (data.image) {
      this.handleImageResponse(data);
    }
    if (data.narrator) {
      this.handleNarratorResponse(data);
    }
    if (data.source === 'coin-engine') {
        this.handleCoinEngineResponse(data);
    }
  }

  ensure(name, src) {
    if (this.iframes.has(name)) {
        const iframe = this.iframes.get(name);
        if (iframe.src !== src) {
            iframe.src = src;
            this.readyStates.set(name, false); // Reset ready state on URL change
        }
        return iframe;
    }
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    this.iframes.set(name, iframe);
    this.readyStates.set(name, false);
    this.waitQueues.set(name, []);
    return iframe;
  }

  postMessage(name, src, message) {
    const iframe = this.ensure(name, src);
    const go = () => iframe.contentWindow.postMessage(message, new URL(src).origin);

    if (this.readyStates.get(name)) {
        go();
    } else {
        // The coin engine doesn't have a ready message, so we just send it.
        if (name === 'coin-engine') {
            iframe.addEventListener('load', go);
        } else {
            this.waitQueues.get(name).push(go);
        }
    }
  }

  handleImageResponse(payload) {
    const img = document.getElementById('stage-img');
    if (!img) return;
    if (payload.image?.dataUrl) { img.src = payload.image.dataUrl; }
    if (payload.image?.url) { img.src = payload.image.url; }
  }

  handleNarratorResponse(payload) {
    if (payload.type === 'ready') {
      const narratorName = this.getNarratorNameFromPayload(payload);
      this.readyStates.set(narratorName, true);
      this.waitQueues.get(narratorName).forEach(f => f());
      this.waitQueues.set(narratorName, []);
    }
    if (payload.type === 'response') {
      window.eventBus.publish('narrator.response', payload.payload);
    }
    if (payload.type === 'autopilot.suggestion') {
      window.eventBus.publish('narrator.autopilot.suggestion', payload.payload);
    }
  }

  handleCoinEngineResponse(payload) {
      if (payload.type === 'coin.result') {
        window.eventBus.publish('coin.result', payload.payload);
      }
  }

  getNarratorNameFromPayload(payload) {
    for (const [name, iframe] of this.iframes.entries()) {
        if (iframe.contentWindow === payload.source) {
            return name;
        }
    }
    return null;
  }

  requestImage(prompt, style = 'cinematic neon city') {
    const payload = { from: 'uls', type: 'image.request', payload: { prompt, style } };
    this.postMessage('image-renderer', ULS_CONFIG.IMAGE_RENDER_URL, payload);
  }

  askNarrator(payload) {
    const url = window.__app.player.adult ? ULS_CONFIG.NARRATOR_ADULT_URL : ULS_CONFIG.NARRATOR_PG13_URL;
    this.postMessage('narrator', url, { from: 'uls', payload: { type: 'ask', data: payload } });
  }

  suggestAutopilotAction(payload) {
      const url = ULS_CONFIG.AUTOPILOT_URL;
      this.postMessage('autopilot', url, { from: 'uls', payload: { type: 'autopilot.suggest', data: payload } });
  }

  flipCoin(payload) {
      const url = ULS_CONFIG.COIN_ENGINE_URL;
      this.postMessage('coin-engine', url, { from: 'uls', type: 'coin.flip', payload });
  }
}

export const iframeManager = new IframeManager();

// Wire up to the event bus
window.eventBus.subscribe('image.request', p => {
  iframeManager.requestImage(p.prompt, p.style);
});
window.eventBus.subscribe('narrator.ask', payload => {
  iframeManager.askNarrator(payload);
});
window.eventBus.subscribe('narrator.autopilot.suggestAction', payload => {
  iframeManager.suggestAutopilotAction(payload);
});
window.eventBus.subscribe('coin.flip', payload => {
  iframeManager.flipCoin(payload);
});
