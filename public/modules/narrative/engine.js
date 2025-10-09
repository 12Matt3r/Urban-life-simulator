// Mock Narrative Engine v1.0 — robust handshake
const VERSION = '1.0';
const TRACE = new URLSearchParams(location.search).get('trace') === '1';
const log = (...a) => TRACE && console.log('[NarrativeMock]', ...a);

let session = {};
let busy = false;

function send(type, data = {}, requestId) {
  const msg = { version: VERSION, type, data };
  if (requestId) msg.requestId = requestId;
  log('→', msg);
  window.parent.postMessage(msg, '*');
}

function onMessage(ev) {
  const msg = ev.data;
  if (!msg || msg.version !== VERSION || !msg.type) return;
  log('←', msg);

  switch (msg.type) {
    case 'ENGINE_INIT': {
      session = msg.data || {};
      send('ENGINE_READY', { mock: true }, msg.requestId);
      break;
    }
    case 'START_SEQUENCE': {
      if (busy) {
        send('SEQUENCE_ERROR', { code: 'BUSY', message: 'Engine busy' }, msg.requestId);
        return;
      }
      busy = true;
      const { sequenceId = 'unknown', params = {} } = msg.data || {};
      send('SEQUENCE_STARTED', { sequenceId, params }, msg.requestId);
      const durationMs = params?.__testDurationMs ?? 300;
      setTimeout(() => {
        busy = false;
        const result = { ok: true, sequenceId, reward: { xp: 10 } };
        send('SEQUENCE_ENDED', result, msg.requestId);
      }, durationMs);
      break;
    }
  }
}

// 1. Announce that the client (iframe) is loaded and ready for initialization.
send('CLIENT_READY');
window.addEventListener('message', onMessage);