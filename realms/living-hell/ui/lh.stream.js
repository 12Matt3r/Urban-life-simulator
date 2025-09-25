// realms/living-hell/ui/lh.stream.js (ES5)
(function (global) {
  var bus = global.eventBus;

  function init() {
    var send = document.getElementById('lh-send');
    var input = document.getElementById('lh-player-input');
    if (send) send.onclick = function(){
      var t = input.value.trim();
      if (!t) return;
      append('user', t);
      global.LHRuntime.pushAI("You do it. The studio watches.");
      input.value = '';
      // tiny chance to trigger a challenge
      if (Math.random() < 0.25) bus.publish('lh.challenge.start', global.LHChallenges.randomSeed());
    };
  }

  function append(role, text) {
    var host = document.getElementById('lh-stream');
    if (!host) return;
    var div = document.createElement('div');
    div.className = 'lh-msg ' + (role === 'user' ? 'user' : 'ai');
    div.textContent = (role === 'user' ? 'You: ' : 'AI: ') + text;
    host.appendChild(div);
    host.scrollTop = host.scrollHeight;
  }

  function reset() {
    var host = document.getElementById('lh-stream');
    if (host) host.innerHTML = '';
  }

  function teardown(){}

  global.LHStream = { init: init, append: append, reset: reset, teardown: teardown };

})(window);