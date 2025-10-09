// src/systems/narrative.js
export function createNarrative({ target, bus, origin = '*', trace = false } = {}) {
  let clientReady = false;
  let engineReady = false;
  let busy = false;
  const queue = [];
  let reqId = 0;

  const log = (...a) => trace && console.log('[Narrative]', ...a);

  function post(type, data) {
    if (!target) return;
    const msg = { version: '1.0', type, requestId: `r${++reqId}`, data };
    log('→', msg);
    target.postMessage(msg, origin);
  }

  function onMessage(ev) {
    const msg = ev.data;
    // Ensure the message is from our specific iframe source and has the correct structure
    if (ev.source !== target || !msg || msg.version !== '1.0') return;

    log('←', msg);

    switch (msg.type) {
      case 'CLIENT_READY':
        clientReady = true;
        // Now that we know the client is listening, we can initialize it.
        post('ENGINE_INIT', { userId: 'ANON' });
        break;
      case 'ENGINE_READY':
        engineReady = true;
        bus.emit('narrative:engine_ready');
        flush();
        break;
      case 'SEQUENCE_STARTED':
        busy = true;
        bus.emit('narrative:sequence_started', msg.data);
        break;
      case 'SEQUENCE_ENDED':
      case 'SEQUENCE_ERROR':
        busy = false;
        bus.emit('narrative:sequence_ended', { ...msg.data, error: msg.type === 'SEQUENCE_ERROR' });
        flush();
        break;
    }
  }

  function start(sequenceId, params = {}) {
    queue.push({ sequenceId, params });
    flush();
  }

  function flush() {
    if (!engineReady || busy || queue.length === 0) return;
    const next = queue.shift();
    if (next) {
      post('START_SEQUENCE', next);
    }
  }

  function attach() {
    window.addEventListener('message', onMessage);
  }

  function detach() {
    window.removeEventListener('message', onMessage);
  }

  return {
    attach,
    detach,
    start,
    isReady: () => engineReady,
    isBusy: () => busy,
  };
}