// life_script.js (ES5)
(function(global) {
  // Backrooms integration (storyline-scale frequency)
  var BACKROOMS_TARGET_STORYLINE_PROB = 0.25; // ~25% of storylines ever glitch
  var BACKROOMS_AVG_TURNS_PER_STORY   = 20;   // tune if your stories are longer/shorter

  function computePerTurnBaseProb(target, avgTurns) {
    // q = 1 - (1 - target)^(1/n)
    return 1 - Math.pow(1 - target, 1 / Math.max(1, avgTurns));
  }

  var backroomsState = {
    inBackrooms: false,
    glitchedThisStoryline: false, // ensures max once per storyline
    turnsElapsed: 0,
    lastGlitchTs: 0,
    cooldownMs: 120000
  };

  var BACKROOMS_BASE_PER_TURN = computePerTurnBaseProb(
    BACKROOMS_TARGET_STORYLINE_PROB,
    BACKROOMS_AVG_TURNS_PER_STORY
  ); // ≈ 0.014 when target=0.25 and turns=20

  var appContainer = document.getElementById('app-container');
  var mainGameUI = document.getElementById('main-game-ui');
  var sceneImageEl;
  var narrativeEngine;

  var gameState = {
    character: null,
    narrativeHistory: [],
    currentEvent: null,
    inBackrooms: false,
    calmTurns: 0,
    settings: {
      adultMode: false
    }
  };

  function maybeGlitchIntoBackrooms(decision) {
    if (backroomsState.inBackrooms) return;
    if (backroomsState.glitchedThisStoryline) return; // only once per storyline

    var now = Date.now();
    if (now - backroomsState.lastGlitchTs < backroomsState.cooldownMs) return;

    var base = BACKROOMS_BASE_PER_TURN;
    var turns = backroomsState.turnsElapsed || 0;
    var ramp = 1 + Math.min(0.5, turns / 40);
    var p = base * ramp;

    var txt = String((decision && decision.text) || '').toLowerCase();
    var cues = ['dark', 'hall', 'stair', 'elevator', 'warehouse', 'maintenance', 'basement', 'service', 'flee', 'run', 'hide', 'sleep', 'lay low', 'noclip'];
    var hasCue = false;
    for (var i = 0; i < cues.length; i++) {
      if (txt.indexOf(cues[i]) >= 0) { hasCue = true; break; }
    }
    if (hasCue) p += 0.01;

    if (p > 0.04) p = 0.04;

    var roll = Math.random();
    if (roll >= p) return;

    backroomsState.inBackrooms = true;
    backroomsState.glitchedThisStoryline = true;
    backroomsState.lastGlitchTs = now;

    global.eventBus.publish('simlog.push', { text: 'BK: Reality stutters. The walls don’t meet right…' });
    global.eventBus.publish('backrooms.open');
    global.eventBus.publish('backrooms.set', {
      contentMode: (new URLSearchParams(global.location.search).get('adult') === '1' || (gameState.character && gameState.character.adultMode)) ? 'adult' : 'standard'
    });
    global.eventBus.publish('backrooms.send', { type:'action', text: 'I suddenly glitch through reality. Where am I?' });
  }

  function init() {
    if (!global.eventBus) { console.error('eventBus not found!'); return; }
    if (global.BackroomsBridge) { global.BackroomsBridge.init(global.eventBus); }

    var urlParams = new URLSearchParams(global.location.search);
    var useWebsim = urlParams.get('engine') === 'websim';
    narrativeEngine = createNarrativeEngine({ mode: useWebsim ? 'websim' : 'local' });

    setupEventListeners();
    startCharacterCreation();
  }

  function startCharacterCreation() {
    backroomsState.inBackrooms = false;
    backroomsState.glitchedThisStoryline = false;
    backroomsState.turnsElapsed = 0;

    mainGameUI.hidden = true;
    appContainer.hidden = false;
    mountCharacterCreation(appContainer, gameState.settings, function(character) {
      gameState.character = character;
      gameState.character.stats = character.stats || { strength: 5, dexterity: 5, constitution: 5, intelligence: 5, wisdom: 5, charisma: 5, heat: 0, money: 100, health: 100, reputation: 0 };
      gameState.character.district = character.district || 'Greyline District';

      var role = character.role || 'Wanderer';
      gameState.character.role = role.split(' ').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');

      Objectives.reset(inferObjectivesFromRole(gameState.character));

      appContainer.hidden = true;
      startMainGame();
    });
  }

  function startMainGame() {
    mainGameUI.hidden = false;
    mountHUD(document.getElementById('hud-mount'), gameState.character, global.eventBus);
    sceneImageEl = document.getElementById('scene-image');

    var simLogContainer = document.getElementById('sim-log-container');
    var simLogToggle = document.getElementById('toggle-sim-log');
    if (simLogToggle) {
      simLogToggle.onclick = function() {
        simLogContainer.classList.toggle('collapsed');
        simLogToggle.textContent = simLogContainer.classList.contains('collapsed') ? '▸' : '▾';
        localStorage.setItem('simLogCollapsed', simLogContainer.classList.contains('collapsed'));
      };
      if (localStorage.getItem('simLogCollapsed') === 'true') {
        simLogContainer.classList.add('collapsed');
        simLogToggle.textContent = '▸';
      }
    }

    handleAction({ text: "The simulation begins." });
  }

  function setupEventListeners() {
    var actionInput = document.getElementById('action-input');
    var actionBtn = document.getElementById('action-btn');

    actionBtn.onclick = function() {
      var text = actionInput.value.trim();
      if (text) {
        handleAction({ text: text });
        actionInput.value = '';
      }
    };
    actionInput.onkeydown = function(e) {
      if (e.key === 'Enter') {
        actionBtn.click();
      }
    };

    global.eventBus.subscribe('backrooms.response', function(res) {
      handleEngineResponse(res);
    });

    global.eventBus.subscribe('backrooms.closed', function() {
      gameState.inBackrooms = false;
      global.eventBus.publish('simlog.push', { topic: 'BK', message: 'Returned from the Backrooms.' });
    });

    global.eventBus.subscribe('objectives.updated', renderObjectives);

    global.eventBus.subscribe('backrooms.response', function (res) {
      // res: { description, imageUrl, itemsGained, itemsLost, statsChanges, currentLevel }
      handleEngineResponse({
        title: 'The Backrooms - ' + (res.currentLevel || 'Level ???'),
        description: res.description,
        decisions: [], // Backrooms is free-text only for now
        imagePrompt: res.imageUrl, // Assuming imageUrl can be used as a prompt
        statChanges: res.statsChanges || {}
      });
    });
  }

  function handleAction(playerAction) {
    global.eventBus.publish('applyDecision', playerAction);
    maybeGlitchIntoBackrooms(playerAction);

    if (gameState.inBackrooms) {
      global.eventBus.publish('backrooms.send', playerAction);
      return;
    }

    var context = {
      actionText: playerAction.text,
      character: gameState.character,
      history: gameState.narrativeHistory,
      lastEvent: gameState.currentEvent,
      contentMode: gameState.settings.adultMode ? 'adult' : 'standard',
      time: TimeSystem.getCurrent(),
      weather: WeatherSystem.getCurrent(),
      district: gameState.character.district
    };

    narrativeEngine.nextTurn(context).then(handleEngineResponse);
  }

  function handleEngineResponse(response) {
    gameState.currentEvent = response;
    renderEvent(response);

    if (response.statChanges) {
      var heatChange = 0;
      for (var stat in response.statChanges) {
        if (gameState.character.stats.hasOwnProperty(stat)) {
          gameState.character.stats[stat] += response.statChanges[stat];
          if (stat === 'heat') {
            heatChange = response.statChanges[stat];
          }
        }
      }

      if (heatChange > 0) {
        gameState.calmTurns = 0;
      } else {
        gameState.calmTurns++;
      }

      if (gameState.calmTurns >= 4) {
        var heatReduction = Math.floor(Math.random() * 3) + 3; // 3 to 5
        gameState.character.stats.heat = Math.max(0, gameState.character.stats.heat - heatReduction);
        gameState.calmTurns = 0;
      }

      global.eventBus.publish('character.stats.updated', gameState.character);

    global.eventBus.subscribe('shop.buy', function(item) {
      if (gameState.character.stats.money >= item.price) {
        gameState.character.stats.money -= item.price;
        global.eventBus.publish('character.stats.updated', gameState.character);
        alert('You bought ' + item.name + ' for $' + item.price);
      } else {
        alert("You don't have enough money.");
      }
    });
    }

    gameState.narrativeHistory.push({
      title: response.title,
      chosenDecisionText: response.description
    });
    backroomsState.turnsElapsed = (backroomsState.turnsElapsed || 0) + 1;
    syncStoryLog();

    Objectives.autoEvaluate(gameState.character);

    global.eventBus.publish('simlog.push', { topic: 'SIM', message: response.title });
  }

  function renderEvent(event) {
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-description').textContent = ensureQuestion(event.description);

    var buttonsContainer = document.getElementById('decision-buttons');
    buttonsContainer.innerHTML = '';
    if (event.decisions) {
      event.decisions.forEach(function(decision) {
        var button = document.createElement('button');
        button.textContent = decision.text;
        button.onclick = function() { handleAction(decision); };
        buttonsContainer.appendChild(button);
      });
    }
  }

  function ensureQuestion(t) {
    t = String(t || '').trim();
    return /[?]\s*$/.test(t) ? t : (t + ' What do you do now?');
  }

  function syncStoryLog() {
    var host = document.getElementById('story-log');
    if (!host) return;
    var hist = gameState.narrativeHistory || [];
    var out = [];
    for (var i = 0; i < hist.length; i++) {
      var h = hist[i];
      out.push('<div class="log-entry"><strong>' + (h.title || '') + '</strong><br><span class="muted">→ ' + (h.chosenDecisionText || '') + '</span></div>');
    }
    host.innerHTML = out.join('');
  }

  function renderObjectives() {
    var objectivesList = document.getElementById('objectives-list');
    if (!objectivesList) return;
    var objectives = Objectives.getAll();
    if (!objectives.length) {
      objectivesList.innerHTML = '<p class="muted">No objectives.</p>';
      return;
    }
    objectivesList.innerHTML = objectives.map(function(o) {
      var statusClass = o.status === 'done' ? 'obj-done' : (o.status === 'failed' ? 'obj-fail' : 'obj-act');
      return '<div class="objective ' + statusClass + '">' + o.text + '</div>';
    }).join('');
  }

  function inferObjectivesFromRole(character) {
    var role = (character.role || '').toLowerCase();
    var objectives = [];
    if (role.indexOf('musician') !== -1 || role.indexOf('dj') !== -1) {
      objectives.push({ text: 'Perform at a major venue.' });
    } else if (role.indexOf('journalist') !== -1 || role.indexOf('investigator') !== -1) {
      objectives.push({ text: 'Break a major story.' });
    } else {
      objectives.push({ text: 'Establish a reputation in the city.' });
    }
    return objectives;
  }

  // Initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);