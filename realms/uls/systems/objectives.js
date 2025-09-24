// /realms/uls/systems/objectives.js
import { eventBus } from '../../kern/eventBus.js';

let _list = [];

export const Objectives = {
  reset(arr){ _list = (arr||[]).map(o => ({...o, status:o.status||'active'})); eventBus.publish('objectives.updated', _list); },
  getAll(){ return _list.slice(); },
  setDone(id){ _set(id,'done'); },
  setFailed(id){ _set(id,'failed'); },
  add(obj){ _list.push({...obj, status: obj.status||'active'}); eventBus.publish('objectives.updated', _list); }
};

function _set(id, status){
  const it = _list.find(o=>o.id===id);
  if (it){ it.status = status; eventBus.publish('objectives.updated', _list); }
}
