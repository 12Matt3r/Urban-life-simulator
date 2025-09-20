import * as Planner from '../systems/autoPlanner.js';

export function mountAutoPlayUI(container, eventBus){
  container.innerHTML = `
    <style>
      #autoplay-dock { background:#2a2a3e; padding:10px; border-radius:8px; border:1px solid #7b52c9; font-size:12px; display:flex; flex-direction:column; gap:8px; }
      #autoplay-dock label { display:flex; justify-content:space-between; align-items:center; gap:8px; }
      #autoplay-dock input[type="range"] { flex:1; }
      #autoplay-dock .speed-controls { display:grid; grid-template-columns: repeat(4, 1fr); gap:5px; }
    </style>
    <div id="autoplay-dock">
      <label><input type="checkbox" id="ap-enabled"> Watch Mode</label>
      <label>Seed <input id="ap-seed" type="number" min="1" step="1" style="width:110px;"></label>
      <button id="ap-seed-rand">Randomize Seed</button>
      <label>Risk <input id="ap-risk" type="range" min="0" max="100" value="50"></label>
      <label>Aggression <input id="ap-agg" type="range" min="0" max="100" value="50"></label>
      <div class="speed-controls">
        <button data-speed="1x">1×</button>
        <button data-speed="2x">2×</button>
        <button data-speed="4x">4×</button>
        <button data-speed="max">Max</button>
      </div>
      <div class="speed-controls">
        <button id="ap-pause">Pause</button>
        <button id="ap-step">Step</button>
      </div>
    </div>
  `;

  const el = id => container.querySelector('#'+id);
  const enabled=el('ap-enabled'), seed=el('ap-seed'), seedRand=el('ap-seed-rand');
  const risk=el('ap-risk'), agg=el('ap-agg');
  const pause=el('ap-pause'), step=el('ap-step');
  let speed='1x';

  container.querySelectorAll('[data-speed]').forEach(b=>{ b.onclick=()=>{ speed=b.dataset.speed; }; });

  seed.value = Math.floor(Math.random()*1e9);
  seedRand.onclick = () => { seed.value = Math.floor(Math.random()*1e9); };

  enabled.onchange = () => toggle(enabled.checked);
  pause.onclick = () => { Planner.stop(); enabled.checked=false; };
  step.onclick = () => Planner.step();

  function toggle(on){
    if (on){
      Planner.start({
        seed:Number(seed.value)||1,
        risk:Number(risk.value)||50,
        aggression:Number(agg.value)||50,
        chaos:25,
        speed
      }, eventBus);
    } else {
      Planner.stop();
    }
  }
}