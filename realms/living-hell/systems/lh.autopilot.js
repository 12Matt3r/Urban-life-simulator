// realms/living-hell/systems/lh.autopilot.js (ES5)
(function (global) {
  var bus = global.eventBus;
  var timer = null, enabled = false;

  var lines = [
    "Producer whisper: \"Ratings dipped. Do something wild.\"",
    "A viewer redeems a prank—confetti cannon detonates in the kitchen.",
    "A buzz on your phone: trending clip… you… dancing badly. Lean in or pivot?",
    "A PA slides a card: \"Surprise duet. 60 seconds.\"",
    "A siren whoop. House rule twist: Speak only in rhyme for 1 minute."
  ];

  function toggle(flag) {
    enabled = !!flag;
    if (enabled) start(); else stop();
    var btn = document.getElementById('lh-autopilot');
    if (btn) btn.textContent = enabled ? '🤖 Autopilot ON' : '🤖 Autopilot OFF';
  }

  function start() {
    tick();
  }

  function stop() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function tick() {
    if (!enabled) return;
    var line = lines[Math.floor(Math.random()*lines.length)];
    global.LHRuntime.pushAI("🛰 " + line);
    // Randomly start a small challenge
    if (Math.random() < 0.4 && global.LHChallenges) {
      var def = global.LHChallenges.randomSeed();
      bus.publish('lh.challenge.start', def);
      setTimeout(function(){
        bus.publish('lh.challenge.complete', { success: Math.random() < 0.7 });
      }, 4000 + Math.random()*4000);
    }
    timer = setTimeout(tick, 5000 + Math.random()*6000);
  }

  global.LHAutopilot = { toggle: toggle };

})(window);