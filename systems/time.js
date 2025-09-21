import { eventBus } from './eventBus.js';

const TIME_OF_DAY = ['Morning', 'Afternoon', 'Evening', 'Night'];
const WEATHER_TYPES = ['Clear', 'Cloudy', 'Overcast', 'Light Rain', 'Heavy Rain', 'Stormy'];

let timeState = {
  day: 1,
  timeIndex: 0, // Index for TIME_OF_DAY
  timeOfDay: 'Morning'
};

let weatherState = 'Clear';

function advanceTime() {
  timeState.timeIndex++;
  if (timeState.timeIndex >= TIME_OF_DAY.length) {
    timeState.timeIndex = 0;
    timeState.day++;
  }
  timeState.timeOfDay = TIME_OF_DAY[timeState.timeIndex];

  // Randomize weather, but with some inertia
  if (Math.random() < 0.3) { // 30% chance of weather changing
    const newWeatherIndex = Math.floor(Math.random() * WEATHER_TYPES.length);
    weatherState = WEATHER_TYPES[newWeatherIndex];
    eventBus.publish('weather.changed', weatherState);
  }

  eventBus.publish('time.changed', timeState);
}

// For now, let's advance time with each decision.
// We can make this more sophisticated later.
eventBus.subscribe('applyDecision', advanceTime);

// API for other systems to get current time and weather
export function getTimeState() {
  return { ...timeState };
}

export function getWeather() {
  return weatherState;
}

// Initial broadcast
setTimeout(() => {
  eventBus.publish('time.changed', timeState);
  eventBus.publish('weather.changed', weatherState);
}, 100);
