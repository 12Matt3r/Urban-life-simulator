/**
 * @file src/systems/trippy_cam.js
 * @description Manages the TrippyCam visual effect.
 */
import { eventBus } from './bus.js';
import { iframeManager } from '../core/IframeManager.js';
import { ULS_CONFIG } from '../config.js';

class TrippyCam {
  constructor() {
    this.on = false;
    this.root = document.documentElement;
    eventBus.subscribe('fx.trippy.on', () => this.turnOn());
    eventBus.subscribe('fx.trippy.off', () => this.turnOff());
    eventBus.subscribe('drink.alcohol',()=>eventBus.publish('fx.trippy.on'));
    eventBus.subscribe('rest.sober',()=>eventBus.publish('fx.trippy.off'));
  }

  turnOn() {
    if (this.on) return;
    this.on = true;
    this.root.classList.add('trippy');
    iframeManager.ensure('trippy-cam', ULS_CONFIG.TRIPPY_CAM_URL);
  }

  turnOff() {
    if (!this.on) return;
    this.on = false;
    this.root.classList.remove('trippy');
    iframeManager.iframes.get('trippy-cam')?.remove();
    iframeManager.iframes.delete('trippy-cam');
  }
}

export const trippyCam = new TrippyCam();
