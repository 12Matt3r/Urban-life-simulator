// ui/characterCreation.js (ES5)
import { createRNG } from '../systems/rng.js';

var SEED_IDEAS = [
  'Famous DJ','Street Photographer','Underground Chef','Paramedic',
  'Graffiti Curator','Drone Racer','Fixer','Tattoo Artist',
  'Forensic Accountant','Nightclub Promoter','E-sports Grinder','Street Preacher',
  'Bike Messenger','Community Organizer','Sound Engineer','Street Magician',
  'Urban Farmer','Data Broker','Film Runner','Rooftop Climber'
];
var ADULT_EXTRAS = [
  'Sex Worker','Gang Member','Gang Leader','Bookie','Fence',
  'Nightlife Performer','Adult Entertainer','Loan Shark'
];
var ABILITIES = [
  'strength','dexterity','constitution','intelligence','wisdom','charisma',
  'heat','money','health','reputation'
];
var ABILITY_TOOLTIPS = {
  strength: 'Strength', dexterity: 'Dexterity', constitution: 'Constitution',
  intelligence: 'Intelligence', wisdom: 'Wisdom', charisma: 'Charisma',
  heat: 'Police Attention', money: 'Money', health: 'Health', reputation: 'Reputation'
};

function sanitizeRoleForStandard(raw) {
  if (!raw) return '';
  var s = String(raw).toLowerCase();
  if (s.indexOf('sex worker')!==-1 || s.indexOf('prostitute')!==-1 || s.indexOf('escort')!==-1) return 'Nightlife Performer';
  if (s.indexOf('gang leader')!==-1) return 'Crew Lead';
  if (s.indexOf('gang')!==-1) return 'Crew Member';
  return raw;
}

export function mountCharacterCreation(container, settings, onComplete) {
  var adultMode = !!(settings && settings.adultMode);
  var rng = createRNG(Date.now());

  container.innerHTML = [
    '<div class="card creation-card" style="max-width: 920px;">',
      '<h2>Character Creation</h2>',
      '<div style="display:flex;justify-content:center;margin-bottom:12px;">',
        '<label><input type="radio" name="mode" value="standard"' + (adultMode ? '' : ' checked') + '> Standard</label>',
        '<label style="margin-left:10px;"><input type="radio" name="mode" value="adult"' + (adultMode ? ' checked' : '') + '> Adult</label>',
      '</div>',
      '<input id="char-name" type="text" placeholder="Enter Character Name" style="width:80%;margin-bottom:10px;">',
      '<input id="char-role" type="text" placeholder="Who are you? (e.g., street musician, rogue journalist)" style="width:80%;">',
      '<div style="margin:10px 0;">',
        '<button id="ideas-refresh">Surprise me (5 ideas)</button>',
      '</div>',
      '<div id="ideas-grid" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;"></div>',
      '<div id="abilities-section">',
        '<button id="rand-abil">Randomize Abilities</button>',
        '<div id="abilities-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:10px;"></div>',
      '</div>',
      '<button id="start-sim" style="margin-top:20px;" disabled>Start Simulation</button>',
    '</div>'
  ].join('');

  var nameInput = container.querySelector('#char-name');
  var roleInput = container.querySelector('#char-role');
  var startBtn = container.querySelector('#start-sim');
  var abilGrid = container.querySelector('#abilities-grid');
  var ideasGrid = container.querySelector('#ideas-grid');

  function validate() {
    startBtn.disabled = !(nameInput.value.trim() && roleInput.value.trim());
  }

  function renderAbilities() {
    abilGrid.innerHTML = ABILITIES.map(function(name) {
      var value = (name === 'heat' || name === 'reputation') ? 0 : (5 + Math.floor(rng.random() * 11));
      if (name === 'money') value = 50 + Math.floor(rng.random() * 151);
      if (name === 'health') value = 100;
      return '<div class="ability-display" title="' + (ABILITY_TOOLTIPS[name] || name) + '">' +
        '<strong>' + name.slice(0,3).toUpperCase() + '</strong>: ' + value +
      '</div>';
    }).join('');
  }

  function renderIdeas() {
    var pool = adultMode ? SEED_IDEAS.concat(ADULT_EXTRAS) : SEED_IDEAS;
    var ideas = rng.shuffle(pool).slice(0, 5);
    ideasGrid.innerHTML = ideas.map(function(idea) {
      return '<button class="idea-chip">' + idea + '</button>';
    }).join('');

    ideasGrid.querySelectorAll('.idea-chip').forEach(function(chip) {
      chip.onclick = function() {
        if (!roleInput.value.trim()) {
          roleInput.value = chip.textContent;
          validate();
        }
      };
    });
  }

  container.querySelectorAll('input[name="mode"]').forEach(function(radio) {
    radio.onchange = function() {
      adultMode = this.value === 'adult';
      if (settings) settings.adultMode = adultMode;
      try {
        localStorage.setItem('uls_adultMode', adultMode);
      } catch (e) {}
      renderIdeas();
    };
  });

  container.querySelector('#ideas-refresh').onclick = renderIdeas;
  container.querySelector('#rand-abil').onclick = renderAbilities;
  nameInput.oninput = validate;
  roleInput.oninput = validate;

  startBtn.onclick = function() {
    var stats = {};
    abilGrid.querySelectorAll('.ability-display').forEach(function(el) {
      var parts = el.textContent.split(':');
      var abbr = parts[0].trim();
      var val = parseInt(parts[1].trim(), 10);
      var fullName = '';
      for (var key in ABILITY_TOOLTIPS) {
        if (key.slice(0,3).toUpperCase() === abbr) {
          fullName = key;
          break;
        }
      }
      if (fullName) stats[fullName] = val;
    });

    var rawRole = roleInput.value.trim();
    var finalRole = adultMode ? rawRole : sanitizeRoleForStandard(rawRole);

    onComplete({
      name: nameInput.value.trim(),
      role: finalRole,
      rawRole: rawRole,
      stats: stats,
      flags: { adultMode: adultMode }
    });
  };

  renderAbilities();
  renderIdeas();
  validate();
}