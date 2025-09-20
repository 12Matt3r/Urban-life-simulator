// systems/objectives.js
import { eventBus } from './eventBus.js';

let _list = []; // [{ id, text, soft, status: 'active'|'done'|'failed', progress }]
let _nextId = 1;

function _emit() {
  eventBus.publish('objectives.updated', getAll());
}

export function init() {
  _list = [];
  _nextId = 1;
}

export function reset(objs) {
  _list = [];
  _nextId = 1;
  if (objs && objs.length) {
    for (var i = 0; i < objs.length; i++) {
      add(objs[i].text, !!objs[i].soft);
    }
  }
  _emit();
}

export function add(text, soft) {
  var o = {
    id: 'obj_' + (_nextId++),
    text: String(text || '').trim(),
    soft: !!soft,
    status: 'active',
    progress: 0
  };
  _list.push(o);
  _emit();
  return o.id;
}

export function set(id, patch) {
  for (var i = 0; i < _list.length; i++) {
    if (_list[i].id === id) {
      Object.assign(_list[i], patch);
      break;
    }
  }
  _emit();
}

export function getAll() {
  // shallow copy
  var arr = [];
  for (var i = 0; i < _list.length; i++) {
    var o = _list[i];
    arr.push({
      id: o.id, text: o.text, soft: o.soft,
      status: o.status, progress: o.progress
    });
  }
  return arr;
}

export function autoEvaluate(character) {
  // Example rule:
  var heat = character && character.stats ? Number(character.stats.heat || 0) : 0;
  for (var i = 0; i < _list.length; i++) {
    var t = String(_list[i].text || '').toLowerCase();
    if (_list[i].status === 'active') {
      if (t.indexOf('heat under 40') >= 0 && heat < 40) { _list[i].status = 'done'; }
      if (t.indexOf('avoid crackdowns') >= 0 && heat >= 55) { _list[i].status = 'failed'; }
      if (t.indexOf('maintain heat under 25') >= 0 && heat < 25) { _list[i].status = 'done'; }
    }
  }
  _emit();
}
