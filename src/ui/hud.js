/**
 * @file src/ui/hud.js
 * @description Manages the Heads-Up Display (HUD).
 */
import { eventBus } from '../systems/bus.js';

class HUD {
  constructor() {
    this.init();
  }

  init() {
    eventBus.subscribe('stats.update', p => {
      Object.assign(window.__app.stats, p || {});
      this.setHUD(window.__app.stats);
    });
    eventBus.subscribe('hud.toast', p => {
      this.showToast(p.text || '');
    });
    this.setHUD(window.__app.stats);
  }

  setBar(cls, v) {
    v = Math.max(0, Math.min(100, v));
    document.querySelector('.bar.' + cls + ' > i').style.width = v + '%';
  }

  setHUD(stats) {
    this.setBar('health', stats.health);
    this.setBar('sanity', stats.sanity);
    this.setBar('money', Math.min(100, Math.floor(stats.money / 10)));
    this.setBar('fame', Math.min(100, stats.fame));
    this.setBar('heat', Math.min(100, stats.heat * 20)); // 0..5 → 0..100
  }

  showToast(text) {
    const d = document.createElement('div');
    d.className = 'toast';
    d.textContent = text;
    document.getElementById('toasts').appendChild(d);
    setTimeout(() => d.remove(), 3000);
  }
}

export const hud = new HUD();
