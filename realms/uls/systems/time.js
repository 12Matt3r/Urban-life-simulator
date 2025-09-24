// /realms/uls/systems/time.js
const slots = [
  { id:'dawn',   label:'dawn' },
  { id:'day',    label:'day' },
  { id:'dusk',   label:'dusk' },
  { id:'night',  label:'night' }
];
let i = 1, timer = null;

export const TimeSystem = {
  boot(){ timer = setInterval(()=>{ i = (i+1)%slots.length; }, 60000); }, // 1m tick
  teardown(){ if (timer) clearInterval(timer); timer=null; },
  get(){ return slots[i]; }
};
