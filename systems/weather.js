// systems/weather.js

var Weather = {

    weatherTypes: [
        { name: 'Clear', icon: '☀️', tint: 'rgba(255, 255, 255, 0.05)' },
        { name: 'Overcast', icon: '☁️', tint: 'rgba(200, 200, 200, 0.1)' },
        { name: 'Rainy', icon: '🌧️', tint: 'rgba(100, 100, 150, 0.15)' },
        { name: 'Foggy', icon: '🌫️', tint: 'rgba(150, 150, 150, 0.2)' }
    ],

    init: function() {
        eventBus.on('time.hourly', this.changeWeather.bind(this));
        bootlog.log('Weather system initialized.');
        // Set initial weather
        this.changeWeather();
    },

    changeWeather: function() {
        var newWeather = gameState.rng.pick(this.weatherTypes);
        gameState.weather = newWeather;
        this.updateHud();
    },

    updateHud: function() {
        eventBus.emit('weather:updated', gameState.weather);
    }
};
