// systems/narrativeEngine.js
// Free runtime: WebSim iframe primary + local mock fallback.
// No paid API calls here.

const NARRATOR_IFRAME_ORIGIN = "https://websim.com";
const narratorFrameEl = () => document.getElementById("websim-narrator");

function askWebSimNarrator(payload) {
  const frame = narratorFrameEl();
  if (!frame || !frame.contentWindow) throw new Error("WebSim narrator iframe not found");
  frame.contentWindow.postMessage({ type: "requestEvent", payload }, NARRATOR_IFRAME_ORIGIN);
}

function nextEventViaWebSim(ctx, timeoutMs) {
  if (timeoutMs === void 0) { timeoutMs = 20000; }
  return new Promise(function(resolve, reject) {
    let done = false;

    const onMsg = function(ev) {
      if (ev.origin !== NARRATOR_IFRAME_ORIGIN) return;
      const msg = ev.data || {};
      if (msg.type === "narration") {
        cleanup(); done = true; return resolve(msg.payload);
      }
      if (msg.type === "narration_error") {
        cleanup(); done = true; return reject(new Error(msg.error));
      }
    };
    const cleanup = function() { window.removeEventListener("message", onMsg); };

    window.addEventListener("message", onMsg);
    try {
      const maxDecisionsRaw = ctx.rails && ctx.rails.maxDecisions;
      const maxDecisions = (maxDecisionsRaw !== null && maxDecisionsRaw !== undefined) ? maxDecisionsRaw : 3;
      askWebSimNarrator({
        character: ctx.character,
        history: (ctx.history || []).slice(-10),
        lastEvent: ctx.lastEvent || null,
        rails: { maxDecisions: Math.max(2, Math.min(4, maxDecisions)) }
      });
    } catch (e) {
      cleanup(); return reject(e);
    }

    setTimeout(function() { if (!done) { cleanup(); reject(new Error("websim_timeout")); } }, timeoutMs);
  });
}

// Minimal local mock; always ends with '?'
function localMockNext(ctx) {
  return Promise.resolve({
    id: "fallback_mock",
    title: "Quiet Night",
    description: "The city hums like a live wire; nothing moves unless you make it. What do you do now?",
    decisions: [
      { id: "d1", text: "Walk the block", risk: 20, aggression: 10, resourceRisk: 5, heatSpike: 0, goalAlignment: 40, tags: ["patrol"] },
      { id: "d2", text: "Call a contact for work", risk: 35, aggression: 10, resourceRisk: 10, heatSpike: 5, goalAlignment: 55, tags: ["job","contact"] }
    ],
    imagePrompt: "empty street at night"
  });
}

export function createNarrativeEngine(options) {
  if (options === void 0) { options = {}; }
  const mode = options.mode || "websim";
  return {
    mode,
    async nextEvent(ctx) {
      if (mode === "websim") {
        try { return await nextEventViaWebSim(ctx); }
        catch (e) { console.warn("WebSim failed → local mock:", (e && e.message) || e); return await localMockNext(ctx); }
      }
      return await localMockNext(ctx);
    }
  };
}