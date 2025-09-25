// realms/living-hell/main.js (ES5)
(function (global) {
  var bus = global.eventBus;

  function mount(node) {
    document.getElementById('lh-root').hidden = false;
    global.LHRuntime.init();
    global.LHHUD.init();
    global.LHStream.init();
  }

  function unmount() {
    document.getElementById('lh-root').hidden = true;
    global.LHRuntime.teardown();
    global.LHHUD.teardown();
    global.LHStream.teardown();
  }

  function save() { return global.LHRuntime.save(); }
  function load(snap) { return global.LHRuntime.load(snap); }

  // Register realm with Kernel/Router
  if (global.RealmRegistry) {
    global.RealmRegistry.register('living-hell', {
      title: 'Living Hell',
      mount: mount,
      unmount: unmount,
      save: save,
      load: load,
      entryHints: { icon: '📺', category: 'Shows' }
    });
  }

})(window);