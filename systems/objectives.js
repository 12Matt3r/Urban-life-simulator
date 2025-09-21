// systems/objectives.js (ES5)
var _list = [];
export function reset(arr){ _list = (arr||[]).map(function(o){ return { text:String(o.text||o), soft:!!o.soft, status:'active' }; }); notify(); }
export function getAll(){ return _list.slice(); }
export function complete(idx){ if(_list[idx]){ _list[idx].status='done'; notify(); } }
export function fail(idx){ if(_list[idx]){ _list[idx].status='failed'; notify(); } }
export function autoEvaluate(character){
  // simple heuristics
  var s = (character && character.stats) || {};
  for (var i=0;i<_list.length;i++){
    var o = _list[i]; if (o.status!=='active') continue;
    if (/heat under/i.test(o.text) && (s.heat||0) < 35) { o.status='done'; }
    if (/win a sanctioned event/i.test(o.text) && (character.roleTags||[]).indexOf('winner')>=0){ o.status='done'; }
  }
  notify();
}
function notify(){
  if (typeof window!=='undefined' && window.eventBus){ window.eventBus.publish('objectives.updated', getAll()); }
}
