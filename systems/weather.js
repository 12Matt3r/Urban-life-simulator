// systems/weather.js (ES5)
(function(global) {
  var WEATHER_TYPES = [
    { label: 'Clear', key: 'clear' },
    { label: 'Cloudy', key: 'cloudy' },
    { label: 'Overcast', key: 'overcast' },
    { label: 'Light Rain', key: 'rain_light' },
    { label: 'Heavy Rain', key: 'rain_heavy' },
    { label: 'Stormy', key: 'storm' }
  ];
  var currentWeatherIndex = 0;

  function changeWeather() {
    // 30% chance of weather changing on each time tick
    if (Math.random() < 0.3) {
      currentWeatherIndex = Math.floor(Math.random() * WEATHER_TYPES.length);
      var newWeather = WEATHER_TYPES[currentWeatherIndex];
      global.eventBus.publish('weather.update', newWeather);
    }
  }

  // Weather changes are tied to time ticks
  global.eventBus.subscribe('time.tick', changeWeather);

  // API
  global.WeatherSystem = {
    getCurrent: function() {
      return WEATHER_TYPES[currentWeatherIndex];
    }
  };

  // Initial broadcast
  setTimeout(function() {
    global.eventBus.publish('weather.update', WEATHER_TYPES[currentWeatherIndex]);
  }, 200);
})(window);
