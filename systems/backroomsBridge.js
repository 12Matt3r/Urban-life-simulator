// systems/backroomsBridge.js (ES5, no optional chaining, drop-in)
// Urban Life Simulator - Backrooms iframe bridge

(function () {
  // Avoid double-install
  if (window.BackroomsBridge && window.BackroomsBridge.__installed) return;

  var DEFAULT_ORIGINS = [
    'https://websim.com',
    'https://www.websim.com'
    // Add more allowed origins if needed, e.g. 'https://staging.websim.com'
  ];

  // Lightweight logger toggled by opts.debug
  function makeLogger(debug) {
    return function () {
      if (!debug) return;
      try {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[BackroomsBridge]');
        console.log.apply(console, args);
      } catch (e) {}
    };
  }

  // True if origin matches one of the allowed origins or *.websim.com
  function isAllowedOrigin(origin, allowList) {
    if (!origin) return false;
    for (var i = 0; i < allowList.length; i++) {
      if (origin === allowList[i]) return true;
    }
    // Wildcard for subdomains of websim.com
    if (/^https?:\/\/([a-z0-9-]+\.)*websim\.com(:\d+)?$/i.test(origin)) {
      return true;
    }
    return false;
  }

  // Safe getElementById
  function $(id) { return document.getElementById(id); }

  var STATE = {
    inited: false,
    ready: false,
    destroyed: false,
    lastPong: 0,
    heartbeatTimer: null,
    rehandshakeTimer: null
  };

  var CONFIG = {
    panelId: 'backrooms-panel',
    frameId: 'backrooms-frame',
    closeId: 'bk-close',
    origins: DEFAULT_ORIGINS,
    url: null,          // if provided, sets iframe src
    autoOpen: false,    // show panel automatically on init
    debug: false,
    targetOrigin: '*'   // computed after we know which origin we’re using
  };

  var bus = null;
  var panel = null;
  var frame = null;
  var closeBtn = null;
  var log = makeLogger(false);
  var messageQueue = [];
  var boundOnMessage = null;
  var boundOnFrameLoad = null;

  var PROTOCOL = {
    version: '1.0.0',
    heartbeatMs: 15000,    // send ping every 15s
    pongTimeoutMs: 25000,  // re-handshake if no pong within 25s
    rehandshakeDelayMs: 1500
  };

  function computeTargetOrigin(url, origins) {
    // If URL is known and matches allowed origins, prefer that as targetOrigin.
    // Otherwise fallback to '*', but we still strictly check incoming origin.
    try {
      if (!url) return '*';
      var a = document.createElement('a');
      a.href = url;
      var origin = a.protocol + '//' + a.host;
      if (isAllowedOrigin(origin, origins)) return origin;
    } catch (e) {}
    return '*';
  }

  function drainQueue() {
    if (!STATE.ready || !frame || !frame.contentWindow) return;
    while (messageQueue.length) {
      var msg = messageQueue.shift();
      _postRaw(msg);
    }
  }

  function _postRaw(message) {
    try {
      frame.contentWindow.postMessage(message, CONFIG.targetOrigin);
    } catch (e) {
      // Swallow; caller will likely requeue/retry on next ready
    }
  }

  function post(type, payload) {
    var msg = { type: String(type || ''), payload: payload || {}, v: PROTOCOL.version };
    if (!frame || !frame.contentWindow || !STATE.ready) {
      messageQueue.push(msg);
      return false;
    }
    _postRaw(msg);
    return true;
  }

  function sendHandshake() {
    post('bk.handshake', { v: PROTOCOL.version });
  }

  function startHeartbeat() {
    stopHeartbeat();
    STATE.lastPong = Date.now();
    STATE.heartbeatTimer = setInterval(function () {
      if (STATE.destroyed) return stopHeartbeat();
      // ping
      _postRaw({ type: 'bk.ping', v: PROTOCOL.version });
      // if pong is stale, mark not-ready and try re-handshake
      if (Date.now() - STATE.lastPong > PROTOCOL.pongTimeoutMs) {
        log('heartbeat timeout -> re-handshake');
        STATE.ready = false;
        scheduleRehandshake();
      }
    }, PROTOCOL.heartbeatMs);
  }

  function stopHeartbeat() {
    if (STATE.heartbeatTimer) {
      clearInterval(STATE.heartbeatTimer);
      STATE.heartbeatTimer = null;
    }
  }

  function scheduleRehandshake() {
    if (STATE.rehandshakeTimer) return;
    STATE.rehandshakeTimer = setTimeout(function () {
      STATE.rehandshakeTimer = null;
      if (STATE.destroyed) return;
      sendHandshake();
    }, PROTOCOL.rehandshakeDelayMs);
  }

  function onMessage(e) {
    if (!e || !e.data) return;
    if (!isAllowedOrigin(String(e.origin), CONFIG.origins)) return;

    var msg = e.data || {};
    if (typeof msg.type !== 'string') return;

    switch (msg.type) {
      case 'bk.ready':
        log('received bk.ready');
        STATE.ready = true;
        STATE.lastPong = Date.now();
        startHeartbeat();
        if (bus) bus.publish('backrooms.ready', msg.payload || {});
        drainQueue();
        break;

      case 'bk.pong':
        STATE.lastPong = Date.now();
        break;

      case 'bk.response':
        if (bus) bus.publish('backrooms.response', msg.payload || {});
        break;

      case 'bk.error':
        if (bus) bus.publish('backrooms.error', msg.message || 'Unknown error');
        break;

      // Optional: the child might request to close the panel
      case 'bk.close':
        hidePanel();
        if (bus) bus.publish('backrooms.closed');
        break;
    }
  }

  function onFrameLoad() {
    // When iframe loads/reloads, reset ready state and handshake again
    log('iframe load -> handshake');
    STATE.ready = false;
    sendHandshake();
  }

  function showPanel() {
    if (panel) panel.hidden = false;
  }

  function hidePanel() {
    if (panel) panel.hidden = true;
  }

  function bindUI() {
    panel = $(CONFIG.panelId);
    frame = $(CONFIG.frameId);
    closeBtn = $(CONFIG.closeId);

    if (frame && CONFIG.url) {
      // set iframe src if provided via opts or global BRIDGE
      frame.src = CONFIG.url;
    }

    if (panel) {
      if (CONFIG.autoOpen && CONFIG.url) {
        panel.hidden = false;
      } else {
        // Hidden by default
        panel.hidden = true;
      }
    }

    if (closeBtn) {
      closeBtn.onclick = function () {
        hidePanel();
        if (bus) bus.publish('backrooms.closed');
      };
    }

    if (frame) {
      boundOnFrameLoad = onFrameLoad;
      frame.addEventListener('load', boundOnFrameLoad);
    }
  }

  function bindBus() {
    if (!bus) return;

    bus.subscribe('backrooms.open', function () { showPanel(); });
    bus.subscribe('backrooms.close', function () { hidePanel(); });

    bus.subscribe('backrooms.send', function (payload) {
      if (!frame || !frame.contentWindow) return;
      // Queue if not ready
      post('bk.action', payload || {});
    });

    bus.subscribe('backrooms.set', function (payload) {
      if (!frame || !frame.contentWindow) return;
      post('bk.set', payload || {});
    });

    bus.subscribe('backrooms.toggle', function () {
      if (!panel) return;
      panel.hidden = !panel.hidden;
    });

    bus.subscribe('backrooms.url', function (newURL) {
      setURL(newURL);
    });
  }

  function setURL(newURL) {
    try {
      if (!frame) return;
      CONFIG.url = String(newURL || '');
      CONFIG.targetOrigin = computeTargetOrigin(CONFIG.url, CONFIG.origins);
      frame.src = CONFIG.url;
      // Reset state; next load will handshake
      STATE.ready = false;
      messageQueue = [];
      log('URL set ->', CONFIG.url, 'targetOrigin:', CONFIG.targetOrigin);
      if (CONFIG.autoOpen) showPanel();
    } catch (e) {}
  }

  function init(eventBus, opts) {
    if (STATE.inited && !STATE.destroyed) return; // already inited
    STATE.inited = true;
    STATE.destroyed = false;

    bus = eventBus || { publish: function(){}, subscribe: function(){} };

    // Merge options
    opts = opts || {};
    CONFIG.panelId = opts.panelId || CONFIG.panelId;
    CONFIG.frameId = opts.frameId || CONFIG.frameId;
    CONFIG.closeId = opts.closeId || CONFIG.closeId;
    CONFIG.origins = (opts.origins && opts.origins.slice ? opts.origins.slice() : CONFIG.origins);
    CONFIG.url = opts.url || (window.ULS_BRIDGE && window.ULS_BRIDGE.BACKROOMS_URL) || CONFIG.url;
    CONFIG.autoOpen = !!opts.autoOpen;
    CONFIG.debug = !!opts.debug;

    log = makeLogger(CONFIG.debug);

    bindUI();
    bindBus();

    CONFIG.targetOrigin = computeTargetOrigin(CONFIG.url, CONFIG.origins);

    // Attach message listener
    boundOnMessage = onMessage;
    window.addEventListener('message', boundOnMessage);

    // Kick off handshake if frame already loaded or will load soon
    if (frame && frame.contentWindow) {
      // If the frame is same-origin or already interactive, attempt immediate handshake
      sendHandshake();
    }

    return {
      open: showPanel,
      close: hidePanel,
      toggle: function () { if (panel) panel.hidden = !panel.hidden; },
      send: function (payload) { return post('bk.action', payload || {}); },
      set: function (payload) { return post('bk.set', payload || {}); },
      setURL: setURL,
      isReady: function () { return !!STATE.ready; },
      destroy: destroy
    };
  }

  function destroy() {
    if (STATE.destroyed) return;
    STATE.destroyed = true;
    stopHeartbeat();

    try {
      if (boundOnMessage) window.removeEventListener('message', boundOnMessage);
      if (frame && boundOnFrameLoad) frame.removeEventListener('load', boundOnFrameLoad);
    } catch (e) {}

    messageQueue = [];
    bus = null;
    panel = null;
    frame = null;
    closeBtn = null;
  }

  window.BackroomsBridge = {
    init: init,
    destroy: destroy,
    __installed: true
  };
})();
