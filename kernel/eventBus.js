// /kern/eventBus.js
export const eventBus = (() => {
  const m = new Map();
  return {
    publish(type, payload) { (m.get(type) || []).forEach(fn => { try{ fn(payload); }catch(_){} }); },
    subscribe(type, fn) { if (!m.has(type)) m.set(type, []); m.get(type).push(fn); return () => {
      const arr = m.get(type) || []; const i = arr.indexOf(fn); if (i>=0) arr.splice(i,1);
    }},
    once(type, fn){ const off = this.subscribe(type, (p)=>{ off(); fn(p); }); }
  };
})();
