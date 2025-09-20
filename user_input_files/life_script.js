import { eventBus } from './systems/eventBus.js';
import { mountCharacterCreation } from './ui/characterCreation.js';
import { mountScenarioStart } from './ui/scenarioStart.js';
import { mountHUD } from './ui/hud.js';
import { mountRadio } from './ui/radio.js';
import { mountAutoPlayUI } from './ui/autoplayDock.js';
import { GlassHouse } from './ui/glasshouse.js';
import { openCommunityHub } from './ui/communityHub.js';
import { PersistenceSystem } from './systems/persistence.js';

const appContainer = document.getElementById('app-container');
let character = null;
let history = [];

// Persistence
new PersistenceSystem(eventBus, () => character, () => history);

// Glass House
const glasshouse = new GlassHouse(document.getElementById('glasshouse-modal'), eventBus);

// Flow
function startCharacterCreation() {
  appContainer.innerHTML = '';
  mountCharacterCreation(appContainer, (char) => {
    character = char;
    startScenario();
  });
}

function startScenario() {
  appContainer.innerHTML = '';
  mountScenarioStart(appContainer, character, (char, scenario) => {
    // Apply stat bonuses
    Object.entries(scenario.statBonuses).forEach(([stat, val]) => {
      char.stats[stat] = (char.stats[stat] || 0) + val;
    });
    history.push({ title: "Origin", chosenDecisionText: scenario.text });
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

  // HUD
  mountHUD(document.getElementById('hud-mount'), character, eventBus);

  // Radio
  mountRadio(document.getElementById('radio-dock'), eventBus);

  // Auto-play
  mountAutoPlayUI(document.getElementById('autoplay-dock'), eventBus);

  // Listen for HUD actions
  eventBus.subscribe('hud.community', () => openCommunityHub());
  eventBus.subscribe('hud.glasshouse', () => glasshouse.enter(character));

  // Mock events until narrative engine
  playMockEvent();
}

function playMockEvent() {
  const eventTitle = "Street Encounter";
  const eventDesc = "A shady figure approaches you with a deal.";
  const decisions = [
    { text: "Take the deal", effect: { charisma: +1 } },
    { text: "Refuse", effect: { wisdom: +1 } }
  ];

  document.getElementById('event-title').textContent = eventTitle;
  document.getElementById('event-description').textContent = eventDesc;
  const btns = document.getElementById('decision-buttons');
  btns.innerHTML = '';

  decisions.forEach(d => {
    const b = document.createElement('button');
    b.textContent = d.text;
    b.onclick = () => {
      Object.entries(d.effect).forEach(([stat, val]) => {
        character.stats[stat] += val;
      });
      eventBus.publish('character.stats.updated', character);
      history.push({ title: eventTitle, chosenDecisionText: d.text });
      document.getElementById('sim-log').innerHTML += `<div>Chose: ${d.text}</div>`;
      playMockEvent(); // loop new events
    };
    btns.appendChild(b);
  });
}

startCharacterCreation();