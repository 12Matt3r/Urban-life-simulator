
/*
A simple event bus for pub/sub.
*/
const eventBus = {
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

window.global = {
  eventBus,
};
