// ui/careerLog.js (ES5)
(function(global) {
  var root;

  function mountCareerLogModal(containerId) {
    containerId = containerId || 'career-log-modal';
    var existing = document.getElementById(containerId);
    if (existing) {
      root = existing;
      return;
    }

    var html = [
      '<div id="' + containerId + '" class="modal-overlay" hidden>',
        '<div class="modal-content" style="gap:10px;">',
          '<div style="display:flex; justify-content:space-between; align-items:center;">',
            '<h2>Career Log</h2>',
            '<div style="display:flex; gap:8px;">',
              '<button id="cl-export">Export</button>',
              '<button id="cl-clear">Clear</button>',
              '<button id="cl-close">X</button>',
            '</div>',
          '</div>',
          '<div id="cl-list" style="flex:1; overflow:auto; border:1px solid #3a3a5e; border-radius:8px; padding:10px;"></div>',
        '</div>',
      '</div>'
    ].join('');
    document.body.insertAdjacentHTML('beforeend', html);
    root = document.getElementById(containerId);

    root.querySelector('#cl-close').onclick = function() { root.hidden = true; };
    root.querySelector('#cl-clear').onclick = function() { if (confirm('Clear career log?')) { global.CareerLog.clear(); } };
    root.querySelector('#cl-export').onclick = function() {
      var playerName = (global.Life && global.Life.state && global.Life.state.name && global.Life.state.name()) || 'Player';
      var md = global.CareerLog.exportMarkdown(playerName);
      var blob = new Blob([md], { type: 'text/markdown' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'career_log_' + Date.now() + '.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    };

    global.eventBus.subscribe('career.log.updated', render);
    render();
  }

  function render() {
    if (!root) return;
    var listEl = root.querySelector('#cl-list');
    var data = global.CareerLog.entries();
    if (!data.length) {
      listEl.innerHTML = '<p class="muted">No entries yet.</p>';
      return;
    }
    listEl.innerHTML = data.map(function(e) {
      var when = new Date(e.ts).toLocaleString();
      var tagStr = (e.tags && e.tags.length) ? '<span class="muted"> [' + e.tags.join(', ') + ']</span>' : '';
      return '<div style="margin-bottom:8px;">' +
        '<strong>' + when + '</strong> — ' + e.kind + ': ' + e.detail + tagStr +
      '</div>';
    }).join('');
  }

  function openCareerLogModal() {
    if (!root) mountCareerLogModal();
    root.hidden = false;
    render();
  }

  global.eventBus.subscribe('hud.careerlog', openCareerLogModal);

})(window);