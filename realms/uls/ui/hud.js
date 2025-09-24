// /realms/uls/ui/hud.js
import { eventBus } from '../../kern/eventBus.js';

let _bar, _money, _heat, _rep, _shop, _map, _lh, _dw;

export function mountHUD(state){
  unmountHUD();
  _bar = document.createElement('div');
  _bar.id = 'uls-hud';
  _bar.innerHTML = `
    <div class="hud-left">
      <strong>Urban Life Simulator</strong>
    </div>
    <div class="hud-mid">
      $<span id="uls-money">${state.character.stats.money}</span>
      • Heat: <span id="uls-heat">${state.character.stats.heat}</span>
      • Rep: <span id="uls-rep">${state.character.stats.reputation}</span>
    </div>
    <div class="hud-right">
      <button id="uls-shop">Shop</button>
      <button id="uls-map">Map</button>
      <button id="uls-goto-lh">Living Hell</button>
      <button id="uls-goto-dw">Dreamworld</button>
    </div>
  `;
  document.body.appendChild(_bar);

  _money = _bar.querySelector('#uls-money');
  _heat  = _bar.querySelector('#uls-heat');
  _rep   = _bar.querySelector('#uls-rep');
  _shop  = _bar.querySelector('#uls-shop');
  _map   = _bar.querySelector('#uls-map');
  _lh    = _bar.querySelector('#uls-goto-lh');
  _dw    = _bar.querySelector('#uls-goto-dw');

  _shop.onclick = ()=> eventBus.publish('uls.shop.open');
  _map.onclick  = ()=> eventBus.publish('uls.map.open');
  _lh.onclick   = ()=> eventBus.publish('router.go', {to:'living-hell'});
  _dw.onclick   = ()=> eventBus.publish('router.go', {to:'dreamworld'});

  _bind(eventBus.subscribe('character.stats.updated', (ch)=>{
    if (_money) _money.textContent = ch.stats.money;
    if (_heat)  _heat.textContent  = ch.stats.heat;
    if (_rep)   _rep.textContent   = ch.stats.reputation;
  }));

  // Optional: react to router proxy event
  _bind(eventBus.subscribe('router.go', ({to, params})=>{
    // you can invoke router directly elsewhere; this is just a bridge if you prefer event-driven
  }));
}

export function unmountHUD(){
  if (_bar && _bar.parentNode) _bar.parentNode.removeChild(_bar);
  _bar = _money = _heat = _rep = _shop = _map = _lh = _dw = null;
  _unsubs.forEach(fn=>{ try{fn();}catch(_){}}); _unsubs = [];
}

let _unsubs = [];
function _bind(off){ _unsubs.push(off); }
