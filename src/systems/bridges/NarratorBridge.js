import { eventBus } from '../bus.js';
import { ULS_CONFIG } from '../../config.js';

let iframe = null;
let wired = false;
let ready = false;
let queued = [];
let currentUrl = null;

function ensure(url) {
  if (iframe && currentUrl === url) return;
  currentUrl = url;

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }
  iframe.src = url;

  ready = false;
  if (!wired) {
    wired = true;
    window.addEventListener('message', onMsg);
  }
}

function onMsg(e) {
  const d = e.data;
  if (!d) return;

  if (d.narrator && d.type === 'ready') {
    ready = true;
    queued.forEach(fn => fn());
    queued.length = 0;
  }

  // Contract (iframe -> parent):
  //   postMessage({ narrator:true, type:'response', payload:{ text, statsDelta, decisions, forceImagePrompt } }, '*');
  if (d.narrator && d.type === 'response') {
    eventBus.publish('narrator.response', d.payload);
  }

  // Autopilot contract
  if (d.narrator && d.type === 'autopilot.suggestion') {
    eventBus.publish('narrator.autopilot.suggestion', d.payload);
  }

  // Optional coin flip relay (if narrator hosts it)
  if (d.narrator && d.type === 'coin.result') {
    eventBus.publish('coin.result', d.payload);
  }
}

function send(payload) {
  if (!iframe) return;
  iframe.contentWindow.postMessage({ from: 'uls', payload }, '*');
}

function ask(payload) {
  const url = __app.player.adult ? ULS_CONFIG.NARRATOR_ADULT_URL : ULS_CONFIG.NARRATOR_PG13_URL;
  ensure(url);
  const go = () => send({ type: 'ask', data: payload });
  if (!ready) queued.push(go); else go();
}

function autopilotSuggest(payload) {
  const url = ULS_CONFIG.NARRATOR_AUTOPILOT_URL || ( __app.player.adult ? ULS_CONFIG.NARRATOR_ADULT_URL : ULS_CONFIG.NARRATOR_PG13_URL );
  ensure(url);
  const go = () => send({ type: 'autopilot.suggest', data: payload });
  if (!ready) queued.push(go); else go();
}

function coinFlip(payload) {
  const url = __app.player.adult ? ULS_CONFIG.NARRATOR_ADULT_URL : ULS_CONFIG.NARRATOR_PG13_URL;
  ensure(url);
  const go = () => send({ type: 'coin.flip', data: payload });
  if (!ready) queued.push(go); else go();
}

// Wire to bus
eventBus.subscribe('narrator.ask', ask);
eventBus.subscribe('narrator.autopilot.suggestAction', autopilotSuggest);
eventBus.subscribe('coin.flip', coinFlip);
