// systems/weather.js
import { eventBus } from './eventBus.js';
import { createRNG } from './rng.js';

var _wx = { state:'clear', temperatureC:22, visibility:1.0, wind:0.2 };
var _rng = createRNG(12345);
var _lastHour = null;

function _targetTempC(tod){
  // coarse daily curve
  if (tod === 'late-night' || tod === 'dawn') return 16;
  if (tod === 'morning') return 19;
  if (tod === 'afternoon') return 24;
  if (tod === 'evening') return 20;
  return 18; // night
}

function _maybeTransition(tod){
  // transition chance
  var p = 0.2; // 20%
  // storms decay faster
  if (_wx.state === 'storm') p = 0.4;
  if (_rng.random() < p){
    var roll = _rng.random();
    // weighted based on current
    if (_wx.state === 'clear'){
      if (roll < 0.60) _wx.state = 'clear';
      else if (roll < 0.82) _wx.state = 'overcast';
      else if (roll < 0.95) _wx.state = 'rain';
      else _wx.state = 'fog';
    } else if (_wx.state === 'overcast'){
      if (roll < 0.35) _wx.state = 'clear';
      else if (roll < 0.75) _wx.state = 'overcast';
      else if (roll < 0.93) _wx.state = 'rain';
      else _wx.state = 'storm';
    } else if (_wx.state === 'rain'){
      if (roll < 0.25) _wx.state = 'overcast';
      else if (roll < 0.70) _wx.state = 'rain';
      else if (roll < 0.85) _wx.state = 'storm';
      else _wx.state = 'clear';
    } else if (_wx.state === 'storm'){
      if (roll < 0.60) _wx.state = 'rain';
      else if (roll < 0.90) _wx.state = 'overcast';
      else _wx.state = 'fog';
    } else if (_wx.state === 'fog'){
      if (roll < 0.5) _wx.state = 'overcast';
      else _wx.state = 'clear';
    }
  }

  // update temp gently toward target
  var target = _targetTempC(tod);
  var delta = target - _wx.temperatureC;
  _wx.temperatureC = Math.round((_wx.temperatureC + Math.max(-1.5, Math.min(1.5, delta*0.3))) * 10)/10;

  // visibility/wind hints
  if (_wx.state === 'storm'){ _wx.visibility = 0.6; _wx.wind = 0.8; }
  else if (_wx.state === 'rain'){ _wx.visibility = 0.8; _wx.wind = 0.5; }
  else if (_wx.state === 'fog'){ _wx.visibility = 0.5; _wx.wind = 0.2; }
  else if (_wx.state === 'overcast'){ _wx.visibility = 0.9; _wx.wind = 0.3; }
  else { _wx.visibility = 1.0; _wx.wind = 0.2; }
}

function _emit(){
  eventBus.publish('weather.changed', {
    state:_wx.state, temperatureC:_wx.temperatureC, visibility:_wx.visibility, wind:_wx.wind
  });
}

export function initWeather(){
  // hydrate immediately
  _emit();
  // react to time
  eventBus.subscribe('time.tick', function(t){
    if (!t) return;
    if (_lastHour === null) _lastHour = t.hour;
    if (t.hour !== _lastHour){
      _lastHour = t.hour;
      _maybeTransition(t.timeOfDay);
      _emit();
    }
  });
}

export function getWeather(){ return {
  state:_wx.state, temperatureC:_wx.temperatureC, visibility:_wx.visibility, wind:_wx.wind
}; }
