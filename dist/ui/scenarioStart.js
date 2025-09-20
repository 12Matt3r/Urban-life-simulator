import { createRNG } from '../systems/rng.js';

const DISTRICTS = [
  'Greyline District','Hearthside','Glass Wharf','Old Freight','High Court'
];

const SCENARIOS = [
  { text:'You wake in a clinic bed with an overdue bill.', statBonuses:{ intelligence:2, heat:5 } },
  { text:'First night as a courier; the package hums softly.', statBonuses:{ dexterity:2, charisma:1 } },
  { text:'You inherit a food stall; local toughs want a cut.', statBonuses:{ charisma:2, wisdom:1 } },
  { text:'Your rig dies at the ring road; storm incoming.', statBonuses:{ constitution:2, strength:1 } },
  { text:'A bad hack left echoes in your head.', statBonuses:{ wisdom:2, charisma:-1 } }
];

export function mountScenarioStart(container, character, onComplete){
  const rng = createRNG(character.seed || Date.now());
  let district = DISTRICTS[Math.floor(rng.random()*DISTRICTS.length)];
  let currentScenario = null;

  container.innerHTML = `
    <style>
      .scenario-card { max-width: 680px; width:100%; }
      .scenario-preview { background:#1a1a2e; border:1px solid #3a3a5e; padding:20px; margin:20px 0; border-radius:6px; min-height:120px; }
      .scenario-stats { font-size:.9em; color:#a0a0c0; }
      .row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
    </style>
    <div class="card scenario-card">
      <h2>Choose Your Start</h2>
      <div class="row">
        <label>District</label>
        <select id="district">${DISTRICTS.map(d=>`<option ${d===district?'selected':''}>${d}</option>`).join('')}</select>
        <button id="reroll-scenario">Reroll Scenario</button>
      </div>
      <div id="scenario-preview" class="scenario-preview"></div>
      <div id="scenario-controls" class="row" style="justify-content:center;">
        <button id="accept-scenario">Accept & Begin</button>
      </div>
    </div>
  `;

  const previewEl = container.querySelector('#scenario-preview');
  const districtEl = container.querySelector('#district');

  function generateScenario(){
    currentScenario = SCENARIOS[Math.floor(rng.random()*SCENARIOS.length)];
    const bonusText = Object.entries(currentScenario.statBonuses)
      .map(([k,v])=>`${k.toUpperCase()} ${v>0?'+':''}${v}`).join(', ');
    previewEl.innerHTML = `<p><strong>${district}</strong>: ${currentScenario.text}</p>
      <p class="scenario-stats"><strong>Bonuses:</strong> ${bonusText}</p>`;
  }

  districtEl.onchange = () => { district = districtEl.value; };
  container.querySelector('#reroll-scenario').onclick = generateScenario;
  container.querySelector('#accept-scenario').onclick = function() {
    if (!currentScenario) return;
    onComplete(Object.assign({}, character, { district: district }), currentScenario);
  };

  generateScenario();
}