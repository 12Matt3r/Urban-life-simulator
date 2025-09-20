// ui/characterCreation.js
import { createRNG } from '../systems/rng.js';

// Seed list is just inspiration; NOT a limit.
const SEED_IDEAS = [
  'Famous DJ','Street Photographer','Underground Chef','Paramedic',
  'Graffiti Curator','Drone Racer','Fixer','Tattoo Artist',
  'Forensic Accountant','Nightclub Promoter','E-sports Grinder','Street Preacher',
  'Bike Messenger','Community Organizer','Sound Engineer','Street Magician',
  'Urban Farmer','Data Broker','Film Runner','Rooftop Climber'
];

const ABILITIES = [
  'strength','dexterity','constitution','intelligence','wisdom','charisma',
  'heat','money','health','reputation'
];

export function mountCharacterCreation(container, onComplete){
  let seed = Date.now()>>>0;
  let rng = createRNG(seed);
  let pickedIdea = '';
  let customArchetype = '';

  container.innerHTML = `
    <style>
      .creation-card { max-width: 920px; width:100%; }
      .row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
      .ideas { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
      .idea { padding:8px 10px; border:1px solid #3a3a5e; border-radius:999px; cursor:pointer; background:#1a1a2e; font-size:12px; }
      .idea.selected { border-color:#00bcd4; box-shadow:0 0 0 2px rgba(0,188,212,.25); }
      .abilities-grid { display:grid; grid-template-columns: repeat(5, 1fr); gap:10px; margin-top:10px; }
      .ability-display { background:#1a1a2e; padding:10px; border-radius:6px; border:1px solid #3a3a5e; display:flex; justify-content:space-between; }
      .muted { color:#a0a0c0; font-size:12px; }
      .seedbox { width:120px; }
    </style>
    <div class="card creation-card">
      <h2>Character Creation</h2>

      <div class="row">
        <input id="char-name" type="text" placeholder="Enter Character Name" style="flex:1; min-width:260px;">
        <label class="muted">Seed</label>
        <input id="seed-input" class="seedbox" type="number" min="1" step="1"/>
        <button id="seed-rand">Randomize Seed</button>
      </div>

      <div style="margin-top:14px;">
        <label class="muted">Who are you? (free text)</label>
        <input id="custom-arch" type="text" placeholder="e.g., 'independent filmmaker and part-time barista with a past in street racing'" style="width:100%;"/>
        <div class="row" style="margin-top:10px;">
          <button id="ideas-refresh">Surprise me (5)</button>
          <span class="muted">— pick an idea or ignore and type your own</span>
        </div>
        <div id="ideas" class="ideas"></div>
      </div>

      <div id="abilities-section" style="margin-top:16px;">
        <button id="rand-abil">Randomize Abilities</button>
        <div class="abilities-grid"></div>
      </div>

      <p class="muted" style="margin-top:14px;">Current seed: <span id="rng-seed"></span></p>
      <button id="create-char" style="margin-top:8px;" disabled>Create Character</button>
    </div>
  `;

  const nameInput        = container.querySelector('#char-name');
  const seedInput        = container.querySelector('#seed-input');
  const seedRandBtn      = container.querySelector('#seed-rand');
  const ideasWrap        = container.querySelector('#ideas');
  const ideasRefreshBtn  = container.querySelector('#ideas-refresh');
  const customArchInput  = container.querySelector('#custom-arch');
  const abilGrid         = container.querySelector('.abilities-grid');
  const randAbilBtn      = container.querySelector('#rand-abil');
  const seedLabel        = container.querySelector('#rng-seed');
  const createBtn        = container.querySelector('#create-char');

  function setSeed(next){
    seed = (Number(next)>>>0)||1;
    rng = createRNG(seed);
    seedInput.value = String(seed);
    seedLabel.textContent = String(seed);
  }
  setSeed(seed);

  seedRandBtn.onclick = () => setSeed((Math.random()*0xFFFFFFFF)>>>0);
  seedInput.onchange  = (e) => setSeed(e.target.value);

  function renderIdeas(){
    const picks = rng.shuffle(SEED_IDEAS).slice(0,5);
    ideasWrap.innerHTML = picks.map(txt => `<span class="idea" data-v="${txt}">${txt}</span>`).join('');
    ideasWrap.querySelectorAll('.idea').forEach(el=>{
      el.onclick = () => {
        ideasWrap.querySelectorAll('.idea').forEach(i=>i.classList.remove('selected'));
        el.classList.add('selected');
        pickedIdea = el.dataset.v;
        // Don't overwrite free text unless empty
        if (!customArchInput.value.trim()) customArchInput.value = pickedIdea;
        validate();
      };
    });
  }
  ideasRefreshBtn.onclick = renderIdeas;
  renderIdeas();

  function rollAbility(n){
    if (n==='heat') return Math.floor(rng.random()*4);
    if (n==='money') return 20 + Math.floor(rng.random()*80);
    if (n==='health') return 80 + Math.floor(rng.random()*21);
    if (n==='reputation') return Math.floor(rng.random()*5);
    return 5 + Math.floor(rng.random()*11);
  }

  const abilityTooltips = {
    strength: 'Strength', dexterity: 'Dexterity', constitution: 'Constitution',
    intelligence: 'Intelligence', wisdom: 'Wisdom', charisma: 'Charisma',
    heat: 'Police Attention', money: 'Money', health: 'Health', reputation: 'Reputation'
  };

  function renderAbilities(){
    abilGrid.innerHTML = ABILITIES.map(n=>{
      const v = rollAbility(n);
      return `<div class="ability-display" data-ability="${n}" data-value="${v}" title="${abilityTooltips[n] || n}">
        <strong>${n.slice(0,3).toUpperCase()}</strong><span>${v}</span>
      </div>`;
    }).join('');
  }

  function validate(){
    createBtn.disabled = !(nameInput.value.trim() && (customArchInput.value.trim()));
    createBtn.textContent = 'Start Simulation';
  }

  nameInput.oninput = validate;
  customArchInput.oninput = validate;
  randAbilBtn.onclick = renderAbilities;

  createBtn.onclick = () => {
    const stats = {};
    abilGrid.querySelectorAll('.ability-display').forEach(el=>{
      stats[el.dataset.ability] = Number(el.dataset.value);
    });
    // Extract lightweight tags for role evolution (split on commas/and/&/hyphens)
    const roleText = customArchInput.value.trim();
    const roleTags = roleText
      .toLowerCase()
      .split(/[,/&]| and | with | plus | - |—/g)
      .map(s=>s.trim()).filter(Boolean).slice(0,8);

    onComplete({
      name: nameInput.value.trim(),
      archetype: roleText,     // full free-text self-description
      roleTags,                // normalized tags used for drift
      stats
    });
  };

  renderAbilities();
  validate();
}