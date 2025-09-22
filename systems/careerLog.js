// systems/careerLog.js (ES5)
(function(global) {
  var entries = [];

  function add(kind, detail, tags) {
    entries.push({
      ts: Date.now(),
      kind: kind,
      detail: detail,
      tags: tags || []
    });
    global.eventBus.publish('career.log.updated', entries);
  }

  function clear() {
    entries = [];
    global.eventBus.publish('career.log.updated', entries);
  }

  function getEntries() {
    return entries.slice();
  }

  function exportMarkdown(playerName) {
    var md = '# Career Log for ' + playerName + '\n\n';
    entries.forEach(function(e) {
      var when = new Date(e.ts).toLocaleString();
      var tagStr = (e.tags && e.tags.length) ? ' [' + e.tags.join(', ') + ']' : '';
      md += '## ' + when + ' - ' + e.kind + '\n';
      md += '> ' + e.detail + tagStr + '\n\n';
    });
    return md;
  }

  global.CareerLog = {
    add: add,
    clear: clear,
    entries: getEntries,
    exportMarkdown: exportMarkdown
  };

  // Auto-subscribe: record role and district changes
  global.eventBus.subscribe('career.tags.updated', function(tags) {
    if (!tags || !tags.length) return;
    add('role', 'Roles updated', tags);
  });

  global.eventBus.subscribe('district.changed', function(name) {
    if (!name) return;
    add('district', 'Moved to ' + name);
  });

})(window);