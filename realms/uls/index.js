// /realms/uls/index.js
import { eventBus }   from '../../kern/eventBus.js';
import { saveState }  from '../../kern/saveState.js';
import { safety }     from '../../kern/safety.js';
import { imageGen }   from '../../kern/imageGen.js';
import { audio }      from '../../kern/audio.js';

import { mountULSHub, unmountULSHub } from './ui/hub.js';
import { mountHUD, unmountHUD }       from './ui/hud.js';
import { TimeSystem }                 from './systems/time.js';
import { WeatherSystem }              from './systems/weather.js';
import { Objectives }                 from './systems/objectives.js';
import { createEngine }               from './loop.js';

let _engine = null;
let _state  = null;
let _off    = [];   // unsubscribes

export const ULS = {
  async boot(params = {}) {
    // 1) Load/seed state
    _state = saveState.get('uls.state', {
      character: {
        name: 'Rookie',
        role: 'Wanderer',
        district: 'Greyline',
        stats: { money: 120, health: 100, heat: 0, reputation: 0 }
      },
      history: [],
      calmTurns: 0
    });

    // 2) Systems
    TimeSystem.boot();
    WeatherSystem.boot();
    Objectives.reset([
      { id:'rep1', text:'Establish a reputation in the city', status:'active' }
    ]);

    // 3) UI mount
    mountULSHub();        // layout (pane + scene + input)
    mountHUD(_state);     // top HUD (stats, buttons)

    // 4) Kernel services (bgm is optional)
    audio.playBGM(_pickBGM(), 0.4);

    // 5) Engine
    _engine = createEngine({ safety, TimeSystem, WeatherSystem });

    // 6) Events
    _off.push(eventBus.subscribe('uls.action', onAction));
    _off.push(eventBus.subscribe('uls.shop.buy', onShopBuy));
    _off.push(eventBus.subscribe('character.stats.updated', onStats));
    _off.push(eventBus.subscribe('objectives.updated', onObjectives));

    // First scene
    await _renderScene({ title:'Arrival', description:"You step into Greyline's neon dusk. What's your move?" });
    _save();
  },

  async teardown() {
    _off.forEach(fn => { try { fn(); } catch(_){} });
    _off = [];
    audio.stopRadio(); // if playing
    // keep bgm for cross-realm? stop if you prefer:
    // audio.stopBGM();
    unmountHUD();
    unmountULSHub();
    TimeSystem.teardown();
    WeatherSystem.teardown();
    _engine = null; _state = null;
  }
};

// ---- handlers ----
async function onAction(action) {
  // Update turn timers here if needed
  const ctx = {
    actionText: action.text,
    character: _state.character,
    time: TimeSystem.get(),
    weather: WeatherSystem.get(),
    history: _state.history
  };
  const ev = await _engine.next(ctx);
  await _applyEvent(ev);
}

function onShopBuy(item){
  if (_state.character.stats.money >= item.price){
    _state.character.stats.money -= item.price;
    eventBus.publish('character.stats.updated', _state.character);
    eventBus.publish('uls.toast', `Purchased ${item.name} for $${item.price}`);
  } else {
    eventBus.publish('uls.toast', "Not enough money.");
  }
}

function onStats(ch){
  _state.character = ch;
  _save();
}

function onObjectives(){
  // re-render objectives list if you want; the hub includes a spot
  eventBus.publish('uls.render.objectives');
}

async function _applyEvent(ev){
  // stat changes
  if (ev.statChanges){
    let heatDelta = 0;
    Object.keys(ev.statChanges).forEach(k=>{
      if (_state.character.stats[k] == null) return;
      _state.character.stats[k] += ev.statChanges[k];
      if (k==='heat') heatDelta = ev.statChanges[k];
    });
    // wanted/heat decay when calm:
    if (heatDelta > 0) { _state.calmTurns = 0; }
    else { _state.calmTurns++; }
    if (_state.calmTurns >= 4){
      _state.character.stats.heat = Math.max(0, _state.character.stats.heat - (2 + Math.floor(Math.random()*3)));
      _state.calmTurns = 0;
    }
    eventBus.publish('character.stats.updated', _state.character);
  }

  _state.history.push({ title: ev.title, text: ev.description });
  _save();
  await _renderScene(ev);
}

async function _renderScene(ev){
  // Update text
  eventBus.publish('uls.scene.set', { title: ev.title, description: _ensureQuestion(ev.description), decisions: ev.decisions || [] });

  // Swap scene image (placeholder imageGen)
  const img = await imageGen.request({ realm:'uls', prompt: `${ev.title}: ${ev.description}` });
  eventBus.publish('uls.scene.image', img);

  // Optional radio per district/event
  // audio.playRadio('https://…');
}

function _ensureQuestion(t){
  const s = String(t||'').trim();
  return /\?\s*$/.test(s) ? s : (s + ' What do you do?');
}

function _pickBGM(){
  // choose per district or time
  return 'about:blank'; // set a URL to real music when ready
}

function _save(){ saveState.set('uls.state', _state); }
