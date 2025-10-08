// src/systems/narrative.js
export function createNarrative({ target, bus, origin = '*', trace = false } = {}) {
  let ready = false, busy = false, q = [], id = 0;
  const log = (...a) => trace && console.log('[Narrative]', ...a);

  function post(type, data) {
    if (!target) return; // Don't try to post if the target (iframe) isn't there
    const msg = { version: '1.0', type, requestId: 'r' + (++id), data };
    log('→', msg);
    target.postMessage(msg, origin);
  }

  function init(session = {}) { post('ENGINE_INIT', session); }
  function start(sequenceId, params = {}) { q.push({ sequenceId, params }); flush(); }
  function flush() { if (!ready || busy) return; const n = q.shift(); if (n) post('START_SEQUENCE', n); }

  function onMessage(ev) {
    const m = ev.data;
    if (!m || m.version !== '1.0') return;
    log('←', m);

    switch (m.type) {
      case 'ENGINE_READY':
        ready = true;
        bus.emit('narrative:engine_ready');
        flush();
        break;
      case 'SEQUENCE_STARTED':
        busy = true;
        bus.emit('narrative:sequence_started', m.data);
        break;
      case 'SEQUENCE_ENDED':
      case 'SEQUENCE_ERROR':
        busy = false;
        bus.emit('narrative:sequence_ended', { ...m.data, error: m.type === 'SEQUENCE_ERROR' });
        flush();
        break;
    }
  }

  function attach() { window.addEventListener('message', onMessage); }
  function detach() { window.removeEventListener('message', onMessage); }

  return { init, start, attach, detach, isReady: () => ready, isBusy: () => busy };
}