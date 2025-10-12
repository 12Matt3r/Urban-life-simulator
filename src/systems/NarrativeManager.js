/*
Loads and manages narrative data from JSON files.
*/
const NarrativeManager = {
  init() {
    global.eventBus.subscribe('NARRATIVE_START', (narrativeId) => this.loadNarrative(narrativeId));
  },

  loadNarrative(narrativeId) {
    fetch(`narratives/${narrativeId}.json`)
      .then(response => response.json())
      .then(data => {
        global.eventBus.publish('NARRATIVE_LOADED', data);
      })
      .catch(error => console.error('Error loading narrative:', error));
  }
};

NarrativeManager.init();
window.global.narrativeManager = NarrativeManager;