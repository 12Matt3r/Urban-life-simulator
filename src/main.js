import { initGame } from './assets-loader.js';

// Add a listener to initialize the game once the document is fully loaded.
// This is the new entry point for the entire application.
document.addEventListener('DOMContentLoaded', () => {
  initGame();
});