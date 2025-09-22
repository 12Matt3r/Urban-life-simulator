// systems/eventBus.js (ES5)
(function (global) {
  var topics = {};

  function publish(topic, data) {
    var subscribers = topics[topic];
    if (!subscribers || subscribers.length === 0) {
      return;
    }
    subscribers.forEach(function (callback) {
      try {
        callback(data);
      } catch (e) {
        console.error('Error in event bus subscriber for topic "' + topic + '":', e);
      }
    });
  }

  function subscribe(topic, callback) {
    if (!topics[topic]) {
      topics[topic] = [];
    }
    topics[topic].push(callback);
    return {
      unsubscribe: function () {
        var index = topics[topic].indexOf(callback);
        if (index > -1) {
          topics[topic].splice(index, 1);
        }
      }
    };
  }

  var eventBus = {
    publish: publish,
    subscribe: subscribe
  };

  // Attach to window
  if (typeof global.eventBus === 'undefined') {
    global.eventBus = eventBus;
  }
})(window);