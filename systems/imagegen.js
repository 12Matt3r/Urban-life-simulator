// /systems/imagegen.js (ES5)
(function(global) {
  var ImageGen = {
    generate: function(prompt) {
      console.log('[IMAGEGEN] Generating image for prompt:', prompt);
      // Placeholder returns a URL
      return Promise.resolve('https://via.placeholder.com/800x450.png?text=' + encodeURIComponent(prompt));
    }
  };
  global.ImageGen = ImageGen;
})(window);