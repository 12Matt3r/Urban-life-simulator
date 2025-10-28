/**
 * @file src/systems/bus.js
 * @description A simple, global event bus for pub/sub.
 */

export const eventBus = {
  events: {},

  subscribe(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  },

  publish(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(data));
    }
  }
};

// Also attach to window for easy debugging and legacy access
window.eventBus = eventBus;
