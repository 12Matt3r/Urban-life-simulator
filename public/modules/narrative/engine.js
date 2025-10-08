// Mock Narrative Engine v1.0 — minimal postMessage protocol
const VERSION = '1.0';
const TRACE = new URLSearchParams(location.search).get('trace') === '1';
const log = (...a) => TRACE && console.log('[NarrativeMock]', ...a);

let session = {};
let busy = false;

// Utility: reply
function send(type, data = {}, requestId) {
  const msg = { version: VERSION, type, data };
  if (requestId) msg.requestId = requestId;
  log('→', msg);
  window.parent.postMessage(msg, '*'); // for mock/testing only; pin origin in prod.
}

// Handle messages from host app
function onMessage(ev) {
  const msg = ev.data;
  if (!msg || msg.version !== VERSION || !msg.type) return;
  log('←', msg);

  switch (msg.type) {
    case 'ENGINE_INIT': {
      session = msg.data || {};
      // This is the fix: only send ENGINE_READY after the host has initialized us.
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

    case 'PING': {
      send('PONG', { t: Date.now() }, msg.requestId);
      break;
    }

    default: {
      send('SEQUENCE_ERROR', { code: 'UNKNOWN_MSG', message: `Unhandled type ${msg.type}` }, msg.requestId);
    }
  }
}

window.addEventListener('message', onMessage);