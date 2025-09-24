// /ui/hud.js (ES5)
(function(global) {
  var hudContainer;

  var HUD = {
    mount: function(container, initialState) {
      if (!container) return;
      hudContainer = container;
      var stats = initialState.player.stats;
      hudContainer.innerHTML = '<div>' +
        '<span>Money: $' + stats.money + '</span> | ' +
        '<span>Health: ' + stats.health + '</span> | ' +
        '<span>Heat: ' + stats.heat + '</span>' +
      '</div>';

      global.eventBus.subscribe('ui.hud.update', this.update);
    },
    unmount: function() {
      if (hudContainer) {
        hudContainer.innerHTML = '';
      }
    },
    update: function(newState) {
      if (!hudContainer) return;
      var stats = newState.player.stats;
      hudContainer.innerHTML = '<div>' +
        '<span>Money: $' + stats.money + '</span> | ' +
        '<span>Health: ' + stats.health + '</span> | ' +
        '<span>Heat: ' + stats.heat + '</span>' +
      '</div>';
    }
  };

  global.HUD = HUD;
})(window);