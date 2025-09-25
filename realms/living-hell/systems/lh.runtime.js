// realms/living-hell/systems/lh.runtime.js (ES5)
(function (global) {
  var bus = global.eventBus;
  var state = {
    viewers: 3,
    chaos: 'Medium',
    pg: false,
    autopilot: false,
    history: [],
    challenges: [],
    activeChallenge: null
  };

  function init() {
    wireEvents();
    renderTopbar();
    bus.publish('lh.ready');
    pushAI("Welcome to LIVING HELL. Be entertaining or be forgotten.");
    loadChallenges();
  }

  function teardown() {
    unwireEvents();
  }

  function wireEvents() {
    bus.subscribe('lh.chat.inject', onChatInject);
    bus.subscribe('lh.challenge.start', onChallengeStart);
    bus.subscribe('lh.challenge.complete', onChallengeComplete);
    bus.subscribe('lh.autopilot.toggle', onAutopilotToggle);
  }
  function unwireEvents() {
    // A real implementation would store the unsubscribe functions and call them here
  }

  function onChatInject(msg) {
    var text = String(msg && msg.text || '').trim();
    if (!text) return;
    if (state.pg && global.formatForOutput) text = global.formatForOutput(text);
    pushAI("📣 Chat: " + text);
    // small chance to bump viewers
    if (Math.random() < 0.3) setViewers(state.viewers + 1 + Math.floor(Math.random()*3));
  }

  function onChallengeStart(def) {
    state.activeChallenge = def || null;
    if (def) pushAI("🎬 Challenge: " + (def.title || 'Untitled'));
    global.LHHUD.renderChallenges([def]);
  }

  function onChallengeComplete(payload) {
    var success = !!(payload && payload.success);
    pushAI(success ? "🏆 Challenge cleared!" : "❌ Challenge failed.");
    state.activeChallenge = null;
    if (success) setViewers(state.viewers + 5 + Math.floor(Math.random()*5));
    global.LHHUD.renderChallenges([]);
  }

  function onAutopilotToggle(flag) {
    state.autopilot = !!flag;
    global.LHAutopilot.toggle(state.autopilot);
  }

  function pushAI(text) {
    state.history.push({ role: 'ai', text: text });
    global.LHStream.append('ai', text);
  }

  function pushUser(text) {
    state.history.push({ role: 'user', text: text });
    global.LHStream.append('user', text);
  }

  function setPG(pg) {
    state.pg = !!pg;
    renderTopbar();
  }

  function setViewers(v) {
    state.viewers = Math.max(1, v|0);
    renderTopbar();
  }

  function setChaos(label) {
    state.chaos = label || 'Medium';
    renderTopbar();
  }

  function renderTopbar() {
    var v = document.getElementById('lh-viewers');
    var c = document.getElementById('lh-chaos');
    var pg = document.getElementById('lh-pg');
    if (v) v.textContent = '👁 ' + state.viewers;
    if (c) c.textContent = '🔥 ' + state.chaos;
    if (pg) pg.checked = state.pg;
  }

  function loadChallenges() {
    try {
      // simple inline fallback
      var seeds = global.LHChallenges && global.LHChallenges.seeds || [];
      state.challenges = seeds;
      global.LHHUD.renderChallenges([]);
    } catch (e) {}
  }

  function save() {
    return {
      viewers: state.viewers,
      chaos: state.chaos,
      pg: state.pg,
      autopilot: state.autopilot,
      history: state.history,
      activeChallenge: state.activeChallenge
    };
  }

  function load(snap) {
    if (!snap) return;
    state.viewers = snap.viewers || 3;
    state.chaos = snap.chaos || 'Medium';
    state.pg = !!snap.pg;
    state.autopilot = !!snap.autopilot;
    state.history = snap.history || [];
    state.activeChallenge = snap.activeChallenge || null;
    renderTopbar();
    global.LHStream.reset();
    for (var i=0;i<state.history.length;i++) {
      var m = state.history[i];
      global.LHStream.append(m.role, m.text);
    }
    if (state.activeChallenge) global.LHHUD.renderChallenges([state.activeChallenge]);
  }

  global.LHRuntime = {
    init: init,
    teardown: teardown,
    pushAI: pushAI,
    pushUser: pushUser,
    setPG: setPG,
    setViewers: setViewers,
    setChaos: setChaos,
    save: save,
    load: load
  };

})(window);