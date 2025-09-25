// realms/living-hell/ui/lh.hud.js (ES5)
(function (global) {
  var bus = global.eventBus;

  function init() {
    // PG toggle
    var pg = document.getElementById('lh-pg');
    if (pg) {
      pg.onchange = function() {
        global.LHRuntime.setPG(pg.checked);
        if (global.SafetyRuntime) {
          global.SafetyRuntime.brandSafeMode = pg.checked;
          global.SafetyRuntime.profanityLevel = pg.checked ? 10 : 60;
        }
      };
    }
    // Autopilot
    var ap = document.getElementById('lh-autopilot');
    if (ap) ap.onclick = function(){ bus.publish('lh.autopilot.toggle', ap.textContent.indexOf('OFF') !== -1); };

    // Quick actions
    var host = document.getElementById('lh-actions');
    if (host) {
      host.innerHTML = '';
      addAction(host, '📣 Ask Chat', function(){ bus.publish('lh.chat.inject', { text: 'What should I do next?' }); });
      addAction(host, '🎬 Start Random Challenge', function(){ bus.publish('lh.challenge.start', global.LHChallenges.randomSeed()); });
      addAction(host, '📈 Hype It Up', function(){ global.LHRuntime.setViewers(global.LHRuntime.save().viewers + 3); global.LHRuntime.pushAI('Viewers spiking after a clutch bit.'); });
    }

    global.LHChat.init();
  }

  function addAction(host, label, fn) {
    var b = document.createElement('button');
    b.className = 'btn';
    b.textContent = label;
    b.onclick = fn;
    host.appendChild(b);
  }

  function renderChallenges(list) {
    var box = document.getElementById('lh-challenges');
    if (!box) return;
    if (!list || !list.length) { box.innerHTML = '<div class="lh-badge">No active challenge</div>'; return; }
    var c = list[0];
    box.innerHTML = '<div class="lh-msg ai"><strong>'+c.title+'</strong><br>'+c.prompt+'</div>'+
      '<div style="margin-top:6px; display:flex; gap:6px;">' +
      '<button class="btn" id="lh-ch-pass">Pass</button>' +
      '<button class="btn primary" id="lh-ch-complete">Complete</button></div>';
    var pass = document.getElementById('lh-ch-pass');
    var done = document.getElementById('lh-ch-complete');
    if (pass) pass.onclick = function(){ global.eventBus.publish('lh.challenge.complete', { success:false }); };
    if (done) done.onclick = function(){ global.eventBus.publish('lh.challenge.complete', { success:true }); };
  }

  function teardown(){}

  global.LHHUD = { init: init, teardown: teardown, renderChallenges: renderChallenges };

})(window);