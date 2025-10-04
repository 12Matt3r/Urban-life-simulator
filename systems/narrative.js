(function(global) {
  'use strict';

  const NarrativeManager = {
    gameManager: null,
    sceneManager: null,
    eventBus: null,
    sequences: {
      'tutorial': [
        { type: 'log', message: 'You are a disembodied consciousness, floating over the neon-drenched expanse of Chroma City.' },
        { type: 'scene', assetPath: 'backgrounds.city.night.neon_heights', duration: 3000 },
        { type: 'log', message: 'A pull. A tug. A sense of falling...' },
        { type: 'delay', duration: 2000 },
        { type: 'scene', assetPath: 'backgrounds.apartments.playerDefault' },
        { type: 'log', message: 'You wake up with a gasp. The smell of stale synth-coffee fills your small apartment.' },
        { type: 'log', message: 'A notification buzzes on your phone: "Your first ride-share pickup is in 10 minutes."' },
        { type: 'advance_time', minutes: 1 },
        { type: 'log', message: 'You head out into the city.'},
        { type: 'scene', assetPath: 'backgrounds.city.day.market' },
        { type: 'log', message: 'Welcome to Urban Life Simulator. Seize the day.' },
        { type: 'end_sequence', sequenceId: 'tutorial' }
      ]
    },
    currentSequence: null,
    currentIndex: 0,

    init: function(config) {
      this.gameManager = config.gameManager;
      this.sceneManager = config.sceneManager;
      this.eventBus = config.eventBus;
      console.log('NarrativeManager initialized.');
    },

    startSequence: function(sequenceId) {
      const sequence = this.sequences[sequenceId];
      if (sequence) {
        this.currentSequence = sequence;
        this.currentIndex = 0;
        this.executeNextEvent();
      } else {
        console.error('Sequence not found:', sequenceId);
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