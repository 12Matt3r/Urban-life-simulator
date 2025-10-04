(function(global) {
  'use strict';

  const GameAudio = {
    sfx: new Map(),
    playing: new Map(),
    assetManager: null,

    init: function(config) {
      this.assetManager = config.assetManager;
      console.log('GameAudio system initialized.');
      this.registerSfxFromManifest();
    },

    registerSfxFromManifest: function() {
        if (!this.assetManager || !this.assetManager.manifest.audio || !this.assetManager.manifest.audio.sfx_packs) {
            console.warn("SFX packs not found in asset manifest.");
            return;
        }
        const sfxPacks = this.assetManager.manifest.audio.sfx_packs;
        sfxPacks.forEach(pack => {
            if (pack && pack.items) {
                pack.items.forEach(item => {
                    this.sfx.set(item.id, item);
                });
            }
        });
        console.log(this.sfx.size + ' SFX registered.');
    },

    playSfx: function(id, options) {
      const sound = this.sfx.get(id);
      if (!sound) {
        console.error('SFX not found:', id);
        return null;
      }

      if (sound.loop && this.playing.has(id)) {
        return this.playing.get(id);
      }

      const audio = new Audio();
      audio.src = this.assetManager.baseUrl + sound.path;

      const loop = (options && typeof options.loop !== 'undefined') ? options.loop : sound.loop;
      const gain = (options && typeof options.gain !== 'undefined') ? options.gain : (sound.gain || 1.0);

      audio.loop = !!loop;
      audio.volume = Math.max(0, Math.min(1, gain));

      audio.play().catch(e => {
        console.error('Error playing SFX:', id, e);
      });

      if (loop) {
        this.playing.set(id, audio);
      } else {
        audio.addEventListener('ended', function() {
          audio.remove();
        });
      }
      return audio;
    },

    stopSfx: function(id) {
      const audio = this.playing.get(id);
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.remove();
        this.playing.delete(id);
      }
    },

    stopAll: function() {
        this.playing.forEach((audio, id) => {
            this.stopSfx(id);
        });
    }
  };

  global.GameAudio = GameAudio;

})(window);