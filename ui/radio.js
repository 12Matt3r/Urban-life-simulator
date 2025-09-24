// /ui/radio.js (ES5)
(function(global) {
  var radioContainer;

  var Radio = {
    mount: function(container) {
      if (!container) return;
      radioContainer = container;
      radioContainer.innerHTML = '<div>Radio Player</div>';
    },
    unmount: function() {
      if (radioContainer) {
        radioContainer.innerHTML = '';
      }
    }
  };

  global.Radio = Radio;
})(window);