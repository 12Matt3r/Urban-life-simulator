// /systems/music.js (ES5)
(function(global) {
  var bgm = new Audio();
  bgm.loop = true;

  var MusicSystem = {
    playBGM: function(src, volume) {
      if (bgm.src !== src) {
        bgm.src = src;
      }
      bgm.volume = volume || 0.5;
      bgm.play().catch(function(e) {
        console.warn('Audio autoplay was blocked. Waiting for user gesture.');
      });
    },
    stopBGM: function() {
      bgm.pause();
    }
  };

  // Ensure audio can play after first user interaction
  document.addEventListener('click', function() {
    if (bgm.paused && bgm.src) {
      bgm.play().catch(function(e) {});
    }
  }, { once: true });

  global.MusicSystem = MusicSystem;
})(window);