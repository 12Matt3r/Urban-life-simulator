(function(global) {
  'use strict';

  // The main audio manager for the game
  const GameAudio = {
    sfx: new Map(),
    playing: new Map(),
    routing: {},

    /**
     * Registers a pack of sound effects, making them available for playback.
     * @param {object} pack - The SFX pack object from the payload.
     */
    registerPack: function(pack) {
      if (!pack || !pack.items || !Array.isArray(pack.items)) {
        console.error('Invalid SFX pack provided:', pack);
        return;
      }
      pack.items.forEach(item => {
        if (this.sfx.has(item.id)) {
          console.warn('Duplicate SFX ID found, overwriting:', item.id);
        }
        this.sfx.set(item.id, item);
      });
    },

    /**
     * Sets the routing for audio buses. (Currently for future use)
     * @param {object} routingConfig - The routing configuration object.
     */
    setRouting: function(routingConfig) {
      this.routing = routingConfig || {};
    },

    /**
     * Plays a sound effect by its ID.
     * @param {string} id - The ID of the sound effect to play.
     * @param {object} [options] - Optional playback settings.
     * @param {number} [options.gain] - Override default gain (0.0 to 1.0).
     * @param {boolean} [options.loop] - Override default loop setting.
     */
    playSfx: function(id, options) {
      const sound = this.sfx.get(id);
      if (!sound) {
        console.error('SFX not found:', id);
        return null;
      }

      // If this is a looping sound and it's already playing, don't start a new one.
      if (sound.loop && this.playing.has(id)) {
        return this.playing.get(id);
      }

      const audio = new Audio();
      audio.src = sound.path;

      // Apply settings from data, overridden by options
      const loop = (options && typeof options.loop !== 'undefined') ? options.loop : sound.loop;
      const gain = (options && typeof options.gain !== 'undefined') ? options.gain : sound.gain;

      audio.loop = !!loop;
      audio.volume = Math.max(0, Math.min(1, gain || 1.0));

      audio.play().catch(e => {
        console.error('Error playing SFX:', id, e);
      });

      if (loop) {
        // Track looping sounds to allow them to be stopped later
        this.playing.set(id, audio);
      } else {
        // For one-shot sounds, clean up the element after it finishes
        audio.addEventListener('ended', function() {
          audio.remove();
        });
      }

      return audio;
    },

    /**
     * Stops a looping sound effect by its ID.
     * @param {string} id - The ID of the looping sound effect to stop.
     */
    stopSfx: function(id) {
      const audio = this.playing.get(id);
      if (audio) {
        audio.pause();
        audio.src = ''; // Release resource
        audio.remove();
        this.playing.delete(id);
      }
    },

    /**
     * Stops all currently playing looping sounds.
     */
    stopAll: function() {
        this.playing.forEach((audio, id) => {
            this.stopSfx(id);
        });
    }
  };

  global.GameAudio = GameAudio;

})(window);