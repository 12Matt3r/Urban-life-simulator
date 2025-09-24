// /systems/save.js (ES5)
(function(global) {
  var SAVE_KEY_PREFIX = 'uls_save_';

  var SaveSystem = {
    save: function(slot, data) {
      try {
        var key = SAVE_KEY_PREFIX + slot;
        localStorage.setItem(key, JSON.stringify(data));
        console.log('Game saved to slot:', slot);
        return true;
      } catch (e) {
        console.error('Failed to save game:', e);
        return false;
      }
    },
    load: function(slot) {
      try {
        var key = SAVE_KEY_PREFIX + slot;
        var data = localStorage.getItem(key);
        if (data) {
          console.log('Game loaded from slot:', slot);
          return JSON.parse(data);
        }
        return null;
      } catch (e) {
        console.error('Failed to load game:', e);
        return null;
      }
    }
  };

  global.SaveSystem = SaveSystem;
})(window);