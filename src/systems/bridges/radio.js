import { ULS_CONFIG } from '../../config.js';
import { eventBus } from '../bus.js';

let iframe = null;
let wired = false;
let ready = false;

export function mountRadio(containerId = 'radio-host') {
  const host = document.getElementById(containerId);
  if (!host) return;

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.src = ULS_CONFIG.RADIO_IFRAME_URL;
    iframe.style.width = '320px';
    iframe.style.height = '160px';
    iframe.style.border = '0';
    host.innerHTML = '';
    host.appendChild(iframe);
  }

  if (!wired) {
    wired = true;
    window.addEventListener('message', onMsg);
  }
}

function onMsg(e) {
  const d = e.data;
  // Contract (iframe -> parent):
  //   postMessage({ source:'uls-radio', type:'ready' }, '*')
  //   postMessage({ source:'uls-radio', type:'nowplaying', text:'Station – Track' }, '*')
  if (d && d.source === 'uls-radio') {
    if (d.type === 'ready') ready = true;
    if (d.type === 'nowplaying') {
      eventBus.publish('radio.nowplaying', { text: d.text || '' });
    }
  }
}

function send(cmd, payload = {}) {
  if (!iframe) return;
  // Contract (parent -> iframe):
  //   postMessage({ target:'uls-radio', cmd:'play'|'pause'|'toggle'|'next'|'prev'|'shuffle', payload }, '*')
  iframe.contentWindow.postMessage({ target: 'uls-radio', cmd, payload }, '*');
}

// Expose simple controls (user gestures from parent UI should call these)
export const Radio = {
  play:    () => send('play'),
  pause:   () => send('pause'),
  toggle:  () => send('toggle'),
  next:    () => send('next'),
  prev:    () => send('prev'),
  shuffle: (on) => send('shuffle', { on: !!on }),
};