// /realms/uls/systems/weather.js
const options = [
  { id:'clear',   label:'clear weather' },
  { id:'rain',    label:'steady rain' },
  { id:'over',    label:'overcast sky' },
  { id:'fog',     label:'low fog' }
];
let idx = 0, timer = null;

export const WeatherSystem = {
  boot(){ timer = setInterval(()=>{ idx = (idx+1)%options.length; }, 120000); }, // 2m tick
  teardown(){ if (timer) clearInterval(timer); timer=null; },
  get(){ return options[idx]; }
};
