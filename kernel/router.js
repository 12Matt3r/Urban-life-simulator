// /kernel/router.js (ES5)
export var router = (function() {
  var current = null;
  var root = null;
  var bus = null;
  var state = null;
  var modules = {};

  return {
    register: function(name, mod) {
      modules[name] = mod;
    },
    init: function(r, b, s) {
      root = r;
      bus = b;
      state = s;
    },
    go: function(name, params) {
      var self = this;
      return new Promise(function(resolve, reject) {
        var teardownPromise = Promise.resolve();
        if (current && current.unmount) {
          teardownPromise = Promise.resolve(current.unmount());
        }

        teardownPromise.then(function() {
          current = modules[name];
          if (!current || !current.mount) {
            return reject(new Error('Router: module not found or has no mount function: ' + name));
          }
          return Promise.resolve(current.mount(root, bus, state, params));
        }).then(resolve).catch(reject);
      });
    }
  };
})();