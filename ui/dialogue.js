// /ui/dialogue.js (ES5)
(function(global) {
  var dialogueContainer;

  var Dialogue = {
    mount: function(container) {
      if (!container) return;
      dialogueContainer = container;
      dialogueContainer.innerHTML = '<div>Dialogue UI</div>';
    },
    unmount: function() {
      if (dialogueContainer) {
        dialogueContainer.innerHTML = '';
      }
    },
    showText: function(text) {
      if (dialogueContainer) {
        dialogueContainer.innerHTML = '<p>' + text + '</p>';
      }
    }
  };

  global.Dialogue = Dialogue;
})(window);