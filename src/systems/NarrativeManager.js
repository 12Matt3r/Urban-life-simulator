/**
 * @file src/systems/NarrativeManager.js
 * @description Loads and manages narrative data from JSON files.
 */
import { eventBus } from './bus.js';

class NarrativeManager {
  constructor() {
    eventBus.subscribe('NARRATIVE_START', (narrativeId) => this.loadNarrative(narrativeId));
  }

  loadNarrative(narrativeId) {
    fetch(`narratives/${narrativeId}.json`)
      .then(response => response.json())
      .then(data => {
        eventBus.publish('NARRATIVE_LOADED', data);
      })
      .catch(error => console.error('Error loading narrative:', error));
  }
}

export const narrativeManager = new NarrativeManager();
