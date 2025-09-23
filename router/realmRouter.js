// /kern/router.js
import {eventBus} from '../kernel/eventBus.js';
const realms = new Map(); let active = null;
export const router = {
  register(name, mod){ realms.set(name, mod); },
  async go(name, params={}){
    if (active && realms.get(active)?.teardown) { try{ await realms.get(active).teardown(); }catch(_){} }
    active = name;
    eventBus.publish('realm.willChange', {to:name, params});
    const mod = realms.get(name);
    if (!mod || !mod.boot) throw new Error('Realm not registered: '+name);
    await mod.boot(params);
    eventBus.publish('realm.didChange', {to:name, params});
  },
  current(){ return active; }
};
