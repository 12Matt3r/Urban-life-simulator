/**
 * @file src/ui/credits.js
 * @description Manages the credits screen.
 */
import { eventBus } from '../systems/bus.js';
import { ULS_CONFIG } from '../config.js';

class Credits {
  constructor() {
    eventBus.subscribe('credits.show', () => this.show());
  }

  show() {
    const w = document.createElement('div');
    w.style.cssText = 'position:fixed;inset:0;background:#000;z-index:99999';
    w.innerHTML = '<iframe src="' + ULS_CONFIG.CREDITS_URL + '" style="width:100%;height:100%;border:0"></iframe><button style="position:absolute;right:10px;top:10px" onclick="this.parentNode.remove()">Close</button>';
    document.body.appendChild(w);
  }
}

export const credits = new Credits();
