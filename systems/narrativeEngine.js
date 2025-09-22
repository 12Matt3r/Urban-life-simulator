// systems/narrativeEngine.js (ES5)

(function(global) {
  var NARRATOR_IFRAME_ORIGIN = "https://websim.com";

  function getFrame() {
    return document.getElementById("websim-narrator");
  }

  function askWebSim(payload) {
    var frame = getFrame();
    if (!frame || !frame.contentWindow) {
      throw new Error("WebSim narrator iframe not found");
    }
    frame.contentWindow.postMessage({ type: "requestEvent", payload: payload }, NARRATOR_IFRAME_ORIGIN);
  }

  function nextEventViaWebSim(ctx) {
    return new Promise(function(resolve, reject) {
      var done = false;
      var timeout = setTimeout(function() {
        if (!done) {
          cleanup();
          reject(new Error("websim_timeout"));
        }
      }, 20000);

      var onMsg = function(ev) {
        if (String(ev.origin).indexOf("websim.com") === -1) return;
        var msg = ev.data || {};
        if (msg.type === "narration") {
          cleanup();
          done = true;
          resolve(msg.payload);
        } else if (msg.type === "narration_error") {
          cleanup();
          done = true;
          reject(new Error(msg.error));
        }
      };

      function cleanup() {
        clearTimeout(timeout);
        window.removeEventListener("message", onMsg);
      }

      window.addEventListener("message", onMsg, false);

      try {
        askWebSim({
          character: ctx.character,
          history: (ctx.history || []).slice(-10),
          lastEvent: ctx.lastEvent || null,
          actionText: ctx.actionText || '',
          contentMode: ctx.contentMode || 'standard',
          time: ctx.time,
          weather: ctx.weather,
          district: ctx.district,
          rails: { maxDecisions: 4 }
        });
      } catch (e) {
        cleanup();
        reject(e);
      }
    });
  }

  function localMockNext(ctx) {
    var title = "A Moment of Reflection";
    var description = "You ponder your next move. The city is a canvas of possibilities.";
    if (ctx.actionText) {
      title = "Action & Reaction";
      description = "You decided to '" + ctx.actionText + "'. The world shifts slightly in response.";
    }

    return Promise.resolve({
      title: title,
      description: description,
      decisions: [
        { id: 'd1', text: 'Look for work.' },
        { id: 'd2', text: 'Explore the current district.' },
        { id: 'd3', text: 'Lay low for a while.' }
      ],
      imagePrompt: "a person looking over a sprawling futuristic cityscape at night, digital art",
      statChanges: { heat: -1 } // Heat decays over time
    });
  }

  function createNarrativeEngine(options) {
    var mode = (options && options.mode) || "websim";

    return {
      mode: mode,
      nextTurn: function(ctx) {
        if (this.mode === "websim") {
          return nextEventViaWebSim(ctx).catch(function(e) {
            console.warn("WebSim failed, using local mock:", e.message);
            return localMockNext(ctx);
          });
        }
        return localMockNext(ctx);
      }
    };
  }

  global.createNarrativeEngine = createNarrativeEngine;

})(window);