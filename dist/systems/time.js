// systems/time.js
import { eventBus } from './eventBus.js';

var _state = { day: 1, hour: 8, minute: 0, bucket: 'morning' };
var _timer = null;
var TICK_MS = 1500;     // 1.5s per tick
var MIN_PER_TICK = 2;   // advance 2 in-game minutes per tick

function _bucket(h){ // 0-23
  if (h>=4 && h<8) return 'dawn';
  if (h>=8 && h<12) return 'morning';
  if (h>=12 && h<17) return 'afternoon';
  if (h>=17 && h<20) return 'evening';
  if (h>=20 && h<24) return 'night';
  return 'late-night';
}

function _emitTick(prevHour){
  var b = _bucket(_state.hour);
  if (b !== _state.bucket) _state.bucket = b;

  eventBus.publish('time.tick', {
    day: _state.day, hour: _state.hour, minute: _state.minute, timeOfDay: _state.bucket
  });
  if (prevHour !== _state.hour) eventBus.publish('time.hourly', {
    day: _state.day, hour: _state.hour, minute: _state.minute, timeOfDay: _state.bucket
  });
  if (_state.hour === 0 && _state.minute === 0) eventBus.publish('time.daily', { day: _state.day });
}

function _step(){
  if (!_timer) return;
  var prevHour = _state.hour;
  var m = _state.minute + MIN_PER_TICK;
  _state.minute = m % 60;
  if (m >= 60){
    _state.hour = (_state.hour + 1) % 24;
    if (_state.hour === 0) _state.day += 1;
  }
  _emitTick(prevHour);
}

export function startClock(){
  if (_timer) return;
  // initial hydrate
  _emitTick(_state.hour);
  _timer = setInterval(_step, TICK_MS);
}

export function stopClock(){
  if (_timer){ clearInterval(_timer); _timer = null; }
}

export function getTime(){
  return { day:_state.day, hour:_state.hour, minute:_state.minute, timeOfDay:_state.bucket };
}
