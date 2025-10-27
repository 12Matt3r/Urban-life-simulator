/**
 * @file src/utils/storage.js
 * @description Save/load system with autosave and transcript export.
 * Includes both backend placeholders and a frontend-only code-based system.
 */

import { auth } from './auth.js';
import { db } from './db.js';

export const storage = {
  // --- Backend Placeholders (for Bolt team) ---
  async save(state) {
    const { data, error } = await db.saveGame(state);
    if (error) {
      console.error("Failed to save game:", error);
    }
    return !error;
  },

  async load() {
    const { data, error } = await db.loadGame();
    if (error) {
      console.error("Failed to load game:", error);
      return null;
    }
    return data;
  },

  // --- Frontend Code-Based Save/Load ---
  exportToCode() {
    try {
      const state = {
        history: window.__app.history,
        stats: window.__app.stats,
        player: window.__app.player,
        realm: window.__app.realm,
      };
      const jsonString = JSON.stringify(state);
      return btoa(jsonString); // Encode to Base64
    } catch (error) {
      console.error("Failed to create save code:", error);
      return null;
    }
  },

  importFromCode(code) {
    try {
      const jsonString = atob(code); // Decode from Base64
      const state = JSON.parse(jsonString);

      // Basic validation
      if (!state || typeof state !== 'object' || !state.stats || !state.player) {
        throw new Error("Invalid save code format.");
      }

      // Restore the game state
      Object.assign(window.__app.history, state.history || []);
      Object.assign(window.__app.stats, state.stats);
      Object.assign(window.__app.player, state.player);
      window.__app.realm = state.realm || 'uls';

      // Notify the rest of the application
      window.eventBus.publish('stats.update', window.__app.stats);
      window.eventBus.publish('realm.changed', { realm: window.__app.realm });
      window.eventBus.publish('transcript.reset', window.__app.history);
      window.eventBus.publish('hud.toast', { text: 'Game loaded from code.' });

      return true;
    } catch (error) {
      console.error("Failed to load from code:", error);
      window.eventBus.publish('hud.toast', { text: 'Error: Invalid save code.' });
      return false;
    }
  }
};
