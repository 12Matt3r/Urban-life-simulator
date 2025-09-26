(function(global) {
  'use strict';

  const GameManager = {
    player: {
      name: "Player",
      health: 100,
      sanity: 100,
      money: 50,
      heat: 0,
      clout: 0,
      reputation: 0,
      inventory: []
    },

    time: {
      day: 1,
      hour: 8, // 24-hour format
      minute: 0,
      isNight: function() {
        return this.hour >= 20 || this.hour < 6;
      }
    },

    eventBus: null,

    /**
     * Initializes the GameManager.
     * @param {object} config - Configuration object.
     * @param {object} config.eventBus - The global event bus.
     */
    init: function(config) {
      this.eventBus = config.eventBus;
      if (!this.eventBus) {
        console.error("GameManager init failed: Event bus is missing.");
        return;
      }
      console.log('GameManager initialized.');
      this.publishStats();
    },

    /**
     * Advances the game time by a specified number of minutes.
     * @param {number} minutes - The number of minutes to advance.
     */
    advanceTime: function(minutes) {
      this.time.minute += minutes;
      while (this.time.minute >= 60) {
        this.time.minute -= 60;
        this.time.hour++;
      }
      while (this.time.hour >= 24) {
        this.time.hour -= 24;
        this.time.day++;
        // Trigger daily events here if any
      }
      console.log(`Time advanced to Day ${this.time.day}, ${this.time.hour}:${String(this.time.minute).padStart(2, '0')}`);
      this.eventBus.publish('time:changed', this.time);
    },

    /**
     * Modifies a player stat and publishes an update.
     * @param {string} stat - The name of the stat to modify (e.g., 'money', 'health').
     * @param {number} value - The amount to change the stat by (can be negative).
     */
    modifyStat: function(stat, value) {
      if (this.player.hasOwnProperty(stat)) {
        this.player[stat] += value;
        // Clamp stats where necessary
        if (stat === 'health' || stat === 'sanity') {
          this.player[stat] = Math.max(0, Math.min(100, this.player[stat]));
        }
        if (stat === 'heat') {
          this.player[stat] = Math.max(0, Math.min(5, this.player[stat]));
        }
        console.log(`Stat changed: ${stat} is now ${this.player[stat]}`);
        this.publishStats();
      } else {
        console.warn(`Attempted to modify unknown stat: ${stat}`);
      }
    },

    /**
     * Publishes the current player stats to the event bus.
     */
    publishStats: function() {
      this.eventBus.publish('stats:updated', this.player);
    },

    /**
     * Adds an item to the player's inventory.
     * @param {object} item - The item to add.
     */
    addItem: function(item) {
        this.player.inventory.push(item);
        this.eventBus.publish('inventory:updated', this.player.inventory);
    }
  };

  global.GameManager = GameManager;

})(window);