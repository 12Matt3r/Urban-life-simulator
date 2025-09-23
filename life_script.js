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
import * as Objectives from './systems/objectives.js';

function inferObjectivesFromRole(character) {
  var role = (character && (character.role || character.archetype) || '').toLowerCase();
  var out = [];
  function add(s, soft) { out.push({ text: s, soft: !!soft }); }

  if (/dj|performer|musician|nightlife/.test(role)) {
    add('Book a headline set in a prime district', false);
    add('Keep HEAT under 40 while promoting gigs', true);
    add('Acquire premium gear and a reliable vehicle', true);
  } else if (/bank|launder/.test(role)) {
    add('Establish a clean front business', false);
    add('Move high-value funds without raising HEAT', true);
    add('Network with corporate and street contacts', true);
  } else if (/cop|officer|internal/.test(role)) {
    add('Close a case without civilian casualties', false);
    add('Maintain HEAT under 25 while patrolling', true);
    add('Root out corruption or avoid exposure', true);
  } else if (/crew|gang|boss|leader/.test(role)) {
    add('Build reputation from Crew Member → Crew Lead', false);
    add('Control a safehouse and income stream', true);
    add('Keep HEAT manageable to avoid crackdowns', true);
  } else if (/hacker|priest|mystic/.test(role)) {
    add('Complete a high-stakes digital or spiritual contract', false);
    add('Gain a unique boon or exploit without exceeding HEAT 35', true);
    add('Recruit an ally with complementary skills', true);
  } else if (/skate|driver|stock-car/.test(role)) {
    add('Win a sanctioned event', false);
    add('Secure sponsorship without scandal', true);
    add('Upgrade gear/vehicle safely', true);
  } else if (/cook|quick-service|worker|average/.test(role)) {
    add('Stabilize income and housing', false);
    add('Improve one core stat by +3 through training', true);
    add('Avoid HEAT spikes while exploring side hustles', true);
  } else {
    add('Define a personal milestone and achieve it', false);
    add('Grow one relationship or alliance', true);
    add('Keep HEAT under control while expanding options', true);
  }
  return out;
}

const appContainer = document.getElementById('app-container');

// Game state with role drift support
let gameState = {
  character: null,
  narrativeHistory: [],
  currentEvent: null,
  currentMoods: [],
  rng: createRNG(Date.now())
};

// Initialize narrative engine with local default, WebSim only if explicitly requested (credit-saver mode)
const urlParams = new URLSearchParams(window.location.search);
const useWebsim = urlParams.get('engine') === 'websim';
const engineMode = useWebsim ? 'websim' : 'local';
const engine = createNarrativeEngine({ mode: engineMode });

let sceneImageEl = null;

// Persistence
new PersistenceSystem(eventBus, () => gameState.character, () => gameState.narrativeHistory);

// Glass House
const glasshouse = new GlassHouse(document.getElementById('glasshouse-modal'), eventBus);

// Helper functions for role summary and question enforcement
function sanitizeRole(raw){
  var r=String(raw||'').trim().toLowerCase();
  if(r==='sex worker'||r==='prostitute'||r==='escort'||r.indexOf('prostit')>=0||r.indexOf('sex work')>=0) return 'Nightlife Performer';
  if(r==='gang leader'||(r.indexOf('gang')>=0&&r.indexOf('leader')>=0)) return 'Crew Lead';
  if(r==='gang member'||r.indexOf('gang')>=0) return 'Crew Member';
  var parts=String(raw||'').trim().split(/\s+/),i; for(i=0;i<parts.length;i++){var w=parts[i];parts[i]=w.charAt(0).toUpperCase()+w.slice(1);}
  return parts.join(' ');
}

// Flow
function startCharacterCreation() {
  appContainer.innerHTML = '';
  mountCharacterCreation(appContainer, function(char) {
    if (!char.stats) char.stats = { strength:8, dexterity:8, constitution:8, intelligence:8, wisdom:8, charisma:8, heat:0, money:50, health:100, reputation:0 };
    // Default district if none yet
    if (!char.district) char.district = listDistricts()[0];
    gameState.character = char;
    gameState.character.role = sanitizeRole(char.archetype || 'Undefined');
    Objectives.reset(inferObjectivesFromRole(gameState.character));
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

  // Initialize collapsible sim log
  var simWrap=document.getElementById('sim-log-container');
  var simBtn=document.getElementById('simlog-toggle-btn');
  if(simWrap&&simBtn){
    simBtn.onclick=function(){
      if(simWrap.className.indexOf('collapsed')>=0){
        simWrap.className=simWrap.className.replace('collapsed','').trim();
        simBtn.textContent='▾';
      } else {
        simWrap.className=(simWrap.className+' collapsed').trim();
        simBtn.textContent='▸';
      }
    };
    // Also make the header clickable
    const header = simWrap.querySelector('h4');
    if (header) header.onclick = function() { simBtn.click(); };
  }

  // Render objectives
  function renderObjectives() {
    const objectivesList = document.getElementById('objectives-list');
    if (!objectivesList) return;
    const objectives = Objectives.getAll();
    if (!objectives.length) {
      objectivesList.innerHTML = '<p class="muted">No objectives.</p>';
      return;
    }
    objectivesList.innerHTML = objectives.map(function(o) {
      const statusClass = o.status === 'done' ? 'obj-done' : (o.status === 'failed' ? 'obj-fail' : 'obj-act');
      return '<div class="objective ' + statusClass + '">' + o.text + '</div>';
    }).join('');
  }
  eventBus.subscribe('objectives.updated', renderObjectives);
  renderObjectives(); // initial render

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
        roleTags: gameState.character.roleTags || []
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

function ensureQuestion(text) {
  var t = String(text || '').trim();
  if (!t) return 'What do you do now?';
  // If it already ends with ? keep it; else append
  return /[?]\s*$/.test(t) ? t : (t + ' What do you do now?');
}

function buildRoleSummary() {
  var c = gameState.character || {};
  var role = c.role || c.archetype || 'Undefined';
  return 'You are ' + role + '.';
}

function renderEvent(event) {
  document.getElementById('event-title').textContent = event.title;
  const summary = buildRoleSummary();
  document.getElementById('event-description').textContent = ensureQuestion(summary + ' ' + event.description);
  const btns = document.getElementById('decision-buttons');
  btns.innerHTML = '';

  event.decisions.forEach(function(decision) {
    const b = document.createElement('button');
    b.textContent = decision.text;
    b.onclick = function() { applyDecision(decision); };
    btns.appendChild(b);
  });

  // Add first-step helper after rendering decisions
  var helper=document.getElementById('first-step-hint');
  if(!helper && gameState.narrativeHistory.length <= 1){
    helper=document.createElement('div');
    helper.id='first-step-hint';
    helper.style.fontSize='12px';
    helper.style.color='#a0a0c0';
    helper.style.marginTop='8px';
    btns.parentNode.appendChild(helper);
    helper.textContent='Pick an option to continue →';
  }
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
  eventBus.publish('simlog.push', { text: 'Chose: "' + decision.text + '"' });

  // 5.5) Auto-evaluate objectives
  Objectives.autoEvaluate(gameState.character);

  // 5.6) Remove first-step helper after first decision
  var h=document.getElementById('first-step-hint'); if(h) h.parentNode.removeChild(h);

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