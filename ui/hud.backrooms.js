// ui/hud.backrooms.js (ES5, safe add-on)

(function () {
  // ---- tiny, local event bus shim (uses global if present) ----
  var Bus = window.eventBus || (function () {
    var subs = {};
    return {
      publish: function (t, p) {
        (subs[t] || []).forEach(function (fn) { try { fn(p); } catch (e) {} });
      },
      subscribe: function (t, fn) {
        subs[t] = subs[t] || [];
        subs[t].push(fn);
        return function () {
          subs[t] = (subs[t] || []).filter(function (f) { return f !== fn; });
        };
      }
    };
  })();

  // ---- config / ids ----
  var IDS = {
    containerProbe: ['.hud', '.hud-topbar', '#hud', '.ui-bar', '.topbar'],
    buttonRowId:   'uls-hud-extra-row',
    shopBtnId:     'uls-btn-shop',
    bkBtnId:       'uls-btn-backrooms',
    bkPanelId:     'backrooms-panel'
  };

  // ---- utilities ----
  function $(sel, root) { return (root || document).querySelector(sel); }
  function ensureContainer() {
    var i, host = null;
    for (i = 0; i < IDS.containerProbe.length; i++) {
      host = $(IDS.containerProbe[i]);
      if (host) break;
    }
    if (!host) {
      // last resort: create a minimal bar in body
      host = document.createElement('div');
      host.className = 'hud topbar uls-hud-fallback';
      host.style.cssText = 'position:fixed;left:0;right:0;top:0;display:flex;gap:8px;align-items:center;padding:6px 10px;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);z-index:9999;color:#fff;font-family:sans-serif;';
      document.body.appendChild(host);
    }
    // create (or find) our addon row
    var row = document.getElementById(IDS.buttonRowId);
    if (!row) {
      row = document.createElement('div');
      row.id = IDS.buttonRowId;
      row.style.cssText = 'display:flex;gap:8px;margin-left:auto;';
      host.appendChild(row);
    }
    return row;
  }

  function makeBtn(id, label, title) {
    var btn = document.createElement('button');
    btn.id = id;
    btn.textContent = label;
    btn.title = title || label;
    btn.style.cssText = 'cursor:pointer;border:1px solid #999;background:#181818;color:#fff;border-radius:6px;padding:6px 10px;line-height:1;';
    btn.onmouseenter = function () { btn.style.background = '#222'; };
    btn.onmouseleave = function () { btn.style.background = '#181818'; };
    return btn;
  }

  function once(fn) {
    var done = false;
    return function () { if (!done) { done = true; try { fn(); } catch (e) {} } };
  }

  // ---- feature: ensure Backrooms panel exists (non-invasive) ----
  function ensureBackroomsPanel() {
    if (document.getElementById(IDS.bkPanelId)) return;
    // create a minimal, hidden panel if the app hasn’t provided one
    var panel = document.createElement('div');
    panel.id = IDS.bkPanelId;
    panel.hidden = true;
    panel.style.cssText = 'position:fixed;inset:48px 24px 24px;z-index:9998;background:#0b0b0f;border:1px solid #2a2a2a;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.6);overflow:hidden;';
    panel.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#121218;border-bottom:1px solid #222;color:#fff;font-family:sans-serif;">' +
        '<strong>Backrooms</strong>' +
        '<button id="bk-close" style="cursor:pointer;border:1px solid #666;background:#181818;color:#fff;border-radius:6px;padding:4px 8px;">Close</button>' +
      '</div>' +
      '<iframe id="backrooms-frame" src="" style="border:0;width:100%;height:calc(100% - 44px);background:#000;"></iframe>';
    document.body.appendChild(panel);

    // wire to bridge if present
    if (window.BackroomsBridge && typeof window.BackroomsBridge.init === 'function') {
      window.BackroomsBridge.init(Bus);
    }
  }

  // ---- attach buttons ----
  function attachButtons() {
    var row = ensureContainer();
    // Shop button (idempotent)
    if (!document.getElementById(IDS.shopBtnId)) {
      var shop = makeBtn(IDS.shopBtnId, 'Shop', 'Open the in-game shop');
      shop.onclick = function () {
        Bus.publish('shop.open', { source: 'hud.backrooms' });
      };
      row.appendChild(shop);
    }

    // Backrooms button (idempotent)
    if (!document.getElementById(IDS.bkBtnId)) {
      var bk = makeBtn(IDS.bkBtnId, 'Backrooms', 'Enter/exit the Backrooms view');
      bk.onclick = function () {
        var p = document.getElementById(IDS.bkPanelId);
        if (!p) ensureBackroomsPanel(), p = document.getElementById(IDS.bkPanelId);
        if (!p) return;
        var hidden = !!p.hidden;
        p.hidden = !hidden;
        Bus.publish(hidden ? 'backrooms.open' : 'backrooms.close');
      };
      row.appendChild(bk);
    }
  }

  // ---- wire minimal listeners so things work out of the box ----
  function bootstrapListeners() {
    // Close button in the panel
    Bus.subscribe('backrooms.ready', function () {
      var close = document.getElementById('bk-close');
      if (close && !close._wired) {
        close._wired = true;
        close.onclick = function () {
          var p = document.getElementById(IDS.bkPanelId);
          if (p) p.hidden = true;
          Bus.publish('backrooms.closed');
        };
      }
    });

    // Example “shop” default (non-invasive): publish only.
    // Your real shop UI can subscribe to `shop.open`.
    Bus.subscribe('shop.open', function () {
      // no-op here; leave this for your real shop module
      // console.log('[hud.backrooms] shop.open event emitted');
    });
  }

  // ---- start when DOM + core HUD are around ----
  var start = once(function () {
    ensureBackroomsPanel();  // creates if missing + calls Bridge.init
    attachButtons();         // adds Shop + Backrooms buttons safely
    bootstrapListeners();    // hooks basic events
    // notify other modules that the extra HUD is ready
    Bus.publish('hud.backrooms.ready');
  });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(start, 0);
  } else {
    document.addEventListener('DOMContentLoaded', start);
  }

  // Optional: re-attach if the HUD gets re-rendered by the app
  var mo;
  try {
    mo = new MutationObserver(function () {
      // If our row vanished due to a rerender, put it back
      if (!document.getElementById(IDS.buttonRowId)) {
        attachButtons();
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
