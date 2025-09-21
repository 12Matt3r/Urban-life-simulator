// ui/hud.js  (ES5-safe)
export function mountHUD(container, character, eventBus) {
  var name = (character && character.name) || 'Player';
  var stats = (character && character.stats) || {};
  var wanted = Math.min(5, Math.max(0, Math.floor((stats.heat || 0) / 20)));

  container.innerHTML = [
    '<style>',
    '.hud{display:flex;align-items:center;justify-content:space-between;background:#2a2a3e;padding:10px;border-radius:8px;margin-bottom:12px;border:1px solid #7b52c9}',
    '.hud-left{display:flex;align-items:center;gap:12px}',
    '.hud-name{font-weight:700;font-size:16px}',
    '.hud-stars{display:inline-flex;gap:2px;vertical-align:middle}',
    '.hud-stars .star{font-size:14px;opacity:.4}',
    '.hud-stars .star.on{opacity:1}',
    '.hud-stats{display:flex;gap:12px;flex-wrap:wrap}',
    '.hud-stat{min-width:54px;text-align:center;font-size:12px}',
    '.hud-stat span{display:block;color:#a0a0c0;font-size:11px}',
    '.hud-actions{display:flex;gap:8px;flex-wrap:wrap}',
    '.pill{border:1px solid #7b52c9;background:#1a1a2e;border-radius:999px;padding:6px 10px;font-size:12px}',
    '.tag{border:1px solid #3a3a5e;background:#1a1a2e;border-radius:6px;padding:3px 6px;font-size:11px;color:#a0a0c0}',
    '</style>',
    '<div class="hud">',
      '<div class="hud-left">',
        '<div class="hud-name" id="hud-name">', name, '</div>',
        '<div class="hud-stars" id="hud-stars">', renderStars(wanted), '</div>',
        '<span class="tag" id="hud-district"></span>',
        '<span class="tag" id="hud-clock"></span>',
        '<span class="tag" id="hud-weather"></span>',
      '</div>',
      '<div class="hud-stats" id="hud-stats">', renderStats(stats), '</div>',
      '<div class="hud-actions">',
        '<button class="pill" id="hud-save">Save</button>',
        '<button class="pill" id="hud-load">Load</button>',
        '<button class="pill" id="hud-export">Export</button>',
        '<button class="pill" id="hud-story">Story</button>',
        '<button class="pill" id="hud-objectives">Objectives</button>',
        '<button class="pill" id="hud-district-change">Move</button>',
        '<button class="pill" id="hud-community">Community</button>',
        '<button class="pill" id="hud-glasshouse">Glass House</button>',
      '</div>',
    '</div>'
  ].join('');

  // initial badges
  var d = (character && character.district) || 'City';
  document.getElementById('hud-district').textContent = d;

  // wire actions
  document.getElementById('hud-save').onclick = function(){ eventBus.publish('persistence.save','slotA'); };
  document.getElementById('hud-load').onclick = function(){ eventBus.publish('persistence.load','slotA'); };
  document.getElementById('hud-export').onclick = function(){ eventBus.publish('persistence.export'); };
  document.getElementById('hud-community').onclick = function(){ eventBus.publish('hud.community'); };
  document.getElementById('hud-glasshouse').onclick = function(){ eventBus.publish('hud.glasshouse'); };
  document.getElementById('hud-story').onclick = function(){ eventBus.publish('hud.careerlog'); };
  document.getElementById('hud-objectives').onclick = function(){ eventBus.publish('ui.objectives.toggle'); };
  document.getElementById('hud-district-change').onclick = function(){ eventBus.publish('ui.district.change.request'); };

  // live updates
  eventBus.subscribe('character.stats.updated', function(char){
    var s = (char && char.stats) || {};
    document.getElementById('hud-stats').innerHTML = renderStats(s);
    var lvl = Math.min(5, Math.max(0, Math.floor((s.heat || 0)/20)));
    document.getElementById('hud-stars').innerHTML = renderStars(lvl);
  });
  eventBus.subscribe('district.changed', function(name){ document.getElementById('hud-district').textContent = name; });
  eventBus.subscribe('time.tick', function(t){ document.getElementById('hud-clock').textContent = t.label; });
  eventBus.subscribe('weather.update', function(w){ document.getElementById('hud-weather').textContent = w.label; });

  function renderStats(s){
    var keys = ['strength','dexterity','constitution','intelligence','wisdom','charisma','heat','money','health','reputation'];
    var labels = {strength:'STR',dexterity:'DEX',constitution:'CON',intelligence:'INT',wisdom:'WIS',charisma:'CHA',heat:'HEAT',money:'$',health:'HP',reputation:'REP'};
    var tip = {strength:'Strength',dexterity:'Dexterity',constitution:'Constitution',intelligence:'Intelligence',wisdom:'Wisdom',charisma:'Charisma',heat:'Police Attention',money:'Money',health:'Health',reputation:'Reputation'};
    var out = [];
    for (var i=0;i<keys.length;i++){
      var k = keys[i];
      out.push('<div class="hud-stat" title="'+(tip[k]||k)+'"><span>'+labels[k]+'</span><strong>'+ (s[k]||0) +'</strong></div>');
    }
    return out.join('');
  }
  function renderStars(n){
    var out=[], i;
    for(i=0;i<5;i++){ out.push('<span class="star '+(i<n?'on':'')+'">★</span>'); }
    return out.join('');
  }
}