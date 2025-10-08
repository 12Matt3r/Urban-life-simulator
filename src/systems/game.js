'use strict';

/**
 * Creates a GameManager instance.
 * @param {object} deps - The dependencies for the game manager.
 * @param {object} deps.bus - The event bus.
 * @param {object} deps.sceneManager - The scene manager.
 * @param {object} deps.narrative - The narrative system.
 * @returns {object} The public API of the GameManager.
 */
export function createGameManager({ bus, sceneManager, narrative }) {
  const player = {
    name: "Player",
    health: 100,
    sanity: 100,
    money: 50,
    heat: 0,
    clout: 0,
    reputation: 0,
    inventory: []
  };

  const time = {
    day: 1,
    hour: 8,
    minute: 0,
    isNight: () => time.hour >= 20 || time.hour < 6,
  };

  let unsubscribes = [];

  function getStat(stat) {
    return player.hasOwnProperty(stat) ? player[stat] : null;
  }

  function publishStats() {
    bus.emit('stats:updated', { ...player });
  }

  function modifyStat(stat, value) {
    if (player.hasOwnProperty(stat)) {
      player[stat] += value;
      if (stat === 'health' || stat === 'sanity') {
        player[stat] = Math.max(0, Math.min(100, player[stat]));
      }
      if (stat === 'heat') {
        player[stat] = Math.max(0, Math.min(5, player[stat]));
      }
      publishStats();
    }
  }

  function addItem(item) {
    player.inventory.push(item);
    bus.emit('inventory:updated', [...player.inventory]);
  }

  function advanceTime(minutes) {
    time.minute += minutes;
    while (time.minute >= 60) {
      time.minute -= 60;
      time.hour++;
    }
    while (time.hour >= 24) {
      time.hour -= 24;
      time.day++;
    }
    bus.emit('time:changed', { ...time });
  }

  function start() {
    const onNarrativeReady = () => {
      narrative.start('tutorial'); // Example sequence
    };
    unsubscribes.push(bus.on('narrative:engine_ready', onNarrativeReady));

    // Initial state publish
    publishStats();
    console.log('GameManager started and is listening for events.');
  }

  function stop() {
    unsubscribes.forEach(unsub => unsub());
    unsubscribes = [];
    console.log('GameManager stopped.');
  }

  function tick(dt) {
    sceneManager.update(dt);
  }

  return {
    start,
    stop,
    tick,
    getStat,
    modifyStat,
    addItem,
    advanceTime,
    getPlayerState: () => ({ ...player }),
  };
}