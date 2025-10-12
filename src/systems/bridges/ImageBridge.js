import { eventBus } from '../bus.js';
import { ULS_CONFIG } from '../../config.js';

let iframe = null;
let wired = false;

function ensure() {
  if (iframe) return;
  iframe = document.createElement('iframe');
  iframe.src = ULS_CONFIG.IMAGE_RENDER_URL;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  if (!wired) {
    window.addEventListener('message', onMsg);
    wired = true;
  }
}

function onMsg(e) {
  const d = e.data;
  // Contract (iframe -> parent):
  //   postMessage({ image:{ url:'...', dataUrl: null } }, '*');
  if (d && d.image) {
    const imgEl = document.getElementById('stage-img');
    if (d.image.dataUrl) imgEl.src = d.image.dataUrl;
    if (d.image.url)     imgEl.src = d.image.url;
  }
}

export function requestImage(prompt, style = 'cinematic neon city') {
  ensure();
  // Contract (parent -> iframe):
  //   postMessage({ from:'uls', type:'image.request', payload:{ prompt, style } }, '*');
  iframe.contentWindow.postMessage(
    { from: 'uls', type: 'image.request', payload: { prompt, style } },
    '*'
  );
}

// Wire to bus
eventBus.subscribe('image.request', p => {
  if (!p) return;
  requestImage(p.prompt, p.style);
});