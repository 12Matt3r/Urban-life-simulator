// /kern/saveState.js
export const saveState = {
  get(key, def){ try{ const v = localStorage.getItem(key); return v? JSON.parse(v): def; }catch(_){ return def; } },
  set(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(_){} },
  patch(ns, obj){ const cur = this.get(ns, {}); const nxt = Object.assign({}, cur, obj); this.set(ns, nxt); return nxt; }
};
