// /systems/narrator.js (ES5)
(function(global) {
  var Narrator = {
    speak: function(text, voice) {
      console.log('[NARRATOR ' + (voice || 'default') + ']: ' + text);
      // TTS hook would go here
    },
    quip: function(context) {
      // Contextual quips would be implemented here
    }
  };
  global.Narrator = Narrator;
})(window);