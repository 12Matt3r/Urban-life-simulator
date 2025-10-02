(function(global) {
  'use strict';

  const NarrativeManager = {
    gameManager: null,
    sceneManager: null,
    eventBus: null,
    currentSequence: null,
    currentIndex: 0,

    init: function(config) {
      this.gameManager = config.gameManager;
      this.sceneManager = config.sceneManager;
      this.eventBus = config.eventBus;
      console.log('NarrativeManager initialized.');
    },

    startSequence: async function(sequenceId) {
      if (this.currentSequence) {
        console.warn('Another sequence is already in progress.');
        return;
      }

      const path = `narratives/${sequenceId}.json`;
      try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const sequence = await response.json();

        this.currentSequence = sequence;
        this.currentIndex = 0;
        this.executeNextEvent();
      } catch (error) {
        console.error('Failed to load narrative sequence:', sequenceId, error);
      }
    },

    executeNextEvent: function() {
      if (!this.currentSequence || this.currentIndex >= this.currentSequence.length) {
        return;
      }

      const event = this.currentSequence[this.currentIndex];
      this.currentIndex++;

      this.executeEvent(event);
    },

    executeEvent: function(event) {
      switch (event.type) {
        case 'log':
          console.log('[STORY]', event.message);
          this.eventBus.publish('narrative:log', { message: event.message });
          this.executeNextEvent();
          break;

        case 'scene':
          this.sceneManager.setBackground(event.assetPath);
          if (event.duration) {
            setTimeout(this.executeNextEvent.bind(this), event.duration);
          } else {
            this.executeNextEvent();
          }
          break;

        case 'delay':
          setTimeout(this.executeNextEvent.bind(this), event.duration);
          break;

        case 'advance_time':
          this.gameManager.advanceTime(event.minutes);
          this.executeNextEvent();
          break;

        case 'end_sequence':
          console.log('Sequence ended:', event.sequenceId);
          this.currentSequence = null;
          this.currentIndex = 0;
          this.eventBus.publish('narrative:sequence:ended', { id: event.sequenceId });
          break;

        default:
          console.warn('Unknown narrative event type:', event.type);
          this.executeNextEvent();
          break;
      }
    }
  };

  global.NarrativeManager = NarrativeManager;

})(window);