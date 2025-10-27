/**
 * @file src/utils/storage.js
 * @description Save/load system with autosave and transcript export.
 * This module will be populated by the Bolt team to handle all game state storage.
 */

import { auth } from './auth.js';
import { db } from './db.js';

export const storage = {
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
  }
};
