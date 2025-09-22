// systems/time.js (ES5)
(function (global) {
  var TIME_OF_DAY = [
    { label: 'Morning', key: 'morning' },
    { label: 'Afternoon', key: 'afternoon' },
    { label: 'Evening', key: 'evening' },
    { label: 'Night', key: 'night' }
  ];
  var timeState = {
    day: 1,
    timeIndex: 0
  };

  function advanceTime() {
    timeState.timeIndex++;
    if (timeState.timeIndex >= TIME_OF_DAY.length) {
      timeState.timeIndex = 0;
      timeState.day++;
    }
    var currentTime = TIME_OF_DAY[timeState.timeIndex];
    global.eventBus.publish('time.tick', {
      day: timeState.day,
      label: currentTime.label,
      key: currentTime.key
    });
  }

  // For now, advance time with each decision.
  global.eventBus.subscribe('applyDecision', advanceTime);

  // API
  global.TimeSystem = {
    advance: advanceTime,
    getCurrent: function() {
      var currentTime = TIME_OF_DAY[timeState.timeIndex];
      return {
        day: timeState.day,
        label: currentTime.label,
        key: currentTime.key
      };
    }
  };
})(window);
