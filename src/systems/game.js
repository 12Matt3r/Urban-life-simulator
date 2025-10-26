'use strict';

import { incrementDecisionCount, markTutorialComplete, awardMonkeyPaw } from '../utils/db.js';
import { autoSave } from '../utils/storage.js';

/**
 * GameManager
 * Manages the core player state, stats, and time.
 */
export const GameManager = {
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
    hour: 8,
    minute: 0,
    isNight: function() {
      return this.hour >= 20 || this.hour < 6;
    }
  },

  flags: {
    tutorialComplete: false,
    monkeyPawAwarded: false
  },

  realm: 'tutorial',
  eventBus: null,
  currentTranscriptId: null,
  transcriptEvents: [],
  autoSaveInterval: null,

  init: function(config) {
    this.eventBus = config.eventBus;
    if (!this.eventBus) {
      console.error("GameManager init failed: Event bus is missing.");
      return;
    }
    console.log('GameManager initialized.');
    this.publishStats();
    this.startAutoSave();
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
  },

  recordDecision: function(decision, outcome) {
    this.transcriptEvents.push({
      type: 'decision',
      timestamp: new Date().toISOString(),
      decision,
      outcome,
      stats: { ...this.player }
    });

    incrementDecisionCount().catch(err => {
      console.warn('Failed to increment decision count:', err);
    });
  },

  recordNarrative: function(text, imagePrompt) {
    this.transcriptEvents.push({
      type: 'narrative',
      timestamp: new Date().toISOString(),
      text,
      imagePrompt
    });
  },

  completeTutorial: function() {
    this.flags.tutorialComplete = true;

    markTutorialComplete().catch(err => {
      console.warn('Failed to mark tutorial complete:', err);
    });

    this.eventBus.publish('tutorial:completed');
  },

  grantMonkeyPaw: function() {
    if (this.flags.tutorialComplete && !this.flags.monkeyPawAwarded) {
      this.flags.monkeyPawAwarded = true;

      awardMonkeyPaw().catch(err => {
        console.warn('Failed to award Monkey Paw:', err);
      });

      this.eventBus.publish('monkeypaw:awarded');
    }
  },

  getGameState: function() {
    return {
      realm: this.realm,
      stats: { ...this.player },
      inventory: [...this.player.inventory],
      flags: { ...this.flags },
      position: {
        day: this.time.day,
        hour: this.time.hour,
        minute: this.time.minute
      }
    };
  },

  loadGameState: function(saveData) {
    if (saveData.stats) {
      Object.assign(this.player, saveData.stats);
    }

    if (saveData.inventory) {
      this.player.inventory = saveData.inventory;
    }

    if (saveData.flags) {
      Object.assign(this.flags, saveData.flags);
    }

    if (saveData.position) {
      this.time.day = saveData.position.day || 1;
      this.time.hour = saveData.position.hour || 8;
      this.time.minute = saveData.position.minute || 0;
    }

    if (saveData.realm) {
      this.realm = saveData.realm;
    }

    this.publishStats();
    this.eventBus.publish('game:state:loaded');
  },

  startAutoSave: function() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      this.performAutoSave();
    }, 5 * 60 * 1000);
  },

  performAutoSave: async function() {
    try {
      const gameState = this.getGameState();
      await autoSave(gameState);
      console.log('Auto-save completed');
    } catch (err) {
      console.warn('Auto-save failed:', err);
    }
  },

  cleanup: function() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }
};