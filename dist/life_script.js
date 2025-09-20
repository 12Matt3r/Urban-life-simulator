import { eventBus } from './systems/eventBus.js';
import { mountCharacterCreation } from './ui/characterCreation.js';
import { mountScenarioStart } from './ui/scenarioStart.js';
import { mountHUD } from './ui/hud.js';
import { mountRadio } from './ui/radio.js';
import { mountAutoPlayUI } from './ui/autoplayDock.js';
import { GlassHouse } from './ui/glasshouse.js';
import { openCommunityHub } from './ui/communityHub.js';
import { PersistenceSystem } from './systems/persistence.js';
import { createNarrativeEngine } from './systems/narrativeEngine.js';
import { createRNG } from './systems/rng.js';
import { listDistricts, suggestNextDistrict, isValidDistrict } from './systems/districts.js';
import { mountCareerLogModal, openCareerLogModal } from './ui/careerLog.js';

const appContainer = document.getElementById('app-container');

// Game state with role drift support
let gameState = {
  character: null,
  narrativeHistory: [],
  currentEvent: null,
  currentMoods: [],
  rng: createRNG(Date.now())
};

// Initialize narrative engine with WebSim
const engine = createNarrativeEngine({ mode: 'websim' });

let sceneImageEl = null;

// Persistence
new PersistenceSystem(eventBus, () => gameState.character, () => gameState.narrativeHistory);

// Glass House
const glasshouse = new GlassHouse(document.getElementById('glasshouse-modal'), eventBus);

// Flow
function startCharacterCreation() {
  appContainer.innerHTML = '';
  mountCharacterCreation(appContainer, (char) => {
    if (!char.stats) char.stats = { strength:8, dexterity:8, constitution:8, intelligence:8, wisdom:8, charisma:8, heat:0, money:50, health:100, reputation:0 };
    // Default district if none yet
    if (!char.district) char.district = listDistricts()[0];
    gameState.character = char;
    startScenario();
  });
}

function startScenario() {
  appContainer.innerHTML = '';
  mountScenarioStart(appContainer, gameState.character, (char, scenario) => {
    // Apply stat bonuses
    Object.entries(scenario.statBonuses).forEach(([stat, val]) => {
      char.stats[stat] = (char.stats[stat] || 0) + val;
    });
    gameState.narrativeHistory.push({ title: "Origin", chosenDecisionText: scenario.text });
    startMainGame();
  });
}

function startMainGame() {
  appContainer.innerHTML = `
    <div id="main-game-ui">
      <div id="hud-mount"></div>
      <div id="scene-image-container">
        <img id="scene-image" src="" alt="Scene">
      </div>
      <div id="event-container">
        <h3 id="event-title">Welcome</h3>
        <p id="event-description">Your story begins here.</p>
        <div id="decision-buttons"></div>
      </div>
      <div id="radio-dock"></div>
      <div id="autoplay-dock"></div>
      <div id="sim-log-container">
        <h4>Simulation Log</h4>
        <div id="sim-log"></div>
      </div>
    </div>
  `;

  // Store scene image reference
  sceneImageEl = document.getElementById('scene-image');

  // HUD
  mountHUD(document.getElementById('hud-mount'), gameState.character, eventBus);

  // Radio
  mountRadio(document.getElementById('radio-dock'), eventBus);

  // Auto-play
  mountAutoPlayUI(document.getElementById('autoplay-dock'), eventBus);

  // Listen for HUD actions
  eventBus.subscribe('hud.community', () => openCommunityHub());
  eventBus.subscribe('hud.glasshouse', () => glasshouse.enter(gameState.character));
  eventBus.subscribe('hud.careerlog', () => openCareerLogModal());

  // Mount career log modal
  mountCareerLogModal();

  // Manual district change flow (simple prompt for now)
  eventBus.subscribe('ui.district.change.request', () => {
    const options = listDistricts();
    const pick = prompt('Move to which district?\n\n- ' + options.join('\n- ') + '\n\nOr type a custom name:', (gameState.character && gameState.character.district) || options[0]);
    if (!pick) return;
    changeDistrict(pick);
  });

  // Start narrative engine
  nextEvent();
}

async function nextEvent() {
  let ev;
  try {
    ev = await engine.nextEvent({
      character: Object.assign({}, gameState.character, {
        // include evolving role tags explicitly
        roleTags: (gameState.character && gameState.character.roleTags) || []
      }),
      history: gameState.narrativeHistory,
      lastEvent: gameState.currentEvent,
      rails: { maxDecisions: 3, tone: 'gritty-real' }
    });
  } catch (e) {
    console.error(e);
    ev = { id: 'fallback', title: 'Quiet Night', description: 'Nothing stirs; you gather thoughts.', decisions: [{id: 'cont', text: 'Continue', risk: 20, aggression: 10}] };
  }

  gameState.currentEvent = ev;
  renderEvent(ev);

  if (ev.imagePrompt) {
    eventBus.publish('image.request', {
      ambience: gameState.currentMoods.join(', ') || 'neutral',
      locale: (gameState.character && gameState.character.district) || 'city',
      prop: 'none',
      characterPose: 'idle',
      attire: (gameState.character && gameState.character.archetype) || 'streetwear',
      prompt: ev.imagePrompt
    });
  }
}

function renderEvent(event) {
  document.getElementById('event-title').textContent = event.title;
  document.getElementById('event-description').textContent = event.description;
  const btns = document.getElementById('decision-buttons');
  btns.innerHTML = '';

  event.decisions.forEach(decision => {
    const b = document.createElement('button');
    b.textContent = decision.text;
    b.onclick = () => applyDecision(decision);
    btns.appendChild(b);
  });
}

function applyDecision(decision) {
  // 1) Adaptive stats
  gameState.character.stats.charisma += gameState.rng.pick([-1,0,1]);
  if (decision.risk > 50) gameState.character.stats.heat += 5;
  else gameState.character.stats.heat = Math.max(0, gameState.character.stats.heat - 2);

  // 2) Evolve roles
  driftRoles(decision);

  // 3) District drift (heuristic)
  maybeDistrictDrift(decision);

  // 4) History
  const imageUrl = (sceneImageEl && sceneImageEl.src) || '';
  gameState.narrativeHistory.push({
    title: gameState.currentEvent.title,
    chosenDecisionText: decision.text,
    imageUrl
  });

  // 5) Events out
  eventBus.publish('character.stats.updated', gameState.character);
  eventBus.publish('simlog.push', { text: `Chose: "${decision.text}"` });

  // 6) Next
  nextEvent();
}

function driftRoles(decision){
  const tags = new Set(gameState.character.roleTags || []);
  // Use model-sent tags if present
  (Array.isArray(decision.tags) ? decision.tags : []).forEach(t => tags.add(String(t).toLowerCase()));
  // Heuristic extraction from text
  String(decision.text||'')
    .toLowerCase()
    .split(/[,/&]| and | with | for | as | into | - |—/g)
    .map(s=>s.trim())
    .filter(Boolean)
    .slice(0,3)
    .forEach(t => tags.add(t));
  gameState.character.roleTags = Array.from(tags).slice(0,12);
  eventBus.publish('career.tags.updated', gameState.character.roleTags);
}

/** Move districts when choices imply travel/touring/transfer. */
function maybeDistrictDrift(decision){
  const text = String(decision.text||'').toLowerCase();
  const travelCue = ['tour','gig','transfer','relocate','move','skip town','lay low','touring','booking'];
  const hasCue = travelCue.some(k => text.includes(k)) || (decision.tags||[]).some(t => /tour|gig|transfer|relocate|move|travel/i.test(String(t)));
  if (!hasCue) return;

  const next = suggestNextDistrict(gameState.character.district, gameState.character.roleTags || [], Date.now());
  changeDistrict(next);
}

function changeDistrict(name){
  if (!isValidDistrict(name)) return;
  gameState.character.district = String(name);
  eventBus.publish('district.changed', gameState.character.district);
  eventBus.publish('simlog.push', { text:`Moved to district → ${gameState.character.district}` });
}

// Add optional name getter for export convenience
window.Life = {
  state: {
    stats: function() { return (gameState.character && gameState.character.stats) || {}; },
    name: function() { return (gameState.character && gameState.character.name) || 'Player'; }
  }
};

startCharacterCreation();