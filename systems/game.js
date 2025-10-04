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

    init: function(config) {
      this.eventBus = config.eventBus;
      if (!this.eventBus) {
        console.error("GameManager init failed: Event bus is missing.");
        return;
      }
      console.log('GameManager initialized.');
      this.publishStats();
    },

    advanceTime: function(minutes) {
      this.time.minute += minutes;
      while (this.time.minute >= 60) {
        this.time.minute -= 60;
        this.time.hour++;
      }
      while (this.time.hour >= 24) {
        this.time.hour -= 24;
        this.time.day++;
      }
      this.eventBus.publish('time:changed', this.time);
    },

    modifyStat: function(stat, value) {
      if (this.player.hasOwnProperty(stat)) {
        this.player[stat] += value;
        if (stat === 'health' || stat === 'sanity') {
          this.player[stat] = Math.max(0, Math.min(100, this.player[stat]));
        }
        if (stat === 'heat') {
          this.player[stat] = Math.max(0, Math.min(5, this.player[stat]));
        }
        this.publishStats();
      }
    },

    publishStats: function() {
      this.eventBus.publish('stats:updated', this.player);
    },

    addItem: function(item) {
        this.player.inventory.push(item);
        this.eventBus.publish('inventory:updated', this.player.inventory);
    }
  };

  global.GameManager = GameManager;

})(window);