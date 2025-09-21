// Urban Life Simulator - Core Script

// Simple Event Bus for modular communication
var eventBus = {
    events: {},
    on: function(eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    },
    off: function(eventName, fn) {
        if (this.events[eventName]) {
            for (var i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === fn) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
            }
        }
    },
    emit: function(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function(fn) {
                fn(data);
            });
        }
    }
};

// Game State
var gameState = {
    character: null,
    narrativeHistory: [],
    currentEvent: null,
    currentMoods: [],
    objectives: [],
    weather: null,
    rng: {
        pick: function(arr) {
            if (!arr || arr.length === 0) return undefined;
            return arr[Math.floor(Math.random() * arr.length)];
        }
    }
};

var sceneImageEl = null; // Will be populated in init

function loadEvent(eventName) {
    // Stub for now. This will be implemented with the narrative engine.
    bootlog.log('Loading event: ' + eventName);
}

// Main Game Loop
function gameLoop() {
    // This will be the heart of the simulation
    eventBus.emit('game:loop');
}

// keep stats inside sane bounds
function _clamp(n, lo, hi){ return n < lo ? lo : (n > hi ? hi : n); }

function applyDecision(decision) {
  // --- 1) Defensive defaults
  var stats = gameState.character && gameState.character.stats ? gameState.character.stats : (gameState.character.stats = {});
  if (typeof stats.heat !== 'number') stats.heat = 0;
  if (typeof stats.charisma !== 'number') stats.charisma = 0;

  // --- 2) Adaptive stats
  // charisma wiggle: -1..+1
  stats.charisma += gameState.rng.pick([-1, 0, 1]);

  // heat delta from risk/aggression (single source of truth for Wanted Stars)
  var heatDelta = 0;
  var r = typeof decision.risk === 'number' ? decision.risk : 0;
  var a = typeof decision.aggression === 'number' ? decision.aggression : 0;
  if (r >= 60) heatDelta += 7;
  else if (r >= 40) heatDelta += 4;
  else if (r >= 20) heatDelta += 2;
  if (a >= 60) heatDelta += 1; // extra bump for violent angle

  // gentle cool-off for very low-risk choices
  if (heatDelta === 0 && r < 15) heatDelta = -2;

  var oldHeat = stats.heat;
  stats.heat = _clamp(oldHeat + heatDelta, 0, 100);

  // --- 3) History + image placeholder (instant UX)
  var imageUrl = 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=' + encodeURIComponent(decision.text);
  gameState.narrativeHistory.push({
    title: gameState.currentEvent ? gameState.currentEvent.title : 'Event',
    chosenDecisionText: decision.text,
    imageUrl: imageUrl
  });

  // --- 4) Cross-system events
  eventBus.emit('character.stats.updated', gameState.character);
  if (heatDelta > 0) eventBus.emit('heat.riskyAction'); // informs heat-decay system
  eventBus.emit('image.request', {
    characterPose: 'standing',
    attire: 'streetwear',
    locale: 'cyberpunk city',
    ambience: (gameState.currentMoods && gameState.currentMoods.join(', ')) || 'neutral',
    prop: 'datapad'
  });
  var heatNote = heatDelta !== 0 ? (' (HEAT ' + (heatDelta > 0 ? '+' : '') + heatDelta + ')') : '';
  eventBus.emit('simlog.push', { text: 'Chose: "' + decision.text + '"' + heatNote });
  sceneImageEl.src = imageUrl;

  // --- 5) Advance narrative
  loadEvent(decision.nextEvent);
}

/* ---------------------------------------------
   HEAT DECAY LOOP (hourly cool-down if laying low)
   ES5-safe; depends on eventBus + time.js emitting time.hourly
----------------------------------------------*/
(function(){
  var lastRiskHour = 0;
  var currentHour = 0;

  // mark last risky action whenever heat actually increased
  eventBus.on('heat.riskyAction', function(){
    currentHour = currentHour || 0;
    lastRiskHour = currentHour;
  });

  // every in-game hour, if laid low for 3+ hours, reduce heat by 1
  eventBus.on('time.hourly', function(t){
    if (!t) return;
    currentHour = (t.day*24) + t.hour;
    if ((currentHour - lastRiskHour) >= 3) {
      try {
        if (gameState && gameState.character && gameState.character.stats) {
          var h = gameState.character.stats.heat || 0;
          if (h > 0) {
            var next = h - 1;
            if (next < 0) next = 0;
            gameState.character.stats.heat = next;
            eventBus.emit('character.stats.updated', gameState.character);
            eventBus.emit('simlog.push', { text: 'Cooling off… HEAT -1' });
          }
        }
      } catch (e) {}
    }
  });
})();

// Initialization function
function init() {
    // Initialize logging
    bootlog.init();
    bootlog.log('Initializing Urban Life Simulator...');

    // Get DOM elements
    sceneImageEl = document.getElementById('scene-image');

    // Initialize systems
    Time.init();
    Weather.init();
    Objectives.init();
    Save.init();

    // Initialize UI
    HUD.init();
    Shop.init();
    Radio.init();
    CharacterCreation.init();

    // Setup event listeners
    var toggleLogButton = document.getElementById('toggle-log');
    toggleLogButton.addEventListener('click', function() {
        var simLog = document.getElementById('sim-log');
        simLog.classList.toggle('hidden');
    });

    // Listen for character creation completion
    eventBus.on('character:created', function(character) {
        bootlog.log('Game starting with character: ' + character.role);
        // Start the game loop now
        setInterval(gameLoop, 1000);
        bootlog.log('Game loop started.');
    });

    // Show character creation screen
    CharacterCreation.show();

    bootlog.log('Awaiting character creation...');
}

// Start the game when the DOM is ready
document.addEventListener('DOMContentLoaded', init);
