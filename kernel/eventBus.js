// /kernel/eventBus.js (ES5)
export var eventBus = (function() {
  var topics = {};
  return {
    publish: function(topic, payload) {
      (topics[topic] || []).forEach(function(callback) {
        try {
          callback(payload);
        } catch (e) {
          console.error(e);
        }
      });
    },
    subscribe: function(topic, callback) {
      if (!topics[topic]) {
        topics[topic] = [];
      }
      topics[topic].push(callback);
      return function unsubscribe() {
        var index = topics[topic].indexOf(callback);
        if (index > -1) {
          topics[topic].splice(index, 1);
        }
      };
    }
  };
})();