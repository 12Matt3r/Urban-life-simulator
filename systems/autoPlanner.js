import { createRNG } from './rng.js';
import { eventBus as defaultBus } from './eventBus.js';

let cfg=null, rng=null, timer=null, bus=defaultBus;
let state={ running:false, tick:0, lastDecisionId:null };
let currentMoods=[];

const SPEED_MS={ '1x':1000,'2x':500,'4x':250,'max':0 };
const clamp01=v=>Math.max(0,Math.min(1,Number(v)));

export function start(config, eventBus){
  if (config === void 0) { config = {}; }
  if (eventBus === void 0) { eventBus = defaultBus; }
  stop();
  bus = eventBus||defaultBus;
  cfg = {
    seed:Number(config.seed)||1,
    risk:clamp01(((config.risk !== null && config.risk !== undefined) ? config.risk : 50)/100),
    aggression:clamp01(((config.aggression !== null && config.aggression !== undefined) ? config.aggression : 50)/100),
    chaos:clamp01(((config.chaos !== null && config.chaos !== undefined) ? config.chaos : 25)/100),
    speed:config.speed||'1x',
    imageEveryNTicks:Number((config.imageEveryNTicks !== null && config.imageEveryNTicks !== undefined) ? config.imageEveryNTicks : 1)
  };
  rng = createRNG(cfg.seed);
  state = { running:true, tick:0, lastDecisionId:null };

  bus.subscribe('radio.change', function(payload) {
    currentMoods = Array.isArray(payload.moods) ? payload.moods.slice(0,4) : [];
  });

  bus.publish('simlog.push', { text:'Auto-Play: start (seed=' + cfg.seed + ', speed=' + cfg.speed + ')' });
  loop();
}

export function stop(){
  if (timer) clearTimeout(timer);
  timer = null;
  if (state.running) bus.publish('simlog.push', { text:'Auto-Play: stopped' });
  state.running = false;
}

export function step(){
  if (state.running) return;
  state.running = true;
  loop(true);
}

function loop(single){
  if (single === void 0) { single = false; }
  if (!state.running) return;
  var decisions = (window.Life && window.Life.getAvailableDecisions ? window.Life.getAvailableDecisions() : []).map(norm);
  if (!decisions.length){
    bus.publish('simlog.push', { text:'Auto-Play: No decisions available' });
    return schedule(single);
  }

  const scored = decisions.map(function(d) { return { d: d, s: score(d) }; });
  const chosen = softmaxPick(scored, tempFromChaos(cfg.chaos));

  if (chosen){
    const res = window.Life.applyDecision(chosen.d) || {};
    if (cfg.imageEveryNTicks===0 || state.tick % (cfg.imageEveryNTicks||1)===0){
      bus.publish('image.request', res.imagePayload || { mood: currentMoods[0]||'neutral' });
    }
    bus.publish('simlog.push', { text: res.text || 'Chosen: ' + (chosen.d.label||chosen.d.id) });
  }
  state.tick++;
  schedule(single);
}

function schedule(single){
  if (single){ state.running=false; return; }
  const delay = (SPEED_MS[cfg.speed] !== null && SPEED_MS[cfg.speed] !== undefined) ? SPEED_MS[cfg.speed] : 1000;
  timer = setTimeout(loop, delay);
}

function norm(d){
  return {
    ...d,
    risk:num(d.risk,.3), aggression:num(d.aggression,.2),
    novelty:num(d.novelty,.1), goalAlignment:num(d.goalAlignment,.5),
    resourceRisk:num(d.resourceRisk,.2), heatSpike:num(d.heatSpike,.1),
    weight:num(d.weight,1)
  };
}
function num(v,def){ v=Number(v); return Number.isFinite(v)?v:def; }
function score(d){
  const moodBoost = hasMoodAffinity(d, currentMoods) ? 0.08 : 0.0;
  return 0.35*d.risk*cfg.risk + 0.35*d.aggression*cfg.aggression + 0.18*d.novelty +
         0.22*d.goalAlignment - 0.15*d.resourceRisk - 0.12*d.heatSpike + moodBoost + 0.02*d.weight;
}
function hasMoodAffinity(d,moods){
  const t=(d.moods||d.tags||[]).map(s=>String(s).toLowerCase());
  return (Array.isArray(moods)?moods:[]).some(m=>t.includes(String(m).toLowerCase()));
}
function tempFromChaos(c){ return Math.max(0.05, c*3); }
function softmaxPick(scored,T){
  const exps=scored.map(x=>Math.exp(x.s/T));
  const sum=exps.reduce((a,b)=>a+b,0);
  let r=rng.random()*sum;
  for(let i=0;i<scored.length;i++){ r-=exps[i]; if(r<=0) return scored[i]; }
  return scored[0];
}