// /realms/uls/ui/hub.js
import { eventBus } from '../../kern/eventBus.js';

let _root, _input, _sendBtn, _sceneTitle, _sceneText, _decisions, _img, _objBox, _toast;

export function mountULSHub(){
  unmountULSHub();
  _root = document.createElement('div');
  _root.id = 'uls-hub';
  _root.innerHTML = `
    <section class="uls-scene">
      <div class="uls-scene__media"><img id="uls-scene-img" alt="scene"></div>
      <div class="uls-scene__text">
        <h2 id="uls-scene-title">—</h2>
        <p id="uls-scene-desc">—</p>
        <div id="uls-decisions" class="uls-decisions"></div>
      </div>
    </section>
    <section class="uls-input">
      <input id="uls-action" placeholder="Type your action…" maxlength="140" />
      <button id="uls-send">Do it</button>
    </section>
    <aside class="uls-side">
      <h3>Objectives</h3>
      <div id="uls-objectives"></div>
      <div id="uls-toast" class="uls-toast" style="display:none"></div>
    </aside>
  `;
  document.body.appendChild(_root);

  _img        = _root.querySelector('#uls-scene-img');
  _sceneTitle = _root.querySelector('#uls-scene-title');
  _sceneText  = _root.querySelector('#uls-scene-desc');
  _decisions  = _root.querySelector('#uls-decisions');
  _input      = _root.querySelector('#uls-action');
  _sendBtn    = _root.querySelector('#uls-send');
  _objBox     = _root.querySelector('#uls-objectives');
  _toast      = _root.querySelector('#uls-toast');

  _sendBtn.onclick = _submit;
  _input.onkeydown = (e)=>{ if (e.key==='Enter') _submit(); };

  // bus
  _bind(eventBus.subscribe('uls.scene.set', ({title, description, decisions})=>{
    _sceneTitle.textContent = title || '—';
    _sceneText.textContent  = description || '—';
    _decisions.innerHTML = '';
    (decisions||[]).forEach(d=>{
      const b = document.createElement('button');
      b.className = 'uls-choice';
      b.textContent = d.text;
      b.onclick = ()=> eventBus.publish('uls.action', d);
      _decisions.appendChild(b);
    });
  }));

  _bind(eventBus.subscribe('uls.scene.image', (src)=>{
    if (_img) _img.src = src;
  }));

  _bind(eventBus.subscribe('objectives.updated', renderObjectives));
  _bind(eventBus.subscribe('uls.render.objectives', renderObjectives));

  _bind(eventBus.subscribe('uls.toast', (msg)=>{
    if (!_toast) return;
    _toast.textContent = msg;
    _toast.style.display = 'block';
    setTimeout(()=>{ _toast.style.display='none'; }, 1500);
  }));

  renderObjectives();
}

export function unmountULSHub(){
  if (_root && _root.parentNode) _root.parentNode.removeChild(_root);
  _root = _input = _sendBtn = _sceneTitle = _sceneText = _decisions = _img = _objBox = _toast = null;
  _unsubs.forEach(fn=>{ try{fn();}catch(_){}}); _unsubs = [];
}

// helpers
let _unsubs = [];
function _bind(off){ _unsubs.push(off); }

function _submit(){
  const txt = (_input && _input.value || '').trim();
  if (!txt) return;
  eventBus.publish('uls.action', { text: txt });
  _input.value = '';
}

import { Objectives } from '../systems/objectives.js';
function renderObjectives(){
  if (!_objBox) return;
  const list = Objectives.getAll();
  _objBox.innerHTML = list.length
    ? list.map(o => `<div class="obj obj--${o.status||'active'}">${o.text}</div>`).join('')
    : `<p class="muted">No objectives yet.</p>`;
}
