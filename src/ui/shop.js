/**
 * @file src/ui/shop.js
 * @description Manages the in-game shop.
 */
import { eventBus } from '../systems/bus.js';

class Shop {
  constructor() {
    window.Shop = this; // Maintain backward compatibility for now
  }

  buy(name, cost) {
    if (window.__app.stats.money < cost) {
      return eventBus.publish('hud.toast', { text: 'Not enough money.' });
    }
    eventBus.publish('stats.update', { money: window.__app.stats.money - cost });
    eventBus.publish('hud.toast', { text: 'Bought ' + name });
  }
}

export const shop = new Shop();
